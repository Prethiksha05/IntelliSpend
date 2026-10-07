"""
Spending Prediction API endpoints.
Uses linear regression / trend analysis on historical monthly totals.
"""

from fastapi import APIRouter, HTTPException
import logging
import numpy as np
from typing import List

from app.schemas.schemas import SpendingPredictionRequest, SpendingPredictionResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/prediction/spending", response_model=SpendingPredictionResponse)
async def predict_spending(request: SpendingPredictionRequest):
    """
    Predict end-of-month total spending using trend analysis.

    Method selection:
    - >= 3 months history: Linear regression on monthly totals
    - 1-2 months history: Weighted average with daily rate projection
    - 0 months history: Daily rate projection only
    """
    try:
        result = _predict(request)
        return result
    except Exception as e:
        logger.error(f"Prediction failed for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


def _predict(req: SpendingPredictionRequest) -> SpendingPredictionResponse:
    days_elapsed = req.current_day_of_month
    days_remaining = req.days_in_month - days_elapsed
    daily_rate = req.current_month_spending / max(days_elapsed, 1)

    history = req.historical_monthly_totals
    n = len(history)

    if n >= 3:
        # Linear regression on last N months
        method = "linear_regression"
        x = np.arange(n)
        y = np.array(history)
        coeffs = np.polyfit(x, y, 1)
        trend_prediction = float(np.polyval(coeffs, n))

        # Blend trend with current daily rate projection
        daily_projection = req.current_month_spending + (daily_rate * days_remaining)
        predicted = trend_prediction * 0.4 + daily_projection * 0.6

        # 95% confidence interval from residuals
        residuals = y - np.polyval(coeffs, x)
        std_residual = float(np.std(residuals))
        ci_lower = predicted - 1.96 * std_residual
        ci_upper = predicted + 1.96 * std_residual

    elif n >= 1:
        # Weighted average
        method = "weighted_average"
        avg_historical = float(np.mean(history))
        daily_projection = req.current_month_spending + (daily_rate * days_remaining)
        predicted = avg_historical * 0.3 + daily_projection * 0.7

        std = float(np.std(history)) if n > 1 else avg_historical * 0.15
        ci_lower = predicted - 1.5 * std
        ci_upper = predicted + 1.5 * std
    else:
        # Pure daily rate projection
        method = "daily_rate_projection"
        predicted = req.current_month_spending + (daily_rate * days_remaining)
        ci_lower = predicted * 0.85
        ci_upper = predicted * 1.15

    predicted = max(predicted, req.current_month_spending)
    ci_lower = max(ci_lower, req.current_month_spending)
    ci_upper = max(ci_upper, predicted)

    # Budget analysis
    budget_utilization = None
    will_exceed = None
    excess = None
    if req.budget and req.budget > 0:
        budget_utilization = round((predicted / req.budget) * 100, 1)
        will_exceed = predicted > req.budget
        excess = round(predicted - req.budget, 2) if will_exceed else None

    # Human-readable message
    message = _build_message(predicted, req, will_exceed, excess, days_remaining)

    return SpendingPredictionResponse(
        predicted_monthly_total=round(predicted, 2),
        confidence_interval_lower=round(max(0, ci_lower), 2),
        confidence_interval_upper=round(ci_upper, 2),
        predicted_daily_average=round(daily_rate, 2),
        budget_utilization_percent=budget_utilization,
        will_exceed_budget=will_exceed,
        excess_amount=excess,
        method=method,
        message=message
    )


def _build_message(predicted: float, req: SpendingPredictionRequest,
                   will_exceed: bool, excess: float, days_remaining: int) -> str:
    parts = [
        f"Current spending: ₹{req.current_month_spending:,.0f}.",
        f"Predicted month-end total: ₹{predicted:,.0f}.",
    ]
    if days_remaining > 0:
        parts.append(f"{days_remaining} days remaining in the month.")
    if will_exceed and excess:
        parts.append(f"⚠️ Budget likely to be exceeded by ₹{excess:,.0f}.")
    elif req.budget and not will_exceed:
        remaining_budget = req.budget - predicted
        parts.append(f"✅ Projected to stay within budget by ₹{remaining_budget:,.0f}.")
    return " ".join(parts)
