
import { NextResponse } from 'next/server';

// Mock Geo Database for Pincode Lookup
const PINCODE_MAP: Record<string, any> = {
    '401107': {
        cities: ['Mira Bhayandar'],
        district: ['Thane'],
        areas: ['Mira Road East', 'Beverly Park', 'Poonam Sagar', 'Shanti Park'],
        lat: 19.2813,
        lng: 72.8752
    },
    '401105': {
        cities: ['Mira Bhayandar'],
        district: ['Thane'],
        areas: ['Bhayandar East', 'Indralok', 'Navghar'],
        lat: 19.2931,
        lng: 72.8541
    },
    '400050': {
        cities: ['Mumbai'],
        district: ['Mumbai Suburban'],
        areas: ['Bandra West', 'Hill Road', 'Pali Hill', 'Carter Road'],
        lat: 19.0596,
        lng: 72.8295
    },
    '400063': {
        cities: ['Mumbai'],
        district: ['Mumbai Suburban'],
        areas: ['Goregaon East', 'Aarey Colony', 'Oberoi Garden City'],
        lat: 19.1634,
        lng: 72.8524
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
        return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mapping = PINCODE_MAP[pincode];

    if (!mapping) {
        return NextResponse.json({
            cities: [],
            district: [],
            areas: [],
            notFound: true
        });
    }

    return NextResponse.json(mapping);
}
