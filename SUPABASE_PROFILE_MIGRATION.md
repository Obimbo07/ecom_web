# Supabase Profile Components Migration

## Overview
This document outlines the migration of all profile-related components from Django REST API to Supabase, including shipping addresses, payment methods, settings, and reviews.

---

## ✅ Completed Migrations

### 1. **ShippingAddressScreen** (`client/src/components/profile/address/ShippingAddressScreen.tsx`)

**Changes:**
- Replaced `api.get/post/put/delete` with Supabase functions
- Uses `getShippingAddresses()`, `createShippingAddress()`, `updateShippingAddress()`, `deleteShippingAddress()`
- Added authentication check with `useAuth()` hook
- Added confirmation dialog for deletions
- Improved error handling with console logging

**Schema Requirements:**
```sql
shipping_addresses table needs:
- id (serial primary key)
- user_id (uuid references auth.users)
- full_name (text)
- address_line1 (text)
- address_line2 (text, nullable)
- city (text)
- state (text, nullable)
- postal_code (text)
- country (text)
- phone (text)
- is_default (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

---

### 2. **PaymentMethodScreen** (`client/src/components/profile/payments/PaymentMethodScreen.tsx`)

**Changes:**
- Replaced `api.get/post/put/delete` with Supabase functions
- Uses `getPaymentMethods()`, `createPaymentMethod()`, `updatePaymentMethod()`, `deletePaymentMethod()`
- Added authentication check with `useAuth()` hook
- Added confirmation dialog for deletions
- Improved error handling

**Schema Requirements:**
```sql
payment_methods table needs:
- id (serial primary key)
- user_id (uuid references auth.users)
- method_type (text) -- 'mpesa', 'visa', 'mastercard', etc.
- phone_number (text)
- last_four (text) -- last 4 digits of card
- is_default (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

---

### 3. **SettingsScreen** (`client/src/components/profile/settings/SettingsScreen.tsx`)

**Changes:**
- Replaced `api.get/put` with Supabase functions
- Uses `getProfile()`, `updateProfile()`
- **NEW:** Image upload to Supabase Storage bucket `avatars`
- Stores images in `profiles/` folder within bucket
- Simplified profile structure (removed nested `profile` object)
- Authentication check with `useAuth()` hook

**Schema Requirements:**
```sql
profiles table needs:
- id (uuid primary key references auth.users)
- username (text unique)
- full_name (text, nullable)
- bio (text, nullable)
- phone (text, nullable)
- image (text, nullable) -- URL to storage
- verified (boolean default false)
- created_at (timestamp)
- updated_at (timestamp)
```

**Storage Bucket:**
- Bucket name: `user-avatars`
- Public access: Yes
- File structure: `{userId}/{timestamp}.{ext}`

---

### 4. **Reviews** (`client/src/components/profile/reviews/Reviews.tsx`)

**Status:** Already migrated in previous session
- Uses `getUserReviews()` from Supabase
- Displays product information with images
- Shows verification status

---

### 5. **OrderDetails** (`client/src/components/profile/orders/OrderDetails.tsx`)

**Status:** Already migrated in previous session
- Uses `getOrderById()`, `getShippingAddresses()`, `getPaymentMethods()`
- Authentication guards in place

---

### 6. **Orders** (`client/src/components/profile/orders/Orders.tsx`)

**Status:** Already migrated in previous session
- Uses `getUserOrders()` from Supabase

---

## 🗄️ Database Migration Required

### SQL Script to Run
Execute the following SQL script in your Supabase SQL Editor:

**File:** `client/supabase/migrations/create_avatars_storage_bucket.sql`

This script will:
1. ✅ Create `user-avatars` storage bucket with public access (if not exists)
2. ✅ Set up RLS policies for avatar uploads
3. ✅ Add `full_name` column to `shipping_addresses` (if not exists)
4. ✅ Add `username` and `bio` columns to `profiles` (if not exists)
5. ✅ Create/update RLS policies for:
   - profiles (SELECT, INSERT, UPDATE)
   - shipping_addresses (SELECT, INSERT, UPDATE, DELETE)
   - payment_methods (SELECT, INSERT, UPDATE, DELETE)
6. ✅ Create indexes for better performance

---

## 📝 Supabase Helper Functions Added

### In `client/src/lib/supabase.ts`:

#### Shipping Addresses:
```typescript
createShippingAddress(userId, address)   // Create new address
updateShippingAddress(addressId, updates) // Update existing address
deleteShippingAddress(addressId)          // Delete address
```

#### Payment Methods:
```typescript
createPaymentMethod(userId, method)       // Create new payment method
updatePaymentMethod(methodId, updates)    // Update existing method
deletePaymentMethod(methodId)             // Delete method
```

#### Profile:
```typescript
getProfile(userId)                        // Get user profile (auto-creates if missing)
updateProfile(userId, updates)            // Update user profile
```

---

## 🔐 Authentication & Security

### RLS Policies Implemented:

1. **Profiles:**
   - Anyone can view profiles (public)
   - Users can only update their own profile
   - Users can insert their own profile

2. **Shipping Addresses:**
   - Users can only view, create, update, delete their own addresses

3. **Payment Methods:**
   - Users can only view, create, update, delete their own payment methods

4. **Storage (User Avatars):**
   - Public read access for all images
   - Users can upload to their own folder `{userId}/`
   - Users can update/delete their own images

---

## 🚀 How to Apply Migration

### Step 1: Run SQL Migration
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire contents of:
   ```
   client/supabase/migrations/create_avatars_storage_bucket.sql
   ```
4. Click **Run** to execute

### Step 2: Verify Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Verify `user-avatars` bucket exists
3. Check that it's set to **Public**

### Step 3: Test Components
Test each component in your application:
- ✅ Add/Edit/Delete shipping addresses
- ✅ Add/Edit/Delete payment methods
- ✅ Update profile with image upload
- ✅ View reviews
- ✅ View orders

---

## 🔧 Breaking Changes & Notes

### Component API Changes:

1. **ShippingAddressScreen:**
   - Now uses camelCase for address properties in functions
   - `full_name` → `fullName` (in function params)
   - `address_line1` → `addressLine1`
   - Database still uses snake_case

2. **PaymentMethodScreen:**
   - Uses camelCase for method properties in functions
   - `method_type` → `methodType`
   - `phone_number` → `phoneNumber`
   - Database still uses snake_case

3. **SettingsScreen:**
   - Removed nested `profile` object structure
   - Direct access to `username`, `full_name`, `bio`, `phone`, `image`
   - Images now stored in Supabase Storage instead of media files
   - Image URLs are public and permanent

---

## 📊 Schema Summary

### Tables Required:
- ✅ `profiles`
- ✅ `shipping_addresses`
- ✅ `payment_methods`
- ✅ `orders`
- ✅ `order_items`
- ✅ `product_reviews`

### Storage Buckets Required:
- ✅ `avatars` (public)

### RLS Enabled On:
- ✅ profiles
- ✅ shipping_addresses
- ✅ payment_methods
- ✅ orders
- ✅ order_items
- ✅ product_reviews
- ✅ storage.objects (avatars bucket)

---

## 🐛 Potential Issues & Solutions

### Issue 1: "Cannot coerce the result to a single JSON object"
**Solution:** Already fixed in `getProfile()` - uses `.maybeSingle()` and auto-creates profile if missing

### Issue 2: Upload fails with "Invalid bucket"
**Solution:** Make sure to run the SQL migration to create the `user-avatars` bucket

### Issue 3: RLS policy violations
**Solution:** Ensure user is authenticated and SQL migration has been run

### Issue 4: Images not displaying
**Solution:** 
- Check that bucket is set to public
- Verify image URL format
- Check browser console for CORS errors

---

## ✨ Next Steps

### Recommended Improvements:

1. **Image Optimization:**
   - Add image compression before upload
   - Implement image resizing (thumbnails)
   - Add loading states for uploads

2. **Validation:**
   - Add form validation for phone numbers
   - Validate postal codes by country
   - Add card number validation for payment methods

3. **UX Enhancements:**
   - Add success toast notifications
   - Implement optimistic UI updates
   - Add skeleton loaders

4. **Testing:**
   - Test with multiple users
   - Test file upload limits
   - Test RLS policies thoroughly

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify RLS policies are active
4. Ensure SQL migration ran successfully

---

## Summary Checklist

- [x] ShippingAddressScreen migrated
- [x] PaymentMethodScreen migrated
- [x] SettingsScreen migrated
- [x] Reviews migrated (previous session)
- [x] Orders migrated (previous session)
- [x] OrderDetails migrated (previous session)
- [x] Profile page migrated (previous session)
- [x] Helper functions added to supabase.ts
- [x] SQL migration script created
- [x] Documentation created

**All profile components are now fully migrated to Supabase!** 🎉
