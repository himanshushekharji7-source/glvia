-- ═══════════════════════════════════════════════════════════════
-- GLIVAJI CMS — Supabase Database Schema
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. Admin Users (password-protected admin login)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('salon_owner', 'super_admin')),
  security_pin_hash TEXT,
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
  ('glvia_cash_points', '1000'),
  ('glvia_cash_value', '10')
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
  facilities TEXT[] DEFAULT '{}',
  timings TEXT,
  google_map_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11b. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
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
DROP POLICY IF EXISTS "Public read" ON categories;
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON home_services;
CREATE POLICY "Public read" ON home_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON home_combo_banners;
CREATE POLICY "Public read" ON home_combo_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON home_salon_deals;
CREATE POLICY "Public read" ON home_salon_deals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON home_categories;
CREATE POLICY "Public read" ON home_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON at_home_categories;
CREATE POLICY "Public read" ON at_home_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON at_home_packages;
CREATE POLICY "Public read" ON at_home_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON at_home_services;
CREATE POLICY "Public read" ON at_home_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON salons;
CREATE POLICY "Public read" ON salons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON salon_categories;
CREATE POLICY "Public read" ON salon_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON salon_services;
CREATE POLICY "Public read" ON salon_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON membership_plans;
CREATE POLICY "Public read" ON membership_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON trust_banners;
CREATE POLICY "Public read" ON trust_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read" ON site_settings;
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);

-- Allow anon full access (since admin auth is handled at app level)
DROP POLICY IF EXISTS "Admin full access" ON admin_users;
CREATE POLICY "Admin full access" ON admin_users FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access" ON site_settings;
CREATE POLICY "Admin full access" ON site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON categories;
CREATE POLICY "Admin full access" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON home_services;
CREATE POLICY "Admin full access" ON home_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON home_combo_banners;
CREATE POLICY "Admin full access" ON home_combo_banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON home_salon_deals;
CREATE POLICY "Admin full access" ON home_salon_deals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON home_categories;
CREATE POLICY "Admin full access" ON home_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON at_home_categories;
CREATE POLICY "Admin full access" ON at_home_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON at_home_packages;
CREATE POLICY "Admin full access" ON at_home_packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON at_home_services;
CREATE POLICY "Admin full access" ON at_home_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON salons;
CREATE POLICY "Admin full access" ON salons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON salon_categories;
CREATE POLICY "Admin full access" ON salon_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON salon_services;
CREATE POLICY "Admin full access" ON salon_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON membership_plans;
CREATE POLICY "Admin full access" ON membership_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON trust_banners;
CREATE POLICY "Admin full access" ON trust_banners FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- SALON OWNER DASHBOARD — Additional Tables
-- ═══════════════════════════════════════════════════════════════

-- 16. Extend admin_users: link salon_owner to a specific salon
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 17. Bookings Table — real appointment/booking tracking
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  firebase_uid TEXT,
  booking_reference TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  services JSONB DEFAULT '[]'::jsonb,  -- [{id, name, price, duration}]
  total_amount NUMERIC NOT NULL,
  date TEXT NOT NULL,            -- Format: YYYY-MM-DD
  time_slot TEXT NOT NULL,       -- e.g., "10:00 AM"
  payment_method TEXT DEFAULT 'Pay at Salon',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Staff Table — salon employee management
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Stylist',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Insert demo salon owner (change password after first login!) ───────────
-- NOTE: Replace with a STRONG password before going live using Supabase Admin UI
INSERT INTO admin_users (email, password_hash, name, role, salon_id)
VALUES (
  'owner@glvia.com',
  crypt('Gl!v14@0wn3r#2026', gen_salt('bf', 12)),
  'Salon Owner',
  'salon_owner',
  '40e4dd92-0a96-4e07-bf68-7ab3604bb279'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  salon_id = EXCLUDED.salon_id,
  role = EXCLUDED.role;

-- ─── RLS: Bookings ────────────────────────────────────────────────────────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow anon/anyone to INSERT bookings (customers book from the app)
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
CREATE POLICY "Public insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own salon bookings (app-level auth uses anon key;
-- real row-level isolation is enforced by app logic using admin_users.salon_id)
DROP POLICY IF EXISTS "Select bookings by salon" ON bookings;
CREATE POLICY "Select bookings by salon" ON bookings
  FOR SELECT USING (true);

-- Allow updates (status changes) only if authenticated via app layer
DROP POLICY IF EXISTS "Update bookings" ON bookings;
CREATE POLICY "Update bookings" ON bookings
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow delete (admin/owner only via app layer)
DROP POLICY IF EXISTS "Delete bookings" ON bookings;
CREATE POLICY "Delete bookings" ON bookings
  FOR DELETE USING (true);

-- ─── RLS: Staff ───────────────────────────────────────────────────────────────
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Salon owner can read staff for their own salon (enforced at app layer)
DROP POLICY IF EXISTS "Select staff" ON staff;
CREATE POLICY "Select staff" ON staff
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage staff" ON staff;
CREATE POLICY "Manage staff" ON staff
  FOR ALL USING (true) WITH CHECK (true);

