-- ============================================
-- MOHA FASHION COLLECTION - SUPABASE SCHEMA
-- ============================================
-- Created: November 30, 2025
-- Purpose: E-commerce database schema for fashion retail platform
-- Features: Products, Orders, Cart, Payments, Reviews, Holiday Deals
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends Supabase auth.users with additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  phone TEXT,
  image TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  slug TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- RLS Policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  old_price DECIMAL(10,2) CHECK (old_price >= 0),
  image TEXT,
  type TEXT,
  stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
  life TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sku TEXT UNIQUE,
  weight DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);

-- RLS Policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster product image queries
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- RLS Policies for product images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

-- ============================================
-- TAGS TABLE (for product categorization)
-- ============================================
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- Product Tags Junction Table
CREATE TABLE product_tags (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag_id);

-- RLS Policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product tags are viewable by everyone"
  ON product_tags FOR SELECT
  USING (true);

-- ============================================
-- HOLIDAY DEALS TABLE
-- ============================================
CREATE TABLE holiday_deals (
  deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Index for active deals
CREATE INDEX idx_holiday_deals_active ON holiday_deals(is_active, start_date, end_date) 
  WHERE is_active = TRUE;

-- RLS Policies for holiday deals
ALTER TABLE holiday_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holiday deals are viewable by everyone"
  ON holiday_deals FOR SELECT
  USING (is_active = TRUE AND NOW() BETWEEN start_date AND end_date);

-- ============================================
-- PRODUCT DEALS TABLE (Junction)
-- ============================================
CREATE TABLE product_deals (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES holiday_deals(deal_id) ON DELETE CASCADE NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL CHECK (discounted_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, deal_id)
);

-- Indexes
CREATE INDEX idx_product_deals_product ON product_deals(product_id);
CREATE INDEX idx_product_deals_deal ON product_deals(deal_id);

-- RLS Policies for product deals
ALTER TABLE product_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product deals are viewable by everyone"
  ON product_deals FOR SELECT
  USING (true);

-- ============================================
-- CARTS TABLE
-- ============================================
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user carts
CREATE INDEX idx_carts_user ON carts(user_id);

-- RLS Policies for carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id, size, color)
);

-- Indexes
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- RLS Policies for cart items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- ============================================
-- SHIPPING ADDRESSES TABLE
-- ============================================
CREATE TABLE shipping_addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Kenya',
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  recipient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user addresses
CREATE INDEX idx_shipping_addresses_user ON shipping_addresses(user_id);
CREATE INDEX idx_shipping_addresses_default ON shipping_addresses(user_id, is_default) 
  WHERE is_default = TRUE;

-- RLS Policies for shipping addresses
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON shipping_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON shipping_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON shipping_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('mpesa', 'card', 'bank_transfer')),
  phone_number TEXT,
  last_four TEXT,
  provider TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) 
  WHERE is_default = TRUE;

-- RLS Policies for payment methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
  shipping_address_id INTEGER REFERENCES shipping_addresses(id) ON DELETE SET NULL,
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- RLS Policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders (limited)"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_applied DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- RLS Policies for order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update own order items"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own order items"
  ON order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- Indexes
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS Policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CHECKOUT SESSIONS TABLE (for payment tracking)
-- ============================================
CREATE TABLE checkout_sessions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  checkout_request_id TEXT UNIQUE,
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  merchant_request_id TEXT,
  response_code TEXT,
  response_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_checkout_sessions_order ON checkout_sessions(order_id);
CREATE INDEX idx_checkout_sessions_request_id ON checkout_sessions(checkout_request_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);

-- RLS Policies for checkout sessions
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkout sessions"
  ON checkout_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = checkout_sessions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- PROMOCODES TABLE
-- ============================================
CREATE TABLE promocodes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_promocode_dates CHECK (valid_until > valid_from)
);

-- Indexes
CREATE INDEX idx_promocodes_code ON promocodes(code);
CREATE INDEX idx_promocodes_active ON promocodes(is_active, valid_from, valid_until) 
  WHERE is_active = TRUE;

-- RLS Policies for promocodes
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active promocodes are viewable by everyone"
  ON promocodes FOR SELECT
  USING (is_active = TRUE AND NOW() BETWEEN valid_from AND valid_until);

-- User Promocode Usage Tracking
CREATE TABLE user_promocode_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  promocode_id INTEGER REFERENCES promocodes(id) ON DELETE CASCADE NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, promocode_id, order_id)
);

CREATE INDEX idx_user_promocode_usage_user ON user_promocode_usage(user_id);
CREATE INDEX idx_user_promocode_usage_promocode ON user_promocode_usage(promocode_id);

