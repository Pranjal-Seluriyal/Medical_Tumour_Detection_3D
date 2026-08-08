from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("")
def check_health():
    """
    Endpoint verifying the FastAPI server status.
    """
    return {"status": "online"}
