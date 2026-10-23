"""Train the Addis Ababa residential price prediction model.

Dataset: data/raw/addis_ababa_real_estate.csv (Zenodo 11205969).
Scope: for-sale residential only (apartment + house), clean rows,
       non-imputed size_sqm. Target: price in ETB (log-transformed).

Run from project root:
    ./ml-service/venv/bin/python ml-service/train_model.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = PROJECT_ROOT / "data" / "raw" / "addis_ababa_real_estate.csv"
MODEL_DIR = PROJECT_ROOT / "ml-service" / "models"
MODEL_PATH = MODEL_DIR / "price_prediction_model.joblib"
META_PATH = MODEL_DIR / "model_meta.json"

NUMERIC_FEATURES = [
    "size_sqm", "num_bedrooms", "num_bathrooms", "floor", "year",
    "lat", "lng",
    "dist_meskel_square", "dist_arat_kilo", "dist_piassa",
]
CATEGORICAL_FEATURES = ["property_type", "subcity"]
TARGET = "price"


def load_training_data() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH, low_memory=False)
    df = df[
        (df["listing_type"] == "for sale")
        & (df["property_type"].isin(["apartment", "house"]))
        & (df["misclassified_or_outliers_flag"] == "no")
        & (df["size_sqm_is_imputed"] == "no")
    ].copy()
    for col in ["num_bedrooms", "num_bathrooms", "floor"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=[TARGET])
    df = df[df[TARGET] > 0]
    return df


def build_pipeline(model) -> Pipeline:
    numeric = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    pre = ColumnTransformer([
        ("num", numeric, NUMERIC_FEATURES),
        ("cat", categorical, CATEGORICAL_FEATURES),
    ])
    return Pipeline([("pre", pre), ("model", model)])


def evaluate(name, pipe, X_train, X_test, y_train_log, y_test, y_test_log):
    pipe.fit(X_train, y_train_log)
    pred = np.expm1(pipe.predict(X_test))
    mae = float(mean_absolute_error(y_test, pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, pred)))
    r2 = float(r2_score(y_test_log, np.log1p(pred)))
    print(f"\n=== {name} ===")
    print(f"MAE  : {mae:,.0f} ETB")
    print(f"RMSE : {rmse:,.0f} ETB")
    print(f"R^2  : {r2:.4f}")
    return {"mae_etb": mae, "rmse_etb": rmse, "r2": r2}


def main() -> int:
    print(f"Loading {CSV_PATH}")
    df = load_training_data()
    print(f"Training rows: {len(df)}")
    print(f"property_type: {df['property_type'].value_counts().to_dict()}")
    print(f"price (ETB) median: {df[TARGET].median():,.0f}")

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET].astype(float)
    y_log = np.log1p(y)

    X_train, X_test, y_train_log, y_test_log = train_test_split(
        X, y_log, test_size=0.2, random_state=42
    )
    y_test = np.expm1(y_test_log)

    candidates = {
        "RandomForest": RandomForestRegressor(
            n_estimators=100, min_samples_leaf=5, max_depth=20, n_jobs=-1, random_state=42
        ),
        "GradientBoosting": GradientBoostingRegressor(random_state=42),
    }

    results, fitted = {}, {}
    for name, model in candidates.items():
        pipe = build_pipeline(model)
        results[name] = evaluate(
            name, pipe, X_train, X_test, y_train_log, y_test, y_test_log
        )
        fitted[name] = pipe

    best = max(results, key=lambda n: results[n]["r2"])
    print(f"\nSelected model: {best} (highest R^2 on held-out test set)")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(fitted[best], MODEL_PATH)
    print(f"Model saved: {MODEL_PATH}")

    meta = {
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": "addis_ababa_real_estate.csv (Zenodo 11205969)",
        "training_rows": int(len(df)),
        "features_numeric": NUMERIC_FEATURES,
        "features_categorical": CATEGORICAL_FEATURES,
        "target": TARGET,
        "target_transform": "log1p",
        "currency": "ETB",
        "test_split": 0.2,
        "random_state": 42,
        "candidates": results,
        "selected": best,
    }
    META_PATH.write_text(json.dumps(meta, indent=2, ensure_ascii=False))
    print(f"Metadata saved: {META_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
