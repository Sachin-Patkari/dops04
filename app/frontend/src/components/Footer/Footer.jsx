import React from 'react';
import { Box, Text, Container, Flex, Spacer, Link } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="brand.800" color="white" py={4}>
      <Container maxW="container.xl">
        <Flex>
          <Text>&copy; {new Date().getFullYear()} StyleVault. All Rights Reserved.</Text>
          <Spacer />
          <Text>
            Made with ❤️ for modern fashion.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;