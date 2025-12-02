# Supabase Setup Guide for Moha Fashion Collection

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Supabase CLI installed (optional but recommended)
- Node.js 18+ installed
- PostgreSQL client (optional for direct database access)

## Quick Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Create a new project (or use existing: `cwugrtwndvaawxoivmgz`)
3. Wait for project initialization (~2 minutes)
4. Note down your:
   - Project URL: `https://cwugrtwndvaawxoivmgz.supabase.co`
   - Anon Key: (from Settings > API)
   - Service Role Key: (from Settings > API) - Keep this secret!

### Step 2: Update Environment Variables

Your `.env.local` file already has the credentials:

```bash
VITE_SUPABASE_URL=https://cwugrtwndvaawxoivmgz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**DO NOT commit `.env.local` to git!**

### Step 3: Run Database Schema

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `supabase/schema.sql`
5. Paste and click **Run**
6. Wait for completion (~30-60 seconds)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cwugrtwndvaawxoivmgz

# Run migrations
supabase db push supabase/schema.sql
```

### Step 4: Set Up Storage Buckets

#### Create Buckets in Dashboard

1. Go to **Storage** in Supabase dashboard
2. Click **Create Bucket** for each:
   - **product-images** (Public, 5MB limit)
   - **category-images** (Public, 2MB limit)
   - **user-avatars** (Public, 2MB limit)

3. For each bucket, configure:
   - **File size limit**: See limits above
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp`
   - **Public**: ✅ Enable

#### Apply Storage Policies

1. Go to **SQL Editor**
2. Copy contents of `supabase/storage_policies.sql`
3. Paste and **Run**

### Step 5: Load Sample Data (Optional)

1. Go to **SQL Editor**
2. Copy contents of `supabase/seed.sql`
3. Paste and **Run**
4. This will create:
   - 6 categories
   - 12 sample products
   - 3 holiday deals
   - 10 tags
   - 3 promocodes

### Step 6: Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable Email provider (should be enabled by default)
3. Optional: Enable Google/Facebook OAuth
   - Google: Add OAuth credentials
   - Facebook: Add App ID and Secret

4. Configure Email Templates:
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation, reset password emails

5. Set Auth Policies:
   - Go to **Authentication** > **Policies**
   - Enable email confirmation: ✅ (recommended)
   - Password requirements: 8+ characters

### Step 7: Install Supabase Client

In your client project:

```bash
npm install @supabase/supabase-js
```

### Step 8: Create Supabase Client File

Already configured in `.env.local`. Create the client:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Verification Steps

### Test Database Connection

```sql
-- Run in SQL Editor
SELECT 
  'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;
```

### Test RLS Policies

1. Create a test user via Authentication > Users
2. Try to query protected tables using that user's session
3. Verify policies work as expected

### Test Storage

1. Go to Storage > product-images
2. Upload a test image
3. Verify it's publicly accessible
4. Try to access the public URL

## Edge Functions Setup (for M-Pesa)

### Create M-Pesa STK Push Function

```bash
# Create function
supabase functions new mpesa-stk-push

# Deploy function
supabase functions deploy mpesa-stk-push --no-verify-jwt
```

**Note**: Edge function setup is covered in separate documentation.

## Troubleshooting

### Issue: Schema fails to run

**Solution**: Run schema in smaller chunks:
1. Run table creation first (lines 1-500)
2. Then RLS policies (lines 501-800)
3. Finally, functions and triggers (lines 801+)

### Issue: RLS policies block queries

**Solution**: 
- Ensure user is authenticated
- Check policy conditions match your query
- Use service role key for admin operations (be careful!)

### Issue: Storage upload fails

**Solution**:
- Verify bucket exists and is public
- Check file size is under limit
- Verify MIME type is allowed
- Check storage policies are applied

### Issue: "relation does not exist" error

**Solution**:
- Verify schema.sql ran completely
- Check for typos in table names
- Ensure you're in the correct schema (public)

## Next Steps

1. ✅ Set up database schema
2. ✅ Configure storage buckets
3. ✅ Load sample data
4. ⬜ Create Supabase client in React app
5. ⬜ Replace Axios calls with Supabase queries
6. ⬜ Implement authentication with Supabase Auth
7. ⬜ Test cart functionality
8. ⬜ Deploy Edge Functions for M-Pesa

## Useful Commands

```bash
# Supabase CLI commands

# Check project status
supabase status

# View database logs
supabase db logs

# Generate TypeScript types from database
supabase gen types typescript --project-id cwugrtwndvaawxoivmgz > src/types/database.types.ts

# Reset database (⚠️ DANGER: Deletes all data)
supabase db reset

# Create migration
supabase migration new migration_name

# Run migrations
supabase db push
```

## Security Best Practices

1. **Never expose service role key** in client code
2. **Always use RLS policies** for data access
3. **Validate user input** before inserting to database
4. **Use prepared statements** to prevent SQL injection
5. **Enable MFA** for admin accounts
6. **Regularly rotate API keys**
7. **Monitor auth logs** for suspicious activity

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## Support

If you encounter issues:
1. Check Supabase [Community Forum](https://github.com/supabase/supabase/discussions)
2. Review [GitHub Issues](https://github.com/supabase/supabase/issues)
3. Contact Supabase Support (Pro plan required)

---

**Last Updated**: November 30, 2025  
**Schema Version**: 1.0  
**Project**: Moha Fashion Collection
