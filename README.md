# Real Estate Platform - Data Collection

## Overview
This project includes a data scraper for collecting property rates from Mira Road, Mumbai. The scraper attempts to fetch real data from 99acres.com and falls back to generating realistic synthetic data if scraping fails.

## Generated Data Files

### Current Listings
- **File**: `data/mira_road_properties_20260127_235341.csv`
- **Records**: 50 property listings
- **Columns**:
  - `area_name`: Society/locality name
  - `zone`: Geographic zone (Mira Road East/West, Mira Bhayandar, Kashimira)
  - `property_type`: Residential
  - `rate_per_sqft`: Price per square foot (₹)
  - `appreciation_5yr`: 5-year appreciation percentage
  - `rental_yield`: Annual rental yield percentage
  - `data_source`: synthetic

### Historical Price Data
- **File**: `data/mira_road_historical_20260127_235341.csv`
- **Records**: 110 historical price points
- **Coverage**: 5 years of data (2021-2026), sampled every 6 months
- **Societies**: 10 major societies with historical trends

## Scraper Script

### File: `scraper_mira_road.py`

The scraper uses:
- **HTTP Requests** (no GUI browser required)
- **BeautifulSoup** for HTML parsing
- **Browser-like headers** to mimic real traffic
- **Automatic fallback** to synthetic data generation

### Running the Scraper

```bash
python scraper_mira_road.py
```

### Current Status
- ✅ Scraper implemented with improved headers
- ⚠️ 99acres.com is blocking/timing out automated requests
- ✅ Synthetic data generated successfully as fallback

## Data Characteristics

### Price Ranges (₹/sqft)
- **Mira Road East**: 6,500 - 9,500
- **Mira Road West**: 7,000 - 10,500
- **Mira Bhayandar**: 6,000 - 9,000
- **Kashimira**: 6,000 - 9,000

### Appreciation Rates
- Range: 15% - 45% over 5 years
- Realistic market variation included

### Rental Yields
- Range: 2.5% - 4.5% annually
- Varies by zone and property type

## Next Steps

1. **Web Application Development**
   - Initialize Next.js project
   - Set up database (Prisma + SQLite)
   - Import generated CSV data
   - Build user authentication
   - Implement listing management
   - Add bidding system

2. **Optional: Real Data Collection**
   - User can manually collect data from 99acres
   - Or use the scraper with proxy/VPN if needed
   - Replace synthetic data with real data

## Notes

- The synthetic data is realistic and suitable for development/testing
- Historical price trends are calculated using compound appreciation
- Data can be easily replaced with real scraped data later
