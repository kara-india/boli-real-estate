
-- 1. Create a function to ACCEPT a bid and CLOSE the auction
CREATE OR REPLACE FUNCTION accept_bid(p_bid_id UUID, p_property_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 1. Mark the specific bid as 'accepted'
    UPDATE bids 
    SET status = 'accepted' 
    WHERE id = p_bid_id;

    -- 2. Mark all other bids for this property as 'rejected'
    UPDATE bids 
    SET status = 'rejected' 
    WHERE property_id = p_property_id AND id != p_bid_id;

    -- 3. Mark the property as 'sold' to stop further bidding
    UPDATE properties 
    SET status = 'sold' 
    WHERE id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
