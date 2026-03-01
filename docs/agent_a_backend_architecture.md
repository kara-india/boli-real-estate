# 🟢 AGENT A — Backend Systems Architecture
## Maharashtra BidMetric Revenue Platform

**Agent**: `architect-mm7qdgtj` | **Domain**: Backend Systems  
**Status**: ✅ COMPLETE  
**Generated**: 2026-03-01T18:02:41+05:30

---

## 1. ER DIAGRAM (Text Format)

```
┌─────────────────────┐       ┌─────────────────────┐
│     auth.users      │       │      profiles        │
│─────────────────────│       │─────────────────────│
│ id (UUID) PK        │◄──────│ id (UUID) PK/FK     │
│ email               │       │ role (user_role)     │
│ encrypted_password   │       │ full_name            │
│ ...supabase_managed  │       │ phone                │
└─────────┬───────────┘       │ rera_number          │
          │                   │ verification_status   │
          │                   │ aadhaar_hash          │
          │                   │ partner_type          │
          │                   └───────────────────────┘
          │
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│      builders       │       │   builder_agreements │
│─────────────────────│       │─────────────────────│
│ id (UUID) PK        │◄──────│ id (UUID) PK        │
│ user_id FK→users    │       │ builder_id FK        │
│ company_name        │       │ agreement_type       │
│ rera_registration   │       │ non_circumvention    │
│ city (Mumbai/Pune)  │       │ commission_rate      │
│ total_projects      │       │ valid_from           │
│ completed_projects  │       │ valid_until          │
│ avg_delivery_months │       │ maha_rera_ref        │
│ trust_score (0-100) │       │ status (enum)        │
│ onboarding_status   │       │ signed_at            │
│ created_at          │       └─────────────────────┘
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│  builder_projects   │       │  project_inventory   │
│─────────────────────│       │─────────────────────│
│ id (UUID) PK        │◄──────│ id (UUID) PK        │
│ builder_id FK       │       │ project_id FK        │
│ project_name        │       │ unit_type (1/2/3BHK) │
│ rera_number         │       │ carpet_area_sqft     │
│ locality            │       │ price                │
│ city (Mumbai/Pune)  │       │ floor_number         │
│ total_units         │       │ status (available/   │
│ sold_units          │       │   reserved/sold)     │
│ possession_date     │       │ bidmetric_price      │
│ completion_percent  │       │ market_price         │
│ lat/lng             │       └─────────────────────┘
└─────────────────────┘
          │
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│       leads         │       │     site_visits      │
│─────────────────────│       │─────────────────────│
│ id (UUID) PK        │       │ id (UUID) PK        │
│ builder_id FK       │       │ lead_id FK→leads     │
│ project_id FK       │       │ builder_id FK        │
│ buyer_id FK→users   │       │ buyer_id FK→users    │
│ buyer_name          │       │ project_id FK        │
│ buyer_phone         │       │ scheduled_at         │
│ buyer_email         │       │ visited_at           │
│ intent_reason       │       │ status (enum)        │
│ timeline            │       │ feedback_score (1-5) │
│ budget_range_min    │       │ cab_booked           │
│ budget_range_max    │       │ cab_cost             │
│ lead_score (0-100)  │       │ biometric_verified   │
│ source_channel      │       │ check_in_lat/lng     │
│ is_qualified        │       │ notes                │
│ is_fully_revealed   │       └─────────────────────┘
│ charge_amount       │
│ anti_leak_hash      │       ┌─────────────────────┐
│ lifecycle_status    │       │   assisted_closings  │
│ created_at          │       │─────────────────────│
└─────────────────────┘       │ id (UUID) PK        │
                              │ lead_id FK→leads     │
┌─────────────────────┐       │ builder_id FK        │
│      billing        │       │ buyer_id FK→users    │
│─────────────────────│       │ project_id FK        │
│ id (UUID) PK        │       │ unit_id FK→inventory │
│ builder_id FK       │       │ sale_price           │
│ lead_id FK          │       │ commission_percent   │
│ visit_id FK         │       │ commission_amount    │
│ closing_id FK       │       │ stamp_duty_amount    │
│ event_type (enum)   │       │ registration_fee     │
│ amount              │       │ loan_id FK (nullable)│
│ gst_amount          │       │ status (enum)        │
│ total_amount        │       │ agreement_date       │
│ status (enum)       │       │ registration_date    │
│ invoice_number      │       │ token_amount         │
│ razorpay_payment_id │       │ created_at           │
│ paid_at             │       └─────────────────────┘
│ due_date            │
│ created_at          │       ┌─────────────────────┐
└─────────────────────┘       │   loan_attachments   │
                              │─────────────────────│
┌─────────────────────┐       │ id (UUID) PK        │
│  builder_wallets    │       │ closing_id FK        │
│─────────────────────│       │ buyer_id FK          │
│ id (UUID) PK        │       │ bank_partner         │
│ builder_id FK       │       │ loan_amount          │
│ balance             │       │ interest_rate        │
│ total_spent         │       │ tenure_months        │
│ plan_type           │       │ processing_fee       │
│ monthly_budget      │       │ platform_commission  │
│ auto_recharge       │       │ status (enum)        │
│ created_at          │       │ disbursed_at         │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│    audit_logs       │       │  anti_leak_registry  │
│─────────────────────│       │─────────────────────│
│ id (UUID) PK        │       │ id (UUID) PK        │
│ event_type (enum)   │       │ lead_id FK           │
│ actor_id FK→users   │       │ buyer_phone_hash     │
│ builder_id FK       │       │ builder_id FK        │
│ lead_id FK          │       │ first_contact_at     │
│ entity_type         │       │ exclusivity_until    │
│ entity_id           │       │ contacted_outside    │
│ metadata JSONB      │       │ violation_detected   │
│ ip_address          │       │ penalty_amount       │
│ created_at          │       └─────────────────────┘
└─────────────────────┘
```

