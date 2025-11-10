import React from 'react';
import { Box, Image, Text, Badge, Button, VStack, Icon, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-5px)' }}
    >
      <RouterLink to={`/products/${product.id}`}>
        <Image src={product.imageUrl} alt={product.name} objectFit="cover" w="100%" h="350px"/>
        <VStack p="4" align="start" spacing="2">
          <Badge borderRadius="full" px="2" colorScheme="gray">
            {product.category}
          </Badge>
          <Text fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
            {product.name}
          </Text>
          <Flex align="center">
            <Text fontSize="lg" fontWeight="bold">
              ${product.price.toFixed(2)}
            </Text>
            <Flex ml={3} align="center">
                <Icon as={FaStar} color="yellow.400" />
                <Text ml={1} fontSize="sm">{product.rating}</Text>
            </Flex>
          </Flex>
          {product.stock === 0 && (
             <Badge colorScheme="red">Out of Stock</Badge>
          )}
        </VStack>
      </RouterLink>
    </Box>
  );
};

export default ProductCard;