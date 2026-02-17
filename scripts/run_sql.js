
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function runSql(query) {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing in .env.local. Please add the Postgres Connection String (Supabase -> Settings -> Database -> Connection String).");
        return;
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(query);
        console.log("✅ Query executed successfully.");
        if (res.rows.length > 0) {
            console.table(res.rows);
        }
    } catch (err) {
        console.error("❌ Error executing query:", err);
    } finally {
        await client.end();
    }
}

const fs = require('fs');
const path = require('path');

// Get query from command line args
const arg = process.argv[2];
const value = process.argv[3];

if (arg === '-f' && value) {
    const filePath = path.resolve(value);
    try {
        const query = fs.readFileSync(filePath, 'utf8');
        runSql(query);
    } catch (err) {
        console.error(`❌ Error reading file: ${err.message}`);
    }
} else if (arg) {
    runSql(arg);
} else {
    console.log("Usage: node scripts/run_sql.js \"SELECT * FROM ...\" OR node scripts/run_sql.js -f path/to/file.sql");
}
