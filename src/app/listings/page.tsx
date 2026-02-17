
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MapPin, BedDouble, Bath, Square, Loader2 } from 'lucide-react'

// Define the Property type based on our database schema
type Property = {
    id: string
    title: string
    description: string
    price: number
    location: string
    sqft: number
    type: string
    bedrooms: number
    bathrooms: number
    image_url: string
    status: string
}

export default function ListingsPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Fetch properties from Supabase
        const fetchProperties = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'active') // Only show active listings

            if (error) {
                console.error('Error fetching properties:', error)
            } else {
                setProperties(data || [])
            }
            setIsLoading(false)
        }

        fetchProperties()
    }, [])

    // Helper function to format currency in Indian format
    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`
        } else {
            return `₹${(price / 100000).toFixed(2)} L`
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 neon-text">
                            Active Listings
                        </h1>
                        <p className="text-gray-400">Discover verified properties open for bidding</p>
                    </div>
                    {/* Filter/Sort buttons could go here */}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <Link
                                href={`/listings/${property.id}`}
                                key={property.id}
                                className="group glass-dark rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 border border-white/10 hover:border-blue-500/50 block"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 w-full overflow-hidden">
                                    <img
                                        src={property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80'}
                                        alt={property.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                                        {property.type}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse">
                                        LIVE BIDDING
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                                {property.title}
                                            </h2>
                                            <div className="flex items-center text-gray-400 text-sm">
                                                <MapPin size={14} className="mr-1" />
                                                {property.location}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Current Price</p>
                                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                                {formatPrice(property.price)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/10 mb-4">
                                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5">
                                            <BedDouble size={18} className="text-blue-400 mb-1" />
                                            <span className="text-xs text-gray-300">{property.bedrooms} Beds</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5">
                                            <Bath size={18} className="text-purple-400 mb-1" />
                                            <span className="text-xs text-gray-300">{property.bathrooms} Baths</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5">
                                            <Square size={18} className="text-pink-400 mb-1" />
                                            <span className="text-xs text-gray-300">{property.sqft} sqft</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-blue-900/20">
                                        View Details & Bid
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
