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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const oldId = '516975080661';
const oldUrlSub = 'photo-1516975080661-46bca191fb4e';
const newUrl = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80';

const TABLES = [
  'home_services',
  'home_combo_banners',
  'home_salon_deals',
  'home_categories',
  'at_home_categories',
  'at_home_packages',
  'at_home_services',
  'salons',
  'salon_services',
  'salon_categories',
  'categories',
  'membership_plans',
  'trust_banners',
  'site_settings'
];

function replaceValue(val) {
  if (typeof val === 'string') {
    if (val.includes(oldId) || val.includes(oldUrlSub)) {
      return { replaced: true, value: newUrl };
    }
  } else if (Array.isArray(val)) {
    let replacedAny = false;
    const newVal = val.map(item => {
      const res = replaceValue(item);
      if (res.replaced) {
        replacedAny = true;
        return res.value;
      }
      return item;
    });
    if (replacedAny) {
      return { replaced: true, value: newVal };
    }
  } else if (val && typeof val === 'object') {
    let replacedAny = false;
    const newVal = { ...val };
    for (const key in newVal) {
      const res = replaceValue(newVal[key]);
      if (res.replaced) {
        replacedAny = true;
        newVal[key] = res.value;
      }
    }
    if (replacedAny) {
      return { replaced: true, value: newVal };
    }
  }
  return { replaced: false, value: val };
}

async function searchAndReplace() {
  console.log('Starting full database scan for old unsplash image...');
  for (const table of TABLES) {
    console.log(`Checking table: ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error reading table ${table}:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`Table ${table} is empty.`);
      continue;
    }

    let updatedCount = 0;
    for (const row of data) {
      let rowReplaced = false;
      const updatedFields = {};

      for (const key in row) {
        if (key === 'id') continue;
        const res = replaceValue(row[key]);
        if (res.replaced) {
          rowReplaced = true;
          updatedFields[key] = res.value;
        }
      }

      if (rowReplaced) {
        console.log(`Found matching pattern in table ${table}, row ID: ${row.id || 'unknown'}. Fields to update:`, Object.keys(updatedFields));
        const { error: updateErr } = await supabase
          .from(table)
          .update(updatedFields)
          .eq('id', row.id);

        if (updateErr) {
          console.error(`Failed to update table ${table} row ${row.id}:`, updateErr.message);
        } else {
          updatedCount++;
        }
      }
    }
    console.log(`Finished table ${table}. Updated ${updatedCount} rows.`);
  }
  console.log('Full database scan finished.');
}

searchAndReplace();
