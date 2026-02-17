-- 010_seed_cleanup.sql
-- Ensure original_listing_price is set for all properties
UPDATE properties
SET original_listing_price = price
WHERE original_listing_price IS NULL;
-- Ensure market_price is set for all properties (default to bidmetric - 5%)
UPDATE properties
SET market_price = ROUND(bidmetric_price * 0.95)
WHERE market_price IS NULL;