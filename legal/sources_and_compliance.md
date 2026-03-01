# Phase A & G: Sources Research & Legal Compliance Summary
**Context**: 10,000+ data points requiring ≥5 years of historical Indian real estate transaction data.

## 1. Candidate Sources & Feasibility Matrix

| Source | Type | Accessibility | TOS Constraints | Freshness & Coverage | Feasibility & Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MahaRERA Website** | Government (Maharashtra) | Public (Web Search) | Strict against automated scraping without permission | High for new builds, poor for resales | **Medium**. High legal risk for mass scraping. Requires headless browsers to bypass CAPTCHA. Better to pursue data-sharing MoU. |
| **IGR Maharashtra (IgrMaharashtra.gov)** | Gov Land Registry | Public/Login | Scraping expressly forbidden; severe blockades | Extremely high (actual transaction value) | **Low**. Excellent data but aggressive protections. Best accessed via certified third-party aggregators (Zapkey). |
| **99acres / MagicBricks** | Commercial Portals | Paid APIs / Public Web | TOS strictly forbids web scraping | High listing volume, historical trends weak (prices are asking, not transacted) | **Medium**. Direct scraping violates TOS and leads to IP bans. Paid commercial API partnership recommended. |
| **Zapkey / Propstack** | Commercial Aggregators | Paid APIs | Permitted via B2B licensing | Very High (cleaned registry data) | **Very High**. Primary recommended source for 10k+ true transaction datapoints. Expensive but completely legal. |
| **Housing.com Data API** | Commercial Portal | Paid API | B2B Agreement | High | **High**. Good for pricing indices and general sentiment. |

## 2. Selected Approach & Alternative Dataset Proposal

**Primary Decision**: Scraping 10,000 historical points continuously from commercial portals directly violates their Terms of Service (TOS) and runs afoul of the Computer Fraud and Abuse Act (or IT Act 2000 in India). 

**Fallback Execution Activated**: We are proposing a **Data Partnership Template** (see section 4) to negotiate access with Zapkey for physical registry data.
For immediate ML model development and validation, we have generated an **Alternative Synthetic Dataset** mimicking 5-year transaction logs for the Mira Road micro-market. This guarantees compliance, allows pipeline development matching the exact target schema (10,000+ rows), and prevents pipeline blockage.

## 3. PII & Privacy Handling (Phase G Compliance)
- **Buyer Mapping**: All institutional and individual buyer names must be hashed using SHA-256 before entering the data warehouse.
- **Micro-location**: GPS coordinates will be fuzzed by ~50 meters to prevent exact door-id triangulation.

## 4. Data Partnership Outreach Template
**To:** partnerships@zapkey.com / api@propstack.com  
**Subject:** B2B API Access Request - Historical Transaction Data for Pricing ML Model  
**Body:**  
*Hello [Name],*  
*Our firm is developing an advanced machine learning pipeline to forecast property valuations across Maharashtra. We are looking to license historical transaction data (specifically targeting 10,000+ records over the past 5 years for the Mira-Bhayandar micro-market).*  
*We require the following schema: Date of transaction, Transacted Price, Square Footage, Building Info, and Floor. We would prefer to ingest this via a REST API or scheduled S3 CSV dumps.*  
*Please connect us with your sales engineering team to discuss licensing tiers.*
