'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type PriceComparisonProps = {
    marketPrice: number
    ownerListedPrice: number
    aiValuation: number
    aiVsMarket: {
        category: 'undervalued' | 'fairly_valued' | 'overvalued'
        deviationPercent: number
        badge: 'golden' | 'silver' | 'neutral'
    }
    aiVsOwner: {
        comparison: 'ai_higher' | 'owner_higher' | 'equal'
        deviationPercent: number
    }
    confidenceRange: {
        lower: number
        upper: number
    }
    confidenceLevel: number
    builderComparable?: {
        builderName: string
        avgPricePerSqft: number
        sampleSize: number
    }
}

export default function PriceComparisonCard({
    marketPrice,
    ownerListedPrice,
    aiValuation,
    aiVsMarket,
    aiVsOwner,
    confidenceRange,
    confidenceLevel,
    builderComparable
}: PriceComparisonProps) {
    const formatPrice = (price: number) => `₹${(price / 100000).toFixed(2)} L`

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'golden':
                return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
            case 'silver':
                return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
            default:
                return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        }
    }

    const getCategoryText = () => {
        if (aiVsMarket.category === 'overvalued') {
            return {
                icon: <TrendingUp className="w-5 h-5" />,
                text: `PREMIUM PROPERTY`,
                subtext: `AI values this ${Math.abs(aiVsMarket.deviationPercent).toFixed(1)}% above market rate`,
                color: 'text-yellow-400'
            }
        } else if (aiVsMarket.category === 'undervalued') {
            return {
                icon: <TrendingDown className="w-5 h-5" />,
                text: `BELOW MARKET`,
                subtext: `AI values this ${Math.abs(aiVsMarket.deviationPercent).toFixed(1)}% below market rate`,
                color: 'text-gray-300'
            }
        } else {
            return {
                icon: <Minus className="w-5 h-5" />,
                text: `MARKET ALIGNED`,
                subtext: `AI valuation matches market rate`,
                color: 'text-blue-400'
            }
        }
    }

    const getOwnerComparisonText = () => {
        if (aiVsOwner.comparison === 'owner_higher') {
            return `Owner overvalues by ${Math.abs(aiVsOwner.deviationPercent).toFixed(1)}%`
        } else if (aiVsOwner.comparison === 'ai_higher') {
            return `Owner undervalues by ${Math.abs(aiVsOwner.deviationPercent).toFixed(1)}%`
        } else {
            return `Owner pricing aligned with AI`
        }
    }

    const category = getCategoryText()

    return (
        <div className="glass-dark p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                PRICE COMPARISON
            </h3>

            {/* Three Price Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Market Price */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Market Value</p>
                    <p className="text-sm text-gray-500 mb-2">Avg. rate × Area</p>
                    <p className="text-2xl font-bold text-blue-400">{formatPrice(marketPrice)}</p>
                </div>

                {/* Owner Listed Price */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Owner Listed Price</p>
                    <p className="text-sm text-gray-500 mb-2">Seller&apos;s asking</p>
                    <p className="text-2xl font-bold text-purple-400">{formatPrice(ownerListedPrice)}</p>
                </div>

                {/* AI Valuation */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-xs text-blue-300 mb-1">AI Valuation</p>
                    <p className="text-sm text-blue-400 mb-2">Data-driven price</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {formatPrice(aiValuation)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        {formatPrice(confidenceRange.lower)} - {formatPrice(confidenceRange.upper)}
                    </p>
                    <div className="w-full bg-gray-700 h-1 rounded-full mt-2">
                        <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${confidenceLevel}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{confidenceLevel}% confidence</p>
                </div>
            </div>

            {/* AI vs Market Badge */}
            <div className={`rounded-xl p-4 mb-4 ${getBadgeColor(aiVsMarket.badge)}`}>
                <div className="flex items-center gap-3">
                    <div className={category.color}>
                        {category.icon}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">{category.text}</p>
                        <p className="text-xs opacity-90">{category.subtext}</p>
                    </div>
                </div>
            </div>

            {/* Owner Comparison */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                    <span className="font-semibold">Owner vs AI:</span> {getOwnerComparisonText()}
                </p>
            </div>

            {/* Builder Comparable */}
            {builderComparable && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-300">
                        💡 Similar properties by <span className="font-bold">{builderComparable.builderName}</span> in this area go for{' '}
                        <span className="font-bold">₹{builderComparable.avgPricePerSqft.toLocaleString()}/sqft</span>
                        {builderComparable.sampleSize > 0 && (
                            <span className="text-xs text-gray-400"> (based on {builderComparable.sampleSize} properties)</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    )
}
