# Quick Migration Guide - Copy/Paste Code Snippets

This guide contains ready-to-use code snippets for completing the remaining migrations.

## Table of Contents
1. [Cart Page](#cart-page)
2. [Checkout Page](#checkout-page)
3. [Navbar Component](#navbar-component)
4. [Category Products](#category-products)
5. [Deals Pages](#deals-pages)
6. [Profile Pages](#profile-pages)

---

## Cart Page

### File: `src/pages/Cart.tsx`

**Full component structure:**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  getGuestCart, 
  getUserCart, 
  updateGuestCartItem,
  updateUserCartItem,
  removeFromGuestCart,
  removeFromUserCart,
  getProducts
} from '@/lib/supabase';

interface CartItem {
  cart_item_id?: number;
  product_id: number;
  product_title: string;
  product_image: string | null;
  quantity: number;
  size?: string | null;
  color?: string | null;
  unit_price: number;
  item_total: number;
}

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (user) {
        // Authenticated user
        const { items } = await getUserCart(user.id);
        setCartItems(items);
      } else {
        // Guest user
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          // Fetch product details for guest cart items
          const productIds = guestItems.map(item => item.product_id);
          const products = await getProducts({ limit: 100 });
          const productsMap = new Map(products.map(p => [p.id, p]));
          
          const enrichedItems = guestItems.map(item => {
            const product = productsMap.get(item.product_id);
            return {
              product_id: item.product_id,
              product_title: product?.title || 'Unknown Product',
              product_image: product?.image || null,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              unit_price: product?.price || 0,
              item_total: (product?.price || 0) * item.quantity,
            };
          });
          setCartItems(enrichedItems);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    try {
      if (user && item.cart_item_id) {
        await updateUserCartItem(item.cart_item_id, newQuantity);
      } else {
        updateGuestCartItem(item.product_id, newQuantity, item.size, item.color);
      }
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const handleRemove = async (item: CartItem) => {
    try {
      if (user && item.cart_item_id) {
        await removeFromUserCart(item.cart_item_id);
      } else {
        removeFromGuestCart(item.product_id, item.size, item.color);
      }
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.item_total, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="text-center py-10">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl mb-4">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-500 text-white px-6 py-2 rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="space-y-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
            <img 
              src={item.product_image || '/placeholder.png'} 
              alt={item.product_title}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.product_title}</h3>
              {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
              {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
              <p className="text-green-600 font-bold">Ksh {item.unit_price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                className="px-3 py-1 bg-gray-200 rounded"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="px-4">{item.quantity}</span>
              <button 
                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="font-bold">Ksh {item.item_total.toLocaleString()}</p>
              <button 
                onClick={() => handleRemove(item)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border rounded-lg">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>Ksh {calculateTotal().toLocaleString()}</span>
        </div>
        <button 
          onClick={handleCheckout}
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
```

---

## Checkout Page

### File: `src/pages/Checkout.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  createOrder, 
  getShippingAddresses, 
  getUserCart,
  getGuestCart,
  getProducts 
} from '@/lib/supabase';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch cart
      if (user) {
        const { items } = await getUserCart(user.id);
        setCartItems(items);
        
        // Fetch addresses
        const addrs = await getShippingAddresses(user.id);
        setAddresses(addrs);
        setSelectedAddressId(addrs.find(a => a.is_default)?.id || addrs[0]?.id);
      } else {
        const guestItems = getGuestCart();
        // Enrich with product details
        const products = await getProducts({ limit: 100 });
        const enriched = guestItems.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product: product,
            unit_price: product?.price || 0,
          };
        });
        setCartItems(enriched);
      }
    };
    fetchData();
  }, [user]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = user ? item.unit_price : item.unit_price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const shippingCost = 200; // Fixed for now, can be calculated
  const tax = 0;
  const total = calculateSubtotal() + shippingCost + tax;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        userId: user?.id,
        items: cartItems.map(item => ({
          productId: user ? item.product_id : item.product_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddressId: selectedAddressId,
        subtotal: calculateSubtotal(),
        shippingCost,
        tax,
      };

      const order = await createOrder(orderData);
      
      // Navigate to success page or order details
      alert(`Order ${order.order_number} placed successfully!`);
      navigate(`/orders/${order.order_number}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Cart Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item, idx) => (
          <div key={idx} className="flex justify-between py-2">
            <span>{user ? item.product_title : item.product?.title} x {item.quantity}</span>
            <span>Ksh {(item.unit_price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Shipping Address (for authenticated users) */}
      {user && addresses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          {addresses.map(addr => (
            <div 
              key={addr.id}
              className={`p-4 border rounded mb-2 cursor-pointer ${
                selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : ''
              }`}
              onClick={() => setSelectedAddressId(addr.id)}
            >
              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.country}</p>
              <p>{addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Guest user: collect phone and address */}
      {!user && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <input
            type="tel"
            placeholder="Phone Number (for M-Pesa)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
      )}

      {/* Order Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>Ksh {calculateSubtotal().toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>Shipping:</span>
          <span>Ksh {shippingCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-2 text-xl font-bold">
          <span>Total:</span>
          <span>Ksh {total.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading || (!user && !phoneNumber)}
        className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 disabled:bg-gray-400"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;
```

---

## Navbar Component

### File: `src/components/navigation/Navbar.tsx`

```typescript
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getGuestCart, getUserCart } from '@/lib/supabase';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        const { items } = await getUserCart(user.id);
        setCartCount(items.length);
      } else {
        const guestItems = getGuestCart();
        setCartCount(guestItems.length);
      }
    };
    fetchCartCount();
  }, [user]);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Moha Collection
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/cart" className="relative">
            <FaShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile / Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <img
                  src={user?.user_metadata?.image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </Link>
              <button 
                onClick={logout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm hover:underline">Sign In</Link>
              <span>/</span>
              <Link to="/register" className="text-sm hover:underline">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## Category Products

### File: `src/pages/CategoryProducts.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryBySlug, getProducts } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductsCard';

const CategoryProducts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!slug) return;
        const cat = await getCategoryBySlug(slug);
        setCategory(cat);
        
        const prods = await getProducts({ categoryId: cat.id });
        setProducts(prods);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{category.title}</h1>
      {category.description && <p className="mb-8">{category.description}</p>}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;
```

---

## Deals Pages

### File: `src/pages/DealsScreen.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveHolidayDeals } from '@/lib/supabase';

const DealsScreen = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveHolidayDeals().then(setDeals);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Active Deals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
          <div 
            key={deal.id}
            onClick={() => navigate(`/deals/${deal.slug || deal.id}`)}
            className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
          >
            {deal.banner_image && (
              <img src={deal.banner_image} alt={deal.name} className="w-full h-40 object-cover rounded" />
            )}
            <h3 className="text-xl font-semibold mt-2">{deal.name}</h3>
            <p className="text-green-600 font-bold">{deal.discount_percentage}% OFF</p>
            <p className="text-sm text-gray-600">{deal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsScreen;
```

### File: `src/pages/DealsDetailScreen.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHolidayDealBySlug } from '@/lib/supabase';
import ProductCard from '@/components/products/ProductsCard';

const DealsDetailScreen = () => {
  const { slug } = useParams();
  const [deal, setDeal] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      getHolidayDealBySlug(slug).then(setDeal);
    }
  }, [slug]);

  if (!deal) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{deal.name}</h1>
      <p className="text-xl text-green-600 font-bold mb-4">{deal.discount_percentage}% OFF</p>
      {deal.description && <p className="mb-8">{deal.description}</p>}
      
      <h2 className="text-2xl font-semibold mb-4">Deal Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {deal.product_deals?.map((pd: any) => (
          <ProductCard key={pd.product.id} product={pd.product} />
        ))}
      </div>
    </div>
  );
};

export default DealsDetailScreen;
```

---

## Profile Pages

### File: `src/pages/Profile.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    getProfile(user.id).then(prof => {
      setProfile(prof);
      setFormData({
        username: prof.username,
        full_name: prof.full_name || '',
        phone: prof.phone || '',
        bio: prof.bio || '',
      });
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile(user.id, formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Username</label>
          {editing ? (
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{profile.username}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">Full Name</label>
          {editing ? (
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{profile.full_name || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">Phone</label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{profile.phone || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">Bio</label>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
            />
          ) : (
            <p>{profile.bio || 'No bio yet'}</p>
          )}
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              Edit Profile
            </button>
          )}
        </div>

        <div className="pt-4 border-t">
          <button onClick={() => navigate('/orders')} className="text-blue-500 hover:underline">
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
```

### File: `src/components/profile/orders/Orders.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/supabase';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.id).then(setOrders);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id}
              onClick={() => navigate(`/orders/${order.order_number}`)}
              className="border p-4 rounded cursor-pointer hover:shadow-lg"
            >
              <div className="flex justify-between">
                <span className="font-semibold">Order #{order.order_number}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {order.order_items?.length} items • Ksh {order.total_amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
```

---

**That's it!** Copy and paste these snippets to complete your migration. Each snippet is ready to use with minimal adjustments needed.
