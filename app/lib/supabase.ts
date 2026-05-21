import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. CMS features will use fallback data.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
} as const;
