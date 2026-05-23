-- ═══════════════════════════════════════════════════════════════
-- GLIVAJI CMS — Supabase Salon Owner & Marketplace Schema
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. Modify existing Salons table for Marketplace Logic
-- We add the status column and KYC storage link
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '{}'::jsonb;

-- 2. Admin / Salon Owners Table
-- Linked to Firebase Authentication via firebase_uid
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salon_owner' CHECK (role IN ('salon_owner', 'super_admin')),
  salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
  security_pin_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS security_pin_hash TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Drop old check constraint and add the new one that excludes 'admin'
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('salon_owner', 'super_admin'));

-- Migrate any existing 'admin' role users to 'super_admin'
UPDATE admin_users SET role = 'super_admin' WHERE role = 'admin';

-- Allow password_hash to be NULL since Firebase Auth handles password verification for salon owners
ALTER TABLE admin_users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Staff Management Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Stylist', 
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Dynamic Salon Services Table
CREATE TABLE IF NOT EXISTS salon_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  duration TEXT NOT NULL, 
  category TEXT NOT NULL, 
  gender TEXT NOT NULL DEFAULT 'female' CHECK (gender IN ('male', 'female', 'unisex')),
  description TEXT,
  image TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS (Images and KYC)
-- ═══════════════════════════════════════════════════════════════

-- Create the public salon-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('salon-images', 'salon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the private salon-kyc bucket (Only admins & owners should access this)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('salon-kyc', 'salon-kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Give public access to read salon images
DROP POLICY IF EXISTS "Public Read Salon Images" ON storage.objects;
CREATE POLICY "Public Read Salon Images" ON storage.objects FOR SELECT USING (bucket_id = 'salon-images');

-- Give public access to upload images (for registration flow via anon key)
DROP POLICY IF EXISTS "Anon Upload Salon Images" ON storage.objects;
CREATE POLICY "Anon Upload Salon Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'salon-images');

DROP POLICY IF EXISTS "Anon Upload Salon KYC" ON storage.objects;
CREATE POLICY "Anon Upload Salon KYC" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'salon-kyc');


-- ═══════════════════════════════════════════════════════════════
-- AUTOMATION: Auto Create Salon & Admin RPC
-- ═══════════════════════════════════════════════════════════════
-- This function wraps the creation of the salon and the admin_user 
-- into a single transaction so we don't end up with orphaned users.

CREATE OR REPLACE FUNCTION auto_create_salon_account(
  p_firebase_uid TEXT,
  p_owner_name TEXT,
  p_email TEXT,
  p_salon_name TEXT,
  p_phone TEXT,
  p_city TEXT,
  p_address_street TEXT,
  p_salon_images TEXT[],
  p_kyc_documents JSONB
) RETURNS UUID AS $$
DECLARE
  v_salon_id UUID;
BEGIN
  -- 1. Create the Salon (Default status = 'pending')
  INSERT INTO salons (
    name, contact_phone, contact_email, address_city, address_street, images, kyc_documents, status
  ) VALUES (
    p_salon_name, p_phone, p_email, p_city, p_address_street, p_salon_images, p_kyc_documents, 'pending'
  ) RETURNING id INTO v_salon_id;

  -- 2. Create the Admin User mapping to the Salon
  INSERT INTO admin_users (
    firebase_uid, email, name, role, salon_id, approval_status
  ) VALUES (
    p_firebase_uid, p_email, p_owner_name, 'salon_owner', v_salon_id, 'pending'
  );

  RETURN v_salon_id;
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
-- SECURITY & ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to admin_users" ON admin_users;
CREATE POLICY "Public access to admin_users" ON admin_users FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access to staff" ON staff;
CREATE POLICY "Public access to staff" ON staff FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access to salon_services" ON salon_services;
CREATE POLICY "Public access to salon_services" ON salon_services FOR ALL USING (true);
