-- =====================================================
-- Seed Data: 12 Realistic Properties
-- 9 normal (owner > bidmetric)
-- 2-3 motivated sales (owner < bidmetric with timer)
-- =====================================================
-- First, insert builder profiles
INSERT INTO builder_profiles (
        id,
        name,
        rera_registered,
        rera_number,
        on_time_delivery_rate,
        total_projects,
        completed_projects,
        avg_customer_rating,
        resale_velocity_index,
        legal_issues_count,
        confidence_score,
        confidence_level,
        description
    )
VALUES (
        gen_random_uuid(),
        'Lodha Group',
        true,
        'P51800000001',
        92,
        47,
        42,
        4.3,
        85,
        1,
        85,
        'high',
        'Premium real estate developer with pan-India presence'
    ),
    (
        gen_random_uuid(),
        'Godrej Properties',
        true,
        'P51700000002',
        88,
        35,
        32,
        4.5,
        88,
        0,
        88,
        'high',
        'Trusted name in residential and commercial developments'
    ),
    (
        gen_random_uuid(),
        'Prestige Group',
        true,
        'P51900000003',
        85,
        28,
        25,
        4.2,
        80,
        2,
        80,
        'high',
        'Leading South India developer'
    ),
    (
        gen_random_uuid(),
        'Runwal Developers',
        true,
        'P51800000004',
        75,
        22,
        18,
        3.9,
        70,
        3,
        72,
        'medium',
        'Established Mumbai-based builder'
    ),
    (
        gen_random_uuid(),
        'Shapoorji Pallonji',
        true,
        'P51800000005',
        78,
        30,
        26,
        4.0,
        75,
        2,
        75,
        'medium',
        'Heritage builder with 150+ years legacy'
    ),
    (
        gen_random_uuid(),
        'Independent Builders',
        false,
        null,
        65,
        8,
        5,
        3.2,
        45,
        8,
        52,
        'low',
        'Local developer group'
    ) ON CONFLICT (name) DO NOTHING;
