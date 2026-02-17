import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/properties/[id]
 * Returns complete property details including valuation and slider bounds
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    try {
        // Fetch property with all valuation data
        const { data: rawData, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single()

        const property = rawData as any

        if (error) throw error
        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            )
        }

        // Fetch latest valuation
        const { data: valuation } = await supabase
            .from('valuations')
            .select('*')
            .eq('property_id', id)
            .order('valuation_timestamp', { ascending: false })
            .limit(1)
            .single()

        // Calculate days remaining for motivated sales
        let motivatedSale: {
            is_motivated: boolean;
            expires_in_days: number | null;
            label: string | null;
        } = {
            is_motivated: false,
            expires_in_days: null,
            label: null
        }

        if (property.owner_timer_expiry) {
            const expiryDate = new Date(property.owner_timer_expiry)
            const now = new Date()
            const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            motivatedSale = {
                is_motivated: true,
                expires_in_days: daysRemaining,
                label: `Owner has reduced price — listing valid for ${daysRemaining} days`
            }
        }

        // Format response
        const response = {
            id: property.id,
            title: property.title,
            description: property.description,
            location: property.location,
            sqft: property.sqft,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            type: property.type,
            image_url: property.image_url,
            status: property.status,

            // Pricing
            owner_price: property.original_listing_price,
            bidmetric_price: property.bidmetric_price,
            market_price: property.market_price,
            last_sale_comparable_price: property.last_sale_comparable_price,

            // Slider bounds
            slider_bounds: {
                lower_percent: property.slider_lower_bound ?
                    ((property.slider_lower_bound - property.bidmetric_price) / property.bidmetric_price * 100).toFixed(2) : -5.00,
                upper_percent: property.slider_upper_bound ?
                    ((property.slider_upper_bound - property.bidmetric_price) / property.bidmetric_price * 100).toFixed(2) : 5.00,
                lower_absolute: property.slider_lower_bound,
                upper_absolute: property.slider_upper_bound
            },

            // Builder confidence
            builder_confidence: {
                score: property.builder_confidence_score,
                label: property.builder_profiles?.confidence_level || 'medium',
                builder_name: property.builder || property.builder_profiles?.name,
                factors: [] // TODO: Implement builder factor breakdown
            },

            // Valuation details
            valuation: {
                confidence_interval: property.confidence_interval,
                top5_factors: valuation?.top5_factors || [],
                last_updated: property.valuation_last_updated,
                provenance: `BidMetric derived from HPI, local comps, and infrastructure data — last updated ${new Date(property.valuation_last_updated).toLocaleDateString()}`
            },

            // Motivated sale
            motivated_sale: motivatedSale
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Error fetching property:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
