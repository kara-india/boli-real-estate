import Header from '@/components/Header'
import AnimatedBackground from '@/components/AnimatedBackground'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import WishlistButton from '@/components/WishlistButton'


export default async function ListingsPage() {
    const listings = await prisma.listing.findMany({
        where: { status: 'active' },
        include: {
            user: { select: { name: true, email: true } },
            _count: { select: { bids: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <AnimatedBackground />
            <Header />

            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl font-bold mb-4 neon-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Property Listings
                        </h1>
                        <p className="text-xl text-gray-300">
                            {listings.length} premium properties available for bidding
                        </p>
                    </div>

                    {/* Listings Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing: any) => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="block"
                            >
                                <div className="glass-dark rounded-2xl overflow-hidden card-hover border border-white/10 h-full">
                                    {/* Property Image/Header */}
                                    <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <div className="text-5xl font-bold mb-2">{listing.configuration}</div>
                                                <div className="text-sm opacity-90 font-semibold">{listing.areaName}</div>
                                            </div>
                                        </div>
                                        {/* Wishlist Button */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <WishlistButton listingId={listing.id} />
                                        </div>
                                        {/* Bid Count Badge */}
                                        {listing._count.bids > 0 && (

                                            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                                                🔥 {listing._count.bids} {listing._count.bids === 1 ? 'Bid' : 'Bids'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Property Details */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                                            {listing.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {listing.description}
                                        </p>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Zone</div>
                                                <div className="text-sm font-semibold text-white">{listing.zone}</div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Area</div>
                                                <div className="text-sm font-semibold text-white">{listing.area} sqft</div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Rate/sqft</div>
                                                <div className="text-sm font-semibold text-blue-400">₹{listing.ratePerSqft.toLocaleString()}</div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Type</div>
                                                <div className="text-sm font-semibold text-white">{listing.propertyType}</div>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="border-t border-white/10 pt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <div className="text-xs text-gray-400 mb-1">Total Price</div>
                                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                        ₹{(listing.totalPrice / 10000000).toFixed(2)} Cr
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-400 mb-1">Bid Range</div>
                                                    <div className="text-xs text-gray-300">
                                                        ₹{(listing.minBidAmount / 10000000).toFixed(2)}Cr - ₹{(listing.maxBidAmount / 10000000).toFixed(2)}Cr
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg text-center text-white font-semibold text-sm border border-blue-500/30">
                                                View Details & Place Bid →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {listings.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🏠</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No listings available</h3>
                            <p className="text-gray-400">Check back soon for new properties!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
