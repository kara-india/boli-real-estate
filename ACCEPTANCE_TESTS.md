# Boli Real Estate Platform V2 - Acceptance Test Suite

## Critical Tests - MUST PASS

### Test 1: Static Valuation Immutability
**Objective**: Verify BidMetric price does NOT change when bids are placed

**Steps**:
1. Navigate to property DEL-003
2. Note the BidMetric price: ₹1.5 Cr
3. Place bid #1: ₹1.42 Cr
4. Place bid #2: ₹1.45 Cr
5. Place bid #3: ₹1.48 Cr
6. Refresh page
7. Check BidMetric price shown

**Expected Result**: BidMetric price remains ₹1.5 Cr (unchanged)

**SQL Verification**:
```sql
SELECT id, bidmetric_price, valuation_last_updated
FROM properties
WHERE id = 'DEL-003';
-- bidmetric_price should be identical to initial seed value
```

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 2: Owner Price Validation (±10% Rule)
**Objective**: Server rejects listings where owner price exceeds ±10% of BidMetric

**Steps**:
1. Attempt to create property with:
   - BidMetric: ₹1,00,00,000
   - Owner Price: ₹1,15,00,00 ( (

+15%, should FAIL)
2. Attempt to create property with:
   - BidMetric: ₹1,00,00,000
   - Owner Price: ₹84,00,000 (−16%, should FAIL)
3. Attempt to create property with:
   - BidMetric: ₹1,00,00,000
   - Owner Price: ₹1,09,00,000 (+9%, should PASS)

**Expected Result**:
- First two attempts return 400 error with message: "Owner price must be within ±10% of platform market value (BidMetric)"
- Third attempt succeeds

**API Test**:
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "bidmetric_price": 10000000,
    "original_listing_price": 11500000
  }'
# Should return 400 error
```

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 3: Slider Bounds Calculation
**Objective**: Verify slider min/max calculated correctly per algorithm

**Property**: BLR-001
- Market (BidMetric): ₹80 L
- Owner: ₹85 L (+ 6.25%)
- Comparable: ₹79 L (−1.25%)

**Expected Bounds**:
```
d_owner = (85 - 80) / 80 = 0.0625
d_comparable = (79 - 80) / 80 = −0.0125

lower_bound_percent = max(−5%, min(6.25%, −1.25%, −5%)) = max(−5%, −1.25%) = −1.25%
upper_bound_percent = min(+5%, max(6.25%, −1.25%, +5%)) = min(+5%, 6.25%) = +5%

lower_absolute = 80L × (1 − 0.0125) = ₹79 L
upper_absolute = 80L × (1 + 0.05) = ₹84 L
```

**Steps**:
1. Navigate to BLR-001 property page
2. Inspect bid slider component
3. Check displayed bounds

**Expected UI Display**:
- Min: ₹79.00 L (−1.25%)
- Max: ₹84.00 L (+5.00%)

**SQL Verification**:
```sql
SELECT id, bidmetric_price, original_listing_price, last_sale_comparable_price,
       slider_lower_bound, slider_upper_bound
FROM properties
WHERE id = 'BLR-001';
```

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 4: Motivated Sale UI & Countdown
**Objective**: Verify properties with owner_timer_expiry display countdown and motivation label

**Property**: DEL-003 (90-day motivated sale)

**Steps**:
1. Navigate to DEL-003 property page
2. Verify MotivatedSaleBanner is displayed
3. Check label text
4. Check countdown timer
5. Verify discount percent calculation

**Expected Result**:
- Banner shown with orange gradient background
- Label: "Owner relocating internationally — price reduced for 90 days"
- Countdown displays: XX days, XX hours, XX minutes
- Discount: 6.67% OFF (saves ₹10 L)
- Ethical message shown explaining why price is below market

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 5: Negative Factors Display in Red
**Objective**: Verify negative valuation factors are shown in #DC2626 red

**Property**: PUNE-012 (has negative builder confidence factor)

**Steps**:
1. Navigate to PUNE-012 property page
2. Open "Valuation Breakdown" tab
3. Locate "Builder Confidence (Low)" factor
4. Inspect CSS color

**Expected Result**:
- Factor name displayed with TrendingDown icon
- Impact: −₹14.59 L
- Percentage: −12.8%
- Text color: #DC2626 (red)
- Progress bar color: red gradient

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 6: Color Contrast (WCAG AA Compliance)
**Objective**: Verify all text meets WCAG AA contrast ratio (4.5:1 for normal text)

**Steps**:
1. Open browser DevTools → Lighthouse
2. Run accessibility audit
3. Check contrast ratios for:
   - Gold text (#D4AF37) on white background
   - Dark charcoal (#1F2937) on white background
   - Red negative values (#DC2626) on white background

**Expected Result**:
- All text passes AA standard (4.5:1 minimum)
- Gold buttons have sufficient contrast with white text

**Tools**: Chrome DevTools > Lighthouse > Accessibility Report

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 7: Monetization Flow (Bid Acceptance)
**Objective**: Verify seller can accept bid and trigger soft-lock + monetization event

**Steps**:
1. Login as seller (owner of property MUM-002)
2. Navigate to `/seller/dashboard`
3. View incoming bids list
4. Click "Accept Bid" on highest bid
5. Verify bid status changes to "accepted"
6. Check `soft_lock_until` timestamp (should be NOW + 24 hours)
7. Verify audit log entry created

**Expected Result**:
- Bid status → "accepted"
- Property status → "under_contract"
- Soft lock until: {timestamp 24 hours from now}
- Audit log entry: event_type = "bid_accepted"
- Success toast: "Bid accepted! Payment processing initiated."

**SQL Verification**:
```sql
SELECT id, status, accepted_at, soft_lock_until
FROM bids
WHERE id = '{bid_id}';

