import React, { useEffect, useRef } from 'react';
import { Box, Container, Heading, Text, Button, VStack, Divider, useToast } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { clearOrder } from '../features/order/orderSlice';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const effectRun = useRef(false);

  // Redux values (may be empty if we only passed order via navigate state)
  const { orderId: reduxOrderId, orderDetails: reduxOrderDetails } = useSelector(state => state.order);

  // Location state (preferred) — CheckoutPage navigates with { state: { order: createdOrder } }
  const { state } = useLocation();
  const orderFromState = state?.order || null;

  // Derive display values from location state first, otherwise from redux
  const displayOrderId = orderFromState?.orderId || reduxOrderId || orderFromState?._id || null;
  const displayItems = orderFromState?.orderItems
    || (reduxOrderDetails?.items && reduxOrderDetails.items.map(i => ({ name: i.name, quantity: i.quantity })))
    || null;
  const displayTotal = orderFromState?.totalPrice || reduxOrderDetails?.total || null;

  useEffect(() => {
    // Guard to run effect only once (prevents duplicate toasts/redirects in React StrictMode)
    if (effectRun.current) return;
    effectRun.current = true;

    if (!displayOrderId && !displayItems) {
      toast({
        title: 'No order found.',
        description: 'Redirecting to home page.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }

    // Do NOT clear order here — clear when user explicitly continues shopping to avoid racing/unmount problems
  }, [displayOrderId, displayItems, navigate, toast]);

  // If nothing to show, render null while redirecting
  if (!displayOrderId || !displayItems) {
    return null;
  }

  return (
    <Container maxW="container.md" py={10} textAlign="center">
      <VStack spacing={4}>
        <Heading as="h1" size="xl" color="green.500">Order Placed Successfully!</Heading>
        <Text>Thank you for choosing StyleVault.</Text>
        <Box p={6} borderWidth="1px" borderRadius="md" w="full" textAlign="left">
          <Text fontWeight="bold">Order ID:</Text>
          <Text mb={4}>{displayOrderId}</Text>
          <Divider mb={4}/>
          <Heading size="sm" mb={2}>Order Summary:</Heading>
          {displayItems.map((item, idx) => (
            <Text key={item.id || item.name || idx}>- {item.name} (x{item.quantity})</Text>
          ))}
          <Divider my={4}/>
          <Text fontWeight="bold" fontSize="lg" textAlign="right">
            Total: ${Number(displayTotal || 0).toFixed(2)}
          </Text>
        </Box>
        <Button
          as={RouterLink}
          to="/"
          size="lg"
          onClick={() => {
            // clear redux order state when user leaves the confirmation page
            dispatch(clearOrder());
          }}
        >
          Continue Shopping
        </Button>
      </VStack>
    </Container>
  );
};

export default OrderConfirmationPage;