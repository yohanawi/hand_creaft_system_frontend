import Footer from '@/components/Common/Footer';
import Header from '@/components/Common/Header';
import React, { PropsWithChildren } from 'react';
import { Animated } from 'react-native';

type Props = PropsWithChildren<{
    scrollY?: Animated.Value;
    // Intentionally minimal: pages can decide their own ScrollView/layout.
}>;

export default function PageShell({ children, scrollY }: Props) {
    return (
        <>
            <Header scrollY={scrollY} />
            {children}
            <Footer />
        </>
    );
}
