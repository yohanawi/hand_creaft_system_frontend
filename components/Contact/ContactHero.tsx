import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

const STUDIO_PROMISES = [
    { label: 'Response cadence', value: 'Within 24 hours' },
    { label: 'Handmade care support', value: 'Sizing, upkeep, repairs' },
    { label: 'Order assistance', value: 'Shipping, gifting, custom notes' },
];

interface ContactHeroProps {
    isDesktop: boolean;
    isTablet: boolean;
    isCompact: boolean;
    userToken: string | null | undefined;
    onEmailPress: () => void;
    onViewTicketsPress: () => void;
}

export default function ContactHero({
    isDesktop,
    isTablet,
    isCompact,
    userToken,
    onEmailPress,
    onViewTicketsPress,
}: ContactHeroProps) {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const heroLiftAnim = useState(new Animated.Value(28))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
            Animated.timing(heroLiftAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, heroLiftAnim]);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: heroLiftAnim }] }}>
            <LinearGradient
                colors={[BROWN.DarkColor, '#8C5A3C', BROWN.SecondaryBackground]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="overflow-hidden rounded-[34px]"
            >
                <View
                    className={`self-center w-full ${isDesktop ? 'flex-row items-stretch justify-between' : 'flex-col'}`}
                    style={{ maxWidth: 1160, padding: isCompact ? 22 : 34 }}
                >
                    {/* Left – heading + CTAs */}
                    <View className={isDesktop ? 'w-[58%] pr-8' : 'w-full'}>
                        <Text
                            className="font-body text-[12px] uppercase tracking-[2.2px]"
                            style={{ color: '#F3DDCA' }}
                        >
                            Contact the atelier
                        </Text>

                        <Text
                            className="mt-4 font-heading"
                            style={{
                                color: '#FFFFFF',
                                fontSize: isCompact ? 34 : isTablet ? 48 : 56,
                                lineHeight: isCompact ? 40 : isTablet ? 56 : 64,
                            }}
                        >
                            Every handcrafted piece begins with a conversation.
                        </Text>

                        <Text
                            className="mt-5 font-body"
                            style={{
                                color: '#F9EDE3',
                                fontSize: isCompact ? 15 : 17,
                                lineHeight: isCompact ? 26 : 30,
                                maxWidth: 620,
                            }}
                        >
                            Ask about sizing, gemstone care, gifting, shipping, or order support.
                            Messages submitted here are routed through the support desk and stored
                            in the database as customer tickets.
                        </Text>

                        <View className={`mt-8 gap-3 ${isTablet ? 'flex-row flex-wrap' : 'flex-col'}`}>
                            <TouchableOpacity
                                onPress={onEmailPress}
                                activeOpacity={0.9}
                                className="px-5 py-4 rounded-full"
                                style={{ backgroundColor: '#FFF4EA' }}
                            >
                                <Text
                                    className="font-body text-[14px] font-semibold"
                                    style={{ color: BROWN.DarkColor }}
                                >
                                    Email the concierge
                                </Text>
                            </TouchableOpacity>

                            {userToken ? (
                                <TouchableOpacity
                                    onPress={onViewTicketsPress}
                                    activeOpacity={0.9}
                                    className="px-5 py-4 border rounded-full"
                                    style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                                >
                                    <Text className="font-body text-[14px] font-semibold text-white">
                                        View my tickets
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    {/* Right – studio promises */}
                    <View className={`mt-8 ${isDesktop ? 'mt-0 w-[36%]' : 'w-full'}`}>
                        <View
                            className="rounded-[28px] border px-5 py-6"
                            style={{
                                borderColor: 'rgba(255,255,255,0.14)',
                                backgroundColor: 'rgba(255,248,242,0.14)',
                            }}
                        >
                            <Text
                                className="font-body text-[11px] uppercase tracking-[1.8px]"
                                style={{ color: '#F3DDCA' }}
                            >
                                Studio promise
                            </Text>

                            <View className="gap-4 mt-5">
                                {STUDIO_PROMISES.map((item) => (
                                    <View
                                        key={item.label}
                                        className="rounded-[22px] px-4 py-4"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    >
                                        <Text
                                            className="font-body text-[12px]"
                                            style={{ color: '#F6E7DA' }}
                                        >
                                            {item.label}
                                        </Text>
                                        <Text
                                            className="mt-2 font-heading text-[22px]"
                                            style={{ color: '#FFFFFF', fontFamily: BRAND_FONTS.heading }}
                                        >
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}
