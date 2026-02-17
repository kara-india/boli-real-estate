
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, MapPin, TrendingUp } from 'lucide-react'
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

    // Helper to group data by location for the chart
    const getChartData = () => {
        const dataByDate: Record<string, Record<string, string | number>> = {}

        trends.forEach(trend => {
            const dateStr = format(new Date(trend.date), 'MMM yy')
            if (!dataByDate[dateStr]) {
                dataByDate[dateStr] = { date: dateStr }
            }
            // Normalize location key
            const key = trend.location.replace(/\s+/g, '')
            dataByDate[dateStr][key] = trend.avg_price_per_sqft
        })

        return Object.values(dataByDate)
    }

    const chartData = getChartData()

    // Calculate growth for "City Intelligence"
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
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 neon-text">City Intelligence & Analytics</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Real-time market insights powered by BidMetric&apos;s data engine. Make informed decisions with historical price trends and predictive valuations.
                    </p>
                </div>

                {/* Intelligence Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {locations.map(location => {
                        const growth = getGrowth(location)
                        const isPositive = growth >= 0
                        return (
                            <div key={location} className="glass-dark p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <MapPin className="text-blue-400" />
                                    </div>
                                    <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                                        {Math.abs(growth).toFixed(1)}%
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{location}</h3>
                                <p className="text-sm text-gray-400">Avg. Price Growth (2Y)</p>
                            </div>
                        )
                    })}
                </div>

                {/* Main Chart */}
                <div className="glass-dark p-8 rounded-2xl border border-white/10 mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="text-purple-400" />
                            Comparative Price Trends (₹/sqft)
                        </h2>
                    </div>

                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} />
                                <YAxis stroke="#ffffff50" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="MiraRoad" stroke="#3b82f6" strokeWidth={3} dot={false} name="Mira Road" />
                                <Line type="monotone" dataKey="ThaneWest" stroke="#8b5cf6" strokeWidth={3} dot={false} name="Thane West" />
                                <Line type="monotone" dataKey="BorivaliWest" stroke="#ec4899" strokeWidth={3} dot={false} name="Borivali West" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center py-16 px-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-3xl border border-white/10">
                    <h2 className="text-3xl font-bold mb-4">Ready to enter the market?</h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                        Use our insights to find undervalued properties and place winning bids.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/listings"
                            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
                        >
                            Browse Properties
                        </Link>
                        <Link
                            href="/signup"
                            className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}
