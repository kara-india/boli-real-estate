// A simple Node script to safely test interacting with the Supabase client logic

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Check if Local ENV exists
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase Local ENV (.env.local) variables are missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log(`Connecting to: ${supabaseUrl}`);

    // Testing a very basic select query from the `builders` table
    const { data, error } = await supabase
        .from('builders')
        .select('id, company_name')
        .limit(1);

    if (error) {
        console.error("Connection Failed. Make sure your local or remote instance is running.");
        console.error(error.message);
    } else {
        console.log("Connection Verified!");
        console.log("Sample Data Fetched: ", data);
    }
}

testConnection();
