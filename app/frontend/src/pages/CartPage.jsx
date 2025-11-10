import React from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack, Divider, Image, IconButton, useToast
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { updateQuantity, removeFromCart } from '../features/cart/cartSlice';
import { selectCartItems, selectCartSubtotal, selectShippingCost, selectTotalCost } from '../features/cart/cartSelectors';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectShippingCost);
  const total = useSelector(selectTotalCost);

  const handleRemove = (uniqueId) => {
    dispatch(removeFromCart(uniqueId));
    toast({ title: 'Item removed', status: 'info', duration: 2000, isClosable: true });
  };
  
  const handleQuantityChange = (uniqueId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ uniqueId, quantity: newQuantity }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <Heading mb={4}>Your Cart is Empty</Heading>
        <Text mb={6}>Looks like you haven't added anything to your cart yet.</Text>
        <Button as={RouterLink} to="/shop">Continue Shopping</Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={8}>Shopping Cart</Heading>
      <Box display={{ lg: 'flex' }} gap={8}>
        <VStack flex="2" spacing={4} align="stretch">
          {cartItems.map(item => (
            <Box key={item.uniqueId} p={4} borderWidth="1px" borderRadius="md" display="flex" alignItems="center">
              <Image src={item.imageUrl} alt={item.name} boxSize="100px" objectFit="cover" mr={4} />
              <VStack align="start" flex="1">
                <Text fontWeight="bold">{item.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Size: {item.size} | Color: {item.color}
                </Text>
                <Text fontWeight="bold">${item.price.toFixed(2)}</Text>
              </VStack>
              <HStack>
                <Button size="sm" onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}>-</Button>
                <Text>{item.quantity}</Text>
                <Button size="sm" onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}>+</Button>
              </HStack>
              <IconButton
                aria-label="Remove item"
                icon={<FaTrash />}
                variant="ghost"
                colorScheme="red"
                ml={4}
                onClick={() => handleRemove(item.uniqueId)}
              />
            </Box>
          ))}
        </VStack>

        <Box flex="1" p={6} borderWidth="1px" borderRadius="md" h="fit-content">
          <Heading size="md" mb={4}>Order Summary</Heading>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text>Subtotal</Text>
              <Text fontWeight="bold">${subtotal.toFixed(2)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Shipping</Text>
              <Text fontWeight="bold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">Total</Text>
              <Text fontSize="lg" fontWeight="bold">${total.toFixed(2)}</Text>
            </HStack>
            <Button mt={4} w="full" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;