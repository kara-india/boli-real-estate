import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { profile_id, status, comments } = await request.json();

        // Check if user is admin (stubbed for now - in prod check user role)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

        // Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                verification_status: status,
                business_name: comments // Storing admin feedback in a real app would use a separate audit field
            })
            .eq('id', profile_id);

        if (profileError) throw profileError;

        // If verified, update the Golden Page
        if (status === 'verified') {
            await supabase
                .from('agents')
                .update({ rera_verified: true, verified: true })
                .eq('owner_id', profile_id);
        }

        // Emit event
        console.log(`[EVENT] rera_${status}: ${profile_id}`);

        return NextResponse.json({ success: true, status });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
