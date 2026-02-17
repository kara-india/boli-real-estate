# Boli Real Estate Platform - V2 Implementation Plan

## Executive Summary
Complete overhaul implementing static valuation, ethical bidding constraints, and seller monetization features.

## Priority Execution Order

### ✅ CRITICAL - Backend Foundation
1. **Static Valuation Pipeline** - Precomputed BidMetric with confidence intervals
2. **Owner Price Validation** - Server-side ±10% enforcement
3. **Seed Dataset** - 12 realistic properties (9 normal, 2-3 motivated)
4. **Seller/Admin Dashboard** - Accept/Reject workflow for monetization

### ✅ HIGH - User-Facing Features
5. **Bid API + Slider Logic** - Constrained bidding with server validation
6. **Property Detail Layout** - Valuation + Builder Confidence tabs side-by-side
7. **5-Year Forecast Integration** - Adjacent to bid input

### ⚠️ MEDIUM - UX Polish
8. **UI Theme Change** - White + Gold (#D4AF37) color scheme
9. **Humanized Messaging** - Ethical countdown, tooltips, provenance
10. **Data Ingestion Plan** - Legal comps pipeline strategy

### 🔒 HIGH - Quality Assurance
11. **Acceptance Tests** - All criteria validated
12. **Security & Legal Review** - Data sourcing compliance

## Color Palette (NEW)
```css
:root {
  --bg: #FFFFFF;               /* White background */
  --text: #1F2937;             /* Dark charcoal */
  --gold: #D4AF37;             /* Primary gold accent */
  --gold-light: #CFA84B;       /* Light gold for gradients */
  --muted: #F5F3F0;            /* Warm grey */
  --danger: #DC2626;           /* Red for negatives */
  --success: #059669;          /* Green for positives */
  --amber: #F59E0B;            /* Medium confidence */
}
```

## Database Schema Changes

### Properties Table
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS
  original_listing_price NUMERIC NOT NULL,         -- Owner's asking price
  bidmetric_price NUMERIC NOT NULL,                -- Static AI valuation
  market_price NUMERIC NOT NULL,                   -- Base market rate
  last_sale_comparable_price NUMERIC,              -- Optional recent sale
  valuation_last_updated TIMESTAMP DEFAULT now(),
  confidence_interval NUMERIC,                     -- ±% margin
  owner_timer_expiry TIMESTAMP,                    -- Motivated sale deadline
  override_flag BOOLEAN DEFAULT false,             -- Admin override marker
  builder_confidence_score INTEGER,                -- 0-100
  slider_lower_bound NUMERIC,                      -- Precomputed -%
  slider_upper_bound NUMERIC;                      -- Precomputed +%
```

### Valuations Table (NEW)
```sql
CREATE TABLE valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  bidmetric_price NUMERIC NOT NULL,
  confidence_interval NUMERIC,
  top5_factors JSONB,                              -- [{factor, impact_percent}]
  valuation_timestamp TIMESTAMP DEFAULT now(),
  model_version VARCHAR(20)
);
```

### Bids Table (Enhanced)
```sql
ALTER TABLE bids ADD COLUMN IF NOT EXISTS
  status VARCHAR(20) DEFAULT 'placed',             -- placed/accepted/rejected/expired
  expires_at TIMESTAMP,                            -- Bid TTL
  accepted_at TIMESTAMP,
  soft_lock_until TIMESTAMP;                       -- 24hr hold for payment
