import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/agents/[id]/dashboard
 * Get agent dashboard metrics and data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()

    try {
        // Get agent info
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('*')
            .eq('id', params.id)
            .single()

        if (agentError || !agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            )
        }

        // Get listings with stats
        const { data: listings } = await supabase
            .from('agent_listings')
            .select('*')
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false })

        // Get buyer requests
        const { data: requests } = await supabase
            .from('buyer_requests')
            .select(`
        id,
        listing_id,
        buyer_name,
        buyer_phone,
        buyer_email,
        message,
        preferred_visit_date,
        preferred_visit_time,
        status,
        created_at,
        agent_listings (title, location)
      `)
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false })
            .limit(50)

        // Get active boosts
        const { data: activeBoosts } = await supabase
            .from('boosts')
            .select(`
        id,
        listing_id,
        end_at,
        price_paid,
        agent_listings (title)
      `)
            .eq('agent_id', params.id)
            .eq('status', 'active')
            .gte('end_at', new Date().toISOString())

        // Get share events
        const { data: shareEvents } = await supabase
            .from('share_events')
            .select('*')
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false })
            .limit(20)

        // Calculate metrics
        const totalListings = listings?.length || 0
        const activeListings = listings?.filter(l => l.status === 'active').length || 0
        const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0
        const totalRequests = requests?.length || 0
        const newRequests = requests?.filter(r => r.status === 'new').length || 0
        const totalShares = shareEvents?.reduce((sum, e) => sum + (e.clicks || 0), 0) || 0

        // Get this week's stats
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const thisWeekRequests = requests?.filter(r => r.created_at >= oneWeekAgo).length || 0
        const thisWeekViews = await getThisWeekViews(supabase, params.id, oneWeekAgo)

        // Check boost eligibility
        const { data: boostEligibility } = await supabase
            .rpc('check_boost_promo_eligibility', {
                p_agent_id: params.id,
                p_promo_name: 'launch_offer'
            })

        return NextResponse.json({
            agent: {
                id: agent.id,
                name: agent.name,
                slug: agent.slug,
                photo_url: agent.photo_url,
                golden_page_url: `/agent/${agent.slug}`,
                referral_code: agent.referral_code,
                founding_broker: agent.founding_broker,
                verified: agent.verified
            },
            metrics: {
                total_listings: totalListings,
                active_listings: activeListings,
                total_page_views: agent.total_page_views,
                total_views: totalViews,
                total_requests: totalRequests,
                new_requests: newRequests,
                total_shares: agent.total_shares,
                this_week: {
                    requests: thisWeekRequests,
                    views: thisWeekViews
                }
            },
            listings: (listings || []).map(l => ({
                id: l.id,
                title: l.title,
                price: l.price,
                location: l.location,
                primary_image: l.primary_image,
                is_boosted: l.is_boosted,
                boosted_until: l.boosted_until,
                views: l.views,
                requests: l.requests,
                status: l.status,
                created_at: l.created_at
            })),
            recent_requests: (requests || []).slice(0, 10).map(r => ({
                id: r.id,
                listing_title: r.agent_listings?.title,
                listing_location: r.agent_listings?.location,
                buyer_name: r.buyer_name,
                buyer_phone: r.buyer_phone,
                buyer_email: r.buyer_email,
                message: r.message,
                preferred_visit_date: r.preferred_visit_date,
                preferred_visit_time: r.preferred_visit_time,
                status: r.status,
                created_at: r.created_at
            })),
            active_boosts: (activeBoosts || []).map(b => ({
                id: b.id,
                listing_title: b.agent_listings?.title,
                end_at: b.end_at,
                price_paid: b.price_paid
            })),
            boost_eligibility: boostEligibility,
            share_stats: {
                total_shares: shareEvents?.length || 0,
                total_clicks: shareEvents?.reduce((sum, e) => sum + (e.clicks || 0), 0) || 0,
                channels: getShareChannelBreakdown(shareEvents || [])
            }
        })

    } catch (error) {
        console.error('Error fetching dashboard:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function getThisWeekViews(supabase: any, agentId: string, since: string) {
    const { count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('event_type', 'agent_page_viewed')
        .gte('created_at', since)

    return count || 0
}

function getShareChannelBreakdown(shareEvents: any[]) {
    const breakdown: Record<string, number> = {}
    shareEvents.forEach(event => {
        const channel = event.channel || 'unknown'
        breakdown[channel] = (breakdown[channel] || 0) + (event.clicks || 0)
    })
    return breakdown
}
