# Ecom Web Client - Project Overview

## Executive Summary

This is a Progressive Web App (PWA) e-commerce platform built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. The application serves as a mobile-first online store for "Moha Fashion Collection Store" - a wholesale and retail apparel business. It currently connects to a Django REST API backend hosted at `https://admin.mohacollection.co.ke`.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Authentication & State Management](#authentication--state-management)
4. [API Integration](#api-integration)
5. [Key Features & Pages](#key-features--pages)
6. [Data Models & Interfaces](#data-models--interfaces)
7. [Component Structure](#component-structure)
8. [Current Backend Dependencies](#current-backend-dependencies)
9. [Supabase Migration Considerations](#supabase-migration-considerations)

---

## Technology Stack

### Core Framework
- **React**: v19.0.0
- **TypeScript**: v5.7.2
- **Vite**: v6.2.0 (Build tool)
- **React Router DOM**: v7.2.0 (Client-side routing)

### UI & Styling
- **Tailwind CSS**: v4.0.11
- **Radix UI**: Component primitives (Dialog, Menubar, Tabs, etc.)
- **shadcn/ui**: Custom UI components
- **Lucide React**: Icon library
- **React Icons**: Additional icons
- **Embla Carousel**: Product carousels

### HTTP Client
- **Axios**: v1.8.1 (API requests with interceptors)

### PWA Support
- **Vite PWA Plugin**: v0.21.1
- Service Worker for offline functionality
- Manifest configuration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Application                     │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  React Router│────▶│ Auth Context │────▶│ Pages/Views │ │
│  │  (Routing)   │     │   (State)    │     │             │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
│         │                     │                     │        │
│         └─────────────────────┼─────────────────────┘        │
│                               │                              │
│                        ┌──────▼──────┐                       │
│                        │ API Client  │                       │
│                        │   (Axios)   │                       │
│                        └──────┬──────┘                       │
└───────────────────────────────┼───────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Django REST API     │
                    │ admin.mohacollection  │
                    │      .co.ke          │
                    └───────────────────────┘
```

### Application Entry Point
- **`main.tsx`**: Renders the app with:
  - `StrictMode` wrapper
  - `AuthProvider` for authentication state
  - `BrowserRouter` for routing
  - Root `App` component

### Routing Structure
- **`App.tsx`**: Central routing configuration
  - Conditional navbar rendering (hidden on /login and /register)
  - 15+ routes for different pages
  - Protected routes (redirect to /login if not authenticated)

---

## Authentication & State Management

### AuthContext (`context/AuthContext.tsx`)

**Purpose**: Global authentication state management

**State Variables**:
- `isAuthenticated`: Boolean flag for user login status
- Token storage in `localStorage`:
  - `token`: JWT access token
  - `refresh_token`: JWT refresh token

**Methods**:
1. **`login()`**: Sets `isAuthenticated` to true
2. **`logout()`**: Removes tokens, sets authenticated to false
3. **`register(username, email, password)`**: 
   - Calls `/users/register/` endpoint
   - Returns specific error messages
   - No automatic login after registration

**Current Issues**:
- `isAuthenticated` state is not persisted (resets on page refresh)
- No token validation on app load
- Registration doesn't auto-login users
- No user profile data stored in context

---

## API Integration

### Axios Instance (`api.ts`)

**Base Configuration**:
```typescript
baseURL: 'https://admin.mohacollection.co.ke'
headers: { 'Content-Type': 'application/json' }
```

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header
- Retrieves token from `localStorage`

**Response Interceptor**:
- Handles 401 (Unauthorized) errors
- Automatic token refresh flow:
  1. Detects 401 error
  2. Calls `/token/refresh/` with refresh token
  3. Updates access token in localStorage
  4. Retries original request
- Redirects to `/login` if refresh fails

**Token Management**:
- Access tokens stored in `localStorage.token`
- Refresh tokens stored in `localStorage.refresh_token`
- No expiration checking before requests

---

## Key Features & Pages

### 1. Authentication Pages

#### **Sign In** (`pages/SignIn.tsx`)
- Email + Password login
- "Remember me" checkbox (non-functional)
- Social login buttons (Facebook, Instagram, Google) - placeholders
- Endpoint: `POST /users/login/`
- Stores: `access_token` and `refresh_token`

#### **Sign Up** (`pages/SignUp.tsx`)
- Username, Email, Password registration
- Endpoint: `POST /users/register/`
- Redirects to home after successful registration
- Does NOT auto-login user

---

### 2. Home Page (`pages/Home.tsx`)

**Protected Route**: Redirects to `/login` if not authenticated

**Data Fetched**:
1. Categories: `GET /api/categories/`
2. Holiday Deals: `GET /api/holiday-deals/`

**Sections**:
- **Hero Carousel**: Main promotional images
- **Deals Grid**: 
  - Static: "Best Discount" → `/discounts`
  - Dynamic: Holiday deals with custom images
- **New Arrivals**: Product carousel (first 5 products)
- **Shop by Category**: Tabbed interface with filtered products
- **Advert Carousel**: Marketing banners
- **Weekly Best Price**: Product carousel
- **Most Selling**: Product carousel
- **Shop by Brand**: Product carousel

---

### 3. Cart Page (`pages/Cart.tsx`)

**Cart Data Structure**:
```typescript
{
  id: number
  items: CartItem[]
  total: number
}
```

**Features**:
- Fetches cart: `GET /api/cart/`
- Fetches product details for each cart item
- **Quantity Controls**: +/- buttons
  - Update: `PUT /api/cart/{cartItemId}/` with `quantity: +1/-1`
- **Size Selector**: Dropdown (S, M, L, XL)
- **Remove Item**: `DELETE /api/cart/{cartItemId}/`
- **Checkout Flow**:
  1. Creates order: `POST /api/orders/`
  2. Navigates to: `/checkout/{orderId}`

**Issues**:
- Hardcoded sizes (no backend validation)
- Multiple API calls for product details (N+1 problem)
- No cart item limit validation

---

### 4. Checkout Page (`pages/Checkout.tsx`)

**Data Fetched**:
1. Order details: `GET /api/user/orders/` (filtered by orderId)
2. Product images: `GET /api/products/` (full list - inefficient)
3. Default shipping address: `GET /users/shipping-addresses`
4. Default payment method: `GET /users/payment-methods`

**Order Display**:
- Order items with images
- Order status (Delivered/Pending)
- Payment status (Paid/Unpaid)
- Total amount
- Shipping address card
- Payment method card

**Payment Integration**:
- **M-Pesa Modal** for mobile payments
- Steps:
  1. Initiate payment: `POST /api/checkout-session/`
  2. User enters M-Pesa PIN on phone
  3. Query payment status: `POST /api/query-mpesa/`
  4. Complete order

**Issues**:
- Fetches ALL products just to get images
- Hardcoded address_id and payment_method_id in M-Pesa flow
- No order creation validation

---

### 5. Profile Page (`pages/Profile.tsx`)

**Data Fetched**:
1. User data: `GET /users/me/`
2. Orders: `GET /api/user/orders/`
3. Reviews: `GET /api/users/reviews/`
4. Shipping addresses: `GET /users/shipping-addresses`
5. Payment methods: `GET /users/payment-methods`

**Profile Sections**:
- User avatar and username/email
- **Sign Out** button
- **My Orders**: Shows order count → `/profile/orders`
- **Shipping Addresses**: Address count → `/profile/shipping-addresses`
- **Payment Methods**: First method or "No methods" → `/profile/payment-methods`
- **Promocodes**: Coming Soon (placeholder)
- **My Reviews**: Review count → `/profile/reviews`
- **Settings**: Notifications, password → `/profile/settings`

**Image Handling**:
- Attempts to load profile image from `user.profile.image`
- Falls back to FaUserAlt icon on error
- Normalizes URLs (relative vs absolute)

---

### 6. Product Components

#### **ProductCard** (`components/products/ProductsCard.tsx`)

**Product Data Model**:
```typescript
interface Product {
  id: number
  title: string
  price: number
  old_price: number
  image: string | null
  description: string (HTML)
  specifications: string | null
  type: string
  stock_count: string
  life: string
  additional_images: ProductImage[]
  holiday_deals: HolidayDeal | null
}
```

**Discount Logic**:
1. **Holiday Discount**: Takes precedence if active
   - Shows `discounted_price`
   - Badge: "Deal -{discount_percentage}%"
2. **Regular Discount**: Fallback
   - Compares `old_price` vs `price`
   - Calculates percentage

**Features**:
- Add to cart button with loading states
- Product drawer with:
  - Image carousel (main + additional images)
  - HTML description parsing
  - Star rating (hardcoded 4.5)
  - Add to cart in drawer

**API Call**:
- Add to cart: `POST /api/cart/` with `{product_id, quantity: 1}`

---

#### **ProductsCarousel** (`components/products/ProductsCarousel.tsx`)

**Features**:
- Fetches products: `GET /api/products/` or `/api/products/category/{categoryId}/`
- Displays first 5 products
- Embla carousel with navigation arrows
- Responsive grid (2 items mobile, 3 items desktop)

---

### 7. Categories Page (`pages/Categories.tsx`)

**Expected Functionality**:
- Lists all product categories
- Navigates to category detail page
- Endpoint: `GET /api/categories/`

---

### 8. Category Products Page (`pages/CategoryProducts.tsx`)

**Expected Functionality**:
- Lists products in a specific category
- Extracted from URL params: `categoryId`
- Endpoint: `GET /api/products/category/{categoryId}/`

---

### 9. Deals Pages

#### **DealsScreen** (`pages/DealsScreen.tsx`)
- Lists all active holiday deals
- Endpoint: `GET /api/holiday-deals/`

#### **DealDetailScreen** (`pages/DealsDetailScreen.tsx`)
- Shows products for a specific deal
- URL param: `dealId`
- Filters products with matching `holiday_deals.deal_id`

---

### 10. Discounts Page (`pages/DiscountsScreen.tsx`)

**Expected Functionality**:
- Shows products with regular discounts (old_price > price)
- Best deals compilation

---

### 11. Profile Sub-Pages

All under `/profile/*`:
- **Orders** (`components/profile/orders/Orders.tsx`)
- **Order Details** (`components/profile/orders/OrderDetails.tsx`)
- **Shipping Addresses** (`components/profile/address/ShippingAddressScreen.tsx`)
- **Payment Methods** (`components/profile/payments/PaymentMethodScreen.tsx`)
- **Reviews** (`components/profile/reviews/Reviews.tsx`)
- **Settings** (`components/profile/settings/SettingsScreen.tsx`)

---

## Data Models & Interfaces

### User & Profile
```typescript
interface User {
  username: string
  email: string
  image: string
  profile: {
    bio: string
    full_name: string
    image: string | null
    phone: number
    verified: boolean
  }
}
```

### Product & Deals
```typescript
interface Product {
  id: number
  title: string
  price: number
  old_price: number
  image: string | null
  description: string
  specifications: string | null
  type: string
  stock_count: string
  life: string
  additional_images: ProductImage[]
  holiday_deals: HolidayDeal | null
}

interface HolidayDeal {
  deal_id: string
  name: string
  discount_percentage: number
  discounted_price: number
  start_date: string
  end_date: string
  is_active: boolean
}
```

### Cart & Orders
```typescript
interface CartResponse {
  id: number
  items: CartItem[]
  total: number
}

interface CartItem {
  id: number
  product_id: number
  quantity: number
  size: string
  product?: Product
}

interface Order {
  id: number
  created_at: string
  status: string
  payment_status: string
  total_amount: number
  items: OrderItem[]
}

interface OrderItem {
  product_title: string
  size: string
  quantity: number
  price: number
  image?: string
}
```

### Payment & Shipping
```typescript
interface ShippingAddress {
  id: number
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface PaymentMethod {
  id: number
  method_type: string
  phone_number: string
  last_four: string
  is_default: boolean
  created_at: string
  updated_at: string
}
```

---

## Component Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Routing configuration
├── api.ts                      # Axios instance
├── context/
│   └── AuthContext.tsx         # Authentication state
├── components/
│   ├── navigation/
│   │   └── Navbar.tsx          # Bottom navigation bar
│   ├── carousel/
│   │   ├── HomeCarousel.tsx    # Hero carousel
│   │   └── AdvertCarousel.tsx  # Marketing banners
│   ├── categories/
│   │   └── Categories.tsx      # Category grid
│   ├── products/
│   │   ├── ProductsCard.tsx    # Product display card
│   │   └── ProductsCarousel.tsx # Product carousel
│   ├── paymentModal/
│   │   └── mpesaModal.tsx      # M-Pesa payment flow
│   ├── profile/
│   │   ├── orders/
│   │   │   ├── Orders.tsx
│   │   │   └── OrderDetails.tsx
│   │   ├── address/
│   │   │   └── ShippingAddressScreen.tsx
│   │   ├── payments/
│   │   │   └── PaymentMethodScreen.tsx
│   │   ├── reviews/
│   │   │   └── Reviews.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   └── ui/                     # Reusable UI components (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── menubar.tsx
│       └── tabs.tsx
└── pages/
    ├── Home.tsx
    ├── SignIn.tsx
    ├── SignUp.tsx
    ├── Cart.tsx
    ├── Checkout.tsx
    ├── Profile.tsx
    ├── Categories.tsx
    ├── CategoryProducts.tsx
    ├── DealsScreen.tsx
    ├── DealsDetailScreen.tsx
    └── DiscountsScreen.tsx
```

---

## Current Backend Dependencies

### Django API Endpoints

#### Authentication
- `POST /users/login/` - User login
- `POST /users/register/` - User registration
- `POST /token/refresh/` - Refresh JWT token
- `GET /users/me/` - Get current user profile

#### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Get product details
- `GET /api/products/category/{categoryId}/` - Products by category

#### Categories
- `GET /api/categories/` - List all categories

#### Holiday Deals
- `GET /api/holiday-deals/` - List active deals

#### Cart
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/` - Add item to cart
- `PUT /api/cart/{cartItemId}/` - Update cart item
- `DELETE /api/cart/{cartItemId}/` - Remove cart item

#### Orders
- `POST /api/orders/` - Create order from cart
- `GET /api/user/orders/` - Get user's orders
- `PUT /orders/{orderId}` - Update order status

#### Payment
- `POST /api/checkout-session/` - Initiate M-Pesa payment
- `POST /api/query-mpesa/` - Check payment status

#### User Profile
- `GET /users/shipping-addresses` - Get shipping addresses
- `GET /users/payment-methods` - Get payment methods
- `GET /api/users/reviews/` - Get user reviews

---

## Supabase Migration Considerations

### Current Backend Features to Replicate

#### 1. Authentication
**Current**: JWT-based auth with Django
**Supabase**: Built-in Auth with JWT

**Migration Path**:
- Replace `AuthContext` with Supabase Auth
- Use `supabase.auth.signIn()`, `signUp()`, `signOut()`
- Session management with `supabase.auth.getSession()`
- Remove custom token refresh logic

**Changes Required**:
- Remove `api.ts` interceptors
- Update `AuthContext` to use Supabase Auth hooks
- Replace localStorage token management

---

#### 2. Database Schema

**Tables to Create in Supabase**:

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  phone TEXT,
  image TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  image TEXT,
  type TEXT,
  stock_count INTEGER,
  life TEXT,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product Images
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image TEXT,
  date TIMESTAMP DEFAULT NOW()
);

-- Holiday Deals
CREATE TABLE holiday_deals (
  deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Product Deals (Junction table)
CREATE TABLE product_deals (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES holiday_deals(deal_id) ON DELETE CASCADE,
  discounted_price DECIMAL(10,2),
  PRIMARY KEY (product_id, deal_id)
);

-- Carts
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cart Items
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  size TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shipping Addresses
CREATE TABLE shipping_addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL,
  phone_number TEXT,
  last_four TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address_id INTEGER REFERENCES shipping_addresses(id),
  payment_method_id INTEGER REFERENCES payment_methods(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER REFERENCES products(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Checkout Sessions (for M-Pesa tracking)
CREATE TABLE checkout_sessions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  checkout_request_id TEXT,
  phone_number TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 3. Row Level Security (RLS) Policies

**Example Policies**:

```sql
-- Users can only read their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can only modify their own cart
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" 
  ON carts FOR ALL 
  USING (auth.uid() = user_id);

-- Anyone can view products (public)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

-- Users can only view their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);
```

---

#### 4. Storage Buckets

**Required Buckets**:
1. **`product-images`**: Product photos
2. **`category-images`**: Category thumbnails
3. **`user-avatars`**: Profile pictures

**Storage Policies**:
```sql
-- Public read access for product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Users can upload their own avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

#### 5. Supabase Client Setup

**Install Dependencies**:
```bash
npm install @supabase/supabase-js
```

**Create Supabase Client** (`lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment Variables** (already in `.env.local`):
```bash
VITE_SUPABASE_URL=https://cwugrtwndvaawxoivmgz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

#### 6. API Call Replacements

**Example Conversions**:

**Current (Axios)**:
```typescript
const response = await api.get('/api/products/')
```

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*, additional_images(*), holiday_deals(*)')
```

**Current (Cart)**:
```typescript
await api.post('/api/cart/', { product_id, quantity })
```

**Supabase**:
```typescript
// First get or create cart
const { data: cart } = await supabase
  .from('carts')
  .select('id')
  .eq('user_id', user.id)
  .single()

// Then add item
await supabase
  .from('cart_items')
  .insert({ cart_id: cart.id, product_id, quantity })
```

---

#### 7. Real-time Features (Bonus)

**Supabase enables real-time updates**:

```typescript
// Subscribe to cart changes
supabase
  .channel('cart-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'cart_items' },
    (payload) => {
      console.log('Cart updated!', payload)
      // Refresh cart UI
    }
  )
  .subscribe()
```

---

#### 8. M-Pesa Integration

**Challenges**:
- M-Pesa STK Push requires server-side logic
- Cannot make direct API calls from browser (security)

**Solutions**:
1. **Supabase Edge Functions**: Deploy serverless functions for M-Pesa
2. **Third-party Service**: Use Flutterwave/Paystack with Supabase
3. **Keep Django Microservice**: Only for payment processing

**Edge Function Example** (`supabase/functions/mpesa-stk/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { phone_number, amount } = await req.json()
  
  // Call M-Pesa API
  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MPESA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: '174379',
      Password: base64_password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone_number,
      PartyB: '174379',
      PhoneNumber: phone_number,
      CallBackURL: 'https://your-callback-url.com/callback',
      AccountReference: 'Order123',
      TransactionDesc: 'Payment'
    })
  })
  
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Migration Roadmap

### Phase 1: Setup (Week 1)
1. ✅ Create Supabase project (already done - credentials in .env)
2. ✅ Set up database schema
3. ✅ Configure RLS policies
4. ✅ Create storage buckets
5. ✅ Install `@supabase/supabase-js`

### Phase 2: Authentication (Week 2)
1. Replace `AuthContext` with Supabase Auth
2. Update login/signup pages
3. Implement session management
4. Add protected route logic
5. Test token refresh

### Phase 3: Core Features (Week 3-4)
1. Migrate product listings
2. Migrate cart functionality
3. Update profile pages
4. Implement order creation
5. Set up file uploads

### Phase 4: Advanced Features (Week 5)
1. Deploy M-Pesa Edge Functions
2. Implement real-time cart updates
3. Add holiday deals logic
4. Set up product search
5. Optimize queries

### Phase 5: Testing & Polish (Week 6)
1. Integration testing
2. Performance optimization
3. Error handling
4. PWA updates
5. Documentation

---

## Key Challenges

### 1. **N+1 Query Problems**
- Current: Multiple API calls for cart items
- Solution: Supabase nested selects

### 2. **Image URL Management**
- Current: Mixed relative/absolute URLs
- Solution: Consistent Supabase Storage URLs

### 3. **M-Pesa Integration**
- Current: Backend handles all logic
- Solution: Edge Functions or hybrid approach

### 4. **State Persistence**
- Current: `isAuthenticated` resets on refresh
- Solution: Supabase session management

### 5. **Holiday Deals Logic**
- Current: Backend calculates discounts
- Solution: Database views or computed columns

---

## Recommendations

### Immediate Improvements (Pre-Migration)
1. **Fix Auth Persistence**: Check token on app load
2. **Optimize Cart Queries**: Batch product fetches
3. **Add Loading States**: Better UX for all async operations
4. **Error Boundaries**: Catch React errors
5. **TypeScript Strict Mode**: Fix any type issues

### Post-Migration Benefits
1. **Real-time Updates**: Cart, order status, inventory
2. **Better Performance**: Optimized queries with indexes
3. **Scalability**: Serverless auto-scaling
4. **Security**: RLS policies enforce data access
5. **Simplified Codebase**: Remove custom auth logic
6. **Cost-Effective**: Supabase free tier is generous
7. **Built-in Admin Panel**: Manage data easily

---

## Conclusion

This e-commerce client is a well-structured React application with a clear separation of concerns. The migration to Supabase will:
- **Reduce Backend Complexity**: No need to maintain Django API
- **Improve Performance**: Direct database queries from client
- **Enable Real-time Features**: Live cart updates, inventory tracking
- **Enhance Security**: Row Level Security enforces access control
- **Simplify Deployment**: Frontend + Edge Functions only

The main challenge will be replicating the M-Pesa payment flow, which requires server-side processing. A hybrid approach (Supabase + Edge Functions) is recommended.

---

**Last Updated**: November 30, 2025  
**Author**: GitHub Copilot  
**Version**: 1.0  
**Supabase Project**: cwugrtwndvaawxoivmgz.supabase.co
