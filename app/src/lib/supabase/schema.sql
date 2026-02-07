
-- 1. Create a public 'properties' table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL, -- Current listing price or starting bid
    location TEXT NOT NULL,
    sqft INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'Apartment', 'Villa', 'Plot'
    bedrooms INTEGER,
    bathrooms INTEGER,
    image_url TEXT, -- Main image
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the user who listed it
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending'))
);

-- 2. Create a 'market_trends' table for historical price data (used for analytics)
CREATE TABLE IF NOT EXISTS market_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location TEXT NOT NULL,
    property_type TEXT NOT NULL,
    date DATE NOT NULL,
    avg_price_per_sqft NUMERIC NOT NULL,
    transaction_count INTEGER DEFAULT 0
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for 'properties'
-- Policy: Everyone can view active properties.
CREATE POLICY "Public properties are viewable by everyone" 
ON properties FOR SELECT 
USING (status = 'active');

-- Policy: Authenticated users can create listings.
CREATE POLICY "Users can insert their own properties" 
ON properties FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own properties.
CREATE POLICY "Users can update their own properties" 
ON properties FOR UPDATE 
USING (auth.uid() = owner_id);

-- 5. Create Policies for 'market_trends'
-- Policy: Everyone can view market trends.
CREATE POLICY "Market trends are viewable by everyone" 
ON market_trends FOR SELECT 
USING (true);

-- 6. Seed Initial Data (Mock Data for Mira Road & Mumbai Suburbs)
INSERT INTO properties (title, description, price, location, sqft, type, bedrooms, bathrooms, image_url, status)
VALUES 
('Luxury 2BHK in Mira Road', 'Spacious apartment with city view, near metro station.', 8500000, 'Mira Road', 950, 'Apartment', 2, 2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop', 'active'),
('Premium 3BHK Villa', 'Gated community villa with private garden.', 15000000, 'Thane West', 1800, 'Villa', 3, 3, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop', 'active'),
('Affordable 1BHK near Station', 'Perfect for first-time buyers, walking distance to station.', 4500000, 'Bhayandar East', 550, 'Apartment', 1, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop', 'active'),
('Modern Studio Apartment', 'High-rise studio with gym and pool access.', 3500000, 'Kandivali East', 400, 'Apartment', 1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop', 'active'),
('Spacious 2BHK with Balcony', 'Well-ventilated flat with large balcony.', 9200000, 'Borivali West', 1050, 'Apartment', 2, 2, 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2070&auto=format&fit=crop', 'active');

-- Seed EXTENDED Market Trends Data (Monthly data for 2 years across locations)
INSERT INTO market_trends (location, property_type, date, avg_price_per_sqft, transaction_count)
VALUES
-- Mira Road Trends (Steady Growth)
('Mira Road', 'Apartment', '2022-01-01', 7500, 110),
('Mira Road', 'Apartment', '2022-02-01', 7550, 115),
('Mira Road', 'Apartment', '2022-03-01', 7600, 120),
('Mira Road', 'Apartment', '2022-04-01', 7650, 118),
('Mira Road', 'Apartment', '2022-05-01', 7700, 125),
('Mira Road', 'Apartment', '2022-06-01', 7800, 130),
('Mira Road', 'Apartment', '2022-07-01', 7850, 122),
('Mira Road', 'Apartment', '2022-08-01', 7900, 128),
('Mira Road', 'Apartment', '2022-09-01', 8000, 135),
('Mira Road', 'Apartment', '2022-10-01', 8100, 140),
('Mira Road', 'Apartment', '2022-11-01', 8200, 138),
('Mira Road', 'Apartment', '2022-12-01', 8300, 142),
('Mira Road', 'Apartment', '2023-01-01', 8500, 150),
('Mira Road', 'Apartment', '2023-02-01', 8550, 148),
('Mira Road', 'Apartment', '2023-03-01', 8600, 155),
('Mira Road', 'Apartment', '2023-04-01', 8700, 160),
('Mira Road', 'Apartment', '2023-05-01', 8750, 158),
('Mira Road', 'Apartment', '2023-06-01', 8800, 165),
('Mira Road', 'Apartment', '2023-07-01', 8900, 162),
('Mira Road', 'Apartment', '2023-08-01', 9000, 170),
('Mira Road', 'Apartment', '2023-09-01', 9100, 175),
('Mira Road', 'Apartment', '2023-10-01', 9150, 180),
('Mira Road', 'Apartment', '2023-11-01', 9200, 185),
('Mira Road', 'Apartment', '2023-12-01', 9300, 190),

-- Thane West Trends (Higher Value, Fluctuation)
('Thane West', 'Apartment', '2022-01-01', 11000, 80),
('Thane West', 'Apartment', '2022-06-01', 11500, 85),
('Thane West', 'Apartment', '2023-01-01', 12000, 90),
('Thane West', 'Apartment', '2023-06-01', 12500, 95),
('Thane West', 'Apartment', '2024-01-01', 13200, 100),

-- Borivali West Trends (Premium/Stable)
('Borivali West', 'Apartment', '2022-01-01', 18000, 60),
('Borivali West', 'Apartment', '2023-01-01', 19500, 65),
('Borivali West', 'Apartment', '2024-01-01', 21000, 70);
