# Supabase Migration Status

## ✅ Completed Migrations

### 1. Core Infrastructure
- **src/lib/supabase.ts** - ✅ Complete
  - Comprehensive helper functions for all operations
  - Guest cart support (localStorage)
  - Authenticated cart support (database)
  - Product, category, order, profile helpers
  - Authentication helpers

- **src/types/database.types.ts** - ✅ Complete
  - Full TypeScript types for all tables
  - Complete database schema types

- **src/context/AuthContext.tsx** - ✅ Complete
  - Supabase authentication
  - Session management
  - Guest cart merging on login
  - Loading states

- **src/pages/SignIn.tsx** - ✅ Complete
  - Uses Supabase auth
  - Proper error handling

- **src/pages/SignUp.tsx** - ✅ Complete
  - Uses Supabase auth
  - Email confirmation support

- **src/pages/Home.tsx** - ✅ Complete
  - Fetches from Supabase
  - Removed authentication requirement (accessible to guests)
  - Uses getCategories() and getActiveHolidayDeals()

- **src/components/products/ProductsCarousel.tsx** - ✅ Complete
  - Uses getProducts() from Supabase
  - Supports featured, categoryId, limit props

## ⏳ Remaining Work

### High Priority

#### 1. ProductCard Component (/src/components/products/ProductsCard.tsx)
**Current State**: Uses Django API  
**Action Needed**:
```typescript
// Update interface to match Supabase structure
interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number | null;
  image: string | null;
  description: string | null;
  specifications: string | null;
  type: string | null;
  stock_count: number;
  slug: string | null;
  featured: boolean;
  category: {
    id: number;
    title: string;
    slug: string | null;
  } | null;
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
    display_order: number;
  }>;
}

// Replace handleAddToCart function:
import { addToGuestCart, addToUserCart } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();

const handleAddToCart = async () => {
  setFetchDisabled(true);
  try {
    if (user) {
      await addToUserCart(user.id, {
        productId: product.id,
        quantity: 1,
      });
    } else {
      addToGuestCart({
        product_id: product.id,
        quantity: 1,
      });
    }
    // Show success message
  } catch (err: any) {
    console.error('Error adding to cart:', err);
  } finally {
    setTimeout(() => setFetchDisabled(false), 2000);
  }
};

// Update image rendering to use images array:
{product.images && product.images.length > 0 ? (
  <img
    src={product.images.find(img => img.is_primary)?.image || product.images[0].image}
    alt={product.title}
    className="w-full h-full object-cover"
  />
) : product.image ? (
  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center text-gray-500">
    No image available
  </div>
)}

// Update carousel to use product.images array instead of additional_images
```

#### 2. Cart Page (/src/pages/Cart.tsx)
**Current State**: Uses Django API  
**Action Needed**:
```typescript
import { 
  getGuestCart, 
  getUserCart, 
  updateGuestCartItem,
  updateUserCartItem,
  removeFromGuestCart,
  removeFromUserCart 
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [cartItems, setCartItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCart = async () => {
    try {
      if (user) {
        const { items } = await getUserCart(user.id);
        setCartItems(items); // items already include product details from cart_details view
      } else {
        const guestItems = getGuestCart();
        // Fetch product details for guest items
        const productsData = await Promise.all(
          guestItems.map(item => getProducts({ filters: { id: item.product_id }}))
        );
        setCartItems(guestItems.map((item, idx) => ({
          ...item,
          product: productsData[idx][0]
        })));
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchCart();
}, [user]);

// Update quantity
const handleUpdateQuantity = async (itemId, newQuantity) => {
  if (user) {
    await updateUserCartItem(itemId, newQuantity);
  } else {
    updateGuestCartItem(itemId, newQuantity);
  }
  // Refresh cart
};

// Remove item
const handleRemove = async (itemId) => {
  if (user) {
    await removeFromUserCart(itemId);
  } else {
    removeFromGuestCart(itemId);
  }
  // Refresh cart
};
```

#### 3. Checkout Page (/src/pages/Checkout.tsx)
**Current State**: Uses Django API  
**Action Needed**:
```typescript
import { createOrder, getShippingAddresses } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [shippingAddresses, setShippingAddresses] = useState([]);

// Fetch shipping addresses (only for authenticated users)
useEffect(() => {
  if (user) {
    getShippingAddresses(user.id).then(setShippingAddresses);
  }
}, [user]);

// Handle order creation
const handlePlaceOrder = async () => {
  try {
    const order = await createOrder({
      userId: user?.id, // Can be undefined for guest orders
      items: cartItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddressId: selectedAddressId,
      paymentMethodId: selectedPaymentId,
      notes: orderNotes,
      subtotal: calculateSubtotal(),
      shippingCost: 200, // Or calculate based on location
      tax: 0,
      discount: 0,
    });
    
    // Navigate to order confirmation or payment
    navigate(`/orders/${order.order_number}`);
  } catch (err) {
    console.error('Error creating order:', err);
  }
};
```