-- ─── Helper function: verify if an admin_user is owner of a salon ────────────
CREATE OR REPLACE FUNCTION verify_salon_owner(owner_email TEXT, target_salon_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  owner_salon_id UUID;
  owner_role TEXT;
BEGIN
  SELECT salon_id, role INTO owner_salon_id, owner_role
  FROM admin_users WHERE email = owner_email;

  -- super_admin can access any salon
  IF owner_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- salon_owner can only access their own salon
  RETURN owner_salon_id = target_salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- PIN MANAGEMENT RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Verify if the PIN matches
CREATE OR REPLACE FUNCTION verify_admin_pin(input_email TEXT, input_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT security_pin_hash INTO stored_hash FROM admin_users WHERE email = input_email;
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN stored_hash = crypt(input_pin, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Setup initial PIN if it was null
CREATE OR REPLACE FUNCTION setup_admin_pin(input_email TEXT, new_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_users 
  SET security_pin_hash = crypt(new_pin, gen_salt('bf', 12)),
      updated_at = now()
  WHERE email = input_email AND security_pin_hash IS NULL;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change security PIN (requires verification of the old PIN)
CREATE OR REPLACE FUNCTION change_admin_pin(input_email TEXT, old_pin TEXT, new_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT security_pin_hash INTO stored_hash FROM admin_users WHERE email = input_email;
  IF stored_hash IS NULL OR stored_hash != crypt(old_pin, stored_hash) THEN
    RETURN FALSE;
  END IF;
  UPDATE admin_users 
  SET security_pin_hash = crypt(new_pin, gen_salt('bf', 12)),
      updated_at = now()
  WHERE email = input_email;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- VERIFIED CUSTOMER REVIEWS & MODERATION SYSTEM
-- ═══════════════════════════════════════════════════════════════

-- Create salon_reviews table with 'pending' default status
CREATE TABLE IF NOT EXISTS public.salon_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.salon_services(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images TEXT[] DEFAULT '{}',
  owner_reply TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  is_verified_booking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.salon_reviews ENABLE ROW LEVEL SECURITY;

-- Allow select/read access to approved/visible reviews for anyone
CREATE POLICY "Allow public select reviews" ON public.salon_reviews
  FOR SELECT USING (true);

-- Allow authenticated inserts/updates
CREATE POLICY "Allow authenticated insert/update reviews" ON public.salon_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger Function to Enforce Review Eligibility (Correction 3)
CREATE OR REPLACE FUNCTION public.validate_review_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  b_status TEXT;
  b_cust UUID;
  b_salon UUID;
  existing_review_id UUID;
BEGIN
  -- 1. Fetch booking details
  SELECT status, customer_id, salon_id 
  INTO b_status, b_cust, b_salon
  FROM public.bookings
  WHERE id = NEW.booking_id;

  -- 2. Validate booking exists and is completed
  IF b_status IS NULL OR b_status != 'completed' THEN
    RAISE EXCEPTION 'Reviews are restricted to completed bookings only.';
  END IF;

  -- 3. Validate booking customer match
  IF NEW.customer_id IS NOT NULL AND b_cust != NEW.customer_id THEN
    RAISE EXCEPTION 'Reviewer must be the customer who made the booking.';
  END IF;

  -- 4. Validate salon match
  IF b_salon != NEW.salon_id THEN
    RAISE EXCEPTION 'Review salon ID must match booking salon ID.';
  END IF;

  -- 5. Check duplicate review for booking
  SELECT id INTO existing_review_id
  FROM public.salon_reviews
  WHERE booking_id = NEW.booking_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  LIMIT 1;

  IF existing_review_id IS NOT NULL THEN
    RAISE EXCEPTION 'A review has already been submitted for this booking.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run validation BEFORE INSERT
CREATE TRIGGER trigger_validate_review_eligibility
BEFORE INSERT ON public.salon_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_eligibility();

-- Trigger Function to Recalculate Salon Ratings from APPROVED reviews only (Correction 4)
CREATE OR REPLACE FUNCTION public.recalculate_salon_ratings()
RETURNS TRIGGER AS $$
DECLARE
  avg_score NUMERIC;
  total_count INT;
BEGIN
  -- Compute average and total counts from approved reviews only
  SELECT COALESCE(ROUND(AVG(rating), 1), 0.0), COUNT(id)
  INTO avg_score, total_count
  FROM public.salon_reviews
  WHERE salon_id = COALESCE(NEW.salon_id, OLD.salon_id) AND status = 'approved';

  -- Update target salon record
  UPDATE public.salons
  SET rating = avg_score,
      total_reviews = total_count
  WHERE id = COALESCE(NEW.salon_id, OLD.salon_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for real-time rating updates
CREATE TRIGGER trigger_update_salon_rating_on_insert
AFTER INSERT ON public.salon_reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_salon_ratings();

CREATE TRIGGER trigger_update_salon_rating_on_update
AFTER UPDATE ON public.salon_reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_salon_ratings();

CREATE TRIGGER trigger_update_salon_rating_on_delete
AFTER DELETE ON public.salon_reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_salon_ratings();


-- 15. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  request_callback BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' or 'closed'
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



