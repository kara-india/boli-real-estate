import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { listingId } = await req.json()

        if (!listingId) {
            return NextResponse.json({ error: "Listing ID required" }, { status: 400 })
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_listingId: {
                    userId: session.user.id,
                    listingId: listingId
                }
            }
        })

        if (existing) {
            // Remove from wishlist
            await prisma.wishlist.delete({
                where: {
                    id: existing.id
                }
            })
            return NextResponse.json({ status: "removed" })
        } else {
            // Add to wishlist
            await prisma.wishlist.create({
                data: {
                    userId: session.user.id,
                    listingId: listingId
                }
            })
            return NextResponse.json({ status: "added" })
        }
    } catch (error) {
        console.error("Wishlist error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ wishlist: [] })
    }

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: session.user.id },
            select: { listingId: true }
        })
        return NextResponse.json({ wishlist: wishlist.map((w: any) => w.listingId) })
    } catch (error) {
        return NextResponse.json({ error: "Error fetching wishlist" }, { status: 500 })
    }
}
