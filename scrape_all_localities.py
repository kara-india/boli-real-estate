
import requests
import re
import csv
import time
import random
import logging
from typing import List, Dict
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger("Scraper")

LOCALITIES = [
    "Shanti Park",
    "Bhayandar West",
    "Shanti Nagar",
    "Hatkesh Udhog Nagar",
    "Ramdev Park",
    "Kanakia Park", 
    "Beverly Park",
    "Chandan Shanti",
    "Vinay Nagar", 
    "Kashigaon",
    "Mira Road",
    "Mira Road East",
    "Miragaon",
    "Bhayandar",
    "Bhayandar East",
    "Poonam Gardens",
    "Poonam Sagar Complex",
    "Kashimira"
]

TOWN_NAME = "Mira Bhayandar"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

def create_session():
    session = requests.Session()
    retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update({
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    })
    return session

def get_url(locality):
    slug = locality.lower().replace(" ", "-")
    return f"https://www.99acres.com/property-rates-and-price-trends-in-{slug}-mira-bhayandar-prffid"

def parse_page(html, locality):
    data_rows = []
    
    # 1. Current Rate & Rental Yield (from text/FAQ)
    # Rate
    current_rate = 0
    rate_match = re.search(r"average flat rates in .*? is ₹ ([\d,]+) per sq ft", html, re.IGNORECASE)
    if rate_match:
        current_rate = int(rate_match.group(1).replace(",", ""))
    
    # Yield
    rental_yield = "NA"
    yield_match = re.search(r"average rental yield in .*? is ([\d\.]+)\s*%", html, re.IGNORECASE)
    if yield_match:
        rental_yield = f"{yield_match.group(1)}%"

    # 2. Historical Trends (from FAQ "moved: X% since...")
    # Pattern: "prices ... moved: 5.3 % since 1 year 15.2 % since 3 year 25.1 % since 5 year"
    trend_match = re.search(r"moved:\s*([\d\.\-]+)\s*%\s*since\s*1\s*year\s*([\d\.\-]+)\s*%\s*since\s*3\s*year\s*([\d\.\-]+)\s*%\s*since\s*5\s*year", html, re.IGNORECASE)
    
    # Base row for current year (2025)
    if current_rate > 0:
        data_rows.append({
            "town": TOWN_NAME,
            "locality": locality,
            "year": 2025,
            "price_per_sqft": current_rate,
            "appreciation": "0%", # Baseline
            "rental_yield": rental_yield,
            "current_rate": current_rate
        })
        
        if trend_match:
            try:
                p1 = float(trend_match.group(1).replace("-", "-0")) # Handle negative if extracted
                p3 = float(trend_match.group(2).replace("-", "-0"))
                p5 = float(trend_match.group(3).replace("-", "-0"))
                
                # Formula: PastPrice = Current / (1 + p/100)
                price_2024 = int(current_rate / (1 + p1/100))
                price_2022 = int(current_rate / (1 + p3/100))
                price_2020 = int(current_rate / (1 + p5/100))
                
                data_rows.append({"town": TOWN_NAME, "locality": locality, "year": 2024, "price_per_sqft": price_2024, "appreciation": f"{p1}%", "rental_yield": rental_yield, "current_rate": current_rate})
                data_rows.append({"town": TOWN_NAME, "locality": locality, "year": 2022, "price_per_sqft": price_2022, "appreciation": f"{p3}%", "rental_yield": rental_yield, "current_rate": current_rate})
                data_rows.append({"town": TOWN_NAME, "locality": locality, "year": 2020, "price_per_sqft": price_2020, "appreciation": f"{p5}%", "rental_yield": rental_yield, "current_rate": current_rate})
            except Exception as e:
                logger.error(f"Error parsing percentages for {locality}: {e}")
                
    else:
        logger.warning(f"Could not find current rate for {locality}")

    return data_rows

def main():
    session = create_session()
    all_data = []
    
    for locality in LOCALITIES:
        url = get_url(locality)
        logger.info(f"Scraping {locality} ({url})...")
        try:
            r = session.get(url, timeout=10)
            if r.status_code == 200:
                rows = parse_page(r.text, locality)
                if rows:
                    all_data.extend(rows)
                    logger.info(f"  -> Extracted {len(rows)} rows")
                else:
                    logger.warning("  -> No data found")
            else:
                logger.warning(f"  -> Failed (Status {r.status_code})")
        except Exception as e:
            logger.error(f"  -> Error: {e}")
        
        time.sleep(1) # Polite delay
        
    # Save to CSV
    if all_data:
        columns = ["town", "locality", "year", "price_per_sqft", "appreciation", "rental_yield", "current_rate"]
        outfile = "data/mira_bhayandar_comprehensive.csv"
        with open(outfile, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=columns)
            writer.writeheader()
            writer.writerows(all_data)
        logger.info(f"Saved {len(all_data)} rows to {outfile}")
    else:
        logger.error("No data collected.")

if __name__ == "__main__":
    main()
