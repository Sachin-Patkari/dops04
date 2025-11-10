import React, { useState } from 'react';
import {
  Container, Heading, VStack, FormControl, FormLabel, Input, Button, Box, Radio, RadioGroup, Stack, useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../features/order/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import { selectCartItems, selectTotalCost } from '../features/cart/cartSelectors';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const cartItems = useSelector(selectCartItems);
  const totalCost = useSelector(selectTotalCost);
  
  const [formState, setFormState] = useState({
    name: '', address: '', city: '', postalCode: '', country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Simulated)');
  const [isSubmitting, setIsSubmitting] = useState(false); // Changed to include setter
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic validation remains the same
    for (const key in formState) {
      if (!formState[key]) {
        toast({
          title: 'Please fill all shipping details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    // Prepare the order data payload for the backend
    const orderData = {
      orderItems: cartItems,
      shippingInfo: formState,
      paymentMethod: paymentMethod,
      totalPrice: totalCost,
    };
    
    setIsSubmitting(true); // Disable button

    try {
      // Make the POST request to your backend
      const API_BASE = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        // parse server JSON error (if any) to show detailed message
        let errBody;
        try { errBody = await response.json(); } catch (e) { /* ignore parse error */ }
        throw new Error(errBody?.message || 'Failed to place the order. Please try again.');
      }
      
      // If the request was successful, get the created order from the backend
      const createdOrder = await response.json(); 

      // **FIX:** Dispatch the complete order object received from the backend
      // This object will be the payload for the placeOrder action.
      dispatch(placeOrder(createdOrder)); 
      dispatch(clearCart());

      // mark order placed so the component won't immediately redirect the user away
      setOrderPlaced(true);

      // pass the created order to the confirmation page via location.state
      navigate('/confirmation', { state: { order: createdOrder } });

    } catch (error) {
      // Catch any network errors or errors thrown from the response check
      toast({
        title: 'An error occurred.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
        setIsSubmitting(false); // Re-enable button in any case
    }
  }; 
  
  // This check should happen before the main return
  if (cartItems.length === 0 && !isSubmitting && !orderPlaced) {
     navigate('/'); // Redirect if cart is empty on normal visits (not right after placing an order)
     return null;
  }
  
  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={8}>Checkout</Heading>
      <form onSubmit={handlePlaceOrder}>
        <VStack spacing={8} align="stretch">
          <Box p={6} borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>Shipping Details</Heading>
            <VStack spacing={4}>
              <FormControl isRequired><FormLabel>Full Name</FormLabel><Input name="name" onChange={handleInputChange} /></FormControl>
              <FormControl isRequired><FormLabel>Address</FormLabel><Input name="address" onChange={handleInputChange} /></FormControl>
              <FormControl isRequired><FormLabel>City</FormLabel><Input name="city" onChange={handleInputChange} /></FormControl>
              <FormControl isRequired><FormLabel>Postal Code</FormLabel><Input name="postalCode" onChange={handleInputChange} /></FormControl>
              <FormControl isRequired><FormLabel>Country</FormLabel><Input name="country" onChange={handleInputChange} /></FormControl>
            </VStack>
          </Box>
          <Box p={6} borderWidth="1px" borderRadius="md">
            <Heading size="md" mb={4}>Payment Method</Heading>
            <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
              <Stack>
                <Radio value="Credit Card (Simulated)">Credit Card (Simulated)</Radio>
                <Radio value="PayPal (Simulated)">PayPal (Simulated)</Radio>
                <Radio value="Google Pay (Simulated)">Google Pay (Simulated)</Radio>
              </Stack>
            </RadioGroup>
          </Box>
          <Button type="submit" size="lg" w="full" isLoading={isSubmitting}>Place Order</Button>
        </VStack>
      </form>
    </Container>
  );
};
  
export default CheckoutPage;
