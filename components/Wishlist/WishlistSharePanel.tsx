import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { WISHLIST_PANEL_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    count: number;
    onShareWhatsApp: () => void;
    onCopyLink: () => void;
    onOpenShareSheet: () => void;
};

const ShareButton = ({ icon, label, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-4 py-4">
        <Feather name={icon} size={16} color="#4A2E24" />
        <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default function WishlistSharePanel({ count, onShareWhatsApp, onCopyLink, onOpenShareSheet }: Props) {
    return (
        <View className="overflow-hidden rounded-[30px] border border-[#EADBCB] bg-white p-6" style={WISHLIST_PANEL_SHADOW}>
            <Text className="mb-2 text-[12px] uppercase tracking-[2px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                Share wishlist
            </Text>
            <Text className="mb-3 text-[28px] leading-[34px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                Make gifting easier
            </Text>
            <Text className="mb-5 text-[15px] leading-7 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                Send your saved pieces to a partner, a stylist, or your own future self. Shared wishlists convert admiration into purchase intent.
            </Text>

            <View className="mb-5 flex-row flex-wrap gap-3">
                <View className="rounded-full bg-[#F3E2C6] px-4 py-2">
                    <Text className="text-[12px] uppercase tracking-[1.8px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                        {count} pieces ready to share
                    </Text>
                </View>
                <View className="rounded-full bg-[#FBF3E9] px-4 py-2">
                    <Text className="text-[12px] uppercase tracking-[1.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                        Great for gifting
                    </Text>
                </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
                <ShareButton icon="message-circle" label="WhatsApp" onPress={onShareWhatsApp} />
                <ShareButton icon="link-2" label="Copy Link" onPress={onCopyLink} />
                <ShareButton icon="share-2" label="Social Share" onPress={onOpenShareSheet} />
            </View>
        </View>
    );
}
