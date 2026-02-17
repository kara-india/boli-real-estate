-- ============================================================================
-- MIGRATION 009: Bidding Logic Refinement & Owner Insights
-- ============================================================================
-- 1. Update Properties Schema
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_notes TEXT,
    ADD COLUMN IF NOT EXISTS connectivity_highlights JSONB DEFAULT '{
    "airport": false,
    "metro": false,
    "township": false,
    "premium_area": false,
    "greenery": false
}'::JSONB;
-- 2. Refactor place_bid to support bidding below listing price but above highest bid
CREATE OR REPLACE FUNCTION place_bid(p_property_id UUID, p_amount NUMERIC) RETURNS VOID AS $$
DECLARE v_highest_bid NUMERIC;
v_owner_price NUMERIC;
v_market_price NUMERIC;
v_ai_price NUMERIC;
v_min_allowed NUMERIC;
v_max_allowed NUMERIC;
BEGIN -- 1. Get current benchmarks
SELECT original_listing_price,
    market_price,
    bidmetric_price INTO v_owner_price,
    v_market_price,
    v_ai_price
FROM properties
WHERE id = p_property_id FOR
UPDATE;
-- 2. Get current highest bid
SELECT COALESCE(MAX(amount), 0) INTO v_highest_bid
FROM bids
WHERE property_id = p_property_id;
-- 3. Calculate allowed range based on user's new logic
-- Case 1: Owner > Market (or AI)
-- Range: -5% Market to +5% AI
-- Case 2: Owner < Market
-- Range: -5% Owner to +5% AI
IF v_owner_price >= COALESCE(v_market_price, v_ai_price) THEN v_min_allowed := COALESCE(v_market_price, v_ai_price) * 0.95;
ELSE v_min_allowed := v_owner_price * 0.95;
END IF;
v_max_allowed := v_ai_price * 1.05;
-- 4. Validation Checks
-- A. Bid must be > highest existing bid
IF p_amount <= v_highest_bid THEN RAISE EXCEPTION 'Competitive bidding required: Offer must exceed the current highest bid of ₹%',
ROUND(v_highest_bid / 100000, 2) || 'L';
END IF;
-- B. Range Check (Business Rules)
IF p_amount < v_min_allowed
OR p_amount > v_max_allowed THEN RAISE EXCEPTION 'Offer outside authorized range (₹%L - ₹%L). Align your bid closer to Market/AI valuation.',
ROUND(v_min_allowed / 100000, 2),
ROUND(v_max_allowed / 100000, 2);
END IF;
-- 5. Insert new Bid
INSERT INTO bids (property_id, bidder_id, amount, status)
VALUES (p_property_id, auth.uid(), p_amount, 'placed');
-- 6. Update Property Price (Representing Current High Offer)
UPDATE properties
SET price = p_amount
WHERE id = p_property_id;
-- 7. Mark other bids as 'outbid'
UPDATE bids
SET status = 'outbid'
WHERE property_id = p_property_id
    AND id NOT IN (
        SELECT id
        FROM bids
        WHERE property_id = p_property_id
        ORDER BY amount DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Seed Insights for existing properties
UPDATE properties
SET owner_notes = 'This property is a hidden gem. High-floor unit with unobstructed sunset views. Most 2BHKs here lack the dedicated utility area which this unit has.',
    connectivity_highlights = '{
        "airport": true,
        "metro": true,
        "township": false,
        "premium_area": true,
        "greenery": true
    }'::JSONB
WHERE title LIKE '%Mira Road%';
UPDATE properties
SET owner_notes = 'Luxury villa in the most quiet pocket of Thane. Imported marble flooring and a private terrace garden that is perfect for hosting.',
    connectivity_highlights = '{
        "airport": false,
        "metro": true,
        "township": true,
        "premium_area": true,
        "greenery": true
    }'::JSONB
WHERE title LIKE '%Villa%';
UPDATE properties
SET owner_notes = 'Efficient layout with zero space wastage. The building is well-maintained and has a very strong residents association with regular community events.',
    connectivity_highlights = '{
        "airport": true,
        "metro": false,
        "township": false,
        "premium_area": false,
        "greenery": false
    }'::JSONB
WHERE owner_notes IS NULL;