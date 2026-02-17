-- Secure functions by setting explicit search_path
ALTER FUNCTION update_agent_stats()
SET search_path = public;
ALTER FUNCTION expire_boosts()
SET search_path = public;
ALTER FUNCTION generate_referral_code(TEXT)
SET search_path = public;
ALTER FUNCTION check_boost_promo_eligibility(UUID, VARCHAR)
SET search_path = public;
ALTER FUNCTION create_boost_purchase(UUID, UUID, VARCHAR, VARCHAR, INTEGER)
SET search_path = public;
ALTER FUNCTION accept_bid(UUID, UUID)
SET search_path = public;
-- Optional: If place_bid exists, secure it. If not, this might fail, so comment out or try separately if unsure.
-- ALTER FUNCTION place_bid(UUID, UUID, NUMERIC) SET search_path = public;