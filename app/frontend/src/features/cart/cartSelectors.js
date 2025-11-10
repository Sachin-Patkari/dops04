import { createSelector } from '@reduxjs/toolkit';

const selectCartItems = (state) => state.cart.items;

export { selectCartItems }; // <-- Add this line

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectTotalCartItems = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectShippingCost = createSelector(
  [selectCartSubtotal],
  (subtotal) => (subtotal > 100 || subtotal === 0 ? 0 : 7.99)
);

export const selectTotalCost = createSelector(
  [selectCartSubtotal, selectShippingCost],
  (subtotal, shipping) => subtotal + shipping
);