SELECT * FROM audit_logs
WHERE event_type = 'bid_accepted'
AND bid_id = '{bid_id}';
```

**Status**: ⬜ PASS / ⬜ FAIL


---

## High Priority Tests

### Test 8: Bid Placement Within Bounds
**Objective**: Server validates bids are within slider bounds

**Property**: BLR-001 (bounds: ₹79 L - ₹84 L)

**Steps**:
1. Attempt to place bid: ₹75 L (below lowerbound) → should FAIL
2. Attempt to place bid: ₹90 L (above upper bound) → should FAIL
3. Attempt to place bid: ₹81 L (within bounds) → should PASS

**Expected Result**:
- First two attempts return 400 with clear error message
- Third attempt returns 201 with bid_id

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 9: 5-Year Forecast Placement
**Objective**: Verify forecast chart displayed adjacent to bid input

**Steps**:
1. Navigate to any property page
2. Scroll to "Your Bid" section
3. Confirm forecast chart is visible beside or below bid input

**Expected Result**:
- Desktop: Chart beside bid input in same row
- Mobile: Chart stacked below bid input
- Chart shows 5-year projection with trend line

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 10: Tab Navigation (Valuation vs Builder)
**Objective**: Verify side-by-side tabs function correctly

**Steps**:
1. Navigate to any property
2. Click "Valuation Breakdown" tab
3. Verify content switches to breakdown view
4. Click "Builder Confidence" tab
5. Verify content switches to builder metrics

**Expected Result**:
- Active tab highlighted with gold border
- Content animates smoothly
- Provenance footer visible on both tabs

**Status**: ⬜ PASS / ⬜ FAIL


---

## Medium Priority Tests

### Test 11: Free-Text Bid (Slider Disabled)
**Objective**: Verify user can uncheck slider and enter manual bid

**Steps**:
1. Navigate to property page
2. Uncheck "Use Bid Adjustment Slider" checkbox
3. Enter bid manually in text field: ₹81 L
4. Server should still validate bounds

**Expected Result**:
- Slider hidden when unchecked
- Manual input validated server-side
- Out-of-bounds manual bid rejected with error

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 12: Bid Expiration (7-Day TTL)
**Objective**: Verify bids auto-expire after 7 days

**Steps**:
1. Create test bid with manual `expires_at` = NOW - 1 day
2. Run cron job / manual query to mark expired bids
3. Verify bid status changes to "expired"

**SQL**:
```sql
UPDATE bids
SET status = 'expired'
WHERE expires_at < NOW()
AND status = 'placed';
```

**Expected Result**:
- Bid status → "expired"
- No longer shown in seller dashboard "Pending Bids"

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 13: UI Theme Consistency
**Objective**: Verify white + gold theme applied throughout

**Checks**:
- [ ] Background color: #FFFFFF
- [ ] Primary gold: #D4AF37
- [ ] Text color: #1F2937
- [ ] CTA buttons: Gold gradient
- [ ] Cards: White with subtle shadows
- [ ] No dark violet remnants

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 14: Mobile Responsiveness
**Objective**: Verify layout adapts correctly on mobile

**Screen Sizes**: 375px, 768px, 1024px

**Steps**:
1. Open property page in mobile view (375px)
2. Check tabs stack vertically
3. Check slider visible and functional
4. Check forecast chart stacks below bid input

**Expected Result**:
- All components readable on mobile
- No horizontal scroll
- Tap targets ≥ 44px

**Status**: ⬜ PASS / ⬜ FAIL


---

## Security Tests

### Test 15: Authorization (Seller Dashboard)
**Objective**: Only property owner can accept bids

**Steps**:
1. Login as User A
2. Try to accept bid on property owned by User B via API
3. Should return 403 Forbidden

**API Test**:
```bash
curl -X POST http://localhost:3000/api/bids/{bid_id_for_user_B_property}/accept \
  -H "Authorization: Bearer {user_A_token}" \
  -d '{"seller_id": "user_A_id"}'