```

### Audit Logs Table (NEW)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,                 -- bid_placed, bid_accepted, etc.
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  bid_id UUID REFERENCES bids(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

## API Contract

### GET /api/properties/{id}
**Response:**
```json
{
  "id": "string",
  "title": "string",
  "owner_price": 8500000,
  "bidmetric_price": 8000000,
  "market_price": 8050000,
  "last_sale_comparable_price": 7900000,
  "builder_confidence": {
    "score": 72,
    "label": "Medium",
    "factors": [
      {"name": "delivery_timeliness", "impact": 8},
      {"name": "rera_compliance", "impact": 5}
    ]
  },
  "slider_bounds": {
    "lower_percent": -3.75,
    "upper_percent": 5.00,
    "lower_absolute": 7700000,
    "upper_absolute": 8400000
  },
  "valuation": {
    "confidence_interval": 4.7,
    "top5_factors": [
      {"factor": "HPI Growth", "impact_percent": 12.5},
      {"factor": "Infrastructure Score", "impact_percent": 5.9}
    ],
    "last_updated": "2026-02-17T00:00:00Z"
  },
  "motivated_sale": {
    "is_motivated": false,
    "expires_in_days": null
  }
}
```

### POST /api/properties/{id}/bids
**Request:**
```json
{
  "user_id": "uuid",
  "bid_amount": 8200000
}
```

**Server Validation:**
1. Check bid_amount >= slider_lower_bound
2. Check bid_amount <= slider_upper_bound
3. Check bid_amount > current_highest_bid (if any)

**Response:**
```json
{
  "bid_id": "uuid",
  "status": "placed",
  "created_at": "2026-02-18T00:21:00Z",
  "expires_at": "2026-02-25T00:21:00Z"
}
```

### POST /api/bids/{bid_id}/accept
**Request:**
```json
{
  "seller_id": "uuid"
}
```

**Server Actions:**
1. Validate seller owns property
2. Set bid status = 'accepted'
3. Set soft_lock_until = now() + 24 hours
4. Create audit_log event
5. Trigger monetization_event webhook

**Response:**
```json
{
  "status": "accepted",
  "soft_lock_until": "2026-02-19T00:21:00Z",
  "next_steps": "Payment processing initiated"
}
```

## Acceptance Criteria

### ✅ Critical Tests
- [ ] **Static Valuation**: Placing 5 bids on a property does NOT change bidmetric_price
- [ ] **Owner Price Validation**: Creating listing with owner_price = 1.15 × bidmetric_price returns 400 error
- [ ] **Slider Bounds**: For property with owner=8.5M, bidmetric=8M, comparable=7.9M, slider computes correctly
- [ ] **Motivated Sale UI**: Property with owner_timer_expiry shows countdown and "Seller motivated" label
- [ ] **Negative Factors Red**: Builder confidence factor with -20% displays in #DC2626 red

### ✅ Functional Tests
- [ ] **Bid Placement**: User can place bid within slider bounds, receives bid_id
- [ ] **Bid Rejection**: User cannot place bid > slider_upper_bound, receives clear error
- [ ] **Seller Dashboard**: Seller sees list of incoming bids with Accept/Reject buttons
- [ ] **Accept Flow**: Clicking Accept triggers soft_lock and monetization event
- [ ] **Color Contrast**: All text passes WCAG AA contrast ratio on white background

## Assumptions Made

1. **Data Sources**: Using simulated data initially; recommend purchasing licensed feeds from PropTiger/NoBroker APIs or government RERA portals
2. **Payment Gateway**: Monetization events create webhook payload; actual Razorpay/Stripe integration deferred
3. **Valuation Model**: Using weighted formula; production should use ML model trained on regional data
4. **Authentication**: Assumes existing Supabase auth; seller verification via user roles
5. **Rate Limiting**: API endpoints should have rate limits (100 req/min per user) in production

## Legal & Ethical Notes

### Data Sourcing Strategy
**Recommended Approach:**
1. **Primary**: Government RERA databases (public, legal)
2. **Secondary**: Licensed API partnerships (PropTiger, Housing.com Business APIs)
3. **Tertiary**: User-contributed comps (crowdsourced with verification)

**Avoid:**
- Scraping 99acres/MagicBricks without permission (TOS violation)
- Using copyrighted images without attribution
- Displaying competitor pricing without permission

### Ethical Messaging Examples
✅ **Good**: "Seller has reduced price — listing valid for 60 days"
❌ **Bad**: "Desperate sale! Act now!"

✅ **Good**: "BidMetric derived from HPI, local comps, and infrastructure data — last updated 2026-02-17"
❌ **Bad**: "AI-powered prediction (100% accurate)"

## Implementation Timeline
- **Day 1**: Backend valuation pipeline + DB migrations
- **Day 2**: Seed data + Owner validation + Bid API
- **Day 3**: UI redesign (white + gold theme)
- **Day 4**: Seller dashboard + Accept/Reject workflow
- **Day 5**: Slider UX + tooltips + motivated sale UI
- **Day 6**: Testing + accessibility audit
- **Day 7**: Documentation + deployment

## Next Steps
1. Review and approve this plan
2. Execute Priority 1: Backend Static Valuation Pipeline
3. Iteratively implement and test each priority item
4. Deploy to staging for UAT
5. Production rollout with monitoring
