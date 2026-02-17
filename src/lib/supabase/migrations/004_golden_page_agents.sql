-- ============================================================================
-- MIGRATION 004: Golden Page / Agent Pages Feature
-- ============================================================================
-- Purpose: Enable broker-first growth with viral agent pages
-- Features: Agent profiles, listings, buyer requests, ₹1 Boost, referrals
-- ============================================================================
-- ============================================================================
-- 1. AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identity
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    -- Profile
    photo_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    -- Status
    golden_page_active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    founding_broker BOOLEAN DEFAULT false,
    -- First 500 brokers
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    -- Analytics
    total_page_views INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    -- Referral
    referred_by UUID REFERENCES agents(id),
    referral_code VARCHAR(50) UNIQUE,
    -- Admin
    status VARCHAR(50) DEFAULT 'active',
    -- active, suspended, deleted
    admin_notes TEXT
);
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_phone ON agents(phone);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at);
-- ============================================================================
-- 2. AGENT LISTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    location VARCHAR(500) NOT NULL,
    -- Attributes (JSONB for flexibility)
    attrs JSONB DEFAULT '{}',
    -- {beds: 2, baths: 2, area: 950, type: "apartment"}
    -- Media
    images TEXT [] DEFAULT '{}',
    -- Array of image URLs
    primary_image TEXT,
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    -- active, sold, rented, deleted
    -- Boost
    is_boosted BOOLEAN DEFAULT false,
    boosted_until TIMESTAMP,
    -- Analytics
    views INTEGER DEFAULT 0,
    requests INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_agent_listings_agent_id ON agent_listings(agent_id);
CREATE INDEX idx_agent_listings_status ON agent_listings(status);
CREATE INDEX idx_agent_listings_is_boosted ON agent_listings(is_boosted);
CREATE INDEX idx_agent_listings_created_at ON agent_listings(created_at DESC);
-- ============================================================================
-- 3. BUYER REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS buyer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- References
    listing_id UUID NOT NULL REFERENCES agent_listings(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    -- Buyer Info
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    buyer_email VARCHAR(255),
    message TEXT,
    -- Visit Preference
    preferred_visit_date DATE,
    preferred_visit_time TIME,
    -- Attachments
    attachments TEXT [],
    -- URLs to uploaded files
    -- Status
    status VARCHAR(50) DEFAULT 'new',
    -- new, contacted, scheduled, closed, spam
    agent_notes TEXT,
    -- Source Tracking
    source VARCHAR(100),
    -- whatsapp_share, direct, search, referral
    referrer_agent_id UUID REFERENCES agents(id),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    contacted_at TIMESTAMP,
    closed_at TIMESTAMP
);
CREATE INDEX idx_buyer_requests_listing_id ON buyer_requests(listing_id);
CREATE INDEX idx_buyer_requests_agent_id ON buyer_requests(agent_id);
CREATE INDEX idx_buyer_requests_status ON buyer_requests(status);
CREATE INDEX idx_buyer_requests_created_at ON buyer_requests(created_at DESC);
-- ============================================================================
-- 4. BOOSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- References
    listing_id UUID NOT NULL REFERENCES agent_listings(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    -- Boost Details
    start_at TIMESTAMP DEFAULT NOW(),
    end_at TIMESTAMP NOT NULL,
    duration_hours INTEGER DEFAULT 24,
    -- Pricing
    price_paid NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) DEFAULT 1000.00,
    promo_tag VARCHAR(100),
    -- "launch_offer", "referral_bonus", etc.
    -- Payment
    payment_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- pending, completed, failed, refunded
    payment_method VARCHAR(50),
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    -- active, expired, cancelled
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_boosts_listing_id ON boosts(listing_id);
CREATE INDEX idx_boosts_agent_id ON boosts(agent_id);
CREATE INDEX idx_boosts_status ON boosts(status);
CREATE INDEX idx_boosts_end_at ON boosts(end_at);
-- ============================================================================
-- 5. ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Event
    event_type VARCHAR(100) NOT NULL,
    -- agent_created, listing_created, page_shared, etc.
    event_data JSONB DEFAULT '{}',
    -- References
    agent_id UUID REFERENCES agents(id),
    listing_id UUID REFERENCES agent_listings(id),
    request_id UUID REFERENCES buyer_requests(id),
    boost_id UUID REFERENCES boosts(id),
    -- Session
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    -- Attribution
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_agent_id ON analytics_events(agent_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
-- ============================================================================
-- 6. REFERRALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Referrer & Referee
    referrer_agent_id UUID NOT NULL REFERENCES agents(id),
    referee_agent_id UUID NOT NULL REFERENCES agents(id),
    -- Reward
    reward_type VARCHAR(50),
    -- free_boost, discount, badge
    reward_claimed BOOLEAN DEFAULT false,
    reward_claimed_at TIMESTAMP,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_agent_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_agent_id);
