import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderItem { // Exported
  productId: string;
  product_title: string; // Changed from 'name'
  size: string; // Added 'size'
  quantity: number;
  price: number;
  image?: string; // Added 'image'
}

export interface Order { // Exported
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  payment_status: string; // Added 'payment_status'
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    placeOrderStart(state) {
      state.loading = true;
      state.error = null;
    },
    placeOrderSuccess(state, action: PayloadAction<Order>) {
      state.loading = false;
      state.currentOrder = action.payload;
      state.orders.push(action.payload); // Add to list of past orders
      state.error = null;
    },
    placeOrderFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action: PayloadAction<Order[]>) {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    }
  },
});

export const {
  placeOrderStart,
  placeOrderSuccess,
  placeOrderFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
