/**
 * BidMetric Price Prediction Engine
 * 
 * This module calculates 5-year property price predictions based on:
 * 1. Historical Price Index (HPI) - Compound Annual Growth Rate from past data
 * 2. Infrastructure Boost - Metro lines, highways, airports
 * 3. Government Projects - Smart City, PMAY, Industrial Corridors
 * 4. Micromarket Factors - School ratings, green space, crime rates
 * 
 * This is a foundational implementation that can be refined with real data.
 */

// ============================================================
// TYPES
// ============================================================

export type LocalityFactors = {
    // Historical HPI (House Price Index) - Annual growth rate in %
    hpiGrowthRate: number;

    // Infrastructure Score (0-100)
    // Metro proximity, highway access, airport distance
    infrastructureScore: number;

    // Upcoming Projects Boost (0-20%)
    // Government projects like Metro extensions, Smart City, etc.
    upcomingProjectsBoost: number;

    // Supply-Demand Factor (0.8 to 1.2)
    // < 1 = oversupply (slower growth), > 1 = undersupply (faster growth)
    supplyDemandFactor: number;

    // Market Maturity Factor (0.5 to 1.0)
    // Mature markets grow slower, emerging markets grow faster
    maturityFactor: number;
}

export type PricePrediction = {
    year: number;
    predictedPrice: number;
    lowEstimate: number;
    highEstimate: number;
    confidence: number; // 0-100%
    isPrediction: boolean;
}

export type PredictionResult = {
    predictions: PricePrediction[];
    factors: LocalityFactors;
    methodology: string;
    lastUpdated: string;
}

// ============================================================
// LOCALITY DATA (Realistic for MMR - Mumbai Metropolitan Region)
// This data should eventually come from a database or API
// ============================================================

export const LOCALITY_FACTORS: Record<string, LocalityFactors> = {
    'Mira Road': {
        hpiGrowthRate: 8.5, // % per year - Strong growth corridor
        infrastructureScore: 72, // Metro Line 9 under construction
        upcomingProjectsBoost: 4.5, // Metro extension + MTHL spillover
        supplyDemandFactor: 1.05, // Slight undersupply
        maturityFactor: 0.85, // Semi-mature market
    },
    'Thane West': {
        hpiGrowthRate: 7.2, // % per year - Premium established
        infrastructureScore: 85, // Excellent connectivity
        upcomingProjectsBoost: 3.0, // Metro Line 4, Thane-Borivali tunnel
        supplyDemandFactor: 0.95, // Balanced
        maturityFactor: 0.75, // More mature
    },
    'Borivali West': {
        hpiGrowthRate: 5.8, // % per year - Mature premium market
        infrastructureScore: 90, // Excellent existing infra
        upcomingProjectsBoost: 2.0, // Thane-Borivali tunnel
        supplyDemandFactor: 0.92, // Slight oversupply in premium
        maturityFactor: 0.65, // Very mature
    },
    'Bhayandar East': {
        hpiGrowthRate: 10.2, // % per year - High growth potential
        infrastructureScore: 58, // Improving with metro
        upcomingProjectsBoost: 6.0, // Metro Line 9, industrial corridor
        supplyDemandFactor: 1.12, // Undersupply in affordable
        maturityFactor: 0.92, // Emerging market
    },
    'Kandivali East': {
        hpiGrowthRate: 6.5, // % per year - Mid-premium stable
        infrastructureScore: 78, // Good connectivity
        upcomingProjectsBoost: 2.5, // Goregaon-Mulund Link Road
        supplyDemandFactor: 0.98, // Balanced
        maturityFactor: 0.72, // Semi-mature
    },
    // Default for unknown localities
    'default': {
        hpiGrowthRate: 6.0,
        infrastructureScore: 60,
        upcomingProjectsBoost: 2.0,
        supplyDemandFactor: 1.0,
        maturityFactor: 0.8,
    }
};

// ============================================================
// PREDICTION ENGINE
// ============================================================

/**
 * Get locality factors for a given location
 */
export function getLocalityFactors(location: string): LocalityFactors {
    // Try exact match first
    if (LOCALITY_FACTORS[location]) {
        return LOCALITY_FACTORS[location];
    }

    // Try partial match
    for (const key of Object.keys(LOCALITY_FACTORS)) {
        if (location.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(location.toLowerCase())) {
            return LOCALITY_FACTORS[key];
        }
    }

    // Return default
    return LOCALITY_FACTORS['default'];
}

/**
 * Calculate the effective annual growth rate based on all factors
 */
export function calculateEffectiveGrowthRate(factors: LocalityFactors): number {
    // Base HPI growth
    let effectiveRate = factors.hpiGrowthRate;

    // Infrastructure boost (higher score = slightly higher growth)
    const infraBoost = (factors.infrastructureScore - 60) * 0.02; // +/- 0.8% max
    effectiveRate += infraBoost;

    // Upcoming projects boost
    effectiveRate += factors.upcomingProjectsBoost * 0.3; // 30% of project boost

    // Supply-demand adjustment
    effectiveRate *= factors.supplyDemandFactor;

    // Maturity adjustment (more mature = slower growth)
    effectiveRate *= (1 + (1 - factors.maturityFactor) * 0.3);

    // Cap at reasonable limits
    return Math.max(2, Math.min(15, effectiveRate));
}

