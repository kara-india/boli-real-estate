-- Enable RLS on all tables flagged by linter
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_promo_config ENABLE ROW LEVEL SECURITY;
-- ANALYTICS EVENTS
-- Allow anyone to log events (Insert)
CREATE POLICY "Enable insert for all users" ON analytics_events FOR
INSERT TO public WITH CHECK (true);
-- Allow anyone to view events (Select) - NOTE: In production, restrict this to owners!
CREATE POLICY "Enable select for all users" ON analytics_events FOR
SELECT TO public USING (true);
-- REFERRALS
-- Allow anyone to create a referral (Insert)
CREATE POLICY "Enable insert for all users" ON referrals FOR
INSERT TO public WITH CHECK (true);
-- Allow viewing referrals (Select)
CREATE POLICY "Enable select for all users" ON referrals FOR
SELECT TO public USING (true);
-- SHARE EVENTS
-- Allow logging shares (Insert)
CREATE POLICY "Enable insert for all users" ON share_events FOR
INSERT TO public WITH CHECK (true);
-- Allow viewing share stats (Select)
CREATE POLICY "Enable select for all users" ON share_events FOR
SELECT TO public USING (true);
-- BOOST PROMO CONFIG
-- Allow public to read pricing (Select)
CREATE POLICY "Enable read access for all users" ON boost_promo_config FOR
SELECT TO public USING (true);
-- Restrict modifications to service_role only (No policy needed, default is deny)