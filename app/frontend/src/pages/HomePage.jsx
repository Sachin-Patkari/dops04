import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, SimpleGrid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { products } from '../data/products';

const HomePage = () => {
  const featuredProducts = products.slice(0, 4); // Bestsellers
  const newArrivals = products.slice(5, 9); // New arrivals

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgImage="url('https://placehold.co/1600x600/e2e8f0/a0aec0?text=Style+Reimagined')"
        bgSize="cover"
        bgPosition="center"
        h="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
      >
        <VStack spacing={4} textAlign="center" bg="rgba(0,0,0,0.5)" p={10} borderRadius="md">
          <Heading as="h1" size="2xl" fontWeight="bold">
            Discover Your Signature Style
          </Heading>
          <Text fontSize="lg" maxW="xl">
            Timeless pieces, modern designs. Curated for the conscious consumer.
          </Text>
          <Button as={RouterLink} to="/shop" size="lg" colorScheme="whiteAlpha">
            Shop New Arrivals
          </Button>
        </VStack>
      </Box>

      {/* Featured Collections */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          {/* Bestsellers Section */}
          <VStack spacing={4} w="full">
            <Heading as="h2" size="xl">
              Our Bestsellers
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
          </VStack>

          {/* New Arrivals Section */}
          <VStack spacing={4} w="full">
            <Heading as="h2" size="xl">
              Fresh on the Scene
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
          </VStack>

          {/* Our Story Snippet */}
          <Box textAlign="center" py={10}>
            <Heading as="h3" size="lg" mb={4}>Our Story</Heading>
            <Text maxW="2xl" mx="auto">
              StyleVault was born from a passion for sustainable fashion and minimalist design. We believe in quality over quantity, creating timeless apparel that you'll love for years to come.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;