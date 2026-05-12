import React, { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function CheckoutCard({ children, className = '' }: Props) {
    return (
        <View className={`rounded-[28px] border border-[#E8D8C6] bg-white p-5 shadow-sm md:p-6 ${className}`}>
            {children}
        </View>
    );
}