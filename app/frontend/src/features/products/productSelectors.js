import { createSelector } from '@reduxjs/toolkit';

const selectProducts = (state) => state.products.items;
const selectFilter = (state) => state.products.filter;
const selectSort = (state) => state.products.sort;
const selectSearchQuery = (state) => state.products.searchQuery;

export const selectFilteredAndSortedProducts = createSelector(
  [selectProducts, selectFilter, selectSort, selectSearchQuery],
  (items, filter, sort, searchQuery) => {
    // Filter by category
    let filteredItems =
      filter === 'All Products'
        ? items
        : items.filter((item) => item.category === filter);

    // Filter by search query (name or description)
    if (searchQuery) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort the items
    const sortedItems = [...filteredItems];
    switch (sort) {
      case 'price-asc':
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedItems.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating-desc':
        sortedItems.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // No sorting or default sorting
        break;
    }
    return sortedItems;
  }
);

export const selectAllCategories = createSelector([selectProducts], (items) => {
  const categories = items.map((item) => item.category);
  return ['All Products', ...new Set(categories)];
});