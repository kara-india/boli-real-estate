-- =====================================================
-- Boli Real Estate Platform V2 - Database Migrations
-- =====================================================
-- =====================================================
-- 1. UPDATE PROPERTIES TABLE
-- =====================================================
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS original_listing_price NUMERIC,
    ADD COLUMN IF NOT EXISTS bidmetric_price NUMERIC,
    ADD COLUMN IF NOT EXISTS market_price NUMERIC,
    ADD COLUMN IF NOT EXISTS last_sale_comparable_price NUMERIC,
    ADD COLUMN IF NOT EXISTS valuation_last_updated TIMESTAMP DEFAULT now(),
    ADD COLUMN IF NOT EXISTS confidence_interval NUMERIC DEFAULT 5.0,
    ADD COLUMN IF NOT EXISTS owner_timer_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS override_flag BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS builder_confidence_score INTEGER DEFAULT 70,
    ADD COLUMN IF NOT EXISTS slider_lower_bound NUMERIC,
    ADD COLUMN IF NOT EXISTS slider_upper_bound NUMERIC;
-- Add builder reference (if not exists)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS builder VARCHAR(255),
    ADD COLUMN IF NOT EXISTS builder_id UUID;
-- =====================================================
-- 2. CREATE VALUATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    bidmetric_price NUMERIC NOT NULL,
    confidence_interval NUMERIC DEFAULT 5.0,
    top5_factors JSONB,
    valuation_timestamp TIMESTAMP DEFAULT now(),
    model_version VARCHAR(20) DEFAULT 'v2.1.0',
    UNIQUE(property_id, valuation_timestamp)
);
CREATE INDEX IF NOT EXISTS idx_valuations_property_id ON valuations(property_id);
CREATE INDEX IF NOT EXISTS idx_valuations_timestamp ON valuations(valuation_timestamp DESC);
-- =====================================================
-- 3. UPDATE BIDS TABLE
-- =====================================================
ALTER TABLE bids
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'placed',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS soft_lock_until TIMESTAMP;
-- Add constraints
ALTER TABLE bids
ADD CONSTRAINT check_bid_status CHECK (
        status IN ('placed', 'accepted', 'rejected', 'expired')
    );
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_property_status ON bids(property_id, status);
-- =====================================================
-- 4. CREATE AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    bid_id UUID REFERENCES bids(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_property_id ON audit_logs(property_id);
-- =====================================================
-- 5. CREATE BUILDER PROFILES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS builder_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    rera_registered BOOLEAN DEFAULT false,
    rera_number VARCHAR(100),
    on_time_delivery_rate NUMERIC DEFAULT 70,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    avg_customer_rating NUMERIC DEFAULT 3.5,
    resale_velocity_index NUMERIC DEFAULT 50,
    legal_issues_count INTEGER DEFAULT 0,
    confidence_score INTEGER,
    confidence_level VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_builders_name ON builder_profiles(name);
-- =====================================================
-- 6. DATABASE FUNCTIONS
-- =====================================================
-- Function to validate owner price within ±10% of BidMetric
CREATE OR REPLACE FUNCTION validate_owner_price() RETURNS TRIGGER AS $$
DECLARE deviation NUMERIC;
BEGIN -- Skip if override_flag is true (admin override)
IF NEW.override_flag = true THEN RETURN NEW;
END IF;
-- Calculate deviation
deviation = ABS(
    (NEW.original_listing_price - NEW.bidmetric_price) / NEW.bidmetric_price
);
-- Check if within ±10%
IF deviation > 0.10 THEN RAISE EXCEPTION 'Owner price must be within ±10%% of platform market value (BidMetric). Current deviation: %',
ROUND(deviation * 100, 2) || '%';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger for owner price validation
DROP TRIGGER IF EXISTS trigger_validate_owner_price ON properties;
CREATE TRIGGER trigger_validate_owner_price BEFORE
INSERT
    OR
UPDATE OF original_listing_price,
    bidmetric_price ON properties FOR EACH ROW EXECUTE FUNCTION validate_owner_price();
-- Function to calculate slider bounds
CREATE OR REPLACE FUNCTION calculate_slider_bounds(
        p_bidmetric NUMERIC,
        p_owner NUMERIC,
        p_comparable NUMERIC DEFAULT NULL
    ) RETURNS TABLE(
        lower_bound NUMERIC,
        upper_bound NUMERIC,
        lower_percent NUMERIC,
        upper_percent NUMERIC
    ) AS $$
DECLARE d_owner NUMERIC;
d_comparable NUMERIC;
lower_pct NUMERIC;
upper_pct NUMERIC;
BEGIN -- Calculate deviations
d_owner := (p_owner - p_bidmetric) / p_bidmetric;
IF p_comparable IS NOT NULL THEN d_comparable := (p_comparable - p_bidmetric) / p_bidmetric;
END IF;
-- Calculate lower bound percent
IF p_comparable IS NOT NULL THEN lower_pct := GREATEST(-0.05, LEAST(d_owner, d_comparable, -0.05));
ELSE lower_pct := GREATEST(-0.05, LEAST(d_owner, -0.05));
END IF;
-- Calculate upper bound percent
IF p_comparable IS NOT NULL THEN upper_pct := LEAST(0.05, GREATEST(d_owner, d_comparable, 0.05));
ELSE upper_pct := LEAST(0.05, GREATEST(d_owner, 0.05));
END IF;
-- Calculate absolute bounds
lower_bound := ROUND(p_bidmetric * (1 + lower_pct));
upper_bound := ROUND(p_bidmetric * (1 + upper_pct));
lower_percent := ROUND(lower_pct * 100, 2);
upper_percent := ROUND(upper_pct * 100, 2);
RETURN QUERY
SELECT lower_bound,
    upper_bound,
    lower_percent,
    upper_percent;
END;
$$ LANGUAGE plpgsql;
-- Function to accept a bid
CREATE OR REPLACE FUNCTION accept_bid(p_bid_id UUID, p_seller_id UUID) RETURNS TABLE(
        status VARCHAR(20),
        soft_lock_until TIMESTAMP,
        message TEXT
    ) AS $$
DECLARE v_property_id UUID;
v_property_owner UUID;
v_bid_amount NUMERIC;
BEGIN -- Get bid details
SELECT b.property_id,
    p.user_id,
    b.amount INTO v_property_id,
    v_property_owner,
    v_bid_amount
FROM bids b
    JOIN properties p ON b.property_id = p.id
WHERE b.id = p_bid_id;
-- Validate seller owns property
IF v_property_owner != p_seller_id THEN RAISE EXCEPTION 'Unauthorized: Only property owner can accept bids';
END IF;
-- Update bid status
UPDATE bids
SET status = 'accepted',
    accepted_at = now(),
    soft_lock_until = now() + INTERVAL '24 hours'
WHERE id = p_bid_id;
-- Mark property as sold (optional - can keep it for 24hr soft lock)
UPDATE properties
SET status = 'under_contract'
WHERE id = v_property_id;
-- Create audit log
INSERT INTO audit_logs (
        event_type,
        user_id,
        property_id,
        bid_id,
        metadata
    )
VALUES (
        'bid_accepted',
        p_seller_id,
        v_property_id,
        p_bid_id,
        jsonb_build_object(
            'bid_amount',
            v_bid_amount,
            'soft_lock_until',
            now() + INTERVAL '24 hours'
        )
    );
-- Return updated status
RETURN QUERY
SELECT 'accepted'::VARCHAR(20),
    (now() + INTERVAL '24 hours')::TIMESTAMP,
    'Bid accepted successfully. Payment processing will begin within 24 hours.'::TEXT;
END;
$$ LANGUAGE plpgsql;
-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT,
    INSERT,
    UPDATE ON properties TO anon,
    authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON bids TO anon,
    authenticated;
GRANT SELECT ON valuations TO anon,
    authenticated;
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT ON builder_profiles TO anon,
    authenticated;
-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN properties.original_listing_price IS 'Owner asking price - must be within ±10% of bidmetric_price';
COMMENT ON COLUMN properties.bidmetric_price IS 'Static AI-computed fair market value - does NOT change with bids';
COMMENT ON COLUMN properties.market_price IS 'Base market price (sqft × local avg rate)';
COMMENT ON COLUMN properties.owner_timer_expiry IS 'Motivated sale deadline - shows countdown in UI';
COMMENT ON COLUMN properties.override_flag IS 'Admin override for owner price validation';
COMMENT ON COLUMN bids.soft_lock_until IS '24-hour hold after acceptance for payment processing';
COMMENT ON TABLE audit_logs IS 'Immutable log of all bid and property actions for dispute resolution';