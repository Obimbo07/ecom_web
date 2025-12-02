# Category Images Not Showing - Fix Guide

## Problem
Category images are not displaying in the categories management page even though upload works.

## Root Cause
The `category-images` storage bucket might be missing or improperly configured in Supabase.

## Solution Steps

### Step 1: Check if Bucket Exists

1. Open **Supabase Dashboard** → **Storage**
2. Look for a bucket called **`category-images`**

### Step 2: If Bucket DOESN'T Exist

Run the SQL file we created:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `create_category_images_bucket.sql`
3. Click **"Run"**
4. You should see success messages for bucket creation and 4 RLS policies

### Step 3: If Bucket EXISTS

Check if RLS policies are configured:

1. Go to **Storage** → **category-images** → **Policies** tab
2. You should see 4 policies:
   - ✅ **Public can view category images** (SELECT)
   - ✅ **Authenticated users can upload category images** (INSERT)
   - ✅ **Authenticated users can update category images** (UPDATE)
   - ✅ **Authenticated users can delete category images** (DELETE)

3. If any are missing, run the corresponding policy from `create_category_images_bucket.sql`

### Step 4: Verify Configuration

Run this query in SQL Editor to check bucket settings:

```sql
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'category-images';
```

Expected result:
- **id**: `category-images`
- **public**: `true` ✅
- **file_size_limit**: `3145728` (3MB)
- **allowed_mime_types**: `{image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif}`

### Step 5: Check Existing Images

Run this to see if any images are already in the bucket:

```sql
SELECT 
  name, 
  created_at, 
  updated_at,
  metadata->>'size' as size_bytes
FROM storage.objects 
WHERE bucket_id = 'category-images'
ORDER BY created_at DESC
LIMIT 10;
```

### Step 6: Test Upload & Display

1. Go to **Admin Dashboard** → **Categories Management**
2. Create or edit a category
3. Upload an image
4. **Check the URL format** - it should look like:
   ```
   https://[your-project].supabase.co/storage/v1/object/public/category-images/category-[timestamp]-[filename]
   ```
5. Try accessing the URL directly in your browser
6. If you get 404 or Access Denied, the bucket or policies need fixing

### Step 7: Check Database Values

Run this to see what URLs are stored:

```sql
SELECT 
  id,
  title,
  image,
  created_at
FROM categories
WHERE image IS NOT NULL
ORDER BY created_at DESC;
```

## Common Issues & Fixes

### Issue 1: "Bucket not found" Error
**Fix**: Run `create_category_images_bucket.sql`

### Issue 2: Upload Works but 403 Forbidden on Display
**Fix**: 
- Bucket is not public. Run:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'category-images';
```

### Issue 3: Upload Fails with Permission Error
**Fix**: RLS INSERT policy is missing. Run the INSERT policy from `create_category_images_bucket.sql`

### Issue 4: Images Show Broken Link
**Possible causes**:
1. Image URL is malformed (check database)
2. File was deleted from storage
3. Wrong bucket name in upload code
4. CORS issue (check browser console)

**Fix**: Check browser DevTools Network tab for actual error (404, 403, CORS, etc.)

### Issue 5: Old Categories Don't Have Images
This is normal if categories were created before the image field was added. Re-upload images for these categories.

## Verification Checklist

After applying fixes:

- [ ] Bucket `category-images` exists
- [ ] Bucket is PUBLIC
- [ ] 4 RLS policies are active
- [ ] Can upload image via admin panel
- [ ] Image URL is stored in database
- [ ] Image displays in categories list
- [ ] Direct URL access works
- [ ] No errors in browser console

## Still Not Working?

If images still don't show after all these steps:

1. **Check Browser Console** (F12) for errors
2. **Check Network Tab** - Look for failed image requests
3. **Verify the uploadFile function** in `supabase.ts`:
   ```typescript
   export const uploadFile = async (bucket: string, path: string, file: File) => {
     const { data, error } = await supabase.storage
       .from(bucket)  // Should be 'category-images'
       .upload(path, file, { upsert: true })
     
     if (error) throw error
     
     // Get public URL
     const { data: { publicUrl } } = supabase.storage
       .from(bucket)
       .getPublicUrl(path)
     
     return publicUrl
   }
   ```

4. **Check if category.image field** in the component is correctly accessing the URL
5. **Verify img tag** has correct src attribute

## Need More Help?

Share:
1. Browser console errors
2. Network tab screenshot (failed requests)
3. Result of bucket verification query
4. Example category object from database (with image URL)
