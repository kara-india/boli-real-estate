import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/properties/[id]/bids
 * Create a new bid with server-side validation
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        const body = await request.json()
        const { user_id, bid_amount } = body

        if (!user_id || !bid_amount) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id and bid_amount' },
                { status: 400 }
            )
        }

        // Fetch property to validate bid bounds
        const { data: property, error: propError } = await supabase
            .from('properties')
            .select('slider_lower_bound, slider_upper_bound, status')
            .eq('id', id)
            .single()

        if (propError || !property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            )
        }

        if (property.status !== 'available') {
            return NextResponse.json(
                { error: 'Property is not available for bidding' },
                { status: 400 }
            )
        }

        // Validate bid is within bounds
        if (bid_amount < property.slider_lower_bound) {
            return NextResponse.json(
                {
                    error: `Bid amount must be at least ₹${(property.slider_lower_bound / 100000).toFixed(2)} L`,
                    min_allowed: property.slider_lower_bound
                },
                { status: 400 }
            )
        }

        if (bid_amount > property.slider_upper_bound) {
            return NextResponse.json(
                {
                    error: `Bid amount cannot exceed ₹${(property.slider_upper_bound / 100000).toFixed(2)} L`,
                    max_allowed: property.slider_upper_bound
                },
                { status: 400 }
            )
        }

        // Check if bid is higher than current highest bid
        const { data: highestBid } = await supabase
            .from('bids')
            .select('amount')
            .eq('property_id', id)
            .eq('status', 'placed')
            .order('amount', { ascending: false })
            .limit(1)
            .single()

        if (highestBid && bid_amount <= highestBid.amount) {
            return NextResponse.json(
                {
                    error: `Bid must be higher than current highest bid of ₹${(highestBid.amount / 100000).toFixed(2)} L`,
                    current_highest: highestBid.amount
                },
                { status: 400 }
            )
        }

        // Create bid with 7-day expiry
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const { data: bid, error: bidError } = await supabase
            .from('bids')
            .insert({
                property_id: id,
                user_id: user_id,
                amount: bid_amount,
                status: 'placed',
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single()

        if (bidError) throw bidError

        // Create audit log
        await supabase
            .from('audit_logs')
            .insert({
                event_type: 'bid_placed',
                user_id: user_id,
                property_id: id,
                bid_id: bid.id,
                metadata: {
                    bid_amount,
                    expires_at: expiresAt.toISOString()
                }
            })

        return NextResponse.json({
            bid_id: bid.id,
            status: 'placed',
            created_at: bid.created_at,
            expires_at: expiresAt.toISOString(),
            message: 'Bid placed successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Error placing bid:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/properties/[id]/bids
 * Get all bids for a property (for seller/admin)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        const { data: bids, error } = await supabase
            .from('bids')
            .select(`
        id,
        amount,
        status,
        created_at,
        expires_at,
        accepted_at,
        users (
          id,
          email,
          name
        )
      `)
            .eq('property_id', id)
            .order('amount', { ascending: false })

        if (error) throw error

        return NextResponse.json({
            bids: bids || [],
            count: bids?.length || 0
        })

    } catch (error) {
        console.error('Error fetching bids:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
