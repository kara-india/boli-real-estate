/**
 * BidMetric Static Valuation Engine
 * 
 * Calculates fair market value for properties based on:
 * - Market Price (avg sqft rate × property sqft)
 * - Owner Listed Price (seller's asking price)
 * - AI Valuation (weighted model incorporating HPI, infrastructure, builder quality)
 * 
 * This valuation is STATIC and does NOT change with bid activity.
 */

import { getLocalityFactors, calculateEffectiveGrowthRate } from './prediction-engine'

// ============================================================
// TYPES
// ============================================================

export type ValuationCategory = 'undervalued' | 'fairly_valued' | 'overvalued'
export type BuilderConfidenceLevel = 'high' | 'medium' | 'low'
export type PriceComparison = 'ai_higher' | 'owner_higher' | 'market_higher'

export type ValuationFactor = {
    factor: string
    impact: number        // Impact in ₹
    percentage: number    // Impact as % of total valuation
    direction: 'positive' | 'negative'
}

export type BuilderProfile = {
    id: string
    name: string
    reraRegistered: boolean
    reraNumber?: string
    onTimeDeliveryRate: number      // 0-100
    totalProjects: number
    completedProjects: number
    avgCustomerRating: number        // 1-5
    resaleVelocityIndex: number      // 0-100
    legalIssuesCount: number
    confidenceScore: number          // 0-100 (calculated)
    confidenceLevel: BuilderConfidenceLevel
}

export type ConfidenceMetrics = {
    confidenceLevel: number          // 0-100%
    marginOfError: number            // ±%
    dataCompleteness: number         // %
    confidenceRange: {
        lower: number
        upper: number
    }
}

export type PropertyValuation = {
    propertyId: string

    // Three core prices
    marketPrice: number              // Avg sqft rate × property sqft
    ownerListedPrice: number         // Seller's asking price
    aiValuation: number              // AI-calculated fair value

    // Price comparisons
    aiVsMarket: {
        category: ValuationCategory
        deviationPercent: number
        badge: 'golden' | 'silver' | 'neutral'
    }

    aiVsOwner: {
        comparison: 'ai_higher' | 'owner_higher' | 'equal'
        deviationPercent: number
    }

    // Bidding constraints
    biddingRange: {
        min: number                    // Minimum of the three prices
        max: number                    // Maximum of the three prices
    }

    // Builder confidence
    builderConfidence: {
        score: number
        level: BuilderConfidenceLevel
        priceImpact: number            // Multiplier applied
        builderName: string
    }

    // Explainability
    topFactors: ValuationFactor[]
    confidenceMetrics: ConfidenceMetrics

    // Metadata
    methodology: string
    lastUpdated: Date
    modelVersion: string
}

export type BuilderComparable = {
    builderName: string
    avgPricePerSqft: number
    sampleSize: number
    locality: string
}

// ============================================================
// BUILDER CONFIDENCE CALCULATION
// ============================================================

/**
 * Calculate builder confidence score (0-100)
 */
export function calculateBuilderConfidence(builder: Partial<BuilderProfile>): {
    score: number
    level: BuilderConfidenceLevel
    priceMultiplier: number
} {
    // Default values for missing data
    const onTimeDelivery = builder.onTimeDeliveryRate ?? 70
    const reraCompliance = builder.reraRegistered ? 100 : 0
    const avgRating = builder.avgCustomerRating ?? 3.5
    const resaleVelocity = builder.resaleVelocityIndex ?? 50
    const legalCompliance = Math.max(0, 100 - (builder.legalIssuesCount ?? 0) * 10)

    // Weighted formula
    const score = Math.round(
        (onTimeDelivery * 0.35) +
        (reraCompliance * 0.25) +
        ((avgRating / 5) * 100 * 0.20) +
        (resaleVelocity * 0.15) +
        (legalCompliance * 0.05)
    )

    // Classify level
    let level: BuilderConfidenceLevel
    let priceMultiplier: number

    if (score >= 80) {
        level = 'high'
        priceMultiplier = 1.08  // +8% premium
    } else if (score >= 60) {
        level = 'medium'
        priceMultiplier = 1.0   // neutral
    } else {
        level = 'low'
        priceMultiplier = 0.95  // -5% discount
    }

    return { score, level, priceMultiplier }
}

// ============================================================
// AI VALUATION CALCULATION
// ============================================================

/**
 * Calculate AI Valuation using weighted model
 */
