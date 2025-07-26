import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      if (!newItem || typeof newItem.quantity === 'undefined' || typeof newItem.price === 'undefined') {
        return;
      }
      const existingItem = state.items.find((item) => item.id === newItem.id);
      state.totalQuantity += newItem.quantity;
      state.totalAmount += newItem.price * newItem.quantity;

      if (!existingItem) {
        state.items.push(newItem);
      } else {
        existingItem.quantity += newItem.quantity;
      }
    },
    removeItemFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.totalQuantity--;
        state.totalAmount -= existingItem.price;
        if (existingItem.quantity === 1) {
          state.items = state.items.filter((item) => item.id !== id);
        } else {
          existingItem.quantity--;
        }
      }
    },
    removeItemCompletely(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.totalQuantity = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  clearCart,
  setCart,
  removeItemCompletely,
} = cartSlice.actions;

export default cartSlice.reducer;
