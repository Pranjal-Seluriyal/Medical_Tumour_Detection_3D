import os
import shutil
from fastapi import UploadFile, HTTPException

def validate_mri_file(file: UploadFile):
    filename = file.filename.lower()
    allowed_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.dcm', '.dicom', '.nii', '.nii.gz']
    
    # Check if ends with allowed extensions
    is_allowed = any(filename.endswith(ext) for ext in allowed_extensions)
    if not is_allowed:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only PNG, JPEG, DICOM, and NIfTI formats are supported."
        )

def save_uploaded_file(file: UploadFile, destination_dir: str) -> str:
    os.makedirs(destination_dir, exist_ok=True)
    file_path = os.path.join(destination_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return file_path
