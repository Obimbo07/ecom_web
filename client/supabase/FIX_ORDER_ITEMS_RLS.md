# Fix Order Items RLS Policy Error

## Problem
You're getting this error: **"new row violates row-level security policy for table 'order_items'"**

This happens because the `order_items` table doesn't have INSERT policies set up, so users cannot create order items even though they can create orders.

## Solution

You need to apply the RLS policies for the `order_items` table. Here's how:

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://rozrpvhkqwqtowrlrikt.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Add INSERT policy for order_items
-- Users can insert order items for their own orders
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Add UPDATE policy for order_items
-- Users can update order items in their own orders
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

-- Add DELETE policy for order_items
-- Users can delete order items from their own orders
CREATE POLICY "Users can delete own order items"
  ON order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Option 2: Using Migration File

The migration file is already created at:
`client/supabase/migrations/add_order_items_policies.sql`

### What These Policies Do

1. **INSERT Policy**: Allows users to insert order items for orders they own (or guest orders where user_id is NULL)
2. **UPDATE Policy**: Allows users to update order items in their own orders
3. **DELETE Policy**: Allows users to delete order items from their own orders

### After Applying

Once you run the SQL, try creating an order again. The error should be resolved and orders will be created successfully!

### Verify It Worked

After applying the policies, you can verify they exist by running:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'order_items';
```

You should see 4 policies:
- Users can view own order items (SELECT)
- Users can insert own order items (INSERT)
- Users can update own order items (UPDATE)
- Users can delete own order items (DELETE)
