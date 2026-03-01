import { createClient } from '../supabase/server';
import { BillingService } from './billing-service';
import { RevealLeadSchema } from '../types/bidmetric';

export class LeadService {
    static async revealLead(builderId: string, leadId: string) {
        const supabase = await createClient();

        // Validate request
        RevealLeadSchema.parse({ builder_id: builderId, lead_id: leadId });

        // 1. Get Lead Status
        const { data: lead, error: leadErr } = await supabase
            .from('leads')
            .select('id, is_qualified, lifecycle_status, builder_id')
            .eq('id', leadId)
            .single();

        if (leadErr || !lead) throw new Error('Lead not found');
        if (lead.builder_id !== builderId) throw new Error('Unauthorized');
        if (lead.lifecycle_status !== 'new' && lead.lifecycle_status !== 'contacted') {
            return { success: true, message: 'Lead already revealed' };
        }

        // 2. Determine Cost (₹250 base for reveal)
        const REVEAL_COST = 250;

        // 3. Deduct Wallet & Log Revenue Trigger
        await BillingService.chargeWallet({
            builder_id: builderId,
            event_type: 'lead_revealed',
            amount: REVEAL_COST,
            lead_id: leadId,
            description: `Lead reveal charge for lead ${leadId}`
        });

        // 4. Update state machine
        const { error: updateErr } = await supabase
            .from('leads')
            .update({ lifecycle_status: 'contacted' })
            .eq('id', leadId);

        if (updateErr) throw new Error('Failed to update lead state');

        // Return the lead phone/email now that it's paid for
        const { data: revealedLead } = await supabase
            .from('leads')
            .select('buyer_phone, buyer_email, buyer_name')
            .eq('id', leadId)
            .single();

        return { success: true, lead: revealedLead };
    }
}