export function calculateAIValuation(params: {
    propertyId: string
    sqft: number
    location: string
    localityAvgPricePerSqft: number
    builderProfile?: Partial<BuilderProfile>
    propertyType?: string
}): {
    aiValuation: number
    factors: ValuationFactor[]
    builderConfidence: ReturnType<typeof calculateBuilderConfidence>
} {
    const { sqft, location, localityAvgPricePerSqft, builderProfile } = params

    // Get locality factors (HPI, infrastructure, etc.)
    const localityFactors = getLocalityFactors(location)
    const effectiveGrowthRate = calculateEffectiveGrowthRate(localityFactors)

    // Base price from market
    const basePrice = sqft * localityAvgPricePerSqft

    // Calculate builder confidence
    const builderConfidence = calculateBuilderConfidence(builderProfile ?? {})

    // Market multiplier from locality factors
    const infraBoost = (localityFactors.infrastructureScore - 60) * 0.001  // 0.1% per point above 60
    const projectBoost = localityFactors.upcomingProjectsBoost / 100
    const marketMultiplier = (1 + infraBoost) * (1 + projectBoost)

    // Apply all multipliers
    const aiValuation = Math.round(
        basePrice * marketMultiplier * builderConfidence.priceMultiplier
    )

    // Calculate factor impacts
    const infraImpact = basePrice * infraBoost
    const projectImpact = basePrice * projectBoost
    const builderImpact = basePrice * (builderConfidence.priceMultiplier - 1)
    const hpiImpact = basePrice * (localityFactors.hpiGrowthRate / 100)

    const factors: ValuationFactor[] = [
        {
            factor: `Market Trend (${localityFactors.hpiGrowthRate}% HPI CAGR)`,
            impact: hpiImpact,
            percentage: (hpiImpact / aiValuation) * 100,
            direction: 'positive' as const
        },
        {
            factor: `Builder ${builderConfidence.level === 'high' ? 'Premium' : builderConfidence.level === 'low' ? 'Discount' : 'Neutral'} (${builderConfidence.level})`,
            impact: builderImpact,
            percentage: (builderImpact / aiValuation) * 100,
            direction: (builderImpact >= 0 ? 'positive' : 'negative') as 'positive' | 'negative'
        },
        {
            factor: `Infrastructure Score (${localityFactors.infrastructureScore}/100)`,
            impact: infraImpact,
            percentage: (infraImpact / aiValuation) * 100,
            direction: 'positive' as const
        },
        {
            factor: `Upcoming Projects (+${localityFactors.upcomingProjectsBoost}%)`,
            impact: projectImpact,
            percentage: (projectImpact / aiValuation) * 100,
            direction: 'positive' as const
        },
        {
            factor: `Location Base Price (₹${localityAvgPricePerSqft}/sqft)`,
            impact: basePrice,
            percentage: (basePrice / aiValuation) * 100,
            direction: 'positive' as const
        }
    ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5)

    return { aiValuation, factors, builderConfidence }
}

// ============================================================
// VALUATION COMPARISON & CLASSIFICATION
// ============================================================

/**
 * Compare AI Valuation with Market Price
 */
export function compareAIWithMarket(aiValuation: number, marketPrice: number): {
    category: ValuationCategory
    deviationPercent: number
    badge: 'golden' | 'silver' | 'neutral'
} {
    const deviation = ((aiValuation - marketPrice) / marketPrice) * 100

    let category: ValuationCategory
    let badge: 'golden' | 'silver' | 'neutral'

    if (deviation > 8) {
        category = 'overvalued'
        badge = 'golden'  // AI says it's worth MORE than market (premium/royalty)
    } else if (deviation < -8) {
        category = 'undervalued'
        badge = 'silver'  // AI says it's worth LESS than market
    } else {
        category = 'fairly_valued'
        badge = 'neutral'
    }

    return { category, deviationPercent: deviation, badge }
}

/**
 * Compare AI Valuation with Owner Listed Price
 */
export function compareAIWithOwner(aiValuation: number, ownerPrice: number): {
    comparison: 'ai_higher' | 'owner_higher' | 'equal'
    deviationPercent: number
} {
    const deviation = ((ownerPrice - aiValuation) / aiValuation) * 100

    let comparison: 'ai_higher' | 'owner_higher' | 'equal'

    if (Math.abs(deviation) < 2) {
        comparison = 'equal'
    } else if (deviation > 0) {
        comparison = 'owner_higher'  // Owner overvalues
    } else {
        comparison = 'ai_higher'     // Owner undervalues
    }

    return { comparison, deviationPercent: deviation }
}

