-- ============================================================
-- BIDMETRIC: Realistic Market Trends Seed Data
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- First, clear existing market trends to avoid duplicates
DELETE FROM market_trends;

-- ============================================================
-- MIRA ROAD - Affordable Growth Corridor
-- Realistic range: ₹7,500 - ₹10,500/sqft (2022-2026)
-- Growth: ~8-10% YoY
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Mira Road', 'Apartment', '2022-01-01', 7200, 95),
('Mira Road', 'Apartment', '2022-02-01', 7250, 102),
('Mira Road', 'Apartment', '2022-03-01', 7320, 118),
('Mira Road', 'Apartment', '2022-04-01', 7400, 125),
('Mira Road', 'Apartment', '2022-05-01', 7450, 130),
('Mira Road', 'Apartment', '2022-06-01', 7520, 142),
('Mira Road', 'Apartment', '2022-07-01', 7600, 138),
('Mira Road', 'Apartment', '2022-08-01', 7680, 145),
('Mira Road', 'Apartment', '2022-09-01', 7750, 152),
('Mira Road', 'Apartment', '2022-10-01', 7820, 160),
('Mira Road', 'Apartment', '2022-11-01', 7900, 155),
('Mira Road', 'Apartment', '2022-12-01', 7980, 148),
('Mira Road', 'Apartment', '2023-01-01', 8100, 165),
('Mira Road', 'Apartment', '2023-02-01', 8180, 172),
('Mira Road', 'Apartment', '2023-03-01', 8280, 185),
('Mira Road', 'Apartment', '2023-04-01', 8350, 190),
('Mira Road', 'Apartment', '2023-05-01', 8420, 195),
('Mira Road', 'Apartment', '2023-06-01', 8500, 202),
('Mira Road', 'Apartment', '2023-07-01', 8580, 198),
('Mira Road', 'Apartment', '2023-08-01', 8680, 210),
('Mira Road', 'Apartment', '2023-09-01', 8780, 218),
('Mira Road', 'Apartment', '2023-10-01', 8850, 225),
('Mira Road', 'Apartment', '2023-11-01', 8950, 220),
('Mira Road', 'Apartment', '2023-12-01', 9050, 215),
('Mira Road', 'Apartment', '2024-01-01', 9200, 230),
('Mira Road', 'Apartment', '2024-02-01', 9280, 238),
('Mira Road', 'Apartment', '2024-03-01', 9380, 245),
('Mira Road', 'Apartment', '2024-04-01', 9450, 252),
('Mira Road', 'Apartment', '2024-05-01', 9520, 248),
('Mira Road', 'Apartment', '2024-06-01', 9620, 260),
('Mira Road', 'Apartment', '2024-07-01', 9700, 255),
('Mira Road', 'Apartment', '2024-08-01', 9800, 268),
('Mira Road', 'Apartment', '2024-09-01', 9900, 275),
('Mira Road', 'Apartment', '2024-10-01', 9980, 280),
('Mira Road', 'Apartment', '2024-11-01', 10080, 272),
('Mira Road', 'Apartment', '2024-12-01', 10180, 265),
('Mira Road', 'Apartment', '2025-01-01', 10350, 285),
('Mira Road', 'Apartment', '2025-02-01', 10420, 290),
('Mira Road', 'Apartment', '2025-03-01', 10500, 298),
('Mira Road', 'Apartment', '2025-04-01', 10580, 305),
('Mira Road', 'Apartment', '2025-05-01', 10680, 310),
('Mira Road', 'Apartment', '2025-06-01', 10780, 318),
('Mira Road', 'Apartment', '2025-07-01', 10880, 325),
('Mira Road', 'Apartment', '2025-08-01', 10980, 330),
('Mira Road', 'Apartment', '2025-09-01', 11100, 338),
('Mira Road', 'Apartment', '2025-10-01', 11200, 342),
('Mira Road', 'Apartment', '2025-11-01', 11320, 350),
('Mira Road', 'Apartment', '2025-12-01', 11450, 345),
('Mira Road', 'Apartment', '2026-01-01', 11600, 360),
('Mira Road', 'Apartment', '2026-02-01', 11720, 368);

