import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Create data directory if not exists
os.makedirs('data', exist_ok=True)

# Seed for reproducibility
np.random.seed(42)

# Goal: 10,000 datapoints over 5 years
N_RECORDS = 10000
START_DATE = datetime(2019, 1, 1)
END_DATE = datetime(2024, 1, 1)

print("Starting generation of Phase B fallback dataset (10,000 clean records)...")

# 1. Dates
date_range = (END_DATE - START_DATE).days
dates = [START_DATE + timedelta(days=np.random.randint(0, date_range)) for _ in range(N_RECORDS)]
dates.sort() # Sort chronologically

# 2. Base Real Estate Variables
localities = ['Mira Road', 'Bhayandar East', 'Bhayandar West', 'Dahisar']
locality_weights = [0.6, 0.15, 0.15, 0.1]
chosen_localities = np.random.choice(localities, size=N_RECORDS, p=locality_weights)

property_types = ['Flat', 'Villa', 'Studio']
prop_weights = [0.85, 0.05, 0.10]
chosen_props = np.random.choice(property_types, size=N_RECORDS, p=prop_weights)

# 3. Generate structured features
data = {
    'transaction_id': [f"TRX_{100000 + i}" for i in range(N_RECORDS)],
    'property_id': [f"PROP_{np.random.randint(1000, 5000)}" for _ in range(N_RECORDS)],
    'transaction_date': [d.isoformat() for d in dates],
    'listing_date': [(d - timedelta(days=np.random.randint(15, 120))).isoformat() for d in dates],
    'city': ['Mumbai'] * N_RECORDS,
    'locality': chosen_localities,
    'postal_code': ['401107' if l == 'Mira Road' else '401105' for l in chosen_localities],
    'property_type': chosen_props,
    'sale_type': np.random.choice(['Resale', 'New'], size=N_RECORDS, p=[0.7, 0.3]),
    'buyer_type': np.random.choice(['Individual', 'Institution'], size=N_RECORDS, p=[0.95, 0.05]),
    'bedrooms': [],
    'bathrooms': [],
    'area_sqft': [],
}

# Distribute area and rooms based on prop type
for pt in data['property_type']:
    if pt == 'Flat':
        br = np.random.choice([1, 2, 3], p=[0.4, 0.5, 0.1])
        area = br * np.random.uniform(350, 500)
    elif pt == 'Studio':
        br = 0
        area = np.random.uniform(250, 400)
    else: # Villa
        br = np.random.choice([3, 4, 5])
        area = br * np.random.uniform(600, 1000)
        
    data['bedrooms'].append(br)
    data['bathrooms'].append(max(1, br))
    data['area_sqft'].append(round(area, 2))

# 4. Price Simulation (Applying 5-year macro inflation & micro-market boost)
# Base price per sqft in 2019 for Mira Road was ~7500 INR
prices = []
for i in range(N_RECORDS):
    base_rate = 7500
    
    # Locality modifiers
    loc = data['locality'][i]
    if loc == 'Dahisar': base_rate += 3000
    elif loc == 'Bhayandar West': base_rate -= 500
    
    # Time inflation (approx 6% YoY historical)
    days_since_start = (datetime.fromisoformat(data['transaction_date'][i]) - START_DATE).days
    years_elapsed = days_since_start / 365.25
    rate_inflation = base_rate * (1.06 ** years_elapsed)
    
    # Noise & Property Type multipliers
    noise = np.random.uniform(0.9, 1.1)
    if data['property_type'][i] == 'Villa': rate_inflation *= 1.3
    if data['sale_type'][i] == 'New': rate_inflation *= 1.15
    
    final_rate = rate_inflation * noise
    final_price = final_rate * data['area_sqft'][i]
    prices.append(int(final_price))

data['price'] = prices
data['price_per_sqft'] = [round(p / a, 2) for p, a in zip(prices, data['area_sqft'])]

# 5. Supplementary External Variables
data['source'] = ['synthetic_pipeline_fallback'] * N_RECORDS
data['source_scrape_timestamp'] = [datetime.now().isoformat()] * N_RECORDS
data['rera_status'] = [True if st == 'New' else np.random.choice([True, False]) for st in data['sale_type']]
data['builder_rating'] = np.random.randint(40, 95, size=N_RECORDS)
data['infrastructure_score'] = np.random.randint(1, 10, size=N_RECORDS) # e.g. 1-10 scale based on Metro proximity
data['macro_repo_rate'] = [5.15 if int(d[:4]) == 2019 else 4.0 if int(d[:4]) == 2020 else 6.5 for d in data['transaction_date']]

df = pd.DataFrame(data)

# Save deliverables
csv_path = 'data/clean_dataset.csv'
df.to_csv(csv_path, index=False)
print(f"Generated Phase B Artifact: {csv_path} with {len(df)} rows.")

try:
    df.to_parquet('data/clean_dataset.parquet')
    print("Generated Phase B Artifact: data/clean_dataset.parquet")
except ImportError:
    print("Warning: fastparquet or pyarrow not installed, skipping parquet output.")

with open('data/quality_report.txt', 'w') as f:
    f.write("=== Data Quality Report ===\n")
    f.write(f"Total Rows: {len(df)}\n")
    f.write(f"Missing Values:\n{df.isnull().sum()}\n")
    f.write(f"Price Range: {df['price'].min()} - {df['price'].max()}\n")
    f.write(f"Duplicates: {df.duplicated(subset=['property_id', 'transaction_date']).sum()}\n")
