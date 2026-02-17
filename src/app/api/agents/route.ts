import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/agents
 * Create a new agent (broker onboarding)
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { name, slug, phone, email, photo_url, bio, location, referred_by } = body

        // Validation
        if (!name || !slug || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, phone' },
                { status: 400 }
            )
        }

        // Check if slug is available
        const { data: existingAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('slug', slug)
            .single()

        if (existingAgent) {
            return NextResponse.json(
                { error: 'Slug already taken. Try: ' + slug + '-' + Math.floor(Math.random() * 1000) },
                { status: 400 }
            )
        }

        // Check if phone already registered
        const { data: existingPhone } = await supabase
            .from('agents')
            .select('id')
            .eq('phone', phone)
            .single()

        if (existingPhone) {
            return NextResponse.json(
                { error: 'Phone number already registered' },
                { status: 400 }
            )
        }

        // Generate referral code
        const referralCode = `${slug.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Check if this is within first 500 agents (founding broker)
        const { count } = await supabase
            .from('agents')
            .select('*', { count: 'exact', head: true })

        const foundingBroker = (count || 0) < 500

        // Create agent
        const { data: agent, error } = await supabase
            .from('agents')
            .insert({
                name,
                slug,
                phone,
                email,
                photo_url,
                bio,
                location,
                referral_code: referralCode,
                founding_broker: foundingBroker,
                referred_by: referred_by || null
            })
            .select()
            .single()

        if (error) throw error

        // If referred, create referral record
        if (referred_by) {
            await supabase
                .from('referrals')
                .insert({
                    referrer_agent_id: referred_by,
                    referee_agent_id: agent.id,
                    reward_type: 'free_boost'
                })
        }

        // Log analytics event
        await supabase
            .from('analytics_events')
            .insert({
                event_type: 'agent_created',
                agent_id: agent.id,
                event_data: {
                    founding_broker: foundingBroker,
                    has_referrer: !!referred_by
                }
            })

        return NextResponse.json({
            agent_id: agent.id,
            slug: agent.slug,
            referral_code: agent.referral_code,
            founding_broker: agent.founding_broker,
            golden_page_url: `/agent/${agent.slug}`,
            message: foundingBroker
                ? '🎉 Welcome, Founding Broker! You\'re in the first 500.'
                : 'Welcome to Boli!'
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating agent:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/agents?search=query
 * Search agents (for admin/discovery)
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')

    try {
        let query = supabase
            .from('agents')
            .select('id, name, slug, photo_url, bio, location, total_listings, verified, founding_broker')
            .eq('status', 'active')
            .eq('golden_page_active', true)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (search) {
            query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
        }

        const { data: agents, error } = await query

        if (error) throw error

        return NextResponse.json({
            agents: agents || [],
            count: agents?.length || 0
        })

    } catch (error) {
        console.error('Error fetching agents:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
