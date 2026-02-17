'use client'

import React, { useState } from 'react'
import { Sliders, Info } from 'lucide-react'

type BidSliderProps = {
    bidmetricPrice: number
    lowerBound: number
    upperBound: number
    lowerPercent: number
    upperPercent: number
    onBidChange: (amount: number) => void
    initialBid?: number
}

export default function BidSlider({
    bidmetricPrice,
    lowerBound,
    upperBound,
    lowerPercent,
    upperPercent,
    onBidChange,
    initialBid
}: BidSliderProps) {
    const [useSlider, setUseSlider] = useState(true)
    const [sliderValue, setSliderValue] = useState(initialBid || bidmetricPrice)
    const [showTooltip, setShowTooltip] = useState(false)

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value)
        setSliderValue(value)
        onBidChange(value)
    }

    const formatPrice = (price: number) => `₹${(price / 100000).toFixed(2)} L`

    // Calculate percentage from bidmetric
    const currentPercent = ((sliderValue - bidmetricPrice) / bidmetricPrice * 100).toFixed(2)

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                        type="checkbox"
                        checked={useSlider}
                        onChange={(e) => setUseSlider(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    Use Bid Adjustment Slider
                </label>
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="relative text-gray-400 hover:text-gray-600"
                >
                    <Info className="w-4 h-4" />
                    {showTooltip && (
                        <div className="absolute right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                            Slider limited to ±5% of BidMetric or by listing/comparables, whichever is stricter.
                            This ensures fair market practices.
                        </div>
                    )}
                </button>
            </div>

            {useSlider && (
                <div className="space-y-4">
                    {/* Slider */}
                    <div className="relative pt-2">
                        <input
                            type="range"
                            min={lowerBound}
                            max={upperBound}
                            step={10000}
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold"
                            style={{
                                background: `linear-gradient(to right, 
                  #DC2626 0%, 
                  #F59E0B 25%, 
                  #D4AF37 50%, 
                  #059669 75%, 
                  #059669 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>{formatPrice(lowerBound)}</span>
                            <span className="font-semibold text-[#D4AF37]">BidMetric: {formatPrice(bidmetricPrice)}</span>
                            <span>{formatPrice(upperBound)}</span>
                        </div>
                    </div>

                    {/* Current Value Display */}
                    <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#CFA84B]/10 rounded-lg p-4 border border-[#D4AF37]/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Your Bid Amount</span>
                            <span className={`text-xs font-semibold ${Number(currentPercent) > 0 ? 'text-green-600' :
                                    Number(currentPercent) < 0 ? 'text-red-600' :
                                        'text-gray-600'
                                }`}>
                                {Number(currentPercent) > 0 && '+'}{currentPercent}% from BidMetric
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(sliderValue)}
                        </div>
                    </div>

                    {/* Bounds Info */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                            <Sliders className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-900">
                                <p className="font-semibold mb-1">Bidding Range</p>
                                <p>
                                    You can bid between {formatPrice(lowerBound)} ({lowerPercent}%) and{' '}
                                    {formatPrice(upperBound)} ({upperPercent > 0 && '+'}{upperPercent}%)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Add custom CSS for the slider
declare global {
    interface Window {
        sliderStylesAdded?: boolean
    }
}

if (typeof window !== 'undefined' && !window.sliderStylesAdded) {
    const style = document.createElement('style')
    style.textContent = `
    .slider-gold::-webkit-slider-thumb {
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #CFA84B);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
      border: 3px solid white;
    }

    .slider-gold::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #CFA84B);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
      border: 3px solid white;
    }

    .slider-gold::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.6);
    }

    .slider-gold::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.6);
    }
  `
    document.head.appendChild(style)
    window.sliderStylesAdded = true
}
