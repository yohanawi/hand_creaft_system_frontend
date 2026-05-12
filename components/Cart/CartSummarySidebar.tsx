import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { CARD_SHADOW, FREE_SHIPPING_THRESHOLD, SANS_FONT, SERIF_FONT } from './cartTheme';
import { estimateDeliveryLabel, formatCurrency, freeShippingRemainder } from './cartUtils';

type Props = {
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
    itemCount: number;
    isDesktop: boolean;
    onCheckout: () => void;
    onContinueShopping: () => void;
};

const SummaryRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <View className="flex-row items-center justify-between py-2.5">
        <Text className={`${highlight ? 'text-lg text-[#2E221B]' : 'text-sm text-[#7D6B5D]'}`} style={{ fontFamily: highlight ? SERIF_FONT : SANS_FONT }}>
            {label}
        </Text>
        <Text className={`${highlight ? 'text-2xl text-[#2E221B]' : 'text-sm text-[#2E221B]'}`} style={{ fontFamily: highlight ? SERIF_FONT : SANS_FONT }}>
            {value}
        </Text>
    </View>
);

export default function CartSummarySidebar({
    subtotal,
    shippingCost,
    tax,
    discount,
    total,
    itemCount,
    isDesktop,
    onCheckout,
    onContinueShopping,
}: Props) {
    const remainder = freeShippingRemainder(subtotal);
    const stickyStyle = Platform.OS === 'web' && isDesktop ? ({ position: 'sticky', top: 24 } as any) : null;

    return (
        <View style={stickyStyle}>
            <LinearGradient
                colors={['#FFFDFC', '#F5ECE3']}
                className="overflow-hidden rounded-[30px] border border-[#E7D7C7] p-5 md:p-6"
                style={CARD_SHADOW}
            >
                <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#F3E1D2]" />

                <Text className="mb-5 text-2xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                    Order Summary
                </Text>

                <View className="rounded-[24px] bg-white/90 px-4 py-3">
                    <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                    <SummaryRow label="Discount" value={discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)} />
                    <SummaryRow label="Shipping" value={shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)} />
                    <SummaryRow label="Tax" value={formatCurrency(tax)} />
                    <View className="my-2 h-px bg-[#E7D7C7]" />
                    <SummaryRow label="Total" value={formatCurrency(total)} highlight />
                </View>

                <View className="mt-5 rounded-[24px] bg-[#2E221B] px-4 py-4">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="items-center justify-center rounded-full h-11 w-11 bg-white/10">
                            <Feather name="truck" size={18} color="#F6D5A7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-white/80" style={{ fontFamily: SANS_FONT }}>
                                Shipping Info Preview
                            </Text>
                            <Text className="text-lg text-white" style={{ fontFamily: SERIF_FONT }}>
                                {estimateDeliveryLabel(itemCount)}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-sm leading-6 text-white/80" style={{ fontFamily: SANS_FONT }}>
                        Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
                        {remainder > 0 ? ` Add ${formatCurrency(remainder)} more to unlock it.` : ' You have already unlocked complimentary delivery.'}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onCheckout}
                    activeOpacity={0.86}
                    className="mt-5 flex-row items-center justify-center rounded-full bg-[#317159] px-5 py-4"
                    style={CARD_SHADOW}
                >
                    <Text className="mr-2 text-base text-white" style={{ fontFamily: SANS_FONT }}>
                        Proceed to Checkout
                    </Text>
                    <Feather name="arrow-right" size={17} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onContinueShopping} activeOpacity={0.82} className="mt-3 rounded-full border border-[#DCC6B2] px-5 py-4">
                    <Text className="text-center text-sm text-[#2E221B]" style={{ fontFamily: SANS_FONT }}>
                        Continue Shopping
                    </Text>
                </TouchableOpacity>

                <View className="mt-6 gap-3 rounded-[24px] border border-[#E7D7C7] bg-white/75 p-4">
                    {[
                        { icon: 'lock', text: 'Secure payments' },
                        { icon: 'award', text: 'Authentic handcrafted jewelry' },
                        { icon: 'refresh-cw', text: 'Easy returns' },
                        { icon: 'shield', text: 'Warranty and guarantee support' },
                    ].map((signal) => (
                        <View key={signal.text} className="flex-row items-center gap-3">
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F7EFE7]">
                                <Feather name={signal.icon as any} size={15} color="#6B4A36" />
                            </View>
                            <Text className="flex-1 text-sm text-[#5F4A3C]" style={{ fontFamily: SANS_FONT }}>
                                {signal.text}
                            </Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </View>
    );
}
