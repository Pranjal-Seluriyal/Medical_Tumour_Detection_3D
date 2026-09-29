import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database.database import engine, Base
from app.api import health, auth, profile, reports, predict
from app.services.segmentation import load_segmentation_model
from app.services.severity import load_gnn_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BrainAI Patient Portal Backend",
    description="FastAPI Backend for Brain MRI Segmentation and GNN Severity Evaluation",
    version="1.0.0"
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP error occurred: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "details": None
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        try:
            form_data = await request.form()
            body_str = "&".join(f"{k}={v}" for k, v in form_data.items())
        except Exception as e:
            body_str = f"<Error reading form: {e}>"
    else:
        try:
            body_bytes = await request.body()
            body_str = body_bytes.decode('utf-8', errors='replace')
        except Exception as e:
            body_str = f"<Error reading body: {e}>"
            
    logger.error(f"Validation error occurred: {exc.errors()}")
    logger.info(f"Exact HTTP request body reaching FastAPI (validation failed): {body_str}")
    print(f"Exact HTTP request body reaching FastAPI (validation failed): {body_str}", flush=True)
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation failed",
            "details": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception("Unhandled error occurred in backend service")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
            "details": str(exc)
        }
    )

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For extension environment compatibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads and segmented outputs directories for UI accessibility
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/static/segmented", StaticFiles(directory=settings.SEGMENTED_DIR), name="segmented")

# Include API Routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    """
    FastAPI startup event loader.
    Pre-loads the UNet and GNN models into memory once.
    """
    logger.info("Initializing BrainAI model loader...")
    
    # Load segmentation model best_unet3d.pth
    load_segmentation_model(settings.MODEL_UNET_PATH)
    
    # Load GNN severity model best_gat.pth
    load_gnn_model(settings.MODEL_GAT_PATH)
    
    logger.info("Startup model initialization checks completed.")
