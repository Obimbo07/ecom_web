# 🚀 Quick Start Guide - Supabase Migration

Get your Moha Fashion Collection e-commerce platform running on Supabase in under 30 minutes!

## Prerequisites

- ✅ Supabase account ([sign up here](https://supabase.com))
- ✅ Node.js 18+ installed
- ✅ This project cloned locally

## Step-by-Step Setup

### 1️⃣ Create Supabase Project (5 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: `moha-fashion-collection`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to Kenya (e.g., `ap-southeast-1`)
4. Click **Create new project**
5. Wait ~2 minutes for provisioning

### 2️⃣ Get Your API Keys (2 minutes)

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhbG...`
3. Update `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### 3️⃣ Create Database Schema (5 minutes)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `client/supabase/schema.sql` in your code editor
4. Copy ALL contents (it's ~1000 lines)
5. Paste into SQL Editor
6. Click **Run** (bottom right)
7. Wait for "Success" message

**What this does:**
- Creates 20+ tables (products, orders, cart, etc.)
- Sets up Row Level Security policies
- Creates helper functions and triggers
- Adds database indexes

### 4️⃣ Create Storage Buckets (3 minutes)

1. In Supabase dashboard, click **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Create three buckets:

   **Bucket 1: product-images**
   - Name: `product-images`
   - Public: ✅ Yes
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/png, image/jpeg, image/webp`
   
   **Bucket 2: category-images**
   - Name: `category-images`
   - Public: ✅ Yes
   - File size limit: `2097152` (2MB)
   - Allowed MIME types: `image/png, image/jpeg, image/webp`
   
   **Bucket 3: user-avatars**
   - Name: `user-avatars`
   - Public: ✅ Yes
   - File size limit: `2097152` (2MB)
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

### 5️⃣ Apply Storage Policies (2 minutes)

1. Back in **SQL Editor**
2. Click **New Query**
3. Open `client/supabase/storage_policies.sql`
4. Copy and paste contents
5. Click **Run**

### 6️⃣ Load Sample Data (3 minutes) - Optional

1. In **SQL Editor**, click **New Query**
2. Open `client/supabase/seed.sql`
3. Copy and paste contents
4. Click **Run**

**This creates:**
- 6 sample categories
- 12 sample products
- 3 holiday deals
- Sample promocodes

### 7️⃣ Install Dependencies (2 minutes)

```bash
cd client
npm install @supabase/supabase-js
```

### 8️⃣ Verify Setup (3 minutes)

Run this query in SQL Editor to check everything:

```sql
SELECT 
  'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Carts', COUNT(*) FROM carts
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;
```

You should see:
- Categories: 6 (if you ran seed.sql)
- Products: 12 (if you ran seed.sql)
- Carts: 0
- Orders: 0

### 9️⃣ Test Authentication (3 minutes)

1. Go to **Authentication** > **Users** in Supabase
2. Click **Add user** > **Create new user**
3. Fill in:
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Auto-confirm email: ✅ Yes
4. Click **Create user**

Now test login in your app!

### 🔟 Run the App (2 minutes)

```bash
npm run dev
```

Visit http://localhost:5173 and try:
- ✅ Sign up with a new account
- ✅ Browse products
- ✅ Add items to cart

## What's Next?

Now that setup is complete, you can start migrating the app to use Supabase:

### Phase 1: Update Authentication (Day 1)

Replace the old Django auth with Supabase Auth:

**File: `src/context/AuthContext.tsx`**
```typescript
import { supabase } from '@/lib/supabase'

// Replace login function
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  setIsAuthenticated(true)
}

// Replace register function
const register = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: email.split('@')[0] }
    }
  })
  if (error) throw error
}
```

### Phase 2: Update Product Listing (Day 2)

**File: `src/pages/Home.tsx`**
```typescript
import { supabase } from '@/lib/supabase'

// Replace API call
const fetchProducts = async () => {
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
    .limit(5)
  
  if (error) throw error
  setProducts(data)
}
```

### Phase 3: Update Cart (Day 3)

**File: `src/pages/Cart.tsx`**
```typescript
// Fetch cart with details view
const { data: cartItems } = await supabase
  .from('cart_details')
  .select('*')
  .eq('user_id', user.id)
```

## Troubleshooting

### ❌ "relation does not exist" error
**Solution**: Make sure you ran `schema.sql` completely

### ❌ "JWT expired" or auth errors
**Solution**: Check that your `.env.local` has correct keys

### ❌ Can't upload images
**Solution**: 
1. Verify buckets exist in Storage
2. Check `storage_policies.sql` was run
3. Ensure bucket is marked as **Public**

### ❌ RLS policy blocks data access
**Solution**: 
1. Make sure user is authenticated
2. Check policy conditions in `schema.sql`
3. Temporarily disable RLS for debugging (not in production!)

### ❌ Can't see inserted data
**Solution**: Check if table has RLS enabled. You may need to query as the actual user.

## Useful Commands

```bash
# Generate TypeScript types from your database
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.types.ts

# Check Supabase status
npx supabase status

# View database logs
npx supabase db logs
```

## Resources

- 📖 [Full Project Overview](./PROJECT_OVERVIEW.md)
- ✅ [Migration Checklist](./MIGRATION_CHECKLIST.md)
- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Community Forum](https://github.com/supabase/supabase/discussions)

## Need Help?

1. Check `supabase/README.md` for detailed setup
2. Review `PROJECT_OVERVIEW.md` for architecture
3. Follow `MIGRATION_CHECKLIST.md` step by step
4. Ask in Supabase Discord or GitHub Discussions

## Success! 🎉

You now have:
- ✅ Supabase project configured
- ✅ Database schema created
- ✅ Storage buckets set up
- ✅ Sample data loaded
- ✅ Authentication working
- ✅ Ready to migrate API calls

Time to start building! Follow the migration checklist to replace Django API calls with Supabase queries.

---

**Questions?** Open an issue or check the documentation in `supabase/README.md`
