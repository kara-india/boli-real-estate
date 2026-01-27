import Header from '@/components/Header'
import AnimatedBackground from '@/components/AnimatedBackground'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BiddingInterface from '@/components/BiddingInterface'
import PriceChart from '@/components/PriceChart'
import WishlistButton from '@/components/WishlistButton'
import { format } from 'date-fns'

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, email: true } },
            bids: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!listing) {
        notFound()
    }

    // Get historical prices for this area
    const historicalPrices = await prisma.historicalPrice.findMany({
        where: { areaName: listing.areaName },
        orderBy: { date: 'asc' }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <AnimatedBackground />
            <Header />

            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Property Header */}
                    <div className="glass-dark rounded-3xl p-8 mb-6 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Image */}
                            <div className="h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <div className="text-center text-white">
                                    <div className="text-8xl font-bold mb-4">{listing.configuration}</div>
                                    <div className="text-2xl opacity-90">{listing.areaName}</div>
                                    <div className="text-lg opacity-75 mt-2">{listing.zone}</div>
                                </div>
                                {listing.bids.length > 0 && (
                                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold">
                                        🔥 {listing.bids.length} {listing.bids.length === 1 ? 'Bid' : 'Bids'}
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-4xl font-bold text-white mb-4">{listing.title}</h1>
                                    <WishlistButton listingId={listing.id} />
                                </div>
                                <p className="text-gray-300 mb-6">{listing.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-sm text-gray-400 mb-1">Area</div>
                                        <div className="text-2xl font-bold text-white">{listing.area} sqft</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-sm text-gray-400 mb-1">Rate/sqft</div>
                                        <div className="text-2xl font-bold text-blue-400">₹{listing.ratePerSqft.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-sm text-gray-400 mb-1">Property Type</div>
                                        <div className="text-lg font-semibold text-white">{listing.propertyType}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                        <div className="text-sm text-gray-400 mb-1">Configuration</div>
                                        <div className="text-lg font-semibold text-white">{listing.configuration}</div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                                    <div className="text-sm text-gray-300 mb-2">Total Price</div>
                                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                        ₹{(listing.totalPrice / 10000000).toFixed(2)} Cr
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        Bid Range: ₹{(listing.minBidAmount / 10000000).toFixed(2)}Cr - ₹{(listing.maxBidAmount / 10000000).toFixed(2)}Cr
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Bidding Interface */}
                        <div className="md:col-span-2">
                            <BiddingInterface listing={listing} />

                            {/* Historical Price Chart */}
                            {historicalPrices.length > 0 && (
                                <div className="glass-dark rounded-2xl p-6 border border-white/10 mt-6">
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        📈 Historical Price Trends
                                    </h3>
                                    <PriceChart data={historicalPrices} />
                                </div>
                            )}
                        </div>

                        {/* Bids List */}
                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Recent Bids ({listing.bids.length})
                            </h3>

                            {listing.bids.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">💰</div>
                                    <p>No bids yet. Be the first!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {listing.bids.map((bid) => (
                                        <div key={bid.id} className="bg-white/5 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-white">{bid.user.name || 'Anonymous'}</div>
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${bid.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                    bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {bid.status}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-400">
                                                ₹{(bid.amount / 10000000).toFixed(2)} Cr
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(bid.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
