import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'; // Import plus and minus icons
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
// Define interfaces based on the CartResponse structure
interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  size: string;
  product?: Product; // Optional product details (fetched separately)
}

interface Product {
  id: number;
  title: string;
  price: number;
  image: string | null;
}

interface CartResponse {
  id: number;
  items: CartItem[];
  total: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For feedback

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('api/cart/');
      console.log(response.data, 'data response') // Adjusted endpoint without 'api/' prefix
      const cartData: CartResponse = response.data;

      // Fetch product details for each cart item
      const itemsWithProductDetails = await Promise.all(
        cartData.items.map(async (item) => {
          try {
            const productResponse = await api.get(`api/products/${item.product_id}`);
            return { ...item, product: productResponse.data };
          } catch (err) {
            console.error(`Error fetching product ${item.product_id}:`, err);
            return { ...item, product: null };
          }
        })
      );

      setCart({ ...cartData, items: itemsWithProductDetails });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update cart item (quantity or size)
  const updateCartItem = async (cartItemId: number, quantity?: number, size?: string) => {
    try {
      setMessage(null);
      const response = await api.put(`api/cart/${cartItemId}/`, { quantity, size });
      const updatedCart: CartResponse = response.data;
      setCart(updatedCart); // Update with response data (though we'll refetch below)
      await fetchCart(); // Refetch to ensure sync with server
      setMessage('Cart updated successfully!');
      setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update cart item.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number) => {
    try {
      setMessage(null);
      await api.delete(`api/cart/${cartItemId}/`);
      await fetchCart(); // Refetch to ensure sync with server
      setMessage('Item removed from cart!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove item from cart.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Increment quantity
  const incrementQuantity = (cartItemId: number, _currentQuantity: number) => {
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
  8
      const response = await api.post('/api/orders/');
      if (!response) throw new Error('Failed to create order');
      const data = await response.data;
      console.log(data, 'order id');
      console.log(data.id, 'order id');
      return  navigate(`/checkout/${data.id}`); 
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update create order');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
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
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-lg shadow-md p-4"
          >
            {/* Product Image */}
            <div className="w-24 h-24 mr-4">
              {item.product?.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.title}
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
              <h3 className="text-lg font-semibold">{item.product?.title || 'Unknown Product'}</h3>
              <p className="text-gray-600">Price: Ksh {item.product?.price || 0}</p>
              <p className="text-gray-600">Total: Ksh {(item.product?.price || 0) * item.quantity}</p>

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
                  onClick={() => incrementQuantity(item.id, item.quantity)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Size Selector */}
              <div className="flex items-center mt-2">
                <label className="mr-2">Size:</label>
                <select
                  value={item.size}
                  onChange={(e) => updateCartItem(item.id, undefined, e.target.value)}
                  className="border rounded p-1"
                >
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
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
        <p className="text-gray-600 mt-2">Total: Ksh {cart.total}</p>
        <Button
          onClick={handleProceedToCheckout}
          className="block w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition text-center"
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;