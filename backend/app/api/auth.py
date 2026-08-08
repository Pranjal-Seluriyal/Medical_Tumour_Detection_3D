import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import models, schemas
from app.database.database import get_db
from app.utils.security import get_password_hash, verify_password, create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register(patient_in: schemas.PatientCreate, db: Session = Depends(get_db)):
    """
    Registers a new patient.
    """
    logger.info(f"Received registration request for email: {patient_in.email}")
    
    db_patient = db.query(models.Patient).filter(models.Patient.email == patient_in.email).first()
    if db_patient:
        logger.warning(f"Registration failed: Email '{patient_in.email}' is already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )
        
    logger.info("Email is available. Hashing password...")
    hashed_password = get_password_hash(patient_in.password)
    
    new_patient = models.Patient(
        email=patient_in.email,
        hashed_password=hashed_password,
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender,
        phone=patient_in.phone
    )
    
    logger.info(f"Adding new patient record for '{patient_in.email}' to database session...")
    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        logger.info(f"Patient record successfully saved. Assigned DB ID: {new_patient.id}")
    except Exception as e:
        logger.exception("Database transaction failed during patient registration commit")
        db.rollback()
        raise e
        
    logger.info(f"Generating JWT access token for user: {new_patient.email}")
    access_token = create_access_token(data={"sub": new_patient.email})
    
    return {
        "token": access_token,
        "user": new_patient
    }

@router.post("/login", response_model=schemas.AuthResponse)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard OAuth2 password flow login yielding a JWT access token.
    """
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        try:
            form_data_extracted = await request.form()
            body_str = "&".join(f"{k}={v}" for k, v in form_data_extracted.items())
        except Exception as e:
            body_str = f"<Error reading form: {e}>"
    else:
        try:
            body_bytes = await request.body()
            body_str = body_bytes.decode('utf-8', errors='replace')
        except Exception as e:
            body_str = f"<Error reading body: {e}>"
    logger.info(f"Exact HTTP request body reaching FastAPI (successful validation): {body_str}")
    print(f"Exact HTTP request body reaching FastAPI (successful validation): {body_str}", flush=True)
    logger.info(f"Received login attempt for email: {form_data.username}")
    
    db_patient = db.query(models.Patient).filter(models.Patient.email == form_data.username).first()
    if not db_patient:
        logger.warning(f"Login failed: User with email '{form_data.username}' not found in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, db_patient.hashed_password):
        logger.warning(f"Login failed: Incorrect password for email '{form_data.username}'.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    logger.info(f"Password verified. Generating JWT access token for: {db_patient.email}")
    access_token = create_access_token(data={"sub": db_patient.email})
    
    return {
        "token": access_token,
        "user": db_patient
    }
