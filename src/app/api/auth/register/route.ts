import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            role, fullName, phone, email, pincode,
            businessName, reraNumber, officeAddress,
            partnerType, localities, commission
        } = body;

        // 1. In a real app, we'd use supabase.auth.signUp() here.
        // For this role-aware flow simulation, we'll assume the user is signed in 
        // or we're creating their profile record linked to their auth ID.
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 2. Insert/Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                role,
                full_name: fullName,
                phone,
                email,
                pincode,
                business_name: businessName,
                rera_number: reraNumber,
                office_address: { address: officeAddress },
                partner_type: partnerType,
                service_areas: localities,
                verification_status: role === 'buyer' ? 'verified' : 'pending'
            });

        if (profileError) throw profileError;

        // 3. Auto-Create Golden Page if Seller or CP
        let goldenPageId = null;
        if (role === 'rera_seller' || role === 'channel_partner') {
            const slug = `${(businessName || fullName).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${pincode}`;

            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .insert({
                    owner_id: user.id,
                    name: businessName || fullName,
                    slug,
                    phone,
                    email,
                    location: pincode,
                    bio: `Professional ${role === 'rera_seller' ? 'RERA Authorized Seller' : 'Channel Partner'} serving ${localities?.join(', ') || 'Mira Road'}.`,
                    verified: false,
                    rera_verified: false,
                    golden_page_active: true,
                    visible_to_buyers_only: true,
                    partner_type: role === 'channel_partner' ? partnerType : null
                })
                .select('id')
                .single();

            if (agentError && agentError.code !== '23505') { // Ignore unique slug conflicts for now or handle
                console.error('Agent creation error:', agentError);
            } else if (agentData) {
                goldenPageId = agentData.id;
            }
        }

        // 4. Emit Events (Simulated via console/table)
        console.log(`[EVENT] user_registered: ${role} - ${user.id}`);
        if (goldenPageId) {
            console.log(`[EVENT] golden_page_created: ${goldenPageId}`);
        }

        return NextResponse.json({
            success: true,
            user_id: user.id,
            golden_page_id: goldenPageId
        });

    } catch (error: any) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
