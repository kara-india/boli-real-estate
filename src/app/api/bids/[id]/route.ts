import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/bids/[id]/accept
 * Seller accepts a bid, triggers soft-lock and monetization event
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { seller_id } = body

        if (!seller_id) {
            return NextResponse.json(
                { error: 'Missing required field: seller_id' },
                { status: 400 }
            )
        }

        // Call database function to accept bid
        const { data, error } = await supabase
            .rpc('accept_bid', {
                p_bid_id: params.id,
                p_seller_id: seller_id
            })

        if (error) {
            if (error.message.includes('Unauthorized')) {
                return NextResponse.json(
                    { error: 'Only property owner can accept bids' },
                    { status: 403 }
                )
            }
            throw error
        }

        // TODO: Trigger monetization event webhook
        // await triggerMonetizationWebhook(data)

        return NextResponse.json({
            status: data[0].status,
            soft_lock_until: data[0].soft_lock_until,
            message: data[0].message,
            next_steps: [
                'Payment processing initiated',
                'Property marked as under contract',
                'Buyer will be notified within 1 hour'
            ]
        })

    } catch (error) {
        console.error('Error accepting bid:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/bids/[id]/reject
 * Seller rejects a bid
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { seller_id, reason } = body

        // Update bid status
        const { error } = await supabase
            .from('bids')
            .update({
                status: 'rejected'
            })
            .eq('id', params.id)

        if (error) throw error

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                event_type: 'bid_rejected',
                user_id: seller_id,
                bid_id: params.id,
                metadata: {
                    reason: reason || 'No reason provided'
                }
            })

        return NextResponse.json({
            status: 'rejected',
            message: 'Bid rejected successfully'
        })

    } catch (error) {
        console.error('Error rejecting bid:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