---

## 2. COMPLETE TABLE SCHEMAS (PostgreSQL / Supabase)

### 2.1 Builders Table
```sql
CREATE TABLE IF NOT EXISTS builders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    rera_registration TEXT,
    rera_verified BOOLEAN DEFAULT false,
    city TEXT NOT NULL CHECK (city IN ('Mumbai', 'Pune', 'Thane', 'Navi Mumbai')),
    locality TEXT,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    ongoing_projects INTEGER DEFAULT 0,
    avg_delivery_months INTEGER,
    trust_score INTEGER DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
    onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'onboarding', 'active', 'suspended')),
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    gst_number TEXT,
    pan_number TEXT,
    office_address JSONB,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX idx_builders_city ON builders(city);
CREATE INDEX idx_builders_onboarding ON builders(onboarding_status);
CREATE INDEX idx_builders_rera ON builders(rera_registration);
```

### 2.2 Builder Projects Table
```sql
CREATE TABLE IF NOT EXISTS builder_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    rera_number TEXT,
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT,
    total_units INTEGER NOT NULL,
    sold_units INTEGER DEFAULT 0,
    available_units INTEGER GENERATED ALWAYS AS (total_units - sold_units) STORED,
    possession_date DATE,
    completion_percent INTEGER DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
    price_range_min NUMERIC,
    price_range_max NUMERIC,
    avg_price_per_sqft NUMERIC,
    amenities TEXT[] DEFAULT '{}',
    lat NUMERIC,
    lng NUMERIC,
    brochure_url TEXT,
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'sold_out', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_builder ON builder_projects(builder_id);
CREATE INDEX idx_projects_city_locality ON builder_projects(city, locality);
```

### 2.3 Project Inventory Table
```sql
CREATE TABLE IF NOT EXISTS project_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    unit_number TEXT,
    unit_type TEXT NOT NULL CHECK (unit_type IN ('1RK', '1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Villa', 'Shop', 'Office')),
    carpet_area_sqft NUMERIC NOT NULL,
    built_up_area_sqft NUMERIC,
    super_built_up_sqft NUMERIC,
    floor_number INTEGER,
    wing TEXT,
    facing TEXT,
    price NUMERIC NOT NULL,
    bidmetric_price NUMERIC,
    market_price NUMERIC,
    price_per_sqft NUMERIC GENERATED ALWAYS AS (price / NULLIF(carpet_area_sqft, 0)) STORED,
    parking_included BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'token_paid', 'sold', 'blocked')),
    reserved_for_lead_id UUID,
    reserved_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_project ON project_inventory(project_id);
CREATE INDEX idx_inventory_status ON project_inventory(status);
CREATE INDEX idx_inventory_type ON project_inventory(unit_type);
```