# Should return 403
```

**Expected Result**: Error message: "Only property owner can accept bids"

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 16: SQL Injection Prevention
**Objective**: Verify parameterized queries prevent SQL injection

**Steps**:
1. Attempt to inject SQL in bid amount field:
   ```
   bid_amount: "8000000; DROP TABLE bids;--"
   ```
2. Verify server rejects or safely handles input

**Expected Result**: Input sanitized, no SQL executed

**Status**: ⬜ PASS / ⬜ FAIL


---

## Data Integrity Tests

### Test 17: Audit Log Immutability
**Objective**: Verify audit logs cannot be modified/deleted

**Steps**:
1. Create bid placement event
2. Attempt to UPDATE audit_logs record
3. Verify operation fails or is rejected

**Expected Result**: Audit logs table has permissions that prevent UPDATE/DELETE

**Status**: ⬜ PASS / ⬜ FAIL


---

### Test 18: Seed Data Validation
**Objective**: Verify all 12 properties seeded correctly

**SQL**:
```sql
SELECT 
  id,
  title,
  ROUND((original_listing_price - bidmetric_price)::NUMERIC / bidmetric_price * 100, 2) as deviation_pct,
  CASE WHEN owner_timer_expiry IS NOT NULL THEN 'MOTIVATED' ELSE 'NORMAL' END as sale_type
FROM properties
ORDER BY id;
```

**Expected Result**:
- 12 properties total
- 9 with deviation_pct > 0 (owner > bidmetric)
- 3 with sale_type = 'MOTIVATED' (DEL-003, CHN-006, HYD-011)

**Status**: ⬜ PASS / ⬜ FAIL


---

## Test Summary

| Priority | Test # | Test Name | Status |
|----------|--------|-----------|--------|
| CRITICAL | 1 | Static Valuation | ⬜ |
| CRITICAL | 2 | Owner Price Validation | ⬜ |
| CRITICAL | 3 | Slider Bounds | ⬜ |
| CRITICAL | 4 | Motivated Sale UI | ⬜ |
| CRITICAL | 5 | Negative Factors Red | ⬜ |
| CRITICAL | 6 | Color Contrast | ⬜ |
| CRITICAL | 7 | Monetization Flow | ⬜ |
| HIGH | 8 | Bid Placement Validation | ⬜ |
| HIGH | 9 | 5-Year Forecast | ⬜ |
| HIGH | 10 | Tab Navigation | ⬜ |
| MEDIUM | 11 | Free-Text Bid | ⬜ |
| MEDIUM | 12 | Bid Expiration | ⬜ |
| MEDIUM | 13 | UI Theme | ⬜ |
| MEDIUM | 14 | Mobile Responsive | ⬜ |
| SECURITY | 15 | Authorization | ⬜ |
| SECURITY | 16 | SQL Injection | ⬜ |
| DATA | 17 | Audit Log Immutability | ⬜ |
| DATA | 18 | Seed Data Validation | ⬜ |

---

## Execution Instructions

1. **Setup**: Run migrations in order:
   ```bash
   psql -d boli_db -f 002_v2_static_valuation.sql
   psql -d boli_db -f 003_seed_properties.sql
   ```

2. **Run Dev Server**:
   ```bash
   cd app && npm run dev
   ```

3. **Execute Tests**: Go through each test in order, marking PASS/FAIL

4. **Generate Report**: Export this document with results

5. **Fix Failures**: Address any failed tests before deployment

---

## Success Criteria

**Minimum to Deploy**:
- All 7 CRITICAL tests PASS
- At least 6/7 HIGH priority tests PASS
- No SECURITY tests FAIL

**Gold Standard**:
- All 18 tests PASS
- WCAG AAA compliance (7:1 contrast)
- Performance: LCP < 2.5s, FID < 100ms
