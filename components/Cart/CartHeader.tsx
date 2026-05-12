import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CARD_SHADOW, CART_COLORS, SANS_FONT, SERIF_FONT } from './cartTheme';

type Props = {
    cartCount: number;
    onNavigateHome: () => void;
    onNavigateShop: () => void;
};

const CRUMBS = [
    { label: 'Home', action: 'home' as const },
    { label: 'Shop', action: 'shop' as const },
    { label: 'Cart', action: 'current' as const },
];

export default function CartHeader({ cartCount, onNavigateHome, onNavigateShop }: Props) {
    return (
        <LinearGradient
            colors={['#2F241E', '#7B513B', '#D39B67']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-[32px] border border-white/15 px-5 py-6 md:px-8 md:py-8"
            style={CARD_SHADOW}
        >
            <View className="absolute rounded-full -right-8 -top-12 h-36 w-36 bg-white/10" />
            <View className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[48px] bg-white/10" />

            <View className="flex-row flex-wrap items-center justify-between gap-4">
                <View className="max-w-[720px]">
                    <View className="flex-row flex-wrap items-center gap-2 mb-4">
                        {CRUMBS.map((crumb, index) => {
                            const isCurrent = crumb.action === 'current';
                            const onPress = crumb.action === 'home' ? onNavigateHome : onNavigateShop;

                            return (
                                <View key={crumb.label} className="flex-row items-center gap-2">
                                    {isCurrent ? (
                                        <Text className="text-sm text-white/90" style={{ fontFamily: SANS_FONT }}>
                                            {crumb.label}
                                        </Text>
                                    ) : (
                                        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                                            <Text className="text-sm text-white/70" style={{ fontFamily: SANS_FONT }}>
                                                {crumb.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {index < CRUMBS.length - 1 ? <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.65)" /> : null}
                                </View>
                            );
                        })}
                    </View>

                    <Text className="mb-3 text-3xl text-white md:text-5xl" style={{ fontFamily: SERIF_FONT }}>
                        Shopping Cart
                    </Text>
                    <Text className="max-w-[580px] text-base leading-6 text-white/80 md:text-lg" style={{ fontFamily: SANS_FONT }}>
                        A polished review space for every handcrafted piece before it moves to checkout.
                    </Text>
                </View>

                <View className="min-w-[220px] rounded-[28px] border border-white/15 bg-white/12 px-5 py-4">
                    <View className="flex-row items-center gap-3">
                        <View className="items-center justify-center w-12 h-12 rounded-full bg-white/15">
                            <Feather name="shopping-bag" size={20} color={CART_COLORS.white} />
                        </View>
                        <View>
                            <Text className="text-xs uppercase tracking-[2px] text-white/65" style={{ fontFamily: SANS_FONT }}>
                                Pieces in Cart
                            </Text>
                            <Text className="text-2xl text-white" style={{ fontFamily: SERIF_FONT }}>
                                {cartCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}
