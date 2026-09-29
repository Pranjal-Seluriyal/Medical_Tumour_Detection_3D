from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import models, schemas
from app.database.database import get_db
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

@router.get("", response_model=List[schemas.ReportResponse])
def get_reports(
    current_user: models.Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a list of all historical MRI reports for the currently authenticated patient.
    """
    reports = db.query(models.AnalysisReport).filter(
        models.AnalysisReport.patient_id == current_user.id
    ).order_by(models.AnalysisReport.created_at.desc()).all()
    
    return reports

@router.get("/{id}", response_model=schemas.ReportResponse)
def get_report_by_id(
    id: int,
    current_user: models.Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns single report details.
    """
    report = db.query(models.AnalysisReport).filter(
        models.AnalysisReport.id == id,
        models.AnalysisReport.patient_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or permission denied"
        )
        
    return report

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_report(
    id: int,
    current_user: models.Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an analysis report.
    """
    report = db.query(models.AnalysisReport).filter(
        models.AnalysisReport.id == id,
        models.AnalysisReport.patient_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or permission denied"
        )
        
    db.delete(report)
    db.commit()
    
    return {"detail": "Report successfully deleted"}