-- ============================================================================
-- 7. SHARE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS share_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Agent & Listing
    agent_id UUID NOT NULL REFERENCES agents(id),
    listing_id UUID REFERENCES agent_listings(id),
    -- NULL if sharing agent page
    -- Share Details
    channel VARCHAR(50) NOT NULL,
    -- whatsapp, sms, copy_link, share_image
    short_link VARCHAR(255),
    -- Clicks
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    -- Conversions
    signups INTEGER DEFAULT 0,
    requests INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    last_clicked_at TIMESTAMP
);
CREATE INDEX idx_share_events_agent_id ON share_events(agent_id);
CREATE INDEX idx_share_events_short_link ON share_events(short_link);
-- ============================================================================
-- 8. BOOST PROMO CONFIG TABLE (Admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS boost_promo_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Promo Details
    promo_name VARCHAR(100) UNIQUE NOT NULL,
    promo_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) DEFAULT 1000.00,
    -- Limits
    max_redemptions INTEGER,
    -- NULL = unlimited
    current_redemptions INTEGER DEFAULT 0,
    -- Eligibility
    eligible_agents TEXT [],
    -- NULL = all agents, or array of agent IDs
    first_n_agents INTEGER,
    -- e.g., first 500 agents
    -- Validity
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    -- Status
    active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Insert default ₹1 launch promo
INSERT INTO boost_promo_config (
        promo_name,
        promo_price,
        original_price,
        max_redemptions,
        first_n_agents,
        active
    )
VALUES ('launch_offer', 1.00, 1000.00, 500, 500, true) ON CONFLICT (promo_name) DO NOTHING;
-- ============================================================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================================================
-- Function: Update agent stats
CREATE OR REPLACE FUNCTION update_agent_stats() RETURNS TRIGGER AS $$ BEGIN IF TG_TABLE_NAME = 'agent_listings'
    AND TG_OP = 'INSERT' THEN
UPDATE agents
SET total_listings = total_listings + 1
WHERE id = NEW.agent_id;
END IF;
IF TG_TABLE_NAME = 'buyer_requests'
AND TG_OP = 'INSERT' THEN
UPDATE agents
SET total_requests = total_requests + 1
WHERE id = NEW.agent_id;
UPDATE agent_listings
SET requests = requests + 1
WHERE id = NEW.listing_id;
END IF;
IF TG_TABLE_NAME = 'share_events'
AND TG_OP = 'INSERT' THEN
UPDATE agents
SET total_shares = total_shares + 1
WHERE id = NEW.agent_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers
CREATE TRIGGER trigger_update_agent_stats_listings
AFTER
INSERT ON agent_listings FOR EACH ROW EXECUTE FUNCTION update_agent_stats();
CREATE TRIGGER trigger_update_agent_stats_requests
AFTER
INSERT ON buyer_requests FOR EACH ROW EXECUTE FUNCTION update_agent_stats();
CREATE TRIGGER trigger_update_agent_stats_shares
AFTER
INSERT ON share_events FOR EACH ROW EXECUTE FUNCTION update_agent_stats();
-- Function: Auto-expire boosts
CREATE OR REPLACE FUNCTION expire_boosts() RETURNS void AS $$ BEGIN
UPDATE boosts
SET status = 'expired'
WHERE end_at < NOW()
    AND status = 'active';
UPDATE agent_listings
SET is_boosted = false
WHERE id IN (
        SELECT listing_id
        FROM boosts
        WHERE status = 'expired'
            AND is_boosted = true
    );
END;
$$ LANGUAGE plpgsql;
-- Function: Generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(agent_slug TEXT) RETURNS TEXT AS $$ BEGIN RETURN UPPER(SUBSTRING(MD5(agent_slug || NOW()::TEXT), 1, 8));
END;
$$ LANGUAGE plpgsql;
-- Function: Check boost promo eligibility
CREATE OR REPLACE FUNCTION check_boost_promo_eligibility(
        p_agent_id UUID,
        p_promo_name VARCHAR
    ) RETURNS JSONB AS $$
