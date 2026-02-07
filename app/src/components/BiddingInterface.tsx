'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BiddingInterface({ listing }: { listing: any }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [bidAmount, setBidAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (!session) {
            router.push('/auth/signin')
            return
        }

        const amount = parseFloat(bidAmount) * 10000000 // Convert Cr to rupees

        if (amount < listing.minBidAmount || amount > listing.maxBidAmount) {
            setError(`Bid must be between ₹${(listing.minBidAmount / 10000000).toFixed(2)}Cr and ₹${(listing.maxBidAmount / 10000000).toFixed(2)}Cr`)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing.id,
                    amount
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to place bid')
                setLoading(false)
                return
            }

            setSuccess(true)
            setBidAmount('')
            setTimeout(() => {
                router.refresh()
            }, 1000)
        } catch (error) {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-dark rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">💰 Place Your Bid</h3>

            {!session ? (
                <div className="text-center py-8">
                    <p className="text-gray-300 mb-4">Please sign in to place a bid</p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-lg transition"
                    >
                        Sign In to Bid
                    </Link>
                </div>
            ) : (
                <>
                    {success && (
                        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
                            ✅ Bid placed successfully!
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Your Bid Amount (in Crores)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full pl-10 pr-16 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">Cr</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-400">
                                Range: ₹{(listing.minBidAmount / 10000000).toFixed(2)}Cr - ₹{(listing.maxBidAmount / 10000000).toFixed(2)}Cr
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Placing Bid...' : 'Place Bid'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}
