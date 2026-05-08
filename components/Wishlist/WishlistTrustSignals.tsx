import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { WISHLIST_PANEL_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';
import { TRUST_SIGNALS } from './wishlistUtils';

type Props = {
    isCompact: boolean;
};

export default function WishlistTrustSignals({ isCompact }: Props) {
    return (
        <View className="overflow-hidden rounded-[30px] border border-[#EADBCB] bg-white p-6" style={WISHLIST_PANEL_SHADOW}>
            <Text className="mb-2 text-[12px] uppercase tracking-[2px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                Trust signals
            </Text>
            <Text className="mb-5 text-[28px] leading-[34px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                Confidence before checkout
            </Text>
            <View className={`gap-4 ${isCompact ? '' : 'md:flex-row'}`}>
                {TRUST_SIGNALS.map((signal) => (
                    <View key={signal.title} className="flex-1 rounded-[24px] border border-[#F0E3D7] bg-[#FFF8F1] p-4">
                        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#4A2E24]">
                            <Feather name={signal.icon as React.ComponentProps<typeof Feather>['name']} size={18} color="#F3E2C6" />
                        </View>
                        <Text className="mb-2 text-[19px] leading-6 text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                            {signal.title}
                        </Text>
                        <Text className="text-[14px] leading-6 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                            {signal.description}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
