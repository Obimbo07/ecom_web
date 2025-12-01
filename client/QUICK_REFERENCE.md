# 🎯 Supabase Quick Reference Card

One-page reference for common Supabase operations in your Moha Fashion Collection project.

---

## 🔑 Environment Setup

```bash
# .env.local
VITE_SUPABASE_URL=https://cwugrtwndvaawxoivmgz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔌 Import Supabase Client

```typescript
import { supabase } from '@/lib/supabase'
```

---

## 👤 Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      username: 'john_doe',
      full_name: 'John Doe'
    }
  }
})
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123'
})
```

### Sign Out
```typescript
await supabase.auth.signOut()
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession()
```

---

## 📦 Products

### Get All Products
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
```

### Get Products with Images & Deals
```typescript
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_images(*),
    product_deals(
      discounted_price,
      holiday_deals(*)
    )
  `)
  .eq('is_active', true)
```

### Get Products by Category
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .eq('is_active', true)
```

### Get Single Product
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*, product_images(*)')
  .eq('id', productId)
  .single()
```

### Search Products
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .textSearch('title', searchQuery)
```

---

## 🗂️ Categories

### Get All Categories
```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true })
```

---

## 🛒 Cart Operations

### Get User's Cart
```typescript
// Get cart ID
const { data: cart } = await supabase
  .from('carts')
  .select('id')
  .eq('user_id', user.id)
  .single()

// Get cart items with product details
const { data: items } = await supabase
  .from('cart_details') // Using view
  .select('*')
  .eq('user_id', user.id)
```

### Add Item to Cart
```typescript
// First, get or create cart
const { data: cart } = await supabase
  .from('carts')
  .select('id')
  .eq('user_id', user.id)
  .single()

// If no cart exists, create one
if (!cart) {
  const { data: newCart } = await supabase
    .from('carts')
    .insert({ user_id: user.id })
    .select()
    .single()
}

// Add item
const { data, error } = await supabase
  .from('cart_items')
  .insert({
    cart_id: cart.id,
    product_id: productId,
    quantity: 1,
    size: 'M'
  })
```

### Update Cart Item Quantity
```typescript
const { data, error } = await supabase
  .from('cart_items')
  .update({ quantity: newQuantity })
  .eq('id', cartItemId)
```

### Remove from Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('id', cartItemId)
```

### Clear Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('cart_id', cartId)
```

---

## 📦 Orders

### Create Order
```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    subtotal: subtotal,
    total_amount: total,
    shipping_cost: shippingCost,
    shipping_address_id: addressId,
    payment_method_id: paymentMethodId
  })
  .select()
  .single()

// Create order items
const orderItems = cartItems.map(item => ({
  order_id: order.id,
  product_id: item.product_id,
  product_title: item.product_title,
  product_image: item.product_image,
  quantity: item.quantity,
  size: item.size,
  price: item.unit_price
}))

await supabase
  .from('order_items')
  .insert(orderItems)
```

### Get User Orders
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(*)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### Update Order Status
```typescript
const { data, error } = await supabase
  .from('orders')
  .update({ 
    status: 'shipped',
    tracking_number: 'TRACK123'
  })
  .eq('id', orderId)
```

---

## 🏠 Shipping Addresses

### Get User Addresses
```typescript
const { data, error } = await supabase
  .from('shipping_addresses')
  .select('*')
  .eq('user_id', user.id)
  .order('is_default', { ascending: false })
```

### Add Address
```typescript
const { data, error } = await supabase
  .from('shipping_addresses')
  .insert({
    user_id: user.id,
    address_line1: '123 Main St',
    city: 'Nairobi',
    postal_code: '00100',
    country: 'Kenya',
    phone: '+254712345678',
    is_default: true
  })
```

### Set Default Address
```typescript
// First, unset all defaults
await supabase
  .from('shipping_addresses')
  .update({ is_default: false })
  .eq('user_id', user.id)

// Then set the new default
await supabase
  .from('shipping_addresses')
  .update({ is_default: true })
  .eq('id', addressId)
```

---

## 💳 Payment Methods

### Get Payment Methods
```typescript
const { data, error } = await supabase
  .from('payment_methods')
  .select('*')
  .eq('user_id', user.id)
