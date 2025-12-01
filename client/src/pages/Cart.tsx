import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  getUserCart, 
  updateUserCartItem, 
  removeFromUserCart,
  getGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  createOrder
} from '@/lib/supabase';

// Define interfaces based on Supabase schema
interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  size: string | null;
  color: string | null;
  product_title?: string;
  product_price?: number;
  product_image?: string;
}

interface GuestCartItem {
  product_id: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user) {
        // Fetch user cart from Supabase
        const { items } = await getUserCart(user.id);
        setCartItems(items as CartItem[]);
      } else {
        // Fetch guest cart from localStorage
        const guestCart = getGuestCart();
        
        // Fetch product details for each guest cart item
        const { getProducts } = await import('@/lib/supabase');
        const products = await getProducts({});
        
        const itemsWithDetails = guestCart.map((item: GuestCartItem) => {
          const product = products?.find((p: any) => p.id === item.product_id) as any;
          return {
            id: item.product_id, // Use product_id as temporary id for guest cart
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
            product_title: product?.title || 'Unknown Product',
            product_price: product?.price || 0,
            product_image: product?.images?.[0]?.image || product?.image || null,
          };
        });
        
        setCartItems(itemsWithDetails);
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Update cart item (quantity)
  const updateCartItem = async (cartItemId: number, quantityDelta?: number) => {
    try {
      setMessage(null);
      
      if (user) {
        // Update user cart
        const item = cartItems.find(i => i.id === cartItemId);
        if (!item) return;
        
        const newQuantity = quantityDelta !== undefined ? item.quantity + quantityDelta : item.quantity;
        
        if (newQuantity <= 0) {
          await removeFromUserCart(cartItemId);
        } else {
          await updateUserCartItem(cartItemId, newQuantity);
        }
      } else {
        // Update guest cart
        const item = cartItems.find(i => i.product_id === cartItemId);
        if (!item) return;
        
        const newQuantity = quantityDelta !== undefined ? item.quantity + quantityDelta : item.quantity;
        
        if (newQuantity <= 0) {
          removeFromGuestCart(cartItemId);
        } else {
          updateGuestCartItem(cartItemId, newQuantity);
        }
      }
      
      await fetchCart();
      setMessage('Cart updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating cart:', err);
      setError(err.message || 'Failed to update cart item.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number) => {
    try {
      setMessage(null);
      
      if (user) {
        await removeFromUserCart(cartItemId);
      } else {
        removeFromGuestCart(cartItemId);
      }
      
      await fetchCart();
      setMessage('Item removed from cart!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.message || 'Failed to remove item from cart.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Increment quantity
  const incrementQuantity = (cartItemId: number) => {
    updateCartItem(cartItemId, 1);
  };

  // Decrement quantity
  const decrementQuantity = (cartItemId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItem(cartItemId, -1);
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('Cart items:', cartItems)
      
      // Validate cart items
      const invalidItems = cartItems.filter(item => !item.product_id || typeof item.product_id !== 'number')
      if (invalidItems.length > 0) {
        console.error('Invalid cart items found:', invalidItems)
        setError('Some cart items are invalid. Please refresh and try again.')
        return
      }
      
      // Calculate subtotal
      const subtotal = cartItems.reduce((sum, item) => {
        return sum + ((item.product_price || 0) * item.quantity);
      }, 0);
      
      console.log('Creating order with subtotal:', subtotal)
      
      // For guest users, redirect to sign in
      if (!user) {
        const confirmed = window.confirm('You need to sign in to complete checkout. Would you like to sign in now?');
        if (confirmed) {
          navigate('/signin');
        }
        return;
      }
      
      // Create order for authenticated users
      const order = await createOrder({
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          size: item.size || undefined,
          color: item.color || undefined,
        })),
        subtotal,
        shippingCost: 0,
        tax: 0,
        discount: 0,
      });
      
      console.log('Order created successfully:', order)
      
      // Navigate to checkout page
      navigate(`/checkout/${(order as any).id}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    return sum + ((item.product_price || 0) * item.quantity);
  }, 0);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
        <Link to="/" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

      {/* Feedback Message */}
      {message && (
        <div className="mb-4 text-center text-green-600">{message}</div>
      )}
      {error && (
        <div className="mb-4 text-center text-red-600">{error}</div>
      )}

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-lg shadow-md p-4"
          >
            {/* Product Image */}
            <div className="w-24 h-24 mr-4">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                  No image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.product_title || 'Unknown Product'}</h3>
              <p className="text-gray-600">Price: Ksh {item.product_price || 0}</p>
              <p className="text-gray-600">Total: Ksh {(item.product_price || 0) * item.quantity}</p>

              {/* Quantity Controls */}
              <div className="flex items-center mt-2">
                <label className="mr-2">Qty:</label>
                <button
                  onClick={() => decrementQuantity(item.id, item.quantity)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="px-4 border-t border-b">{item.quantity}</span>
                <button
                  onClick={() => incrementQuantity(item.id)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Size Selector */}
              {item.size && (
                <div className="flex items-center mt-2">
                  <label className="mr-2">Size:</label>
                  <span className="text-gray-600">{item.size}</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              <FaTrash size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 p-4 w-full bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Cart Summary</h3>
        <p className="text-gray-600 mt-2">Total: Ksh {total.toLocaleString()}</p>
        <Button
          onClick={handleProceedToCheckout}
          disabled={isProcessing}
          className="block w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition text-center disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </div>
  );
};

export default Cart;