# Boli Real Estate Platform V2 - Deliverables Summary

**Project**: Static Valuation Model + Ethical Bidding System  
**Date**: 2026-02-18  
**Version**: 2.0.0  
**Status**: ✅ READY FOR IMPLEMENTATION

---

## 📦 Deliverables Checklist

### ✅ 1. Backend Valuation Pipeline & Database
- [ ] **Database Migrations** (`002_v2_static_valuation.sql`)
  - Properties table: Added bidmetric_price, slider_bounds, owner_timer_expiry
  - New valuations table for historical tracking
  - Bids table: Added status, soft_lock_until, expires_at
  - Audit logs table for immutable transaction history
  - Triggers: Auto-validate owner price within ±10%
  - Functions: calculate_slider_bounds(), accept_bid()

- [ ] **Seed Dataset** (`003_seed_properties.sql` + `properties_seed_v2.json`)
  - 12 realistic Indian properties across major cities
  - 9 normal listings (owner > bidmetric)
  - 3 motivated sales with countdown timers
  - Regional pricing: ₹45.5 L (Noida) to ₹1.85 Cr (Thane)
  - Builder profiles for 6 major developers

- [ ] **Static Valuation Engine** (`bidmetric-valuation-engine.ts` - EXISTING)
  - Pre-computes BidMetric price (does NOT change with bids)
  - Confidence intervals and top 5 factor analysis
  - Builder confidence scoring

---

### ✅ 2. API Contracts & Backend Routes

- [ ] **GET /api/properties/[id]** (`app/api/properties/[id]/route.ts`)
  - Returns complete property valuation data
  - Slider bounds (lower/upper percent & absolute values)
  - Motivated sale countdown if applicable
  - Builder confidence metrics

- [ ] **POST /api/properties/[id]/bids** (`app/api/properties/[id]/bids/route.ts`)
  - Server-side validation: bid within slider bounds
  - Enforces bid > current highest bid
  - 7-day expiry (auto TTL)
  - Creates audit log entry

- [ ] **POST /api/bids/[id]/accept** (`app/api/bids/[id]/route.ts`)
  - Seller accepts bid
  - 24-hour soft-lock for payment processing
  - Monetization event trigger (webhook ready)
  - Authorization check (only property owner)

- [ ] **DELETE /api/bids/[id]** (reject bid)
  - Seller rejects bid with optional reason
  - Audit log entry

---

### ✅ 3. UI Components (White + Gold Theme)

#### Core Bidding Components
- [ ] **BidSlider** (`components/ui/BidSlider.tsx`)
  - Interactive range slider with ±5% constraints
  - Optional toggle (checkbox to use free-text input)
  - Live price update display
  - Tooltip explaining bounds
  - Visual deviation indicator (red/green)

- [ ] **MotivatedSaleBanner** (`components/ui/MotivatedSaleBanner.tsx`)
  - Countdown timer (days/hours/minutes)
  - Discount percentage calculation
  - Ethical messaging ("Owner has reduced price...")
  - Explanation of why price is below market

- [ ] **ValuationTabs** (`components/ui/ValuationTabs.tsx`)
  - Side-by-side tabs: "Valuation Breakdown" + "Builder Confidence"
  - Gold accent for active tab
  - Data provenance footer

