-- ============================================
-- ADD IMAGES ARRAY TO PRODUCTS TABLE
-- ============================================
-- This adds an 'images' JSONB column to store additional product images
-- The main 'image' field remains for the primary/featured image

-- Add the images column to products table as JSONB array
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add a check constraint to ensure it's an array
ALTER TABLE products
ADD CONSTRAINT images_is_array CHECK (jsonb_typeof(images) = 'array');

-- Create an index for better performance when querying images
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('image', 'images')
ORDER BY ordinal_position;

-- Example of how images will be stored:
-- images column format: ["url1", "url2", "url3"]
-- Example: '["https://supabase.co/storage/v1/object/public/product-images/products/123-1234567890.jpg", "https://..."]'
