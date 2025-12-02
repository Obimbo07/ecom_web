-- ============================================
-- SAMPLE SEED DATA FOR MOHA FASHION COLLECTION
-- ============================================
-- This file contains sample data for testing
-- Run this after schema.sql to populate the database
-- ============================================

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (title, description, slug, display_order, image) VALUES
  ('Shirts & T-Shirts', 'Casual and formal shirts for men', 'shirts-tshirts', 1, NULL),
  ('Pants & Jeans', 'Comfortable pants and denim for men', 'pants-jeans', 2, NULL),
  ('Jackets & Coats', 'Outerwear for all seasons', 'jackets-coats', 3, NULL),
  ('Suits & Formal', 'Professional attire for men', 'suits-formal', 4, NULL),
  ('Sportswear', 'Active wear and athletic clothing', 'sportswear', 5, NULL),
  ('Accessories', 'Belts, wallets, ties and more', 'accessories', 6, NULL),
  ('Footwear', 'Shoes, sneakers and boots', 'footwear', 7, NULL),
  ('Underwear & Socks', 'Essential basics for men', 'underwear-socks', 8, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TAGS
-- ============================================
INSERT INTO tags (name, slug) VALUES
  ('New Arrival', 'new-arrival'),
  ('Best Seller', 'best-seller'),
  ('Limited Edition', 'limited-edition'),
  ('Sale', 'sale'),
  ('Trending', 'trending'),
  ('Premium Quality', 'premium-quality'),
  ('Casual Wear', 'casual-wear'),
  ('Formal Wear', 'formal-wear'),
  ('Business Casual', 'business-casual'),
  ('Slim Fit', 'slim-fit'),
  ('Regular Fit', 'regular-fit'),
  ('Plus Size', 'plus-size')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================
-- Shirts & T-Shirts
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Classic White Oxford Shirt',
    '<p>Premium cotton Oxford shirt perfect for business and formal occasions. Features button-down collar and chest pocket.</p><ul><li>100% Cotton</li><li>Button-down collar</li><li>Machine washable</li><li>Sizes: S to XXL</li></ul>',
    2800.00,
    3500.00,
    (SELECT id FROM categories WHERE slug = 'shirts-tshirts'),
    80,
    'Shirt',
    'SHT-OXF-001',
    'classic-white-oxford-shirt',
    TRUE
  ),
  (
    'Cotton Polo Shirt - Navy Blue',
    '<p>Comfortable cotton polo shirt for everyday wear. Breathable fabric with classic fit.</p><ul><li>100% Cotton</li><li>Ribbed collar and cuffs</li><li>Available in multiple colors</li><li>Perfect for casual occasions</li></ul>',
    1800.00,
    2200.00,
    (SELECT id FROM categories WHERE slug = 'shirts-tshirts'),
    120,
    'Polo',
    'PLO-NAV-001',
    'cotton-polo-navy-blue',
    TRUE
  ),
  (
    'Premium Cotton T-Shirt Pack (3pcs)',
    '<p>Essential cotton t-shirts in classic colors. Soft, comfortable, and durable.</p><ul><li>100% Premium Cotton</li><li>Crew neck design</li><li>Pack of 3 (Black, White, Navy)</li><li>Sizes: M to XXL</li></ul>',
    2400.00,
    3000.00,
    (SELECT id FROM categories WHERE slug = 'shirts-tshirts'),
    150,
    'T-Shirt',
    'TSH-PCK-001',
    'premium-cotton-tshirt-pack',
    FALSE
  ),
  (
    'Checked Casual Shirt',
    '<p>Stylish checked shirt perfect for weekend outings. Modern fit with quality fabric.</p><ul><li>Cotton Blend</li><li>Regular fit</li><li>Long sleeves</li><li>Easy care fabric</li></ul>',
    2200.00,
    2800.00,
    (SELECT id FROM categories WHERE slug = 'shirts-tshirts'),
    90,
    'Shirt',
    'SHT-CHK-001',
    'checked-casual-shirt',
    FALSE
  );

