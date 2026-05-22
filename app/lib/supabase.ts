import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key').trim();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. CMS features will use fallback data.');
}

// Log warning if Stripe key is used as Supabase key
if (typeof window !== 'undefined' && (supabaseAnonKey.startsWith('sb_publishable_') || supabaseAnonKey.startsWith('pk_'))) {
  console.error(
    'CRITICAL CONFIG ERROR: Your NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a Stripe publishable key! ' +
    'Please replace it with your actual Supabase Anon Key (a long JWT token) in your .env file.'
  );
}

let supabaseInstance;
try {
  let sanitizedUrl = supabaseUrl;
  if (sanitizedUrl && !sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }
  supabaseInstance = createClient(sanitizedUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key');
} catch (e: any) {
  console.error("Failed to initialize Supabase client client-side:", e);
  // Fallback to placeholder to prevent imports from crashing the application
  supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
}

export const supabase = supabaseInstance;


/* ─── Database Table Names ─── */
export const TABLES = {
  ADMIN_USERS: 'admin_users',
  HOME_SERVICES: 'home_services',
  HOME_COMBO_BANNERS: 'home_combo_banners',
  HOME_SALON_DEALS: 'home_salon_deals',
  HOME_CATEGORIES: 'home_categories',
  AT_HOME_CATEGORIES: 'at_home_categories',
  AT_HOME_PACKAGES: 'at_home_packages',
  AT_HOME_SERVICES: 'at_home_services',
  SALONS: 'salons',
  SALON_SERVICES: 'salon_services',
  SALON_CATEGORIES: 'salon_categories',
  CATEGORIES: 'categories',
  MEMBERSHIP_PLANS: 'membership_plans',
  TRUST_BANNERS: 'trust_banners',
  SITE_SETTINGS: 'site_settings',
  BOOKINGS: 'bookings',
  STAFF: 'staff',
} as const;

