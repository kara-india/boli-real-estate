import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/agents/[id]/share
 * Track agent page share event
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        const body = await request.json()
        const { channel, listing_id, short_link } = body

        // Validation
        if (!channel) {
            return NextResponse.json(
                { error: 'Missing required field: channel' },
                { status: 400 }
            )
        }

        // Create share event
        const { data: shareEvent, error } = await supabase
            .from('share_events')
            .insert({
                agent_id: id,
                listing_id: listing_id || null,
                channel,
                short_link: short_link || null
            })
            .select()
            .single()

        if (error) throw error

        // Log analytics
        await supabase
            .from('analytics_events')
            .insert({
                event_type: 'agent_page_shared',
                agent_id: id,
                listing_id: listing_id || null,
                event_data: {
                    channel,
                    has_short_link: !!short_link
                }
            })

        return NextResponse.json({
            share_id: shareEvent.id,
            message: 'Share tracked successfully',
            whatsapp_message: generateWhatsAppMessage(id, channel)
        }, { status: 201 })

    } catch (error) {
        console.error('Error tracking share:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/agents/[id]/share
 * Get share link and pre-filled messages
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        // Get agent info
        const { data: agent, error } = await supabase
            .from('agents')
            .select('name, slug')
            .eq('id', id)
            .single()

        if (error || !agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            )
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boli.app'
        const agentPageUrl = `${baseUrl}/agent/${agent.slug}`
        const referralUrl = `${agentPageUrl}?ref=${agent.slug}`

        // Generate short link (in production, use a URL shortener service)
        const shortLink = `${baseUrl}/a/${agent.slug.substring(0, 8)}`

        return NextResponse.json({
            agent_page_url: agentPageUrl,
            referral_url: referralUrl,
            short_link: shortLink,
            messages: {
                whatsapp: `Hi — I've created my Golden Page with all my listings. Send property requests here: ${shortLink} — ${agent.name}`,
                sms: `View my properties: ${shortLink} — ${agent.name}`,
                email_subject: `${agent.name} - Property Listings`,
                email_body: `Hi,\n\nI've listed all my properties on my Golden Page. You can browse and send requests directly:\n\n${agentPageUrl}\n\nBest regards,\n${agent.name}`,
                social: `🏠 Check out my property listings! ${shortLink}`
            },
            share_urls: {
                whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hi — I've created my Golden Page with all my listings. Send property requests here: ${shortLink} — ${agent.name}`)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏠 Check out my property listings!`)}&url=${encodeURIComponent(shortLink)}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
            }
        })

    } catch (error) {
        console.error('Error generating share links:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

function generateWhatsAppMessage(agentId: string, channel: string) {
    if (channel === 'whatsapp') {
        return `Hi — I've created my Golden Page with all my listings. Send property requests here: [SHORT_LINK] — [AGENT_NAME]`
    }
    return null
}