-- ============================================================
-- THANE WEST - Premium Suburban Hub
-- Realistic range: ₹11,000 - ₹16,000/sqft (2022-2026)
-- Growth: ~7-8% YoY
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Thane West', 'Apartment', '2022-01-01', 11200, 72),
('Thane West', 'Apartment', '2022-02-01', 11280, 78),
('Thane West', 'Apartment', '2022-03-01', 11380, 85),
('Thane West', 'Apartment', '2022-04-01', 11480, 88),
('Thane West', 'Apartment', '2022-05-01', 11580, 92),
('Thane West', 'Apartment', '2022-06-01', 11700, 98),
('Thane West', 'Apartment', '2022-07-01', 11820, 95),
('Thane West', 'Apartment', '2022-08-01', 11950, 102),
('Thane West', 'Apartment', '2022-09-01', 12080, 108),
('Thane West', 'Apartment', '2022-10-01', 12200, 112),
('Thane West', 'Apartment', '2022-11-01', 12320, 108),
('Thane West', 'Apartment', '2022-12-01', 12450, 105),
('Thane West', 'Apartment', '2023-01-01', 12650, 115),
('Thane West', 'Apartment', '2023-02-01', 12780, 120),
('Thane West', 'Apartment', '2023-03-01', 12920, 128),
('Thane West', 'Apartment', '2023-04-01', 13050, 132),
('Thane West', 'Apartment', '2023-05-01', 13180, 138),
('Thane West', 'Apartment', '2023-06-01', 13320, 142),
('Thane West', 'Apartment', '2023-07-01', 13450, 138),
('Thane West', 'Apartment', '2023-08-01', 13580, 145),
('Thane West', 'Apartment', '2023-09-01', 13720, 150),
('Thane West', 'Apartment', '2023-10-01', 13850, 155),
('Thane West', 'Apartment', '2023-11-01', 13980, 152),
('Thane West', 'Apartment', '2023-12-01', 14120, 148),
('Thane West', 'Apartment', '2024-01-01', 14350, 160),
('Thane West', 'Apartment', '2024-02-01', 14480, 165),
('Thane West', 'Apartment', '2024-03-01', 14620, 172),
('Thane West', 'Apartment', '2024-04-01', 14750, 178),
('Thane West', 'Apartment', '2024-05-01', 14880, 175),
('Thane West', 'Apartment', '2024-06-01', 15020, 182),
('Thane West', 'Apartment', '2024-07-01', 15150, 178),
('Thane West', 'Apartment', '2024-08-01', 15280, 185),
('Thane West', 'Apartment', '2024-09-01', 15420, 190),
('Thane West', 'Apartment', '2024-10-01', 15550, 195),
('Thane West', 'Apartment', '2024-11-01', 15680, 192),
('Thane West', 'Apartment', '2024-12-01', 15820, 188),
('Thane West', 'Apartment', '2025-01-01', 16050, 200),
('Thane West', 'Apartment', '2025-06-01', 16550, 215),
('Thane West', 'Apartment', '2025-12-01', 17100, 225),
('Thane West', 'Apartment', '2026-01-01', 17350, 230),
('Thane West', 'Apartment', '2026-02-01', 17520, 238);

-- ============================================================
-- BORIVALI WEST - Established Premium Market
-- Realistic range: ₹18,000 - ₹24,000/sqft (2022-2026)
-- Growth: ~5-6% YoY (Mature market, slower growth)
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Borivali West', 'Apartment', '2022-01-01', 18200, 48),
('Borivali West', 'Apartment', '2022-03-01', 18450, 52),
('Borivali West', 'Apartment', '2022-06-01', 18800, 58),
('Borivali West', 'Apartment', '2022-09-01', 19150, 55),
('Borivali West', 'Apartment', '2022-12-01', 19500, 52),
('Borivali West', 'Apartment', '2023-03-01', 19950, 60),
('Borivali West', 'Apartment', '2023-06-01', 20350, 65),
('Borivali West', 'Apartment', '2023-09-01', 20750, 62),
('Borivali West', 'Apartment', '2023-12-01', 21150, 58),
('Borivali West', 'Apartment', '2024-03-01', 21650, 68),
('Borivali West', 'Apartment', '2024-06-01', 22100, 72),
('Borivali West', 'Apartment', '2024-09-01', 22550, 70),
('Borivali West', 'Apartment', '2024-12-01', 23000, 68),
('Borivali West', 'Apartment', '2025-03-01', 23550, 75),
('Borivali West', 'Apartment', '2025-06-01', 24050, 78),
('Borivali West', 'Apartment', '2025-09-01', 24550, 76),
('Borivali West', 'Apartment', '2025-12-01', 25050, 72),
('Borivali West', 'Apartment', '2026-01-01', 25350, 80),
('Borivali West', 'Apartment', '2026-02-01', 25580, 82);

