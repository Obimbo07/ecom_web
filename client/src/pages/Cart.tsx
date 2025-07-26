import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  addItemToCart,
  removeItemFromCart,
  removeItemCompletely,
  clearCart,
} from '../store/slices/cartSlice';
import { placeOrderStart, placeOrderSuccess, placeOrderFailure, Order } from '../store/slices/orderSlice';
import { setCart } from '../store/slices/cartSlice';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}


const Cart = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items) as CartItem[];
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  // This useEffect will now primarily fetch product details for items already in Redux cart
  useEffect(() => {
    const fetchProductDetailsForCart = async () => {
      setLoading(true);
      setError(null);
      // Inside Cart.tsx, after fetching all product details:
      const updatedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          if (!item.image || !item.name) {
            try {
              const productResponse = await api.get(`api/products/${item.id}`);
              const productData = productResponse.data as Product;
              return {
                ...item,
                name: productData.name,
                image: productData.imageUrl,
                price: productData.price,
              };
            } catch (err) {
              return { ...item, name: 'Unknown Product', image: '', price: 0 };
            }
          }
          return item;
        })
      );
      // Optionally update Redux with full details:
      dispatch(setCart(updatedCartItems as CartItem[]));
      setLoading(false);
      // If you want to update the cart items in Redux with full product details, you'd dispatch an action here.
      // For now, we'll assume the cartSlice only stores basic info and product details are fetched on demand.
      // If cartSlice was designed to hold full product details, this logic would be different.
      setLoading(false);
    };

    if (cartItems.length > 0) {
      fetchProductDetailsForCart();
    } else {
      setLoading(false);
    }
  }, [dispatch, cartItems]);

const handleIncrementQuantity = (item: CartItem) => {
    dispatch(addItemToCart({ ...item, quantity: 1, image: item.image || "" })); // Add 1 to quantity
  };

  const handleDecrementQuantity = (itemId: string) => {
    dispatch(removeItemFromCart(itemId)); // Remove 1 from quantity
  };

  const handleRemoveFromCart = (itemId: string) => {
    dispatch(removeItemCompletely(itemId));
  };

  const handleProceedToCheckout = async () => {
    dispatch(placeOrderStart());
    try {
      // Assuming your backend expects cart items to create an order
      const orderResponse = await api.post('/api/orders/', { items: cartItems });
      const orderData = orderResponse.data as Order;
      dispatch(placeOrderSuccess(orderData));
      dispatch(clearCart()); // Clear cart after successful order
      navigate(`/checkout/${orderData.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create order.';
      dispatch(placeOrderFailure(errorMessage));
      setError(errorMessage); // Set local error state for display
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (cartItems.length === 0) {
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
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
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
              <h3 className="text-lg font-semibold">{item.name || 'Unknown Product'}</h3>
              <p className="text-gray-600">Price: Ksh {item.price || 0}</p>
              <p className="text-gray-600">Total: Ksh {(item.price || 0) * item.quantity}</p>

              {/* Quantity Controls */}
              <div className="flex items-center mt-2">
                <label className="mr-2">Qty:</label>
                <button
                  onClick={() => handleDecrementQuantity(item.id)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="px-4 border-t border-b">{item.quantity}</span>
                <button
                  onClick={() => handleIncrementQuantity(item)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Size Selector (if applicable, assuming size is part of CartItem) */}
              {/* <div className="flex items-center mt-2">
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
              </div> */}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveFromCart(item.id)}
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
        <p className="text-gray-600 mt-2">Total: Ksh {totalAmount.toFixed(2)}</p>
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
