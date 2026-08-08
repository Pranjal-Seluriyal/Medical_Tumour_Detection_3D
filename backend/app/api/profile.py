from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import models, schemas
from app.database.database import get_db
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

@router.get("", response_model=schemas.PatientResponse)
def get_profile(current_user: models.Patient = Depends(get_current_user)):
    """
    Returns demographic records for the currently authenticated patient.
    """
    return current_user

@router.put("", response_model=schemas.PatientResponse)
def update_profile(
    updates: schemas.PatientUpdate,
    current_user: models.Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates profile details for the currently authenticated patient.
    """
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user
