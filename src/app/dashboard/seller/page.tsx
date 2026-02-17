
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, TrendingUp, CheckCircle, Plus, Building, User, IndianRupee, MapPin, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('Please log in to manage listings')
                router.push('/login')
                return
            }

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

        } catch (error: any) {
            toast.error(error.message || 'Failed to accept bid')
        }
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-[10px] font-bold uppercase tracking-widest mb-3 border border-gold/20">
                            Professional Seller Access
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Seller <span className="text-gold-dark">Control Center</span></h1>
                        <p className="text-gray-500 font-light mt-1">Monitor market interest and manage incoming offers for your portfolio.</p>
                    </div>
                    <Link
                        href="/listings/create"
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        <Plus size={20} />
                        New Listing
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <Building size={64} className="mx-auto text-gold mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Portfolio</h3>
                        <p className="text-gray-400 mb-10 max-w-sm mx-auto font-light">You haven&apos;t listed any properties yet. Start your selling journey with Boli today.</p>
                        <Link
                            href="/listings/create"
                            className="px-10 py-4 bg-gold text-white rounded-2xl font-bold transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:-translate-y-0.5"
                        >
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden hover:shadow-xl transition-all">

                                {/* Listing Header Section */}
                                <div className="p-8 lg:p-10 bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="h-28 w-36 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg border border-gray-50">
                                            <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{listing.title}</h2>
                                                {listing.status === 'sold' ? (
                                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">Deal Closed</span>
                                                ) : (
                                                    <span className="bg-gold/10 text-gold-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gold/20">Live Market</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" /> {listing.location}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                                <span className="flex items-center gap-1.5 text-gray-800"><IndianRupee size={14} /> Ask: {formatPrice(listing.price)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 w-full lg:w-auto px-6 lg:px-0 py-6 lg:py-0 border-y lg:border-0 border-gray-50">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Interest</p>
                                            <p className="text-3xl font-black text-gray-900">{listing.bids?.length || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Avg View</p>
                                            <p className="text-3xl font-black text-gray-900">42</p>
                                        </div>
                                        <Link href={`/listings/${listing.id}`} className="p-3 bg-gray-50 rounded-2xl text-gold hover:bg-gold hover:text-white transition-all">
                                            <ExternalLink size={24} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Bids Table Container */}
                                <div className="p-4 lg:p-8 bg-gray-50/50">
                                    <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-inner">
                                        <h3 className="text-sm font-black text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <TrendingUp size={18} className="text-gold" /> Market Offers
                                        </h3>

                                        {listing.bids?.length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 font-light italic">Currently awaiting initial market interest...</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {listing.bids?.sort((a, b) => b.amount - a.amount).map((bid) => (
                                                    <div key={bid.id} className="py-6 flex flex-col sm:flex-row justify-between items-center gap-6 group">
                                                        <div className="flex items-center gap-5 w-full sm:w-auto">
                                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                                                                <User size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-2xl font-black text-gray-900 tracking-tight">{formatPrice(bid.amount)}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                                    ID: {bid.bidder_id.slice(0, 8)}... • Received {new Date(bid.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="w-full sm:w-auto text-right">
                                                            {listing.status === 'sold' ? (
                                                                bid.status === 'accepted' ? (
                                                                    <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-5 py-2 rounded-xl border border-green-100 font-black text-[11px] uppercase tracking-widest">
                                                                        <CheckCircle size={16} /> Selected Winner
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Post-Sale Inactive</span>
                                                                )
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAcceptBid(bid.id, listing.id)}
                                                                    className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all shadow-xl shadow-gray-200 hover:-translate-y-0.5"
                                                                >
                                                                    Accept Official Offer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
