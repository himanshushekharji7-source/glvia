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
const oldUrl = 'https://images.unsplash.com/photo-1516975080661-46bca191fb4e?auto=format&fit=crop&w=500&q=80';
const newUrl = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80';

async function updateDb() {
  try {
    console.log('Searching for old URL in Supabase...');

    // 1. Check salons (images column is TEXT[])
    const { data: salons, error: salonsErr } = await supabase.from('salons').select('id, name, images');
    if (salonsErr) {
      console.error('Error fetching salons:', salonsErr);
    } else {
      for (const salon of salons) {
        if (Array.isArray(salon.images) && salon.images.some(img => img.includes('516975080661'))) {
          console.log(`Found invalid image in salon: ${salon.name}`);
          const newImages = salon.images.map(img => img.includes('516975080661') ? newUrl : img);
          const { error: updErr } = await supabase
            .from('salons')
            .update({ images: newImages })
            .eq('id', salon.id);
          if (updErr) console.error(`Failed to update salon ${salon.name}:`, updErr);
          else console.log(`Updated salon ${salon.name} images!`);
        }
      }
    }

    // 2. Check salon_services
    const { data: ssvcs, error: ssvcsErr } = await supabase.from('salon_services').select('id, name, image');
    if (ssvcsErr) {
      console.error('Error fetching salon_services:', ssvcsErr);
    } else {
      for (const svc of ssvcs) {
        if (svc.image && svc.image.includes('516975080661')) {
          console.log(`Found invalid image in salon_service: ${svc.name}`);
          const { error: updErr } = await supabase
            .from('salon_services')
            .update({ image: newUrl })
            .eq('id', svc.id);
          if (updErr) console.error(`Failed to update salon_service ${svc.name}:`, updErr);
          else console.log(`Updated salon_service ${svc.name} image!`);
        }
      }
    }

    // 3. Check at_home_services
    const { data: ahsvcs, error: ahsvcsErr } = await supabase.from('at_home_services').select('id, name, image');
    if (ahsvcsErr) {
      console.error('Error fetching at_home_services:', ahsvcsErr);
    } else {
      for (const svc of ahsvcs) {
        if (svc.image && svc.image.includes('516975080661')) {
          console.log(`Found invalid image in at_home_service: ${svc.name}`);
          const { error: updErr } = await supabase
            .from('at_home_services')
            .update({ image: newUrl })
            .eq('id', svc.id);
          if (updErr) console.error(`Failed to update at_home_service ${svc.name}:`, updErr);
          else console.log(`Updated at_home_service ${svc.name} image!`);
        }
      }
    }

    // 4. Check at_home_packages
    const { data: ahpkgs, error: ahpkgsErr } = await supabase.from('at_home_packages').select('id, title, image');
    if (ahpkgsErr) {
      console.error('Error fetching at_home_packages:', ahpkgsErr);
    } else {
      for (const pkg of ahpkgs) {
        if (pkg.image && pkg.image.includes('516975080661')) {
          console.log(`Found invalid image in at_home_package: ${pkg.title}`);
          const { error: updErr } = await supabase
            .from('at_home_packages')
            .update({ image: newUrl })
            .eq('id', pkg.id);
          if (updErr) console.error(`Failed to update at_home_package ${pkg.title}:`, updErr);
          else console.log(`Updated at_home_package ${pkg.title} image!`);
        }
      }
    }

    console.log('Database check complete!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

updateDb();
