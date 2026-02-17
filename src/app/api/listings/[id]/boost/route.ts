import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/listings/[id]/boost
 * Purchase a boost for a listing
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const {
            agent_id,
            promo_name = 'launch_offer',
            payment_id,
            duration_hours = 24
        } = body

        // Validation
        if (!agent_id || !payment_id) {
            return NextResponse.json(
                { error: 'Missing required fields: agent_id, payment_id' },
                { status: 400 }
            )
        }

        // Verify listing belongs to agent
        const { data: listing, error: listingError } = await supabase
            .from('agent_listings')
            .select('id, agent_id, title')
            .eq('id', params.id)
            .single()

        if (listingError || !listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            )
        }

        if (listing.agent_id !== agent_id) {
            return NextResponse.json(
                { error: 'Unauthorized: listing does not belong to this agent' },
                { status: 403 }
            )
        }

        // Call database function to create boost
        const { data, error } = await supabase
            .rpc('create_boost_purchase', {
                p_listing_id: params.id,
                p_agent_id: agent_id,
                p_promo_name: promo_name,
                p_payment_id: payment_id,
                p_duration_hours: duration_hours
            })

        if (error) {
            console.error('Boost purchase error:', error)
            return NextResponse.json(
                { error: error.message || 'Failed to create boost' },
                { status: 400 }
            )
        }

        const result = Array.isArray(data) ? data[0] : data

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            boost_id: result.boost_id,
            end_at: result.end_at,
            price_paid: result.price_paid,
            message: `🚀 Listing boosted! Your property "${listing.title}" is now pinned to the top for ${duration_hours} hours.`,
            next_steps: [
                'Your listing is now highlighted with a gold "Boosted" badge',
                'It will appear at the top of search results',
                'Share your agent page to maximize visibility'
            ]
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating boost:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/listings/[id]/boost
 * Check boost eligibility for a listing
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agent_id')
    const promoName = searchParams.get('promo_name') || 'launch_offer'

    if (!agentId) {
        return NextResponse.json(
            { error: 'Missing agent_id parameter' },
            { status: 400 }
        )
    }

    try {
        // Check eligibility
        const { data, error } = await supabase
            .rpc('check_boost_promo_eligibility', {
                p_agent_id: agentId,
                p_promo_name: promoName
            })

        if (error) throw error

        return NextResponse.json(data)

    } catch (error) {
        console.error('Error checking boost eligibility:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
