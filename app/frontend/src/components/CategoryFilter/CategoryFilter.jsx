import React from 'react';
import { VStack, Button, Heading } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter } from '../../features/products/productSlice';
import { selectAllCategories } from '../../features/products/productSelectors';

const CategoryFilter = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const currentFilter = useSelector((state) => state.products.filter);

  return (
    <VStack align="stretch" spacing={2}>
      <Heading size="sm" mb={2}>Categories</Heading>
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => dispatch(setFilter(category))}
          variant={currentFilter === category ? 'solid' : 'ghost'}
          justifyContent="flex-start"
        >
          {category}
        </Button>
      ))}
    </VStack>
  );
};

export default CategoryFilter;