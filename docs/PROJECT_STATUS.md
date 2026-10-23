# Project Status — Real Estate Price Prediction System

## Current phase
Phase 6 complete — FastAPI ML service is live, verified, and predicting in ETB.
Next: Phase 7 (Express backend + Prisma + PostgreSQL).

## Verified working components
- [x] ML environment: Python 3.13.5 venv, all pinned deps installed and importable
- [x] Addis Ababa dataset downloaded and verified (Zenodo 11205969, 85,400 × 50, ETB)
- [x] Reproducible downloader: `ml-service/scripts/download_dataset.py`
- [x] Training script: `ml-service/train_model.py` (RandomForest + GradientBoosting, log1p target)
- [x] Model trained and saved: `ml-service/models/price_prediction_model.joblib` (52.5 MB)
- [x] Model metadata: `ml-service/models/model_meta.json`
- [x] FastAPI service: `/health`, `/predict`, `/model-info` verified end-to-end
  - Sample prediction: 150 sqm apartment, Bole, 3 bed / 2 bath, 2023 → 14,687,864 ETB

## Verified ML metrics (from actual training run)
- Training rows: 55,354 (for-sale residential, non-outlier, real size_sqm)
- RandomForest (selected): MAE 3,010,437 ETB · RMSE 5,643,634 ETB · R² 0.8124
- GradientBoosting: MAE 3,706,818 ETB · RMSE 6,329,092 ETB · R² 0.7412
- Trained at: 2026-10-23T16:25:35 UTC
- Model size: 52,572,384 bytes (down from 404 MB after reducing trees/leaf/depth)

## Pending tasks
- [ ] Phase 7: Express + TypeScript + Prisma + PostgreSQL backend
- [ ] Phase 7: JWT auth, bcrypt, validation, rate limiting, centralized errors
- [ ] Phase 8: React + Vite + TypeScript frontend (public, auth, dashboard, prediction form, history, charts)
- [ ] Phase 9: Authorization, admin views, audit logs
- [ ] Phase 10: Integration tests, debugging
- [ ] Phase 11: Docker, docker-compose, operational checks
- [ ] Phase 12: Docs, diagrams, screenshots, final-year report

## Existing errors / known issues
- `backend/package.json` is a JS stub (Express 5 only, no TS, Prisma, PostgreSQL, JWT, validation). Must be replaced.
- `frontend/` is empty (folder exists but no files).
- `README.md`, `.env.example`, `docker-compose.yml` are **0 bytes** — still placeholders.
- `data/housing.csv` (California Housing, 1.4 MB) is still present but unused by the Ethiopian model. Should be removed or moved out.

## Decisions and assumptions
- **Ethiopian-only data.** US datasets (Ames, California) are fully replaced; predictions are ETB.
- **One model, for-sale residential.** Apartment + house only; land/commercial/rent are out of scope.
- **log1p target transform** (price is right-skewed).
- **RandomForest selected** on held-out test set.
- **Model file gitignored** (`ml-service/models/*.joblib`) to keep the repo pushable.
- **Raw CSV gitignored** (`data/raw/`) — reproducible via downloader script.

## Important file paths
- Frontend: `/frontend` (empty)
- Backend: `/backend` (stub package.json only)
- ML service: `/ml-service` (working: `main.py`, `train_model.py`, `scripts/download_dataset.py`)
- Models: `/ml-service/models/price_prediction_model.joblib` (gitignored)
- Dataset: `/data/raw/addis_ababa_real_estate.csv` (gitignored)
- Docs: `/docs/DATASET.md`, `/docs/PROJECT_STATUS.md`

## Dependency versions (verified)
- Python 3.13.5
- pandas 2.2.3, numpy 2.1.2, scikit-learn 1.5.2, joblib 1.4.2
- fastapi 0.115.3, uvicorn 0.32.0, pydantic 2.9.2, pytest 8.3.3

## Git state
- Branch: `main` (renamed from `master`)
- Remote: `origin/main`
- Last pushed commit: `860d546` (contains the **old California** code — will be superseded by the next commit)
- Uncommitted changes: Ethiopian `main.py` and `train_model.py`, plus new `docs/DATASET.md`, `model_meta.json`, and updated `.gitignore`

## Next recommended action
Commit the verified Ethiopian ML stack (trainer, main.py, DATASET.md, PROJECT_STATUS.md, model_meta.json, gitignore rules), then start Phase 7 (Express + Prisma + PostgreSQL).
