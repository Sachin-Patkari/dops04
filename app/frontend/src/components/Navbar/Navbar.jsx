import React from 'react';
import {
  Box, Flex, Heading, Spacer, Button, Badge, IconButton, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaShoppingCart, FaBars } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectTotalCartItems } from '../../features/cart/cartSelectors';

const Navbar = () => {
  const totalItems = useSelector(selectTotalCartItems);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const NavLinks = () => (
    <>
      <Button as={RouterLink} to="/shop" variant="ghost">Shop Now</Button>
      <Button as={RouterLink} to="/about" variant="ghost">About Us</Button>
      <Button as={RouterLink} to="/contact" variant="ghost">Contact Us</Button>
    </>
  );

  return (
    <Box
      as="nav"
      bg="white"
      p={4}
      boxShadow="sm"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="sticky"
      width="100%"
    >
      <Flex maxW="container.xl" mx="auto" align="center">
        <Heading as={RouterLink} to="/" size="md" color="brand.800">
          StyleVault
        </Heading>
        <Spacer />
        {/* Desktop Nav */}
        <Flex display={{ base: 'none', md: 'flex' }} align="center">
          <NavLinks />
          <Button as={RouterLink} to="/cart" variant="ghost" ml={4}>
            <FaShoppingCart />
            {totalItems > 0 && (
              <Badge ml="2" colorScheme="red" borderRadius="full" px="2">
                {totalItems}
              </Badge>
            )}
          </Button>
        </Flex>

        {/* Mobile Nav */}
        <Flex display={{ base: 'flex', md: 'none' }} align="center">
           <Button as={RouterLink} to="/cart" variant="ghost" mr={2}>
            <FaShoppingCart />
            {totalItems > 0 && (
              <Badge ml="2" colorScheme="red" borderRadius="full" px="2">
                {totalItems}
              </Badge>
            )}
          </Button>
          <IconButton
            icon={<FaBars />}
            aria-label="Open Menu"
            onClick={onOpen}
            variant="ghost"
          />
        </Flex>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" onClick={onClose}>
              <NavLinks />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;