#### 4. Category Products Page (/src/pages/CategoryProducts.tsx)
**Current State**: Uses Django API  
**Action Needed**:
```typescript
import { getCategoryBySlug, getProducts } from '@/lib/supabase';

const { slug } = useParams();
const [category, setCategory] = useState(null);
const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const cat = await getCategoryBySlug(slug);
    setCategory(cat);
    
    const prods = await getProducts({ categoryId: cat.id });
    setProducts(prods);
  };
  fetchData();
}, [slug]);
```

#### 5. Deals Pages
**DealsScreen.tsx**:
```typescript
import { getActiveHolidayDeals } from '@/lib/supabase';

const [deals, setDeals] = useState([]);
useEffect(() => {
  getActiveHolidayDeals().then(setDeals);
}, []);
```

**DealsDetailScreen.tsx**:
```typescript
import { getHolidayDealBySlug } from '@/lib/supabase';

const { slug } = useParams();
const [deal, setDeal] = useState(null);

useEffect(() => {
  getHolidayDealBySlug(slug).then(setDeal);
}, [slug]);
```

#### 6. Profile Pages

**Profile.tsx**:
```typescript
import { getProfile, updateProfile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [profile, setProfile] = useState(null);

useEffect(() => {
  if (user) {
    getProfile(user.id).then(setProfile);
  }
}, [user]);
```

**Orders.tsx**:
```typescript
import { getUserOrders } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [orders, setOrders] = useState([]);

useEffect(() => {
  if (user) {
    getUserOrders(user.id).then(setOrders);
  }
}, [user]);
```

**OrderDetails.tsx**:
```typescript
import { getOrderByNumber } from '@/lib/supabase';

const { orderNumber } = useParams();
const [order, setOrder] = useState(null);

useEffect(() => {
  getOrderByNumber(orderNumber).then(setOrder);
}, [orderNumber]);
```

**ShippingAddressScreen.tsx**:
```typescript
import { getShippingAddresses, createShippingAddress } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [addresses, setAddresses] = useState([]);

useEffect(() => {
  if (user) {
    getShippingAddresses(user.id).then(setAddresses);
  }
}, [user]);
```

**PaymentMethodScreen.tsx**:
```typescript
import { getPaymentMethods } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const [methods, setMethods] = useState([]);

useEffect(() => {
  if (user) {
    getPaymentMethods(user.id).then(setMethods);
  }
}, [user]);
```

**Reviews.tsx**:
```typescript
import { getProductReviews, createReview } from '@/lib/supabase';

const [reviews, setReviews] = useState([]);

useEffect(() => {
  getProductReviews(productId).then(setReviews);
}, [productId]);
```

#### 7. Navbar Component (/src/components/navigation/Navbar.tsx)
**Action Needed**:
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, logout } = useAuth();

// Update profile link to use user data
{isAuthenticated && (
  <Link to="/profile">
    <img 
      src={user?.user_metadata?.image || '/default-avatar.png'} 
      alt="Profile" 
      className="w-8 h-8 rounded-full"
    />
  </Link>
)}
```

#### 8. M-Pesa Payment Modal (/src/components/paymentModal/mpesaModal.tsx)
**Action Needed**:
- Create a Supabase Edge Function for M-Pesa STK Push
- Update the modal to call the Edge Function
- Store payment status in checkout_sessions table

```typescript
// Edge Function needed: supabase/functions/mpesa-payment/index.ts
// Call it from the modal:
const response = await supabase.functions.invoke('mpesa-payment', {
  body: {
    amount: totalAmount,
    phone: phoneNumber,
    order_id: orderId,
  }
});
```

### Low Priority

#### 9. Remove Old API File (/src/api.ts)
**Action**: Delete or comment out the entire file once all migrations are complete.

#### 10. Categories Component (/src/components/categories/Categories.tsx)
Check if it uses API calls and migrate to Supabase.

## Testing Checklist

Once migrations are complete, test the following:

- [ ] User registration (with and without email confirmation)
- [ ] User login
- [ ] Browse products as guest
- [ ] Add to cart as guest
- [ ] Login and verify guest cart merges
- [ ] Add to cart as authenticated user
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Browse by category
- [ ] View holiday deals
- [ ] Place order as authenticated user
- [ ] Place order as guest (if supported)
- [ ] View order history
- [ ] Update profile
- [ ] Add shipping address
- [ ] View product reviews
- [ ] M-Pesa payment flow

## Database Setup Required

Before testing, ensure you've:

1. Run `schema.sql` in Supabase SQL Editor
2. Run `storage_policies.sql` to set up storage buckets
3. Run `seed.sql` to populate test data
4. Configure email templates in Supabase Auth settings
5. Set up proper RLS policies (already in schema.sql)
6. Create storage buckets: `product-images`, `category-images`, `user-avatars`

## Environment Variables

Ensure `.env.local` has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps

1. Update ProductCard component (High Priority)
2. Update Cart page (High Priority)
3. Update Checkout page (High Priority)
4. Update remaining product pages
5. Update profile pages
6. Update Navbar
7. Create M-Pesa Edge Function
8. Test entire flow
9. Remove old API file

## Notes

- All Supabase helper functions are ready in `src/lib/supabase.ts`
- Guest cart uses localStorage with automatic merging on login
- RLS policies in database ensure data security
- Use `cart_details` view for efficient cart display (avoids N+1 queries)
