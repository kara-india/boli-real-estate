-- ============================================================================
-- MIGRATION 016: Data Enrichment & Partner Boosting
-- ============================================================================
-- 1. Add is_boosted to agents for premium placement
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
-- 2. Add is_boosted to properties for high-interest labels
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
-- 3. Seed high-fidelity 'Direct from Owner' properties to fix 0 listings issue
-- This ensures /listings is populated with BidMetric AI valuation data
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
        description,
        type,
        location,
        image_url,
        top5_factors,
        status
    )
VALUES (
        'Panoramic 3BHK Penthouse, Mira Road East',
        'Mira Road',
        'Mira Road East',
        1650,
        3,
        3,
        19500000,
        18800000,
        19000000,
        95,
        'Stunning corner penthouse with unobstructed city views. Owner selling directly for immediate relocation.',
        'Apartment',
        'Sector 4, Mira Road East',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
        '[{"factor": "View Premium", "impact": 1200000, "direction": "positive"}, {"factor": "Floor Height", "impact": 500000, "direction": "positive"}]',
        'active'
    ),
    (
        'Modern 2BHK near Beverly Park',
        'Mira Road',
        'Beverly Park',
        1100,
        2,
        2,
        9500000,
        9800000,
        9700000,
        88,
        'Well-ventilated unit with modular kitchen and piped gas. Listed below market rate for quick closure.',
        'Apartment',
        'Beverly Park, Mira Road',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop',
        '[{"factor": "Builder Trust", "impact": 400000, "direction": "positive"}, {"factor": "Locality Demand", "impact": 300000, "direction": "positive"}]',
        'active'
    ),
    (
        'Compact 1BHK, Shanti Park',
        'Mira Road',
        'Shanti Park',
        680,
        1,
        1,
        5800000,
        5600000,
        5700000,
        75,
        'Ideal for first-time buyers or investors. High rental yield in this sector.',
        'Apartment',
        'Shanti Park, Mira Road',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2070&auto=format&fit=crop',
        '[{"factor": "Proximity to Station", "impact": 600000, "direction": "positive"}]',
        'active'
    ),
    (
        'Luxury 4BHK Villa in Delta Gardens',
        'Mira Road',
        'Mira Road East',
        2800,
        4,
        4,
        42000000,
        40000000,
        41000000,
        92,
        'Limited edition villa with private garden and servant quarters. Premium BidMetric Verified listing.',
        'Villa',
        'Delta Gardens, Mira Road',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2028&auto=format&fit=crop',
        '[{"factor": "Exclusivity", "impact": 2500000, "direction": "positive"}]',
        'active'
    ),
    (
        'Semi-furnished 2BHK, Kanakia Park',
        'Mira Road',
        'Kanakia Park',
        1020,
        2,
        2,
        8900000,
        8700000,
        8800000,
        90,
        'Gently used apartment in premium Kanakia complex. High-end amenities included.',
        'Apartment',
        'Kanakia Park, Mira Road',
        'https://images.unsplash.com/photo-1512918766674-ed62b9049a37?q=80&w=2070&auto=format&fit=crop',
        '[{"factor": "Maintenance Quality", "impact": 300000, "direction": "positive"}]',
        'active'
    ),
    (
        'Prime Commercial Shop, Station Road',
        'Mira Road',
        'Mira Road West',
        450,
        0,
        1,
        12500000,
        13000000,
        12800000,
        80,
        'High footfall location near station. Perfect for retail or clinic.',
        'Commercial',
        'Station Road, Mira Road West',
        'https://images.unsplash.com/photo-1582653280603-75a421a9bd2a?q=80&w=2070&auto=format&fit=crop',
        '[{"factor": "Business Potential", "impact": 1500000, "direction": "positive"}]',
        'active'
    );
-- 4. Boost Top Partners for 'Browse Partners' section
UPDATE agents
SET is_boosted = true
WHERE name IN (
        'Mira Road Properties & Co.',
        'Global Space Solutions',
        'Kanakia Guru',
        'Royal Homes'
    );
-- 5. Boost high-quality properties
UPDATE properties
SET is_boosted = true
WHERE title LIKE '%Panoramic 3BHK%'
    OR title LIKE '%Luxury 4BHK%';
-- 6. Ensure some properties have Motivated Seller status (expiry timers)
UPDATE properties
SET owner_timer_expiry = NOW() + INTERVAL '12 days'
WHERE title LIKE '%2BHK near Beverly Park%';
UPDATE properties
SET owner_timer_expiry = NOW() + INTERVAL '45 days'
WHERE title LIKE '%3BHK Penthouse%';