### 2.4 Extended Leads Table (Builder-Focused)
```sql
-- Extends existing leads table from migration 015
ALTER TABLE leads ADD COLUMN IF NOT EXISTS builder_id UUID REFERENCES builders(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES builder_projects(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range_min NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range_max NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_unit_type TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_channel TEXT DEFAULT 'platform'
    CHECK (source_channel IN ('platform', 'golden_page', 'referral', 'direct', 'campaign'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS anti_leak_hash TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'new'
    CHECK (lifecycle_status IN (
        'new', 'contacted', 'qualified', 'visit_scheduled',
        'visit_completed', 'negotiating', 'token_paid',
        'agreement_signed', 'registered', 'closed', 'lost', 'junk'
    ));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
```

### 2.5 Site Visits Table
```sql
CREATE TABLE IF NOT EXISTS site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    builder_id UUID NOT NULL REFERENCES builders(id),
    buyer_id UUID REFERENCES auth.users(id),
    project_id UUID NOT NULL REFERENCES builder_projects(id),
    -- Scheduling
    scheduled_date DATE NOT NULL,
    scheduled_time_slot TEXT CHECK (scheduled_time_slot IN (
        '09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00'
    )),
    -- Execution
    visited_at TIMESTAMPTZ,
    check_in_lat NUMERIC,
    check_in_lng NUMERIC,
    biometric_verified BOOLEAN DEFAULT false,
    aadhaar_last4 TEXT,
    -- Transport
    cab_booked BOOLEAN DEFAULT false,
    cab_cost NUMERIC DEFAULT 0,
    pickup_address TEXT,
    -- Feedback
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    feedback_notes TEXT,
    interested_units TEXT[], -- Array of unit_ids buyer is interested in
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'en_route', 'checked_in',
        'completed', 'no_show', 'cancelled', 'rescheduled'
    )),
    cancellation_reason TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    -- Billing
    billable BOOLEAN DEFAULT true,
    bill_amount NUMERIC DEFAULT 0,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visits_lead ON site_visits(lead_id);
CREATE INDEX idx_visits_builder ON site_visits(builder_id);
CREATE INDEX idx_visits_date ON site_visits(scheduled_date);
CREATE INDEX idx_visits_status ON site_visits(status);
```

### 2.6 Assisted Closings Table
```sql
CREATE TABLE IF NOT EXISTS assisted_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    builder_id UUID NOT NULL REFERENCES builders(id),
    buyer_id UUID REFERENCES auth.users(id),
    project_id UUID NOT NULL REFERENCES builder_projects(id),
    unit_id UUID REFERENCES project_inventory(id),
    -- Financial
    sale_price NUMERIC NOT NULL,
    commission_percent NUMERIC DEFAULT 1.0,
    commission_amount NUMERIC GENERATED ALWAYS AS (sale_price * commission_percent / 100) STORED,
    stamp_duty_percent NUMERIC DEFAULT 6.0, -- Maharashtra stamp duty
    stamp_duty_amount NUMERIC,
    registration_fee NUMERIC DEFAULT 30000, -- Maharashtra fixed
    gst_on_commission NUMERIC GENERATED ALWAYS AS (sale_price * commission_percent / 100 * 0.18) STORED,
    -- Loan
    loan_id UUID, -- FK to loan_attachments if applicable
    loan_attached BOOLEAN DEFAULT false,
    -- Milestones
    token_amount NUMERIC,
    token_paid_at TIMESTAMPTZ,
    agreement_date DATE,
    registration_date DATE,
    possession_date DATE,
    -- Status
    status TEXT DEFAULT 'initiated' CHECK (status IN (
        'initiated', 'token_collected', 'agreement_drafted',
        'agreement_signed', 'loan_processing', 'registration_scheduled',
        'registered', 'possession_given', 'completed', 'cancelled', 'disputed'
    )),
    cancellation_reason TEXT,
    -- Documents
    agreement_doc_url TEXT,
    registration_doc_url TEXT,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_closings_builder ON assisted_closings(builder_id);
CREATE INDEX idx_closings_status ON assisted_closings(status);
```

