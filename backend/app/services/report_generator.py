import datetime
from sqlalchemy.orm import Session
from app.database import models

def save_analysis_report(
    db: Session,
    patient_id: int,
    prediction: str,
    confidence: float,
    severity: str,
    ai_summary: str,
    recommendation: str,
    next_steps: str,
    original_image: str,
    segmentation_image: str,
    processing_time: float
) -> models.AnalysisReport:
    """
    Saves the computed diagnosis results as an AnalysisReport record in the database.
    """
    
    current_date = datetime.datetime.now().strftime("%b %d, %Y, %I:%M:%S %p")
    
    db_report = models.AnalysisReport(
        patient_id=patient_id,
        prediction=prediction,
        confidence=confidence,
        severity=severity,
        ai_summary=ai_summary,
        recommendation=recommendation,
        next_steps=next_steps,
        original_image=original_image,
        segmentation_image=segmentation_image,
        processing_time=processing_time,
        analysis_date=current_date
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

def generate_pdf_report(report_data: dict, output_dir: str) -> str:
    """
    TODO: Insert your PDF generation logic here (e.g. using ReportLab or FPDF).
    Typically:
    1. Extract patient details and AI analysis parameters from report_data dict.
    2. Draw layout tables, headers, and embed MRI/segmentation image arrays.
    3. Compile and save the PDF file inside output_dir.
    4. Return the absolute/relative path of the generated PDF.
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    report_id = report_data.get("report_id", "temp")
    pdf_filename = f"report_{report_id}.pdf"
    pdf_path = os.path.join(output_dir, pdf_filename)
    
    # Write a simple placeholder file to avoid empty paths
    with open(pdf_path, "w") as f:
        f.write(f"BrainAI Diagnostic Scan PDF Report - ID: {report_id}\n")
        f.write(f"Prediction: {report_data.get('prediction')}\n")
        f.write(f"Confidence: {report_data.get('confidence')}%\n")
        f.write(f"Severity: {report_data.get('severity')}\n")
        f.write(f"AI Summary: {report_data.get('ai_summary')}\n")
        f.write(f"Recommendation: {report_data.get('recommendation')}\n")
        
    return pdf_path
