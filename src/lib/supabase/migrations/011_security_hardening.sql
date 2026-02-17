-- ============================================================================
-- MIGRATION 011: Security & RLS Compliance
-- =====================================================
-- Purpose: Address Supabase Lint findings regarding RLS
-- =====================================================
-- 1. Enable RLS on newly identified public tables
ALTER TABLE builder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_audit_logs ENABLE ROW LEVEL SECURITY;
-- 2. Policies for builder_profiles
-- Everyone can read builder profiles (to see them on property tabs)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Public can view builder profiles'
) THEN CREATE POLICY "Public can view builder profiles" ON builder_profiles FOR
SELECT USING (true);
END IF;
END $$;
-- 3. Policies for transaction_audit_logs
-- Authenticated users can view logs related to THEIR bids or properties
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Users can view own transaction logs'
) THEN CREATE POLICY "Users can view own transaction logs" ON transaction_audit_logs FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM bids
            WHERE bids.id = transaction_audit_logs.bid_id
                AND bids.bidder_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM properties
            WHERE properties.id = transaction_audit_logs.prop_id
                AND properties.owner_id = auth.uid()
        )
    );
END IF;
END $$;
-- 4. Policies for boosts (Addresses 'RLS Enabled No Policy')
-- Agents can view their own boosts
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Agents can view own boosts'
) THEN CREATE POLICY "Agents can view own boosts" ON boosts FOR
SELECT TO authenticated USING (auth.uid()::TEXT = agent_id::TEXT);
END IF;
END $$;
-- Agents can create their own boosts (if we had a checkout flow, but RPC usually handles this)
-- Already handled by create_boost_purchase RPC which is SECURITY DEFINER, 
-- but we enable INSERT just in case for transparency.
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Agents can insert own boosts'
) THEN CREATE POLICY "Agents can insert own boosts" ON boosts FOR
INSERT TO authenticated WITH CHECK (auth.uid()::TEXT = agent_id::TEXT);
END IF;
END $$;
-- 5. Note on 'auth_leaked_password_protection'
-- This is a dashboard-level setting in Supabase Auth and cannot be enabled via DDL.
-- It is recommended to enable 'Leaked Password Protection' and 'Password Strength' 
-- in the Supabase Dashboard -> Auth -> Settings.