### 2.7 Loan Attachments Table
```sql
CREATE TABLE IF NOT EXISTS loan_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    closing_id UUID REFERENCES assisted_closings(id),
    buyer_id UUID REFERENCES auth.users(id),
    -- Bank Details
    bank_partner TEXT NOT NULL CHECK (bank_partner IN (
        'SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'LIC_HFL', 'Bajaj_HFL', 'Tata_Capital'
    )),
    loan_amount NUMERIC NOT NULL,
    interest_rate NUMERIC,
    tenure_months INTEGER DEFAULT 240, -- 20 years
    emi_amount NUMERIC,
    processing_fee NUMERIC,
    -- Platform Revenue
    platform_commission_percent NUMERIC DEFAULT 0.5,
    platform_commission_amount NUMERIC GENERATED ALWAYS AS (loan_amount * 0.5 / 100) STORED,
    -- Status
    status TEXT DEFAULT 'inquiry' CHECK (status IN (
        'inquiry', 'documents_collected', 'submitted_to_bank',
        'sanctioned', 'disbursed', 'rejected', 'cancelled'
    )),
    sanction_letter_url TEXT,
    disbursed_at TIMESTAMPTZ,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_loans_closing ON loan_attachments(closing_id);
CREATE INDEX idx_loans_bank ON loan_attachments(bank_partner);
CREATE INDEX idx_loans_status ON loan_attachments(status);
```

### 2.8 Builder Wallets Table
```sql
CREATE TABLE IF NOT EXISTS builder_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
    balance NUMERIC(12,2) DEFAULT 0.00,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    total_loaded NUMERIC(12,2) DEFAULT 0.00,
    plan_type TEXT DEFAULT 'pay_per_lead' CHECK (plan_type IN (
        'pay_per_lead', 'monthly_subscription', 'annual_plan', 'enterprise'
    )),
    monthly_budget NUMERIC DEFAULT 50000,
    daily_lead_cap INTEGER DEFAULT 10,
    auto_recharge BOOLEAN DEFAULT false,
    auto_recharge_amount NUMERIC DEFAULT 10000,
    auto_recharge_threshold NUMERIC DEFAULT 2000,
    razorpay_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(builder_id)
);
```

### 2.9 Billing Events Table
```sql
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id),
    wallet_id UUID NOT NULL REFERENCES builder_wallets(id),
    -- Event Source
    lead_id UUID REFERENCES leads(id),
    visit_id UUID REFERENCES site_visits(id),
    closing_id UUID REFERENCES assisted_closings(id),
    loan_id UUID REFERENCES loan_attachments(id),
    -- Billing
    event_type TEXT NOT NULL CHECK (event_type IN (
        'lead_qualified', 'lead_revealed', 'visit_completed',
        'visit_no_show_refund', 'closing_commission',
        'loan_commission', 'wallet_topup', 'subscription_charge',
        'refund', 'penalty', 'promotional_credit'
    )),
    amount NUMERIC NOT NULL,
    gst_rate NUMERIC DEFAULT 18.0,
    gst_amount NUMERIC GENERATED ALWAYS AS (amount * 18.0 / 100) STORED,
    total_amount NUMERIC GENERATED ALWAYS AS (amount * 1.18) STORED,
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'deducted', 'paid', 'refunded', 'failed', 'waived'
    )),
    invoice_number TEXT,
    razorpay_payment_id TEXT,
    paid_at TIMESTAMPTZ,
    due_date DATE,
    -- Meta
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_billing_builder ON billing_events(builder_id);
CREATE INDEX idx_billing_type ON billing_events(event_type);
CREATE INDEX idx_billing_status ON billing_events(status);
CREATE INDEX idx_billing_created ON billing_events(created_at DESC);
```

