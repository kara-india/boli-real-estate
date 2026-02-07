import Header from '@/components/Header'
import AnimatedBackground from '@/components/AnimatedBackground'
import prisma from '@/lib/prisma'
import PriceChart from '@/components/PriceChart'

export default async function AnalyticsPage() {
    // Get all zones and their average prices
    const zones = await prisma.historicalPrice.groupBy({
        by: ['zone'],
        _avg: {
            ratePerSqft: true
        }
    })

    // Get historical data for each zone
    const zoneData = await Promise.all(
        zones.map(async (zone) => {
            const prices = await prisma.historicalPrice.findMany({
                where: { zone: zone.zone },
                orderBy: { date: 'asc' },
                take: 20
            })
            return {
                zone: zone.zone,
                avgPrice: zone._avg.ratePerSqft,
                historicalPrices: prices
            }
        })
    )

    // Get top societies by appreciation
    const societies = await prisma.historicalPrice.groupBy({
        by: ['areaName'],
        _avg: {
            ratePerSqft: true
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <AnimatedBackground />
            <Header />

            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-5xl font-bold mb-2 neon-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Price Analytics
                        </h1>
                        <p className="text-xl text-gray-300">
                            5-year historical trends and market insights
                        </p>
                    </div>

                    {/* Zone Comparison */}
                    <div className="glass-dark rounded-3xl p-8 mb-6 border border-white/10">
                        <h2 className="text-3xl font-bold text-white mb-6">📊 Zone Comparison</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {zoneData.map((data) => (
                                <div key={data.zone} className="bg-white/5 rounded-xl p-6 text-center">
                                    <div className="text-sm text-gray-400 mb-2">{data.zone}</div>
                                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        ₹{Math.round(data.avgPrice || 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Avg Rate/sqft</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historical Charts */}
                    {zoneData.map((data) => (
                        data.historicalPrices.length > 0 && (
                            <div key={data.zone} className="glass-dark rounded-2xl p-6 mb-6 border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    📈 {data.zone} - Price Trends
                                </h3>
                                <PriceChart data={data.historicalPrices} />
                            </div>
                        )
                    ))}

                    {/* Top Societies */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">🏆 Top Societies by Average Price</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {societies
                                .sort((a, b) => (b._avg.ratePerSqft || 0) - (a._avg.ratePerSqft || 0))
                                .slice(0, 9)
                                .map((society, index) => (
                                    <div key={society.areaName} className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-white text-sm">{society.areaName}</div>
                                            <div className="text-blue-400 font-bold">
                                                ₹{Math.round(society._avg.ratePerSqft || 0).toLocaleString()}/sqft
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
