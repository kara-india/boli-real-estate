# 🟡 AGENT D — Frontend Architect
## Builder Dashboard & Product UX Architecture

**Agent**: `coder-mm7qdlam` | **Domain**: Frontend / UX  
**Status**: ✅ COMPLETE

---

## 1. COMPONENT ARCHITECTURE

```
app/
├── layout.tsx                    # Global shell (header + nav)
├── page.tsx                      # Landing / marketing page
│
├── auth/
│   ├── login/page.tsx            # Unified login (buyer/builder)
│   ├── register/page.tsx         # Role-aware registration
│   └── callback/route.ts        # Supabase OAuth callback
│
├── builder/                      # === BUILDER PORTAL ===
│   ├── layout.tsx                # Builder shell (sidebar + header)
│   ├── page.tsx                  # Builder Dashboard (KPI overview)
│   │
│   ├── leads/
│   │   ├── page.tsx              # Lead inbox (table + filters)
│   │   ├── [id]/page.tsx         # Lead detail + reveal CTA
│   │   └── components/
│   │       ├── LeadCard.tsx
│   │       ├── LeadScoreBadge.tsx
│   │       ├── LeadTimeline.tsx
│   │       └── RevealButton.tsx
│   │
│   ├── visits/
│   │   ├── page.tsx              # Visit calendar view
│   │   ├── [id]/page.tsx         # Visit detail + check-in
│   │   └── components/
│   │       ├── VisitCalendar.tsx
│   │       ├── VisitCard.tsx
│   │       ├── BiometricCheckin.tsx
│   │       └── FeedbackForm.tsx
│   │
│   ├── closings/
│   │   ├── page.tsx              # Active closings pipeline
│   │   ├── [id]/page.tsx         # Closing milestone tracker
│   │   └── components/
│   │       ├── ClosingPipeline.tsx
│   │       ├── MilestoneTracker.tsx
│   │       ├── DocumentUploader.tsx
│   │       └── LoanAttachWidget.tsx
│   │
│   ├── projects/
│   │   ├── page.tsx              # Project portfolio
│   │   ├── new/page.tsx          # Add new project
│   │   ├── [id]/page.tsx         # Project detail + inventory
│   │   └── components/
│   │       ├── ProjectCard.tsx
│   │       ├── InventoryGrid.tsx
│   │       ├── UnitStatusBadge.tsx
│   │       └── PriceEditor.tsx
│   │
│   ├── billing/
│   │   ├── page.tsx              # Billing dashboard
│   │   ├── wallet/page.tsx       # Wallet + top-up
│   │   ├── invoices/page.tsx     # Invoice history
│   │   └── components/
│   │       ├── WalletCard.tsx
│   │       ├── BillingTable.tsx
│   │       ├── TopUpModal.tsx
│   │       ├── InvoiceRow.tsx
│   │       └── PlanSelector.tsx
│   │
│   └── analytics/
│       ├── page.tsx              # Revenue analytics
│       └── components/
│           ├── RevenueChart.tsx
│           ├── FunnelViz.tsx
│           ├── LeadHeatmap.tsx
│           └── KPICards.tsx
│
├── buyer/                        # === BUYER PORTAL ===
│   ├── page.tsx                  # Buyer dashboard
│   ├── inquiries/page.tsx        # My inquiries
│   ├── visits/page.tsx           # My scheduled visits
│   └── shortlist/page.tsx        # Shortlisted properties
│
├── listings/                     # === PUBLIC LISTINGS ===
│   ├── page.tsx                  # Browse properties
│   ├── [id]/page.tsx             # Property detail
│   └── components/
│       ├── PropertyCard.tsx
│       ├── PropertyGrid.tsx
│       ├── BidSlider.tsx
│       └── ValuationPanel.tsx
│
├── admin/                        # === ADMIN PORTAL ===
│   ├── page.tsx                  # Admin dashboard
│   ├── builders/page.tsx         # Builder management
│   ├── violations/page.tsx       # Anti-leak violations
│   ├── revenue/page.tsx          # Revenue dashboard
│   └── analytics/page.tsx        # Platform analytics
│
└── api/                          # === API ROUTES ===
    ├── builders/
    ├── leads/
    ├── visits/
    ├── closings/
    ├── billing/
    └── analytics/

components/                       # === SHARED COMPONENTS ===
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Table.tsx
│   ├── Tabs.tsx
│   ├── Dropdown.tsx
│   ├── DatePicker.tsx
│   └── StatusBadge.tsx
├── charts/
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   ├── FunnelChart.tsx
│   └── Heatmap.tsx
├── forms/
│   ├── BuilderRegForm.tsx
│   ├── LeadInquiryForm.tsx
│   ├── VisitBookingForm.tsx
│   └── ProjectForm.tsx
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── Footer.tsx
    └── MobileNav.tsx
```

---

## 2. USER FLOW DIAGRAMS

