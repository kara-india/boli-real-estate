'use client'

import React, { useState } from 'react'
import { BarChart3, Building2, Info } from 'lucide-react'

type TabName = 'valuation' | 'builder'

type ValuationTabsProps = {
    valuationContent: React.ReactNode
    builderContent: React.ReactNode
}

export default function ValuationTabs({ valuationContent, builderContent }: ValuationTabsProps) {
    const [activeTab, setActiveTab] = useState<TabName>('valuation')

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-[#F5F3F0]">
                <button
                    onClick={() => setActiveTab('valuation')}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'valuation'
                            ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <BarChart3 className="w-5 h-5" />
                    <span>Valuation Breakdown</span>
                </button>

                <button
                    onClick={() => setActiveTab('builder')}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'builder'
                            ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <Building2 className="w-5 h-5" />
                    <span>Builder Confidence</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'valuation' && (
                    <div className="animate-fadeIn">
                        {valuationContent}
                    </div>
                )}

                {activeTab === 'builder' && (
                    <div className="animate-fadeIn">
                        {builderContent}
                    </div>
                )}
            </div>

            {/* Provenance Footer */}
            <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
                <div className="flex items-center gap-2 text-xs text-blue-900">
                    <Info className="w-4 h-4" />
                    <p>
                        <strong>Data Provenance:</strong> BidMetric valuations derived from HPI trends, local comparable sales,
                        infrastructure data, and builder metrics. Last updated: {new Date().toLocaleDateString('en-IN')}
                    </p>
                </div>
            </div>
        </div>
    )
}
