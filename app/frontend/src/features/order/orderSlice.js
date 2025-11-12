import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to place order via backend API
export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  orderId: null,
  orderDetails: null,
  status: 'idle',
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.orderId = null;
      state.orderDetails = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderId = action.payload.orderId;
        state.orderDetails = action.meta.arg; // original order data
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearOrder } = orderSlice.actions;

export default orderSlice.reducer;
