"""
Anomaly Detection API endpoints.
"""

from fastapi import APIRouter, Request, HTTPException
import logging

from app.schemas.schemas import (
    TransactionFeatures, AnomalyResponse,
    BatchTransactionRequest, BatchAnomalyResponse,
    TrainModelRequest, TrainModelResponse
)
from app.services.anomaly_service import AnomalyDetectionService
from app.services.model_service import ModelService

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_services(request: Request):
    model_service: ModelService = request.app.state.model_service
    anomaly_service = AnomalyDetectionService(model_service)
    return model_service, anomaly_service


@router.post("/anomaly/detect", response_model=AnomalyResponse)
async def detect_anomaly(transaction: TransactionFeatures, request: Request):
    """
    Detect anomaly in a single transaction.
    Uses Isolation Forest + Z-Score + IQR + heuristics.
    """
    try:
        _, anomaly_service = _get_services(request)
        result = anomaly_service.detect(transaction)
        logger.info(
            f"Anomaly detection for user {transaction.user_id}: "
            f"score={result.anomaly_score}, risk={result.risk_level}"
        )
        return result
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")


@router.post("/anomaly/detect/batch", response_model=BatchAnomalyResponse)
async def detect_anomaly_batch(batch: BatchTransactionRequest, request: Request):
    """
    Detect anomalies in a batch of transactions.
    Useful for re-analyzing historical data.
    """
    try:
        _, anomaly_service = _get_services(request)
        results = [anomaly_service.detect(t) for t in batch.transactions]
        anomalies_found = sum(1 for r in results if r.is_anomaly)

        return BatchAnomalyResponse(
            results=results,
            total_analyzed=len(results),
            anomalies_found=anomalies_found
        )
    except Exception as e:
        logger.error(f"Batch anomaly detection failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch detection failed: {str(e)}")


@router.post("/anomaly/train", response_model=TrainModelResponse)
async def train_user_model(train_request: TrainModelRequest, request: Request):
    """
    Train a personalized Isolation Forest model for a specific user.
    Requires at least 10 historical transactions.
    Called by Spring Boot backend after user has sufficient history.
    """
    try:
        model_service, _ = _get_services(request)

        if len(train_request.transactions) < 10:
            raise HTTPException(
                status_code=400,
                detail="At least 10 transactions required for model training"
            )

        metadata = model_service.train_user_model(
            user_id=train_request.user_id,
            transactions=train_request.transactions
        )

        return TrainModelResponse(
            success=True,
            user_id=train_request.user_id,
            model_version=metadata.get("model_version", "1.0.0"),
            training_samples=metadata.get("n_training_samples", 0),
            message=f"Model trained successfully for user {train_request.user_id} "
                    f"with {metadata.get('n_training_samples', 0)} samples"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model training failed for user {train_request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")


@router.get("/anomaly/model/{user_id}/status")
async def get_model_status(user_id: int, request: Request):
    """Check if a personalized model exists for a user."""
    model_service, _ = _get_services(request)
    user_data = model_service.get_user_model(user_id)

    if user_data:
        return {
            "user_id": user_id,
            "model_exists": True,
            "training_samples": user_data.get("metadata", {}).get("n_training_samples", 0),
            "model_version": user_data.get("metadata", {}).get("model_version", "unknown")
        }
    return {
        "user_id": user_id,
        "model_exists": False,
        "message": "No personalized model. Using statistical fallback."
    }
