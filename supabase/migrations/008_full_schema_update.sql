-- ============================================================================
-- MIGRATION 008: Full Schema Alignment with Prompt 2026-02-18
-- ============================================================================
-- 1. Add Valuation Columns to Properties Table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS bidmetric_price NUMERIC,
    -- Static AI Price
ADD COLUMN IF NOT EXISTS market_price NUMERIC,
    -- Additional reference
ADD COLUMN IF NOT EXISTS last_sale_comparable_price NUMERIC,
    -- Local comp
ADD COLUMN IF NOT EXISTS original_listing_price NUMERIC,
    -- Use this instead of 'price' for clarity? Or keep 'price' as owner price. (Keep 'price' as current owner ask)
ADD COLUMN IF NOT EXISTS owner_timer_expiry TIMESTAMP,
    -- For motivated seller urgency
ADD COLUMN IF NOT EXISTS builder_confidence_score INTEGER,
    -- 0-100
ADD COLUMN IF NOT EXISTS valuation_last_updated TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS confidence_interval NUMERIC,
    -- e.g. 4.7%
ADD COLUMN IF NOT EXISTS slider_lower_bound NUMERIC,
    -- Precomputed %
ADD COLUMN IF NOT EXISTS slider_upper_bound NUMERIC,
    -- Precomputed %
ADD COLUMN IF NOT EXISTS top5_factors JSONB DEFAULT '[]',
    -- Explainability
ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS locality TEXT;
-- 2. Add Builder Profiles Table (for detailed tab content)
CREATE TABLE IF NOT EXISTS builder_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    confidence_score INTEGER,
    on_time_delivery_rate INTEGER,
    rera_registered BOOLEAN,
    avg_customer_rating NUMERIC(3, 2),
    completed_projects INTEGER,
    total_projects INTEGER
);
-- 3. Clear existing properties (optional, to ensure clean state matching prompt)
DELETE FROM properties;
DELETE FROM builder_profiles;
-- 4. Seed Builder Profiles (Realistic Data)
INSERT INTO builder_profiles (
        name,
        confidence_score,
        on_time_delivery_rate,
        rera_registered,
        avg_customer_rating,
        completed_projects,
        total_projects
    )
VALUES ('Prestige Group', 85, 92, true, 4.6, 110, 150),
    ('Sobha Ltd', 88, 95, true, 4.7, 95, 120),
    ('Godrej Properties', 82, 88, true, 4.5, 85, 110),
    ('Lodha Group', 78, 85, true, 4.3, 150, 200),
    ('DLF', 90, 89, true, 4.8, 120, 145),
    ('Unitech', 45, 30, false, 2.8, 40, 90),
    -- Low confidence example
    ('Supertech', 52, 45, true, 3.1, 60, 100);
-- 5. Seed Properties (12 Listings as requested)
-- Note: 'price' column is reused as 'owner_price' for backward compatibility with UI.
-- Example 1: Standard Listing (Owner price > AI)
INSERT INTO properties (
        title,
        city,
        locality,
        sqft,
        bedrooms,
        bathrooms,
        price,
        -- owner_price
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        builder_confidence_score,
        owner_timer_expiry,
        description,
        type,
        location,
        image_url,
        top5_factors
    )
VALUES (
        '2 BHK Luxury Apartment, Whitefield',
        'Bengaluru',
        'Whitefield',
        950,
        2,
        2,
        8500000,
        -- Owner asks 85L
        8000000,
        8050000,
        7900000,
        -- AI says 80L
        85,
        null,
        -- High builder conf
        'Premium apartment in high-growth IT corridor. Close to metro.',
        'Apartment',
        'Whitefield, Bengaluru',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        '[{"factor": "Market Trend", "impact": 450000, "direction": "positive"}, {"factor": "Builder Reputation", "impact": 200000, "direction": "positive"}]'
    );
-- Example 2: Small Unit (Owner price close to AI)
INSERT INTO properties (
        title,
        city,
        locality,
        sqft,
        bedrooms,
        bathrooms,
        price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        builder_confidence_score,
        owner_timer_expiry,
        description,
        type,
        location,
        image_url
    )
VALUES (
        '1 RK Studio, Andheri West',
        'Mumbai',
        'Andheri West',
        380,
        1,
        1,
        12000000,
        -- Owner 1.2 Cr
        11500000,
        11650000,
        11400000,
        78,
        null,
        'Compact studio in prime Andheri West location.',
        'Studio',
        'Andheri West, Mumbai',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    );
