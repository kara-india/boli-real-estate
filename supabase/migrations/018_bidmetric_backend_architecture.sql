-- 018_bidmetric_backend_architecture.sql
-- 1. Create Audit Logs table first so triggers can use it
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    builder_id UUID,
    lead_id UUID,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Builders
CREATE TABLE IF NOT EXISTS builders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    rera_registration TEXT,
    rera_verified BOOLEAN DEFAULT false,
    city TEXT NOT NULL CHECK (
        city IN ('Mumbai', 'Pune', 'Thane', 'Navi Mumbai')
    ),
    locality TEXT,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    ongoing_projects INTEGER DEFAULT 0,
    avg_delivery_months INTEGER,
    trust_score INTEGER DEFAULT 50 CHECK (
        trust_score BETWEEN 0 AND 100
    ),
    onboarding_status TEXT DEFAULT 'pending' CHECK (
        onboarding_status IN ('pending', 'onboarding', 'active', 'suspended')
    ),
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
CREATE INDEX IF NOT EXISTS idx_builders_city ON builders(city);
CREATE INDEX IF NOT EXISTS idx_builders_onboarding ON builders(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_builders_rera ON builders(rera_registration);
-- 3. Builder Projects
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
    completion_percent INTEGER DEFAULT 0 CHECK (
        completion_percent BETWEEN 0 AND 100
    ),
    price_range_min NUMERIC,
    price_range_max NUMERIC,
    avg_price_per_sqft NUMERIC,
    amenities TEXT [] DEFAULT '{}',
    lat NUMERIC,
    lng NUMERIC,
    brochure_url TEXT,
    images TEXT [] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (
        status IN ('upcoming', 'active', 'sold_out', 'completed')
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_builder ON builder_projects(builder_id);
CREATE INDEX IF NOT EXISTS idx_projects_city_locality ON builder_projects(city, locality);
-- 4. Project Inventory
CREATE TABLE IF NOT EXISTS project_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    unit_number TEXT,
    unit_type TEXT NOT NULL CHECK (
        unit_type IN (
            '1RK',
            '1BHK',
            '2BHK',
            '3BHK',
            '4BHK',
            'Penthouse',
            'Villa',
            'Shop',
            'Office'
        )
    ),
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
    status TEXT DEFAULT 'available' CHECK (
        status IN (
            'available',
            'reserved',
            'token_paid',
            'sold',
            'blocked'
        )
    ),
    reserved_for_lead_id UUID,
    reserved_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inventory_project ON project_inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON project_inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON project_inventory(unit_type);
-- 5. Extended Leads (Check if table exists, alter carefully)
-- We assume "leads" table exists from 015. We will add columns if they don't exist.
DO $$ BEGIN BEGIN
ALTER TABLE leads
ADD COLUMN builder_id UUID REFERENCES builders(id);
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN project_id UUID REFERENCES builder_projects(id);
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN budget_range_min NUMERIC;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN budget_range_max NUMERIC;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN preferred_unit_type TEXT;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN source_channel TEXT DEFAULT 'platform' CHECK (
        source_channel IN (
            'platform',
            'golden_page',
            'referral',
            'direct',
            'campaign'
        )
    );
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN qualification_score INTEGER DEFAULT 0;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN is_qualified BOOLEAN DEFAULT false;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN anti_leak_hash TEXT;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN lifecycle_status TEXT DEFAULT 'new' CHECK (
        lifecycle_status IN (
            'new',
            'contacted',
            'qualified',
            'visit_scheduled',
            'visit_completed',
            'negotiating',
            'token_paid',
            'agreement_signed',
            'registered',
            'closed',
            'lost',
            'junk'
        )
    );
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN lost_reason TEXT;
EXCEPTION
WHEN duplicate_column THEN
END;
BEGIN
ALTER TABLE leads
ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
EXCEPTION
WHEN duplicate_column THEN
END;
END $$;
-- 6. Site Visits
CREATE TABLE IF NOT EXISTS site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    builder_id UUID NOT NULL REFERENCES builders(id),
    buyer_id UUID REFERENCES auth.users(id),
    project_id UUID NOT NULL REFERENCES builder_projects(id),
    scheduled_date DATE NOT NULL,
    scheduled_time_slot TEXT CHECK (
        scheduled_time_slot IN (
            '09:00-11:00',
            '11:00-13:00',
            '14:00-16:00',
            '16:00-18:00'
        )
    ),
    visited_at TIMESTAMPTZ,
    check_in_lat NUMERIC,
    check_in_lng NUMERIC,
    biometric_verified BOOLEAN DEFAULT false,
    aadhaar_last4 TEXT,
    cab_booked BOOLEAN DEFAULT false,
    cab_cost NUMERIC DEFAULT 0,
    pickup_address TEXT,
    feedback_score INTEGER CHECK (
        feedback_score BETWEEN 1 AND 5
    ),
    feedback_notes TEXT,
    interested_units TEXT [],
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'confirmed',
            'en_route',
            'checked_in',
            'completed',
            'no_show',
            'cancelled',
            'rescheduled'
        )
    ),
    cancellation_reason TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    billable BOOLEAN DEFAULT true,
    bill_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visits_lead ON site_visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_visits_builder ON site_visits(builder_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON site_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON site_visits(status);
-- 7. Assisted Closings
CREATE TABLE IF NOT EXISTS assisted_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    builder_id UUID NOT NULL REFERENCES builders(id),
    buyer_id UUID REFERENCES auth.users(id),
    project_id UUID NOT NULL REFERENCES builder_projects(id),
    unit_id UUID REFERENCES project_inventory(id),
    sale_price NUMERIC NOT NULL,
    commission_percent NUMERIC DEFAULT 1.0,
    commission_amount NUMERIC GENERATED ALWAYS AS (sale_price * commission_percent / 100) STORED,
    stamp_duty_percent NUMERIC DEFAULT 6.0,
    stamp_duty_amount NUMERIC,
    registration_fee NUMERIC DEFAULT 30000,
    gst_on_commission NUMERIC GENERATED ALWAYS AS (sale_price * commission_percent / 100 * 0.18) STORED,
    loan_id UUID,
    -- We will add FK properly later or leave as UUID and enforce manually if cyclic dependency
    loan_attached BOOLEAN DEFAULT false,
    token_amount NUMERIC,
    token_paid_at TIMESTAMPTZ,
    agreement_date DATE,
    registration_date DATE,
    possession_date DATE,
    status TEXT DEFAULT 'initiated' CHECK (
        status IN (
            'initiated',
            'token_collected',
            'agreement_drafted',
            'agreement_signed',
            'loan_processing',
            'registration_scheduled',
            'registered',
            'possession_given',
            'completed',
            'cancelled',
            'disputed'
        )
    ),
    cancellation_reason TEXT,
    agreement_doc_url TEXT,
    registration_doc_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_closings_builder ON assisted_closings(builder_id);
CREATE INDEX IF NOT EXISTS idx_closings_status ON assisted_closings(status);
-- 8. Loan Attachments
CREATE TABLE IF NOT EXISTS loan_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    closing_id UUID REFERENCES assisted_closings(id),
    buyer_id UUID REFERENCES auth.users(id),
    bank_partner TEXT NOT NULL CHECK (
        bank_partner IN (
            'SBI',
            'HDFC',
            'ICICI',
            'Axis',
            'Kotak',
            'PNB',
            'BOB',
            'LIC_HFL',
            'Bajaj_HFL',
            'Tata_Capital'
        )
    ),
    loan_amount NUMERIC NOT NULL,
    interest_rate NUMERIC,
    tenure_months INTEGER DEFAULT 240,
    emi_amount NUMERIC,
    processing_fee NUMERIC,
    platform_commission_percent NUMERIC DEFAULT 0.5,
    platform_commission_amount NUMERIC GENERATED ALWAYS AS (loan_amount * 0.5 / 100) STORED,
    status TEXT DEFAULT 'inquiry' CHECK (
        status IN (
            'inquiry',
            'documents_collected',
            'submitted_to_bank',
            'sanctioned',
            'disbursed',
            'rejected',
            'cancelled'
        )
    ),
    sanction_letter_url TEXT,
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- update assisted closing with loan ref safely
ALTER TABLE assisted_closings
ADD CONSTRAINT fk_assisted_closings_loan FOREIGN KEY (loan_id) REFERENCES loan_attachments(id) ON DELETE
SET NULL;
CREATE INDEX IF NOT EXISTS idx_loans_closing ON loan_attachments(closing_id);
CREATE INDEX IF NOT EXISTS idx_loans_bank ON loan_attachments(bank_partner);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loan_attachments(status);
-- 9. Builder Wallets
CREATE TABLE IF NOT EXISTS builder_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    total_loaded NUMERIC(12, 2) DEFAULT 0.00,
    plan_type TEXT DEFAULT 'pay_per_lead' CHECK (
        plan_type IN (
            'pay_per_lead',
            'monthly_subscription',
            'annual_plan',
            'enterprise'
        )
    ),
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
-- 10. Billing Events
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id),
    wallet_id UUID NOT NULL REFERENCES builder_wallets(id),
    lead_id UUID REFERENCES leads(id),
    visit_id UUID REFERENCES site_visits(id),
    closing_id UUID REFERENCES assisted_closings(id),
    loan_id UUID REFERENCES loan_attachments(id),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'lead_qualified',
            'lead_revealed',
            'visit_completed',
            'visit_no_show_refund',
            'closing_commission',
            'loan_commission',
            'wallet_topup',
            'subscription_charge',
            'refund',
            'penalty',
            'promotional_credit'
        )
    ),
    amount NUMERIC NOT NULL,
    gst_rate NUMERIC DEFAULT 18.0,
    gst_amount NUMERIC GENERATED ALWAYS AS (amount * 18.0 / 100) STORED,
    total_amount NUMERIC GENERATED ALWAYS AS (amount * 1.18) STORED,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'deducted',
            'paid',
            'refunded',
            'failed',
            'waived'
        )
    ),
    invoice_number TEXT,
    razorpay_payment_id TEXT,
    paid_at TIMESTAMPTZ,
    due_date DATE,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_billing_builder ON billing_events(builder_id);
