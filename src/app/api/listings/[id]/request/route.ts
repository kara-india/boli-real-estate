import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/listings/[id]/request
 * Submit a buyer request for a listing
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const {
            buyer_name,
            buyer_phone,
            buyer_email,
            message,
            preferred_visit_date,
            preferred_visit_time,
            source,
            utm_source,
            utm_medium,
            utm_campaign
        } = body

        // Validation
        if (!buyer_name || !buyer_phone) {
            return NextResponse.json(
                { error: 'Missing required fields: buyer_name, buyer_phone' },
                { status: 400 }
            )
        }

        // Get listing and agent info
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

        // Rate limiting check (5 requests per hour per IP)
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { count } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'buyer_request_submitted')
            .eq('ip_address', clientIp)
            .gte('created_at', oneHourAgo)

        if ((count || 0) >= 5) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        // Create buyer request
        const { data: buyerRequest, error } = await supabase
            .from('buyer_requests')
            .insert({
                listing_id: params.id,
                agent_id: listing.agent_id,
                buyer_name,
                buyer_phone,
                buyer_email,
                message,
                preferred_visit_date,
                preferred_visit_time,
                source: source || 'direct',
                utm_source,
                utm_medium,
                utm_campaign,
                status: 'new'
            })
            .select()
            .single()

        if (error) throw error

        // Log analytics
        await supabase
            .from('analytics_events')
            .insert({
                event_type: 'buyer_request_submitted',
                agent_id: listing.agent_id,
                listing_id: params.id,
                request_id: buyerRequest.id,
                ip_address: clientIp,
                event_data: {
                    source: source || 'direct',
                    has_preferred_time: !!preferred_visit_date
                }
            })

        // TODO: Send notification to agent (email/SMS webhook)

        return NextResponse.json({
            request_id: buyerRequest.id,
            message: `Request sent to agent! They'll contact you within 24 hours.`,
            agent_notification: 'Agent will be notified via email and SMS'
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating buyer request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
