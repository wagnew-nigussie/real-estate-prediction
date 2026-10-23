"""FastAPI prediction service for Addis Ababa residential sale prices.

Loads ml-service/models/price_prediction_model.joblib (RandomForest, trained on
log1p(price) in ETB). Returns predicted price in ETB.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "ml-service" / "models" / "price_prediction_model.joblib"
META_PATH = PROJECT_ROOT / "ml-service" / "models" / "model_meta.json"

model = None
model_meta: dict = {}


def load() -> None:
    global model, model_meta
    try:
        model = joblib.load(MODEL_PATH)
        if META_PATH.exists():
            model_meta = json.loads(META_PATH.read_text())
        print("Model loaded.")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None


load()
app = FastAPI(title="Addis Ababa Real Estate ML API", version="2.0")


class PropertyFeatures(BaseModel):
    size_sqm: float = Field(..., gt=0)
    property_type: Literal["apartment", "house"]
    subcity: str
    num_bedrooms: float | None = None
    num_bathrooms: float | None = None
    floor: float | None = None
    year: int = 2024
    lat: float | None = None
    lng: float | None = None
    dist_meskel_square: float | None = None
    dist_arat_kilo: float | None = None
    dist_piassa: float | None = None


def _row(f: PropertyFeatures) -> pd.DataFrame:
    return pd.DataFrame([{
        "size_sqm": f.size_sqm,
        "num_bedrooms": f.num_bedrooms,
        "num_bathrooms": f.num_bathrooms,
        "floor": f.floor,
        "year": f.year,
        "lat": f.lat,
        "lng": f.lng,
        "dist_meskel_square": f.dist_meskel_square,
        "dist_arat_kilo": f.dist_arat_kilo,
        "dist_piassa": f.dist_piassa,
        "property_type": f.property_type,
        "subcity": f.subcity.lower() if f.subcity else None,
    }])


@app.get("/health")
def health():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "status": "healthy",
        "model_loaded": True,
        "trained_at_utc": model_meta.get("trained_at_utc"),
        "selected": model_meta.get("selected"),
    }


@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return model_meta


@app.post("/predict")
def predict(features: PropertyFeatures):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        pred_log = model.predict(_row(features))[0]
        pred_etb = float(np.expm1(pred_log))
        return {
            "predicted_price_etb": round(pred_etb, 2),
            "currency": "ETB",
            "selected_model": model_meta.get("selected"),
            "trained_at_utc": model_meta.get("trained_at_utc"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
