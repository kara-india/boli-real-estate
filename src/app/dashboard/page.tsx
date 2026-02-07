
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Define types for the joined data
type UserBid = {
    id: string
    amount: number
    status: string
    created_at: string
    properties: {
        id: string
        title: string
        price: number
        image_url: string
        location: string
        status: string
    }
}

export default function DashboardPage() {
    const [bids, setBids] = useState<UserBid[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchUserDashboard = async () => {
            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Please log in to view dashboard')
                router.push('/login')
                return
            }

            // 2. Fetch User's Bids with Property Details
            const { data, error } = await supabase
                .from('bids')
                .select(`
          id,
          amount,
          status,
          created_at,
          properties (
            id,
            title,
            price,
            image_url,
            location,
            status
          )
        `)
                .eq('bidder_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching dashboard:', error)
                toast.error('Failed to load dashboard')
            } else {
                // Cast the result to our type (Supabase types can be tricky with joins)
                setBids((data as unknown as UserBid[]) || [])
            }
            setIsLoading(false)
        }

        fetchUserDashboard()
    }, [router, supabase])


    // Helper to determine bid status relative to current price
    const getBidStatus = (status: string, myBid: number, currentPrice: number) => {
        if (status === 'accepted') return 'accepted'
        if (status === 'rejected') return 'rejected'
        if (myBid >= currentPrice) return 'winning'
        return 'outbid'
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
                <h1 className="text-4xl font-bold mb-2 neon-text">My Dashboard</h1>
                <p className="text-gray-400 mb-10">Track your active bids and property portfolio.</p>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-dark p-6 rounded-xl border border-white/10">
                        <h3 className="text-gray-400 text-sm font-medium uppercase">Total Bids Placed</h3>
                        <p className="text-3xl font-bold mt-2 text-white">{bids.length}</p>
                    </div>
                    <div className="glass-dark p-6 rounded-xl border border-white/10">

                        <h3 className="text-gray-400 text-sm font-medium uppercase">Active Winning Bids</h3>
                        <p className="text-3xl font-bold mt-2 text-green-400">
                            {bids.filter(b => getBidStatus(b.status, b.amount, b.properties.price) === 'winning' || b.status === 'accepted').length}
                        </p>
                    </div>
                    <div className="glass-dark p-6 rounded-xl border border-white/10">
                        <h3 className="text-gray-400 text-sm font-medium uppercase">Total Exposure</h3>
                        <p className="text-3xl font-bold mt-2 text-blue-400">
                            ₹{(bids.reduce((acc, curr) => acc + curr.amount, 0) / 100000).toFixed(2)} L
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" />
                    Your Bidding History
                </h2>


                {bids.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
                        <p className="text-gray-400 text-lg mb-4">You haven&apos;t placed any bids yet.</p>
                        <Link
                            href="/listings"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                            Browse Active Listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bids.map((bid) => {
                            const status = getBidStatus(bid.status, bid.amount, bid.properties.price)
                            const isWinning = status === 'winning'
                            const isAccepted = status === 'accepted'

                            return (
                                <div key={bid.id} className="glass-dark p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6">

                                    {/* Property Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-20 w-24 rounded-lg overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={bid.properties.image_url}
                                                alt={bid.properties.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">
                                                {bid.properties.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mb-1">{bid.properties.location}</p>
                                            <p className="text-xs text-gray-500">
                                                Bid placed on {new Date(bid.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bid Status & Amounts */}
                                    <div className="flex flex-col md:items-end gap-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            {isAccepted ? (
                                                <span className="flex items-center text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-500/50">
                                                    <CheckCircle size={12} className="mr-1" /> OFFER ACCEPTED
                                                </span>
                                            ) : isWinning ? (
                                                <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                                                    <TrendingUp size={12} className="mr-1" /> WINNING
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                                                    <AlertCircle size={12} className="mr-1" /> OUTBID
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Your Bid</p>
                                            <p className="text-xl font-bold text-white">₹{(bid.amount / 100000).toFixed(2)} L</p>
                                        </div>
                                        {(!isWinning && !isAccepted) && (
                                            <div className="text-right mt-1">
                                                <p className="text-xs text-gray-500">Current Highest</p>
                                                <p className="text-sm font-semibold text-red-300">₹{(bid.properties.price / 100000).toFixed(2)} L</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        <Link
                                            href={`/listings/${bid.properties.id}`}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isAccepted
                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
                                                : isWinning
                                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/50'
                                                }`}
                                        >
                                            {isAccepted ? 'Pay Brokerage Fee' : (isWinning ? 'View Details' : 'Increase Bid')}
                                        </Link>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
