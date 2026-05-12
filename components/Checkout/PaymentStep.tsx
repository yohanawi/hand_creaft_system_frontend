import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CheckoutCard from './CheckoutCard';
import { PaymentMethod } from './checkout.types';

type Props = {
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    payHereAvailable: boolean;
    payHereMessage: string;
    customerNote: string;
    setCustomerNote: (value: string) => void;
    couponCode: string;
    setCouponCode: (value: string) => void;
    couponLoading: boolean;
    handleApplyCoupon: () => void;
    onBack: () => void;
    onNext: () => void;
};

export default function PaymentStep({
    paymentMethod,
    setPaymentMethod,
    payHereAvailable,
    payHereMessage,
    customerNote,
    setCustomerNote,
    couponCode,
    setCouponCode,
    couponLoading,
    handleApplyCoupon,
    onBack,
    onNext,
}: Props) {
    return (
        <CheckoutCard>
            <Text className="mb-1 text-xl font-extrabold text-[#2E1B12]">
                Payment Method
            </Text>
            <Text className="mb-5 text-sm text-[#8B7355]">
                Choose how you want to pay for your order.
            </Text>

            {([
                {
                    id: 'payhere',
                    icon: 'shield',
                    title: 'PayHere Secure Payment',
                    subtitle: 'Card / wallet payment',
                    disabled: !payHereAvailable,
                },
                {
                    id: 'cod',
                    icon: 'package',
                    title: 'Cash on Delivery',
                    subtitle: 'Pay when your order arrives',
                    disabled: false,
                },
            ] as const).map(option => {
                const selected = paymentMethod === option.id;

                return (
                    <TouchableOpacity
                        key={option.id}
                        disabled={option.disabled}
                        activeOpacity={0.85}
                        onPress={() => setPaymentMethod(option.id)}
                        className={`mb-3 flex-row items-center rounded-3xl border p-4 
                            ${selected
                                ? 'border-[#7A3E1D] bg-[#FFF3E6]'
                                : 'border-[#E7D6C4] bg-white'
                            }`} style={{ opacity: option.disabled ? 0.55 : 1 }}>
                        <View className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-[#7A3E1D]' : 'border-[#D8C2AA]'}`} >
                            {selected && <View className="h-2.5 w-2.5 rounded-full bg-[#7A3E1D]" />}
                        </View>

                        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E4D3]">
                            <Feather name={option.icon} size={20} color="#7A3E1D" />
                        </View>

                        <View className="flex-1">
                            <Text className="font-extrabold text-[#2E1B12]">{option.title}</Text>
                            <Text className="text-xs text-[#8B7355]">{option.subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}

            {!payHereAvailable && payHereMessage ? (
                <View className="p-4 mb-4 rounded-2xl bg-amber-50">
                    <Text className="text-xs font-semibold text-amber-700">
                        {payHereMessage}. Cash on Delivery is available.
                    </Text>
                </View>
            ) : null}

            <View className="mb-4">
                <Text className="mb-1 text-sm font-bold text-[#5A321B]">
                    Order Note
                </Text>
                <TextInput
                    value={customerNote}
                    onChangeText={setCustomerNote}
                    multiline
                    numberOfLines={3}
                    placeholder="Gift wrapping, special delivery notes..."
                    placeholderTextColor="#B99B83"
                    className="rounded-2xl border border-[#E7D6C4] bg-[#FFF9F3] px-4 py-3 text-base text-[#2E1B12]"
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
            </View>

            <View className="mb-5">
                <Text className="mb-1 text-sm font-bold text-[#5A321B]">
                    Coupon Code
                </Text>

                <View className="flex-row gap-3">
                    <TextInput
                        value={couponCode}
                        onChangeText={setCouponCode}
                        autoCapitalize="characters"
                        placeholder="HANDMADE10"
                        placeholderTextColor="#B99B83"
                        className="flex-1 rounded-2xl border border-[#E7D6C4] bg-[#FFF9F3] px-4 py-3 text-base text-[#2E1B12]"
                    />

                    <TouchableOpacity
                        disabled={couponLoading}
                        onPress={handleApplyCoupon}
                        className="items-center justify-center rounded-2xl bg-[#7A3E1D] px-5"
                    >
                        {couponLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="font-extrabold text-white">Apply</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onBack}
                    className="flex-1 items-center rounded-2xl border border-[#7A3E1D] py-4"
                >
                    <Text className="font-extrabold text-[#7A3E1D]">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNext}
                    className="flex-1 items-center rounded-2xl bg-[#7A3E1D] py-4"
                >
                    <Text className="font-extrabold text-white">Review Order</Text>
                </TouchableOpacity>
            </View>
        </CheckoutCard>
    );
}