-- ============================================================
-- BHAYANDAR EAST - Budget-Friendly Growth Corridor
-- Realistic range: ₹6,000 - ₹9,000/sqft (2022-2026)
-- Growth: ~9-11% YoY (High growth potential)
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Bhayandar East', 'Apartment', '2022-01-01', 6100, 85),
('Bhayandar East', 'Apartment', '2022-03-01', 6250, 92),
('Bhayandar East', 'Apartment', '2022-06-01', 6450, 98),
('Bhayandar East', 'Apartment', '2022-09-01', 6680, 105),
('Bhayandar East', 'Apartment', '2022-12-01', 6900, 100),
('Bhayandar East', 'Apartment', '2023-03-01', 7180, 112),
('Bhayandar East', 'Apartment', '2023-06-01', 7450, 118),
('Bhayandar East', 'Apartment', '2023-09-01', 7720, 125),
('Bhayandar East', 'Apartment', '2023-12-01', 7980, 120),
('Bhayandar East', 'Apartment', '2024-03-01', 8320, 132),
('Bhayandar East', 'Apartment', '2024-06-01', 8620, 138),
('Bhayandar East', 'Apartment', '2024-09-01', 8920, 145),
('Bhayandar East', 'Apartment', '2024-12-01', 9220, 140),
('Bhayandar East', 'Apartment', '2025-03-01', 9620, 152),
('Bhayandar East', 'Apartment', '2025-06-01', 9980, 158),
('Bhayandar East', 'Apartment', '2025-09-01', 10350, 165),
('Bhayandar East', 'Apartment', '2025-12-01', 10720, 160),
('Bhayandar East', 'Apartment', '2026-01-01', 10980, 170),
('Bhayandar East', 'Apartment', '2026-02-01', 11150, 175);

-- ============================================================
-- KANDIVALI EAST - Mid-Premium Suburban
-- Realistic range: ₹14,000 - ₹19,000/sqft (2022-2026)
-- Growth: ~6-7% YoY
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Kandivali East', 'Apartment', '2022-01-01', 13800, 65),
('Kandivali East', 'Apartment', '2022-03-01', 14050, 70),
('Kandivali East', 'Apartment', '2022-06-01', 14350, 75),
('Kandivali East', 'Apartment', '2022-09-01', 14680, 72),
('Kandivali East', 'Apartment', '2022-12-01', 15000, 68),
('Kandivali East', 'Apartment', '2023-03-01', 15420, 78),
('Kandivali East', 'Apartment', '2023-06-01', 15800, 82),
('Kandivali East', 'Apartment', '2023-09-01', 16180, 80),
('Kandivali East', 'Apartment', '2023-12-01', 16550, 75),
('Kandivali East', 'Apartment', '2024-03-01', 17050, 88),
('Kandivali East', 'Apartment', '2024-06-01', 17480, 92),
('Kandivali East', 'Apartment', '2024-09-01', 17920, 90),
('Kandivali East', 'Apartment', '2024-12-01', 18350, 85),
('Kandivali East', 'Apartment', '2025-03-01', 18920, 98),
('Kandivali East', 'Apartment', '2025-06-01', 19420, 102),
('Kandivali East', 'Apartment', '2025-09-01', 19920, 100),
('Kandivali East', 'Apartment', '2025-12-01', 20420, 95),
('Kandivali East', 'Apartment', '2026-01-01', 20780, 105),
('Kandivali East', 'Apartment', '2026-02-01', 21020, 108);

-- ============================================================
-- VILLA Market Trends (Premium)
-- ============================================================
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
('Thane West', 'Villa', '2022-01-01', 14500, 12),
('Thane West', 'Villa', '2022-06-01', 15200, 15),
('Thane West', 'Villa', '2023-01-01', 16100, 18),
('Thane West', 'Villa', '2023-06-01', 17000, 20),
('Thane West', 'Villa', '2024-01-01', 18200, 22),
('Thane West', 'Villa', '2024-06-01', 19200, 25),
('Thane West', 'Villa', '2025-01-01', 20500, 28),
('Thane West', 'Villa', '2025-06-01', 21500, 30),
('Thane West', 'Villa', '2026-01-01', 22800, 32);

-- ============================================================
-- Verification Query (Optional - Run to check)
-- ============================================================
-- SELECT location, property_type, COUNT(*) as data_points, 
--        MIN(avg_price_per_sqft) as min_price, 
--        MAX(avg_price_per_sqft) as max_price
-- FROM market_trends 
-- GROUP BY location, property_type
-- ORDER BY location;
