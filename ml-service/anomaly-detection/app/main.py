"""
IntelliSpend ML Service — FastAPI Application Entry Point
Anomaly Detection, Categorization, and Spending Prediction Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from app.api import anomaly_router, prediction_router, categorization_router, health_router
from app.services.model_service import ModelService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: load models on startup, clean up on shutdown."""
    logger.info("🚀 IntelliSpend ML Service starting...")
    # Pre-load models into memory at startup
    model_service = ModelService()
    model_service.load_models()
    app.state.model_service = model_service
    logger.info("✅ ML models loaded successfully")
    yield
    logger.info("🛑 IntelliSpend ML Service shutting down...")


app = FastAPI(
    title="IntelliSpend ML Service",
    description="Machine Learning API for anomaly detection, expense categorization, and spending prediction.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================
# CORS Middleware
# ============================
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:4200").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Routers
# ============================
app.include_router(health_router, tags=["Health"])
app.include_router(anomaly_router, prefix="/api/v1", tags=["Anomaly Detection"])
app.include_router(prediction_router, prefix="/api/v1", tags=["Spending Prediction"])
app.include_router(categorization_router, prefix="/api/v1", tags=["Expense Categorization"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "IntelliSpend ML Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }
