
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { slug } = await request.json();

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', slug)
        .single();

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ available: !data });
}
