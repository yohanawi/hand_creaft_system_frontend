import React from 'react';
import { Text, View } from 'react-native';
import { WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export default function WishlistSectionHeader({ eyebrow, title, description, action }: Props) {
    return (
        <View className="mb-5 flex-row flex-wrap items-end justify-between gap-4">
            <View className="max-w-2xl">
                <Text className="mb-2 text-xs uppercase tracking-[2.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                    {eyebrow}
                </Text>
                <Text className="mb-2 text-[30px] leading-[38px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                    {title}
                </Text>
                <Text className="text-[15px] leading-7 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                    {description}
                </Text>
            </View>
            {action ? <View>{action}</View> : null}
        </View>
    );
}
