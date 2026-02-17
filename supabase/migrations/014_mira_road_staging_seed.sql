-- ============================================================================
-- MIGRATION 014: Mira Road Staging Dataset (150 Listings, 30 Golden Pages)
-- ============================================================================
-- 1. Clear existing dummy data (Staging mode)
TRUNCATE TABLE agent_listings CASCADE;
TRUNCATE TABLE agents CASCADE;
DELETE FROM properties;
-- Clear old properties from early migrations
-- 2. Seed 30 Golden Pages (Mix of RERA Sellers and Channel Partners)
-- We use a series of inserts with realistic Mira Road names
INSERT INTO agents (
        id,
        name,
        slug,
        phone,
        email,
        bio,
        location,
        verified,
        rera_verified,
        founding_broker,
        partner_type,
        rating,
        response_rate_percent,
        total_listings
    )
VALUES (
        gen_random_uuid(),
        'Mira Road Properties & Co.',
        'mira-road-properties-401107',
        '9820011221',
        'contact@miraprop.com',
        'Top-rated RERA authorized dealer in Mira Road East. Specialized in Kanakia and Beverly Park projects.',
        'Mira Road East',
        true,
        true,
        true,
        'rera_seller',
        4.8,
        95,
        12
    ),
    (
        gen_random_uuid(),
        'Bhayandar Realty',
        'bhayandar-realty-401105',
        '9820011222',
        'info@bhayandarrealty.in',
        'Trusted name for Bhayandar East and West residential sales.',
        'Bhayandar East',
        true,
        true,
        false,
        'rera_seller',
        4.5,
        88,
        8
    ),
    (
        gen_random_uuid(),
        'Global Space Solutions',
        'global-space-401107',
        '9820011223',
        'deals@globalspace.com',
        'Channel Partner for Lodha and Kalpataru projects in MMR.',
        'Mira Road East',
        true,
        false,
        false,
        'channel_partner',
        4.2,
        92,
        15
    ),
    (
        gen_random_uuid(),
        'Shanti Park Estates',
        'shanti-park-estates-401107',
        '9820011224',
        'sales@shantipark.com',
        'Exclusive listings in Shanti Park and Poonam Sagar.',
        'Shanti Park',
        true,
        true,
        false,
        'rera_seller',
        4.7,
        98,
        6
    );
-- For Brevity, I will generate more using a loop or block in SQL for the remaining 26
DO $$
DECLARE i INTEGER;
agent_id UUID;
agent_names TEXT [] := ARRAY ['Kanakia Guru', 'Beverly Hills Realty', 'Silver Homes', 'Golden Nest Associates', 'Diamond Property Hub', 'Delta Housing', 'Mira Prime', 'Royal Homes', 'Elite Space', 'Prime Square', 'Metro Homes', 'Station Side Properties', 'Kashimira Key', 'Pleasant Park Deals', 'Green View Realtors', 'Urban Living', 'Square Yards Mira', 'Hometown Realty', 'Focus Real Estate', 'Direct Deals', 'Broker Point', 'Asset Advisors', 'Wealth Builders', 'Cornerstone', 'Foundation Realty', 'Zenith Homes'];
localities TEXT [] := ARRAY ['Mira Road East', 'Mira Road West', 'Bhayandar East', 'Bhayandar West', 'Kashimira', 'Shanti Park', 'Poonam Sagar', 'Kanakia Park', 'Beverly Park', 'Pleasant Park'];
BEGIN FOR i IN 1..26 LOOP
INSERT INTO agents (
        name,
        slug,
        phone,
        email,
        bio,
        location,
        verified,
        rera_verified,
        partner_type,
        rating,
        response_rate_percent
    )
VALUES (
        agent_names [i],
        lower(replace(agent_names [i], ' ', '-')) || '-' || (401100 + i),
        '98300' || LPAD(i::text, 5, '0'),
        lower(replace(agent_names [i], ' ', '.')) || '@example.com',
        'Professional real estate consultancy serving ' || localities [(i % 10) + 1] || '.',
        localities [(i % 10) + 1],
        (i % 2 = 0),
        (i % 3 = 0),
        CASE
            WHEN i % 2 = 0 THEN 'rera_seller'
            ELSE 'channel_partner'
        END,
        (3.5 + (random() * 1.5))::numeric(2, 1),
        (70 + (random() * 30))::integer
    )
RETURNING id INTO agent_id;
END LOOP;
END $$;
-- 3. Seed 150 Agent Listings across Mira Road
-- 1/2/3 BHK, Shops, Builder Floors
DO $$
DECLARE a_id UUID;
l_idx INTEGER := 1;
locality TEXT;
localities TEXT [] := ARRAY ['Mira Road East', 'Mira Road West', 'Bhayandar East', 'Bhayandar West', 'Kashimira', 'Shanti Park', 'Poonam Sagar', 'Kanakia Park', 'Beverly Park', 'Pleasant Park'];
prop_titles TEXT [] := ARRAY ['Spacious 1BHK with Balcony', 'Modern 2BHK near Metro', 'Semi-furnished 1BHK', 'Premium 3BHK Penthouse', 'Ready to Move 2BHK', 'Affordable 1RK for Investment', 'Commercial Shop in Prime Area', 'Independent Floor near Station', 'Luxury 2BHK with City View', 'Cozy 1BHK in Gated Community'];
prop_prices NUMERIC [] := ARRAY [4500000, 7800000, 5200000, 14500000, 8500000, 3200000, 6500000, 9500000, 8900000, 4800000];
prop_sqft INTEGER [] := ARRAY [650, 950, 680, 1650, 1050, 400, 350, 1200, 1100, 700];
BEGIN FOR a_id IN
SELECT id
FROM agents LOOP FOR i IN 1..5 LOOP -- 5 listings per agent = 150 total
    locality := localities [((l_idx + i) % 10) + 1];
INSERT INTO agent_listings (
        agent_id,
        title,
        description,
        price,
        location,
        attrs,
        primary_image,
        is_boosted,
        status
    )
VALUES (
        a_id,
        prop_titles [((l_idx + i) % 10) + 1] || ' at ' || locality,
        'Excellent ' || prop_titles [((l_idx + i) % 10) + 1] || ' available for immediate sale. Located in the heart of ' || locality || '. Very close to transport, malls, and schools.',
        prop_prices [((l_idx + i) % 10) + 1] + (random() * 500000),
        locality || ', Mira Road',
        jsonb_build_object(
            'beds',
            CASE
                WHEN prop_titles [((l_idx + i) % 10) + 1] ILIKE '%3BHK%' THEN 3
                WHEN prop_titles [((l_idx + i) % 10) + 1] ILIKE '%2BHK%' THEN 2
                ELSE 1
            END,
            'baths',
            CASE
                WHEN prop_titles [((l_idx + i) % 10) + 1] ILIKE '%3BHK%' THEN 3
                ELSE 2
            END,
            'area',
            prop_sqft [((l_idx + i) % 10) + 1],
            'type',
            CASE
                WHEN prop_titles [((l_idx + i) % 10) + 1] ILIKE '%Shop%' THEN 'Commercial'
                ELSE 'Apartment'
            END
        ),
        'https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357?q=80&w=2028&auto=format&fit=crop',
        (random() < 0.2),
        -- 20% boosted
        'active'
    );
END LOOP;
l_idx := l_idx + 1;
END LOOP;
END $$;
-- 4. Sync boosted flag to agent_listings.boost_timestamp for sorting
UPDATE agent_listings
SET boost_timestamp = NOW() - (random() * INTERVAL '24 hours')
WHERE is_boosted = true;