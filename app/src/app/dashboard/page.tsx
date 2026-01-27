import Header from '@/components/Header'
import AnimatedBackground from '@/components/AnimatedBackground'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/auth/signin')
    }

    const [myListings, myBids, wishlist] = await Promise.all([
        prisma.listing.findMany({
            where: { userId: session.user.id },
            include: {
                _count: { select: { bids: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.bid.findMany({
            where: { userId: session.user.id },
            include: {
                listing: true
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.wishlist.findMany({
            where: { userId: session.user.id },
            include: {
                listing: true
            },
            orderBy: { createdAt: 'desc' }
        })
    ])


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <AnimatedBackground />
            <Header />

            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-bold mb-2 neon-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            My Dashboard
                        </h1>
                        <p className="text-xl text-gray-300">
                            Welcome back, {session.user.name || 'User'}!
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">🏠</div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{myListings.length}</div>
                                    <div className="text-gray-400 text-sm">My Listings</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">💰</div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{myBids.length}</div>
                                    <div className="text-gray-400 text-sm">Bids Placed</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">📊</div>
                                <div>
                                    <div className="text-3xl font-bold text-white">
                                        {myListings.reduce((sum: number, l: any) => sum + (l._count?.bids || 0), 0)}
                                    </div>
                                    <div className="text-gray-400 text-sm">Bids Received</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">⭐</div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{wishlist.length}</div>
                                    <div className="text-gray-400 text-sm">Starred</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* My Listings */}
                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">🏠 My listings</h2>

                            {myListings.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No listings yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {myListings.map((listing: any) => (
                                        <Link key={listing.id} href={`/listings/${listing.id}`} className="block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white text-sm">{listing.title}</h3>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold">{listing.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-lg font-bold text-blue-400">₹{(listing.totalPrice / 10000000).toFixed(2)} Cr</div>
                                                <div className="text-xs text-gray-400">{listing._count.bids} bids</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Bids */}
                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">💰 My Bids</h2>

                            {myBids.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No bids yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {myBids.map((bid: any) => (
                                        <Link key={bid.id} href={`/listings/${bid.listing.id}`} className="block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white text-sm">{bid.listing.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${bid.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                                        bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>{bid.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-lg font-bold text-purple-400">₹{(bid.amount / 10000000).toFixed(2)} Cr</div>
                                                <div className="text-[10px] text-gray-400">{new Date(bid.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Starred Properties */}
                        <div className="glass-dark rounded-2xl p-6 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">⭐ Starred</h2>

                            {wishlist.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p>Explore & star properties!</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {wishlist.map((item: any) => (
                                        <Link key={item.id} href={`/listings/${item.listing.id}`} className="block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white text-sm">{item.listing.title}</h3>
                                                <div className="text-yellow-400">★</div>
                                            </div>
                                            <div className="text-xs text-gray-400 mb-2">{item.listing.areaName}</div>
                                            <div className="text-lg font-bold text-white">₹{(item.listing.totalPrice / 10000000).toFixed(2)} Cr</div>
                                        </Link>
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

