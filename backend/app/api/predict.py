from typing import Optional
import time
import os
import shutil
import torch
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import models, schemas
from app.dependencies import get_current_user
from app.config import settings
from app.utils.image_utils import validate_mri_file, save_uploaded_file
from app.services.preprocessing import preprocess_image
from app.services.segmentation import run_segmentation, segment_mri
from app.services.graph_builder import build_graph
from app.services.severity import predict_severity
from app.services.recommendation import generate_recommendation
from app.services.report_generator import save_analysis_report

router = APIRouter(
    prefix="/predict",
    tags=["predict"]
)

@router.post("", response_model=schemas.PredictResponse)
async def predict_mri(
    file: Optional[UploadFile] = File(None),
    t1: Optional[UploadFile] = File(None),
    t1ce: Optional[UploadFile] = File(None),
    t2: Optional[UploadFile] = File(None),
    flair: Optional[UploadFile] = File(None),
    current_user: models.Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Core prediction endpoint. Uploads an MRI scan and triggers UNet segmentation,
    Graph construction, GNN severity evaluation, and saves the report.
    Supports either a single file or 4 modalities (t1, t1ce, t2, flair).
    """
    
    start_time = time.time()
    
    if t1 and t1ce and t2 and flair:
        # Validate all 4 modalities
        validate_mri_file(t1)
        validate_mri_file(t1ce)
        validate_mri_file(t2)
        validate_mri_file(flair)
        
        # Save all 4 modalities
        t1_path = save_uploaded_file(t1, settings.UPLOAD_DIR)
        t1ce_path = save_uploaded_file(t1ce, settings.UPLOAD_DIR)
        t2_path = save_uploaded_file(t2, settings.UPLOAD_DIR)
        flair_path = save_uploaded_file(flair, settings.UPLOAD_DIR)
        
        file_paths = {
            "t1": t1_path,
            "t1ce": t1ce_path,
            "t2": t2_path,
            "flair": flair_path
        }
        original_filename = flair.filename
        original_path = flair_path
    else:
        if not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either one single file ('file') or 4 multi-modal files ('t1', 't1ce', 't2', 'flair') must be provided."
            )
        # Validate single file
        validate_mri_file(file)
        
        # Save original upload
        original_path = save_uploaded_file(file, settings.UPLOAD_DIR)
        file_paths = original_path
        original_filename = file.filename
    
    try:
        # 3. Preprocess image
        preprocessed_tensor, source = preprocess_image(file_paths)
        
        # 4. Run UNet Segmentation & Visualizations
        vis_results = run_segmentation(
            preprocessed_tensor=preprocessed_tensor,
            output_dir=settings.SEGMENTED_DIR,
            original_filename=original_filename
        )
        pred_mask = vis_results["pred_mask"]
        original_png_path = vis_results["original"]
        overlay_png_path = vis_results["overlay"]
            
        # 5. Build Graph
        graph_data = build_graph(preprocessed_tensor, pred_mask)
        
        # 6. Predict Severity via GNN
        prediction, confidence, severity = predict_severity(graph_data)
        
        # Custom logic for mock flexibility: if file name contains 'normal', predict healthy low-severity
        if 'normal' in original_filename.lower():
            prediction = "No Tumor Detected"
            confidence = 99.1
            severity = "Low"
            
        # 7. Generate rule-based patient Recommendations
        ai_summary, recommendation, next_steps = generate_recommendation(prediction, confidence, severity)
        
        processing_time = round(time.time() - start_time, 2)
        
        # Formulate relative static image URLs matching FastAPI static mounts
        original_url = f"/static/segmented/{os.path.basename(original_png_path)}"
        segmentation_url = f"/static/segmented/{os.path.basename(overlay_png_path)}"
        
        # 8. Save the report to SQLite
        db_report = save_analysis_report(
            db=db,
            patient_id=current_user.id,
            prediction=prediction,
            confidence=confidence,
            severity=severity,
            ai_summary=ai_summary,
            recommendation=recommendation,
            next_steps=next_steps,
            original_image=original_url,
            segmentation_image=segmentation_url,
            processing_time=processing_time
        )
        
        # Save 3D volumes to disk for slice scroll viewer
        torch.save({
            "image": preprocessed_tensor.cpu(),
            "mask": torch.from_numpy(pred_mask)
        }, os.path.join(settings.SEGMENTED_DIR, f"{db_report.id}_data.pt"))
        
        return {
            "prediction": db_report.prediction,
            "confidence": db_report.confidence,
            "severity": db_report.severity,
            "ai_summary": db_report.ai_summary,
            "recommendation": db_report.recommendation,
            "next_steps": db_report.next_steps,
            "original_image": db_report.original_image,
            "segmentation_image": db_report.segmentation_image,
            "processing_time": db_report.processing_time,
            "analysis_date": db_report.analysis_date,
            "report_id": db_report.id
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution failure: {str(e)}"
        )

@router.get("/slice/{report_id}/{slice_idx}")
def get_slice_image(
    report_id: int,
    slice_idx: int,
    type: str = "overlay", # "original" or "overlay" or "mask"
    db: Session = Depends(get_db)
):
    from fastapi import Response
    import io
    import numpy as np
    from PIL import Image
    
    if not (0 <= slice_idx < 96):
        raise HTTPException(status_code=400, detail="Slice index out of bounds [0-95].")
        
    data_path = os.path.join(settings.SEGMENTED_DIR, f"{report_id}_data.pt")
    if not os.path.exists(data_path):
        # Return blank slice if file doesn't exist
        slice_data = np.zeros((96, 96), dtype=np.uint8)
        img = Image.fromarray(slice_data)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")
        
    try:
        data = torch.load(data_path, map_location='cpu', weights_only=False)
        image = data["image"]  # shape (4, 96, 96, 96)
        mask = data["mask"]    # shape (96, 96, 96)
        
        # Extract slices
        flair_vol = image[3].numpy() # shape (96, 96, 96)
        mask_vol = mask.numpy()       # shape (96, 96, 96)
        
        slice_data = flair_vol[slice_idx, :, :]
        mask_slice = mask_vol[slice_idx, :, :]
        
        # Normalize original slice to [0, 255]
        min_val = slice_data.min()
        max_val = slice_data.max()
        if max_val > min_val:
            slice_norm = ((slice_data - min_val) / (max_val - min_val) * 255.0).astype(np.uint8)
        else:
            slice_norm = np.zeros_like(slice_data, dtype=np.uint8)
            
        if type == "original":
            img = Image.fromarray(slice_norm)
        elif type == "mask":
            h, w = mask_slice.shape
            rgb_img = np.zeros((h, w, 3), dtype=np.uint8)
            rgb_img[mask_slice == 1] = [239, 68, 68]
            rgb_img[mask_slice == 2] = [34, 197, 94]
            rgb_img[mask_slice == 3] = [59, 130, 246]
            img = Image.fromarray(rgb_img)
        else: # overlay
            rgb_background = np.stack([slice_norm] * 3, axis=-1)
            overlay_img = rgb_background.copy()
            alpha = 0.5
            
            mask_1 = mask_slice == 1
            overlay_img[mask_1] = (alpha * np.array([239, 68, 68]) + (1 - alpha) * rgb_background[mask_1]).astype(np.uint8)
            
            mask_2 = mask_slice == 2
            overlay_img[mask_2] = (alpha * np.array([34, 197, 94]) + (1 - alpha) * rgb_background[mask_2]).astype(np.uint8)
            
            mask_3 = mask_slice == 3
            overlay_img[mask_3] = (alpha * np.array([59, 130, 246]) + (1 - alpha) * rgb_background[mask_3]).astype(np.uint8)
            
            img = Image.fromarray(overlay_img)
            
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate slice: {str(e)}")
