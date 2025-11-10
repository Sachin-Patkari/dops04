import React, { useState } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactUsPage = () => {
  const toast = useToast();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formValues.name || !formValues.email || !formValues.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Simulate form submission
    console.log('Form Submitted:', formValues);
    toast({
      title: 'Message Sent!',
      description: "Thanks for reaching out. We'll get back to you soon.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    // Reset form
    setFormValues({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Container maxW="container.lg" py={12}>
      <Heading as="h1" size="2xl" textAlign="center" mb={12}>
        Get In Touch
      </Heading>
      <Box display={{ md: 'flex' }} gap={10}>
        {/* Form */}
        <Box flex="2" p={8} borderWidth="1px" borderRadius="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formValues.email}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input
                  name="subject"
                  placeholder="Message Subject"
                  value={formValues.subject}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  placeholder="Your message..."
                  rows={6}
                  value={formValues.message}
                  onChange={handleInputChange}
                />
              </FormControl>
              <Button type="submit" w="full" mt={4}>
                Send Message
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Contact Info */}
        <VStack flex="1" spacing={6} align="flex-start" p={8}>
          <Heading as="h3" size="lg">
            Contact Information
          </Heading>
          <HStack>
            <Icon as={FaMapMarkerAlt} w={5} h={5} color="gray.500" />
            <Text>123 Fashion Ave, Style City, 10001</Text>
          </HStack>
          <HStack>
            <Icon as={FaEnvelope} w={5} h={5} color="gray.500" />
            <Text>support@stylevault.com</Text>
          </HStack>
          <HStack>
            <Icon as={FaPhone} w={5} h={5} color="gray.500" />
            <Text>+1 (234) 567-8900</Text>
          </HStack>
          <Text pt={4} color="gray.600">
            Our customer service team is available Monday to Friday, 9am - 5pm EST.
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default ContactUsPage;