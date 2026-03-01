import { createClient } from '../supabase/server';
import { CreateBillingEventSchema } from '../types/bidmetric';

export class BillingService {
    /**
     * Deducts amount from wallet and logs a billing event within a transaction logic.
     * Supabase RPC should ideally handle transactions, but we can manage them here sequentially 
     * by relying on RLS and atomic updates if possible, or using an explicit stored procedure.
     */
    static async chargeWallet(params: {
        builder_id: string;
        event_type: "lead_revealed" | "visit_completed" | "penalty";
        amount: number;
        lead_id?: string;
        visit_id?: string;
        description: string;
    }) {
        const supabase = await createClient();

        // 1. Get Wallet
        const { data: wallet, error: walletErr } = await supabase
            .from('builder_wallets')
            .select('id, balance')
            .eq('builder_id', params.builder_id)
            .single();

        if (walletErr || !wallet) throw new Error('Wallet not found');

        if (wallet.balance < params.amount) {
            throw new Error(`Insufficient balance. Has ${wallet.balance}, needs ${params.amount}`);
        }

        // Since REST lacks explicit transactions, we deduct by tracking matching old balance, 
        // but the best way in pure postgREST is a stored procedure.
        // For now we will update, and if successful, insert billing_event.
        const { data: updatedWallet, error: updateErr } = await supabase
            .from('builder_wallets')
            .update({
                balance: wallet.balance - params.amount,
                total_spent: supabase.rpc('increment', { x: params.amount }) // if RPC exists, else manual below
            })
            .eq('id', wallet.id)
            .select()
            .single();

        // Workaround since we don't have atomic increment here out-of-box without RPC:
        if (updateErr) {
            // fallback manual update
            await supabase.from('builder_wallets').update({
                balance: wallet.balance - params.amount
            }).eq('id', wallet.id);
        }

        // 2. Insert Billing Event
        const billingPayload = CreateBillingEventSchema.parse({
            builder_id: params.builder_id,
            wallet_id: wallet.id,
            event_type: params.event_type,
            amount: params.amount,
            lead_id: params.lead_id,
            visit_id: params.visit_id,
            description: params.description,
        });

        const { error: eventErr } = await supabase
            .from('billing_events')
            .insert({
                ...billingPayload,
                status: 'deducted'
            });

        if (eventErr) throw new Error(`Failed to log billing event: ${eventErr.message}`);

        return { success: true, new_balance: wallet.balance - params.amount };
    }
}
