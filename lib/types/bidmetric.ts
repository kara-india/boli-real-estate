import { z } from 'zod';

// LEAD TYPES & SCHEMAS
export const LeadStatusSchema = z.enum([
    'new', 'contacted', 'qualified', 'visit_scheduled',
    'visit_completed', 'negotiating', 'token_paid',
    'agreement_signed', 'registered', 'closed', 'lost', 'junk'
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const RevealLeadSchema = z.object({
    builder_id: z.string().uuid(),
    lead_id: z.string().uuid(),
});

export const QualifyLeadSchema = z.object({
    builder_id: z.string().uuid(),
    lead_id: z.string().uuid(),
    score: z.number().min(0).max(100),
    notes: z.string().optional(),
});

// VISIT TYPES & SCHEMAS
export const VisitStatusSchema = z.enum([
    'scheduled', 'confirmed', 'en_route', 'checked_in',
    'completed', 'no_show', 'cancelled', 'rescheduled'
]);
export type VisitStatus = z.infer<typeof VisitStatusSchema>;

export const CompleteVisitSchema = z.object({
    builder_id: z.string().uuid(),
    visit_id: z.string().uuid(),
    biometric_verified: z.boolean(),
    notes: z.string().optional(),
});

// BILLING/REVENUE SCHEMAS
export const BillingEventTypeSchema = z.enum([
    'lead_revealed', 'visit_completed', 'closing_commission',
    'loan_commission', 'wallet_topup', 'penalty'
]);
export type BillingEventType = z.infer<typeof BillingEventTypeSchema>;

export const CreateBillingEventSchema = z.object({
    builder_id: z.string().uuid(),
    wallet_id: z.string().uuid(),
    event_type: BillingEventTypeSchema,
    amount: z.number().positive(),
    lead_id: z.string().uuid().optional(),
    visit_id: z.string().uuid().optional(),
    closing_id: z.string().uuid().optional(),
    description: z.string().optional(),
});

export const WalletTopupSchema = z.object({
    builder_id: z.string().uuid(),
    amount: z.number().positive().min(5000),
    razorpay_payment_id: z.string(),
});
