import Footer from '@/components/Common/Footer';
import Header from '@/components/Common/Header';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    // Intentionally minimal: pages can decide their own ScrollView/layout.
}>;

export default function PageShell({ children }: Props) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