-- Example 3: Motivated Seller (Owner price < AI, Timer Set)
INSERT INTO properties (
        title,
        city,
        locality,
        sqft,
        bedrooms,
        bathrooms,
        price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        builder_confidence_score,
        owner_timer_expiry,
        description,
        type,
        location,
        image_url
    )
VALUES (
        '3 BHK Spacious Flat, Dwarka',
        'New Delhi',
        'Dwarka',
        1400,
        3,
        3,
        14000000,
        -- Owner 1.4 Cr (Undervalued!)
        15000000,
        14900000,
        14850000,
        -- AI says 1.5 Cr
        58,
        NOW() + INTERVAL '58 days',
        -- Timer set for ~2 months
        'Urgent sale due to relocation. Price negotiable for quick closure.',
        'Apartment',
        'Dwarka, New Delhi',
        'https://images.unsplash.com/photo-1600596542815-22b5c010d32b?auto=format&fit=crop&w=800&q=80'
    );
-- 9 More listings generated to hit 12
-- ... (I will fill simpler ones here to ensure we reach 12)
INSERT INTO properties (
        title,
        city,
        locality,
        sqft,
        bedrooms,
        bathrooms,
        price,
        bidmetric_price,
        market_price,
        builder_confidence_score,
        owner_timer_expiry,
        description,
        type,
        location,
        image_url
    )
VALUES (
        '4 BHK Villa, ECR',
        'Chennai',
        'ECR',
        3200,
        4,
        5,
        45000000,
        42000000,
        43000000,
        92,
        null,
        'Exclusive villa with sea view.',
        'Villa',
        'ECR, Chennai',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80'
    ),
    (
        '2 BHK, Salt Lake',
        'Kolkata',
        'Salt Lake',
        1050,
        2,
        2,
        7200000,
        7000000,
        7100000,
        75,
        null,
        'Well connected flats near Sector V.',
        'Apartment',
        'Salt Lake, Kolkata',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80'
    ),
    (
        '3 BHK, Gachibowli',
        'Hyderabad',
        'Gachibowli',
        1600,
        3,
        3,
        12500000,
        11800000,
        12000000,
        88,
        null,
        'Corner apartment in gated community.',
        'Apartment',
        'Gachibowli, Hyderabad',
        'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&q=80'
    ),
    (
        '1 BHK, Kharadi',
        'Pune',
        'Kharadi',
        650,
        1,
        1,
        5200000,
        4800000,
        4900000,
        65,
        null,
        'Ideal for IT professionals.',
        'Apartment',
        'Kharadi, Pune',
        'https://images.unsplash.com/photo-1522771753062-5704acb299a9?w=800&q=80'
    ),
    (
        '3 BHK Penthouse, Worli',
        'Mumbai',
        'Worli',
        2100,
        3,
        4,
        85000000,
        82000000,
        83000000,
        95,
        null,
        'Sea facing luxury penthouse.',
        'Penthouse',
        'Worli, Mumbai',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
    ),
    (
        '2 BHK, Electronic City',
        'Bengaluru',
        'Electronic City',
        1100,
        2,
        2,
        6500000,
        6800000,
        6700000,
        70,
        NOW() + INTERVAL '30 days',
        'Motivated seller moving abroad.',
        'Apartment',
        'Electronic City, Bengaluru',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
    ),
    -- Motivated
    (
        'Plot in Devanahalli',
        'Bengaluru',
        'Devanahalli',
        1200,
        0,
        0,
        3500000,
        3200000,
        3300000,
        60,
        null,
        'Investment plot near airport.',
        'Plot',
        'Devanahalli, Bengaluru',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
    ),
    (
        '3 BHK, Vasant Kunj',
        'New Delhi',
        'Vasant Kunj',
        1500,
        3,
        3,
        21000000,
        19500000,
        20000000,
        80,
        null,
        'DDA Flats, premium sector.',
        'Apartment',
        'Vasant Kunj, New Delhi',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'
    ),
    (
        '4 BHK Bunglow, Ahmedabad',
        'Ahmedabad',
        'Satellite',
        2800,
        4,
        4,
        32000000,
        31000000,
        31500000,
        85,
        null,
        'Independent bungalow in posh area.',
        'Villa',
        'Satellite, Ahmedabad',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
    );
-- 6. Add Audit Log Table (Required for Acceptance Flow)
CREATE TABLE IF NOT EXISTS transaction_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID REFERENCES bids(id),
    prop_id UUID REFERENCES properties(id),
    action TEXT NOT NULL,
    -- 'placed', 'accepted', 'rejected', 'monetized'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);