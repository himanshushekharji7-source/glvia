const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log("Seeding minimal testing data...");

  try {
    // 1. Seed Categories
    console.log("Seeding Categories...");
    const { data: categories, error: catErr } = await supabase.from('categories').insert([
      { name: 'Hair', slug: 'hair', icon: 'content_cut', sort_order: 1 },
      { name: 'Nails', slug: 'nails', icon: 'back_hand', sort_order: 2 },
      { name: 'Facial', slug: 'facial', icon: 'face', sort_order: 3 },
    ]).select();
    if (catErr) console.error("Category Seed Error:", catErr.message);

    // 2. Seed Salons
    console.log("Seeding Salons...");
    const { data: salons, error: salonErr } = await supabase.from('salons').insert([
      {
        name: 'Dasho Salon Rajouri',
        description: 'Premium unisex salon offering world-class grooming.',
        images: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
        rating: 4.9,
        total_reviews: 128,
        distance: '6.94 km',
        address_street: 'Rajouri Garden',
        address_city: 'New Delhi',
        address_state: 'DL',
        price_range: '₹99 - ₹2999',
        tags: ['Unisex', 'Hair', 'Spa'],
        contact_phone: '+91 98765 43210',
        status: 'approved',
        featured: true
      },
      {
        name: 'Dasho Salon Dwarka',
        description: 'Your one-stop destination for grooming and beauty.',
        images: ['https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80'],
        rating: 4.7,
        total_reviews: 84,
        distance: '13.25 km',
        address_street: 'Sector 12, Dwarka',
        address_city: 'New Delhi',
        address_state: 'DL',
        price_range: '₹99 - ₹2999',
        tags: ['Unisex', 'Nails', 'Facial'],
        contact_phone: '+91 98765 43211',
        status: 'approved',
        featured: true
      }
    ]).select();
    if (salonErr) console.error("Salon Seed Error:", salonErr.message);

    if (salons && salons.length > 0) {
      // 3. Seed Services for Salon 1
      console.log(`Seeding Services for ${salons[0].name}...`);
      const { error: svcErr1 } = await supabase.from('salon_services').insert([
        {
          salon_id: salons[0].id,
          name: 'Haircut',
          price: 99,
          old_price: 199,
          duration: '30',
          category: 'Hair Cut & Style',
          gender: 'male',
          description: 'Professional haircut with precision styling',
          image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80'
        },
        {
          salon_id: salons[0].id,
          name: 'Global Hair Color',
          price: 999,
          old_price: 1999,
          duration: '90',
          category: 'Hair Color',
          gender: 'female',
          description: 'Full head hair coloring with premium products',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80'
        }
      ]);
      if (svcErr1) console.error("Service Seed Error 1:", svcErr1.message);

      // Seed Services for Salon 2
      console.log(`Seeding Services for ${salons[1].name}...`);
      const { error: svcErr2 } = await supabase.from('salon_services').insert([
        {
          salon_id: salons[1].id,
          name: 'Beard Trim',
          price: 79,
          old_price: 149,
          duration: '15',
          category: 'Beard',
          gender: 'male',
          description: 'Professional beard shaping',
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80'
        },
        {
          salon_id: salons[1].id,
          name: 'Gel Manicure',
          price: 349,
          old_price: 549,
          duration: '45',
          category: 'Nails',
          gender: 'female',
          description: 'Long lasting gel nails',
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80'
        }
      ]);
      if (svcErr2) console.error("Service Seed Error 2:", svcErr2.message);
    }

    console.log("Minimal testing data seeded successfully!");
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

seedData();
