const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const path = require('path');

async function pushData() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('Error: DATABASE_URL is missing.');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log('Reading dummy data from backend_phase1...');
        const propertiesData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../backend_phase1/data/properties.json'), 'utf8')
        );

        const records = Object.values(propertiesData).map((prop, idx) => ({
            title: prop.name,
            description: `Premium ${prop.builder} property with excellent ROI.`,
            price: prop.avg_psf * 1000,
            bidmetric_price: prop.predicted_price_5y * 1000,
            location: 'Mira Road',
            sqft: 1000,
            type: 'Apartment',
            bedrooms: 2,
            bathrooms: 2,
            status: 'active',
            is_boosted: idx === 0,
        }));

        console.log(`Pushing ${records.length} records to Supabase properties table...`);

        for (const record of records) {
            await client.query(`
        INSERT INTO properties (
          title, description, price, bidmetric_price, location, sqft, type, bedrooms, bathrooms, status, is_boosted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, Object.values(record));
        }

        console.log('Successfully pushed dummy data to Supabase.');
    } catch (err) {
        console.error('Failed to push data:', err);
    } finally {
        await client.end();
    }
}

pushData();