### 2.1 Builder Onboarding Flow
```
[Landing Page] → [Register as Builder]
                       │
                       ▼
              ┌─────────────────┐
              │ Registration    │
              │ Form            │
              │ ─ Company Name  │
              │ ─ RERA Number   │
              │ ─ City/Locality │
              │ ─ GST Number    │
              │ ─ Contact Info  │
              └────────┬────────┘
                       │ Submit
                       ▼
              ┌─────────────────┐
              │ RERA Verification│
              │ (Auto-check     │
              │  via MahaRERA)  │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │                 │
         ✅ Verified       ❌ Failed
              │                 │
              ▼                 ▼
    ┌──────────────┐    ┌──────────────┐
    │ Add First    │    │ Manual Review│
    │ Project      │    │ Required     │
    └──────┬───────┘    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Add Inventory│
    │ (Units)      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Fund Wallet  │
    │ (₹5,000 min) │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Dashboard    │
    │ LIVE ✅      │
    └──────────────┘
```

### 2.2 Lead → Closing Flow (Builder Perspective)
```
┌──────────────────────────────────────────────────────────┐
│                    BUILDER DASHBOARD                      │
└────┬──────────┬──────────┬──────────┬──────────┬─────────┘
     │          │          │          │          │
  ┌──▼──┐   ┌──▼──┐   ┌──▼──┐   ┌──▼──┐   ┌──▼──┐
  │Leads│   │Visits│  │Close│   │Bill │   │Stats│
  │ 23  │   │  5   │  │  2  │   │ ₹8K │   │Graph│
  └──┬──┘   └──┬──┘  └──┬──┘   └──┬──┘   └─────┘
     │         │        │         │
     ▼         │        │         │
  ┌────────┐   │        │         │
  │New Lead│   │        │         │
  │Score:15│   │        │         │
  │₹250 [R]│   │        │         │
  └───┬────┘   │        │         │
      │Reveal  │        │         │
      ▼        │        │         │
  ┌────────┐   │        │         │
  │Contact │   │        │         │
  │Buyer   │───┘        │         │
  │Call CTA│            │         │
  └───┬────┘            │         │
      │Qualify          │         │
      ▼                 │         │
  ┌────────┐            │         │
  │Schedule│            │         │
  │Visit   │────────────┘         │
  │₹500    │                      │
  └───┬────┘                      │
      │Complete                   │
      ▼                           │
  ┌────────┐                      │
  │Initiate│                      │
  │Closing │──────────────────────┘
  │1% comm │
  └───┬────┘
      │Register
      ▼
  ┌────────┐
  │DEAL    │
  │CLOSED ✅│
  └────────┘
```

### 2.3 Site Visit Module Flow
```
[Builder schedules visit] → [Buyer receives SMS + WhatsApp]
                                       │
                              ┌────────┴────────┐
                              │                 │
                         ✅ Confirms        ❌ Cancels
                              │                 │
                              ▼                 ▼
                      ┌──────────────┐   ┌────────────┐
                      │ Cab Booked?  │   │ Reschedule │
                      │ [Yes] [No]   │   │ Prompt     │
                      └──────┬───────┘   └────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Day of Visit │
                      │ Push Notif.  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Biometric    │
                      │ Check-In     │
                      │ (Aadhaar OTP)│
                      └──────┬───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
               ✅ Verified      ❌ No-Show
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌────────────┐
            │ Site Tour    │  │ No charge  │
            │ (1-2 hours)  │  │ Follow-up  │
            └──────┬───────┘  └────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ Feedback     │
            │ Form (1-5⭐)  │
            │ Interested?  │
            └──────┬───────┘
                   │
          ┌────────┴───────┐
          │                │
     ✅ Interested    ❌ Not Now
          │                │
          ▼                ▼
   ┌──────────────┐  ┌────────────┐
   │ Auto-advance │  │ Nurture    │
   │ to Negotiate │  │ sequence   │
   └──────────────┘  └────────────┘
```

### 2.4 Assisted Closing UI Flow
```
┌───────────────────────────────────────────────┐
│           ASSISTED CLOSING TRACKER             │
├───────────────────────────────────────────────┤
│                                               │
│  ●━━━━●━━━━●━━━━○━━━━○━━━━○━━━━○             │
│  Token  Agmt  Loan  Sign  Reg  Done           │
│                                               │
│  Current Stage: LOAN PROCESSING               │
│                                               │
│  ┌─────────────────────────────────────┐      │
│  │ Sale Price:     ₹85,00,000         │      │
│  │ Commission:     ₹85,000 (1%)       │      │
│  │ Stamp Duty:     ₹5,10,000 (6%)    │      │
│  │ Registration:   ₹30,000           │      │
│  │ Loan Status:    Sanctioned ✅      │      │
│  │ Loan Amount:    ₹55,00,000        │      │
│  └─────────────────────────────────────┘      │
│                                               │
│  [Upload Document]  [Update Status]           │
│                                               │
│  TIMELINE:                                    │
│  ├── Token ₹1L collected (Feb 20)             │
│  ├── Agreement drafted (Feb 25)               │
│  ├── Loan applied - HDFC (Feb 27)             │
│  ├── Loan sanctioned (Mar 1) ← current       │
│  ├── Agreement signing (Mar 5) ← next        │
│  └── Registration (TBD)                       │
└───────────────────────────────────────────────┘
```