```

### Add Payment Method
```typescript
const { data, error } = await supabase
  .from('payment_methods')
  .insert({
    user_id: user.id,
    method_type: 'mpesa',
    phone_number: '+254712345678',
    last_four: '5678',
    is_default: true
  })
```

---

## ⭐ Reviews

### Get Product Reviews
```typescript
const { data, error } = await supabase
  .from('reviews')
  .select(`
    *,
    profiles(username, image)
  `)
  .eq('product_id', productId)
  .eq('is_approved', true)
  .order('created_at', { ascending: false })
```

### Add Review
```typescript
const { data, error } = await supabase
  .from('reviews')
  .insert({
    user_id: user.id,
    product_id: productId,
    order_id: orderId,
    rating: 5,
    review_text: 'Great product!',
    is_verified_purchase: true
  })
```

---

## 🎁 Holiday Deals

### Get Active Deals
```typescript
const { data, error } = await supabase
  .from('holiday_deals')
  .select('*')
  .eq('is_active', true)
  .lte('start_date', new Date().toISOString())
  .gte('end_date', new Date().toISOString())
```

### Get Products with Deals
```typescript
const { data, error } = await supabase
  .from('products_with_deals') // Using view
  .select('*')
  .not('deal_id', 'is', null)
```

---

## 📁 File Storage

### Upload File
```typescript
const file = event.target.files[0]
const fileName = `${Date.now()}-${file.name}`

const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(`products/${fileName}`)
```

### Upload User Avatar
```typescript
const { data, error } = await supabase.storage
  .from('user-avatars')
  .upload(`${user.id}/${fileName}`, file)
```

### Get File URL
```typescript
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl('products/image.jpg')

const url = data.publicUrl
```

### Delete File
```typescript
await supabase.storage
  .from('product-images')
  .remove(['products/image.jpg'])
```

---

## 🔔 Real-time Subscriptions

### Subscribe to Cart Changes
```typescript
const channel = supabase
  .channel('cart-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'cart_items'
    },
    (payload) => {
      console.log('Cart updated:', payload)
      // Refresh cart UI
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

### Subscribe to Order Updates
```typescript
supabase
  .channel('order-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('Order updated:', payload)
    }
  )
  .subscribe()
```

---

## 🔍 Advanced Queries

### Pagination
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .range(0, 9) // First 10 items
  .order('created_at', { ascending: false })
```

### Filtering
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .gte('price', 100)
  .lte('price', 500)
  .in('category_id', [1, 2, 3])
```

### Counting
```typescript
const { count, error } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
```

---

## ⚠️ Error Handling

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')

if (error) {
  console.error('Error:', error.message)
  // Handle error
} else {
  console.log('Data:', data)
  // Use data
}
```

---

## 🔐 Row Level Security (RLS)

### Check if user can access data
```typescript
// RLS automatically enforces policies
// No need for manual checks in most cases

// Example: This will only return user's own cart
const { data } = await supabase
  .from('cart_items')
  .select('*')
// RLS policy ensures user only sees their items
```

---

## 🛠️ Helper Functions

### Calculate Cart Total
```typescript
const { data, error } = await supabase
  .rpc('calculate_cart_total', { cart_id_param: cartId })
```

---

## 📊 Views

### Get Products with Deals
```typescript
const { data } = await supabase
  .from('products_with_deals')
  .select('*')
```

### Get Cart Details
```typescript
const { data } = await supabase
  .from('cart_details')
  .select('*')
  .eq('user_id', user.id)
```

---

## 🚀 Performance Tips

1. **Use select() with specific columns** instead of `*`
2. **Use views for complex queries** instead of joins in client
3. **Implement pagination** for large datasets
4. **Use indexes** (already set up in schema.sql)
5. **Cache frequently accessed data** (categories, etc.)

---

## 📱 Quick Commands

```bash
# Install Supabase
npm install @supabase/supabase-js

# Generate types
npx supabase gen types typescript --project-id YOUR_ID > src/types/database.types.ts

# Run setup script
node scripts/setup-supabase.js
```

---

**Keep this file handy for quick reference!**

For more details, see:
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- [supabase/README.md](./supabase/README.md)
- [Supabase Docs](https://supabase.com/docs)
