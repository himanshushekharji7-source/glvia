-- ═══════════════════════════════════════════════════════════════
-- GLIVAJI CMS — Supabase Users Schema
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════

-- Create the users table (linked to Firebase via firebase_uid)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone_number TEXT,
  birthday TEXT,
  avatar TEXT, -- URL or Base64 string
  wallet_balance NUMERIC DEFAULT 0,
  loyalty_points NUMERIC DEFAULT 0,
  active_membership_id TEXT,
  membership_start_date TIMESTAMPTZ,
  membership_expiry_date TIMESTAMPTZ,
  membership_status TEXT CHECK (membership_status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Future-proofing: Addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "Home", "Office"
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Future-proofing: Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Allow public read/write since app manages authentication via Firebase currently
-- In a strict production environment, we would use Supabase Custom JWTs with Firebase
DROP POLICY IF EXISTS "Public users access" ON users;
CREATE POLICY "Public users access" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public user_addresses access" ON user_addresses;
CREATE POLICY "Public user_addresses access" ON user_addresses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public referrals access" ON referrals;
CREATE POLICY "Public referrals access" ON referrals FOR ALL USING (true) WITH CHECK (true);
