# %% [markdown]
# # Phase C: Feature Engineering & Data Prep
# 
# This notebook handles cleaning the synthetic/raw data, generating time-series 
# representations, lag features, and preparing the matrix for model ingestion.

# %%
import pandas as pd
import numpy as np
from datetime import datetime

# %% [markdown]
# ### Load Cleaned Data
# Note: For production, we load from S3. Here we load our Phase B local artifact.
# %%
df = pd.read_csv('data/clean_dataset.csv')
df['transaction_date'] = pd.to_datetime(df['transaction_date'])
df.sort_values('transaction_date', inplace=True)

# %% [markdown]
# ### Core Feature Engineering
# %%
# 1. Time Features
df['year'] = df['transaction_date'].dt.year
df['month'] = df['transaction_date'].dt.month
df['quarter'] = df['transaction_date'].dt.quarter

# 2. Locality Rolling Trends (Historical Moving Average)
# Grouping by locality and calculating 6-month expanding windows
locality_monthly = df.set_index('transaction_date').groupby([pd.Grouper(freq='M'), 'locality'])['price_per_sqft'].mean().reset_index()
locality_monthly.rename(columns={'price_per_sqft': 'locality_month_avg'}, inplace=True)

# Merge back via nearest month
df['year_month'] = df['transaction_date'].dt.to_period('M')
locality_monthly['year_month'] = locality_monthly['transaction_date'].dt.to_period('M')

df = df.merge(locality_monthly[['year_month', 'locality', 'locality_month_avg']], on=['year_month', 'locality'], how='left')

# 3. Micro-Market Premium Feature
df['micro_market_premium'] = df['price_per_sqft'] / df['locality_month_avg']

# 4. Categorical Encoding (One Hot)
features_df = pd.get_dummies(df, columns=['locality', 'property_type', 'sale_type', 'buyer_type'])

# %% [markdown]
# ### Validation & Train Split (Time-Aware)
# Using sliding window: Train = 2019-2022, Val = 2023, Test = 2024
# %%
train = features_df[features_df['year'] <= 2022]
val = features_df[features_df['year'] == 2023]
test = features_df[features_df['year'] >= 2024]

print(f"Train size: {len(train)}, Val size: {len(val)}, Test size: {len(test)}")

train.to_csv('data/train_features.csv', index=False)
val.to_csv('data/val_features.csv', index=False)
test.to_csv('data/test_features.csv', index=False)
print("Pipeline complete: Feature matrix saved.")
