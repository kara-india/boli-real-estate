# Boli Real Estate Platform - Sprint Deliverables

## 1. Updated Property Detail UI (Implemented)
- **Theme**: Transformed from Dark Violet to **White + Gold** (Premium Aesthetic).
- **Layout**: New 3-column desklop / stacked mobile layout.
- **Features**:
  - **Tabs**: "Valuation Breakdown" and "Builder Confidence" side-by-side.
  - **Slider**: Smart bidding slider bounded by ±5% (or ±10% server limit).
  - **Motivated Seller**: Red urgency badge with countdown for specific properties.
  - **5-Year Forecast**: Interactive chart showing HPI-based predictions.

## 2. Backend Valuation Pipeline (Implemented)
The valuation logic is centralized in `src/lib/bidmetric-valuation-engine.ts`.
**Pipeline Steps:**
1.  **Ingest**: Market trends (`market_trends` table) and property specifics.
2.  **Compute**:
    -   Base Price = `localityAvgPricePerSqft * sqft`
    -   Builder Adjustment = `base * (confidence_multiplier - 1)`
    -   Infra/Project Boosts = `base * boost_factor`
3.  **Output**: `BidMetricPrice`, `ConfidenceInterval`, `TopFactors`.
4.  **Storage**: Stored in `properties` table (`bidmetric_price`, `valuation_last_updated`) for static reference.

## 3. Database Schema (Migration 008)
Executed via `src/lib/supabase/migrations/008_full_schema_update.sql`.
**Key Tables**:
-   `properties`: Stores listing + static valuation + builder score.
-   `builder_profiles`: Stores detailed builder stats (RERA, delivery rate).
-   `bids`: Stores user bids.
-   `transaction_audit_logs`: Immutable log of bid lifecycle.

## 4. API Contract (Key Endpoints)

### GET /api/properties/{id}
Returns full property details including valuation.
```json
{
  "id": "uuid",
  "title": "2 BHK...",
  "price": 8500000,
  "bidmetric_price": 8000000,
  "slider_bounds": { "lower": -5.0, "upper": 5.0 },
  "builder_confidence": { "score": 85, "level": "High" },
  "owner_timer_expiry": "2026-04-01T..."
}
```

### POST /api/properties/{id}/bids
Place a bid.
**Payload**: `{ "amount": 8100000 }`
**Response**: `{ "success": true, "bid_id": "uuid" }`
**Validation**: Server rejects bids outside ±10% of BidMetric price.

## 5. Seed Dataset (Sample)
12 properties seeded. Example JSON:
```json
[
  {
    "id": "d005d853-...",
    "title": "2 BHK Luxury Apartment, Whitefield",
    "owner_price": 8500000,
    "bidmetric_price": 8000000,
    "builder_confidence_score": 85
  },
  {
    "id": "2c3b0ca6-...",
    "title": "3 BHK Spacious Flat, Dwarka",
    "owner_price": 14000000,
    "bidmetric_price": 15000000,
    "owner_timer_expiry": "2026-04-16T...",
    "note": "Motivated Seller (Undervalued)"
  }
]
```

## 6. Legal & Data Strategy
-   **Scraping Ethics**: 
    -   Strict adherence to `robots.txt`.
    -   Rate limiting (max 1 req/sec).
    -   User-Agent identification.
    -   Only scrape public facts (price, location), not creative content (descriptions/images) where possible.
-   **Data Partners**: Recommended to partner with Liases Foras or PropStack for verified transaction data in India.

## 7. Ethical AI Notes
-   **Humane Messaging**: "Motivated Seller" instead of "Distress Sale".
-   **Transparency**: Always show "BidMetric derived from..." methodology.
-   **Badges**: Red color used only for negative *value* impacts, not to shame sellers.

## 8. Test Cases (Verified)
-   [x] **Build**: `npm run build` passes with 0 errors.
-   [x] **Seeding**: 12 properties exist in DB.
-   [x] **Valuation**: BidMetric price is distinct from Owner Price.
-   [x] **Security**: RLS enabled, Functions secured.
-   [x] **UI**: White theme applied, interactive components work.

