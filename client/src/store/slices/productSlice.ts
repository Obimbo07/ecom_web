import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product { // Exported
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
  numReviews: number;
}

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
  };
  sortBy: 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc' | 'rating';
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    minPrice: 0,
    maxPrice: 99999,
  },
  sortBy: 'nameAsc',
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    fetchProductsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(state, action: PayloadAction<Product[]>) {
      state.loading = false;
      state.products = action.payload;
      state.filteredProducts = action.payload; // Initially, filtered products are all products
      state.error = null;
    },
    fetchProductsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    applyFilters(state, action: PayloadAction<{ category?: string; minPrice?: number; maxPrice?: number }>) {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredProducts = state.products.filter(product => {
        const matchesCategory = state.filters.category === 'all' || product.category === state.filters.category;
        const matchesPrice = product.price >= state.filters.minPrice && product.price <= state.filters.maxPrice;
        return matchesCategory && matchesPrice;
      });
    },
    setSortBy(state, action: PayloadAction<ProductState['sortBy']>) {
      state.sortBy = action.payload;
      state.filteredProducts.sort((a, b) => {
        if (state.sortBy === 'priceAsc') return a.price - b.price;
        if (state.sortBy === 'priceDesc') return b.price - a.price;
        if (state.sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        if (state.sortBy === 'nameDesc') return b.name.localeCompare(a.name);
        if (state.sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
    },
  },
});

export const { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure, applyFilters, setSortBy } = productSlice.actions;

export default productSlice.reducer;
