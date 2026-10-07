"""
Pydantic schemas for ML service request/response models.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================
# Enums
# ============================

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AnomalyType(str, Enum):
    AMOUNT = "AMOUNT"
    FREQUENCY = "FREQUENCY"
    TIME = "TIME"
    CATEGORY = "CATEGORY"
    MERCHANT = "MERCHANT"
    DUPLICATE = "DUPLICATE"
    LOCATION = "LOCATION"


# ============================
# Anomaly Detection Schemas
# ============================

class TransactionFeatures(BaseModel):
    """Input features for anomaly detection."""
    user_id: int = Field(..., description="User identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    category: str = Field(..., description="Expense category")
    merchant: Optional[str] = Field(None, description="Merchant name")
    payment_method: Optional[str] = Field(None, description="Payment method")
    transaction_date: str = Field(..., description="Transaction date (ISO 8601)")
    transaction_hour: int = Field(..., ge=0, le=23, description="Hour of transaction (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    description: Optional[str] = Field(None, description="Transaction description")

    # Historical context (computed from user history by backend)
    user_avg_amount: Optional[float] = Field(None, description="User's average transaction amount")
    user_std_amount: Optional[float] = Field(None, description="Standard deviation of user's amounts")
    category_avg_amount: Optional[float] = Field(None, description="User's avg amount for this category")
    category_std_amount: Optional[float] = Field(None, description="Std dev for this category")
    monthly_total: Optional[float] = Field(None, description="User's current month total spending")
    monthly_category_total: Optional[float] = Field(None, description="User's current month total for this category")
    transactions_last_hour: Optional[int] = Field(None, description="Number of transactions in last hour")
    transactions_last_day: Optional[int] = Field(None, description="Number of transactions in last day")
    merchant_frequency: Optional[int] = Field(None, description="How often user transacts at this merchant")
    minutes_since_last_transaction: Optional[float] = Field(None, description="Minutes since last transaction")


class AnomalyResponse(BaseModel):
    """Anomaly detection result."""
    is_anomaly: bool = Field(..., description="Whether the transaction is anomalous")
    anomaly_score: float = Field(..., ge=0.0, le=1.0, description="Anomaly score (0=normal, 1=highly anomalous)")
    risk_level: RiskLevel = Field(..., description="Risk classification")
    anomaly_types: List[AnomalyType] = Field(default=[], description="Types of anomalies detected")
    reasons: List[str] = Field(default=[], description="Human-readable explanations")
    isolation_forest_score: Optional[float] = Field(None, description="Raw Isolation Forest score")
    z_score: Optional[float] = Field(None, description="Z-score of the amount")
    iqr_outlier: Optional[bool] = Field(None, description="Whether amount is IQR outlier")
    model_version: str = Field(default="1.0.0", description="ML model version used")


# ============================
# Batch Detection Schema
# ============================

class BatchTransactionRequest(BaseModel):
    transactions: List[TransactionFeatures] = Field(..., description="List of transactions to analyze")


class BatchAnomalyResponse(BaseModel):
    results: List[AnomalyResponse]
    total_analyzed: int
    anomalies_found: int


# ============================
# Model Training Schema
# ============================

class TrainingDataPoint(BaseModel):
    """A single historical transaction for model training."""
    user_id: int
    amount: float
    category: str
    merchant: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_hour: int
    day_of_week: int
    day_of_month: int
    month: int


class TrainModelRequest(BaseModel):
    user_id: int = Field(..., description="User ID to train model for")
    transactions: List[TrainingDataPoint] = Field(..., min_length=10, description="Historical transactions (min 10)")


class TrainModelResponse(BaseModel):
    success: bool
    user_id: int
    model_version: str
    training_samples: int
    message: str


# ============================
# Categorization Schemas
# ============================

class CategorizationRequest(BaseModel):
    description: str = Field(..., description="Transaction description or merchant name")
    merchant: Optional[str] = Field(None, description="Merchant name")
    amount: Optional[float] = Field(None, description="Transaction amount")


class CategorizationResponse(BaseModel):
    category: str = Field(..., description="Predicted category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    method: str = Field(..., description="Method used: rule_based or ml_based")
    alternatives: List[dict] = Field(default=[], description="Alternative category predictions")


# ============================
# Prediction Schemas
# ============================

class SpendingPredictionRequest(BaseModel):
    user_id: int
    historical_monthly_totals: List[float] = Field(..., description="Past monthly spending totals")
    current_month_spending: float = Field(..., description="Current month spending so far")
    current_day_of_month: int = Field(..., ge=1, le=31, description="Current day of month")
    days_in_month: int = Field(..., ge=28, le=31, description="Total days in current month")
    budget: Optional[float] = Field(None, description="User's monthly budget")


class SpendingPredictionResponse(BaseModel):
    predicted_monthly_total: float = Field(..., description="Predicted total for current month")
    confidence_interval_lower: float
    confidence_interval_upper: float
    predicted_daily_average: float
    budget_utilization_percent: Optional[float] = None
    will_exceed_budget: Optional[bool] = None
    excess_amount: Optional[float] = None
    method: str = Field(..., description="Prediction method used")
    message: str = Field(..., description="Human-readable prediction summary")
