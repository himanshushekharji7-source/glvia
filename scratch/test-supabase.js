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

    // 2. Try to fetch admin_users to see if owner exists
    console.log('\n--- Fetching admin_users ---');
    const { data: users, error: usersError } = await supabase
      .from('admin_users')
      .select('email');

    if (usersError) {
      console.error('Error fetching admin_users:', usersError);
    } else {
      console.log('Users found:', users);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
