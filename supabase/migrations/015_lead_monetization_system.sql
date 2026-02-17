-- ============================================================================
-- MIGRATION 015: Lead Monetization & Controlled Contact System
-- ============================================================================
-- 1. Agent Wallets & Plans
CREATE TABLE IF NOT EXISTS agent_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    balance_credits NUMERIC(10, 2) DEFAULT 0.00,
    free_leads_remaining INTEGER DEFAULT 5,
    plan_type TEXT DEFAULT 'pay_per_lead',
    -- 'pay_per_lead', 'subscription', 'hybrid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(agent_id)
);
-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES agent_listings(id) ON DELETE
    SET NULL,
        lister_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- Buyer Details (Stored even if user deleted)
        buyer_name TEXT NOT NULL,
        buyer_phone TEXT NOT NULL,
        buyer_email TEXT,
        -- Intent & Qualification
        intent_reason TEXT CHECK (intent_reason IN ('Investment', 'Self Use')),
        timeline TEXT CHECK (
            timeline IN ('Within 3 months', '3-6 months', '6+ months')
        ),
        is_dealer BOOLEAN DEFAULT false,
        home_loan_interest BOOLEAN DEFAULT false,
        site_visit_interest BOOLEAN DEFAULT false,
        -- Meta & Monetization
        lead_score INTEGER DEFAULT 0,
        brokerage_status TEXT DEFAULT 'new',
        -- 'new', 'contacted', 'closed', 'junk'
        charge_amount NUMERIC(10, 2) DEFAULT 0.00,
        is_fully_revealed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Lead Pricing Config
CREATE TABLE IF NOT EXISTS lead_pricing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality TEXT DEFAULT 'default',
    cost_per_lead NUMERIC(10, 2) DEFAULT 100.00,
    commission_percent NUMERIC(5, 2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
INSERT INTO lead_pricing_config (locality, cost_per_lead)
VALUES ('default', 250.00) ON CONFLICT DO NOTHING;
-- 4. Lead Scoring Logic Function
CREATE OR REPLACE FUNCTION calculate_lead_score() RETURNS TRIGGER AS $$
DECLARE v_score INTEGER := 0;
BEGIN -- +10 if timeline < 3 months
IF NEW.timeline = 'Within 3 months' THEN v_score := v_score + 10;
END IF;
-- +5 if site visit checked
IF NEW.site_visit_interest THEN v_score := v_score + 5;
END IF;
-- +3 if loan interest checked
IF NEW.home_loan_interest THEN v_score := v_score + 3;
END IF;
-- -5 if dealer flagged
IF NEW.is_dealer THEN v_score := v_score - 5;
END IF;
NEW.lead_score := v_score;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_leads_score BEFORE
INSERT ON leads FOR EACH ROW EXECUTE FUNCTION calculate_lead_score();
-- 5. Auto-Deduction Logic
CREATE OR REPLACE FUNCTION handle_lead_monetization() RETURNS TRIGGER AS $$
DECLARE v_wallet_id UUID;
v_free_leads INTEGER;
v_balance NUMERIC;
v_cost NUMERIC;
BEGIN -- Get agent wallet info
SELECT id,
    free_leads_remaining,
    balance_credits INTO v_wallet_id,
    v_free_leads,
    v_balance
FROM agent_wallets
WHERE agent_id = NEW.lister_id;
-- Initialize wallet if missing
IF v_wallet_id IS NULL THEN
INSERT INTO agent_wallets (agent_id)
VALUES (NEW.lister_id)
RETURNING id,
    free_leads_remaining,
    balance_credits INTO v_wallet_id,
    v_free_leads,
    v_balance;
END IF;
-- Get price
SELECT cost_per_lead INTO v_cost
FROM lead_pricing_config
WHERE locality = 'default'
LIMIT 1;
IF v_free_leads > 0 THEN -- Use free lead
UPDATE agent_wallets
SET free_leads_remaining = free_leads_remaining - 1
WHERE id = v_wallet_id;
NEW.charge_amount := 0.00;
NEW.is_fully_revealed := true;
ELSIF v_balance >= v_cost THEN -- Deduct from balance
UPDATE agent_wallets
SET balance_credits = balance_credits - v_cost
WHERE id = v_wallet_id;
NEW.charge_amount := v_cost;
NEW.is_fully_revealed := true;
ELSE -- Insufficient balance: lead remains masked
NEW.charge_amount := v_cost;
NEW.is_fully_revealed := false;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_leads_monetization BEFORE
INSERT ON leads FOR EACH ROW EXECUTE FUNCTION handle_lead_monetization();
-- 6. RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listers can view their own leads" ON leads FOR
SELECT TO authenticated USING (
        auth.uid()::TEXT IN (
            SELECT owner_id::TEXT
            FROM agents
            WHERE id = leads.lister_id
        )
    );
CREATE POLICY "Agents can view their own wallet" ON agent_wallets FOR
SELECT TO authenticated USING (
        auth.uid()::TEXT IN (
            SELECT owner_id::TEXT
            FROM agents
            WHERE id = agent_wallets.agent_id
        )
    );
-- 7. Indexes
CREATE INDEX idx_leads_lister_id ON leads(lister_id);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);