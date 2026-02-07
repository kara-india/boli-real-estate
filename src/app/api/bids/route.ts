import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { listingId, amount } = await request.json()

        if (!listingId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get listing to validate bid amount
        const listing = await prisma.listing.findUnique({
            where: { id: listingId }
        })

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            )
        }

        if (listing.status !== 'active') {
            return NextResponse.json(
                { error: 'Listing is not active' },
                { status: 400 }
            )
        }

        if (amount < listing.minBidAmount || amount > listing.maxBidAmount) {
            return NextResponse.json(
                { error: `Bid must be between ₹${(listing.minBidAmount / 10000000).toFixed(2)}Cr and ₹${(listing.maxBidAmount / 10000000).toFixed(2)}Cr` },
                { status: 400 }
            )
        }

        // Create bid
        const bid = await prisma.bid.create({
            data: {
                amount,
                listingId,
                userId: session.user.id,
                status: 'pending'
            },
            include: {
                listing: true,
                user: { select: { name: true, email: true } }
            }
        })

        return NextResponse.json({ bid })
    } catch (error) {
        console.error('Bid creation error:', error)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const listingId = searchParams.get('listingId')

        if (!listingId) {
            return NextResponse.json(
                { error: 'Listing ID required' },
                { status: 400 }
            )
        }

        const bids = await prisma.bid.findMany({
            where: { listingId },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ bids })
    } catch (error) {
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
