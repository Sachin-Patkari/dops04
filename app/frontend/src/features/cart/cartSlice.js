import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { id, name, price, imageUrl, quantity, size, color }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, size, color, quantity } = action.payload;
      const uniqueId = `${id}-${size}-${color}`;
      const existingItem = state.items.find((item) => item.uniqueId === uniqueId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...action.payload, uniqueId });
      }
    },
    removeFromCart: (state, action) => {
      const uniqueId = action.payload;
      state.items = state.items.filter((item) => item.uniqueId !== uniqueId);
    },
    updateQuantity: (state, action) => {
      const { uniqueId, quantity } = action.payload;
      const itemToUpdate = state.items.find((item) => item.uniqueId === uniqueId);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;