/**
 * Calculate confidence metrics based on data completeness
 */
export function calculateConfidenceMetrics(
    aiValuation: number,
    dataCompleteness: number
): ConfidenceMetrics {
    // Margin of error inversely proportional to data completeness
    const marginOfError = 15 - (dataCompleteness / 100 * 10)  // 15% at 0%, 5% at 100%

    const confidenceRange = {
        lower: Math.round(aiValuation * (1 - marginOfError / 100)),
        upper: Math.round(aiValuation * (1 + marginOfError / 100))
    }

    return {
        confidenceLevel: dataCompleteness,
        marginOfError: Math.round(marginOfError * 10) / 10,
        dataCompleteness,
        confidenceRange
    }
}

// ============================================================
// MAIN VALUATION FUNCTION
// ============================================================

/**
 * Generate complete property valuation
 */
export function generatePropertyValuation(params: {
    propertyId: string
    sqft: number
    location: string
    localityAvgPricePerSqft: number
    ownerListedPrice: number
    builderProfile?: Partial<BuilderProfile>
    propertyType?: string
    dataCompleteness?: number
}): PropertyValuation {
    const {
        propertyId,
        sqft,
        location,
        localityAvgPricePerSqft,
        ownerListedPrice,
        builderProfile,
        propertyType,
        dataCompleteness = 85
    } = params

    // Calculate market price
    const marketPrice = sqft * localityAvgPricePerSqft

    // Calculate AI valuation
    const { aiValuation, factors, builderConfidence } = calculateAIValuation({
        propertyId,
        sqft,
        location,
        localityAvgPricePerSqft,
        builderProfile,
        propertyType
    })

    // Compare AI with market
    const aiVsMarket = compareAIWithMarket(aiValuation, marketPrice)

    // Compare AI with owner
    const aiVsOwner = compareAIWithOwner(aiValuation, ownerListedPrice)

    // Calculate bidding range
    const prices = [marketPrice, ownerListedPrice, aiValuation]
    const biddingRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
    }

    // Calculate confidence metrics
    const confidenceMetrics = calculateConfidenceMetrics(aiValuation, dataCompleteness)

    // Generate methodology string
    const methodology = `AI Valuation: ₹${(aiValuation / 100000).toFixed(2)}L calculated using market base (₹${localityAvgPricePerSqft}/sqft × ${sqft} sqft), ` +
        `${builderConfidence.level} builder confidence (${builderConfidence.score}/100), ` +
        `and locality factors for ${location}. ` +
        `${aiVsMarket.category === 'overvalued' ? 'Premium property' : aiVsMarket.category === 'undervalued' ? 'Value opportunity' : 'Market-aligned pricing'}.`

    return {
        propertyId,
        marketPrice,
        ownerListedPrice,
        aiValuation,
        aiVsMarket,
        aiVsOwner,
        biddingRange,
        builderConfidence: {
            score: builderConfidence.score,
            level: builderConfidence.level,
            priceImpact: builderConfidence.priceMultiplier,
            builderName: builderProfile?.name ?? 'Unknown Builder'
        },
        topFactors: factors,
        confidenceMetrics,
        methodology,
        lastUpdated: new Date(),
        modelVersion: 'v2.1.0'
    }
}

// ============================================================
// BUILDER COMPARABLES
// ============================================================

/**
 * Get average price for properties by the same builder
 * This will be used in UI to show "Similar properties by this builder go for ₹X lakhs"
 */
export function getBuilderComparables(
    builderName: string,
    locality: string,
    properties: Array<{ builder: string; price: number; sqft: number; location: string }>
): BuilderComparable | null {
    const comparables = properties.filter(
        p => p.builder.toLowerCase() === builderName.toLowerCase() &&
            p.location.toLowerCase().includes(locality.toLowerCase())
    )

    if (comparables.length === 0) return null

    const avgPricePerSqft = comparables.reduce((sum, p) => sum + (p.price / p.sqft), 0) / comparables.length

    return {
        builderName,
        avgPricePerSqft: Math.round(avgPricePerSqft),
        sampleSize: comparables.length,
        locality
    }
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

export function formatPriceINR(price: number): string {
    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`
    }
    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`
    }
    return `₹${price.toLocaleString('en-IN')}`
}

export function formatDeviation(deviation: number): string {
    const sign = deviation >= 0 ? '+' : ''
    return `${sign}${deviation.toFixed(1)}%`
}
