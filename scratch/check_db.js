const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.slice(0, index).trim();
        let val = trimmed.slice(index + 1).trim();
        // Remove surrounding quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (err) {
  console.error("Error reading .env file:", err);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking salon_services table structure...");
  
  // Let's select one record to see its keys
  const { data, error } = await supabase.from('salon_services').select('*').limit(1);
  if (error) {
    console.error("Error reading salon_services:", error);
    process.exit(1);
  }
  
  console.log("Sample record keys:", data && data.length > 0 ? Object.keys(data[0]) : "No records found");
  
  if (data && data.length > 0 && 'products_used' in data[0]) {
    console.log("products_used is already present!");
  } else {
    console.log("products_used is not present.");
  }
}

run();
