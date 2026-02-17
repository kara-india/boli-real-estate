'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Bid = {
    id: string
    amount: number
    status: 'placed' | 'accepted' | 'rejected' | 'expired'
    created_at: string
    expires_at: string
    accepted_at?: string
    property_id: string
    property?: {
        title: string
        location: string
        image_url: string
    }
    user?: {
        id: string
        email: string
        name: string
    }
}

export default function SellerDashboard() {
    const [bids, setBids] = useState<Bid[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'placed' | 'accepted' | 'rejected'>('placed')
    const supabase = createClient()

    useEffect(() => {
        fetchBids()
    }, [filter])

    const fetchBids = async () => {
        setIsLoading(true)
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Please log in to view dashboard')
                return
            }

            // Fetch user's properties
            const { data: properties } = await supabase
                .from('properties')
                .select('id')
                .eq('user_id', user.id)

            if (!properties || properties.length === 0) {
                setBids([])
                return
            }

            const propertyIds = properties.map(p => p.id)

            // Fetch bids for user's properties
            let query = supabase
                .from('bids')
                .select(`
          id,
          amount,
          status,
          created_at,
          expires_at,
          accepted_at,
          property_id,
          properties (
            title,
            location,
            image_url
          ),
          users (
            id,
            email
          )
        `)
                .in('property_id', propertyIds)
                .order('created_at', { ascending: false })

            if (filter !== 'all') {
                query = query.eq('status', filter)
            }

            const { data, error } = await query

            if (error) throw error
            setBids(data || [])
        } catch (error) {
            console.error('Error fetching bids:', error)
            toast.error('Failed to load bids')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptBid = async (bidId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const response = await fetch(`/api/bids/${bidId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: user.id })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to accept bid')
            }

            toast.success('Bid accepted! Payment processing initiated.')
            fetchBids()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to accept bid'
            toast.error(message)
        }
    }

    const handleRejectBid = async (bidId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const response = await fetch(`/api/bids/${bidId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: user.id,
                    reason: 'Seller chose a different offer'
                })
            })

            if (!response.ok) {
                throw new Error('Failed to reject bid')
            }

            toast.success('Bid rejected')
            fetchBids()
        } catch (error) {
            toast.error('Failed to reject bid')
        }
    }

    const formatPrice = (amount: number) => `₹${(amount / 100000).toFixed(2)} L`

    const getDaysRemaining = (expiresAt: string) => {
        const now = new Date()
        const expiry = new Date(expiresAt)
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return days
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'placed':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            case 'accepted':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Accepted
                </span>
            case 'rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>
            case 'expired':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Expired
                </span>
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
                    <p className="text-gray-600">Manage incoming bids and accept offers</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    {(['all', 'placed', 'accepted', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${filter === f
                                    ? 'border-[#D4AF37] text-[#D4AF37]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} Bids
                        </button>
                    ))}
                </div>

                {/* Bids List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No bids yet</h3>
                        <p className="text-gray-500">Incoming bids will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bids.map((bid) => (
                            <div key={bid.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-6">
                                    {/* Property Image */}
                                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={bid.property?.image_url || 'https://via.placeholder.com/150'}
                                            alt={bid.property?.title || 'Property'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Bid Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{bid.property?.title}</h3>
                                                <p className="text-sm text-gray-500">{bid.property?.location}</p>
                                            </div>
                                            {getStatusBadge(bid.status)}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Bid Amount</p>
                                                <p className="text-xl font-bold text-[#D4AF37]">{formatPrice(bid.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Bidder</p>
                                                <p className="text-sm font-semibold text-gray-900">{bid.user?.email || 'Anonymous'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Expires In</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getDaysRemaining(bid.expires_at)} days
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {bid.status === 'placed' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleAcceptBid(bid.id)}
                                                    className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] hover:shadow-lg transition-all"
                                                >
                                                    <CheckCircle className="w-4 h-4 inline mr-2" />
                                                    Accept Bid
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBid(bid.id)}
                                                    className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4 inline mr-2" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {bid.status === 'accepted' && (
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Accepted on {new Date(bid.accepted_at!).toLocaleDateString()}</span>
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
