from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Patient Schemas
class PatientBase(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None

class PatientCreate(PatientBase):
    password: str

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: PatientResponse


# Report Schemas
class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    severity: str
    ai_summary: Optional[str] = None
    recommendation: Optional[str] = None
    next_steps: Optional[str] = None
    segmentation_image: Optional[str] = None
    original_image: Optional[str] = None
    processing_time: Optional[float] = None
    analysis_date: Optional[str] = None
    report_id: Optional[int] = None

class ReportResponse(BaseModel):
    id: int
    patient_id: int
    prediction: str
    confidence: float
    severity: str
    ai_summary: Optional[str] = None
    recommendation: Optional[str] = None
    next_steps: Optional[str] = None
    original_image: Optional[str] = None
    segmentation_image: Optional[str] = None
    processing_time: Optional[float] = None
    analysis_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
