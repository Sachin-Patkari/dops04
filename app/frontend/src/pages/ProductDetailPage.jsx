import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, SimpleGrid, Image, Heading, Text, VStack, Button, HStack, Badge, useToast, Radio, RadioGroup, Stack
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { products } from '../data/products';
import { addToCart } from '../features/cart/cartSlice';

// Simple QuantitySelector component
const QuantitySelector = ({ quantity, setQuantity, max }) => (
  <HStack>
    <Button onClick={() => setQuantity(q => Math.max(1, q - 1))} isDisabled={quantity <= 1}>-</Button>
    <Text px={4}>{quantity}</Text>
    <Button onClick={() => setQuantity(q => Math.min(max, q + 1))} isDisabled={quantity >= max}>+</Button>
  </HStack>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const product = useMemo(() => products.find((p) => p.id === id), [id]);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  if (!product) {
    return <Box textAlign="center" py={10}>Product not found.</Box>;
  }
  
  const handleAddToCart = () => {
    if (product.sizes.length > 1 && !selectedSize) {
        toast({ title: "Please select a size.", status: 'warning', duration: 3000, isClosable: true });
        return;
    }
    if (product.colors.length > 1 && !selectedColor) {
        toast({ title: "Please select a color.", status: 'warning', duration: 3000, isClosable: true });
        return;
    }

    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      size: selectedSize || product.sizes[0],
      color: selectedColor || product.colors[0],
      stock: product.stock,
    }));

    toast({
      title: 'Item added to cart!',
      description: `${product.name} has been added to your shopping cart.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  const isAddToCartDisabled = product.stock === 0 || quantity > product.stock;

  return (
    <Container maxW="container.lg" py={10}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Image src={product.imageUrl} alt={product.name} borderRadius="md" />
        <VStack align="flex-start" spacing={4}>
          <Heading as="h1">{product.name}</Heading>
          <HStack>
             <Text fontSize="2xl" fontWeight="bold" color="brand.800">${product.price.toFixed(2)}</Text>
             <Badge colorScheme={product.stock > 0 ? 'green' : 'red'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
             </Badge>
          </HStack>
          <HStack>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} color={i < Math.round(product.rating) ? '#FFC107' : '#E0E0E0'} />
            ))}
            <Text ml={2}>{product.rating} / 5</Text>
          </HStack>
          <Text fontSize="md" color="gray.600">{product.description}</Text>

          {/* Size Selector */}
          {product.sizes.length > 1 && (
            <VStack align="left">
                <Text fontWeight="bold">Size:</Text>
                <RadioGroup onChange={setSelectedSize} value={selectedSize}>
                    <Stack direction="row" wrap="wrap">
                        {product.sizes.map(size => <Radio key={size} value={size}>{size}</Radio>)}
                    </Stack>
                </RadioGroup>
            </VStack>
          )}

          {/* Color Selector */}
          {product.colors.length > 1 && (
             <VStack align="left">
                <Text fontWeight="bold">Color:</Text>
                 <RadioGroup onChange={setSelectedColor} value={selectedColor}>
                    <Stack direction="row" wrap="wrap">
                        {product.colors.map(color => <Radio key={color} value={color}>{color}</Radio>)}
                    </Stack>
                </RadioGroup>
            </VStack>
          )}

          <HStack>
            <Text fontWeight="bold">Quantity:</Text>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} max={product.stock} />
          </HStack>
          
          <Button
            size="lg"
            w="full"
            onClick={handleAddToCart}
            isDisabled={isAddToCartDisabled}
          >
            Add to Cart
          </Button>
           <Button
            size="lg"
            w="full"
            variant="outline"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
        </VStack>
      </SimpleGrid>
    </Container>
  );
}

export default ProductDetailPage;