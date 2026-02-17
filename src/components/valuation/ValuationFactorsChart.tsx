
'use client'

import React from 'react'
import { Info, BarChart3, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react'

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
        return direction === 'positive' ? 'bg-gold' : 'bg-gray-400'
    }

    const getTextColor = (direction: string) => {
        return direction === 'positive' ? 'text-gold-dark' : 'text-gray-500'
    }

    const getBarWidth = (percentage: number) => {
        const maxPercentage = Math.max(...factors.map(f => Math.abs(f.percentage)))
        return (Math.abs(percentage) / maxPercentage) * 100
    }

    const formatPrice = (price: number) => {
        return `₹${(price / 100000).toFixed(2)} L`
    }

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Valuation Breakdown</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Impact Analysis</p>
                    </div>
                </div>

                <div className="mb-10 pb-6 border-b border-gray-50">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">BidMetric AI Value</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{formatPrice(totalValuation)}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 mb-1">
                            <ShieldCheck size={14} className="text-green-600" />
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Confidence: High</span>
                        </div>
                    </div>
                </div>

                {/* Factors List */}
                <div className="space-y-8">
                    {factors.map((factor, index) => (
                        <div key={index} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {factor.direction === 'positive' ? <TrendingUp size={14} className="text-gold" /> : <TrendingDown size={14} className="text-gray-400" />}
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-wide text-[11px]">{factor.factor}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${getTextColor(factor.direction)}`}>
                                        {formatImpact(factor.impact)}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-black ml-2 w-12 inline-block">
                                        {factor.percentage >= 0 ? '+' : ''}{factor.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100/50">
                                <div
                                    className={`${getBarColor(factor.direction)} h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80`}
                                    style={{ width: `${getBarWidth(factor.percentage)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Methodology / Note */}
                <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            {methodology}
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex items-center justify-center gap-8 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gold rounded-full shadow-sm shadow-gold/20" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Premium Factor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Reduction Point</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
