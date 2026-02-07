
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, BedDouble, Bath, Square, TrendingUp, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

type Property = {
    id: string
    title: string
    description: string
    price: number
    location: string
    sqft: number
    type: string
    bedrooms: number
    bathrooms: number
    image_url: string
    status: string
}

type MarketTrend = {
    date: string
    avg_price_per_sqft: number
}

export default function PropertyDetailsPage() {
    const { id } = useParams()
    const [property, setProperty] = useState<Property | null>(null)
    const [trends, setTrends] = useState<MarketTrend[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!id) return

            // 1. Fetch Property
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single()

            if (propError) {
                console.error('Error fetching property:', propError)
                return
            }

            setProperty(propData)

            // 2. Fetch Market Trends for this location
            if (propData) {
                const { data: trendData, error: trendError } = await supabase
                    .from('market_trends')
                    .select('date, avg_price_per_sqft')
                    .eq('location', propData.location)
                    .eq('property_type', propData.type)
                    .order('date', { ascending: true })

                if (trendData) {
                    // Format date for chart
                    const formattedTrends = trendData.map(t => ({
                        ...t,
                        date: format(new Date(t.date), 'MMM yy'),
                    }))
                    setTrends(formattedTrends)
                }
            }
            setIsLoading(false)
        }

        fetchPropertyDetails()
    }, [id])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
                Property not found.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Images & Key Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Image */}
                    <div className="relative h-96 w-full rounded-2xl overflow-hidden glass-dark border border-white/10 shadow-2xl">
                        <img
                            src={property.image_url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            LIVE AUCTION
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="glass-dark p-8 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 neon-text">{property.title}</h1>
                                <div className="flex items-center text-gray-400">
                                    <MapPin size={18} className="mr-2 text-blue-400" />
                                    {property.location}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Current Bid</p>
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                                    ₹{(property.price / 100000).toFixed(2)} L
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <BedDouble size={24} className="text-blue-400 mb-2" />
                                <span className="text-lg font-semibold">{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <Bath size={24} className="text-purple-400 mb-2" />
                                <span className="text-lg font-semibold">{property.bathrooms} Baths</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <Square size={24} className="text-pink-400 mb-2" />
                                <span className="text-lg font-semibold">{property.sqft} sqft</span>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-xl font-bold mb-4">Description</h3>
                            <p className="text-gray-300 leading-relaxed">{property.description}</p>
                        </div>
                    </div>

                    {/* Market Trends Chart */}
                    <div className="glass-dark p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-green-400" />
                            <h3 className="text-xl font-bold">Price Prediction & History</h3>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} />
                                    <YAxis stroke="#ffffff50" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_price_per_sqft"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-gray-400 mt-4 flex items-center gap-2">
                            <Info size={14} />
                            data based on verified transactions in {property.location}
                        </p>
                    </div>
                </div>

                {/* Right Column: Bidding Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 glass-dark p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Place Your Bid</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Your Offer (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder={`Min bid: ₹${(property.price + 100000).toLocaleString()}`}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-lg"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    * Minimum increment of ₹1 Lakh required
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-blue-300">Predictive Valuation</span>
                                    <span className="text-sm font-bold text-blue-300">₹{(property.price * 1.05 / 100000).toFixed(2)} L</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    {/* Mock progress bar showing where current price is vs valuation */}
                                    <div className="bg-blue-500 h-full w-[85%]"></div>
                                </div>
                                <p className="text-xs text-blue-400/70 mt-2">
                                    This property is currently 5% under market value.
                                </p>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-300">
                                Submit Bid
                            </button>

                            <div className="pt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    By placing a bid, you agree to BidMetric's Terms of Service.
                                    Win fee: 1% of final price.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
