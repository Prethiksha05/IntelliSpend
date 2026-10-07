"""
ML Service startup and health check tests.
Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


# ---- Bootstrap app with mocked model service ----

@pytest.fixture(scope="module")
def client():
    """Create test client with mocked model service."""
    with patch("app.services.model_service.ModelService.load_models"):
        from app.main import app

        # Inject a mock model service
        mock_model_service = MagicMock()
        mock_model_service.get_user_model.return_value = None  # No user model
        mock_model_service.get_global_model.return_value = (None, None)
        app.state.model_service = mock_model_service

        with TestClient(app) as c:
            yield c


# ============================
# Health Tests
# ============================

def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "IntelliSpend ML Service"


def test_root_endpoint(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["service"] == "IntelliSpend ML Service"


# ============================
# Anomaly Detection Tests
# ============================

NORMAL_TRANSACTION = {
    "user_id": 1,
    "amount": 500.0,
    "category": "Food",
    "merchant": "Swiggy",
    "transaction_date": "2026-10-07",
    "transaction_hour": 13,
    "day_of_week": 2,
    "user_avg_amount": 450.0,
    "user_std_amount": 200.0,
    "category_avg_amount": 400.0,
    "category_std_amount": 150.0,
    "transactions_last_hour": 1,
    "minutes_since_last_transaction": 180.0
}

ANOMALOUS_TRANSACTION = {
    "user_id": 1,
    "amount": 18500.0,     # 41× the average
    "category": "Shopping",
    "merchant": "Unknown Merchant",
    "transaction_date": "2026-10-07",
    "transaction_hour": 3,  # 3 AM — unusual time
    "day_of_week": 6,
    "user_avg_amount": 450.0,
    "user_std_amount": 200.0,
    "category_avg_amount": 800.0,
    "category_std_amount": 300.0,
    "transactions_last_hour": 8,  # unusually high frequency
    "minutes_since_last_transaction": 1.0  # rapid succession
}


def test_detect_normal_transaction(client):
    resp = client.post("/api/v1/anomaly/detect", json=NORMAL_TRANSACTION)
    assert resp.status_code == 200
    data = resp.json()
    assert "is_anomaly" in data
    assert "anomaly_score" in data
    assert "risk_level" in data
    assert "reasons" in data
    assert 0.0 <= data["anomaly_score"] <= 1.0


def test_detect_anomalous_transaction(client):
    resp = client.post("/api/v1/anomaly/detect", json=ANOMALOUS_TRANSACTION)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_anomaly"] is True
    assert data["anomaly_score"] > 0.3
    assert data["risk_level"] in ["MEDIUM", "HIGH", "CRITICAL"]
    assert len(data["reasons"]) > 0


def test_anomaly_score_range(client):
    """Score must always be in [0, 1]."""
    resp = client.post("/api/v1/anomaly/detect", json=NORMAL_TRANSACTION)
    data = resp.json()
    assert 0.0 <= data["anomaly_score"] <= 1.0


def test_batch_anomaly_detection(client):
    batch = {
        "transactions": [NORMAL_TRANSACTION, ANOMALOUS_TRANSACTION]
    }
    resp = client.post("/api/v1/anomaly/detect/batch", json=batch)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_analyzed"] == 2
    assert data["anomalies_found"] >= 1
    assert len(data["results"]) == 2


def test_train_model_requires_min_transactions(client):
    """Training with fewer than 10 transactions should return 400."""
    payload = {
        "user_id": 99,
        "transactions": [
            {"user_id": 99, "amount": 100.0, "category": "Food",
             "transaction_hour": 12, "day_of_week": 1, "day_of_month": 7, "month": 10}
        ] * 5  # only 5
    }
    resp = client.post("/api/v1/anomaly/train", json=payload)
    assert resp.status_code == 400


# ============================
# Categorization Tests
# ============================

@pytest.mark.parametrize("description,merchant,expected_category", [
    ("Swiggy order", "Swiggy", "Food"),
    ("Uber ride", "Uber", "Transport"),
    ("Amazon purchase", "Amazon", "Shopping"),
    ("Netflix subscription", "Netflix", "Entertainment"),
    ("Apollo pharmacy", "Apollo", "Healthcare"),
    ("Electricity bill", None, "Bills"),
])
def test_categorization_rule_based(client, description, merchant, expected_category):
    payload = {"description": description, "merchant": merchant}
    resp = client.post("/api/v1/categorize", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == expected_category
    assert data["method"] == "rule_based"
    assert 0.0 <= data["confidence"] <= 1.0


# ============================
# Spending Prediction Tests
# ============================

def test_prediction_with_sufficient_history(client):
    payload = {
        "user_id": 1,
        "historical_monthly_totals": [25000.0, 28000.0, 30000.0, 27000.0],
        "current_month_spending": 18000.0,
        "current_day_of_month": 18,
        "days_in_month": 31,
        "budget": 35000.0
    }
    resp = client.post("/api/v1/prediction/spending", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_monthly_total"] >= payload["current_month_spending"]
    assert data["method"] == "linear_regression"
    assert data["budget_utilization_percent"] is not None
    assert "message" in data


def test_prediction_exceeds_budget(client):
    payload = {
        "user_id": 2,
        "historical_monthly_totals": [45000.0, 48000.0, 52000.0],
        "current_month_spending": 35000.0,
        "current_day_of_month": 20,
        "days_in_month": 31,
        "budget": 40000.0
    }
    resp = client.post("/api/v1/prediction/spending", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["will_exceed_budget"] is True
    assert data["excess_amount"] is not None
    assert data["excess_amount"] > 0


def test_prediction_no_history(client):
    payload = {
        "user_id": 3,
        "historical_monthly_totals": [],
        "current_month_spending": 5000.0,
        "current_day_of_month": 7,
        "days_in_month": 31
    }
    resp = client.post("/api/v1/prediction/spending", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["method"] == "daily_rate_projection"
    assert data["predicted_monthly_total"] > payload["current_month_spending"]
