-- ============================================
-- SUPABASE STORAGE BUCKET POLICIES
-- ============================================
-- These policies control access to storage buckets
-- Run these after creating the buckets in Supabase Dashboard
-- ============================================

-- ============================================
-- PRODUCT IMAGES BUCKET
-- ============================================
-- Bucket: product-images (Public)
-- Purpose: Store product main and additional images

-- Allow public read access to product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images (admin only in production)
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update product images (admin only in production)
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete product images (admin only in production)
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- CATEGORY IMAGES BUCKET
-- ============================================
-- Bucket: category-images (Public)
-- Purpose: Store category thumbnail images

-- Allow public read access to category images
CREATE POLICY "Category images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

-- Allow authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update category images
CREATE POLICY "Authenticated users can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete category images
CREATE POLICY "Authenticated users can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- USER AVATARS BUCKET
-- ============================================
-- Bucket: user-avatars (Public with user-specific folders)
-- Purpose: Store user profile images
-- Structure: user-avatars/{user_id}/{filename}

-- Allow public read access to user avatars
CREATE POLICY "User avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Allow users to upload their own avatar
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
-- DEALS/HOLIDAY DEALS BUCKET
-- ============================================
-- Bucket: deals (Public)
-- Purpose: Store holiday deals and promotional images

-- Allow public read access to deal images
CREATE POLICY "Deal images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'deals');

-- Allow authenticated users to upload deal images (admin only in production)
CREATE POLICY "Authenticated users can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update deal images (admin only in production)
CREATE POLICY "Authenticated users can update deal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete deal images (admin only in production)
CREATE POLICY "Authenticated users can delete deal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deals' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- BUCKET CREATION COMMANDS (Run in Supabase Dashboard or via API)
-- ============================================

-- Note: These SQL commands are for reference. 
-- Actually create buckets using Supabase Dashboard > Storage or via API

-- Example using Supabase Management API (JavaScript):
/*
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'
)

// Create product-images bucket
await supabase.storage.createBucket('product-images', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
})

// Create category-images bucket
await supabase.storage.createBucket('category-images', {
  public: true,
  fileSizeLimit: 2097152, // 2MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
})

// Create user-avatars bucket
await supabase.storage.createBucket('user-avatars', {
  public: true,
  fileSizeLimit: 2097152, // 2MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
})

// Create deals bucket
await supabase.storage.createBucket('deals', {
  public: true,
  fileSizeLimit: 3145728, // 3MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
})
*/

-- ============================================
-- HELPER FUNCTIONS FOR FILE UPLOADS
-- ============================================

-- Function to get public URL for storage objects
-- Usage in client: supabase.storage.from('bucket-name').getPublicUrl(path)

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION generate_unique_filename(original_filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN gen_random_uuid()::text || '-' || original_filename;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE MAINTENANCE
-- ============================================

-- Function to clean up orphaned images (images not referenced in database)
CREATE OR REPLACE FUNCTION cleanup_orphaned_product_images()
RETURNS void AS $$
DECLARE
  orphaned_image RECORD;
BEGIN
  -- This would need to be implemented based on your storage structure
  -- Example: Delete images from storage that aren't in products or product_images tables
  RAISE NOTICE 'Cleanup function needs to be implemented based on your storage structure';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETION
-- ============================================
-- Storage policies configured successfully!
-- Remember to:
-- 1. Create the actual buckets in Supabase Dashboard > Storage
-- 2. Test upload/download with different user roles
-- 3. Configure CORS settings if needed
-- 4. Set appropriate file size limits
-- ============================================
