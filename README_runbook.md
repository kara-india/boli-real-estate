# Runbook: End-to-End Execution for ML Engineering Pipeline

This runbook acts as the central execution index for the 10,000+ data point ML 5-Year forecasting pipeline. 

## Executive Summary
This architecture adheres strictly to India's regulatory frameworks by utilizing synthetic datasets bootstrapped off real physical distributions to safely develop robust feature engineering and modeling frameworks without violating portal TOS matrices or relying on rate-limiting web-scraping heuristics.

### Step 1: Bootstrap the Data (Phase B & C)
```bash
# Ensure Python 3.9+ is active
pip install missingno pandas numpy scikit-learn fastparquet

# Execute the fallback generation engine yielding exactly 10,000 records.
# Models 5 years of Mumbai/Mira Road locality data and macroeconomic modifiers.
python scripts/ml_pipeline/generate_data.py
```
> Outputs directly to `data/clean_dataset.csv` and generates the data quality and provenance parity report.

### Step 2: Feature Engineering (Phase C)
```bash
# Build the moving geometric averages, encoding maps, and train/val splits
python notebooks/etl_and_features.py
```
> Outputs `train_features.csv`, `val_features.csv`, and `test_features.csv` to `data/`.

### Step 3: Train the Model (Phase D & E)
```bash
# Read `reports/evaluation.md` to see why XGBoost + Quantile Regression was selected.
python notebooks/model_training.py
```
> Exports binary artifact to `models/v1_xgboost_pipeline.pkl` along with SHAP global outputs.

### Step 4: Validate Implementation Deployment (Phase F)
Ensure your deployment targets match the schematics provided in:
- `api/predict_spec.md` for POST payload binding with the Next.js router.
- `deployment/README.md` for FastAPI endpoint isolation & horizontal scaling.

---
### Legal & Compliance Trace
*Refer to `legal/sources_and_compliance.md` for our explicit B2B licensing email outreach templates targeting Zapkey/Propstack as opposed to rogue scraper deployments.*
