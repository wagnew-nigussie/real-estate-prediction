# Dataset Documentation — Addis Ababa Real Estate (Zenodo 11205969)

## Status
Primary dataset. Real Addis Ababa listing data, prices in ETB.

## Source
- Repository: Zenodo record 11205969
- File: `real-estate_dataset_addis-ababa_zenodo_v1.csv`
- URL: https://zenodo.org/records/11205969
- Local path: `data/raw/addis_ababa_real_estate.csv`
- Size: 77,805,082 bytes
- SHA256: `5346704a6fbec74fe6fad72e225be3254fd042272cf3eb10fc9e5eea7c119d07`
- Download date: 2026-10-23 (Debian, `wget -c` resume after initial `curl` drop)
- Reproducible via: `ml-service/scripts/download_dataset.py`

## Market coverage
- Country: Ethiopia
- City: Addis Ababa
- Listing collection period: 2017–2024
- Currency: ETB (Ethiopian Birr)
- Sources: 25+ Ethiopian property listing platforms aggregated by the Zenodo authors

## Verified facts (from the actual file)
- Shape: 85,400 rows × 50 columns
- listing_type: for sale 69,258 · for rent 16,142
- property_type: apartment 38,241 · house 37,938 · land 5,022 · commercial 2,844 · other 899 · building 456
- price / price_sqm / size_sqm: no missing values
- price (raw, ETB): mean 9,902,915 · median 5,900,000 · std 13,059,900 · min 1,500 · max 230,000,000
- subcities present: lemi kura, bole, kirkos, yeka, nifas silk-lafto, akaki kality, lideta, kolfe keranio, arada (+ 3,146 NaN)
- misclassified_or_outliers_flag: 80,419 clean · 4,981 flagged

## Training subset (used to fit the model)
Filter chain (applied in `ml-service/train_model.py`):
1. `listing_type == "for sale"` and `property_type in {apartment, house}` → 60,805 rows
2. Remove `misclassified_or_outliers_flag == "yes"` → 60,267 rows
3. Remove imputed `size_sqm_is_imputed == "yes"` → 55,354 rows (final training set)
   - house: 28,977
   - apartment: 26,377
- price (training subset, ETB): median 8,200,000
- Missing (training subset): num_bedrooms 10,112 · num_bathrooms 14,747 · subcity 2,573 · lat/lng 2,568

## Why "for sale residential only"
- For-sale and for-rent prices live on completely different scales — a single model would be meaningless.
- Land / commercial / building have different valuation logic — mixing them corrupts the regression.
- The resulting model answers one clear question:
  "Predict the sale price of an Addis Ababa apartment or house in ETB."

## Model training summary (from `ml-service/models/model_meta.json`)
- Training rows: 55,354
- Test split: 20% (random_state=42)
- Target transform: log1p
- Candidates trained:
  - RandomForest (n_estimators=100, min_samples_leaf=5, max_depth=20):
    MAE 3,010,437 ETB · RMSE 5,643,634 ETB · R² 0.8124
  - GradientBoosting (default): MAE 3,706,818 ETB · RMSE 6,329,092 ETB · R² 0.7412
- Selected: **RandomForest** (highest held-out R²)
- Model size: 52,572,384 bytes (52.5 MB)
- Trained at: 2026-10-23T16:25:35 UTC

## Known limitations
- Predictions are ETB sale-price estimates, not certified valuations.
- Model inherits bias from the source listings (asking price, not final transaction price).
- Predictions outside the 2017–2024 subcity/price range observed in training may be unreliable.
- Apartment/house only. Do not use for land, commercial, or rental prediction.
- Features `num_bedrooms` / `num_bathrooms` are frequently missing in training data; the pipeline imputes them with the median. Predictions are therefore less certain for very small or very large homes.
- No spatial model (kriging/geo features beyond coordinates and 3 landmark distances); neighborhood effects beyond `subcity` are not fully captured.

## License
The Zenodo record is open access. The exact license is recorded on the Zenodo landing page; this project uses the data for educational, non-commercial work only, and `data/raw/` is gitignored so the CSV is not redistributed.

## Metrics policy
All evaluation metrics on this page were computed by running `ml-service/train_model.py` against the actual dataset. No number is copied or estimated. To reproduce, re-run the trainer.
