import os
import torch
import numpy as np
from PIL import Image
from monai.networks.nets import UNet

# Global model reference
seg_model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_segmentation_model(model_path: str):
    """
    Loads the pretrained MONAI UNet segmentation model from disk once.
    """
    global seg_model
    
    if not os.path.exists(model_path):
        print(f"[WARNING] Segmentation model file not found at '{model_path}'. Running in Fallback/Mock mode.")
        return None
        
    try:
        print(f"Loading MONAI UNet model from {model_path}...")
        seg_model = UNet(
            spatial_dims=3,
            in_channels=4,
            out_channels=4,
            channels=(32, 64, 128, 256, 512),
            strides=(2, 2, 2, 2),
            num_res_units=2,
        ).to(device)
        
        # Load weights
        state_dict = torch.load(model_path, map_location=device, weights_only=False)
        seg_model.load_state_dict(state_dict)
        seg_model.eval()
        print("MONAI UNet Segmentation model loaded successfully.")
        return seg_model
    except Exception as e:
        print(f"[ERROR] Failed to load UNet model: {e}. Running in Fallback/Mock mode.")
        seg_model = None
        return None

def segment_mri(image_tensor: torch.Tensor) -> np.ndarray:
    """
    Runs 3D UNet segmentation inference.
    Input image_tensor shape: (4, 96, 96, 96)
    Returns: numpy array mask of shape (96, 96, 96)
    """
    global seg_model
    
    if seg_model is None:
        # Fallback/Mock output: return a simulated tumor mask in the center
        mask = np.zeros((96, 96, 96), dtype=np.uint8)
        # Create a mock spherical tumor at the center of the volume
        for z in range(35, 60):
            for y in range(35, 60):
                for x in range(35, 60):
                    dist = (x-48)**2 + (y-48)**2 + (z-48)**2
                    if dist < 140:
                        mask[z, y, x] = np.random.choice([1, 2, 3])
        return mask

    with torch.no_grad():
        # Add batch dimension: (1, 4, 96, 96, 96)
        inputs = image_tensor.unsqueeze(0).to(device)
        outputs = seg_model(inputs)
        # argmax across class dimension to get (96, 96, 96)
        pred_mask = torch.argmax(outputs, dim=1)[0].cpu().numpy().astype(np.uint8)
        return pred_mask

def run_segmentation(preprocessed_tensor: torch.Tensor, output_dir: str, original_filename: str) -> dict:
    """
    Runs the segmentation and saves representation images (original slice, mask slice, and overlay slice) to disk.
    Returns a dictionary of absolute file paths to the saved images.
    """
    pred_mask = segment_mri(preprocessed_tensor)
    
    # Ensure directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    base_name = os.path.splitext(original_filename)[0]
    original_png_filename = f"original_{base_name}.png"
    segmented_png_filename = f"mask_{base_name}.png"
    overlay_png_filename = f"overlay_{base_name}.png"
    
    original_path = os.path.join(output_dir, original_png_filename)
    segmented_path = os.path.join(output_dir, segmented_png_filename)
    overlay_path = os.path.join(output_dir, overlay_png_filename)
    
    # Visualizing 3D mask: Extract middle slice (Z = 48)
    z_slice = pred_mask.shape[0] // 2
    
    # 1. Grayscale original slice (extract from flair modality at Channel 3)
    flair_vol = preprocessed_tensor[3].cpu().numpy()
    slice_data = flair_vol[z_slice, :, :]
    
    # Normalize original slice to [0, 255]
    min_val = slice_data.min()
    max_val = slice_data.max()
    if max_val > min_val:
        slice_norm = ((slice_data - min_val) / (max_val - min_val) * 255.0).astype(np.uint8)
    else:
        slice_norm = np.zeros_like(slice_data, dtype=np.uint8)
        
    # Save original PNG
    img_orig = Image.fromarray(slice_norm)
    img_orig.save(original_path)
    
    # 2. Segmented mask RGB slice
    mask_slice = pred_mask[z_slice, :, :]
    h, w = mask_slice.shape
    rgb_mask = np.zeros((h, w, 3), dtype=np.uint8)
    rgb_mask[mask_slice == 1] = [239, 68, 68]
    rgb_mask[mask_slice == 2] = [34, 197, 94]
    rgb_mask[mask_slice == 3] = [59, 130, 246]
    
    img_mask = Image.fromarray(rgb_mask)
    img_mask.save(segmented_path)
    
    # 3. Combined overlay RGB slice
    rgb_background = np.stack([slice_norm] * 3, axis=-1)
    overlay_img = rgb_background.copy()
    alpha = 0.5
    
    mask_1 = mask_slice == 1
    overlay_img[mask_1] = (alpha * np.array([239, 68, 68]) + (1 - alpha) * rgb_background[mask_1]).astype(np.uint8)
    
    mask_2 = mask_slice == 2
    overlay_img[mask_2] = (alpha * np.array([34, 197, 94]) + (1 - alpha) * rgb_background[mask_2]).astype(np.uint8)
    
    mask_3 = mask_slice == 3
    overlay_img[mask_3] = (alpha * np.array([59, 130, 246]) + (1 - alpha) * rgb_background[mask_3]).astype(np.uint8)
    
    img_overlay = Image.fromarray(overlay_img)
    img_overlay.save(overlay_path)
    
    return {
        "original": original_path,
        "mask": segmented_path,
        "overlay": overlay_path,
        "pred_mask": pred_mask
    }
