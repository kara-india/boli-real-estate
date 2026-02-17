-- Secure place_bid function
ALTER FUNCTION place_bid(UUID, NUMERIC)
SET search_path = public;
-- Tighten Referrals Policy (Must be authenticated to refer)
DROP POLICY IF EXISTS "Enable insert for all users" ON referrals;
CREATE POLICY "Referrers can create referrals" ON referrals FOR
INSERT TO authenticated WITH CHECK (auth.uid() = referrer_agent_id);
-- Mitigate Analytics Policy (Require event_type to be present)
DROP POLICY IF EXISTS "Enable insert for all users" ON analytics_events;
CREATE POLICY "Log analytics events" ON analytics_events FOR
INSERT TO public WITH CHECK (event_type IS NOT NULL);
-- Mitigate Share Events Policy (Require channel to be present)
DROP POLICY IF EXISTS "Enable insert for all users" ON share_events;
CREATE POLICY "Log share events" ON share_events FOR
INSERT TO public WITH CHECK (channel IS NOT NULL);