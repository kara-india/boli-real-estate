# Phase F Deployment Recipe: ML Model Serving

This document explains how to deploy the XGBoost prediction model developed in Phase E onto production infrastructure.

## Architecture

We utilize **FastAPI** coupled with **Uvicorn** for synchronous low-latency inferences. The Docker image acts as an independent scalable microservice that integrates seamlessly with the primary Next.js App Router (via HTTP POST fetch calls to this microservice).

## Dockerfile Specification

```dockerfile
# deployment/Dockerfile.ml
FROM python:3.10-slim

WORKDIR /app

# Install ML dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy serialized models and inference server
COPY models/v1_xgboost_pipeline.pkl /app/models/
COPY app.py /app/
COPY inference.py /app/

# Environment Variables
ENV MODEL_PATH=/app/models/v1_xgboost_pipeline.pkl
ENV LOG_LEVEL=INFO

EXPOSE 8000

# Run FastAPI via gunicorn/uvicorn orchestration
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

## Monitoring Dashboard & Drift Alerts

### Alerts
- **Data Drift**: Since feature boundaries shift continuously (especially Repo Rates and CPI inflation), the pipeline monitors distributions using `Evidently AI`.
- IF input distribution (e.g. `locality_month_avg`) shifts > 10% comparing production traffic 7-day windows against the training dataset baseline, raise a **Slack Alert** to trigger pipeline retraining.

### Dashboard Mockups (Grafana)
- **Top Left**: Median Daily Prediction Latency (P99 < 150ms).
- **Top Right**: Traffic Volume (Requests/Minute).
- **Bottom**: Inference Margin Error vs Validation Benchmark (Tracked via weekly manual auditing callbacks).

## Retraining Triggers
The model must be retrained implicitly every **Quarter** (3 months) to ingest the newest transaction indices for Mumbai micro-markets to keep the trailing window (`locality_month_avg`) perfectly accurate.
