# BidMetric ML Prediction API V1

**Base URL**: `https://api.bidmetric.app/v1/ml`  
**Authentication**: Bearer Token required.

---

## 1. 5-Year Property Pricing Forecast

**Endpoint**: `/predict/horizon`  
**Method**: `POST`  
**Description**: Takes structured micro and macro features of a property and outputs a multi-year price forecast along with probabilistic confidence intervals (P10 to P90) and top contributing SHAP values.

### Request Body (JSON)

```json
{
  "property": {
    "locality": "Mira Road",
    "property_type": "Flat",
    "sale_type": "Resale",
    "area_sqft": 1050,
    "bedrooms": 3,
    "bathrooms": 3,
    "builder_rating": 85,
    "infrastructure_score": 7
  },
  "macro": {
    "forecast_horizon_years": 5,
    "current_repo_rate": 6.5,
    "assumed_yearly_inflation": 0.05
  }
}
```

### Response (JSON)

```json
{
  "request_id": "req_8x7d6f5s4a",
  "status": "success",
  "baseline_current_value_inr": 8250000,
  "confidence_interval": {
    "lower_bound_p10": 7900000,
    "upper_bound_p90": 8600000
  },
  "forecast_trajectory": [
    { "year": 2025, "expected_value": 8740000, "yoy_growth_pct": 5.9 },
    { "year": 2026, "expected_value": 9260000, "yoy_growth_pct": 5.9 },
    { "year": 2027, "expected_value": 9800000, "yoy_growth_pct": 5.8 },
    { "year": 2028, "expected_value": 10380000, "yoy_growth_pct": 5.9 },
    { "year": 2029, "expected_value": 11000000, "yoy_growth_pct": 5.9 }
  ],
  "explainability": {
    "model_type": "XGBRegressor_Quantile",
    "top_5_driving_factors": [
      { "feature": "locality_month_avg", "impact_direction": "positive", "shap_value": "+12.4%" },
      { "feature": "infrastructure_score", "impact_direction": "positive", "shap_value": "+4.1%" },
      { "feature": "area_sqft", "impact_direction": "positive", "shap_value": "+2.2%" },
      { "feature": "builder_rating", "impact_direction": "positive", "shap_value": "+1.8%" },
      { "feature": "macro_repo_rate", "impact_direction": "negative", "shap_value": "-1.5%" }
    ]
  },
  "warnings": []
}
```

### Error Handling
- `400 Bad Request`: Missing mandatory feature (e.g., `locality` or `area_sqft`).
- `401 Unauthorized`: Invalid Bearer Token.
- `422 Unprocessable Entity`: Feature variable bounds exceeded (e.g., `area_sqft` > 50000).
- `503 Service Unavailable`: Feature matrix compilation timeouts.