-- Pants & Jeans
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Slim Fit Chino Pants - Khaki',
    '<p>Modern slim fit chino pants. Perfect for both casual and semi-formal occasions.</p><ul><li>Stretch cotton fabric</li><li>Slim fit design</li><li>Multiple pockets</li><li>Available in various colors</li></ul>',
    3500.00,
    4200.00,
    (SELECT id FROM categories WHERE slug = 'pants-jeans'),
    100,
    'Chinos',
    'CHN-SLM-001',
    'slim-fit-chino-khaki',
    TRUE
  ),
  (
    'Classic Blue Denim Jeans',
    '<p>Timeless blue denim jeans with regular fit. Durable and comfortable for everyday wear.</p><ul><li>Premium denim</li><li>Regular fit</li><li>5-pocket design</li><li>Sizes: 28 to 40</li></ul>',
    3800.00,
    4500.00,
    (SELECT id FROM categories WHERE slug = 'pants-jeans'),
    120,
    'Jeans',
    'JNS-BLU-001',
    'classic-blue-denim-jeans',
    TRUE
  ),
  (
    'Black Stretch Jeans',
    '<p>Comfortable stretch jeans in classic black. Modern fit with excellent flexibility.</p><ul><li>Stretch denim</li><li>Slim fit</li><li>Fade-resistant</li><li>All-day comfort</li></ul>',
    4200.00,
    5000.00,
    (SELECT id FROM categories WHERE slug = 'pants-jeans'),
    85,
    'Jeans',
    'JNS-BLK-001',
    'black-stretch-jeans',
    FALSE
  ),
  (
    'Formal Dress Pants - Charcoal',
    '<p>Professional dress pants for business attire. Wrinkle-resistant fabric.</p><ul><li>Polyester blend</li><li>Wrinkle-resistant</li><li>Flat front</li><li>Perfect for office wear</li></ul>',
    3200.00,
    3800.00,
    (SELECT id FROM categories WHERE slug = 'pants-jeans'),
    75,
    'Dress Pants',
    'PNT-FRM-001',
    'formal-dress-pants-charcoal',
    FALSE
  );

-- Jackets & Coats
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Classic Denim Jacket',
    '<p>High-quality denim jacket perfect for casual outings. Features button closure and multiple pockets.</p><ul><li>100% Cotton Denim</li><li>Classic fit</li><li>Button closure</li><li>Available in blue wash</li></ul>',
    5500.00,
    6500.00,
    (SELECT id FROM categories WHERE slug = 'jackets-coats'),
    60,
    'Jacket',
    'JKT-DNM-001',
    'classic-denim-jacket',
    TRUE
  ),
  (
    'Leather Bomber Jacket',
    '<p>Premium leather bomber jacket. Timeless style with modern comfort.</p><ul><li>Genuine leather</li><li>Ribbed cuffs and hem</li><li>Zip closure</li><li>Inner pockets</li></ul>',
    12500.00,
    15000.00,
    (SELECT id FROM categories WHERE slug = 'jackets-coats'),
    30,
    'Jacket',
    'JKT-LTH-001',
    'leather-bomber-jacket',
    TRUE
  ),
  (
    'Windbreaker Jacket',
    '<p>Lightweight windbreaker perfect for outdoor activities. Water-resistant fabric.</p><ul><li>Polyester</li><li>Water-resistant</li><li>Hood included</li><li>Multiple colors</li></ul>',
    3800.00,
    4500.00,
    (SELECT id FROM categories WHERE slug = 'jackets-coats'),
    70,
    'Windbreaker',
    'JKT-WND-001',
    'windbreaker-jacket',
    FALSE
  );

-- Suits & Formal
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Two-Piece Business Suit - Navy',
    '<p>Professional two-piece suit perfect for business meetings. Includes jacket and pants.</p><ul><li>Wool blend</li><li>Modern fit</li><li>Includes jacket and pants</li><li>Dry clean only</li></ul>',
    18500.00,
    22000.00,
    (SELECT id FROM categories WHERE slug = 'suits-formal'),
    40,
    'Suit',
    'SUT-NAV-001',
    'two-piece-business-suit-navy',
    TRUE
  ),
  (
    'Dress Shirt - Light Blue',
    '<p>Classic dress shirt for formal occasions. Non-iron fabric for easy care.</p><ul><li>Cotton blend</li><li>Non-iron finish</li><li>Regular fit</li><li>Button cuffs</li></ul>',
    2500.00,
    3000.00,
    (SELECT id FROM categories WHERE slug = 'suits-formal'),
    90,
    'Dress Shirt',
    'DRS-BLU-001',
    'dress-shirt-light-blue',
    FALSE
  );

-- Sportswear
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Athletic Training T-Shirt',
    '<p>Moisture-wicking training shirt for workouts. Breathable and quick-dry fabric.</p><ul><li>Polyester blend</li><li>Moisture-wicking</li><li>Quick-dry technology</li><li>Perfect for gym</li></ul>',
    1800.00,
    2200.00,
    (SELECT id FROM categories WHERE slug = 'sportswear'),
    110,
    'Sports Tee',
    'SPT-TEE-001',
    'athletic-training-tshirt',
    FALSE
  ),
  (
    'Sports Track Pants',
    '<p>Comfortable track pants for training and casual wear. Elastic waistband with drawstring.</p><ul><li>Polyester</li><li>Elastic waistband</li><li>Side pockets</li><li>Tapered fit</li></ul>',
    2800.00,
    3500.00,
    (SELECT id FROM categories WHERE slug = 'sportswear'),
    95,
    'Track Pants',
    'SPT-TRK-001',
    'sports-track-pants',
    FALSE
  ),
  (
    'Compression Sports Shorts',
    '<p>Performance compression shorts for intense workouts. Supports muscle performance.</p><ul><li>Spandex blend</li><li>Compression fit</li><li>Moisture management</li><li>Elastic waistband</li></ul>',
    2200.00,
    2800.00,
    (SELECT id FROM categories WHERE slug = 'sportswear'),
    80,
    'Shorts',
    'SPT-SHT-001',
    'compression-sports-shorts',
    FALSE
  );

