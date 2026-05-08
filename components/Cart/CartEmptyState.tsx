import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CARD_SHADOW, CART_COLORS, SANS_FONT, SERIF_FONT } from './cartTheme';

type Props = {
    onBrowseCollections: () => void;
};

export default function CartEmptyState({ onBrowseCollections }: Props) {
    return (
        <View className="overflow-hidden rounded-[32px] border border-[#E9D9C9] bg-white px-6 py-12 md:px-10 md:py-14" style={CARD_SHADOW}>
            <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F5E6D8]" />
            <View className="absolute bottom-0 left-0 h-16 w-16 rounded-tr-[32px] bg-[#FAEFE4]" />

            <View className="items-center">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#FFF5EB]">
                    <Feather name="shopping-bag" size={34} color={CART_COLORS.clay} />
                </View>
                <Text className="mb-3 text-center text-3xl text-[#36271E]" style={{ fontFamily: SERIF_FONT }}>
                    Your cart is empty
                </Text>
                <Text className="mb-8 max-w-[540px] text-center text-base leading-7 text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                    Start with statement rings, artisan pendants, or handcrafted sets and build a polished collection from there.
                </Text>

                <TouchableOpacity
                    onPress={onBrowseCollections}
                    activeOpacity={0.86}
                    className="rounded-full bg-[#6B4A36] px-7 py-4"
                    style={CARD_SHADOW}
                >
                    <Text className="text-base text-white" style={{ fontFamily: SANS_FONT }}>
                        Browse Collections
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
