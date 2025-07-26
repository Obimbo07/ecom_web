import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../api';
import { setCart } from '../store/slices/cartSlice';

const CartLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/api/cart/');
        // Adapt backend cart items to CartItem[]
        const items = response.data.items.map((item: any) => ({
          id: item.product_id.toString(),
          name: '', // Will be filled in Cart.tsx
          price: 0, // Will be filled in Cart.tsx
          quantity: item.quantity,
          image: '', // Will be filled in Cart.tsx
        }));
        dispatch(setCart(items));
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    fetchCart();
  }, [dispatch]);

  return null;
};

export default CartLoader;