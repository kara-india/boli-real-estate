import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Requirement: POST /api/leads/submit
 * Captures buyer intent, validates OTP, and triggers monetization logic.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            property_id, lister_id,
            buyer_name, buyer_phone, buyer_email,
            intent_reason, timeline, is_dealer,
            home_loan_interest, site_visit_interest,
            otp // Assuming verified via separate logic or passed here
        } = body;

        // 1. Validate Buyer Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Log in as Buyer to contact listers' }, { status: 401 });
        }

        // 2. OTP Check (Simulation)
        // In production, we'd verify the OTP record from a verification table
        if (otp !== '1234') { // Mock OTP for dev
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // 3. Insert Lead
        // The database trigger 'handle_lead_monetization' will automatically:
        // - Calculate lead score
        // - Check agent wallet
        // - Deduct credits or mark as revealed=false
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
                property_id,
                lister_id,
                buyer_id: user.id,
                buyer_name,
                buyer_phone,
                buyer_email,
                intent_reason,
                timeline,
                is_dealer,
                home_loan_interest,
                site_visit_interest
            })
            .select()
            .single();

        if (leadError) throw leadError;

        // 4. Notification (Push/SMS stub)
        console.log(`[NOTIFY] Lister ${lister_id}: New Lead from ${buyer_name} (Score: ${lead.lead_score})`);

        // 5. Response
        return NextResponse.json({
            success: true,
            lead_id: lead.id,
            is_revealed: lead.is_fully_revealed,
            message: lead.is_fully_revealed
                ? 'Lead captured. Details revealed.'
                : 'Request sent. Lister will contact you (Insufficient credits).'
        });

    } catch (error: any) {
        console.error('Lead Submission Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
