-- supabase/seed.sql additions
-- Delete existing if we wanted, but let's just create a test builder and some data
DO $$
DECLARE new_user_id UUID := gen_random_uuid();
new_builder_id UUID;
new_project_id UUID;
new_wallet_id UUID;
new_lead_id UUID;
BEGIN -- Only seed if we want
-- creating auth user
INSERT INTO auth.users (id, email)
VALUES (new_user_id, 'builder_test@example.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO builders (
        id,
        user_id,
        company_name,
        rera_registration,
        city,
        onboarding_status,
        trust_score
    )
VALUES (
        gen_random_uuid(),
        new_user_id,
        'Rustomjee Test Builders',
        'P51800000000',
        'Mumbai',
        'active',
        95
    )
RETURNING id INTO new_builder_id;
INSERT INTO builder_projects (
        id,
        builder_id,
        project_name,
        locality,
        city,
        total_units,
        pincode
    )
VALUES (
        gen_random_uuid(),
        new_builder_id,
        'Rustomjee Elements',
        'Andheri West',
        'Mumbai',
        100,
        '400053'
    )
RETURNING id INTO new_project_id;
INSERT INTO project_inventory (project_id, unit_type, carpet_area_sqft, price)
VALUES (new_project_id, '3BHK', 1200, 35000000);
INSERT INTO builder_wallets (id, builder_id, balance)
VALUES (gen_random_uuid(), new_builder_id, 10000)
RETURNING id INTO new_wallet_id;
-- Create a test lead
INSERT INTO leads (
        buyer_name,
        buyer_phone,
        intent_score,
        lead_score,
        builder_id,
        project_id,
        is_qualified,
        lifecycle_status,
        source_channel
    )
VALUES (
        'Karan Test',
        '9876543210',
        80,
        85,
        new_builder_id,
        new_project_id,
        true,
        'qualified',
        'platform'
    )
RETURNING id INTO new_lead_id;
END $$;