"""
Health check endpoints.
"""

from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """ML service health check endpoint."""
    model_service = getattr(request.app.state, "model_service", None)
    model_loaded = model_service is not None

    return {
        "status": "healthy",
        "service": "IntelliSpend ML Service",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": model_loaded,
        "version": "1.0.0"
    }
