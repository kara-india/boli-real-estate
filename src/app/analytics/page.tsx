
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, MapPin, TrendingUp, ShieldCheck, Info, BarChart3 } from 'lucide-react'
import Link from 'next/link'

type MarketTrend = {
    location: string
    property_type: string
    date: string
    avg_price_per_sqft: number
}

export default function AnalyticsPage() {
    const [trends, setTrends] = useState<MarketTrend[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchTrends = async () => {
            const { data, error } = await supabase
                .from('market_trends')
                .select('*')
                .order('date', { ascending: true })

            if (error) {
                console.error('Error fetching trends:', error)
            } else {
                setTrends(data || [])
            }
            setIsLoading(false)
        }

        fetchTrends()
    }, [supabase])

    const getChartData = () => {
        const dataByDate: Record<string, Record<string, string | number>> = {}
        trends.forEach(trend => {
            const dateStr = format(new Date(trend.date), 'MMM yy')
            if (!dataByDate[dateStr]) {
                dataByDate[dateStr] = { date: dateStr }
            }
            const key = trend.location.replace(/\s+/g, '')
            dataByDate[dateStr][key] = trend.avg_price_per_sqft
        })
        return Object.values(dataByDate)
    }

    const chartData = getChartData()

    const getGrowth = (location: string) => {
        const locTrends = trends.filter(t => t.location === location).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        if (locTrends.length < 2) return 0
        const start = locTrends[0].avg_price_per_sqft
        const end = locTrends[locTrends.length - 1].avg_price_per_sqft
        return ((end - start) / start) * 100
    }

    const locations = Array.from(new Set(trends.map(t => t.location)))

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-[10px] font-bold uppercase tracking-widest mb-4 border border-gold/20">
                        <BarChart3 size={12} />
                        Market Intelligence
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">City Analytics <span className="text-gold-dark">& Insights</span></h1>
                    <p className="text-gray-500 font-light leading-relaxed">
                        Real-time market insights powered by BidMetric&apos;s data engine. Compare historical transactions and future growth trends in your micro-locality.
                    </p>
                </div>

                {/* Growth Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {locations.slice(0, 3).map(location => {
                        const growth = getGrowth(location)
                        const isPositive = growth >= 0
                        return (
                            <div key={location} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                                        <MapPin className="text-gold" size={24} />
                                    </div>
                                    <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                        {Math.abs(growth).toFixed(1)}%
                                    </div>
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{location}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Growth (Last 24m)</p>
                            </div>
                        )
                    })}
                </div>

                {/* Main Comparative Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="text-gold" />
                                Competitive Price Trends
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Average rate per square foot (₹)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Export As</span>
                            <button className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">PDF</button>
                            <button className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">CSV</button>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="MiraRoad" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorGold)" name="Mira Road" />
                                <Area type="monotone" dataKey="ThaneWest" stroke="#CFA84B" strokeWidth={3} fillOpacity={0} name="Thane West" />
                                <Area type="monotone" dataKey="BorivaliWest" stroke="#E5C564" strokeWidth={3} fillOpacity={0} name="Borivali West" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Invite Section */}
                <div className="bg-gray-900 rounded-[2rem] p-12 text-center text-white relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4 italic">The future of real estate is transparent.</h2>
                        <p className="text-gray-400 mb-10 font-light">
                            Join 1,200+ active bidders in {locations[0] || 'the city'} and bid with confidence using BidMetric analytics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/listings"
                                className="px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-white/5"
                            >
                                Browse Listings
                            </Link>
                            <Link
                                href="/register"
                                className="px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
                            >
                                Start Selling
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
