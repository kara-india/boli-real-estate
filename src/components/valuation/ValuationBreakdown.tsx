'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

type ValuationFactor = {
    factor: string
    impact: number
    percentage: number
    direction: 'positive' | 'negative'
}

type ValuationBreakdownProps = {
    factors: ValuationFactor[]
    totalValuation: number
    methodology?: string
    confidenceInterval: number
}

export default function ValuationBreakdown({
    factors,
    totalValuation,
    methodology,
    confidenceInterval
}: ValuationBreakdownProps) {
    const formatImpact = (impact: number) => {
        const absImpact = Math.abs(impact)
        const sign = impact >= 0 ? '+' : '-'
        return `${sign}₹${(absImpact / 100000).toFixed(2)} L`
    }

    const getBarWidth = (percentage: number) => {
        return Math.min(Math.abs(percentage) * 3, 100)
    }

    return (
        <div className="space-y-6">
            {/* Confidence Metrics */}
            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#CFA84B]/10 rounded-xl p-4 border border-[#D4AF37]/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">BidMetric Fair Value</p>
                        <p className="text-3xl font-bold text-gray-900">
                            ₹{(totalValuation / 100000).toFixed(2)} L
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Confidence</p>
                        <p className="text-2xl font-bold text-[#D4AF37]">{confidenceInterval}%</p>
                    </div>
                </div>
                <div className="mt-3 bg-gray-200 h-2 rounded-full w-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#CFA84B] h-full rounded-full"
                        style={{ width: `${confidenceInterval}%` }}
                    />
                </div>
            </div>

            {/* Top 5 Factors */}
            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-[#D4AF37]" />
                    Top Contributing Factors
                </h4>

                <div className="space-y-4">
                    {factors.map((factor, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {factor.direction === 'positive' ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold ${factor.direction === 'positive' ? 'text-green-600' : 'text-[#DC2626]'
                                        }`}>
                                        {formatImpact(factor.impact)}
                                    </span>
                                    <span className={`text-xs font-semibold w-14 text-right ${factor.direction === 'positive' ? 'text-green-600' : 'text-[#DC2626]'
                                        }`}>
                                        {factor.percentage >= 0 ? '+' : ''}{factor.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${factor.direction === 'positive'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                        }`}
                                    style={{ width: `${getBarWidth(factor.percentage)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Methodology */}
            {methodology && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-900">
                            <p className="font-semibold mb-1">Valuation Methodology</p>
                            <p>{methodology}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Waterfall Explanation */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-700">
                    <strong>How we calculated this:</strong> Base market price + HPI adjustments + infrastructure score +
                    builder premium/discount + area trends + environmental factors = BidMetric Fair Value
                </p>
            </div>
        </div>
    )
}

// Import BarChart icon
function BarChart({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    )
}
