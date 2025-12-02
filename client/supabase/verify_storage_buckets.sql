-- =====================================================
-- STORAGE BUCKETS VERIFICATION AND DIAGNOSTICS
-- =====================================================
-- Run this in Supabase SQL Editor to check all storage buckets
-- =====================================================

-- =====================================================
-- 1. LIST ALL STORAGE BUCKETS
-- =====================================================
SELECT 
  id AS bucket_name,
  name,
  public,
  file_size_limit / 1024 / 1024 AS size_limit_mb,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY created_at;

-- Expected buckets:
-- - product-images (public: true)
-- - category-images (public: true)
-- - user-avatars (public: true)
-- - deals (public: true)

-- =====================================================
-- 2. CHECK RLS POLICIES FOR EACH BUCKET
-- =====================================================

-- Product Images Policies
SELECT 
  'product-images' AS bucket,
  policyname AS policy_name,
  cmd AS operation,
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated'
    ELSE roles::text
  END AS allowed_roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%product image%'
ORDER BY cmd;

-- Category Images Policies
SELECT 
  'category-images' AS bucket,
  policyname AS policy_name,
  cmd AS operation,
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated'
    ELSE roles::text
  END AS allowed_roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%category image%'
ORDER BY cmd;

-- User Avatars Policies
SELECT 
  'user-avatars' AS bucket,
  policyname AS policy_name,
  cmd AS operation,
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated'
    ELSE roles::text
  END AS allowed_roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY cmd;

-- Deals Images Policies
SELECT 
  'deals' AS bucket,
  policyname AS policy_name,
  cmd AS operation,
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated'
    ELSE roles::text
  END AS allowed_roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%deal image%'
ORDER BY cmd;

-- =====================================================
-- 3. COUNT FILES IN EACH BUCKET
-- =====================================================
SELECT 
  bucket_id,
  COUNT(*) AS file_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) AS total_size
FROM storage.objects
WHERE bucket_id IN ('product-images', 'category-images', 'user-avatars', 'deals')
GROUP BY bucket_id
ORDER BY bucket_id;

-- =====================================================
-- 4. RECENT UPLOADS (Last 10)
-- =====================================================
SELECT 
  bucket_id,
  name AS file_path,
  created_at,
  updated_at,
  (metadata->>'size')::bigint / 1024 AS size_kb,
  metadata->>'mimetype' AS mime_type
FROM storage.objects
WHERE bucket_id IN ('product-images', 'category-images', 'user-avatars', 'deals')
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 5. CHECK CATEGORY IMAGES SPECIFICALLY
-- =====================================================
SELECT 
  o.name AS file_path,
  o.created_at,
  o.updated_at,
  (o.metadata->>'size')::bigint / 1024 AS size_kb,
  o.metadata->>'mimetype' AS mime_type,
  -- Try to match with categories table
  c.id AS category_id,
  c.title AS category_title
FROM storage.objects o
LEFT JOIN categories c ON c.image LIKE '%' || o.name || '%'
WHERE o.bucket_id = 'category-images'
ORDER BY o.created_at DESC;

-- =====================================================
-- 6. CATEGORIES WITH AND WITHOUT IMAGES
-- =====================================================
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN image IS NULL THEN '❌ No Image'
    WHEN image = '' THEN '❌ Empty String'
    ELSE '✅ Has Image'
  END AS image_status,
  image AS image_url,
  created_at
FROM categories
ORDER BY created_at DESC;

-- =====================================================
-- 7. ORPHANED IMAGES (Images not linked to any category)
-- =====================================================
SELECT 
  o.name AS orphaned_file,
  o.created_at,
  o.updated_at,
  (o.metadata->>'size')::bigint / 1024 AS size_kb
FROM storage.objects o
WHERE o.bucket_id = 'category-images'
AND NOT EXISTS (
  SELECT 1 
  FROM categories c 
  WHERE c.image LIKE '%' || o.name || '%'
);

-- =====================================================
-- 8. TEST PUBLIC ACCESS
-- =====================================================
-- Check if buckets are truly public
SELECT 
  id AS bucket_name,
  public AS is_public,
  CASE 
    WHEN public = true THEN '✅ Public access enabled'
    ELSE '❌ Public access disabled - FIX THIS!'
  END AS status
FROM storage.buckets
WHERE id IN ('product-images', 'category-images', 'user-avatars', 'deals');

-- =====================================================
-- 9. MISSING POLICIES CHECK
-- =====================================================
-- Each bucket should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
WITH policy_counts AS (
  SELECT 
    CASE 
      WHEN policyname LIKE '%product image%' THEN 'product-images'
      WHEN policyname LIKE '%category image%' THEN 'category-images'
      WHEN policyname LIKE '%avatar%' THEN 'user-avatars'
      WHEN policyname LIKE '%deal image%' THEN 'deals'
    END AS bucket,
    COUNT(*) AS policy_count
  FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  GROUP BY bucket
)
SELECT 
  bucket,
  policy_count,
  CASE 
    WHEN policy_count >= 4 THEN '✅ All policies present'
    ELSE '⚠️ Missing ' || (4 - policy_count) || ' policies'
  END AS status
FROM policy_counts
WHERE bucket IS NOT NULL
ORDER BY bucket;

-- =====================================================
-- 10. GENERATE PUBLIC URLS (For testing)
-- =====================================================
-- This shows how URLs should be constructed
SELECT 
  'https://your-project-ref.supabase.co/storage/v1/object/public/' || bucket_id || '/' || name AS public_url,
  bucket_id,
  name,
  created_at
FROM storage.objects
WHERE bucket_id = 'category-images'
ORDER BY created_at DESC
LIMIT 5;

-- NOTE: Replace 'your-project-ref' with your actual Supabase project reference ID

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
/*
✅ HEALTHY STATUS:
- All 4 buckets exist (product-images, category-images, user-avatars, deals)
- All buckets have public = true
- Each bucket has 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
- SELECT policy allows public access
- INSERT/UPDATE/DELETE policies require authentication
- Files show in recent uploads
- Categories have valid image URLs

❌ PROBLEMS TO FIX:

1. Missing Bucket:
   → Run create_[bucket_name]_bucket.sql

2. Bucket not public:
   → UPDATE storage.buckets SET public = true WHERE id = 'bucket-name';

3. Missing policies (count < 4):
   → Run the policy creation statements from storage_policies.sql

4. Categories without images:
   → Upload images via admin panel

5. Orphaned images:
   → Clean up unused files or link them to categories

6. Access denied errors:
   → Check browser console
   → Verify RLS policies
   → Ensure bucket is public
*/

-- =====================================================
-- QUICK FIX COMMANDS
-- =====================================================

-- Make all buckets public (if needed)
-- UPDATE storage.buckets SET public = true WHERE id IN ('product-images', 'category-images', 'user-avatars', 'deals');

-- Delete orphaned images (CAREFUL - this is permanent!)
-- DELETE FROM storage.objects WHERE bucket_id = 'category-images' AND name NOT IN (SELECT SUBSTRING(image FROM '([^/]+)$') FROM categories WHERE image IS NOT NULL);

-- =====================================================
-- COMPLETION
-- =====================================================
-- Review the output from each section above
-- Fix any issues identified
-- Re-run this script to verify fixes
-- =====================================================