---

## 3. DATA MAPPING FROM APIS

| Component | API Endpoint | Data Fields |
|-----------|-------------|-------------|
| `KPICards` | `GET /api/builders/:id/analytics` | leads_count, visits_count, closings_count, revenue_mtd |
| `LeadCard` | `GET /api/builders/:id/leads` | buyer_name, lead_score, timeline, intent, created_at |
| `RevealButton` | `POST /api/leads/:id/reveal` | buyer_phone, buyer_email (charges ₹250) |
| `VisitCalendar` | `GET /api/builders/:id/visits` | scheduled_date, time_slot, status, project_name |
| `BiometricCheckin` | `POST /api/visits/:id/checkin` | aadhaar_last4, check_in_lat/lng, biometric_verified |
| `ClosingPipeline` | `GET /api/closings` | status, sale_price, commission, milestone_dates |
| `MilestoneTracker` | `PATCH /api/closings/:id/milestone` | status transition, document_url, notes |
| `WalletCard` | `GET /api/builders/:id/wallet` | balance, total_spent, plan_type |
| `TopUpModal` | `POST /api/builders/:id/wallet/topup` | amount, razorpay_order_id |
| `RevenueChart` | `GET /api/analytics/revenue` | monthly revenue, breakdown by type |
| `FunnelViz` | `GET /api/analytics/funnel` | leads→visits→closings conversion data |
| `LeadHeatmap` | `GET /api/analytics/revenue` | locality-wise lead distribution |

---

## 4. WIREFRAME DESCRIPTIONS

### 4.1 Builder Dashboard (Home)
```
┌────────────────────────────────────────────────────┐
│ ◄ BIDMETRIC                       [Wallet: ₹8,250] │
├──────┬─────────────────────────────────────────────┤
│      │                                             │
│ 🏠   │  Welcome, Lodha Group                       │
│ Home │                                             │
│      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ 📋   │  │ 23   │ │ 5    │ │ 2    │ │₹1.2L │      │
│Leads │  │Leads │ │Visits│ │Close │ │Rev.  │      │
│      │  └──────┘ └──────┘ └──────┘ └──────┘      │
│ 📅   │                                             │
│Visit │  TODAY'S VISITS          LATEST LEADS       │
│      │  ┌─────────────┐       ┌──────────────┐    │
│ 🤝   │  │ Rajesh M.   │       │ Amit Kumar   │    │
│Close │  │ 2PM, Proj A  │       │ Score: 15/20 │    │
│      │  │ [Check-In]  │       │ [Reveal ₹250]│    │
│ 💳   │  └─────────────┘       └──────────────┘    │
│Bill  │  ┌─────────────┐       ┌──────────────┐    │
│      │  │ Priya S.    │       │ Neha Patel   │    │
│ 📊   │  │ 4PM, Proj B  │       │ Score: 12/20 │    │
│Stats │  │ [Confirmed] │       │ [Reveal ₹250]│    │
│      │  └─────────────┘       └──────────────┘    │
│      │                                             │
│      │  ──── REVENUE THIS MONTH ────               │
│      │  [========Bar Chart=========]               │
│      │  Leads ₹45K | Visits ₹12K | Close ₹85K     │
└──────┴─────────────────────────────────────────────┘
```

### 4.2 Billing Dashboard
```
┌──────────────────────────────────────────────┐
│  BILLING & WALLET                            │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  WALLET BALANCE                        │ │
│  │  ₹8,250.00           [+ Top Up]        │ │
│  │  Plan: Pay Per Lead   [Change Plan]    │ │
│  │  Auto-recharge: OFF   [Enable]         │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  RECENT TRANSACTIONS                         │
│  ┌────────┬─────────┬────────┬──────────┐   │
│  │ Date   │ Type    │ Amount │ Status   │   │
│  ├────────┼─────────┼────────┼──────────┤   │
│  │ Mar 1  │ Lead    │ -₹250  │ Deducted │   │
│  │ Mar 1  │ Visit   │ -₹500  │ Deducted │   │
│  │ Feb 28 │ Top-up  │+₹5,000 │ Credited │   │
│  │ Feb 27 │ Lead    │ -₹250  │ Deducted │   │
│  │ Feb 25 │ Closing │-₹85,000│ Invoiced │   │
│  └────────┴─────────┴────────┴──────────┘   │
│                                              │
│  [View All] [Download Invoices] [GST Report] │
└──────────────────────────────────────────────┘
```
