const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // remove surrounding quotes
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n--- Testing connection ---');
    
    // 1. Try to fetch site_settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*');
      
    if (settingsError) {
      console.error('Error fetching site_settings:', settingsError);
    } else {
      console.log('Successfully fetched site_settings:', settings);
    }

    // 2. Try to call verify_admin_password
    console.log('\n--- Testing verify_admin_password RPC ---');
    const { data: authResult, error: authError } = await supabase
      .rpc('verify_admin_password', {
        input_email: 'admin@glvia.com',
        input_password: 'admin123'
      });

    if (authError) {
      console.error('Error calling verify_admin_password RPC:', authError);
    } else {
      console.log('Auth result for admin@glvia.com / admin123:', authResult);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
