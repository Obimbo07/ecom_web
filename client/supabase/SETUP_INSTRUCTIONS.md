# Supabase Storage Setup Instructions

## Overview
This guide will help you set up all required storage buckets and their Row Level Security (RLS) policies for the e-commerce application.

## Required Storage Buckets

Your application needs **4 storage buckets**:
1. **product-images** - For product photos
2. **category-images** - For category thumbnails
3. **user-avatars** - For user profile pictures  
4. **deals** - For holiday deals and promotional images

---

## Option 1: Quick Setup via Supabase Dashboard (Recommended)

### Step 1: Create Buckets

1. Go to your Supabase project dashboard
2. Navigate to **Storage** from the left sidebar
3. Click **"New Bucket"** for each of the following:

#### Bucket 1: product-images
- **Name:** `product-images`
- **Public:** ✅ Yes (checked)
- **File size limit:** 5MB (5242880 bytes)
- **Allowed MIME types:** image/png, image/jpeg, image/webp, image/avif
- Click **"Create Bucket"**

#### Bucket 2: category-images
- **Name:** `category-images`
- **Public:** ✅ Yes (checked)
- **File size limit:** 2MB (2097152 bytes)
- **Allowed MIME types:** image/png, image/jpeg, image/webp
- Click **"Create Bucket"**

#### Bucket 3: user-avatars
- **Name:** `user-avatars`
- **Public:** ✅ Yes (checked)
- **File size limit:** 2MB (2097152 bytes)
- **Allowed MIME types:** image/png, image/jpeg, image/webp
- Click **"Create Bucket"**

#### Bucket 4: deals
- **Name:** `deals`
- **Public:** ✅ Yes (checked)
- **File size limit:** 3MB (3145728 bytes)
- **Allowed MIME types:** image/png, image/jpeg, image/webp, image/avif
- Click **"Create Bucket"**

### Step 2: Apply RLS Policies

1. Navigate to **SQL Editor** from the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `storage_policies.sql`
4. Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
5. Verify all policies were created successfully (you should see success messages)

---

## Option 2: SQL Editor Only

If you prefer to create everything via SQL:

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Open and run `create_deals_bucket.sql` first (creates the deals bucket)
3. Then run `storage_policies.sql` (creates all policies)

---

## Verify Setup

### Check Buckets
1. Go to **Storage** in dashboard
2. You should see all 4 buckets listed:
   - product-images
   - category-images
   - user-avatars
   - deals

### Check Policies
Run this query in SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' ORDER BY policyname;
```

You should see policies for:
- Product images (4 policies: SELECT, INSERT, UPDATE, DELETE)
- Category images (4 policies)
- User avatars (4 policies)
- Deals (4 policies)

**Total: 16 policies**

---

## Testing Upload

### Test via Application
1. Start your development server: `npm run dev`
2. Sign in as admin
3. Navigate to **Admin Panel** → **Holiday Deals**
4. Try creating a new deal with an image
5. If upload succeeds, the deals bucket is working!

### Test via Console
Open browser console and run:
```javascript
const supabase = // your supabase client

const testUpload = async () => {
  // Create a test file
  const blob = new Blob(['test'], { type: 'image/png' })
  const file = new File([blob], 'test.png', { type: 'image/png' })
  
  // Try uploading to deals bucket
  const { data, error } = await supabase.storage
    .from('deals')
    .upload('test-' + Date.now() + '.png', file)
  
  if (error) {
    console.error('Upload failed:', error)
  } else {
    console.log('Upload successful:', data)
  }
}

testUpload()
```

---

## Troubleshooting

### Error: "Bucket does not exist"
- **Solution:** Create the bucket via Dashboard → Storage → New Bucket

### Error: "new row violates row-level security policy"
- **Solution:** Run the policies from `storage_policies.sql` in SQL Editor

### Error: "Could not find relationship"
- **Solution:** This is unrelated to storage. Check your database foreign keys.

### Images not showing
- **Check:** Are buckets set to **Public**?
- **Check:** Do RLS policies allow SELECT (read) access?
- **Fix:** Go to Storage → Click bucket → Configuration → Make sure "Public" is enabled

### Upload fails silently
- **Check:** File size limits
- **Check:** MIME type restrictions
- **Check:** Network tab in browser DevTools for actual error
- **Check:** Authentication (user must be logged in for uploads)

---

## Security Notes

### Current Setup (Development)
- All authenticated users can upload/modify files
- This is fine for development and testing

### Production Recommendations
Replace `auth.role() = 'authenticated'` with `auth.jwt() ->> 'role' = 'admin'` in policies to restrict uploads to admins only:

```sql
-- Example: Admin-only upload policy for deals
CREATE POLICY "Only admins can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deals' 
  AND auth.jwt() ->> 'role' = 'admin'
);
```

### User Avatars
User-avatars bucket policies already restrict users to only modify their own files:
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

This ensures users can only upload/edit/delete files in their own folder.

---

## File Organization

### Recommended Folder Structure

**product-images:**
```
product-images/
  └── products/
      ├── 1-timestamp.png
      ├── 2-timestamp.jpg
      └── ...
```

**category-images:**
```
category-images/
  ├── category-1-timestamp.png
  ├── category-2-timestamp.webp
  └── ...
```

**user-avatars:**
```
user-avatars/
  └── {user_id}/
      └── timestamp.png
```

**deals:**
```
deals/
  ├── deal-timestamp-name.png
  └── ...
```

---

## Need Help?

1. Check Supabase docs: https://supabase.com/docs/guides/storage
2. Verify policies are created: Run the SELECT query from "Verify Setup" section
3. Check browser console for upload errors
4. Check Supabase project logs: Dashboard → Logs → Storage logs

---

## Summary

✅ **4 buckets to create**: product-images, category-images, user-avatars, deals  
✅ **1 SQL file to run**: `storage_policies.sql` (or `create_deals_bucket.sql` if bucket creation via SQL)  
✅ **16 RLS policies**: 4 per bucket (SELECT, INSERT, UPDATE, DELETE)  
✅ **All buckets public**: Yes, for serving images to website visitors  
✅ **Upload restriction**: Only authenticated users (adjust for production)

**You're all set! 🎉**