-- Get builder IDs for reference
DO $$
DECLARE lodha_id UUID;
godrej_id UUID;
prestige_id UUID;
runwal_id UUID;
sp_id UUID;
independent_id UUID;
BEGIN
SELECT id INTO lodha_id
FROM builder_profiles
WHERE name = 'Lodha Group';
SELECT id INTO godrej_id
FROM builder_profiles
WHERE name = 'Godrej Properties';
SELECT id INTO prestige_id
FROM builder_profiles
WHERE name = 'Prestige Group';
SELECT id INTO runwal_id
FROM builder_profiles
WHERE name = 'Runwal Developers';
SELECT id INTO sp_id
FROM builder_profiles
WHERE name = 'Shapoorji Pallonji';
SELECT id INTO independent_id
FROM builder_profiles
WHERE name = 'Independent Builders';
-- =====================================================
-- Property 1: Bengaluru - Whitefield (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'BLR-001',
        '2 BHK Premium Apartment in Whitefield',
        'Modern 2 BHK with clubhouse, swimming pool, and 24/7 security. Walking distance to ITPL.',
        8500000,
        -- Owner asking ₹85L (6.25% above bidmetric)
        8000000,
        -- BidMetric ₹80L
        8050000,
        -- Market ₹80.5L
        7900000,
        -- Last comparable ₹79L
        'Whitefield, Bengaluru',
        950,
        'Apartment',
        2,
        2,
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        'available',
        'Prestige Group',
        prestige_id,
        4.7,
        80,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 2: Mumbai - Andheri West (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'MUM-002',
        '1 RK Compact Studio in Andheri West',
        'Ideal for working professionals. Close to Metro station and shopping centers.',
        12000000,
        -- Owner asking ₹1.2Cr (4.35% above bidmetric)
        11500000,
        -- BidMetric ₹1.15Cr
        11650000,
        -- Market ₹1.165Cr
        11400000,
        -- Last comparable ₹1.14Cr
        'Andheri West, Mumbai',
        380,
        'Studio',
        0,
        1,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'available',
        'Lodha Group',
        lodha_id,
        3.8,
        85,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 3: New Delhi - Dwarka (MOTIVATED SALE)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'DEL-003',
        '3 BHK Spacious Flat in Dwarka Sector 12',
        'Well-maintained property with park view. Owner relocating internationally.',
        14000000,
        -- Owner asking ₹1.4Cr (6.67% BELOW bidmetric - MOTIVATED!)
        15000000,
        -- BidMetric ₹1.5Cr
        14900000,
        -- Market ₹1.49Cr
        14850000,
        -- Last comparable ₹1.485Cr
        'Dwarka, New Delhi',
        1400,
        'Apartment',
        3,
        3,
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        'available',
        'Godrej Properties',
        godrej_id,
        5.2,
        88,
        now(),
        (now() + INTERVAL '90 days')::TIMESTAMP,
        -- 90-day countdown
        false
    );
-- =====================================================
-- Property 4: Pune - Hinjewadi (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'PUNE-004',
        '3 BHK Tech Park Adjacent in Hinjewadi Phase 2',
        'Prime IT corridor location. Excellent rental yield potential.',
        10500000,
        -- Owner asking ₹1.05Cr (5% above bidmetric)
        10000000,
        -- BidMetric ₹1Cr
        10100000,
        -- Market ₹1.01Cr
        9950000,
        -- Last comparable ₹99.5L
        'Hinjewadi Phase 2, Pune',
        1250,
        'Apartment',
        3,
        2,
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        'available',
        'Runwal Developers',
        runwal_id,
        6.1,
        72,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 5: Hyderabad - Gachibowli (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'HYD-005',
        '2 BHK in Financial District, Gachibowli',
        'IT hub proximity. Vastu-compliant layout. Ready to move.',
        7200000,
        -- Owner asking ₹72L (8% above bidmetric)
        6666666,
        -- BidMetric ₹66.67L
        6700000,
        -- Market ₹67L
        6550000,
        -- Last comparable ₹65.5L
        'Gachibowli, Hyderabad',
        1150,
        'Apartment',
        2,
        2,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        'available',
        'Prestige Group',
        prestige_id,
        5.5,
        80,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 6: Chennai - OMR (MOTIVATED SALE)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'CHN-006',
        '3 BHK Sea Facing Apartment on OMR',
        'Reduced for quick sale. Owner needs immediate funds for business expansion.',
        8800000,
        -- Owner asking ₹88L (8.51% BELOW bidmetric - MOTIVATED!)
        9620000,
        -- BidMetric ₹96.2L
        9600000,
        -- Market ₹96L
        9550000,
        -- Last comparable ₹95.5L
        'OMR, Chennai',
        1380,
        'Apartment',
        3,
        3,
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        'available',
        'Godrej Properties',
        godrej_id,
        4.3,
        88,
        now(),
        (now() + INTERVAL '60 days')::TIMESTAMP,
        -- 60-day countdown
        false
    );
-- =====================================================
-- Property 7: Mumbai - Mira Road East (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'MUM-007',
        '2 BHK Affordable Housing in Mira Road',
        'PMAY eligible. Near Metro Line 9 station. Family-friendly society.',
        6100000,
        -- Owner asking ₹61L (8.93% above bidmetric)
        5600000,
        -- BidMetric ₹56L
        5650000,
        -- Market ₹56.5L
        5500000,
        -- Last comparable ₹55L
        'Mira Road East, Mumbai',
        850,
        'Apartment',
        2,
        2,
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1',
        'available',
        'Lodha Group',
        lodha_id,
        6.8,
        85,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 8: Bengaluru - Sarjapur Road (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'BLR-008',
        '3 BHK Villa with Garden in Sarjapur',
        'Independent villa with 2-car parking. Gated community.',
        15000000,
        -- Owner asking ₹1.5Cr (7.14% above bidmetric)
        14000000,
        -- BidMetric ₹1.4Cr
        14100000,
        -- Market ₹1.41Cr
        13900000,
        -- Last comparable ₹1.39Cr
        'Sarjapur Road, Bengaluru',
        2100,
        'Villa',
        3,
        3,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        'available',
        'Prestige Group',
        prestige_id,
        5.9,
        80,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 9: NCR - Greater Noida (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'NCR-009',
        '2 BHK Affordable in Greater Noida West',
        'Under-construction project. Expected possession in 12 months.',
        4850000,
        -- Owner asking ₹48.5L (6.59% above bidmetric)
        4550000,
        -- BidMetric ₹45.5L
        4600000,
        -- Market ₹46L
        4500000,
        -- Last comparable ₹45L
        'Greater Noida West, NCR',
        920,
        'Apartment',
        2,
        2,
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
        'available',
        'Shapoorji Pallonji',
        sp_id,
        7.2,
        75,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 10: Mumbai - Thane West (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'MUM-010',
        '4 BHK Penthouse in Thane West',
        'Premium high-rise with 360° views. Private terrace garden.',
        18500000,
        -- Owner asking ₹1.85Cr (8.82% above bidmetric)
        17000000,
        -- BidMetric ₹1.7Cr
        17100000,
        -- Market ₹1.71Cr
        16900000,
        -- Last comparable ₹1.69Cr
        'Thane West, Mumbai',
        2200,
        'Penthouse',
        4,
        4,
        'https://images.unsplash.com/photo-1600607687644-c7171b42498b',
        'available',
        'Lodha Group',
        lodha_id,
        4.5,
        85,
        now(),
        null,
        false
    );
-- =====================================================
-- Property 11: Hyderabad - Kondapur (MOTIVATED SALE)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'HYD-011',
        '2 BHK in IT Corridor, Kondapur',
        'Owner relocated to USA. Price reduced for immediate sale.',
        6300000,
        -- Owner asking ₹63L (5.37% BELOW bidmetric - MOTIVATED!)
        6657000,
        -- BidMetric ₹66.57L
        6650000,
        -- Market ₹66.5L
        6600000,
        -- Last comparable ₹66L
        'Kondapur, Hyderabad',
        1050,
        'Apartment',
        2,
        2,
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
        'available',
        'Runwal Developers',
        runwal_id,
        6.4,
        72,
        now(),
        (now() + INTERVAL '75 days')::TIMESTAMP,
        -- 75-day countdown
        false
    );
-- =====================================================
-- Property 12: Pune - Kharadi (NORMAL)
-- =====================================================
INSERT INTO properties (
        id,
        title,
        description,
        original_listing_price,
        bidmetric_price,
        market_price,
        last_sale_comparable_price,
        location,
        sqft,
        type,
        bedrooms,
        bathrooms,
        image_url,
        status,
        builder,
        builder_id,
        confidence_interval,
        builder_confidence_score,
        valuation_last_updated,
        owner_timer_expiry,
        override_flag
    )
VALUES (
        'PUNE-012',
        '3 BHK Luxury Apartment in EON Free Zone',
        'Premium amenities including rooftop swimming pool and gym.',
        12500000,
        -- Owner asking ₹1.25Cr (9.65% above bidmetric)
        11400000,
        -- BidMetric ₹1.14Cr
        11500000,
        -- Market ₹1.15Cr
        11350000,
        -- Last comparable ₹1.135Cr
        'Kharadi, Pune',
        1600,
        'Apartment',
        3,
        3,
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
        'available',
        'Independent Builders',
        independent_id,
        8.1,
        52,
        now(),
        null,
        false
    );
END $$;
-- =====================================================
-- Calculate and update slider bounds for all properties
-- =====================================================
UPDATE properties
SET slider_lower_bound = bounds.lower_bound,
    slider_upper_bound = bounds.upper_bound
FROM (
        SELECT id,
            (
                SELECT lb.lower_bound
                FROM calculate_slider_bounds(
                        bidmetric_price,
                        original_listing_price,
                        last_sale_comparable_price
                    ) lb
            ) as lower_bound,
            (
                SELECT ub.upper_bound
                FROM calculate_slider_bounds(
                        bidmetric_price,
                        original_listing_price,
                        last_sale_comparable_price
                    ) ub
            ) as upper_bound
        FROM properties
    ) as bounds
WHERE properties.id = bounds.id;
-- =====================================================
-- Verification Query
-- =====================================================
SELECT id,
    title,
    location,
    original_listing_price / 100000.0 as owner_price_lakhs,
    bidmetric_price / 100000.0 as bidmetric_lakhs,
    market_price / 100000.0 as market_lakhs,
    ROUND(
        (
            (original_listing_price - bidmetric_price)::NUMERIC / bidmetric_price * 100
        ),
        2
    ) as owner_deviation_percent,
    CASE
        WHEN owner_timer_expiry IS NOT NULL THEN 'MOTIVATED'
        WHEN original_listing_price > bidmetric_price THEN 'PREMIUM'
        ELSE 'STANDARD'
    END as listing_type,
    CASE
        WHEN owner_timer_expiry IS NOT NULL THEN EXTRACT(
            DAY
            FROM (owner_timer_expiry - now())
        )::TEXT || ' days remaining'
        ELSE null
    END as countdown,
    builder_confidence_score,
    confidence_interval
FROM properties
ORDER BY CASE
        WHEN owner_timer_expiry IS NOT NULL THEN 0
        ELSE 1
    END,
    id;