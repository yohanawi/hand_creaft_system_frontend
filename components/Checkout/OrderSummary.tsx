import { useCurrency } from '@/context/CurrencyContext';
import { formatConvertedPrice } from '@/utils/currency';
import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CheckoutCard from './CheckoutCard';

type Props = {
    items: any[];
    subtotal: number;
    shippingCost: number;
    couponCode: string;
    setCouponCode: (value: string) => void;
    couponDiscount: number;
    couponLoading: boolean;
    handleApplyCoupon: () => void;
};

export default function OrderSummary({
    items,
    subtotal,
    shippingCost,
    couponCode,
    setCouponCode,
    couponDiscount,
    couponLoading,
    handleApplyCoupon,
}: Props) {
    const { currency } = useCurrency();
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    const tax = parseFloat((discountedSubtotal * 0.1).toFixed(2));
    const total = parseFloat((discountedSubtotal + shippingCost + tax).toFixed(2));

    const unitPrice = (item: any) =>
        item.salePrice !== null && item.salePrice < item.price
            ? item.salePrice
            : item.price;

    return (
        <CheckoutCard className="sticky top-4">
            <Text className="mb-1 text-lg font-extrabold text-[#2E1B12]">
                Order Summary
            </Text>
            <Text className="mb-5 text-xs text-[#8B7355]">
                Handmade pieces selected for you.
            </Text>

            {items.map(item => (
                <View key={`${item.product}:${item.selectedVariant?.variantId || 'base'}`} className="mb-4 border-b border-[#F0E1D2] pb-4">
                    <View className="flex-row justify-between">
                        <View className="flex-1 pr-3">
                            <Text numberOfLines={1} className="font-bold text-[#2E1B12]">
                                {item.name}
                            </Text>

                            {item.selectedVariant?.label ? (
                                <Text className="mt-1 text-xs font-bold text-[#7A3E1D]">
                                    {item.selectedVariant.label}
                                </Text>
                            ) : null}

                            <Text className="mt-1 text-xs text-[#8B7355]">
                                Qty: {item.quantity}
                            </Text>
                        </View>

                        <Text className="font-extrabold text-[#2E1B12]">
                            {formatConvertedPrice(unitPrice(item) * item.quantity, currency)}
                        </Text>
                    </View>
                </View>
            ))}

            <View className="mb-5">
                <Text className="mb-2 text-sm font-bold text-[#5A321B]">Promo Code</Text>

                <View className="flex-row gap-2">
                    <TextInput
                        value={couponCode}
                        onChangeText={setCouponCode}
                        autoCapitalize="characters"
                        placeholder="Coupon"
                        placeholderTextColor="#B99B83"
                        className="flex-1 rounded-2xl border border-[#E7D6C4] bg-[#FFF9F3] px-3 py-3 text-sm"
                    />

                    <TouchableOpacity
                        disabled={couponLoading}
                        onPress={handleApplyCoupon}
                        className="items-center justify-center rounded-2xl bg-[#7A3E1D] px-4"
                    >
                        {couponLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text className="text-sm font-extrabold text-white">Apply</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="gap-3">
                <Row label="Subtotal" value={formatConvertedPrice(subtotal, currency)} />

                {couponDiscount > 0 && (
                    <Row label="Discount" value={`-${formatConvertedPrice(couponDiscount, currency)}`} green />
                )}

                <Row label="Shipping" value={shippingCost === 0 ? 'FREE' : formatConvertedPrice(shippingCost, currency)} />
                <Row label="Tax 10%" value={formatConvertedPrice(tax, currency)} />

                <View className="mt-2 border-t border-[#F0E1D2] pt-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-extrabold text-[#2E1B12]">
                            Total
                        </Text>
                        <Text className="text-2xl font-black text-[#7A3E1D]">
                            {formatConvertedPrice(total, currency)}
                        </Text>
                    </View>
                </View>
            </View>
        </CheckoutCard>
    );
}

function Row({
    label,
    value,
    green = false,
}: {
    label: string;
    value: string;
    green?: boolean;
}) {
    return (
        <View className="flex-row justify-between">
            <Text className={`text-sm ${green ? 'text-green-700' : 'text-[#8B7355]'}`}>
                {label}
            </Text>
            <Text className={`text-sm font-bold ${green ? 'text-green-700' : 'text-[#2E1B12]'}`}>
                {value}
            </Text>
        </View>
    );
}