
import requests
import random
import re
import json
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Inspector")

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
        'Upgrade-Insecure-Requests': '1',
    })
    return session

def inspect_url(url):
    session = create_session()
    logger.info(f"Fetching {url}...")
    try:
        response = session.get(url, timeout=15)
        response.raise_for_status()
        
        # Save raw HTML
        with open("page_dump.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        logger.info(f"Saved HTML to page_dump.html ({len(response.text)} bytes)")
        
        # 1. Look for __NEXT_DATA__
        next_data = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', response.text)
        if next_data:
            logger.info("Found __NEXT_DATA__ script!")
            data = json.loads(next_data.group(1))
            with open("next_data_dump.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            logger.info("Saved __NEXT_DATA__ content to next_data_dump.json")
            
            # Brief inspection of the JSON structure for relevant keys
            inspect_json_keys(data)
            
        else:
            logger.info("No __NEXT_DATA__ found. Checking for other JSON blobs...")
            # Look for other potential data variables
            matches = re.findall(r'window\.reactInitialState\s*=\s*({.*?});', response.text, re.DOTALL)
            if matches:
                 with open("react_state_dump.json", "w", encoding="utf-8") as f:
                    f.write(matches[0])
                 logger.info("Found and saved window.reactInitialState")

    except Exception as e:
        logger.error(f"Error: {e}")

def inspect_json_keys(data):
    """Recursively search for 'price', 'rates', or 'trends' in keys to help the user"""
    def search_dict(d, path=""):
        if isinstance(d, dict):
            for k, v in d.items():
                if any(x in k.lower() for x in ['nearby', 'localities', 'price', 'trend']):
                    logger.info(f"Key found: {path}.{k} (Type: {type(v).__name__})")
                
                # specific checks for expected structure
                if k == "props" and isinstance(v, dict):
                    search_dict(v, path + ".props")
                elif k == "pageProps" and isinstance(v, dict):
                    search_dict(v, path + ".pageProps")
                    
    search_dict(data)

if __name__ == "__main__":
    TARGET_URL = "https://www.99acres.com/property-rates-and-price-trends-in-mira-bhayandar-prffid?" 
    inspect_url(TARGET_URL)
