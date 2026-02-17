
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MapPin, BedDouble, Bath, Square, Loader2, ArrowRight, ShieldCheck, Clock } from 'lucide-react'
import { differenceInDays } from 'date-fns'

type Property = {
    id: string
    title: string
    description: string
    price: number // Owner price
    bidmetric_price: number // AI price
    location: string
    sqft: number
    type: string
    bedrooms: number
    bathrooms: number
    image_url: string
    status: string
    owner_timer_expiry?: string
}

export default function ListingsPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchProperties = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching properties:', error)
            } else {
                setProperties(data || [])
            }
            setIsLoading(false)
        }

        fetchProperties()
    }, [])

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`
        } else {
            return `₹${(price / 100000).toFixed(2)} L`
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-gold/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-[10px] font-bold uppercase tracking-widest mb-3 border border-gold/20">
                            <ShieldCheck size={12} />
                            Verified by BidMetric AI
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            Premier Property <span className="text-gold-dark">Listings</span>
                        </h1>
                        <p className="text-gray-500 font-light flex items-center gap-2">
                            Explore direct-from-owner listings with pre-computed fair valuation data.
                        </p>
                    </div>
                    {/* Add Filter Count */}
                    <div className="text-sm font-medium text-gray-400">
                        Showing <span className="text-gray-900">{properties.length}</span> Premium Properties
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 text-gold animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {properties.map((property) => {
                            const isMotivated = property.owner_timer_expiry && new Date(property.owner_timer_expiry) > new Date()
                            const daysRemaining = isMotivated ? differenceInDays(new Date(property.owner_timer_expiry!), new Date()) : 0

                            return (
                                <Link
                                    href={`/listings/${property.id}`}
                                    key={property.id}
                                    className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gold/30 flex flex-col"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-72 w-full overflow-hidden">
                                        <img
                                            src={property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                                            alt={property.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Status & Type Badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-800 border border-gray-100 shadow-sm uppercase tracking-wide">
                                                {property.type}
                                            </div>
                                            {isMotivated && (
                                                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-bold text-red-600 border border-red-100 shadow-sm flex items-center gap-1.5 animate-pulse uppercase tracking-wide">
                                                    <Clock size={10} />
                                                    {daysRemaining} Days
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Valuation Overlap */}
                                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-4 py-3 rounded-xl border border-white/20 shadow-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BidMetric Price</p>
                                                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-dark to-gold">
                                                    {formatPrice(property.bidmetric_price || property.price)}
                                                </p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-100 mx-2"></div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ask Price</p>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {formatPrice(property.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
                                                <MapPin size={12} className="text-gold" />
                                                {property.location}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-gold-dark transition-colors leading-tight">
                                                {property.title}
                                            </h2>

                                            <div className="grid grid-cols-3 gap-4 pb-8 mb-auto">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <BedDouble size={16} className="text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-800">{property.bedrooms}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Beds</span>
                                                </div>
                                                <div className="flex flex-col items-start gap-1 border-x border-gray-100 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Bath size={16} className="text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-800">{property.bathrooms}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Baths</span>
                                                </div>
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Square size={16} className="text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-800">{property.sqft}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sqft</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs font-bold text-gold-dark flex items-center gap-2">
                                                Explore Detailed Valuation <ArrowRight size={14} />
                                            </span>
                                            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold transformation group-hover:bg-gold group-hover:text-white transition-all duration-300">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && properties.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Loader2 size={48} className="mx-auto text-gold mb-4 animate-pulse opacity-20" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Listings</h3>
                        <p className="text-gray-400">All properties are currently under review or sold.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
