import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaLeaf, FaTshirt, FaHeart } from 'react-icons/fa';

const AboutUsPage = () => {
  return (
    <Container maxW="container.lg" py={12}>
      <VStack spacing={8} textAlign="center">
        <Heading as="h1" size="2xl">
          Our Story
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="3xl">
          StyleVault was founded on the belief that fashion should be both beautiful and mindful. We're a collective of designers, artisans, and dreamers dedicated to creating high-quality, timeless apparel that you can feel good about wearing.
        </Text>
      </VStack>

      <Image
        src="https://placehold.co/1200x500/f7fafc/a0aec0?text=Our+Workspace"
        alt="Our Workspace"
        borderRadius="md"
        my={12}
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={10}>
        <VStack spacing={4}>
          <Icon as={FaLeaf} w={12} h={12} color="green.400" />
          <Heading as="h3" size="lg">
            Sustainability
          </Heading>
          <Text color="gray.600">
            We are committed to minimizing our environmental footprint by using sustainable materials like organic cotton and linen, and adopting eco-friendly production processes.
          </Text>
        </VStack>
        <VStack spacing={4}>
          <Icon as={FaTshirt} w={12} h={12} color="blue.400" />
          <Heading as="h3" size="lg">
            Quality Craftsmanship
          </Heading>
          <Text color="gray.600">
            Every piece in our collection is crafted with meticulous attention to detail. We prioritize durable construction and premium fabrics to ensure your clothing lasts.
          </Text>
        </VStack>
        <VStack spacing={4}>
          <Icon as={FaHeart} w={12} h={12} color="red.400" />
          <Heading as="h3" size="lg">
            Ethical Philosophy
          </Heading>
          <Text color="gray.600">
            We partner with factories that share our commitment to fair wages, safe working conditions, and ethical treatment of all workers in our supply chain.
          </Text>
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default AboutUsPage;