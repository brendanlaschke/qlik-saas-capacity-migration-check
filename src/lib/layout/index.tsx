'use client';

import { Box, ClientOnly } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { Footer } from './components/footer';
import { Header } from './components/header';

type LayoutProps = {
    children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
    return (
        <Box margin="0 auto" maxWidth={800} transition="0.5s ease-out">
            <Box padding="8">
                <Header />
                <Box as="main" marginY={22}>
                    <ClientOnly>{children}</ClientOnly>
                </Box>
                <Footer />
            </Box>
        </Box>
    );
};
