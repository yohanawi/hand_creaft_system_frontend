import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import { WISHLIST_COLORS, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    itemCount: number;
    isCompact: boolean;
};

export default function WishlistHeader({ itemCount, isCompact }: Props) {
    return (
        <View className="overflow-hidden rounded-b-[36px]">
            <LinearGradient
                colors={['#3F241D', '#6F4A3B', '#B88258']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-5 py-16 md:px-8 md:py-20"
            >
                <View className="mx-auto w-full max-w-6xl">
                    <View className="relative overflow-hidden rounded-[30px] border border-white/15 bg-white/10 px-6 py-7 md:px-10 md:py-10">
                        <View className="absolute -left-6 -top-6 opacity-10">
                            <MaterialCommunityIcons name="necklace" size={isCompact ? 96 : 140} color={WISHLIST_COLORS.white} />
                        </View>
                        <View className="absolute -bottom-5 right-2 opacity-10">
                            <MaterialCommunityIcons name="diamond-stone" size={isCompact ? 76 : 110} color={WISHLIST_COLORS.white} />
                        </View>

                        <View className="mb-5 flex-row flex-wrap items-center gap-3">
                            <View className="rounded-full border border-white/25 bg-white/15 px-4 py-2">
                                <Text className="text-xs uppercase tracking-[2.8px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                    Curated Keepsakes
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2 rounded-full border border-[#E7D0B1] bg-[#F3E2C6] px-4 py-2">
                                <Feather name="heart" size={14} color={WISHLIST_COLORS.espresso} />
                                <Text className="text-xs uppercase tracking-[2px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                    {itemCount} saved piece{itemCount === 1 ? '' : 's'}
                                </Text>
                            </View>
                        </View>

                        <Text className="max-w-3xl text-[34px] leading-[42px] text-white md:text-[48px] md:leading-[58px]" style={{ fontFamily: WISHLIST_SERIF }}>
                            Your Wishlist
                        </Text>
                        <View className="my-4 h-[2px] w-16 bg-[#F3E2C6]" />
                        <Text className="max-w-2xl text-[16px] leading-7 text-[#FDF0E4]" style={{ fontFamily: WISHLIST_SANS }}>
                            Save your favorite handcrafted pieces and turn admiration into an effortless luxury checkout moment.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}
