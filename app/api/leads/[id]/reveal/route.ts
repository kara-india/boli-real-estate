import { NextResponse } from 'next/server';
import { LeadService } from '../../../../../lib/services/lead-service';
import { z } from 'zod';
import { createClient } from '../../../../../lib/supabase/server';

const RequestSchema = z.object({
    builder_id: z.string().uuid(),
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // dynamic params in nextjs 15
) {
    try {
        const { id: leadId } = await params;
        const body = await request.json();
        const reqData = RequestSchema.parse(body);

        const result = await LeadService.revealLead(reqData.builder_id, leadId);

        return NextResponse.json({ success: true, data: result.lead }, { status: 200 });
    } catch (error: any) {
        console.error('Lead reveal error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
