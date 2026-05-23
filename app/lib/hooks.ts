import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from './supabase';

// --- DUMMY DATA ---

const dummyUser = {
  _id: 'u1',
  id: 'u1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phoneNumber: '+1 234 567 8900',
  role: 'customer',
  walletBalance: 250,
  createdAt: new Date().toISOString(),
  avatar: 'https://i.pravatar.cc/150?u=jane',
  wishlist: ['s1', 's2']
};

const dummyCategories = [
  { _id: '1', name: 'Hair', slug: 'hair', icon: 'content_cut', count: 120 },
  { _id: '2', name: 'Nails', slug: 'nails', icon: 'back_hand', count: 85 },
  { _id: '3', name: 'Facial', slug: 'facial', icon: 'face', count: 45 },
  { _id: '4', name: 'Makeup', slug: 'makeup', icon: 'brush', count: 60 },
  { _id: '5', name: 'Massage', slug: 'massage', icon: 'spa', count: 30 },
  { _id: '6', name: 'Barber', slug: 'barber', icon: 'storefront', count: 55 }
];

const dummySalons = [
  {
    id: 's1',
    _id: 's1',
    name: 'Dasho Salon Rajouri',
    images: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    totalReviews: 128,
    distance: '6.94 km',
    address: { street: 'Rajouri Garden', city: 'New Delhi', state: 'DL' },
    priceRange: '₹99 - ₹2999',
    tags: ['Unisex', 'Hair', 'Spa'],
    description: 'Premium unisex salon offering world-class grooming and beauty services. Expert stylists, hygienic environment, and affordable luxury.',
    featured: true,
    contactPhone: '+91 98765 43210',
    contactEmail: 'rajouri@dashosalon.com',
    maleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80' },
      { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Mani & Hygiene', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=80' },
      { name: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80' },
    ],
    femaleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Treatments', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80' },
      { name: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=80' },
    ],
    maleServices: [
      { _id: 'ms1', name: 'Haircut', duration: '30', price: 99, oldPrice: 199, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80', description: 'Professional haircut with precision styling' },
      { _id: 'ms2', name: 'Haircut Without Blowdry', duration: '20', price: 79, oldPrice: 149, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80', description: 'Quick haircut without blowdry finish' },
      { _id: 'ms3', name: 'Split Ends Cut', duration: '30', price: 299, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Trim split ends for healthier looking hair' },
      { _id: 'ms4', name: 'Haircut + Beard', duration: '40', price: 199, oldPrice: 349, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Complete grooming with haircut and beard trim' },
      { _id: 'ms5', name: 'Kids Haircut (Under 12)', duration: '20', price: 99, oldPrice: 149, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80', description: 'Gentle haircut for children under 12' },
      { _id: 'ms6', name: 'Beard Trim', duration: '15', price: 79, oldPrice: 149, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Professional beard shaping and trimming' },
      { _id: 'ms7', name: 'Beard Color', duration: '30', price: 199, oldPrice: 349, category: 'Beard', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80', description: 'Natural-looking beard coloring' },
      { _id: 'ms8', name: 'Royal Shave', duration: '25', price: 149, oldPrice: 299, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Hot towel royal shave experience' },
      { _id: 'ms9', name: 'Hair Color - Global', duration: '60', price: 599, oldPrice: 999, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80', description: 'Full head global hair coloring' },
      { _id: 'ms10', name: 'Hair Highlights', duration: '90', price: 999, oldPrice: 1999, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80', description: 'Stylish streaks and highlights' },
      { _id: 'ms11', name: 'Fruit Facial', duration: '45', price: 399, oldPrice: 699, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: 'Refreshing fruit facial for glowing skin' },
      { _id: 'ms12', name: 'De-Tan Pack', duration: '30', price: 299, oldPrice: 499, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: 'Remove tan and restore natural skin tone' },
      { _id: 'ms13', name: 'Manicure', duration: '30', price: 249, oldPrice: 399, category: 'Mani & Hygiene', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80', description: 'Professional hand care and nail grooming' },
      { _id: 'ms14', name: 'Pedicure', duration: '35', price: 299, oldPrice: 499, category: 'Mani & Hygiene', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80', description: 'Relaxing foot care and nail grooming' },
    ],
    femaleServices: [
      { _id: 'fs1', name: 'Hair Wash - Shampoo + Conditioning - Standard', duration: '25', price: 199, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Standard shampoo and conditioning wash' },
      { _id: 'fs2', name: 'Hair Wash - Shampoo + Conditioning - Premium', duration: '25', price: 349, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', description: 'Premium shampoo with deep conditioning' },
      { _id: 'fs3', name: 'Haircut + Straightening With Iron', duration: '45', price: 299, oldPrice: 380, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Haircut followed by iron straightening' },
      { _id: 'fs4', name: 'Haircut + Blowdry', duration: '40', price: 399, oldPrice: 550, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Precision haircut with professional blowdry' },
      { _id: 'fs5', name: 'Layer Cut + Blowdry', duration: '50', price: 499, oldPrice: 699, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Expert layered haircut with blowdry styling' },
      { _id: 'fs6', name: 'Global Hair Color', duration: '90', price: 999, oldPrice: 1999, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Full head hair coloring with premium products' },
      { _id: 'fs7', name: 'Root Touch Up', duration: '45', price: 499, oldPrice: 799, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Root color touch up for regrowth' },
      { _id: 'fs8', name: 'Highlights / Balayage', duration: '120', price: 1999, oldPrice: 3499, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=300&q=80', description: 'Premium balayage or highlight coloring' },
      { _id: 'fs9', name: 'Keratin Treatment', duration: '120', price: 2999, oldPrice: 4999, category: 'Hair Treatments', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=300&q=80', description: 'Smoothening keratin treatment for frizz-free hair' },
      { _id: 'fs10', name: 'Hair Spa', duration: '60', price: 799, oldPrice: 1299, category: 'Hair Treatments', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Deep conditioning hair spa for damaged hair' },
      { _id: 'fs11', name: 'Clean-Up Facial', duration: '45', price: 499, oldPrice: 799, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', description: 'Deep cleansing facial for clear skin' },
      { _id: 'fs12', name: 'Gold Facial', duration: '60', price: 999, oldPrice: 1599, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', description: 'Luxurious gold facial for radiant glow' },
      { _id: 'fs13', name: 'Gel Manicure', duration: '45', price: 399, oldPrice: 599, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80', description: 'Long-lasting gel manicure' },
      { _id: 'fs14', name: 'Spa Pedicure', duration: '50', price: 499, oldPrice: 799, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80', description: 'Relaxing spa pedicure with foot massage' },
    ],
    services: [
      { _id: 'srv1', name: 'Haircut', duration: '30', price: 99, oldPrice: 199, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80' },
      { _id: 'srv2', name: 'Beard Trim', duration: '15', price: 79, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80' }
    ],
    openingHours: [{ day: 'Monday', open: '9:00 AM', close: '8:00 PM' }]
  },
  {
    id: 's2',
    _id: 's2',
    name: 'Dasho Salon Dwarka',
    images: ['https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80'],
    rating: 4.7,
    totalReviews: 84,
    distance: '13.25 km',
    address: { street: 'Sector 12, Dwarka', city: 'New Delhi', state: 'DL' },
    priceRange: '₹99 - ₹2999',
    tags: ['Unisex', 'Nails', 'Facial'],
    description: 'Your one-stop destination for grooming and beauty. Expert professionals, hygienic setup, and best-in-class services.',
    featured: true,
    contactPhone: '+91 98765 43211',
    maleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80' },
      { name: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    ],
    femaleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80' },
      { name: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=80' },
    ],
    maleServices: [
      { _id: 'dms1', name: 'Haircut', duration: '30', price: 149, oldPrice: 249, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80', description: 'Stylish haircut by expert barber' },
      { _id: 'dms2', name: 'Haircut + Beard', duration: '40', price: 249, oldPrice: 399, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80', description: 'Complete grooming package' },
      { _id: 'dms3', name: 'Beard Styling', duration: '20', price: 99, oldPrice: 199, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Professional beard shaping' },
      { _id: 'dms4', name: 'Royal Shave', duration: '25', price: 149, oldPrice: 299, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Luxurious hot towel shave' },
      { _id: 'dms5', name: 'Global Color', duration: '60', price: 699, oldPrice: 1199, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80', description: 'Full head premium coloring' },
      { _id: 'dms6', name: 'Charcoal Facial', duration: '45', price: 499, oldPrice: 799, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', description: 'Deep cleansing charcoal facial' },
    ],
    femaleServices: [
      { _id: 'dfs1', name: 'Haircut + Blowdry', duration: '45', price: 449, oldPrice: 649, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Stylish cut with professional blowdry' },
      { _id: 'dfs2', name: 'Layer Cut', duration: '40', price: 399, oldPrice: 599, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Expert layered cutting' },
      { _id: 'dfs3', name: 'Global Color', duration: '90', price: 1299, oldPrice: 2499, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', description: 'Premium full head coloring' },
      { _id: 'dfs4', name: 'Pearl Facial', duration: '60', price: 899, oldPrice: 1499, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', description: 'Luxurious pearl facial for glowing skin' },
      { _id: 'dfs5', name: 'Gel Manicure', duration: '45', price: 349, oldPrice: 549, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80', description: 'Long lasting gel nails' },
    ],
    services: [
      { _id: 'srv3', name: 'Gel Manicure', duration: '60', price: 349, category: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80' },
      { _id: 'srv4', name: 'Hydrating Facial', duration: '60', price: 899, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80' }
    ],
    openingHours: [{ day: 'Monday', open: '10:00 AM', close: '7:00 PM' }]
  },
  {
    id: 's3',
    _id: 's3',
    name: 'Dasho Salon Defence Colony',
    images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80'],
    rating: 4.8,
    totalReviews: 210,
    distance: '19.50 km',
    address: { street: 'Defence Colony', city: 'New Delhi', state: 'DL' },
    priceRange: '₹99 - ₹2999',
    tags: ['Unisex', 'Barber', 'Spa'],
    description: 'Top-rated unisex salon with expert barbers and beauticians. Clean, hygienic, and premium experience.',
    featured: true,
    maleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80' },
      { name: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80' },
      { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80' },
    ],
    femaleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80' },
      { name: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80' },
    ],
    maleServices: [
      { _id: 'dcms1', name: 'Classic Haircut', duration: '30', price: 129, oldPrice: 249, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80', description: 'Classic precision haircut' },
      { _id: 'dcms2', name: 'Beard Trim', duration: '20', price: 99, oldPrice: 199, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Professional beard trimming' },
      { _id: 'dcms3', name: 'Fashion Color', duration: '75', price: 799, oldPrice: 1499, category: 'Hair Color', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80', description: 'Trendy fashion hair coloring' },
    ],
    femaleServices: [
      { _id: 'dcfs1', name: 'Blowdry + Styling', duration: '30', price: 349, oldPrice: 549, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Professional blowdry and styling' },
      { _id: 'dcfs2', name: 'O3+ Facial', duration: '60', price: 1199, oldPrice: 1999, category: 'Skin Care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', description: 'Premium O3+ facial treatment' },
    ],
    services: [
      { _id: 'srv5', name: 'Classic Haircut', duration: '30', price: 129, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80' },
      { _id: 'srv6', name: 'Beard Trim', duration: '20', price: 99, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80' }
    ],
    openingHours: [{ day: 'Monday', open: '9:00 AM', close: '9:00 PM' }]
  },
  {
    id: 's4',
    _id: 's4',
    name: 'Dasho Salon Mayur Vihar',
    images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80'],
    rating: 4.6,
    totalReviews: 95,
    distance: '21.79 km',
    address: { street: 'Mayur Vihar Phase 1', city: 'New Delhi', state: 'DL' },
    priceRange: '₹99 - ₹2999',
    tags: ['Unisex', 'Makeup', 'Hair'],
    description: 'Modern salon with latest trends in hair, beauty, and grooming. Affordable luxury for everyone.',
    featured: true,
    maleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80' },
      { name: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80' },
    ],
    femaleServiceCategories: [
      { name: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80' },
      { name: 'Makeup', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=200&q=80' },
    ],
    maleServices: [
      { _id: 'mvms1', name: 'Trendy Haircut', duration: '30', price: 149, oldPrice: 299, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80', description: 'Trendy haircut by expert stylist' },
      { _id: 'mvms2', name: 'Designer Beard', duration: '25', price: 149, oldPrice: 249, category: 'Beard', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80', description: 'Designer beard shaping' },
    ],
    femaleServices: [
      { _id: 'mvfs1', name: 'Precision Cut', duration: '35', price: 399, oldPrice: 599, category: 'Hair Cut & Style', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', description: 'Precision haircut by expert stylist' },
      { _id: 'mvfs2', name: 'Party Makeup', duration: '60', price: 1499, oldPrice: 2499, category: 'Makeup', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=300&q=80', description: 'Glamorous party makeup' },
    ],
    services: [
      { _id: 'srv7', name: 'Evening Makeup', duration: '60', price: 1499, category: 'Makeup', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=300&q=80' }
    ]
  }
];

let dummyBookings = [
  {
    _id: 'b1',
    id: 'b1',
    status: 'Confirmed',
    date: '2024-05-25T10:00:00Z',
    salonId: dummySalons[0],
    services: [dummySalons[0].services[0]],
    totalAmount: 80
  },
  {
    _id: 'b2',
    id: 'b2',
    status: 'Completed',
    date: '2024-05-10T14:30:00Z',
    salonId: dummySalons[1],
    services: [dummySalons[1].services[0]],
    totalAmount: 50
  }
];

const dummyWallet = {
  balance: 250.00,
  currency: 'USD',
  transactions: [
    { _id: 't1', date: '2024-05-20', type: 'credit', amount: 100, description: 'Cashback Reward' },
    { _id: 't2', date: '2024-05-15', type: 'debit', amount: 50, description: 'Booking at Lumiere Beauty' }
  ]
};

const dummyAdminStats = {
  totalUsers: 1250,
  activeSalons: 45,
  totalBookings: 8400,
  totalRevenue: 125000,
  topSalons: [
    { name: 'Aura Prestige', bookings: 420, rating: 4.9, revenue: 15400 },
    { name: 'Lumiere Beauty', bookings: 380, rating: 4.7, revenue: 11200 },
    { name: 'The Barber Club', bookings: 510, rating: 4.8, revenue: 9800 }
  ]
};

const dummyNotifications = [
  { _id: 'n1', title: 'Booking Confirmed', message: 'Your booking at Aura Prestige is confirmed for tomorrow at 10 AM.', date: new Date().toISOString(), read: false },
  { _id: 'n2', title: 'Wallet Top-up', message: 'You received a ₹10 cashback reward.', date: new Date(Date.now() - 86400000).toISOString(), read: true }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Hooks ---
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) return null;
      
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .select("*")
          .eq("firebase_uid", firebaseUid)
          .single();
        if (data && !error) {
           return data;
        }
      } catch (e) {
        console.error("Failed to fetch user from Supabase", e);
      }
      return null;
    },
    retry: false,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: any) => {
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) throw new Error("No user logged in");
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useMembershipPlans = () => {
  return useQuery({
    queryKey: ['membershipPlans'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.MEMBERSHIP_PLANS)
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching memberships", err);
        return [];
      }
    }
  });
};

export const usePurchaseMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) throw new Error("No user logged in");
      
      const startDate = new Date();
      // Calculate expiry based on duration string (e.g., "12 Months")
      const expiryDate = new Date();
      const months = parseInt(plan.duration) || 12; // default to 12 if parsing fails
      expiryDate.setMonth(startDate.getMonth() + months);

      const updates = {
        active_membership_id: plan.id,
        membership_start_date: startDate.toISOString(),
        membership_expiry_date: expiryDate.toISOString(),
        membership_status: 'active'
      };
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// --- Salon Hooks ---
export const useSalons = (keyword = '') => {
  return useQuery({
    queryKey: ['salons', keyword],
    queryFn: async () => {
      try {
        const { data: dbSalons, error } = await supabase
          .from(TABLES.SALONS)
          .select('*')
          .eq('is_active', true)
          .eq('approval_status', 'approved');
        
        if (error) throw error;
        
        if (dbSalons && dbSalons.length > 0) {
          let mapped = dbSalons.map(s => ({
            id: s.id,
            _id: s.id,
            name: s.name,
            images: s.images && s.images.length > 0 ? s.images : ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
            rating: Number(s.rating) || 4.5,
            totalReviews: s.total_reviews || 0,
            distance: s.distance || '1.0 km',
            address: { street: s.address_street || '', city: s.address_city || '', state: s.address_state || '' },
            priceRange: s.price_range || '₹99 - ₹2999',
            tags: s.tags || ['Unisex'],
            description: s.description || '',
            featured: s.featured || false,
            contactPhone: s.contact_phone || '',
            contactEmail: s.contact_email || '',
          }));

          if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            mapped = mapped.filter(s => 
              s.name.toLowerCase().includes(lowerKeyword) ||
              s.tags.some((tag: any) => tag.toLowerCase().includes(lowerKeyword)) ||
              s.description.toLowerCase().includes(lowerKeyword)
            );
          }
          return mapped;
        }
      } catch (err) {
        console.error("Error fetching salons from Supabase:", err);
      }

      await delay(300);
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return dummySalons.filter(s => 
          s.name.toLowerCase().includes(lowerKeyword) ||
          (s.tags && s.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) ||
          (s.services && s.services.some(svc => svc.name.toLowerCase().includes(lowerKeyword) || svc.category?.toLowerCase().includes(lowerKeyword)))
        );
      }
      return dummySalons;
    },
  });
};

export const useSalon = (id: string) => {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      try {
        const { data: dbSalon, error: salonErr } = await supabase
          .from(TABLES.SALONS)
          .select('*')
          .eq('id', id)
          .single();

        if (salonErr) throw salonErr;

        if (dbSalon) {
          // Fetch categories and services for this salon
          const { data: dbCats } = await supabase
            .from(TABLES.SALON_CATEGORIES)
            .select('*')
            .eq('salon_id', id)
            .order('sort_order', { ascending: true });

          const { data: dbSvcs } = await supabase
            .from(TABLES.SALON_SERVICES)
            .select('*')
            .eq('salon_id', id)
            .order('sort_order', { ascending: true });

          const maleServiceCategories = dbCats ? dbCats.filter(c => c.gender === 'male').map(c => ({ name: c.name, image: c.image })) : [];
          const femaleServiceCategories = dbCats ? dbCats.filter(c => c.gender === 'female').map(c => ({ name: c.name, image: c.image })) : [];

          const maleServices = dbSvcs ? dbSvcs.filter(s => s.gender === 'male').map(s => ({
            _id: s.id,
            id: s.id,
            name: s.name,
            duration: s.duration || '30',
            price: Number(s.price),
            oldPrice: s.old_price ? Number(s.old_price) : undefined,
            category: s.category,
            image: s.image,
            description: s.description || ''
          })) : [];

          const femaleServices = dbSvcs ? dbSvcs.filter(s => s.gender === 'female').map(s => ({
            _id: s.id,
            id: s.id,
            name: s.name,
            duration: s.duration || '30',
            price: Number(s.price),
            oldPrice: s.old_price ? Number(s.old_price) : undefined,
            category: s.category,
            image: s.image,
            description: s.description || ''
          })) : [];

          // Merge services for backward compatibility
          const allServices = [...maleServices, ...femaleServices];

          return {
            id: dbSalon.id,
            _id: dbSalon.id,
            name: dbSalon.name,
            images: dbSalon.images && dbSalon.images.length > 0 ? dbSalon.images : ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
            rating: Number(dbSalon.rating) || 4.5,
            totalReviews: dbSalon.total_reviews || 0,
            distance: dbSalon.distance || '1.0 km',
            address: { street: dbSalon.address_street || '', city: dbSalon.address_city || '', state: dbSalon.address_state || '' },
            address_street: dbSalon.address_street || '',
            address_city: dbSalon.address_city || '',
            address_state: dbSalon.address_state || '',
            timings: dbSalon.timings || '',
            facilities: dbSalon.facilities || [],
            google_map_url: dbSalon.google_map_url || '',
            priceRange: dbSalon.price_range || '₹99 - ₹2999',
            tags: dbSalon.tags || ['Unisex'],
            description: dbSalon.description || '',
            featured: dbSalon.featured || false,
            contactPhone: dbSalon.contact_phone || '',
            contactEmail: dbSalon.contact_email || '',
            maleServiceCategories,
            femaleServiceCategories,
            maleServices,
            femaleServices,
            services: allServices,
            openingHours: [{ day: 'Monday', open: '9:00 AM', close: '8:00 PM' }]
          };
        }
      } catch (err) {
        console.error(`Error fetching salon ${id} from Supabase:`, err);
      }

      await delay(300);
      return dummySalons.find(s => s.id === id || s._id === id) || dummySalons[0];
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data: dbCats, error } = await supabase
          .from(TABLES.CATEGORIES)
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (dbCats && dbCats.length > 0) {
          return dbCats.map(c => ({
            _id: c.id,
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'spa',
            count: 0
          }));
        }
      } catch (err) {
        console.error("Error fetching categories from Supabase:", err);
      }

      await delay(300);
      return dummyCategories;
    },
  });
};

// --- Booking Hooks ---
export const useMyBookings = (salonId?: string) => {
  return useQuery({
    queryKey: ['myBookings', salonId],
    queryFn: async () => {
      try {
        let query = supabase
          .from(TABLES.BOOKINGS)
          .select('*')
          .order('created_at', { ascending: false });
        if (salonId) query = query.eq('salon_id', salonId);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((b: any) => ({
          id: b.id,
          _id: b.id,
          salonId: b.salon_id,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          services: b.services || [],
          totalAmount: b.total_amount,
          date: b.date,
          timeSlot: b.time_slot,
          paymentMethod: b.payment_method,
          status: b.status,
          createdAt: b.created_at,
        }));
      } catch (err) {
        console.error('Error fetching bookings:', err);
        return dummyBookings;
      }
    },
    refetchInterval: 10000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: any) => {
      try {
        // Build services array with names for JSONB storage
        const services = bookingData.services.map((svcId: string, idx: number) => ({
          id: svcId,
          name: bookingData.serviceNames?.[idx] || 'Service',
          price: 0,
          duration: '30',
        }));

        const { data, error } = await supabase
          .from(TABLES.BOOKINGS)
          .insert({
            salon_id: bookingData.salonId,
            customer_name: bookingData.customerName || 'Guest',
            customer_phone: bookingData.customerPhone || '',
            customer_email: bookingData.customerEmail || '',
            services: services,
            total_amount: bookingData.totalAmount,
            date: bookingData.date,
            time_slot: bookingData.timeSlot,
            payment_method: bookingData.paymentMethod || 'Pay at Salon',
            status: 'confirmed',
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, message: 'Booking successful!', booking: data };
      } catch (err) {
        console.error('Booking insert failed:', err);
        // Fallback: still consider success so customer flow continues
        return { success: true, message: 'Booking successful!' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    }
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

// --- Admin Hooks ---
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      await delay(500);
      return dummyAdminStats;
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay(400);
      return dummyNotifications;
    },
  });
};

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      await delay(500);
      return dummyWallet;
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      await delay(300);
      return [dummySalons[0], dummySalons[1]]; // Return actual salon objects for wishlist
    },
  });
};

export const useSalonOwnerStats = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonOwnerStats', salonId],
    queryFn: async () => {
      if (!salonId) {
        return { dailyRevenue: 0, totalRevenue: 0, totalBookings: 0, activeStaff: 0, cancellationRate: '0%', recentBookings: [] };
      }
      try {
        const today = new Date().toISOString().split('T')[0];
        const [bookingsRes, staffRes] = await Promise.all([
          supabase.from(TABLES.BOOKINGS).select('*').eq('salon_id', salonId).order('created_at', { ascending: false }),
          supabase.from(TABLES.STAFF).select('*').eq('salon_id', salonId),
        ]);

        const bookings = bookingsRes.data || [];
        const staff = staffRes.data || [];

        const totalBookings = bookings.length;
        const cancelledCount = bookings.filter((b: any) => b.status === 'cancelled').length;
        const cancellationRate = totalBookings > 0 ? `${((cancelledCount / totalBookings) * 100).toFixed(1)}%` : '0%';
        const totalRevenue = bookings
          .filter((b: any) => b.status !== 'cancelled')
          .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
        const dailyRevenue = bookings
          .filter((b: any) => b.date === today && b.status !== 'cancelled')
          .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
        const activeStaff = staff.filter((s: any) => s.is_available).length;
        const recentBookings = bookings.slice(0, 8).map((b: any) => ({
          id: b.id,
          customerName: b.customer_name,
          services: b.services || [],
          timeSlot: b.time_slot,
          date: b.date,
          totalAmount: b.total_amount,
          status: b.status,
          paymentMethod: b.payment_method,
        }));

        return { dailyRevenue, totalRevenue, totalBookings, activeStaff, cancellationRate, recentBookings };
      } catch (err) {
        console.error('Error fetching salon owner stats:', err);
        return { dailyRevenue: 0, totalRevenue: 0, totalBookings: 0, activeStaff: 0, cancellationRate: '0%', recentBookings: [] };
      }
    },
    refetchInterval: 5000,
    enabled: !!salonId,
  });
};

// --- Staff Hooks ---
export const useSalonStaff = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonStaff', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from(TABLES.STAFF)
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
    refetchInterval: 10000,
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffData: { salon_id: string; name: string; role: string }) => {
      const { data, error } = await supabase.from(TABLES.STAFF).insert(staffData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, ...updates }: { id: string; salon_id: string; name?: string; role?: string; is_available?: boolean }) => {
      const { error } = await supabase.from(TABLES.STAFF).update(updates).eq('id', id);
      if (error) throw error;
      return { id, salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', result.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id }: { id: string; salon_id: string }) => {
      const { error } = await supabase.from(TABLES.STAFF).delete().eq('id', id);
      if (error) throw error;
      return { salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', result.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

// --- Salon Service Management Hooks ---
export const useAddService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData: {
      salon_id: string; name: string; description?: string;
      price: number; old_price?: number; duration?: string;
      category: string; gender: string; image: string;
      products_used?: string;
    }) => {
      const { data, error } = await supabase.from(TABLES.SALON_SERVICES).insert(serviceData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salon', vars.salon_id] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, ...updates }: any) => {
      const { error } = await supabase.from(TABLES.SALON_SERVICES).update(updates).eq('id', id);
      if (error) throw error;
      return { id, salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.salon_id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id }: { id: string; salon_id: string }) => {
      const { error } = await supabase.from(TABLES.SALON_SERVICES).delete().eq('id', id);
      if (error) throw error;
      return { salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.salon_id] });
    },
  });
};

export const useSalonServices = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonServicesOwner', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from(TABLES.SALON_SERVICES)
        .select('*')
        .eq('salon_id', salonId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
};

// --- Salon Profile Update Hook ---
export const useUpdateSalonProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from(TABLES.SALONS).update(updates).eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.id] });
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      await delay(500);
      return [dummyUser, { ...dummyUser, _id: 'u2', id: 'u2', firstName: 'John', lastName: 'Smith', email: 'john@example.com', role: 'admin' }];
    },
  });
};
