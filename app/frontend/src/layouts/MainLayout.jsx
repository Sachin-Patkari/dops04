import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const MainLayout = ({ children }) => (
  <Box>
    <Navbar />
    <Box as="main" pt="80px" pb="20" minH="calc(100vh - 120px)">
      {children}
    </Box>
    <Footer />
  </Box>
);

export default MainLayout;