-- =====================================================
-- Create Category Images Storage Bucket and RLS Policies
-- =====================================================
-- Run this in Supabase SQL Editor

-- Step 1: Check if bucket already exists
SELECT id, name, public FROM storage.buckets WHERE id = 'category-images';

-- Step 2: Create the category-images bucket (run only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,  -- Public bucket for viewing category images
  3145728,  -- 3MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
);

-- Step 3: Create RLS Policies

-- Policy 1: Allow public SELECT (anyone can view category images)
CREATE POLICY "Public can view category images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- Policy 2: Allow authenticated users to INSERT (upload category images)
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-images');

-- Policy 3: Allow authenticated users to UPDATE (update category images)
CREATE POLICY "Authenticated users can update category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'category-images')
WITH CHECK (bucket_id = 'category-images');

-- Policy 4: Allow authenticated users to DELETE (remove category images)
CREATE POLICY "Authenticated users can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-images');

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'category-images';

-- Verify policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%category images%';

-- Count existing category images
SELECT COUNT(*) as image_count 
FROM storage.objects 
WHERE bucket_id = 'category-images';

-- =====================================================
-- Notes:
-- =====================================================
-- 1. This creates a PUBLIC bucket - anyone can view images
-- 2. Only authenticated users can upload/update/delete
-- 3. 3MB file size limit per image
-- 4. Supports common image formats: JPEG, PNG, WebP, GIF, AVIF
-- 5. If you get a "duplicate key" error on bucket creation, 
--    it means the bucket already exists - just run the policies
-- 6. If you get "policy already exists" errors, you can ignore them
--    or drop existing policies first with:
--    DROP POLICY IF EXISTS "policy_name" ON storage.objects;
