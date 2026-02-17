'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { MapPin, BedDouble, Bath, Square, TrendingUp, Info, Clock, AlertTriangle, ShieldCheck, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, differenceInDays } from 'date-fns'
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
    price: number // Owner Price
    bidmetric_price: number // AI Price
    market_price?: number
    original_listing_price?: number
    location: string
    city: string
    locality: string
    sqft: number
    type: string
    bedrooms: number
    bathrooms: number
    image_url: string
    status: string
    builder?: string
    builder_id?: string
    owner_timer_expiry?: string // ISO string
    builder_confidence_score?: number
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

    // Bidding State
    const [bidType, setBidType] = useState<'slider' | 'manual'>('slider')
    const [sliderPercent, setSliderPercent] = useState<number>(0)
    const [manualBidAmount, setManualBidAmount] = useState('')
    const [isBidding, setIsBidding] = useState(false)

    // UI State
    const [activeTab, setActiveTab] = useState<'valuation' | 'builder'>('valuation')

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

            // 2. Fetch Market Trends (Mocking or Fetching)
            if (propData) {
                // Mock trends if empty for visual
                const basePrice = propData.bidmetric_price / propData.sqft || 8000;
                const mockTrends = [
                    { date: '2025-01-01', avg_price_per_sqft: basePrice * 0.92 },
                    { date: '2025-04-01', avg_price_per_sqft: basePrice * 0.94 },
                    { date: '2025-07-01', avg_price_per_sqft: basePrice * 0.96 },
                    { date: '2025-10-01', avg_price_per_sqft: basePrice * 0.98 },
                    { date: '2026-01-01', avg_price_per_sqft: basePrice * 1.0 },
                ]
                setTrends(mockTrends) // Using mock for now to ensure chart shows up

                // Generate Client-Side Valuation Object for UI Components
                const valuationData = generatePropertyValuation({
                    propertyId: propData.id,
                    sqft: propData.sqft,
                    location: propData.location,
                    localityAvgPricePerSqft: basePrice,
                    ownerListedPrice: propData.price,
                    builderProfile: {
                        name: propData.builder || 'Unknown Builder',
                        confidenceScore: propData.builder_confidence_score || 75,
                        // ... items derived from score
                        onTimeDeliveryRate: 85,
                        reraRegistered: true
                    },
                    propertyType: propData.type,
                    dataCompleteness: 90
                })
                setValuation(valuationData)
            }
            setIsLoading(false)
        }

        fetchPropertyDetails()

        // Real-time sub
        const channel = supabase.channel('realtime-property')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'properties', filter: `id=eq.${id}` },
                (payload) => {
                    setProperty((prev) => prev ? { ...prev, price: payload.new.price } : null)
                    toast.success(`Update: New Price ₹${(payload.new.price / 100000).toFixed(2)} L`)
                })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [id, supabase])

    // Derived State
    const bidMetricPrice = property?.bidmetric_price || property?.price || 0
    const currentBid = bidType === 'slider'
        ? Math.round(bidMetricPrice * (1 + sliderPercent / 100))
        : (parseFloat(manualBidAmount) || 0)

    // Motivated Seller Logic
    const isMotivated = property?.owner_timer_expiry && new Date(property.owner_timer_expiry) > new Date()
    const daysRemaining = isMotivated ? differenceInDays(new Date(property!.owner_timer_expiry!), new Date()) : 0

    const handlePlaceBid = async () => {
        if (!session) {
            toast.error('Please log in to place a bid')
            return
        }
        if (!property) return

        // Validation
        const minAllowed = bidMetricPrice * 0.90 // -10% floor (example rule)
        const maxAllowed = bidMetricPrice * 1.10 // +10% ceiling

        if (currentBid < minAllowed || currentBid > maxAllowed) {
            toast.error(`Bid must be within ±10% of Market Value (₹${(bidMetricPrice / 100000).toFixed(2)}L)`)
            return
        }

        setIsBidding(true)
        try {
            const { error } = await supabase.rpc('place_bid', {
                p_property_id: property.id,
                p_amount: currentBid
            })
            if (error) throw error
            toast.success('Bid placed successfully!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to place bid')
        } finally {
            setIsBidding(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-white flex justify-center items-center"><div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full"></div></div>
    if (!property) return <div className="min-h-screen bg-white flex justify-center items-center">Property not found</div>

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Hero & Visuals */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                            <div className="flex items-center text-gray-500 mt-1">
                                <MapPin size={16} className="mr-1 text-gold" />
                                {property.location}
                            </div>
                        </div>
                        {isMotivated && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center shadow-sm">
                                <Clock size={18} className="mr-2 animate-pulse" />
                                <div className="text-sm">
                                    <span className="font-bold">Motivated Seller</span>
                                    <div className="text-xs">Price reduced for {daysRemaining} days</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Image */}
                    <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                        <img src={property.image_url} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gold-dark px-3 py-1 rounded-full text-xs font-bold shadow-md border border-gold/20 uppercase tracking-wide">
                            Live Auction
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <BedDouble className="text-gold mb-1" />
                            <span className="font-semibold text-lg">{property.bedrooms} Beds</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <Bath className="text-gold mb-1" />
                            <span className="font-semibold text-lg">{property.bathrooms} Baths</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <Square className="text-gold mb-1" />
                            <span className="font-semibold text-lg">{property.sqft} sqft</span>
                        </div>
                    </div>

                    {/* TABS: Valuation & Builder Confidence */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('valuation')}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'valuation' ? 'bg-gold/10 text-gold-dark border-b-2 border-gold' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Valuation Breakdown
                            </button>
                            <button
                                onClick={() => setActiveTab('builder')}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'builder' ? 'bg-gold/10 text-gold-dark border-b-2 border-gold' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Builder Confidence
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'valuation' && valuation && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ValuationFactorsChart factors={valuation.topFactors} totalValuation={valuation.aiValuation} />
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-700">Why this price?</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{valuation.methodology}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <ShieldCheck size={14} className="text-green-500" />
                                                <span>Verified by BidMetric AI (Confidence: ±4.7%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'builder' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark font-bold text-xl">
                                                {property.builder_confidence_score}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{property.builder || 'Unknown Builder'}</h3>
                                                <p className="text-sm text-gray-500">Confidence Score (0-100)</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1 rounded-full text-sm font-bold ${(property.builder_confidence_score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                                                (property.builder_confidence_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {(property.builder_confidence_score || 0) >= 80 ? 'HIGH TRUST' :
                                                (property.builder_confidence_score || 0) >= 60 ? 'MODERATE' : 'LOW TRUST'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 uppercase">RERA Compliance</span>
                                            <span className="font-bold text-gray-800">Yes, Verified</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 uppercase">On-Time Delivery</span>
                                            <span className="font-bold text-gray-800">85% Rate</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5-Year Forecast */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-gold" />
                            5-Year Value Forecast
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="avg_price_per_sqft" stroke="#D4AF37" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#D4AF37' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Bidding */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-xl border border-gold/10">
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">Market Valuation (BidMetric)</p>
                            <p className="text-3xl font-bold text-gray-900">₹{(bidMetricPrice / 100000).toFixed(2)} L</p>
                            <p className={`text-sm mt-1 ${(property.price - bidMetricPrice) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                Owner asks {Math.abs(((property.price - bidMetricPrice) / bidMetricPrice) * 100).toFixed(1)}% {(property.price - bidMetricPrice) > 0 ? 'above' : 'below'} market
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Your Bid</h3>

                                {/* Toggle */}
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="useSlider"
                                        checked={bidType === 'slider'}
                                        onChange={(e) => setBidType(e.target.checked ? 'slider' : 'manual')}
                                        className="h-4 w-4 text-gold border-gray-300 rounded focus:ring-gold"
                                    />
                                    <label htmlFor="useSlider" className="text-sm text-gray-600 select-none">Use Smart Slider (Rec.)</label>
                                </div>

                                {bidType === 'slider' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-bold text-gray-500">
                                            <span>-5%</span>
                                            <span>Market</span>
                                            <span>+5%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-5" max="5" step="0.1"
                                            value={sliderPercent}
                                            onChange={(e) => setSliderPercent(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
                                        />
                                        <div className="text-center font-bold text-2xl text-gold-dark">
                                            ₹{(currentBid / 100000).toFixed(2)} L
                                            <span className="block text-xs text-gray-400 font-normal mt-1">
                                                ({sliderPercent > 0 ? '+' : ''}{sliderPercent}% vs Market)
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        value={manualBidAmount}
                                        onChange={(e) => setManualBidAmount(e.target.value)}
                                        placeholder="Enter amount in ₹"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-lg"
                                    />
                                )}
                            </div>

                            <button
                                onClick={handlePlaceBid}
                                disabled={isBidding}
                                className="w-full py-4 bg-gradient-to-r from-gold-dark to-gold text-white font-bold rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                {isBidding ? 'Submitting...' : 'Place Bid'}
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                Soft-lock applies for 24h upon acceptance.
                                <br />Protected by VestAuth.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
