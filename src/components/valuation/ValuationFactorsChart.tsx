'use client'

import React from 'react'
import { Info } from 'lucide-react'

type ValuationFactor = {
    factor: string
    impact: number
    percentage: number
    direction: 'positive' | 'negative'
}

type ValuationFactorsChartProps = {
    factors: ValuationFactor[]
    totalValuation: number
    methodology: string
}

export default function ValuationFactorsChart({
    factors,
    totalValuation,
    methodology
}: ValuationFactorsChartProps) {
    const formatImpact = (impact: number) => {
        const lakhs = impact / 100000
        return lakhs >= 0 ? `+₹${lakhs.toFixed(2)}L` : `-₹${Math.abs(lakhs).toFixed(2)}L`
    }

    const getBarColor = (direction: string) => {
        return direction === 'positive' ? 'bg-green-500' : 'bg-red-500'
    }

    const getBarWidth = (percentage: number) => {
        // Normalize to 0-100 for display
        const maxPercentage = Math.max(...factors.map(f => Math.abs(f.percentage)))
        return (Math.abs(percentage) / maxPercentage) * 100
    }

    return (
        <div className="glass-dark p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-bold">Valuation Breakdown</h3>
            </div>

            <p className="text-sm text-gray-400 mb-6">
                Top factors contributing to the AI valuation of{' '}
                <span className="font-bold text-blue-400">₹{(totalValuation / 100000).toFixed(2)}L</span>
            </p>

            {/* Factors List */}
            <div className="space-y-4">
                {factors.map((factor, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{factor.factor}</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-semibold ${factor.direction === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatImpact(factor.impact)}
                                </span>
                                <span className="text-xs text-gray-500 w-12 text-right">
                                    {factor.percentage >= 0 ? '+' : ''}{factor.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                            <div
                                className={`${getBarColor(factor.direction)} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${getBarWidth(factor.percentage)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Methodology Explanation */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                        {methodology}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Positive Impact</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Negative Impact</span>
                </div>
            </div>
        </div>
    )
}
