import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export default function WishlistSectionHeader({
    eyebrow,
    title,
    description,
    action,
}: Props) {
    return (
        <View className="mb-7 overflow-hidden rounded-[30px] border border-[#EADBCB] bg-[#FFFDFC] px-5 py-6 md:px-7 md:py-7">
            <View className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#F3E2C6]/50" />
            <View className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-[#FAF1E7]" />

            <View className="relative flex-row flex-wrap items-center justify-between gap-5">
                <View className="flex-1 max-w-2xl">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#4A2E24]">
                            <Feather name="heart" size={15} color="#F3E2C6" />
                        </View>

                        <View>
                            <Text className="text-[11px] uppercase tracking-[2.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                                {eyebrow}
                            </Text>
                            <View className="mt-1 h-[2px] w-12 rounded-full bg-[#B88258]" />
                        </View>
                    </View>

                    <Text className="mb-2 text-[30px] leading-[38px] text-[#271C18] md:text-[36px] md:leading-[44px]" style={{ fontFamily: WISHLIST_SERIF }}>
                        {title}
                    </Text>

                    <Text className="max-w-xl text-[15px] leading-7 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                        {description}
                    </Text>
                </View>

                {action ? (
                    <View className="rounded-full border border-[#EADBCB] bg-[#FFF8F1] p-1">
                        {action}
                    </View>
                ) : null}
            </View>
        </View>
    );
}