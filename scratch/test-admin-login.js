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
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') value = value.substring(1, value.length - 1);
    if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") value = value.substring(1, value.length - 1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email, password) {
  try {
    console.log(`\n--- Testing login for ${email} ---`);
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, role, password_hash")
      .eq("email", email.toLowerCase().trim())
      .single();

    console.log("Select Error:", error);
    if (!data) {
        console.log("No data returned! Invalid email or table access denied.");
        return;
    }
    console.log("Select Data:", data);

    const { data: verifyData, error: verifyError } = await supabase
      .rpc("verify_admin_password", {
        input_email: email.toLowerCase().trim(),
        input_password: password,
      });

    console.log("Verify Error:", verifyError);
    console.log("Verify Data:", verifyData);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin("admin@glvia.com", "admin123");
