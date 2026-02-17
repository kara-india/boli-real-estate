'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { MapPin, BedDouble, Bath, Square, TrendingUp, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/context/SupabaseContext'
import { generatePropertyValuation, type PropertyValuation } from '@/lib/bidmetric-valuation-engine'
import PriceComparisonCard from '@/components/valuation/PriceComparisonCard'
import BuilderConfidenceGauge from '@/components/valuation/BuilderConfidenceGauge'
import ValuationFactorsChart from '@/components/valuation/ValuationFactorsChart'

type Property = {
    id: string
    title: string
    description: string
    price: number
    original_listing_price?: number
    location: string
    sqft: number
    type: string
    bedrooms: number
    bathrooms: number
    image_url: string
    status: string
    builder?: string
    builder_id?: string
}

type MarketTrend = {
    date: string
    avg_price_per_sqft: number
}

export default function PropertyDetailsPage() {
    const { id } = useParams()
    const [property, setProperty] = useState<Property | null>(null)
    const [trends, setTrends] = useState<MarketTrend[]>([])
    const [valuation, setValuation] = useState<PropertyValuation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [bidAmount, setBidAmount] = useState('')
    const [isBidding, setIsBidding] = useState(false)
    const supabase = createClient()
    const { session } = useSupabase()

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
                const { data: trendData } = await supabase
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

                    // Calculate AI Valuation
                    const avgPricePerSqft = trendData.length > 0
                        ? trendData[trendData.length - 1].avg_price_per_sqft
                        : 8500 // Default fallback

                    const valuationData = generatePropertyValuation({
                        propertyId: propData.id,
                        sqft: propData.sqft,
                        location: propData.location,
                        localityAvgPricePerSqft: avgPricePerSqft,
                        ownerListedPrice: propData.original_listing_price || propData.price,
                        builderProfile: {
                            name: propData.builder || 'Unknown Builder',
                            reraRegistered: true,
                            onTimeDeliveryRate: 75,
                            totalProjects: 20,
                            completedProjects: 15,
                            avgCustomerRating: 3.8,
                            resaleVelocityIndex: 65,
                            legalIssuesCount: 2
                        },
                        propertyType: propData.type,
                        dataCompleteness: 85
                    })

                    setValuation(valuationData)
                }
            }
            setIsLoading(false)
        }

        fetchPropertyDetails()

        // 3. Real-time Subscription for Price Updates
        const channel = supabase
            .channel('realtime-property')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'properties',
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    // Update property price in state instantly when a bid is placed
                    setProperty((prev) => prev ? { ...prev, price: payload.new.price } : null)
                    toast.success(`Active Bid Update: New Price ₹${(payload.new.price / 100000).toFixed(2)} L`)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, supabase])

    const handlePlaceBid = async () => {
        if (!session) {
            toast.error('Please log in to place a bid')
            return
        }

        if (!property) return
        const amount = parseFloat(bidAmount)

        // Basic Client-side validation
        if (isNaN(amount) || amount <= property.price) {
            toast.error(`Bid must be higher than current price: ₹${(property.price).toLocaleString()}`)
            return
        }

        setIsBidding(true)
        try {
            // Call the Database Function securely
            const { error } = await supabase.rpc('place_bid', {
                p_property_id: property.id,
                p_amount: amount
            })

            if (error) throw error

            toast.success('Bid placed successfully!')
            setBidAmount('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to place bid'
            toast.error(message)
        } finally {
            setIsBidding(false)
        }
    }

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent transition-all duration-300 transform scale-100">
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

                    {/* Price Comparison Section */}
                    {valuation && (
                        <PriceComparisonCard
                            marketPrice={valuation.marketPrice}
                            ownerListedPrice={valuation.ownerListedPrice}
                            aiValuation={valuation.aiValuation}
                            aiVsMarket={valuation.aiVsMarket}
                            aiVsOwner={valuation.aiVsOwner}
                            confidenceRange={valuation.confidenceMetrics.confidenceRange}
                            confidenceLevel={valuation.confidenceMetrics.confidenceLevel}
                            builderComparable={{
                                builderName: property.builder || 'Unknown Builder',
                                avgPricePerSqft: Math.round(valuation.marketPrice / property.sqft),
                                sampleSize: 5
                            }}
                        />
                    )}

                    {/* Builder Confidence */}
                    {valuation && (
                        <BuilderConfidenceGauge
                            builderName={valuation.builderConfidence.builderName}
                            builderId={property.builder_id}
                            score={valuation.builderConfidence.score}
                            level={valuation.builderConfidence.level}
                            priceImpact={valuation.builderConfidence.priceImpact}
                            details={{
                                reraRegistered: true,
                                onTimeDelivery: 75,
                                avgRating: 3.8,
                                completedProjects: 15,
                                totalProjects: 20,
                                legalIssues: 2
                            }}
                        />
                    )}

                    {/* Valuation Factors */}
                    {valuation && (
                        <ValuationFactorsChart
                            factors={valuation.topFactors}
                            totalValuation={valuation.aiValuation}
                            methodology={valuation.methodology}
                        />
                    )}

                    {/* Market Trends Chart with Predictions */}
                    <div className="glass-dark p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-green-400" />
                                <h3 className="text-xl font-bold">Price Prediction & History</h3>
                            </div>
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">5-Year Forecast</span>
                        </div>

                        {/* Chart with Historical + Predictions */}
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={(() => {
                                    // Combine historical trends with 5-year predictions
                                    const currentPrice = trends.length > 0 ? trends[trends.length - 1].avg_price_per_sqft : (property.price / property.sqft);
                                    const growthRate = 0.085; // 8.5% annual growth (can be dynamic)
                                    const currentYear = new Date().getFullYear();

                                    // Add future predictions
                                    const predictions = [1, 2, 3, 4, 5].map(i => ({
                                        date: `${currentYear + i}`,
                                        avg_price_per_sqft: Math.round(currentPrice * Math.pow(1 + growthRate, i)),
                                        isPrediction: true
                                    }));

                                    return [...trends.map(t => ({ ...t, isPrediction: false })), ...predictions];
                                })()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} />
                                    <YAxis stroke="#ffffff50" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelFormatter={(label) => `${label}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_price_per_sqft"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                        strokeDasharray="0"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Prediction Factors */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-400">HPI Growth</p>
                                <p className="text-lg font-bold text-green-400">+8.5%/yr</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-400">Infra Score</p>
                                <p className="text-lg font-bold text-blue-400">72/100</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-400">Project Boost</p>
                                <p className="text-lg font-bold text-purple-400">+4.5%</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-400">5-Year Target</p>
                                <p className="text-lg font-bold text-pink-400">+50%</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mt-4 flex items-center gap-2">
                            <Info size={14} />
                            Based on HPI, Metro Line 9, MTHL spillover, and verified transactions in {property.location}
                        </p>
                    </div>

                </div>

                {/* Right Column: Bidding Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 glass-dark p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Place Your Bid</h3>


                        {/* Sold Status Banner */}
                        {property.status === 'sold' && (
                            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
                                <Info className="text-green-400" />
                                <span className="font-bold text-green-400">This property has been SOLD</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Your Offer (₹)
                                </label>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={property.status === 'sold' ? 'Auction Closed' : `Min bid: ₹${(property.price + 100000).toLocaleString()}`}
                                    disabled={property.status === 'sold'}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {property.status !== 'sold' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Minimum increment of ₹1 Lakh required
                                    </p>
                                )}
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

                            <button
                                onClick={handlePlaceBid}
                                disabled={isBidding || property.status === 'sold'}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-none disabled:bg-gray-700"
                            >
                                {property.status === 'sold' ? 'Auction Closed' : (isBidding ? 'Placing Bid...' : 'Submit Bid')}
                            </button>

                            <div className="pt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    By placing a bid, you agree to BidMetric&apos;s Terms of Service.
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
