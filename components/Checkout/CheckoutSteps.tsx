import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { CheckoutStep } from './checkout.types';

type Props = {
    step: CheckoutStep;
};

const steps = [
    { n: 1, title: 'Shipping', icon: 'truck' },
    { n: 2, title: 'Payment', icon: 'credit-card' },
    { n: 3, title: 'Review', icon: 'check-circle' },
] as const;

export default function CheckoutSteps({ step }: Props) {
    return (
        <View className="mb-8 rounded-[28px] border border-[#E8D8C6] bg-[#FFF9F3] p-4">
            <View className="flex-row items-center">
                {steps.map((item, index) => {
                    const active = step >= item.n;

                    return (
                        <React.Fragment key={item.n}>
                            <View className="items-center">
                                <View className={`h-12 w-12 items-center justify-center rounded-full ${active ? 'bg-[#7A3E1D]' : 'bg-[#EFE1D1]'}`}>
                                    <Feather name={item.icon} size={19} color={active ? '#fff' : '#9A7A5F'} />
                                </View>

                                <Text className={`mt-2 text-xs font-bold ${active ? 'text-[#7A3E1D]' : 'text-[#9A7A5F]'}`}>
                                    {item.title}
                                </Text>
                            </View>

                            {index < steps.length - 1 && (
                                <View className={`mx-3 mb-6 h-1 flex-1 rounded-full ${step > item.n ? 'bg-[#7A3E1D]' : 'bg-[#EFE1D1]'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
}