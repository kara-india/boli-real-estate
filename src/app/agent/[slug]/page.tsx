'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Share2, Phone, Mail, MapPin, Star, Rocket, ExternalLink, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

type Agent = {
    id: string
    name: string
    slug: string
    photo_url?: string
    bio?: string
    location?: string
    verified: boolean
    founding_broker: boolean
    golden_page_active: boolean
    total_listings: number
    total_page_views: number
}

type Listing = {
    id: string
    title: string
    description?: string
    price: number
    currency: string
    location: string
    attrs: any
    primary_image?: string
    images: string[]
    is_boosted: boolean
    views: number
    created_at: string
}

export default function AgentPage() {
    const params = useParams()
    const slug = params?.slug as string

    const [agent, setAgent] = useState<Agent | null>(null)
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
    const [showRequestModal, setShowRequestModal] = useState(false)

    useEffect(() => {
        if (slug) {
            fetchAgentPage()
        }
    }, [slug])

    const fetchAgentPage = async () => {
        try {
            const response = await fetch(`/api/agents/${slug}`)
            if (!response.ok) throw new Error('Agent not found')

            const data = await response.json()
            setAgent(data.agent)
            setListings(data.listings)
        } catch (error) {
            console.error('Error fetching agent page:', error)
            toast.error('Failed to load agent page')
        } finally {
            setIsLoading(false)
        }
    }

    const handleShare = async (channel: 'whatsapp' | 'copy' | 'sms') => {
        if (!agent) return

        try {
            const response = await fetch(`/api/agents/${agent.id}/share`)
            const data = await response.json()

            if (channel === 'whatsapp') {
                window.open(data.share_urls.whatsapp, '_blank')
            } else if (channel === 'copy') {
                await navigator.clipboard.writeText(data.short_link)
                toast.success('Link copied to clipboard!')
            } else if (channel === 'sms') {
                window.location.href = `sms:?body=${encodeURIComponent(data.messages.sms)}`
            }

            // Track share event
            await fetch(`/api/agents/${agent.id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel })
            })

        } catch (error) {
            console.error('Error sharing:', error)
            toast.error('Failed to share')
        }
    }

    const handleSendRequest = (listing: Listing) => {
        setSelectedListing(listing)
        setShowRequestModal(true)
    }

    const formatPrice = (price: number, currency: string) => {
        if (currency === 'INR') {
            return `₹${(price / 100000).toFixed(2)} L`
        }
        return `${currency} ${price.toLocaleString()}`
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        )
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent not found</h1>
                    <p className="text-gray-600">This Golden Page doesn&apos;t exist or has been removed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#F5F3F0] to-white border-b-2 border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Agent Photo */}
                        <div className="relative">
                            {agent.photo_url ? (
                                <Image
                                    src={agent.photo_url}
                                    alt={agent.name}
                                    width={120}
                                    height={120}
                                    className="rounded-full border-4 border-[#D4AF37]"
                                />
                            ) : (
                                <div className="w-30 h-30 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border-4 border-[#D4AF37]">
                                    <span className="text-4xl font-bold text-[#D4AF37]">
                                        {agent.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                            {agent.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                                    <Star className="w-5 h-5 text-white fill-white" />
                                </div>
                            )}
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
                                <span className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] text-white text-xs font-bold rounded-full">
                                    GOLDEN PAGE
                                </span>
                                {agent.founding_broker && (
                                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                        FOUNDING BROKER
                                    </span>
                                )}
                            </div>

                            {agent.location && (
                                <div className="flex items-center gap-2 text-gray-600 mb-3">
                                    <MapPin className="w-4 h-4" />
                                    <span>{agent.location}</span>
                                </div>
                            )}

                            {agent.bio && (
                                <p className="text-gray-700 mb-4 max-w-2xl">{agent.bio}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{agent.total_listings} Properties</span>
                                <span>•</span>
                                <span>{agent.total_page_views.toLocaleString()} Page Views</span>
                            </div>
                        </div>

                        {/* Share Button */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="px-6 py-3 bg-[#25D366] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#20BA5A] transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share on WhatsApp
                            </button>
                            <button
                                onClick={() => handleShare('copy')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Properties ({listings.length})
                    </h2>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <p className="text-gray-600">No properties listed yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onSendRequest={() => handleSendRequest(listing)}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Request Modal */}
            {showRequestModal && selectedListing && (
                <BuyerRequestModal
                    listing={selectedListing}
                    agentName={agent.name}
                    onClose={() => {
                        setShowRequestModal(false)
                        setSelectedListing(null)
                    }}
                />
            )}
        </div>
    )
}

// Listing Card Component
function ListingCard({
    listing,
    onSendRequest,
    formatPrice
}: {
    listing: Listing
    onSendRequest: () => void
    formatPrice: (price: number, currency: string) => string
}) {
    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {listing.primary_image ? (
                    <Image
                        src={listing.primary_image}
                        alt={listing.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">No image</span>
                    </div>
                )}

                {listing.is_boosted && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Rocket className="w-3 h-3" />
                        BOOSTED
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{listing.location}</span>
                </div>

                {/* Attributes */}
                {listing.attrs && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {listing.attrs.beds && <span>{listing.attrs.beds} Beds</span>}
                        {listing.attrs.baths && <span>{listing.attrs.baths} Baths</span>}
                        {listing.attrs.area && <span>{listing.attrs.area} sqft</span>}
                    </div>
                )}

                {/* Price */}
                <div className="text-2xl font-bold text-[#D4AF37] mb-4">
                    {formatPrice(listing.price, listing.currency)}
                </div>

                {/* CTA */}
                <button
                    onClick={onSendRequest}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                    <MessageSquare className="w-5 h-5" />
                    Send Request
                </button>

                {/* Views */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                    {listing.views} views
                </div>
            </div>
        </div>
    )
}

// Buyer Request Modal Component
function BuyerRequestModal({
    listing,
    agentName,
    onClose
}: {
    listing: Listing
    agentName: string
    onClose: () => void
}) {
    const [formData, setFormData] = useState({
        buyer_name: '',
        buyer_phone: '',
        buyer_email: '',
        message: '',
        preferred_visit_date: '',
        preferred_visit_time: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/listings/${listing.id}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    source: 'agent_page'
                })
            })

            if (!response.ok) throw new Error('Failed to send request')

            toast.success('Request sent! The agent will contact you within 24 hours.')
            onClose()
        } catch (error) {
            console.error('Error sending request:', error)
            toast.error('Failed to send request. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send Request</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Send request to {agentName}. We&apos;ll notify them — expect a reply within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.buyer_name}
                            onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.buyer_phone}
                            onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            placeholder="+91 9XXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email (optional)
                        </label>
                        <input
                            type="email"
                            value={formData.buyer_email}
                            onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Message (optional)
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            rows={3}
                            placeholder="Hi, I'm interested in this property. Please call me to schedule a visit."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Preferred Date
                            </label>
                            <input
                                type="date"
                                value={formData.preferred_visit_date}
                                onChange={(e) => setFormData({ ...formData, preferred_visit_date: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Preferred Time
                            </label>
                            <input
                                type="time"
                                value={formData.preferred_visit_time}
                                onChange={(e) => setFormData({ ...formData, preferred_visit_time: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
