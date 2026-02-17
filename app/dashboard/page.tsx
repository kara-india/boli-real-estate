
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Wallet, History, Search, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Please log in to view dashboard')
                router.push('/login')
                return
            }

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
                setBids((data as unknown as UserBid[]) || [])
            }
            setIsLoading(false)
        }

        fetchUserDashboard()
    }, [router, supabase])

    const getBidStatus = (status: string, myBid: number, currentPrice: number) => {
        if (status === 'accepted') return 'accepted'
        if (status === 'rejected') return 'rejected'
        if (myBid >= currentPrice) return 'winning'
        return 'outbid'
    }

    const formatPrice = (price: number) => {
        return `₹${(price / 100000).toFixed(2)} L`
    }

    if (isLoading) {
        return <div className="min-h-screen bg-white flex justify-center items-center"><Loader2 className="w-10 h-10 text-gold animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Active <span className="text-gold-dark">Bids</span></h1>
                        <p className="text-gray-500 font-light mt-1">Manage your official offers and property acquisition progress.</p>
                    </div>
                    <Link href="/listings" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                        <Search size={16} className="text-gold" />
                        Discover More
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                            <History className="text-gold" size={24} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bids Placed</h3>
                        <p className="text-3xl font-extrabold text-gray-900">{bids.length}</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center ring-2 ring-gold/5">
                        <div className="w-12 h-12 bg-gold/5 rounded-2xl flex items-center justify-center mb-4 border border-gold/10">
                            <TrendingUp className="text-gold-dark" size={24} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Winning Status</h3>
                        <p className="text-3xl font-extrabold text-gold-dark">
                            {bids.filter(b => getBidStatus(b.status, b.amount, b.properties.price) === 'winning' || b.status === 'accepted').length}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                            <Wallet className="text-gold" size={24} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Exposure</h3>
                        <p className="text-3xl font-extrabold text-gray-900">
                            {formatPrice(bids.reduce((acc, curr) => acc + curr.amount, 0))}
                        </p>
                    </div>
                </div>

                {bids.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all">
                        <TrendingUp size={48} className="mx-auto text-gold mb-6 opacity-20" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Empty</h3>
                        <p className="text-gray-400 mb-8 font-light">You haven&apos;t placed any bids on the platform yet.</p>
                        <Link
                            href="/listings"
                            className="px-8 py-3.5 bg-gold text-white rounded-xl font-bold transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:-translate-y-0.5"
                        >
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bids.map((bid) => {
                            const status = getBidStatus(bid.status, bid.amount, bid.properties.price)
                            const isWinning = status === 'winning'
                            const isAccepted = status === 'accepted'
                            const isOutbid = status === 'outbid'

                            return (
                                <div key={bid.id} className="group bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold/20 transition-all flex flex-col lg:flex-row items-center justify-between gap-8">

                                    {/* Property Visuals & Identity */}
                                    <div className="flex items-center gap-6 flex-1 w-full lg:w-auto">
                                        <div className="h-24 w-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-gray-50">
                                            <img src={bid.properties.image_url} alt={bid.properties.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-bold text-gray-400 h-fit">PLACED {new Date(bid.created_at).toLocaleDateString()}</span>
                                                {isAccepted && (
                                                    <span className="flex items-center text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                        <CheckCircle size={10} className="mr-1" /> CONTRACT READY
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gold-dark transition-colors">{bid.properties.title}</h3>
                                            <p className="text-sm text-gray-400 font-light flex items-center gap-1.5 mt-1">
                                                <MapPin size={12} className="text-gold" />
                                                {bid.properties.location}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bid Analytics */}
                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-8 w-full lg:w-auto px-4 lg:px-0 lg:min-w-[180px]">
                                        <div className="text-left lg:text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Your Official Bid</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatPrice(bid.amount)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAccepted ? (
                                                <div className="flex items-center text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                                                    Offer Accepted
                                                </div>
                                            ) : isWinning ? (
                                                <div className="flex items-center text-[10px] font-black text-gold-dark uppercase tracking-widest bg-gold/10 px-3 py-1.5 rounded-xl border border-gold/20">
                                                    Currently Winning
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                                                    Outbid by Partner
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Critical Info & Action */}
                                    <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50 mt-2 lg:mt-0">
                                        {isOutbid && (
                                            <div className="text-left lg:text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Market Gap</p>
                                                <p className="text-xs font-bold text-red-500">Need +{formatPrice(bid.properties.price - bid.amount)}</p>
                                            </div>
                                        )}
                                        <Link
                                            href={`/listings/${bid.properties.id}`}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${isAccepted ? 'bg-gray-900 text-white hover:bg-black' :
                                                isWinning ? 'bg-gold/10 text-gold-dark hover:bg-gold/20 border border-gold/10' :
                                                    'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {isAccepted ? 'Proceed to Legal' : (isWinning ? 'Manage Bid' : 'Retain Advantage')}
                                            <ArrowRight size={16} />
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
