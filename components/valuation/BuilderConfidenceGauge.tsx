'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, CheckCircle, XCircle, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react'

type BuilderConfidenceProps = {
    builderName: string
    builderId?: string
    score: number
    level: 'high' | 'medium' | 'low'
    priceImpact: number
    details?: {
        reraRegistered?: boolean
        onTimeDelivery?: number
        avgRating?: number
        completedProjects?: number
        totalProjects?: number
        legalIssues?: number
    }
}

export default function BuilderConfidenceGauge({
    builderName,
    builderId,
    score,
    level,
    priceImpact,
    details
}: BuilderConfidenceProps) {
    const getLevelColor = () => {
        switch (level) {
            case 'high':
                return {
                    bg: 'from-green-500/20 to-emerald-500/20',
                    border: 'border-green-500/30',
                    text: 'text-green-400',
                    badge: 'bg-green-500'
                }
            case 'medium':
                return {
                    bg: 'from-yellow-500/20 to-amber-500/20',
                    border: 'border-yellow-500/30',
                    text: 'text-yellow-400',
                    badge: 'bg-yellow-500'
                }
            case 'low':
                return {
                    bg: 'from-red-500/20 to-orange-500/20',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    badge: 'bg-red-500'
                }
        }
    }

    const colors = getLevelColor()

    const getStars = (rating: number) => {
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-600'}>
                        {i < fullStars ? '⭐' : (i === fullStars && hasHalfStar ? '⭐' : '☆')}
                    </span>
                ))}
            </div>
        )
    }

    const getPriceImpactText = () => {
        const percent = ((priceImpact - 1) * 100).toFixed(0)
        if (priceImpact > 1) {
            return `+${percent}% Premium Applied`
        } else if (priceImpact < 1) {
            return `${percent}% Discount Applied`
        } else {
            return 'Neutral Impact'
        }
    }

    return (
        <div className={`glass-dark p-6 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Building2 className={`w-6 h-6 ${colors.text}`} />
                    <div>
                        <h3 className="text-lg font-bold">Builder Confidence</h3>
                        <p className="text-sm text-gray-400">{builderName}</p>
                    </div>
                </div>

                {/* Link to Builder Page */}
                <Link
                    href={`/builders/${builderId || builderName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View Details
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Score Gauge */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Confidence Score</span>
                    <span className={`text-2xl font-bold ${colors.text}`}>{score}/100</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                        className={`${colors.badge} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                {/* Level Badge */}
                <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-bold uppercase ${colors.text}`}>
                        {level} Confidence
                    </span>
                    <span className="text-xs text-gray-500">{getPriceImpactText()}</span>
                </div>
            </div>

            {/* Details Grid */}
            {details && (
                <div className="space-y-3">
                    {/* RERA Status */}
                    {details.reraRegistered !== undefined && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                {details.reraRegistered ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                RERA Registered
                            </span>
                            <span className={`text-sm font-semibold ${details.reraRegistered ? 'text-green-400' : 'text-red-400'}`}>
                                {details.reraRegistered ? 'Yes' : 'No'}
                            </span>
                        </div>
                    )}

                    {/* On-Time Delivery */}
                    {details.onTimeDelivery !== undefined && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                On-Time Delivery
                            </span>
                            <span className="text-sm font-semibold text-blue-400">{details.onTimeDelivery}%</span>
                        </div>
                    )}

                    {/* Customer Rating */}
                    {details.avgRating !== undefined && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <span className="text-sm text-gray-300">Customer Rating</span>
                            <div className="flex items-center gap-2">
                                {getStars(details.avgRating)}
                                <span className="text-sm font-semibold text-yellow-400">{details.avgRating.toFixed(1)}</span>
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {details.completedProjects !== undefined && details.totalProjects !== undefined && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <span className="text-sm text-gray-300">Projects Completed</span>
                            <span className="text-sm font-semibold text-purple-400">
                                {details.completedProjects} / {details.totalProjects}
                            </span>
                        </div>
                    )}

                    {/* Legal Issues */}
                    {details.legalIssues !== undefined && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                Legal Issues
                            </span>
                            <span className={`text-sm font-semibold ${details.legalIssues === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                                {details.legalIssues}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Price Impact Footer */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                    💰 This builder&apos;s reputation impacts property value by{' '}
                    <span className={`font-bold ${colors.text}`}>
                        {((priceImpact - 1) * 100).toFixed(0)}%
                    </span>
                </p>
            </div>
        </div>
    )
}
