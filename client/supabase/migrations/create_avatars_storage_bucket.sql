-- ============================================
-- STORAGE BUCKET FOR PROFILE AVATARS
-- ============================================

-- Create storage bucket for user avatars (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for user-avatars bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "User avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public read access to user avatars
CREATE POLICY "User avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

-- Allow users to upload their own avatar (files should be in folder matching their user ID)
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- ENSURE ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Ensure shipping_addresses has full_name column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE shipping_addresses ADD COLUMN full_name TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Ensure profiles table has all needed columns
DO $$ 
BEGIN
  -- Check and add username column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
  
  -- Check and add bio column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR PROFILE UPDATES
-- ============================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow users to view any profile
CREATE POLICY "Users can view any profile"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES FOR SHIPPING ADDRESSES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own shipping addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can insert own shipping addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can update own shipping addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can delete own shipping addresses" ON shipping_addresses;

-- Allow users to view their own addresses
CREATE POLICY "Users can view own shipping addresses"
  ON shipping_addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own addresses
CREATE POLICY "Users can insert own shipping addresses"
  ON shipping_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own addresses
CREATE POLICY "Users can update own shipping addresses"
  ON shipping_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own addresses
CREATE POLICY "Users can delete own shipping addresses"
  ON shipping_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR PAYMENT METHODS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;

-- Allow users to view their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own payment methods
CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own payment methods
CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own payment methods
CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default);
