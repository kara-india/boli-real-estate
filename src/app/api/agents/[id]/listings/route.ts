import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/agents/[id]/listings
 * Create a new listing for an agent
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const {
            title,
            description,
            price,
            currency = 'INR',
            location,
            attrs,
            images,
            primary_image
        } = body

        // Validation
        if (!title || !price || !location) {
            return NextResponse.json(
                { error: 'Missing required fields: title, price, location' },
                { status: 400 }
            )
        }

        // Verify agent exists
        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', params.id)
            .single()

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            )
        }

        // Create listing
        const { data: listing, error } = await supabase
            .from('agent_listings')
            .insert({
                agent_id: params.id,
                title,
                description,
                price,
                currency,
                location,
                attrs: attrs || {},
                images: images || [],
                primary_image: primary_image || images?.[0],
                status: 'active'
            })
            .select()
            .single()

        if (error) throw error

        // Log analytics
        await supabase
            .from('analytics_events')
            .insert({
                event_type: 'listing_created',
                agent_id: params.id,
                listing_id: listing.id,
                event_data: {
                    price,
                    location,
                    has_images: (images?.length || 0) > 0
                }
            })

        return NextResponse.json({
            listing_id: listing.id,
            message: 'Listing created successfully',
            listing
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating listing:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/agents/[id]/listings
 * Get all listings for an agent
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        const { data: listings, error } = await supabase
            .from('agent_listings')
            .select('*')
            .eq('agent_id', params.id)
            .eq('status', 'active')
            .order('is_boosted', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({
            listings: listings || [],
            count: listings?.length || 0
        })

    } catch (error) {
        console.error('Error fetching listings:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
