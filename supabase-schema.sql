-- ═══════════════════════════════════════════════════════════════
-- GLIVAJI CMS — Supabase Database Schema
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. Admin Users (password-protected admin login)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin (password: admin123 — change after first login!)
-- Using pgcrypto for hashing
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('admin@glvia.com', crypt('admin123', gen_salt('bf')), 'Super Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Site Settings (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('app_name', 'glvia'),
  ('referral_amount', '100'),
  ('billu_cash_points', '1000'),
  ('billu_cash_value', '10')
ON CONFLICT (key) DO NOTHING;

-- 3. Categories (global service categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'spa',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Home Page — Popular Services
CREATE TABLE IF NOT EXISTS home_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Home Page — Combo Banners
CREATE TABLE IF NOT EXISTS home_combo_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  prefix TEXT NOT NULL DEFAULT 'Starting at',
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Home Page — Salon Deals
CREATE TABLE IF NOT EXISTS home_salon_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Home Page — Categories (icon-based)
CREATE TABLE IF NOT EXISTS home_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'spa',
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. At Home — Categories (with images)
CREATE TABLE IF NOT EXISTS at_home_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. At Home — Packages
CREATE TABLE IF NOT EXISTS at_home_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. At Home — Services
CREATE TABLE IF NOT EXISTS at_home_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT,
  prefix TEXT,
  options TEXT,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  category_id UUID REFERENCES at_home_categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Salons
CREATE TABLE IF NOT EXISTS salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  total_reviews INT DEFAULT 0,
  distance TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  price_range TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Salon Service Categories (per salon, per gender)
CREATE TABLE IF NOT EXISTS salon_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0
);

-- 13. Salon Services (per salon, per gender)
CREATE TABLE IF NOT EXISTS salon_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  products_used TEXT,
  duration TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  category TEXT,
  image TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Membership Plans
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount TEXT,
  features TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Trust Banners
CREATE TABLE IF NOT EXISTS trust_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'verified',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Enable pgcrypto extension (for password hashing)
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to verify admin password (called via supabase.rpc)
CREATE OR REPLACE FUNCTION verify_admin_password(input_email TEXT, input_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash FROM admin_users WHERE email = input_email;
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — Allow anon read, restrict write
-- ═══════════════════════════════════════════════════════════════

-- Disable RLS on all tables for now (since we're using anon key + app-level auth)
-- In production, you'd set up proper RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_combo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_salon_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_home_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_home_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_home_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_banners ENABLE ROW LEVEL SECURITY;

-- Allow anon to read all public content tables
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON home_services FOR SELECT USING (true);
CREATE POLICY "Public read" ON home_combo_banners FOR SELECT USING (true);
CREATE POLICY "Public read" ON home_salon_deals FOR SELECT USING (true);
CREATE POLICY "Public read" ON home_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON at_home_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON at_home_packages FOR SELECT USING (true);
CREATE POLICY "Public read" ON at_home_services FOR SELECT USING (true);
CREATE POLICY "Public read" ON salons FOR SELECT USING (true);
CREATE POLICY "Public read" ON salon_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON salon_services FOR SELECT USING (true);
CREATE POLICY "Public read" ON membership_plans FOR SELECT USING (true);
CREATE POLICY "Public read" ON trust_banners FOR SELECT USING (true);
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);

-- Allow anon full access (since admin auth is handled at app level)
CREATE POLICY "Admin full access" ON admin_users FOR ALL USING (true);
CREATE POLICY "Admin full access" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON home_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON home_combo_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON home_salon_deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON home_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON at_home_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON at_home_packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON at_home_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON salons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON salon_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON salon_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON membership_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON trust_banners FOR ALL USING (true) WITH CHECK (true);
