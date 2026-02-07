#!/usr/bin/env python3
"""
99acres Mira Road Property Data Scraper
Uses HTTP requests + BeautifulSoup (no GUI browser required)
"""

import os
import re
import time
import json
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("MiraRoadScraper")


# ==============================
# SECTION B: Configuration
# ==============================
# Note: 99acres might not have a dedicated "Mira Road" rates page
# We'll try multiple URLs and fall back to synthetic data if needed
# Try a simpler approach - just use Mumbai rates page which is more likely to exist
POSSIBLE_URLS = [
    "https://www.99acres.com/property-rates-and-price-trends-in-mumbai-ffid",
]

DATA_DIR = "data"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]


# ==============================
# SECTION C: HTTP Session Setup
# ==============================
def create_session() -> requests.Session:
    """Create a requests session with retry logic and browser-like headers"""
    session = requests.Session()
    
    # Shorter retry strategy
    retry_strategy = Retry(
        total=1,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # More complete browser-like headers
    session.headers.update({
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
    })
    
    return session


# ==============================
# SECTION D: Data Parsing Helpers
# ==============================
RUPEE_RATE_RE = re.compile(r"₹\s*([\d,]+)\s*/\s*sq\.?\s*ft", re.IGNORECASE)
APPR_5Y_RE = re.compile(r"([+-]?\d+(?:\.\d+)?)%\s*in\s*5Y", re.IGNORECASE)
YIELD_RE = re.compile(r"Rental\s*Yield.*?(\d+(?:\.\d+)?)\s*%|^(\d+(?:\.\d+)?)\s*%$", re.IGNORECASE | re.MULTILINE)
DIST_RE = re.compile(r"([\d\.]+)\s*(km|m)", re.IGNORECASE)


def parse_rate(text: str) -> Optional[int]:
    """Extract rate per sqft from text"""
    m = RUPEE_RATE_RE.search(text)
    if not m:
        return None
    try:
        return int(m.group(1).replace(",", ""))
    except:
        return None


def parse_appreciation(text: str) -> Optional[float]:
    """Extract 5-year appreciation percentage"""
    m = APPR_5Y_RE.search(text)
    if not m:
        return None
    try:
        return float(m.group(1))
    except:
        return None


def parse_rental_yield(text: str) -> Optional[float]:
    """Extract rental yield percentage"""
    m = YIELD_RE.search(text)
    if not m:
        return None
    val = m.group(1) or m.group(2)
    try:
        return float(val)
    except:
        return None


def determine_zone(name: str) -> str:
    """Determine zone/area from locality name"""
    mapping = {
        'mira road': 'Mira Road',
        'bhayandar': 'Mira Bhayandar',
        'dahisar': 'Mumbai North',
        'borivali': 'Mumbai North',
        'kandivali': 'Mumbai North',
        'malad': 'Mumbai North',
        'goregaon': 'Mumbai North',
        'andheri': 'Mumbai West',
        'bandra': 'Mumbai West',
        'vasai': 'Vasai Virar',
        'virar': 'Vasai Virar',
        'naigaon': 'Vasai Virar'
    }
    
    name_lower = (name or "").lower()
    for key, zone in mapping.items():
        if key in name_lower:
            return zone
    
    return "Mira Road & Beyond"


# ==============================
# SECTION E: Synthetic Data Generation
# ==============================
def generate_synthetic_data(num_records: int = 50) -> tuple:
    """
    Generate synthetic property data for Mira Road
    This is used as fallback if scraping fails
    """
    logger.info("Generating synthetic data for Mira Road...")
    
    societies = [
        "Rustomjee Urbania", "Kanakia Paris", "Runwal Gardens", "Lodha Splendora",
        "Acme Ozone", "Evershine Millennium Paradise", "Sheth Vasant Oasis",
        "Poonam Sagar", "Beverly Park", "Golden Nest", "Silver Park",
        "Maxus Mall Residency", "Haware Citi", "Shree Krishna Towers",
        "Sai Sarang", "Sheetal Tapovan", "Gundecha Valley", "Thakur Village"
    ]
    
    zones = ["Mira Road East", "Mira Road West", "Mira Bhayandar", "Kashimira"]
    
    data = []
    
    for i in range(num_records):
        society = random.choice(societies)
        zone = random.choice(zones)
        
        # Base rate varies by zone
        if "East" in zone:
            base_rate = random.randint(6500, 9500)
        elif "West" in zone:
            base_rate = random.randint(7000, 10500)
        else:
            base_rate = random.randint(6000, 9000)
        
        appreciation = round(random.uniform(15.0, 45.0), 1)
        rental_yield = round(random.uniform(2.5, 4.5), 2)
        
        data.append({
            "area_name": society,
            "zone": zone,
            "property_type": "Residential",
            "rate_per_sqft": base_rate,
            "appreciation_5yr": appreciation,
            "rental_yield": rental_yield,
            "data_source": "synthetic"
        })
    
    # Generate historical price data
    historical_data = []
    for record in data[:10]:  # Generate historical for first 10 societies
        current_rate = record["rate_per_sqft"]
        appreciation_rate = record["appreciation_5yr"] / 100 / 5  # Annual rate
        
        for months_ago in range(0, 61, 6):  # 5 years, every 6 months
            date = datetime.now() - timedelta(days=months_ago * 30)
            years_back = months_ago / 12
            
            # Calculate historical rate
            historical_rate = int(current_rate / ((1 + appreciation_rate) ** years_back))
            
            historical_data.append({
                "area_name": record["area_name"],
                "zone": record["zone"],
                "date": date.strftime("%Y-%m-%d"),
                "rate_per_sqft": historical_rate,
                "data_source": "synthetic_historical"
            })
    
    return data, historical_data


# ==============================
# SECTION F: Web Scraping (HTTP)
# ==============================
def scrape_99acres(session: requests.Session) -> Optional[List[Dict]]:
    """
    Attempt to scrape 99acres using HTTP requests
    Returns None if scraping fails (will fall back to synthetic data)
    """
    
    for url in POSSIBLE_URLS:
        try:
            logger.info(f"Attempting to fetch: {url}")
            # Shorter timeout - fail fast
            response = session.get(url, timeout=5)
            
            if response.status_code == 404:
                logger.warning(f"URL not found: {url}")
                continue
            
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to find property rate cards
            # 99acres uses various class names, we'll try multiple selectors
            cards = soup.find_all(['div', 'section'], class_=re.compile(r'(tuple|card|locality|area)', re.I))
            
            if not cards:
                logger.warning(f"No property cards found on {url}")
                continue
            
            data = []
            for card in cards:
                text = card.get_text(separator=' ', strip=True)
                
                # Must contain rate information
                if 'Rate on 99acres' not in text and '₹' not in text:
                    continue
                
                # Extract area name (usually in a heading or link)
                area_name = None
                for tag in ['h2', 'h3', 'a']:
                    elem = card.find(tag, class_=re.compile(r'(header|title|name)', re.I))
                    if elem:
                        area_name = elem.get_text(strip=True)
                        break
                
                if not area_name or len(area_name) > 100:
                    continue
                
                # Parse metrics
                rate = parse_rate(text)
                appreciation = parse_appreciation(text)
                rental_yield = parse_rental_yield(text)
                
                if not rate:  # Rate is mandatory
                    continue
                
                zone = determine_zone(area_name)
                
                data.append({
                    "area_name": area_name,
                    "zone": zone,
                    "property_type": "Residential",
                    "rate_per_sqft": rate,
                    "appreciation_5yr": appreciation,
                    "rental_yield": rental_yield,
                    "data_source": "99acres_scraped"
                })
            
            if data:
                logger.info(f"Successfully scraped {len(data)} records from {url}")
                return data
            
        except requests.RequestException as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            continue
        except Exception as e:
            logger.error(f"Error parsing {url}: {e}")
            continue
    
    logger.warning("All scraping attempts failed")
    return None


# ==============================
# SECTION F.2: Trend Extraction (FAQ-based)
# ==============================
def parse_faq_trends(html_text: str, area_name: str) -> List[Dict]:
    """
    Extract historical trends from the FAQ section text
    99acres embeds this in text like:
    "Property prices in X have moved: 5.3 % since 1 year 15.2 % since 3 year..."
    """
    data_points = []
    
    # 1. Get Current Rate
    rate_match = re.search(r"average flat rates in .*? is ₹ ([\d,]+) per sq ft", html_text, re.IGNORECASE)
    if not rate_match:
        return []
        
    current_rate = int(rate_match.group(1).replace(",", ""))
    
    # Add Current Year (approx)
    data_points.append({
        "locality": area_name,
        "year": 2025,
        "price_per_sqft": current_rate,
        "source": "99acres_faq_current"
    })
    
    # 2. Get Historical Percentages
    # Pattern: "5.3 % since 1 year 15.2 % since 3 year 25.1 % since 5 year"
    trend_match = re.search(r"moved:\s*([\d\.]+)\s*%\s*since\s*1\s*year\s*([\d\.]+)\s*%\s*since\s*3\s*year\s*([\d\.]+)\s*%\s*since\s*5\s*year", html_text, re.IGNORECASE)
    
    if trend_match:
        p1 = float(trend_match.group(1))
        p3 = float(trend_match.group(2))
        p5 = float(trend_match.group(3))
        
        # Calculate historical prices
        price_1y = int(current_rate / (1 + p1/100))
        price_3y = int(current_rate / (1 + p3/100))
        price_5y = int(current_rate / (1 + p5/100))
        
        data_points.append({"locality": area_name, "year": 2024, "price_per_sqft": price_1y, "source": "99acres_faq_derived"})
        data_points.append({"locality": area_name, "year": 2022, "price_per_sqft": price_3y, "source": "99acres_faq_derived"})
        data_points.append({"locality": area_name, "year": 2020, "price_per_sqft": price_5y, "source": "99acres_faq_derived"})
        
    return data_points

def scrape_historical_trends(session: requests.Session) -> List[Dict]:
    """
    Visit specific locality pages to extract trend data from FAQs
    """
    target_urls = [
        ("Mira Road", "https://www.99acres.com/property-rates-and-price-trends-in-mira-road-mira-bhayandar-prffid"),
        ("Mira Road East", "https://www.99acres.com/property-rates-and-price-trends-in-mira-road-east-mira-bhayandar-prffid"),
        ("Bhayandar West", "https://www.99acres.com/property-rates-and-price-trends-in-bhayandar-west-mira-bhayandar-prffid"),
    ]
    
    all_trends = []
    
    for name, url in target_urls:
        try:
            logger.info(f"Fetching trends for {name}...")
            # Use a specialized header or retry here if needed
            response = session.get(url, timeout=10)
            if response.status_code == 200:
                points = parse_faq_trends(response.text, name)
                if points:
                    logger.info(f"Found {len(points)} data points for {name}")
                    all_trends.extend(points)
                else:
                    logger.warning(f"No trend data found in FAQ for {name}")
            else:
                logger.warning(f"Failed to fetch {url}: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error scraping trends for {name}: {e}")
            
    return all_trends


# ==============================
# SECTION G: Data Export
# ==============================
def save_to_csv(data: List[Dict], filename_prefix: str = "mira_road_properties"):
    """Save data to CSV file"""
    if not data:
        logger.warning("No data to save")
        return None
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    df = pd.DataFrame(data)
    
    # Reorder columns
    base_cols = ["area_name", "zone", "property_type", "rate_per_sqft", "appreciation_5yr", "rental_yield"]
    existing = df.columns.tolist()
    ordered = [c for c in base_cols if c in existing] + [c for c in existing if c not in base_cols]
    df = df.reindex(columns=ordered)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(DATA_DIR, f"{filename_prefix}_{timestamp}.csv")
    
    df.to_csv(filepath, index=False)
    logger.info(f"Saved {len(df)} records to {filepath}")
    
    return filepath


# ==============================
# SECTION H: Main Orchestration
# ==============================
def main():
    """Main execution function"""
    logger.info("Starting Mira Road property data collection...")
    
    session = create_session()
    
    # 1. Scrape Current Listings
    scraped_listings = scrape_99acres(session)
    current_data = None
    
    if scraped_listings and len(scraped_listings) >= 5:
        logger.info(f"Using scraped listings ({len(scraped_listings)} records)")
        current_data = scraped_listings
    else:
        logger.info("Listing scraping failed/insufficient. Generating synthetic listings...")
        current_data, _ = generate_synthetic_data(num_records=50) # Ignore synthetic historical for now
    
    # 2. Scrape Historical Trends
    real_historical_data = scrape_historical_trends(session)
    historical_data = None
    
    if real_historical_data:
        logger.info(f"Using scraped historical trends ({len(real_historical_data)} points)")
        historical_data = real_historical_data
    else:
        logger.info("Trend scraping failed. Generating synthetic historical data...")
        _, historical_data = generate_synthetic_data(num_records=10) # Re-use generator for history
        
    # 3. Save Data
    current_file = save_to_csv(current_data, "mira_road_properties")
    
    if historical_data:
        historical_file = save_to_csv(historical_data, "mira_road_historical")
        logger.info(f"Historical data saved to {historical_file}")
    
    logger.info("✅ Data collection completed successfully")
    return current_data


if __name__ == "__main__":
    main()
