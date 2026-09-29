import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    SECRET_KEY: str = "super_secret_key_brain_ai_mri_portal_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Storage Directories
    UPLOAD_DIR: str = "./uploads"
    SEGMENTED_DIR: str = "./segmented"
    REPORTS_DIR: str = "./reports"
    
    # Model Paths
    MODEL_UNET_PATH: str = "./models/best_unet3d.pth"
    MODEL_GAT_PATH: str = "./models/best_gat.pth"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure target directories exist
for directory in [settings.UPLOAD_DIR, settings.SEGMENTED_DIR, settings.REPORTS_DIR, os.path.dirname(settings.MODEL_UNET_PATH)]:
    os.makedirs(directory, exist_ok=True)
