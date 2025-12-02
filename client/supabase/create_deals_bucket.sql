-- ============================================
-- CREATE DEALS STORAGE BUCKET AND POLICIES
-- ============================================
-- Run this in Supabase SQL Editor to create the deals bucket
-- and set up Row Level Security policies
-- ============================================

-- Step 1: Create the deals bucket
-- Note: You can also create this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: deals
-- Public: Yes
-- File size limit: 3MB
-- Allowed MIME types: image/png, image/jpeg, image/webp, image/avif

-- If creating via SQL, use this (requires service role):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deals',
  'deals',
  true,
  3145728, -- 3MB in bytes
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Step 2: Create RLS Policies for deals bucket
-- ============================================

-- Allow public read access to deal images
CREATE POLICY "Deal images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'deals');

-- Allow authenticated users to upload deal images
CREATE POLICY "Authenticated users can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update deal images
CREATE POLICY "Authenticated users can update deal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete deal images
CREATE POLICY "Authenticated users can delete deal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Step 3: Verify bucket creation
-- ============================================

-- Run this query to verify the bucket was created:
SELECT * FROM storage.buckets WHERE id = 'deals';

-- Run this query to verify the policies were created:
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%deal%';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. If you get an error creating the bucket via SQL, create it manually:
--    - Go to Supabase Dashboard > Storage
--    - Click "New Bucket"
--    - Name: deals
--    - Public: Yes (checked)
--    - Click "Create Bucket"
--    - Then run only the policy statements above
--
-- 2. The policies allow any authenticated user to upload/modify/delete.
--    In production, you should restrict this to admin users only:
--    Replace: auth.role() = 'authenticated'
--    With: auth.jwt() ->> 'role' = 'admin'
--
-- 3. File size limit is 3MB. Adjust if needed.
--
-- 4. To test if upload works, try uploading via code:
--    const { data, error } = await supabase.storage
--      .from('deals')
--      .upload('test-image.jpg', file)
-- ============================================
