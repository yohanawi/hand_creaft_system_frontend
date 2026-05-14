import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';

type Props = {
    itemCount: number;
    isCompact: boolean;
};

export default function WishlistHeader({ itemCount, isCompact }: Props) {
    return (
        <View className="overflow-hidden bg-[#140D0B]">
            {/* HERO IMAGE */}
            <View className="relative h-[430px] md:h-[540px]">
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1600&auto=format&fit=crop',
                    }}
                    contentFit="cover"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                    }}
                />

                {/* DARK OVERLAY */}
                <LinearGradient
                    colors={[
                        'rgba(15,10,8,0.88)',
                        'rgba(36,20,16,0.72)',
                        'rgba(74,46,36,0.82)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                    }}
                />

                {/* GLOW */}
                <View
                    style={{
                        position: 'absolute',
                        top: -80,
                        right: -40,
                        width: 240,
                        height: 240,
                        borderRadius: 999,
                        backgroundColor: 'rgba(243,226,198,0.08)',
                    }}
                />

                <View
                    style={{
                        position: 'absolute',
                        bottom: -100,
                        left: -50,
                        width: 260,
                        height: 260,
                        borderRadius: 999,
                        backgroundColor: 'rgba(184,130,88,0.12)',
                    }}
                />

                {/* CONTENT */}
                <View className="justify-center flex-1 px-5 md:px-8">
                    <View className="w-full max-w-6xl mx-auto">
                        {/* MAIN CONTENT */}
                        <View className="max-w-3xl">
                            <Text className="text-[42px] leading-[52px] text-white md:text-[68px] md:leading-[78px]" style={{ fontFamily: WISHLIST_SERIF }}>
                                Your Jewelry Wishlist
                            </Text>
                            <View className="my-5 h-[2px] w-24 bg-[#F3E2C6]" />
                            <Text className="max-w-2xl text-[16px] leading-8 text-[#F6EADF] md:text-[18px]" style={{ fontFamily: WISHLIST_SANS }} >
                                Curate your favorite handcrafted rings, necklaces,
                                bracelets, and timeless artisan pieces before they
                                disappear from our limited collections.
                            </Text>

                            {/* ACTION BUTTONS */}
                            <View className="flex-row flex-wrap gap-4 mt-8">
                                <TouchableOpacity activeOpacity={0.85} className="flex-row items-center gap-3 rounded-full bg-[#F3E2C6] px-7 py-4">
                                    <Feather name="shopping-bag" size={18} color="#4A2E24" />
                                    <Text className="text-sm uppercase tracking-[1.8px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                        Explore Collection
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity activeOpacity={0.85}
                                    className="flex-row items-center gap-3 py-4 border rounded-full border-white/20 bg-white/10 px-7">
                                    <Feather name="share-2" size={18} color="#FFFFFF" />
                                    <Text className="text-sm uppercase tracking-[1.8px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                        Share Wishlist
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}