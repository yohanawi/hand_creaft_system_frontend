import { useCurrency } from '@/context/CurrencyContext';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { formatConvertedPrice } from '@/utils/currency';
import CheckoutCard from './CheckoutCard';
import { PaymentMethod, ShippingForm } from './checkout.types';

type Props = {
    form: ShippingForm;
    paymentMethod: PaymentMethod;
    customerNote: string;
    couponCode: string;
    couponDiscount: number;
    loading: boolean;
    onEditShipping: () => void;
    onEditPayment: () => void;
    onBack: () => void;
    onPlaceOrder: () => void;
};

export default function ReviewStep({
    form,
    paymentMethod,
    customerNote,
    couponCode,
    couponDiscount,
    loading,
    onEditShipping,
    onEditPayment,
    onBack,
    onPlaceOrder,
}: Props) {
    const { currency } = useCurrency();

    return (
        <CheckoutCard>
            <Text className="mb-1 text-xl font-extrabold text-[#2E1B12]">
                Review Your Order
            </Text>
            <Text className="mb-5 text-sm text-[#8B7355]">
                Confirm your details before placing the order.
            </Text>

            <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-bold text-[#5A321B]">Shipping To</Text>
                    <TouchableOpacity onPress={onEditShipping}>
                        <Text className="text-xs font-bold text-[#7A3E1D]">Edit</Text>
                    </TouchableOpacity>
                </View>

                <View className="rounded-3xl bg-[#FFF9F3] p-4">
                    <Text className="font-extrabold text-[#2E1B12]">{form.fullName}</Text>
                    <Text className="mt-1 text-sm text-[#8B7355]">{form.address}</Text>
                    <Text className="text-sm text-[#8B7355]">
                        {form.city}, {form.state} {form.zipCode}
                    </Text>
                    <Text className="text-sm text-[#8B7355]">{form.country}</Text>
                    <Text className="mt-1 text-sm text-[#8B7355]">{form.phone}</Text>
                </View>
            </View>

            <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-bold text-[#5A321B]">Payment</Text>
                    <TouchableOpacity onPress={onEditPayment}>
                        <Text className="text-xs font-bold text-[#7A3E1D]">Edit</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center rounded-3xl bg-[#FFF9F3] p-4">
                    <Feather name={paymentMethod === 'payhere' ? 'shield' : 'package'} size={20} color="#7A3E1D" />
                    <Text className="ml-3 font-extrabold text-[#2E1B12]">
                        {paymentMethod === 'payhere' ? 'PayHere Secure Payment' : 'Cash on Delivery'}
                    </Text>
                </View>
            </View>

            {customerNote.trim() ? (
                <View className="mb-5 rounded-3xl bg-[#FFF9F3] p-4">
                    <Text className="mb-1 font-bold text-[#5A321B]">Order Note</Text>
                    <Text className="text-sm text-[#8B7355]">{customerNote}</Text>
                </View>
            ) : null}

            {couponDiscount > 0 ? (
                <View className="flex-row items-center justify-between p-4 mb-5 rounded-3xl bg-green-50">
                    <Text className="font-extrabold text-green-800">
                        {couponCode.toUpperCase()}
                    </Text>
                    <Text className="font-extrabold text-green-800">
                        -{formatConvertedPrice(couponDiscount, currency)}
                    </Text>
                </View>
            ) : null}

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onBack}
                    className="flex-1 items-center rounded-2xl border border-[#7A3E1D] py-4"
                >
                    <Text className="font-extrabold text-[#7A3E1D]">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={loading}
                    onPress={onPlaceOrder}
                    className={`flex-[1.5] flex-row items-center justify-center rounded-2xl py-4 
                        ${loading ?
                            'bg-gray-300' : 'bg-[#7A3E1D]'
                        }`} >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="mr-2 font-extrabold text-white">Place Order</Text>
                            <Feather name="check" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </CheckoutCard>
    );
}