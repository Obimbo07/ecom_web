#!/bin/bash

# Apply order_items RLS policies migration
# Run this script to add INSERT, UPDATE, and DELETE policies for order_items table

echo "Applying order_items RLS policies..."

# Read your Supabase credentials
SUPABASE_URL="https://rozrpvhkqwqtowrlrikt.supabase.co"
SUPABASE_SERVICE_KEY="your_service_role_key_here"

# Apply the migration using psql or Supabase SQL Editor
cat migrations/add_order_items_policies.sql

echo ""
echo "=================================="
echo "Copy the SQL above and run it in your Supabase SQL Editor:"
echo "1. Go to: $SUPABASE_URL/project/default/sql/new"
echo "2. Paste the SQL from above"
echo "3. Click 'Run'"
echo "=================================="
