
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, TrendingUp, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Define types for seller's properties and bids
type Bid = {
    id: string
    amount: number
    status: string
    created_at: string
    bidder_id: string
}

type Listing = {
    id: string
    title: string
    price: number
    location: string
    status: string
    image_url: string
    bids: Bid[]
}

export default function SellerDashboardPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchSellerProperties = async () => {
            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Please log in to manage listings')
                router.push('/login')
                return
            }

            // 2. Fetch Properties owned by this user
            // Note: We need to update the query to match our schema.
            // Assuming 'owner_id' links property to user.
            const { data, error } = await supabase
                .from('properties')
                .select(`
          id, title, price, location, status, image_url,
          bids (
            id, amount, status, created_at, bidder_id
          )
        `)
                .eq('owner_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching seller properties:', error)
                toast.error('Failed to load listings')
            } else {
                // Fetch bidder emails separately for privacy/display (mocked for now or fetched via join if possible)
                // For simplicity in MVP, showing bidder ID or "User".
                setListings((data as unknown as Listing[]) || [])
            }
            setIsLoading(false)
        }

        fetchSellerProperties()
    }, [router, supabase])

    const handleAcceptBid = async (bidId: string, propertyId: string) => {
        if (!confirm('Are you sure you want to accept this bid? This will mark the property as SOLD to this bidder.')) return

        try {
            const { error } = await supabase.rpc('accept_bid', {
                p_bid_id: bidId,
                p_property_id: propertyId
            })

            if (error) throw error

            toast.success('Bid Accepted! Property marked as SOLD.')

            // Optimistic update
            setListings(prev => prev.map(listing => {
                if (listing.id === propertyId) {
                    return {
                        ...listing,
                        status: 'sold',
                        bids: listing.bids.map(bid => ({
                            ...bid,
                            status: bid.id === bidId ? 'accepted' : 'rejected'
                        }))
                    }
                }
                return listing
            }))

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to accept bid'
            toast.error(message)
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 neon-text">Seller Control Center</h1>
                        <p className="text-gray-400">Manage your listings and close deals.</p>
                    </div>
                    <Link
                        href="/listings/create"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        + New Listing
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
                        <p className="text-gray-400 text-lg mb-4">You have no active listings.</p>
                        <Link
                            href="/listings/create"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {listings.map((listing) => (
                            <div key={listing.id} className="glass-dark p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all">

                                {/* Listing Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                {listing.title}
                                                {listing.status === 'sold' && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Sold</span>}
                                                {listing.status === 'active' && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Active</span>}
                                            </h2>
                                            <p className="text-sm text-gray-400">{listing.location} • Listed at ₹{(listing.price / 100000).toFixed(2)} L</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 uppercase font-semibold">Total Bids</p>
                                        <p className="text-2xl font-bold text-white">{listing.bids?.length || 0}</p>
                                    </div>
                                </div>

                                {/* Bids List */}
                                <div className="bg-black/20 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase flex items-center gap-2">
                                        <TrendingUp size={16} /> Incoming Offers
                                    </h3>

                                    {listing.bids?.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No bids received yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {listing.bids?.sort((a, b) => b.amount - a.amount).map((bid) => (
                                                <div key={bid.id} className={`flex justify-between items-center p-3 rounded-lg ${bid.status === 'accepted' ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}`}>
                                                    <div>
                                                        <p className="font-bold text-lg text-white">₹{(bid.amount / 100000).toFixed(2)} Lakhs</p>
                                                        <p className="text-xs text-gray-400">
                                                            by Bidder {bid.bidder_id.slice(0, 8)}... • {new Date(bid.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {listing.status === 'sold' ? (
                                                            bid.status === 'accepted' ? (
                                                                <span className="flex items-center gap-1 text-green-400 font-bold text-sm">
                                                                    <CheckCircle size={16} /> Accepted Winner
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-gray-500 font-bold text-sm">
                                                                    Rejected
                                                                </span>
                                                            )
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAcceptBid(bid.id, listing.id)}
                                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20"
                                                            >
                                                                Accept Offer
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
