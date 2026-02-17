'use client'

import React, { useEffect, useState } from 'react'
import { Clock, TrendingDown, AlertCircle } from 'lucide-react'

type MotivatedSaleBannerProps = {
    ownerPrice: number
    bidmetricPrice: number
    expiresInDays: number
    label: string
}

export default function MotivatedSaleBanner({
    ownerPrice,
    bidmetricPrice,
    expiresInDays,
    label
}: MotivatedSaleBannerProps) {
    const [timeRemaining, setTimeRemaining] = useState({ days: expiresInDays, hours: 0, minutes: 0 })

    useEffect(() => {
        // Simple countdown (in a real app, you'd calculate from exact timestamp)
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1 }
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59 }
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 }
                }
                return prev
            })
        }, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    const discountPercent = ((bidmetricPrice - ownerPrice) / bidmetricPrice * 100).toFixed(1)

    return (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-start gap-4">
                <div className="bg-orange-500 rounded-full p-3">
                    <TrendingDown className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Motivated Seller</h3>
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                            PRICE REDUCED
                        </span>
                    </div>

                    <p className="text-gray-700 mb-3">{label}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Discount Amount */}
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <p className="text-xs text-gray-600 font-semibold">Below Market Value</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">
                                {discountPercent}% OFF
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Saves ₹{((bidmetricPrice - ownerPrice) / 100000).toFixed(2)} L
                            </p>
                        </div>

                        {/* Countdown */}
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <p className="text-xs text-gray-600 font-semibold">Time Remaining</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-orange-600">{timeRemaining.days}</p>
                                <p className="text-sm text-gray-500">days</p>
                                <p className="text-lg font-semibold text-orange-600">{timeRemaining.hours}h</p>
                                <p className="text-lg font-semibold text-orange-600">{timeRemaining.minutes}m</p>
                            </div>
                        </div>
                    </div>

                    {/* Ethical message */}
                    <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-900">
                            <strong>Why is this priced below market?</strong> The owner has chosen to reduce the price for a quicker sale.
                            This is a legitimate listing verified by BidMetric. BidMetric fair market value: ₹{(bidmetricPrice / 100000).toFixed(2)} L
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
