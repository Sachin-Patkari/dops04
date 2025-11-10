import { createSlice } from '@reduxjs/toolkit';
import { products } from '../../data/products.js';

const initialState = {
  items: products,
  filter: 'All Products',
  sort: 'default',
  searchQuery: '',
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setFilter, setSort, setSearchQuery } = productSlice.actions;

export default productSlice.reducer;