### 2.10 Anti-Leak Registry
```sql
CREATE TABLE IF NOT EXISTS anti_leak_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    buyer_phone_hash TEXT NOT NULL, -- SHA256(phone + salt)
    builder_id UUID NOT NULL REFERENCES builders(id),
    first_contact_at TIMESTAMPTZ DEFAULT now(),
    exclusivity_period_days INTEGER DEFAULT 90,
    exclusivity_until TIMESTAMPTZ GENERATED ALWAYS AS (
        first_contact_at + (exclusivity_period_days || ' days')::interval
    ) STORED,
    contacted_outside_platform BOOLEAN DEFAULT false,
    violation_detected BOOLEAN DEFAULT false,
    violation_evidence JSONB,
    penalty_amount NUMERIC DEFAULT 0,
    penalty_status TEXT DEFAULT 'none' CHECK (penalty_status IN ('none', 'warned', 'penalized', 'disputed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(buyer_phone_hash, builder_id)
);

CREATE INDEX idx_antileak_builder ON anti_leak_registry(builder_id);
CREATE INDEX idx_antileak_hash ON anti_leak_registry(buyer_phone_hash);
```

---

## 3. STATE MACHINES

### 3.1 Lead Lifecycle State Machine
```
                    ┌──────┐
                    │ NEW  │
                    └──┬───┘
                       │ Builder reveals lead
                       ▼
                 ┌───────────┐
                 │ CONTACTED │
                 └─────┬─────┘
                       │ Qualification call completed
                       ▼
                 ┌───────────┐
          ┌──────│ QUALIFIED │──────┐
          │      └─────┬─────┘      │
          │ Not fit     │ Interested │ Dealer flagged
          ▼            ▼            ▼
     ┌────────┐  ┌──────────────┐  ┌──────┐
     │  LOST  │  │VISIT_SCHEDULED│  │ JUNK │
     └────────┘  └──────┬───────┘  └──────┘
                        │ Site visit done
                        ▼
                ┌───────────────┐
                │VISIT_COMPLETED│
                └───────┬───────┘
                        │ Negotiation begins
                        ▼
                 ┌─────────────┐
          ┌──────│ NEGOTIATING │──────┐
          │      └──────┬──────┘      │
          │ Deal falls   │ Token paid  │
          ▼             ▼             │
     ┌────────┐  ┌────────────┐       │
     │  LOST  │  │ TOKEN_PAID │       │
     └────────┘  └──────┬─────┘       │
                        │ Agreement    │
                        ▼             │
              ┌──────────────────┐    │
              │AGREEMENT_SIGNED  │    │
              └────────┬─────────┘    │
                       │ Registration │
                       ▼              │
                ┌──────────────┐      │
                │  REGISTERED  │      │
                └──────┬───────┘      │
                       │ Possession   │
                       ▼              │
                 ┌──────────┐         │
                 │  CLOSED  │◄────────┘
                 └──────────┘

REVENUE TRIGGERS:
  • NEW → CONTACTED: No charge (free peek)
  • CONTACTED → QUALIFIED: ₹250 lead reveal charge
  • QUALIFIED → VISIT_SCHEDULED: ₹500 visit booking charge
  • VISIT_COMPLETED: ₹500 visit completion charge
  • CLOSED: 1% closing commission
```

### 3.2 Site Visit Lifecycle
```
  ┌───────────┐
  │ SCHEDULED │
  └─────┬─────┘
        │ Buyer confirms
        ▼
  ┌───────────┐
  │ CONFIRMED │──────────────┐
  └─────┬─────┘              │
        │ Cab dispatched     │ Buyer cancels
        ▼                    ▼
  ┌──────────┐         ┌───────────┐
  │ EN_ROUTE │         │ CANCELLED │
  └────┬─────┘         └───────────┘
       │ Buyer arrives + biometric
       ▼
  ┌────────────┐
  │ CHECKED_IN │
  └──────┬─────┘
         │ Tour done
         ▼
  ┌───────────┐        ┌─────────┐
  │ COMPLETED │        │ NO_SHOW │
  └───────────┘        └─────────┘

BILLING:
  • COMPLETED → Builder charged ₹500
  • NO_SHOW → No charge + lead marked for follow-up
  • CANCELLED (< 4hr before) → ₹100 cancellation fee to builder
```

