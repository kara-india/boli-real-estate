import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/agents/[slug]
 * Get public agent page data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const supabase = await createClient()
    const { slug } = await params

    try {
        // Fetch agent
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'active')
            .single()

        if (agentError || !agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            )
        }

        // Fetch agent's listings
        const { data: listings, error: listingsError } = await supabase
            .from('agent_listings')
            .select('*')
            .eq('agent_id', agent.id)
            .eq('status', 'active')
            .order('is_boosted', { ascending: false })
            .order('created_at', { ascending: false })

        if (listingsError) throw listingsError

        // Increment page view
        await supabase
            .from('agents')
            .update({ total_page_views: agent.total_page_views + 1 })
            .eq('id', agent.id)

        // Log analytics
        await supabase
            .from('analytics_events')
            .insert({
                event_type: 'agent_page_viewed',
                agent_id: agent.id,
                event_data: {
                    referrer: request.headers.get('referer'),
                    user_agent: request.headers.get('user-agent')
                }
            })

        // Format response
        return NextResponse.json({
            agent: {
                id: agent.id,
                name: agent.name,
                slug: agent.slug,
                photo_url: agent.photo_url,
                bio: agent.bio,
                location: agent.location,
                verified: agent.verified,
                founding_broker: agent.founding_broker,
                golden_page_active: agent.golden_page_active,
                total_listings: agent.total_listings,
                total_page_views: agent.total_page_views + 1
            },
            listings: (listings || []).map(listing => ({
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: listing.price,
                currency: listing.currency,
                location: listing.location,
                attrs: listing.attrs,
                primary_image: listing.primary_image || listing.images?.[0],
                images: listing.images,
                is_boosted: listing.is_boosted,
                views: listing.views,
                created_at: listing.created_at
            }))
        })

    } catch (error) {
        console.error('Error fetching agent page:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
