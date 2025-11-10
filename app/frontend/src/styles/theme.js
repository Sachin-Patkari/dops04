import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      900: '#1a202c', // Darkest gray
      800: '#2d3748', // Dark gray
      700: '#4a5568', // Gray
      600: '#718096', // Light gray
      500: '#a0aec0', // Lighter gray
      100: '#f7fafc', // Off-white
    },
  },
  fonts: {
    heading: `'Helvetica Neue', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.800',
          color: 'white',
          _hover: {
            bg: 'brand.700',
          },
        },
      },
    },
  },
});

export default theme;