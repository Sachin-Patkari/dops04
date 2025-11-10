import React from 'react';
import {
  Container,
  Grid,
  GridItem,
  Box,
  Heading,
  SimpleGrid,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch } from 'react-icons/fa';
import CategoryFilter from '../components/CategoryFilter/CategoryFilter';
import ProductCard from '../components/ProductCard/ProductCard';
import SortDropdown from '../components/SortDropdown/SortDropdown';
import { selectFilteredAndSortedProducts } from '../features/products/productSelectors';
import { setSearchQuery } from '../features/products/productSlice';

const ShopNowPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectFilteredAndSortedProducts);
  const searchQuery = useSelector((state) => state.products.searchQuery);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={8}>
        Shop Now
      </Heading>
      <Grid
        templateColumns={{ base: '1fr', md: '250px 1fr' }}
        gap={8}
      >
        <GridItem>
          <CategoryFilter />
        </GridItem>
        <GridItem>
          <Flex mb={6} justify="space-between" align="center" direction={{base: 'column', md: 'row'}} gap={4}>
            <InputGroup maxW={{base: '100%', md: '300px'}}>
                <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </InputGroup>
            <SortDropdown />
          </Flex>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={8}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
          {products.length === 0 && <Box textAlign="center" mt={10}>No products found.</Box>}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ShopNowPage;