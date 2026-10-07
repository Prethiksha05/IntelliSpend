"""
Anomaly Detection Service — Core ML logic.
Uses Isolation Forest + Z-Score + IQR for multi-method detection.
"""

import numpy as np
import logging
from typing import List, Tuple, Optional
from scipy import stats as scipy_stats

from app.schemas.schemas import (
    TransactionFeatures, AnomalyResponse, RiskLevel, AnomalyType
)
from app.services.model_service import ModelService

logger = logging.getLogger(__name__)

# Thresholds for risk classification
ANOMALY_SCORE_THRESHOLDS = {
    RiskLevel.LOW: 0.3,
    RiskLevel.MEDIUM: 0.5,
    RiskLevel.HIGH: 0.7,
    RiskLevel.CRITICAL: 0.85,
}

Z_SCORE_THRESHOLD = 2.5
IQR_MULTIPLIER = 1.5
FREQUENCY_THRESHOLD_PER_HOUR = 5
UNUSUAL_HOURS = list(range(0, 6))  # midnight to 6am


class AnomalyDetectionService:
    """
    Multi-method anomaly detection service.
    Primary: Isolation Forest (personalized, per-user model)
    Supporting: Z-Score, IQR, rule-based heuristics
    """

    def __init__(self, model_service: ModelService):
        self.model_service = model_service

    def detect(self, transaction: TransactionFeatures) -> AnomalyResponse:
        """
        Main detection pipeline.
        Combines Isolation Forest score with statistical methods.
        """
        reasons: List[str] = []
        anomaly_types: List[AnomalyType] = []

        # ----------------------------
        # 1. Isolation Forest Score
        # ----------------------------
        if_score, if_raw = self._isolation_forest_score(transaction)

        # ----------------------------
        # 2. Z-Score Analysis
        # ----------------------------
        z_score, z_is_outlier = self._z_score_analysis(transaction)
        if z_is_outlier:
            anomaly_types.append(AnomalyType.AMOUNT)
            reasons.append(
                f"Amount is {abs(z_score):.1f}σ from your typical spending "
                f"(normal range: ₹{self._normal_range(transaction)})"
            )

        # ----------------------------
        # 3. IQR Analysis
        # ----------------------------
        iqr_outlier = self._iqr_analysis(transaction)
        if iqr_outlier and AnomalyType.AMOUNT not in anomaly_types:
            anomaly_types.append(AnomalyType.AMOUNT)
            reasons.append("Amount falls outside your normal spending range (IQR analysis)")

        # ----------------------------
        # 4. Category Amount Analysis
        # ----------------------------
        cat_anomaly, cat_reason = self._category_analysis(transaction)
        if cat_anomaly:
            anomaly_types.append(AnomalyType.CATEGORY)
            if cat_reason:
                reasons.append(cat_reason)

        # ----------------------------
        # 5. Frequency Analysis
        # ----------------------------
        freq_anomaly, freq_reason = self._frequency_analysis(transaction)
        if freq_anomaly:
            anomaly_types.append(AnomalyType.FREQUENCY)
            if freq_reason:
                reasons.append(freq_reason)

        # ----------------------------
        # 6. Time Analysis
        # ----------------------------
        time_anomaly, time_reason = self._time_analysis(transaction)
        if time_anomaly:
            anomaly_types.append(AnomalyType.TIME)
            if time_reason:
                reasons.append(time_reason)

        # ----------------------------
        # 7. Combine Scores
        # ----------------------------
        combined_score = self._combine_scores(
            if_score=if_score,
            z_is_outlier=z_is_outlier,
            iqr_outlier=iqr_outlier,
            cat_anomaly=cat_anomaly,
            freq_anomaly=freq_anomaly,
            time_anomaly=time_anomaly
        )

        risk_level = self._classify_risk(combined_score, anomaly_types)
        is_anomaly = combined_score >= ANOMALY_SCORE_THRESHOLDS[RiskLevel.LOW]

        # Add amount context to reasons
        if is_anomaly and transaction.user_avg_amount:
            ratio = transaction.amount / transaction.user_avg_amount
            if ratio > 2.0:
                reasons.insert(0, f"₹{transaction.amount:,.0f} is {ratio:.1f}× your typical transaction amount")

        return AnomalyResponse(
            is_anomaly=is_anomaly,
            anomaly_score=round(combined_score, 4),
            risk_level=risk_level,
            anomaly_types=anomaly_types,
            reasons=reasons,
            isolation_forest_score=round(if_score, 4) if if_score is not None else None,
            z_score=round(z_score, 4) if z_score is not None else None,
            iqr_outlier=iqr_outlier,
            model_version="1.0.0"
        )

    def _isolation_forest_score(self, t: TransactionFeatures) -> Tuple[float, Optional[float]]:
        """
        Get anomaly score from Isolation Forest model.
        Returns normalized score [0, 1] where 1 = most anomalous.
        """
        user_data = self.model_service.get_user_model(t.user_id)

        features = np.array([[
            t.amount,
            hash(t.category) % 20,  # simple category encoding
            t.transaction_hour,
            t.day_of_week,
            0,  # day_of_month placeholder
            0   # month placeholder
        ]])

        if user_data and user_data.get("model") and user_data.get("scaler"):
            try:
                scaler = user_data["scaler"]
                model = user_data["model"]
                features_scaled = scaler.transform(features)
                raw_score = model.score_samples(features_scaled)[0]
                # Convert: more negative = more anomalous
                # score_samples returns values in (-1, 0), normalize to [0, 1]
                normalized = float(np.clip(-raw_score, 0, 1))
                return normalized, raw_score
            except Exception as e:
                logger.warning(f"IF model failed for user {t.user_id}: {e}")

        # No user model: use statistical fallback
        return self._statistical_fallback_score(t), None

    def _statistical_fallback_score(self, t: TransactionFeatures) -> float:
        """Compute score purely from statistical context when no model exists."""
        if not t.user_avg_amount or t.user_avg_amount == 0:
            return 0.1  # cannot determine without history

        ratio = t.amount / t.user_avg_amount
        if ratio > 5.0:
            return 0.85
        elif ratio > 3.0:
            return 0.65
        elif ratio > 2.0:
            return 0.45
        elif ratio > 1.5:
            return 0.25
        return 0.1

    def _z_score_analysis(self, t: TransactionFeatures) -> Tuple[Optional[float], bool]:
        """Compute Z-score relative to user's spending history."""
        if not t.user_avg_amount or not t.user_std_amount or t.user_std_amount == 0:
            return None, False

        z = (t.amount - t.user_avg_amount) / t.user_std_amount
        return z, abs(z) > Z_SCORE_THRESHOLD

    def _iqr_analysis(self, t: TransactionFeatures) -> bool:
        """IQR outlier detection."""
        # We'd need Q1 and Q3 from user history — approximate from mean/std
        if not t.user_avg_amount or not t.user_std_amount:
            return False

        # Approximate IQR using ±0.675 * std (normal distribution approximation)
        q1 = t.user_avg_amount - 0.675 * t.user_std_amount
        q3 = t.user_avg_amount + 0.675 * t.user_std_amount
        iqr = q3 - q1
        upper_fence = q3 + IQR_MULTIPLIER * iqr

        return t.amount > upper_fence

    def _category_analysis(self, t: TransactionFeatures) -> Tuple[bool, Optional[str]]:
        """Check if amount is unusually high for this category."""
        if not t.category_avg_amount or not t.category_std_amount:
            return False, None

        if t.category_std_amount == 0:
            return False, None

        z = (t.amount - t.category_avg_amount) / t.category_std_amount
        if abs(z) > Z_SCORE_THRESHOLD:
            ratio = t.amount / t.category_avg_amount
            return True, (
                f"Your {t.category} spending (₹{t.amount:,.0f}) is "
                f"{ratio:.1f}× your typical {t.category} transaction (₹{t.category_avg_amount:,.0f})"
            )

        if t.monthly_category_total and t.category_avg_amount:
            monthly_avg = t.category_avg_amount * 10  # estimate
            if t.monthly_category_total > monthly_avg * 1.5:
                pct = ((t.monthly_category_total / monthly_avg) - 1) * 100
                return True, f"Your {t.category} spending this month is {pct:.0f}% above your usual monthly average"

        return False, None

    def _frequency_analysis(self, t: TransactionFeatures) -> Tuple[bool, Optional[str]]:
        """Detect unusually high transaction frequency."""
        if t.transactions_last_hour and t.transactions_last_hour >= FREQUENCY_THRESHOLD_PER_HOUR:
            return True, f"Unusually high frequency: {t.transactions_last_hour} transactions in the last hour"

        if t.minutes_since_last_transaction is not None and t.minutes_since_last_transaction < 2:
            return True, "Very rapid successive transaction (within 2 minutes of previous)"

        return False, None

    def _time_analysis(self, t: TransactionFeatures) -> Tuple[bool, Optional[str]]:
        """Detect transactions at unusual hours."""
        if t.transaction_hour in UNUSUAL_HOURS:
            return True, f"Transaction occurred at unusual time ({t.transaction_hour:02d}:00 — midnight to 6 AM)"
        return False, None

    def _combine_scores(
        self,
        if_score: float,
        z_is_outlier: bool,
        iqr_outlier: bool,
        cat_anomaly: bool,
        freq_anomaly: bool,
        time_anomaly: bool
    ) -> float:
        """
        Weighted combination of all signals.
        Isolation Forest gets highest weight as primary detector.
        """
        # Weighted scoring
        score = if_score * 0.5

        bonus = 0.0
        if z_is_outlier:
            bonus += 0.20
        if iqr_outlier:
            bonus += 0.10
        if cat_anomaly:
            bonus += 0.10
        if freq_anomaly:
            bonus += 0.10
        if time_anomaly:
            bonus += 0.05

        return float(np.clip(score + bonus, 0.0, 1.0))

    def _classify_risk(self, score: float, anomaly_types: List[AnomalyType]) -> RiskLevel:
        """Classify risk level from score."""
        if score >= ANOMALY_SCORE_THRESHOLDS[RiskLevel.CRITICAL]:
            return RiskLevel.CRITICAL
        elif score >= ANOMALY_SCORE_THRESHOLDS[RiskLevel.HIGH]:
            return RiskLevel.HIGH
        elif score >= ANOMALY_SCORE_THRESHOLDS[RiskLevel.MEDIUM]:
            return RiskLevel.MEDIUM
        elif score >= ANOMALY_SCORE_THRESHOLDS[RiskLevel.LOW]:
            return RiskLevel.LOW
        return RiskLevel.LOW

    def _normal_range(self, t: TransactionFeatures) -> str:
        """Format normal spending range for display."""
        if not t.user_avg_amount or not t.user_std_amount:
            return "unknown"
        low = max(0, t.user_avg_amount - t.user_std_amount)
        high = t.user_avg_amount + t.user_std_amount
        return f"₹{low:,.0f}–₹{high:,.0f}"
