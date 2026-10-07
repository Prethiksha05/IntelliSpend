"""
API routers package — exposes all endpoint routers.
"""

from app.api.health import router as health_router
from app.api.anomaly import router as anomaly_router
from app.api.prediction import router as prediction_router
from app.api.categorization import router as categorization_router

__all__ = ["health_router", "anomaly_router", "prediction_router", "categorization_router"]
