import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { property, macro } = body

        // ML Mock matching the exact api/predict_spec.md outputs
        // Calculate dynamic baseline from incoming property details
        const baseSqftRate = property.locality === 'Mira Road' ? 8500 : (property.locality === 'Andheri' ? 22000 : 12000)
        let baselineValue = property.area_sqft * baseSqftRate

        // Apply dummy ML adjustments based on features
        if (property.property_type === 'Villa') baselineValue *= 1.15
        if (property.sale_type === 'New') baselineValue *= 1.08
        if (property.builder_rating > 80) baselineValue *= 1.05
        if (property.infrastructure_score > 7) baselineValue *= 1.03

        baselineValue = Math.round(baselineValue)

        // 5-Year projection logic
        let currentExpected = baselineValue
        const trajectory = []
        let currentYear = new Date().getFullYear()

        for (let i = 1; i <= (macro?.forecast_horizon_years || 5); i++) {
            // Dummy logic: Mira Road 5.9% average
            const growthRate = property.locality === 'Mira Road' ? 0.059 : 0.045
            currentExpected = Math.round(currentExpected * (1 + growthRate))

            trajectory.push({
                year: currentYear + i,
                expected_value: currentExpected,
                yoy_growth_pct: (growthRate * 100).toFixed(1)
            })
        }

        const data = {
            request_id: `req_${Math.random().toString(36).substring(7)}`,
            status: "success",
            baseline_current_value_inr: baselineValue,
            confidence_interval: {
                lower_bound_p10: Math.round(baselineValue * 0.96),
                upper_bound_p90: Math.round(baselineValue * 1.04)
            },
            forecast_trajectory: trajectory,
            explainability: {
                model_type: "XGBRegressor_Quantile",
                top_5_driving_factors: [
                    { feature: "locality_month_avg", impact_direction: "positive", shap_value: "+12.4%" },
                    { feature: "infrastructure_score", impact_direction: "positive", shap_value: "+4.1%" },
                    { feature: "area_sqft", impact_direction: "positive", shap_value: "+2.2%" },
                    { feature: "builder_rating", impact_direction: "positive", shap_value: "+1.8%" },
                    { feature: "macro_repo_rate", impact_direction: "negative", shap_value: "-1.5%" }
                ]
            },
            warnings: []
        }

        // Simulate inference latency
        await new Promise(resolve => setTimeout(resolve, 800))

        return NextResponse.json(data)

    } catch (error: any) {
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        )
    }
}
