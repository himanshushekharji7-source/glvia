import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually
const envPath = '.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to:', url);
const supabase = createClient(url, anonKey);

async function listSalons() {
  try {
    const { data, error } = await supabase.from('salons').select('id, name');
    if (error) {
      console.error('Error fetching salons:', error);
    } else {
      console.log('Salons in Database:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

listSalons();