-- RLS Policies
ALTER TABLE user_promocode_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promocode usage"
  ON user_promocode_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- RLS Policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'payment', 'promotion', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holiday_deals_updated_at BEFORE UPDATE ON holiday_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at BEFORE UPDATE ON checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promocodes_updated_at BEFORE UPDATE ON promocodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('orders_id_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE shipping_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_payment_trigger
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment();

-- Function to create cart for new user
CREATE OR REPLACE FUNCTION create_user_cart()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO carts (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be on auth.users, but we can't directly modify that
-- Instead, handle cart creation in application code or use a Supabase Edge Function

-- Function to calculate cart total (for views)
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_id_param INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN pd.discounted_price IS NOT NULL THEN pd.discounted_price * ci.quantity
      ELSE p.price * ci.quantity
    END
  ), 0)
  INTO total
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  LEFT JOIN product_deals pd ON p.id = pd.product_id
  LEFT JOIN holiday_deals hd ON pd.deal_id = hd.deal_id 
    AND hd.is_active = TRUE 
    AND NOW() BETWEEN hd.start_date AND hd.end_date
  WHERE ci.cart_id = cart_id_param;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Products with current deal prices
CREATE OR REPLACE VIEW products_with_deals AS
SELECT 
  p.*,
  hd.deal_id,
  hd.name AS deal_name,
  hd.discount_percentage,
  pd.discounted_price,
  hd.start_date AS deal_start_date,
  hd.end_date AS deal_end_date,
  CASE 
    WHEN pd.discounted_price IS NOT NULL THEN pd.discounted_price
    ELSE p.price
  END AS effective_price
FROM products p
LEFT JOIN product_deals pd ON p.id = pd.product_id
LEFT JOIN holiday_deals hd ON pd.deal_id = hd.deal_id 
  AND hd.is_active = TRUE 
  AND NOW() BETWEEN hd.start_date AND hd.end_date
WHERE p.is_active = TRUE;

-- View: Cart with totals
CREATE OR REPLACE VIEW cart_details AS
SELECT 
  c.id AS cart_id,
  c.user_id,
  ci.id AS cart_item_id,
  ci.product_id,
  p.title AS product_title,
  p.image AS product_image,
  ci.quantity,
  ci.size,
  ci.color,
  CASE
    WHEN pd.discounted_price IS NOT NULL THEN pd.discounted_price
    ELSE p.price
  END AS unit_price,
  CASE
    WHEN pd.discounted_price IS NOT NULL THEN pd.discounted_price * ci.quantity
    ELSE p.price * ci.quantity
  END AS item_total
FROM carts c
JOIN cart_items ci ON c.id = ci.cart_id
JOIN products p ON ci.product_id = p.id
LEFT JOIN product_deals pd ON p.id = pd.product_id
LEFT JOIN holiday_deals hd ON pd.deal_id = hd.deal_id 
  AND hd.is_active = TRUE 
  AND NOW() BETWEEN hd.start_date AND hd.end_date;

-- View: Order details with items
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.id AS order_id,
  o.order_number,
  o.user_id,
  o.status,
  o.payment_status,
  o.total_amount,
  o.created_at,
  oi.id AS order_item_id,
  oi.product_title,
  oi.product_image,
  oi.quantity,
  oi.size,
  oi.color,
  oi.price,
  sa.address_line1,
  sa.city,
  sa.phone AS shipping_phone,
  pm.method_type AS payment_method_type
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_addresses sa ON o.shipping_address_id = sa.id
LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id;

-- View: Product statistics (ratings, reviews count)
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  p.id AS product_id,
  p.title,
  COUNT(r.id) AS review_count,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(CASE WHEN r.rating = 5 THEN 1 END) AS five_star_count,
  COUNT(CASE WHEN r.rating = 4 THEN 1 END) AS four_star_count,
  COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS three_star_count,
  COUNT(CASE WHEN r.rating = 2 THEN 1 END) AS two_star_count,
  COUNT(CASE WHEN r.rating = 1 THEN 1 END) AS one_star_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
GROUP BY p.id, p.title;

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_products_category_active ON products(category_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- Full-text search indexes (if using PostgreSQL full-text search)
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- INITIAL DATA / SEED DATA (Optional)
-- ============================================

-- Insert default categories (examples)
INSERT INTO categories (title, description, slug, display_order) VALUES
  ('Men''s Clothing', 'Fashion for men', 'mens-clothing', 1),
  ('Women''s Clothing', 'Fashion for women', 'womens-clothing', 2),
  ('Kids', 'Children''s apparel', 'kids', 3),
  ('Accessories', 'Fashion accessories', 'accessories', 4),
  ('Footwear', 'Shoes and sandals', 'footwear', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS (Run separately via Supabase Dashboard or API)
-- ============================================
-- These commands should be run in Supabase Dashboard under Storage
-- 
-- 1. Create bucket: product-images (public)
-- 2. Create bucket: category-images (public)
-- 3. Create bucket: user-avatars (public with user-specific folders)
-- 
-- Storage policies are configured in storage_policies.sql

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Schema created successfully!
-- Next steps:
-- 1. Run storage_policies.sql to set up storage bucket policies
-- 2. Configure Edge Functions for M-Pesa integration
-- 3. Update client application to use Supabase client
-- 4. Test RLS policies with different user roles
-- ============================================
