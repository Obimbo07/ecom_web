import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaTrash } from 'react-icons/fa';

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
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch cart and product details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/cart/');
        const cartData: CartResponse = response.data;

        // Fetch product details for each cart item
        const itemsWithProductDetails = await Promise.all(
          cartData.items.map(async (item) => {
            try {
              const productResponse = await api.get(`api/products/${item.product_id}`,);
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

    fetchCart();
  }, []);

  // Update cart item (quantity or size)
  const updateCartItem = async (cartItemId: number, quantity?: number, size?: string) => {
    try {
      const response = await api.put(`api/cart/items/${cartItemId}`, { quantity, size });
      const updatedCart: CartResponse = response.data;
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update cart item.');
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.delete(`api/cart/items/${cartItemId}`);
      setCart((prevCart) => {
        if (!prevCart) return prevCart;
        const updatedItems = prevCart.items.filter((item) => item.id !== cartItemId);
        const newTotal = updatedItems.reduce((sum, item) => {
          return sum + (item.product?.price || 0) * item.quantity;
        }, 0);
        return { ...prevCart, items: updatedItems, total: newTotal };
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove item from cart.');
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
        <Link to="/shop" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

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
              <p className="text-gray-600">Price: Ksh {item.product?.price?.toFixed(2) || 0}</p>
              <p className="text-gray-600">Total: Ksh {(item.product?.price || 0) * item.quantity}</p>

              {/* Quantity Selector */}
              <div className="flex items-center mt-2">
                <label className="mr-2">Qty:</label>
                <select
                  value={item.quantity}
                  onChange={(e) => updateCartItem(item.id, parseInt(e.target.value), undefined)}
                  className="border rounded p-1"
                >
                  {[...Array(10).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
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
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Cart Summary</h3>
        <p className="text-gray-600 mt-2">Total: Ksh {cart.total.toFixed(2)}</p>
        <Link
          to="/checkout"
          className="block mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition text-center"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;