-- Accessories
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Genuine Leather Belt - Black',
    '<p>Premium genuine leather belt with metal buckle. Versatile accessory for any outfit.</p><ul><li>100% Genuine leather</li><li>Metal buckle</li><li>Multiple hole adjustments</li><li>Width: 35mm</li></ul>',
    1800.00,
    2200.00,
    (SELECT id FROM categories WHERE slug = 'accessories'),
    150,
    'Belt',
    'BLT-LTH-001',
    'genuine-leather-belt-black',
    FALSE
  ),
  (
    'Leather Wallet - Bifold',
    '<p>Classic bifold wallet with multiple card slots. Compact and durable design.</p><ul><li>Genuine leather</li><li>6 card slots</li><li>Bill compartment</li><li>ID window</li></ul>',
    2500.00,
    3000.00,
    (SELECT id FROM categories WHERE slug = 'accessories'),
    120,
    'Wallet',
    'WLT-BFD-001',
    'leather-wallet-bifold',
    TRUE
  ),
  (
    'Silk Neck Tie Set (3pcs)',
    '<p>Premium silk ties for formal occasions. Set includes 3 classic patterns.</p><ul><li>100% Silk</li><li>Classic width (8cm)</li><li>3 different patterns</li><li>Includes gift box</li></ul>',
    3500.00,
    4200.00,
    (SELECT id FROM categories WHERE slug = 'accessories'),
    70,
    'Tie',
    'TIE-SLK-001',
    'silk-neck-tie-set',
    FALSE
  ),
  (
    'Men\'s Sunglasses - Aviator Style',
    '<p>Classic aviator sunglasses with UV protection. Stylish and protective.</p><ul><li>UV400 protection</li><li>Metal frame</li><li>Polarized lenses</li><li>Includes case and cloth</li></ul>',
    2800.00,
    3500.00,
    (SELECT id FROM categories WHERE slug = 'accessories'),
    90,
    'Sunglasses',
    'SNG-AVI-001',
    'mens-sunglasses-aviator',
    TRUE
  );

-- Footwear
INSERT INTO products (
  title, 
  description, 
  price, 
  old_price, 
  category_id, 
  stock_count, 
  type,
  sku,
  slug,
  featured
) VALUES
  (
    'Classic Canvas Sneakers',
    '<p>Timeless canvas sneakers for everyday wear. Comfortable and versatile.</p><ul><li>Canvas upper</li><li>Rubber sole</li><li>Breathable lining</li><li>Sizes: 40-46</li></ul>',
    3800.00,
    4500.00,
    (SELECT id FROM categories WHERE slug = 'footwear'),
    100,
    'Sneakers',
    'SNK-CNV-001',
    'classic-canvas-sneakers',
    TRUE
  ),
  (
    'Formal Leather Shoes - Oxford',
    '<p>Premium leather Oxford shoes for formal occasions. Classic design with modern comfort.</p><ul><li>Genuine leather</li><li>Lace-up design</li><li>Cushioned insole</li><li>Dress shoe style</li></ul>',
    6500.00,
    7800.00,
    (SELECT id FROM categories WHERE slug = 'footwear'),
    65,
    'Dress Shoes',
    'SHO-OXF-001',
    'formal-leather-shoes-oxford',
    TRUE
  ),
  (
    'Casual Loafers - Brown',
    '<p>Comfortable leather loafers perfect for casual and semi-formal wear.</p><ul><li>Leather upper</li><li>Slip-on style</li><li>Cushioned footbed</li><li>Versatile design</li></ul>',
    5200.00,
    6200.00,
    (SELECT id FROM categories WHERE slug = 'footwear'),
    75,
    'Loafers',
    'LFR-BRN-001',
    'casual-loafers-brown',
    FALSE
  ),
  (
    'Sports Running Shoes',
    '<p>High-performance running shoes with excellent cushioning. Perfect for daily runs.</p><ul><li>Mesh upper</li><li>EVA midsole</li><li>Non-slip sole</li><li>Breathable design</li></ul>',
    5800.00,
    7000.00,
    (SELECT id FROM categories WHERE slug = 'footwear'),
    85,
    'Running Shoes',
    'RUN-SPT-001',
    'sports-running-shoes',
    TRUE
  );

