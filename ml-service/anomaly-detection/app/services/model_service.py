"""
Model Service — Manages loading and serving ML models.
Models are trained per-user using Isolation Forest and supporting statistical methods.
"""

import os
import logging
import numpy as np
import pandas as pd
from pathlib import Path
import joblib
from typing import Optional, Dict, Any
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder

logger = logging.getLogger(__name__)

# Models are persisted in this directory
MODELS_DIR = Path(os.getenv("MODELS_DIR", "app/models/saved"))
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Global model registry: {user_id: {"model": ..., "scaler": ..., "metadata": ...}}
_model_registry: Dict[int, Dict[str, Any]] = {}

# Global model for new users with no history
_global_model: Optional[IsolationForest] = None
_global_scaler: Optional[StandardScaler] = None


class ModelService:
    """
    Singleton-style service for managing ML models.
    Uses Isolation Forest for anomaly detection.
    """

    def load_models(self):
        """Load all persisted user models and the global model from disk on startup."""
        global _global_model, _global_scaler

        logger.info("Loading ML models from disk...")

        # Load global fallback model
        global_model_path = MODELS_DIR / "global_model.joblib"
        global_scaler_path = MODELS_DIR / "global_scaler.joblib"

        if global_model_path.exists() and global_scaler_path.exists():
            _global_model = joblib.load(global_model_path)
            _global_scaler = joblib.load(global_scaler_path)
            logger.info("Global fallback model loaded.")
        else:
            logger.info("No global model found. Will train on first request or use statistical methods.")

        # Load user-specific models
        loaded_count = 0
        for model_path in MODELS_DIR.glob("user_*_model.joblib"):
            try:
                user_id = int(model_path.stem.split("_")[1])
                scaler_path = MODELS_DIR / f"user_{user_id}_scaler.joblib"
                metadata_path = MODELS_DIR / f"user_{user_id}_metadata.joblib"

                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path) if scaler_path.exists() else None
                metadata = joblib.load(metadata_path) if metadata_path.exists() else {}

                _model_registry[user_id] = {
                    "model": model,
                    "scaler": scaler,
                    "metadata": metadata
                }
                loaded_count += 1
            except Exception as e:
                logger.warning(f"Failed to load model for {model_path.name}: {e}")

        logger.info(f"Loaded {loaded_count} user-specific models.")

    def train_user_model(self, user_id: int, transactions: list) -> Dict[str, Any]:
        """
        Train an Isolation Forest model for a specific user.
        Called when user has enough history (≥10 transactions).
        """
        if len(transactions) < 10:
            raise ValueError(f"Need at least 10 transactions to train model. Got {len(transactions)}.")

        df = pd.DataFrame([t.model_dump() for t in transactions])
        features, scaler = self._prepare_features(df)

        # Isolation Forest: contamination auto-tuned based on dataset
        contamination = min(0.1, max(0.01, 1 / len(transactions)))
        model = IsolationForest(
            n_estimators=200,
            contamination=contamination,
            random_state=42,
            max_samples="auto"
        )
        model.fit(features)

        # Compute statistical baselines for explainability
        metadata = {
            "user_id": user_id,
            "n_training_samples": len(transactions),
            "amount_mean": float(df["amount"].mean()),
            "amount_std": float(df["amount"].std()),
            "amount_q1": float(df["amount"].quantile(0.25)),
            "amount_q3": float(df["amount"].quantile(0.75)),
            "amount_iqr": float(df["amount"].quantile(0.75) - df["amount"].quantile(0.25)),
            "category_stats": df.groupby("category")["amount"].agg(["mean", "std"]).to_dict(),
            "avg_transactions_per_day": len(transactions) / max(1, df["day_of_week"].nunique()),
            "model_version": "1.0.0"
        }

        # Persist model
        self._save_user_model(user_id, model, scaler, metadata)

        # Update in-memory registry
        _model_registry[user_id] = {
            "model": model,
            "scaler": scaler,
            "metadata": metadata
        }

        logger.info(f"Trained and saved model for user {user_id} with {len(transactions)} samples.")
        return metadata

    def get_user_model(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve user-specific model from registry."""
        return _model_registry.get(user_id)

    def get_global_model(self):
        """Return the global fallback model."""
        return _global_model, _global_scaler

    def _prepare_features(self, df: pd.DataFrame):
        """Extract and scale features for Isolation Forest."""
        # Encode categorical columns
        category_encoder = LabelEncoder()
        df["category_encoded"] = category_encoder.fit_transform(df["category"].fillna("others"))

        feature_cols = [
            "amount",
            "category_encoded",
            "transaction_hour",
            "day_of_week",
            "day_of_month",
            "month"
        ]

        # Fill missing cols
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0

        X = df[feature_cols].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        return X_scaled, scaler

    def _save_user_model(self, user_id: int, model, scaler, metadata):
        """Persist user model to disk."""
        joblib.dump(model, MODELS_DIR / f"user_{user_id}_model.joblib")
        joblib.dump(scaler, MODELS_DIR / f"user_{user_id}_scaler.joblib")
        joblib.dump(metadata, MODELS_DIR / f"user_{user_id}_metadata.joblib")