### 3.3 Billing Lifecycle
```
  ┌─────────┐
  │ PENDING │
  └────┬────┘
       │ Sufficient wallet balance?
       ├─── YES ───▶ ┌──────────┐
       │              │ DEDUCTED │
       │              └──────────┘
       │
       ├─── NO ───▶  ┌────────┐    ┌────────┐
       │              │ FAILED │───▶│ TOPUP  │───▶ Retry
       │              └────────┘    └────────┘
       │
       └─── Subscription ──▶ ┌──────┐
                              │ PAID │ (via Razorpay)
                              └──────┘

  Post-DEDUCTED:
       │ Dispute raised?
       ├─── YES ──▶ ┌──────────┐    ┌────────┐
       │             │ DISPUTED │───▶│REFUNDED│
       │             └──────────┘    └────────┘
       └─── NO ──▶  Invoice generated
```

---

## 4. REST API SPECIFICATION

### 4.1 Builder Management
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/builders/register` | Builder self-registration | Public |
| GET | `/api/builders/me` | Get own builder profile | Builder |
| PATCH | `/api/builders/me` | Update builder profile | Builder |
| GET | `/api/builders/:id` | View builder (public info) | Authenticated |
| POST | `/api/builders/:id/verify` | Admin verifies builder | Admin |

### 4.2 Project & Inventory
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/builders/:id/projects` | Create project | Builder |
| GET | `/api/builders/:id/projects` | List builder's projects | Public |
| GET | `/api/projects/:id` | Project detail + inventory | Public |
| POST | `/api/projects/:id/inventory` | Add units | Builder |
| PATCH | `/api/inventory/:id` | Update unit status | Builder |

### 4.3 Lead Engine
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/leads` | Buyer submits inquiry | Buyer |
| GET | `/api/builders/:id/leads` | Builder views leads | Builder |
| PATCH | `/api/leads/:id/status` | Update lead status | Builder |
| POST | `/api/leads/:id/reveal` | Reveal full lead info (charges wallet) | Builder |
| GET | `/api/leads/:id/score` | Get lead qualification score | Builder |
| POST | `/api/leads/:id/qualify` | Mark lead as qualified | Builder |

### 4.4 Site Visits
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/visits` | Schedule site visit | Builder/Buyer |
| GET | `/api/builders/:id/visits` | Builder's visit calendar | Builder |
| PATCH | `/api/visits/:id/confirm` | Buyer confirms visit | Buyer |
| POST | `/api/visits/:id/checkin` | Biometric check-in | System |
| PATCH | `/api/visits/:id/complete` | Mark visit completed | Builder |
| POST | `/api/visits/:id/feedback` | Buyer submits feedback | Buyer |

### 4.5 Assisted Closing
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/closings` | Initiate assisted closing | Builder |
| GET | `/api/closings/:id` | Closing detail + milestones | Builder/Buyer |
| PATCH | `/api/closings/:id/milestone` | Update milestone | Builder |
| POST | `/api/closings/:id/documents` | Upload documents | Builder/Buyer |
| POST | `/api/closings/:id/loan` | Attach loan | Buyer |

### 4.6 Billing & Wallet
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/builders/:id/wallet` | View wallet balance | Builder |
| POST | `/api/builders/:id/wallet/topup` | Add funds | Builder |
| GET | `/api/builders/:id/billing` | Billing history | Builder |
| GET | `/api/billing/:id/invoice` | Download invoice PDF | Builder |
| POST | `/api/billing/subscription` | Subscribe to plan | Builder |

### 4.7 Anti-Leakage
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/antileak/check` | Check if buyer already in system | System |
| POST | `/api/antileak/report` | Report circumvention | Builder/Admin |
| GET | `/api/antileak/violations` | List violations | Admin |

### 4.8 Analytics & Dashboard
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/builders/:id/analytics` | Builder dashboard stats | Builder |
| GET | `/api/admin/analytics` | Platform-wide KPIs | Admin |
| GET | `/api/analytics/revenue` | Revenue breakdown | Admin |
| GET | `/api/analytics/funnel` | Lead→Visit→Close funnel | Admin |