-- ============================================
-- HOLIDAY DEALS
-- ============================================
INSERT INTO holiday_deals (
  deal_id,
  name,
  description,
  discount_percentage,
  start_date,
  end_date,
  is_active
) VALUES
  (
    gen_random_uuid(),
    'Deals of the Day',
    'Amazing daily deals on selected products',
    20,
    NOW(),
    NOW() + INTERVAL '30 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'Black Friday Sale',
    'Biggest discounts of the year',
    30,
    NOW(),
    NOW() + INTERVAL '7 days',
    TRUE
  ),
  (
    gen_random_uuid(),
    'New Year Clearance',
    'Start the year with great savings',
    25,
    NOW(),
    NOW() + INTERVAL '14 days',
    TRUE
  );

-- ============================================
-- PRODUCT DEALS (Link products to holiday deals)
-- ============================================
-- Link some products to "Deals of the Day"
INSERT INTO product_deals (product_id, deal_id, discounted_price)
SELECT 
  p.id,
  (SELECT deal_id FROM holiday_deals WHERE name = 'Deals of the Day'),
  p.price * 0.8 -- 20% discount
FROM products p
WHERE p.slug IN ('classic-denim-jacket', 'floral-summer-dress', 'canvas-sneakers')
ON CONFLICT (product_id, deal_id) DO NOTHING;

-- Link some products to "Black Friday Sale"
INSERT INTO product_deals (product_id, deal_id, discounted_price)
SELECT 
  p.id,
  (SELECT deal_id FROM holiday_deals WHERE name = 'Black Friday Sale'),
  p.price * 0.7 -- 30% discount
FROM products p
WHERE p.slug IN ('high-waist-jeans', 'sunglasses-uv-protection', 'leather-sandals')
ON CONFLICT (product_id, deal_id) DO NOTHING;

-- ============================================
-- PRODUCT TAGS (Link products to tags)
-- ============================================
-- Tag featured products as "New Arrival"
INSERT INTO product_tags (product_id, tag_id)
SELECT 
  p.id,
  (SELECT id FROM tags WHERE slug = 'new-arrival')
FROM products p
WHERE p.featured = TRUE
ON CONFLICT DO NOTHING;

-- Tag some products as "Best Seller"
INSERT INTO product_tags (product_id, tag_id)
SELECT 
  p.id,
  (SELECT id FROM tags WHERE slug = 'best-seller')
FROM products p
WHERE p.slug IN ('cotton-polo-shirt', 'high-waist-jeans', 'canvas-sneakers')
ON CONFLICT DO NOTHING;

-- Tag discounted products as "Sale"
INSERT INTO product_tags (product_id, tag_id)
SELECT 
  p.id,
  (SELECT id FROM tags WHERE slug = 'sale')
FROM products p
WHERE p.old_price > p.price
ON CONFLICT DO NOTHING;

-- ============================================
-- PROMOCODES
-- ============================================
INSERT INTO promocodes (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_discount,
  usage_limit,
  valid_from,
  valid_until,
  is_active
) VALUES
  (
    'WELCOME10',
    'Welcome discount for new customers',
    'percentage',
    10,
    1000.00,
    500.00,
    100,
    NOW(),
    NOW() + INTERVAL '90 days',
    TRUE
  ),
  (
    'SAVE500',
    'Save 500 on orders above 5000',
    'fixed',
    500,
    5000.00,
    NULL,
    50,
    NOW(),
    NOW() + INTERVAL '30 days',
    TRUE
  ),
  (
    'FREESHIP',
    'Free shipping on all orders',
    'fixed',
    300,
    2000.00,
    300.00,
    200,
    NOW(),
    NOW() + INTERVAL '60 days',
    TRUE
  );

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Seed data inserted successfully!
-- 
-- Summary:
-- - 6 Categories
-- - 12 Products
-- - 3 Holiday Deals
-- - 10 Tags
-- - 3 Promocodes
-- 
-- Next steps:
-- 1. Create test user accounts via Supabase Auth
-- 2. Test cart functionality
-- 3. Upload product images to storage buckets
-- 4. Test order creation flow
-- ============================================

-- Query to verify data
SELECT 
  'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Holiday Deals', COUNT(*) FROM holiday_deals
UNION ALL
SELECT 'Product Deals', COUNT(*) FROM product_deals
UNION ALL
SELECT 'Tags', COUNT(*) FROM tags
UNION ALL
SELECT 'Promocodes', COUNT(*) FROM promocodes;
