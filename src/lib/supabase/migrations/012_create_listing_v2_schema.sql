-- 012_create_listing_v2_schema.sql
-- 1. Extend properties table with missing fields for high-quality listings
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS district TEXT,
    ADD COLUMN IF NOT EXISTS pincode TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS lat NUMERIC,
    ADD COLUMN IF NOT EXISTS lng NUMERIC,
    ADD COLUMN IF NOT EXISTS carpet_area NUMERIC,
    ADD COLUMN IF NOT EXISTS parking INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS floor TEXT,
    ADD COLUMN IF NOT EXISTS total_floors INTEGER,
    ADD COLUMN IF NOT EXISTS age_of_property INTEGER,
    ADD COLUMN IF NOT EXISTS image_urls TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS video_url TEXT,
    ADD COLUMN IF NOT EXISTS floorplan_url TEXT,
    ADD COLUMN IF NOT EXISTS amenities TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS tags TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS available_from DATE,
    ADD COLUMN IF NOT EXISTS preferred_visit_times TEXT [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS open_house JSONB,
    ADD COLUMN IF NOT EXISTS show_phone_public BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS contact_person TEXT,
    ADD COLUMN IF NOT EXISTS agent_commission NUMERIC,
    ADD COLUMN IF NOT EXISTS transaction_type TEXT CHECK (transaction_type IN ('Sale', 'Rent', 'Lease')),
    ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- 2. Create Listing Drafts table for autosave functionality
CREATE TABLE IF NOT EXISTS listing_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '{}',
    step_completed INTEGER DEFAULT 1,
    percent_complete INTEGER DEFAULT 0,
    last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Enable RLS on listing_drafts
ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;
-- 4. Policies for listing_drafts
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Agents can manage their own drafts'
) THEN CREATE POLICY "Agents can manage their own drafts" ON listing_drafts FOR ALL TO authenticated USING (auth.uid() = agent_id);
END IF;
END $$;
-- 5. Create index on properties slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
-- 6. Add location details to properties if they were purely in 'location' string before
-- This helps with the pincode-driven cascade
CREATE INDEX IF NOT EXISTS idx_properties_pincode ON properties(pincode);