---

## 5. REVENUE TRIGGER LOGIC

```typescript
// Revenue triggers mapped to billing events
const REVENUE_TRIGGERS = {
  // LEAD MONETIZATION
  lead_revealed: {
    trigger: 'Builder clicks "Reveal Contact"',
    condition: 'lead.is_qualified === true',
    amount: 250, // ₹250 base, configurable by locality
    billing_event: 'lead_revealed',
    wallet_deduction: true,
  },

  // VISIT MONETIZATION  
  visit_completed: {
    trigger: 'Biometric check-in confirmed at site',
    condition: 'visit.status === "completed" && visit.biometric_verified',
    amount: 500, // ₹500 per verified visit
    billing_event: 'visit_completed',
    wallet_deduction: true,
  },

  // CLOSING COMMISSION
  closing_commission: {
    trigger: 'Agreement registered at sub-registrar',
    condition: 'closing.status === "registered"',
    amount_formula: 'sale_price * commission_percent / 100',
    typical_range: '0.5% - 1.5%',
    billing_event: 'closing_commission',
    invoice_required: true,
  },

  // LOAN ATTACHMENT
  loan_disbursed: {
    trigger: 'Bank confirms loan disbursement',
    condition: 'loan.status === "disbursed"',
    amount_formula: 'loan_amount * 0.5 / 100',
    billing_event: 'loan_commission',
    invoice_required: true,
  },

  // ANTI-LEAK PENALTY
  circumvention_penalty: {
    trigger: 'Violation confirmed by admin',
    condition: 'anti_leak.violation_detected === true',
    amount: 50000, // ₹50,000 penalty
    billing_event: 'penalty',
    requires_admin: true,
  },
};
```

---

## 6. AUDIT LOG ARCHITECTURE

```sql
-- Comprehensive audit logging for compliance
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        event_type,
        actor_id,
        builder_id,
        lead_id,
        entity_type,
        entity_id,
        metadata,
        ip_address
    ) VALUES (
        TG_ARGV[0], -- event type passed as trigger arg
        auth.uid(),
        COALESCE(NEW.builder_id, OLD.builder_id),
        COALESCE(NEW.lead_id, OLD.lead_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW),
            'operation', TG_OP
        ),
        current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to all critical tables
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION log_audit_event('lead_event');

CREATE TRIGGER audit_visits AFTER INSERT OR UPDATE ON site_visits
    FOR EACH ROW EXECUTE FUNCTION log_audit_event('visit_event');

CREATE TRIGGER audit_closings AFTER INSERT OR UPDATE ON assisted_closings
    FOR EACH ROW EXECUTE FUNCTION log_audit_event('closing_event');

CREATE TRIGGER audit_billing AFTER INSERT OR UPDATE ON billing_events
    FOR EACH ROW EXECUTE FUNCTION log_audit_event('billing_event');

CREATE TRIGGER audit_antileak AFTER INSERT OR UPDATE ON anti_leak_registry
    FOR EACH ROW EXECUTE FUNCTION log_audit_event('antileak_event');
```

---

## 7. REVENUE TRIGGER MAPPING

| Event | Revenue Stream | Amount | Frequency | Monthly Est. (100 builders) |
|-------|---------------|--------|-----------|----------------------------|
| Lead Revealed | Pay-per-lead | ₹250 | 50 leads/builder/mo | ₹12,50,000 |
| Visit Completed | Visit charge | ₹500 | 10 visits/builder/mo | ₹5,00,000 |
| Assisted Closing | Commission | 1% of sale | 2 closings/builder/mo | ₹20,00,000+ |
| Loan Attachment | Bank referral | 0.5% of loan | 1 loan/builder/mo | ₹5,00,000+ |
| Anti-Leak Penalty | Penalty | ₹50,000 | Rare | Variable |
| Subscription | Monthly plan | ₹5,000-25,000 | Monthly | ₹12,50,000 |

**Total Monthly Revenue Potential (100 builders): ₹55,00,000+ (₹55L/month)**