CREATE INDEX IF NOT EXISTS idx_billing_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_events(status);
CREATE INDEX IF NOT EXISTS idx_billing_created ON billing_events(created_at DESC);
-- 11. Anti-Leak Registry
CREATE TABLE IF NOT EXISTS anti_leak_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    buyer_phone_hash TEXT NOT NULL,
    builder_id UUID NOT NULL REFERENCES builders(id),
    first_contact_at TIMESTAMPTZ DEFAULT now(),
    exclusivity_period_days INTEGER DEFAULT 90,
    exclusivity_until TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
    contacted_outside_platform BOOLEAN DEFAULT false,
    violation_detected BOOLEAN DEFAULT false,
    violation_evidence JSONB,
    penalty_amount NUMERIC DEFAULT 0,
    penalty_status TEXT DEFAULT 'none' CHECK (
        penalty_status IN (
            'none',
            'warned',
            'penalized',
            'disputed',
            'resolved'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(buyer_phone_hash, builder_id)
);
CREATE INDEX IF NOT EXISTS idx_antileak_builder ON anti_leak_registry(builder_id);
CREATE INDEX IF NOT EXISTS idx_antileak_hash ON anti_leak_registry(buyer_phone_hash);
-- 12. Audit Triggers
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO audit_logs (
        event_type,
        actor_id,
        builder_id,
        lead_id,
        entity_type,
        entity_id,
        metadata,
        ip_address
    )
VALUES (
        TG_ARGV [0],
        auth.uid(),
        (
            CASE
                WHEN current_setting('request.jwt.claims', true) IS NOT NULL THEN auth.uid()
                ELSE NULL
            END
        ),
        NULL,
        -- We might extract lead_id from NEW if it exists, for simplicity putting NULL here or handling dynamically.
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old',
            to_jsonb(OLD),
            'new',
            to_jsonb(NEW),
            'operation',
            TG_OP
        ),
        current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Safe trigger setup using a function
CREATE OR REPLACE FUNCTION create_audit_trigger_if_not_exists(
        table_name text,
        trigger_name text,
        evt_type text
    ) RETURNS void AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = trigger_name
    ) THEN EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION log_audit_event(%L)',
        trigger_name,
        table_name,
        evt_type
    );
END IF;
END;
$$ LANGUAGE plpgsql;
SELECT create_audit_trigger_if_not_exists('leads', 'audit_leads', 'lead_event');
SELECT create_audit_trigger_if_not_exists('site_visits', 'audit_visits', 'visit_event');
SELECT create_audit_trigger_if_not_exists(
        'assisted_closings',
        'audit_closings',
        'closing_event'
    );
SELECT create_audit_trigger_if_not_exists(
        'billing_events',
        'audit_billing',
        'billing_event'
    );
SELECT create_audit_trigger_if_not_exists(
        'anti_leak_registry',
        'audit_antileak',
        'antileak_event'
    );
-- Add Builder Agreements (referenced in architecture document)
CREATE TABLE IF NOT EXISTS builder_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
    agreement_type TEXT NOT NULL DEFAULT 'standard',
    non_circumvention BOOLEAN DEFAULT true,
    commission_rate NUMERIC DEFAULT 1.0,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    maha_rera_ref TEXT,
    status TEXT DEFAULT 'active' CHECK (
        status IN ('draft', 'active', 'expired', 'terminated')
    ),
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);