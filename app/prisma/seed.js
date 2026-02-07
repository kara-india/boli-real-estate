const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Read CSV files
    const propertiesPath = path.join(__dirname, '../../data/mira_road_properties_20260127_235341.csv')
    const historicalPath = path.join(__dirname, '../../data/mira_road_historical_20260127_235341.csv')

    const propertiesCSV = fs.readFileSync(propertiesPath, 'utf-8')
    const historicalCSV = fs.readFileSync(historicalPath, 'utf-8')

    const properties = parse(propertiesCSV, { columns: true, skip_empty_lines: true })
    const historical = parse(historicalCSV, { columns: true, skip_empty_lines: true })

    // Seed historical prices
    console.log(`📊 Seeding ${historical.length} historical price records...`)
    for (const record of historical) {
        await prisma.historicalPrice.create({
            data: {
                areaName: record.area_name,
                zone: record.zone,
                ratePerSqft: parseInt(record.rate_per_sqft),
                date: new Date(record.date),
                dataSource: record.data_source || 'synthetic'
            }
        })
    }

    // Create a demo user
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('demo123', 12)

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@miraroad.com' },
        update: {},
        create: {
            email: 'demo@miraroad.com',
            name: 'Demo User',
            password: hashedPassword
        }
    })

    console.log(`👤 Created demo user: demo@miraroad.com / demo123`)

    // Seed listings from properties
    console.log(`🏠 Seeding ${properties.length} property listings...`)
    const configurations = ['1BHK', '2BHK', '3BHK', '4BHK']

    for (let i = 0; i < Math.min(properties.length, 30); i++) {
        const prop = properties[i]
        const area = 500 + Math.floor(Math.random() * 1500) // 500-2000 sqft
        const ratePerSqft = parseInt(prop.rate_per_sqft)
        const totalPrice = area * ratePerSqft
        const config = configurations[Math.floor(Math.random() * configurations.length)]

        await prisma.listing.create({
            data: {
                title: `${config} Flat in ${prop.area_name}`,
                description: `Beautiful ${config} apartment in ${prop.area_name}, ${prop.zone}. Well-maintained society with modern amenities.`,
                areaName: prop.area_name,
                zone: prop.zone,
                propertyType: prop.property_type || 'Residential',
                area: area,
                configuration: config,
                ratePerSqft: ratePerSqft,
                totalPrice: totalPrice,
                minBidAmount: Math.floor(totalPrice * 0.95),
                maxBidAmount: Math.floor(totalPrice * 1.05),
                status: 'active',
                userId: demoUser.id
            }
        })
    }

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