#### Valuation Display Components
- [ ] **ValuationBreakdown** (`components/valuation/ValuationBreakdown.tsx`)
  - Top 5 contributing factors with horizontal bars
  - Negative factors in red (#DC2626) ✨
  - Positive factors in green
  - Waterfall explanation
  - Methodology tooltip

- [ ] **BuilderConfidenceGauge** (`components/valuation/BuilderConfidenceGauge.tsx` - EXISTING)
  - Updated for white + gold theme
  - Score gauge (0-100)
  - High/Medium/Low labels
  - Link to builder detail page

- [ ] **PriceComparisonCard** (`components/valuation/PriceComparisonCard.tsx` - EXISTING)
  - Updated for white background
  - Market / Owner / BidMetric prices
  - Golden/Silver badges

---

### ✅ 4. Seller Dashboard (Monetization Critical)

- [ ] **Seller Dashboard Page** (`app/seller/dashboard/page.tsx`)
  - List all incoming bids for seller's properties
  - Filter by status: Placed / Accepted / Rejected / Expired
  - Accept/Reject buttons with confirmation
  - Real-time bid status updates
  - Countdown for bid expiry
  - Gold CTA buttons

---

### ✅ 5. Documentation

- [ ] **Implementation Plan** (`IMPLEMENTATION_PLAN.md`)
  - Priority checklist (9 phases)
  - Database schema with comments
  - API contract specifications
  - Assumptions and design decisions
  - Legal & ethical data sourcing strategy

- [ ] **Acceptance Test Suite** (`ACCEPTANCE_TESTS.md`)
  - 18 comprehensive tests
  - 7 CRITICAL tests (must pass for deployment)
  - SQL verification queries
  - API test commands (curl examples)
  - WCAG AA accessibility checks
  - Success criteria defined

- [ ] **Seed Data JSON** (`data/properties_seed_v2.json`)
  - 12 properties in API response format
  - Ready for frontend integration/testing
  - Includes all metadata (slider_bounds, motivated_sale, etc.)

---

## 🎨 Color Palette

```css
:root {
  /* Primary */
  --bg: #FFFFFF;               /* White background */
  --text: #1F2937;             /* Dark charcoal text */
  --gold: #D4AF37;             /* Primary gold accent */
  --gold-light: #CFA84B;       /* Light gold for gradients */
  
  /* Secondary */
  --muted: #F5F3F0;            /* Warm grey backgrounds */
  --border: #E5E7EB;           /* Light borders */
  
  /* Semantic */
  --danger: #DC2626;           /* Red for negative values */
  --success: #059669;          /* Green for positive values */
  --warning: #F59E0B;          /* Amber for medium confidence */
  --info: #3B82F6;             /* Blue for informational */
}
```

**CTA Buttons**:
```css
.button-primary {
  background: linear-gradient(90deg, #D4AF37, #CFA84B);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.badge-negative {
  color: #DC2626;
}
```

---

## 📋 Implementation Checklist (Execute in Order)

### Phase 1: Database Setup (Day 1)
- [ ] Run migration `002_v2_static_valuation.sql` on Supabase
- [ ] Verify triggers and functions created
- [ ] Run seed script `003_seed_properties.sql`
- [ ] Verify 12 properties inserted with correct slider_bounds
- [ ] Test owner price validation trigger (should reject ±10% violations)

### Phase 2: API Layer (Day 2)
- [ ] Deploy API routes to Next.js
- [ ] Test GET /api/properties/[id] returns complete valuation data
- [ ] Test POST /api/properties/[id]/bids validates bounds
- [ ] Test POST /api/bids/[id]/accept triggers soft-lock
- [ ] Verify audit logs created for each bid action

### Phase 3: UI Components (Day 3-4)
- [ ] Integrate BidSlider component
- [ ] Add MotivatedSaleBanner to property pages
- [ ] Implement ValuationTabs with Breakdown + Builder views
- [ ] Update theme to white + gold globally
- [ ] Test slider calculations match backend

### Phase 4: Seller Dashboard (Day 5)
- [ ] Deploy seller dashboard at /seller/dashboard
- [ ] Connect to bids API
- [ ] Test Accept/Reject workflows
- [ ] Verify soft-lock applied on acceptance

### Phase 5: Testing & QA (Day 6)
- [ ] Run all 18 acceptance tests
- [ ] Fix any failures
- [ ] Run Lighthouse accessibility audit
- [ ] Verify WCAG AA compliance
- [ ] Mobile responsiveness check (375px, 768px, 1024px)

### Phase 6: Deployment (Day 7)
- [ ] Deploy to Vercel staging
- [ ] Run smoke tests
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours

---

## 🔍 Key Implementation Notes

### 1. Static Valuation Enforcement
**Critical**: The `bidmetric_price` column should NEVER be updated by bid placement logic. Only the scheduled valuation job (recommended: daily cron) should update this value.

**Implementation**:
```javascript
// ❌ WRONG - Do not update bidmetric_price on bid placement
await supabase
  .from('properties')
  .update({ bidmetric_price: calculateFromBids(bids) })  // NO!

// ✅ CORRECT - Only update during scheduled valuation job
await supabase
  .from('valuations')
  .insert({ property_id, bidmetric_price: calculateFromMarketData() })
```

### 2. Slider Bounds Algorithm
The bounds must be calculated server-side and stored in `slider_lower_bound` / `slider_upper_bound` columns. Frontend slider is constrained by these pre-computed values.

**Why?** Prevents client-side manipulation. Server is source of truth.

### 3. Owner Price Validation
The database trigger will automatically reject UPDATE/INSERT operations where:
```
abs((owner_price - bidmetric_price) / bidmetric_price) > 0.10
```

**Exception**: If `override_flag = true` (admin can bypass).

### 4. Motivated Sale Determination
A property is "motivated" if:
```sql
owner_timer_expiry IS NOT NULL 
AND owner_timer_expiry > NOW()
AND original_listing_price < bidmetric_price
```

### 5. Ethical Messaging Examples

**✅ Good**:
- "Owner has reduced price — listing valid for 60 days"
- "Seller relocating internationally — price below market"
- "BidMetric derived from HPI, local comps, and infrastructure data"

**❌ Bad**:
- "Desperate sale! Act now before it's gone!"
- "Owner must sell ASAP!"
- "100% accurate AI prediction"

---

## 🚀 Data Sourcing Strategy

### Recommended Approach (Legal & Ethical)

#### Tier 1: Government & Public Data
- **RERA Portals**: https://rera.karnataka.gov.in, https://maharera.mahaonline.gov.in
- **Land Registry**: District Sub-Registrar offices (public records)
- **HPI Data**: RBI Housing Price Index (official stats)
- **Census Data**: Population, infrastructure from govt portals

#### Tier 2: Licensed API Partnerships
- **PropTiger Business API**: Licensed property data feed
- **Housing.com Developer API**: Paid partnership
- **NoBroker Data Platform**: Commercial license

#### Tier 3: User-Contributed Comps
- Crowdsource recent sale prices from verified users
- Manual verification before acceptance
- Incentivize contribution (credits, badges)

### What to AVOID
❌ Scraping 99acres/MagicBricks without permission (TOS violation)  
❌ Using copyrighted images without attribution  
❌ Displaying competitor pricing without license  
❌ Aggressive scraping that violates robots.txt  

---

## 📊 Success Metrics

### Technical KPIs
- **Static Valuation Integrity**: 0 instances of bidmetric_price changing due to bids
- **Owner Price Rejection Rate**: >95% of invalid listings rejected
- **Bid Validation**: 100% of out-of-bounds bids rejected
- **API Response Time**: <500ms for property details
- **Accessibility**: WCAG AA compliance (contrast 4.5:1+)

### Business KPIs
- **Bid Acceptance Rate**: Target 15-20% of placed bids accepted
- **Seller Dashboard Usage**: 80%+ of sellers check dashboard weekly
- **Motivated Sale Conversion**: 30-40% higher bid rate on motivated listings
- **Builder Confidence Impact**: High-confidence builders see +5-8% avg bid amount

---

## 🔐 Security Checklist

- [ ] Parameterized SQL queries (prevent injection)
- [ ] Authorization checks on seller actions
- [ ] Rate limiting on bid placement (max 5 bids/property/user)
- [ ] CORS configured for production domain only
- [ ] Environment variables secured (not in git)
- [ ] Audit logs immutable (no UPDATE/DELETE permissions)
- [ ] Soft-lock prevents double-acceptance
- [ ] Input sanitization on all user-submitted data

---

## 📝 Known Limitations & Future Work

### Current Limitations
1. **Valuation Model**: Uses weighted formula; production should use ML model
2. **Payment Integration**: Monetization event webhook exists but not connected to gateway
3. **Email Notifications**: Not implemented yet (seller should be notified on bid placement)
4. **Dispute Resolution**: Audit logs exist but no UI for dispute review

### Recommended Phase 3 Features
1. **Razorpay Integration**: Connect monetization webhook to payment gateway
2. **Email/SMS Notifications**: Notify sellers immediately on new bids
3. **ML Valuation Model**: Train on historical data for better BidMetric accuracy
4. **Advanced Analytics**: Seller dashboard with bid history charts
5. **Escrow System**: Hold funds during soft-lock period

---

## 📞 Support & Deployment

**Production Deployment Checklist**:
1. Set environment variables on Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
   - `MONETIZATION_WEBHOOK_URL`

2. Configure Supabase:
   - Enable Row Level Security (RLS) on all tables
   - Set up cron job for valuation updates (daily 2 AM IST)
   - Configure email templates for bid notifications

3. Monitor:
   - Vercel Analytics for performance
   - Sentry for error tracking
   - Supabase logs for database issues

**Rollback Plan**:
If critical issues arise, revert to V1 by:
1. Hide slider component (`display: none`)
2. Disable owner price validation trigger
3. Revert API routes to V1 endpoints

---

## ✅ Final Sign-Off

**Deliverables Complete**: ✅  
**Acceptance Criteria Defined**: ✅  
**Legal/Ethical Review**: ✅  
**Ready for Implementation**: ✅

**Estimated Implementation Time**: 7 days (1 developer)  
**Recommended Review**: QA team + Legal counsel + UX designer

---

**END OF DELIVERABLES SUMMARY**
