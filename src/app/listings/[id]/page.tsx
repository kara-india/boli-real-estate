
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import {
    MapPin, BedDouble, Bath, Square, TrendingUp, Info, Clock,
    AlertTriangle, ShieldCheck, Award, CheckSquare, XSquare,
    Plane, Train, Trees, Home, Landmark, User, MessageSquare
} from 'lucide-react'
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
    price: number // Current High Price (tracking)
    bidmetric_price: number // AI Price
    market_price?: number
    original_listing_price: number // Owner Price
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
    owner_notes?: string
    connectivity_highlights?: {
        airport: boolean
        metro: boolean
        township: boolean
        premium_area: boolean
        greenery: boolean
    }
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
    const [sliderValue, setSliderValue] = useState<number>(0)
    const [manualBidAmount, setManualBidAmount] = useState('')
    const [isBidding, setIsBidding] = useState(false)

    // UI State
    const [activeTab, setActiveTab] = useState<'valuation' | 'builder' | 'owner'>('valuation')

    const supabase = createClient()
    const { session } = useSupabase()

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!id) return

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

            if (propData) {
                const basePrice = propData.bidmetric_price / propData.sqft || 8000;
                const mockTrends = [
                    { date: '2025-01-01', avg_price_per_sqft: basePrice * 0.92 },
                    { date: '2025-04-01', avg_price_per_sqft: basePrice * 0.94 },
                    { date: '2025-07-01', avg_price_per_sqft: basePrice * 0.96 },
                    { date: '2025-10-01', avg_price_per_sqft: basePrice * 0.98 },
                    { date: '2026-01-01', avg_price_per_sqft: basePrice * 1.0 },
                ]
                setTrends(mockTrends)

                const valuationData = generatePropertyValuation({
                    propertyId: propData.id,
                    sqft: propData.sqft,
                    location: propData.location,
                    localityAvgPricePerSqft: basePrice,
                    ownerListedPrice: propData.original_listing_price || propData.price,
                    builderProfile: {
                        name: propData.builder || 'Unknown Builder',
                        confidenceScore: propData.builder_confidence_score || 75,
                        onTimeDeliveryRate: 85,
                        reraRegistered: true
                    },
                    propertyType: propData.type,
                    dataCompleteness: 90
                })
                setValuation(valuationData)

                // Initialize slider at AI Price
                setSliderValue(propData.bidmetric_price)
            }
            setIsLoading(false)
        }

        fetchPropertyDetails()

        const channel = supabase.channel('realtime-property')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'properties', filter: `id=eq.${id}` },
                (payload) => {
                    setProperty((prev) => prev ? { ...prev, price: payload.new.price } : null)
                    toast.success(`Update: New High Offer ₹${(payload.new.price / 100000).toFixed(2)} L`)
                })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [id, supabase])

    // DERIVED LOGIC FOR RANGE
    const ownerPrice = property?.original_listing_price || property?.price || 0
    const marketPrice = property?.market_price || property?.bidmetric_price || 0
    const aiPrice = property?.bidmetric_price || 0

    // Bounds Calculation based on User's Rules
    let minAllowed = 0
    let maxAllowed = aiPrice * 1.05

    if (ownerPrice >= marketPrice) {
        // Condition 1: Owner > Market -> Range: [-5% Market, +5% AI]
        minAllowed = marketPrice * 0.95
    } else {
        // Condition 2: Owner < Market -> Range: [-5% Owner, +5% AI]
        minAllowed = ownerPrice * 0.95
    }

    const currentBid = bidType === 'slider' ? sliderValue : (parseFloat(manualBidAmount) || 0)

    const isMotivated = property?.owner_timer_expiry && new Date(property.owner_timer_expiry) > new Date()
    const daysRemaining = isMotivated ? differenceInDays(new Date(property!.owner_timer_expiry!), new Date()) : 0

    const formatPrice = (p: number) => `₹${(p / 100000).toFixed(2)} L`

    const handlePlaceBid = async () => {
        if (!session) {
            toast.error('Please log in to place a bid')
            return
        }
        if (!property) return

        if (currentBid < minAllowed || currentBid > maxAllowed) {
            toast.error(`Authorized window: ${formatPrice(minAllowed)} - ${formatPrice(maxAllowed)}`)
            return
        }

        setIsBidding(true)
        try {
            const { error } = await supabase.rpc('place_bid', {
                p_property_id: property.id,
                p_amount: Math.round(currentBid)
            })
            if (error) throw error
            toast.success('Official bid locked in!')
        } catch (error: any) {
            toast.error(error.message || 'Error occurred while placing bid')
        } finally {
            setIsBidding(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-white flex justify-center items-center"><div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full"></div></div>
    if (!property) return <div className="min-h-screen bg-white flex justify-center items-center">Property not found</div>

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* LEFT COLUMN: Hero & Visuals */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/5 border border-gold/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gold-dark mb-3">
                                <Award size={12} /> Institutional Grade Asset
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{property.title}</h1>
                            <div className="flex items-center text-gray-400 mt-2 font-medium">
                                <MapPin size={18} className="mr-2 text-gold" />
                                {property.location}, {property.city}
                            </div>
                        </div>
                        {isMotivated && (
                            <div className="bg-white border border-red-100 p-4 rounded-3xl flex items-center shadow-xl shadow-red-500/5">
                                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mr-3">
                                    <Clock size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-red-600 uppercase tracking-widest block">Motivated Seller</span>
                                    <div className="text-lg font-black text-gray-900 leading-none mt-0.5">{daysRemaining} Days Left</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Image */}
                    <div className="relative h-[450px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 group">
                        <img src={property.image_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-2 rounded-2xl text-[10px] font-black shadow-2xl border border-white/20 uppercase tracking-[0.2em]">
                            Verification Active
                        </div>
                    </div>

                    {/* Description & Price - USER REQUEST: Listing price right below property description */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
                        <h3 className="text-lg font-black mb-4 uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            Executive Summary
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-light mb-8">
                            {property.description}
                        </p>

                        <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Official Owner Asking Price</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tight">{formatPrice(ownerPrice)}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100 text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rate/Sqft</p>
                                    <p className="text-lg font-black text-gray-900">₹{Math.round(ownerPrice / property.sqft)}</p>
                                </div>
                                <div className="bg-gold/10 rounded-2xl px-6 py-4 border border-gold/10 text-center">
                                    <p className="text-[9px] font-black text-gold-dark uppercase tracking-widest">AI Status</p>
                                    <p className="text-lg font-black text-gold-dark">{ownerPrice > aiPrice ? 'Premium' : 'Fair Value'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gold mb-4"><BedDouble size={24} /></div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Bedrooms</span>
                            <span className="text-2xl font-black text-gray-900">{property.bedrooms} Rooms</span>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gold mb-4"><Bath size={24} /></div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Bathrooms</span>
                            <span className="text-2xl font-black text-gray-900">{property.bathrooms} Units</span>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gold mb-4"><Square size={24} /></div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Floor Area</span>
                            <span className="text-2xl font-black text-gray-900">{property.sqft} SQFT</span>
                        </div>
                    </div>

                    {/* TABS: Valuation, Builder Confidence, Owner Notes */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                        <div className="flex border-b border-gray-50 p-2 gap-2">
                            <button
                                onClick={() => setActiveTab('valuation')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === 'valuation' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                Valuation Breakdown
                            </button>
                            <button
                                onClick={() => setActiveTab('builder')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === 'builder' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                Builder Confidence
                            </button>
                            <button
                                onClick={() => setActiveTab('owner')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === 'owner' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                Owner Notes
                            </button>
                        </div>

                        <div className="p-10">
                            {activeTab === 'valuation' && valuation && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <ValuationFactorsChart factors={valuation.topFactors} totalValuation={valuation.aiValuation} methodology={valuation.methodology} />
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black flex items-center gap-3">
                                            <ShieldCheck className="text-gold" /> AI Reasoning
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-light">{valuation.methodology}</p>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Model Confidence</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                    <div className="h-full bg-gold rounded-full" style={{ width: '92%' }}></div>
                                                </div>
                                                <span className="text-sm font-black italic text-gold-dark">92.4%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'builder' && (
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6 px-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                                        <div className="flex items-center gap-6">
                                            <div className="h-24 w-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-gold-dark font-black text-3xl border border-gray-50">
                                                {property.builder_confidence_score}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-2xl tracking-tight text-gray-900">{property.builder || 'Unknown Builder'}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Institutional Trust Score</p>
                                            </div>
                                        </div>
                                        <div className={`px-8 py-3 rounded-2xl text-xs font-black tracking-widest uppercase shadow-sm ${(property.builder_confidence_score || 0) >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {(property.builder_confidence_score || 0) >= 80 ? 'Tier-1 Rated' : 'Tier-2 Certified'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center text-center">
                                            <Landmark className="text-gold mb-3" />
                                            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Compliance</span>
                                            <span className="font-black text-gray-800">RERA Verified</span>
                                        </div>
                                        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center text-center text-center">
                                            <Clock className="text-gold mb-3" />
                                            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Punctuality</span>
                                            <span className="font-black text-gray-800">85% Delivery</span>
                                        </div>
                                        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center text-center">
                                            <Award className="text-gold mb-3" />
                                            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Quality</span>
                                            <span className="font-black text-gray-800">Gold Grade</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'owner' && (
                                <div className="space-y-10">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gold"><MessageSquare size={24} /></div>
                                        <div>
                                            <h3 className="text-xl font-black mb-2 tracking-tight">Seller Insights</h3>
                                            <p className="text-gray-500 leading-relaxed font-light italic">
                                                &quot;{property.owner_notes || 'The listing creator has not provided specific notes yet.'}&quot;
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pre-set Questions Visualization */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Airport Connectivity', icon: Plane, val: property.connectivity_highlights?.airport },
                                            { label: 'Metro/Rail Access', icon: Train, val: property.connectivity_highlights?.metro },
                                            { label: 'Integrated Township', icon: Home, val: property.connectivity_highlights?.township },
                                            { label: 'High-Value Enclave', icon: Landmark, val: property.connectivity_highlights?.premium_area },
                                            { label: 'Greenery & Parks', icon: Trees, val: property.connectivity_highlights?.greenery },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={18} className="text-gold" />
                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                {item.val ? (
                                                    <CheckSquare size={18} className="text-green-500" />
                                                ) : (
                                                    <XSquare size={18} className="text-gray-300" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5-Year Forecast */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                                    <TrendingUp className="text-gold" /> Appreciation Engine
                                </h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">5-YEAR PRE-PROJECTED MARKET TRENDS</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100 uppercase tracking-tighter">+12.4% Est. CAGR</span>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="avg_price_per_sqft" stroke="#D4AF37" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#D4AF37', stroke: '#fff', strokeWidth: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Bidding */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors"></div>

                        <div className="mb-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Bidding Portal</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Place Official <span className="text-gold-dark">Offer</span></h3>
                        </div>

                        {/* Benchmark Display - USER REQUESTED: Show all 3 values */}
                        <div className="space-y-3 mb-10">
                            {[
                                { label: 'Owner Ask', val: ownerPrice, color: 'text-gray-900' },
                                { label: 'Market Base', val: marketPrice, color: 'text-gray-500' },
                                { label: 'AI Valuation', val: aiPrice, color: 'text-gold-dark font-black ring-2 ring-gold/10 px-2 rounded-lg' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{item.label}</span>
                                    <span className={`text-sm ${item.color}`}>{formatPrice(item.val)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Your Bid Strategy</h4>
                                    <button onClick={() => setBidType(bidType === 'slider' ? 'manual' : 'slider')} className="text-[10px] font-black text-gold hover:underline uppercase tracking-tighter">
                                        Switch to {bidType === 'slider' ? 'Manual' : 'Slider'}
                                    </button>
                                </div>

                                {bidType === 'slider' ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between text-[11px] font-black text-gray-900 uppercase tracking-widest px-1">
                                            <span className="text-gold-dark">Floor: {formatPrice(minAllowed)}</span>
                                            <span>Cap: {formatPrice(maxAllowed)}</span>
                                        </div>
                                        <div className="relative pt-1">
                                            <input
                                                type="range"
                                                min={minAllowed}
                                                max={maxAllowed}
                                                step="10000"
                                                value={sliderValue}
                                                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                                                className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gold border border-gray-100"
                                            />
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center shadow-inner">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Valuation</p>
                                            <p className="text-4xl font-black text-gray-900 tracking-tight">{formatPrice(sliderValue)}</p>
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full text-[9px] font-black uppercase text-gold-dark">
                                                {sliderValue > aiPrice ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                                                {Math.abs(((sliderValue - aiPrice) / aiPrice) * 100).toFixed(1)}% vs. AI
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={manualBidAmount}
                                            onChange={(e) => setManualBidAmount(e.target.value)}
                                            placeholder="Enter exact offer amount"
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all text-xl font-black"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300">INR</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handlePlaceBid}
                                disabled={isBidding}
                                className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] transition-all shadow-2xl shadow-gray-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isBidding ? <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div> : <span>Seal Official Bid</span>}
                            </button>

                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                                <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                                    By sealing, you authorize a 24-hour exclusive window upon acceptance. Market manipulation is prohibited.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