DECLARE v_promo RECORD;
v_agent_rank INTEGER;
v_eligible BOOLEAN := false;
v_reason TEXT := '';
BEGIN -- Get promo config
SELECT * INTO v_promo
FROM boost_promo_config
WHERE promo_name = p_promo_name
    AND active = true;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'eligible',
    false,
    'reason',
    'Promo not found or inactive'
);
END IF;
-- Check validity period
IF v_promo.valid_until IS NOT NULL
AND NOW() > v_promo.valid_until THEN RETURN jsonb_build_object('eligible', false, 'reason', 'Promo expired');
END IF;
-- Check max redemptions
IF v_promo.max_redemptions IS NOT NULL
AND v_promo.current_redemptions >= v_promo.max_redemptions THEN RETURN jsonb_build_object(
    'eligible',
    false,
    'reason',
    'Promo limit reached'
);
END IF;
-- Check first N agents
IF v_promo.first_n_agents IS NOT NULL THEN
SELECT COUNT(*) + 1 INTO v_agent_rank
FROM agents
WHERE created_at < (
        SELECT created_at
        FROM agents
        WHERE id = p_agent_id
    );
IF v_agent_rank > v_promo.first_n_agents THEN RETURN jsonb_build_object(
    'eligible',
    false,
    'reason',
    'Only first ' || v_promo.first_n_agents || ' agents eligible'
);
END IF;
END IF;
-- Eligible!
RETURN jsonb_build_object(
    'eligible',
    true,
    'promo_price',
    v_promo.promo_price,
    'original_price',
    v_promo.original_price,
    'discount_percent',
    ROUND(
        (1 - v_promo.promo_price / v_promo.original_price) * 100,
        2
    ),
    'slots_remaining',
    CASE
        WHEN v_promo.max_redemptions IS NOT NULL THEN v_promo.max_redemptions - v_promo.current_redemptions
        ELSE NULL
    END
);
END;
$$ LANGUAGE plpgsql;
-- Function: Create boost purchase
CREATE OR REPLACE FUNCTION create_boost_purchase(
        p_listing_id UUID,
        p_agent_id UUID,
        p_promo_name VARCHAR,
        p_payment_id VARCHAR,
        p_duration_hours INTEGER DEFAULT 24
    ) RETURNS JSONB AS $$
DECLARE v_eligibility JSONB;
v_boost_id UUID;
v_end_at TIMESTAMP;
BEGIN -- Check eligibility
v_eligibility := check_boost_promo_eligibility(p_agent_id, p_promo_name);
IF (v_eligibility->>'eligible')::BOOLEAN = false THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    v_eligibility->>'reason'
);
END IF;
-- Calculate end time
v_end_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;
-- Create boost
INSERT INTO boosts (
        listing_id,
        agent_id,
        end_at,
        duration_hours,
        price_paid,
        original_price,
        promo_tag,
        payment_id,
        payment_status,
        status
    )
VALUES (
        p_listing_id,
        p_agent_id,
        v_end_at,
        p_duration_hours,
        (v_eligibility->>'promo_price')::NUMERIC,
        (v_eligibility->>'original_price')::NUMERIC,
        p_promo_name,
        p_payment_id,
        'completed',
        'active'
    )
RETURNING id INTO v_boost_id;
-- Update listing
UPDATE agent_listings
SET is_boosted = true,
    boosted_until = v_end_at
WHERE id = p_listing_id;
-- Increment promo redemptions
UPDATE boost_promo_config
SET current_redemptions = current_redemptions + 1
WHERE promo_name = p_promo_name;
-- Log event
INSERT INTO analytics_events (
        event_type,
        agent_id,
        listing_id,
        boost_id,
        event_data
    )
VALUES (
        'boost_purchased',
        p_agent_id,
        p_listing_id,
        v_boost_id,
        jsonb_build_object(
            'promo_name',
            p_promo_name,
            'price_paid',
            v_eligibility->>'promo_price',
            'duration_hours',
            p_duration_hours
        )
    );
RETURN jsonb_build_object(
    'success',
    true,
    'boost_id',
    v_boost_id,
    'end_at',
    v_end_at,
    'price_paid',
    v_eligibility->>'promo_price'
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
-- Public can view active agents and listings
CREATE POLICY "Public can view active agents" ON agents FOR
SELECT USING (
        status = 'active'
        AND golden_page_active = true
    );
CREATE POLICY "Public can view active listings" ON agent_listings FOR
SELECT USING (status = 'active');
-- Agents can manage their own data
CREATE POLICY "Agents can update own profile" ON agents FOR
UPDATE USING (auth.uid()::TEXT = id::TEXT);
CREATE POLICY "Agents can insert own listings" ON agent_listings FOR
INSERT WITH CHECK (auth.uid()::TEXT = agent_id::TEXT);
CREATE POLICY "Agents can view own requests" ON buyer_requests FOR
SELECT USING (auth.uid()::TEXT = agent_id::TEXT);
-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================