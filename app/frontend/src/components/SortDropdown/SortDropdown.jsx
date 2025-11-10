import React from 'react';
import { Select } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { setSort } from '../../features/products/productSlice';

const SortDropdown = () => {
  const dispatch = useDispatch();
  const currentSort = useSelector((state) => state.products.sort);

  const handleSortChange = (e) => {
    dispatch(setSort(e.target.value));
  };

  return (
    <Select
      value={currentSort}
      onChange={handleSortChange}
      placeholder="Sort by"
      maxW="200px"
    >
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A-Z</option>
      <option value="rating-desc">Rating: High to Low</option>
    </Select>
  );
};

export default SortDropdown;