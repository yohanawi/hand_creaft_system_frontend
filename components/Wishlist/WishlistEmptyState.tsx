import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { WISHLIST_CARD_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    onExplore: () => void;
};

export default function WishlistEmptyState({ onExplore }: Props) {
    return (
        <View className="overflow-hidden rounded-[32px] border border-[#EADBCB] bg-white px-6 py-12 md:px-10 md:py-20 my-32" style={WISHLIST_CARD_SHADOW}>
            <View className="items-center">
                <View className="relative mb-7">
                    <View className="h-28 w-28 items-center justify-center rounded-full bg-[#FAF1E7] md:h-36 md:w-36">
                        <MaterialCommunityIcons name="heart-multiple-outline" size={60} color="#B88258" />
                    </View>
                    <View className="absolute -bottom-1 -right-2 h-11 w-11 items-center justify-center rounded-full bg-[#4A2E24]">
                        <Feather name="star" size={18} color="#F3E2C6" />
                    </View>
                </View>

                <Text className="mb-3 text-center text-[30px] leading-[38px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                    You have not saved anything yet
                </Text>
                <Text className="mb-8 max-w-xl text-center text-[15px] leading-7 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                    Discover rings, necklaces, earrings, and bracelets crafted to feel gift-worthy from the very first glance.
                </Text>

                <TouchableOpacity onPress={onExplore} activeOpacity={0.85} className="flex-row items-center gap-3 rounded-full bg-[#4A2E24] px-7 py-4">
                    <Text className="text-sm uppercase tracking-[1.8px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                        Explore Collection
                    </Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
