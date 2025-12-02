# Supabase Migration Checklist

## Phase 1: Setup ✅

- [x] Create Supabase project
- [x] Add environment variables to `.env.local`
- [x] Create database schema (`schema.sql`)
- [x] Create storage policies (`storage_policies.sql`)
- [x] Create seed data (`seed.sql`)
- [x] Create setup scripts

## Phase 2: Database Setup

- [ ] Run `schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created successfully
- [ ] Run `storage_policies.sql`
- [ ] Create storage buckets:
  - [ ] product-images
  - [ ] category-images
  - [ ] user-avatars
- [ ] Test storage upload/download
- [ ] Run `seed.sql` (optional)
- [ ] Verify sample data loaded

## Phase 3: Client Setup

- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create `src/lib/supabase.ts` client file
- [ ] Generate TypeScript types: `supabase gen types typescript`
- [ ] Test database connection from client

## Phase 4: Authentication Migration

- [ ] Create new `AuthContext` using Supabase Auth
- [ ] Update `SignIn.tsx` to use `supabase.auth.signInWithPassword()`
- [ ] Update `SignUp.tsx` to use `supabase.auth.signUp()`
- [ ] Implement session management
- [ ] Add protected route logic
- [ ] Test login/logout flow
- [ ] Remove old JWT token logic
- [ ] Remove Axios interceptors

## Phase 5: API Migrations

### Products
- [ ] Replace `/api/products/` with Supabase query
- [ ] Replace `/api/products/category/{id}` with filtered query
- [ ] Update `ProductsCarousel.tsx`
- [ ] Update `ProductCard.tsx`
- [ ] Test product listing

### Categories
- [ ] Replace `/api/categories/` with Supabase query
- [ ] Update `Home.tsx` categories fetch
- [ ] Test category listing

### Holiday Deals
- [ ] Replace `/api/holiday-deals/` with Supabase query
- [ ] Update deal filtering logic
- [ ] Test deals display

### Cart
- [ ] Create cart on user signup
- [ ] Replace `GET /api/cart/` with Supabase query
- [ ] Replace `POST /api/cart/` (add item) with Supabase insert
- [ ] Replace `PUT /api/cart/{id}` (update) with Supabase update
- [ ] Replace `DELETE /api/cart/{id}` with Supabase delete
- [ ] Use `cart_details` view for cart display
- [ ] Test cart operations

### Orders
- [ ] Replace `POST /api/orders/` with Supabase insert
- [ ] Replace `GET /api/user/orders/` with Supabase query
- [ ] Update order status flow
- [ ] Test order creation

### Profile
- [ ] Replace `GET /users/me/` with `supabase.auth.getUser()`
- [ ] Update profile data fetch
- [ ] Replace shipping addresses API
- [ ] Replace payment methods API
- [ ] Replace reviews API
- [ ] Test profile page

## Phase 6: Edge Functions (M-Pesa)

- [ ] Create `mpesa-stk-push` Edge Function
- [ ] Create `mpesa-callback` Edge Function
- [ ] Create `mpesa-query` Edge Function
- [ ] Configure M-Pesa credentials as secrets
- [ ] Deploy Edge Functions
- [ ] Update `mpesaModal.tsx` to use Edge Functions
- [ ] Test payment flow

## Phase 7: File Uploads

- [ ] Implement product image upload
- [ ] Implement category image upload
- [ ] Implement user avatar upload
- [ ] Add image optimization (optional)
- [ ] Test file uploads

## Phase 8: Real-time Features (Optional)

- [ ] Subscribe to cart changes
- [ ] Subscribe to order status updates
- [ ] Subscribe to notifications
- [ ] Test real-time updates

## Phase 9: Testing

- [ ] Test user registration
- [ ] Test user login/logout
- [ ] Test product browsing
- [ ] Test cart operations
- [ ] Test order creation
- [ ] Test payment flow
- [ ] Test profile updates
- [ ] Test RLS policies with different users
- [ ] Test error handling

## Phase 10: Optimization

- [ ] Add database indexes
- [ ] Optimize queries with proper joins
- [ ] Implement pagination
- [ ] Add caching where appropriate
- [ ] Test performance
- [ ] Monitor database usage

## Phase 11: Cleanup

- [ ] Remove old `api.ts` Axios instance
- [ ] Remove unused Django API endpoints
- [ ] Update documentation
- [ ] Remove old token management code
- [ ] Clean up unused imports

## Phase 12: Deployment

- [ ] Update environment variables for production
- [ ] Test in production environment
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Set up alerts

## Rollback Plan

If issues arise during migration:

1. Keep Django API running alongside Supabase
2. Feature flag new Supabase code
3. Test both systems in parallel
4. Gradual migration of features
5. Quick rollback if needed

## Notes

- Keep Django API running during migration for fallback
- Test each phase thoroughly before moving to next
- Use feature flags for gradual rollout
- Monitor error logs closely
- Have backup strategy ready

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Migration Guide](https://supabase.com/docs/guides/getting-started)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**Started**: ___/___/___  
**Completed**: ___/___/___  
**By**: _______________
