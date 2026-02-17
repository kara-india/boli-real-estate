-- ============================================================================
-- MIGRATION 013: Role-Aware Registration & Golden Page Enhancements
-- ============================================================================
-- 1. Create User Role Enum
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('buyer', 'rera_seller', 'channel_partner');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 2. Create Verification Status Enum
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 3. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'buyer',
    full_name TEXT,
    phone TEXT,
    email TEXT,
    pincode TEXT,
    -- Buyer Preferences (Optional)
    preferred_localities TEXT [],
    budget_range_min NUMERIC,
    budget_range_max NUMERIC,
    -- Business / RERA Details
    business_name TEXT,
    rera_number TEXT,
    office_address JSONB,
    -- {street, pincode, city, district}
    verification_status verification_status DEFAULT 'pending',
    uploaded_certificates TEXT [],
    -- Array of file URLs
    service_areas TEXT [],
    -- Array of localities
    partner_type TEXT,
    -- e.g., 'Builder', 'Referral Partner'
    partnership_code TEXT,
    -- Social Proof / Branding
    agency_logo_url TEXT,
    website_url TEXT,
    testimonials TEXT [],
    -- Up to 3 lines
    -- Response Metrics
    avg_response_time_minutes INTEGER,
    messages_replied_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 4. Sync Agents (Golden Pages) with Profiles
-- Add user_id to agents if not present and ensure it links to the profile/user
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS visible_to_buyers_only BOOLEAN DEFAULT true;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS rera_verified BOOLEAN DEFAULT false;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS partner_type TEXT;
-- Mirror for quick access
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0;
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS response_rate_percent INTEGER DEFAULT 0;
-- 5. RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Users can view own profile'
) THEN CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Users can update own profile'
) THEN CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Public can view minimal profile info'
) THEN CREATE POLICY "Public can view minimal profile info" ON profiles FOR
SELECT USING (true);
END IF;
END $$;
-- 6. Updated RLS for Agents (Golden Pages) per requirement
-- Visible only to logged-in Buyers (Buyer must be authenticated).
-- Agents / Sellers can optionally allow partial public visibility (toggle).
DROP POLICY IF EXISTS "Public can view active agents" ON agents;
CREATE POLICY "Authenticated users can view active agents" ON agents FOR
SELECT TO authenticated USING (
        status = 'active'
        AND golden_page_active = true
        AND (
            NOT visible_to_buyers_only
            OR EXISTS (
                SELECT 1
                FROM profiles
                WHERE profiles.id = auth.uid()
                    AND profiles.role = 'buyer'
            )
            OR auth.uid() = owner_id -- Owners can always see their own page
        )
    );
-- 7. Trigger to auto-update profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 8. Add Boost Sort Support to agent_listings
ALTER TABLE agent_listings
ADD COLUMN IF NOT EXISTS boost_timestamp TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_agent_listings_boost_timestamp ON agent_listings(boost_timestamp DESC);