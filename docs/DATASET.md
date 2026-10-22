# Dataset Documentation — Ames Housing (Proof of Concept)

## Status
Proof-of-concept dataset. **NOT Ethiopian market data.**

## Source
- Original study: De Cock, D. (2011). "Ames, Iowa: Alternative to the Boston
  Housing Data as an End of Semester Regression Project." Journal of Statistics
  Education, 19(3).
- File used: `AmesHousing.csv` from the `AmesHousing` R package distribution,
  mirrored at:
  https://raw.githubusercontent.com/georgehagstrom/DATA622Spring2026/main/website/assignments/labs/labData/AmesHousing.csv
- Local path: `data/raw/ames_housing.csv`
- Download date: 2026-10-22 (Debian, `curl -L`)

## License
Educational use of the De Cock (2011) Ames Housing data. The original paper
permits free sharing among individuals but not republication without permission.
The `AmesHousing` R package lists GPL-2. This project uses the data strictly for
educational, non-commercial, proof-of-concept work and does not redistribute it
in the repository (`data/raw/` is gitignored).

## Market coverage
- Country: United States
- City: Ames, Iowa
- Period: sales recorded 2006–2010
- Currency: USD
- Target: `SalePrice` (total sale price in USD)

## Verified dataset facts (from the actual file)
- Rows: 2930
- Columns: 82
- Target column: `SalePrice` (dtype int64)
- Total missing values across the file: 15749
- Top columns by missing count:
  - Pool QC: 2917
  - Misc Feature: 2824
  - Alley: 2732
  - Fence: 2358
  - Mas Vnr Type: 1775
  - Fireplace Qu: 1422
  - Lot Frontage: 490
  - Garage Qual / Garage Yr Blt / Garage Cond: 159 each
- SalePrice summary (USD):
  - count: 2930
  - mean: 180796.06
  - std: 79886.69
  - min: 12789
  - 25%: 129500
  - 50%: 160000
  - 75%: 213500
  - max: 755000

## Known limitations
- Not representative of Addis Ababa or Ethiopian property prices.
- Data is from 2006–2010; market conditions have changed.
- Regression benchmark only; predictions from this model must not be presented
  as real Ethiopian valuations.
- Missing values are concentrated in a few categorical columns (Pool QC,
  Misc Feature, Alley, Fence) and will be handled explicitly in the pipeline.
- `SalePrice` is right-skewed (mean 180,796 > median 160,000); a log transform
  will be considered during training and justified by evaluation results.

## Metrics policy
All evaluation metrics (MAE, RMSE, R²) and any reported sample sizes will be
computed from actual training/evaluation runs and recorded here only after
they have been produced. No metric on this page is estimated or copied.

## Replacement path
If a legally usable Ethiopian/Addis Ababa dataset is obtained and documented,
this dataset will be replaced and every metric recomputed.
