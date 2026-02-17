import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const tab = searchParams.get('tab') || 'properties';
        const pincode = searchParams.get('pincode') || '401107'; // Default Mira Road

        if (tab === 'properties') {
            // Sort: Boosted DESC, BoostTimestamp DESC, CreatedAt DESC
            // Filter: For demo/staging, we filter by 'locality' containing Mira Road or just all as the seed is Mira Road
            const { data: properties, error } = await supabase
                .from('agent_listings')
                .select(`
          *,
          agent:agents(name, photo_url, verified, rera_verified)
        `)
                .eq('status', 'active')
                .order('is_boosted', { ascending: false })
                .order('boost_timestamp', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ properties });
        } else {
            // Browse Listers
            // Sort: Nearby listers who have active Boosted listings -> Verified -> Others
            // For this mock, we just use a join and sort by boosted count
            const { data: listers, error } = await supabase
                .from('agents')
                .select(`
          *,
          listings_count:agent_listings(count),
          boosted_listings_count:agent_listings(count)
        `)
                .eq('status', 'active')
                .eq('agent_listings.is_boosted', true) // This is for the count check
                .order('verified', { ascending: false })
                .order('total_listings', { ascending: false });

            // Note: Supabase count queries in selects can be tricky for sorting complex objects, 
            // in production we'd use a view or RPC for complex ranking.

            if (error) throw error;
            return NextResponse.json({ listers });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