/**
 * Generate 5-year price predictions for a property
 * 
 * @param currentPricePerSqft - Current market price per sqft
 * @param location - Locality name
 * @param historicalData - Optional historical trend data
 */
export function generatePricePredictions(
    currentPricePerSqft: number,
    location: string,
    historicalData?: { date: string; avg_price_per_sqft: number }[]
): PredictionResult {
    const factors = getLocalityFactors(location);
    const effectiveGrowthRate = calculateEffectiveGrowthRate(factors);

    // Calculate predictions for 5 years
    const predictions: PricePrediction[] = [];
    const currentYear = new Date().getFullYear();

    // Add current year as baseline
    predictions.push({
        year: currentYear,
        predictedPrice: Math.round(currentPricePerSqft),
        lowEstimate: Math.round(currentPricePerSqft * 0.95),
        highEstimate: Math.round(currentPricePerSqft * 1.05),
        confidence: 100,
        isPrediction: false,
    });

    // Generate next 5 years
    for (let i = 1; i <= 5; i++) {
        const yearMultiplier = Math.pow(1 + effectiveGrowthRate / 100, i);
        const predictedPrice = currentPricePerSqft * yearMultiplier;

        // Confidence decreases further into the future
        const confidence = Math.max(50, 100 - (i * 8));

        // Uncertainty range widens over time
        const uncertaintyFactor = 1 + (i * 0.03); // 3% wider range per year

        predictions.push({
            year: currentYear + i,
            predictedPrice: Math.round(predictedPrice),
            lowEstimate: Math.round(predictedPrice / uncertaintyFactor),
            highEstimate: Math.round(predictedPrice * uncertaintyFactor),
            confidence,
            isPrediction: true,
        });
    }

    return {
        predictions,
        factors,
        methodology: `Prediction based on ${effectiveGrowthRate.toFixed(1)}% effective annual growth rate, ` +
            `derived from historical HPI (${factors.hpiGrowthRate}%), infrastructure score (${factors.infrastructureScore}/100), ` +
            `and upcoming project boost (+${factors.upcomingProjectsBoost}%). ` +
            `Market maturity factor: ${(factors.maturityFactor * 100).toFixed(0)}%.`,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Format price for display in Indian Rupee format
 */
export function formatPriceINR(price: number): string {
    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(0)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Calculate appreciation metrics from historical data
 */
export function calculateAppreciation(
    historicalData: { date: string; avg_price_per_sqft: number }[]
): { totalAppreciation: number; cagr: number; yearsOfData: number } {
    if (!historicalData || historicalData.length < 2) {
        return { totalAppreciation: 0, cagr: 0, yearsOfData: 0 };
    }

    const sorted = [...historicalData].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstPrice = sorted[0].avg_price_per_sqft;
    const lastPrice = sorted[sorted.length - 1].avg_price_per_sqft;
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);

    const yearsOfData = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const totalAppreciation = ((lastPrice - firstPrice) / firstPrice) * 100;
    const cagr = yearsOfData > 0
        ? (Math.pow(lastPrice / firstPrice, 1 / yearsOfData) - 1) * 100
        : 0;

    return {
        totalAppreciation: Math.round(totalAppreciation * 10) / 10,
        cagr: Math.round(cagr * 10) / 10,
        yearsOfData: Math.round(yearsOfData * 10) / 10,
    };
}

/**
 * Get human-readable factors explanation
 */
export function getFactorsExplanation(location: string): string[] {
    const factors = getLocalityFactors(location);
    const explanations: string[] = [];

    if (factors.hpiGrowthRate >= 8) {
        explanations.push('📈 High historical growth corridor');
    } else if (factors.hpiGrowthRate >= 6) {
        explanations.push('📊 Stable growth market');
    } else {
        explanations.push('🏛️ Mature market with steady returns');
    }

    if (factors.infrastructureScore >= 80) {
        explanations.push('🚇 Excellent connectivity (Metro, Highway)');
    } else if (factors.infrastructureScore >= 60) {
        explanations.push('🛤️ Good infrastructure, improving');
    }

    if (factors.upcomingProjectsBoost >= 4) {
        explanations.push('🏗️ Major upcoming projects boost expected');
    } else if (factors.upcomingProjectsBoost >= 2) {
        explanations.push('📋 Infrastructure projects in pipeline');
    }

    if (factors.supplyDemandFactor > 1.05) {
        explanations.push('🔥 High demand, limited supply');
    } else if (factors.supplyDemandFactor < 0.95) {
        explanations.push('🏘️ Adequate supply, buyer-friendly');
    }

    return explanations;
}
