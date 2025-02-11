import { Flex, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex as="footer" width="full" justifyContent="center">
      <Text fontSize="sm">
        {new Date().getFullYear()} -{' '}
        Brendan Laschke
      </Text>
    </Flex>
  );
};
