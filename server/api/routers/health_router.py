"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    """Basic health check endpoint."""
    return {"status": "ok"}
