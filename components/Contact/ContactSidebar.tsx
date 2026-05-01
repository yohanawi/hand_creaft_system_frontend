import { BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

const FAQS = [
    {
        question: 'Can I ask about sizing before ordering?',
        answer:
            'Yes. Send your preferred fit or wrist size and we will guide you before you purchase.',
    },
    {
        question: 'Are contact messages saved to my account?',
        answer:
            'If you are signed in, your message is created as a support ticket and stored with your customer account.',
    },
    {
        question: 'Can I get help with returns or repairs?',
        answer:
            'Yes. Use the form and choose the most relevant topic so our team can route it quickly.',
    },
];

const STUDIO_HOURS = [
    { day: 'Monday to Friday', hours: '9AM to 6PM' },
    { day: 'Saturday', hours: '10AM to 4PM' },
    { day: 'Sunday', hours: 'Closed' },
];

interface ContactSidebarProps {
    isDesktop: boolean;
    isCompact: boolean;
    onDirectionsPress: () => void;
}

export default function ContactSidebar({
    isDesktop,
    isCompact,
    onDirectionsPress,
}: ContactSidebarProps) {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const asideSlideAnim = useState(new Animated.Value(32))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
            Animated.timing(asideSlideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
        ]).start();
    }, [asideSlideAnim, fadeAnim]);

    return (
        <Animated.View
            style={{
                flex: isDesktop ? 1 : undefined,
                width: isDesktop ? undefined : '100%',
                minWidth: 0,
                opacity: fadeAnim,
                transform: [{ translateX: asideSlideAnim }],
            }}
        >
            <View
                className="rounded-[34px] border px-5 py-6"
                style={{ borderColor: '#ECD9CA', backgroundColor: '#FFF4EA' }}
            >
                <Text
                    className="font-body text-[12px] uppercase tracking-[2px]"
                    style={{ color: '#A16D52' }}
                >
                    Visit and timing
                </Text>

                {/* Location card */}
                <View className="mt-4 rounded-[28px] overflow-hidden">
                    <LinearGradient
                        colors={['#F7E8DA', '#E8CCB6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-5 py-6"
                    >
                        <View
                            className="self-start p-3 rounded-full"
                            style={{ backgroundColor: 'rgba(113,67,41,0.08)' }}
                        >
                            <Feather name="map-pin" size={18} color={BROWN.DarkColor} />
                        </View>

                        <Text
                            className="mt-4 font-heading text-[26px]"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            New York Atelier
                        </Text>

                        <Text
                            className="mt-2 font-body text-[14px] leading-7"
                            style={{ color: BROWN.TextSecondary }}
                        >
                            123 Shopping Street{isCompact ? '\n' : ', '}New York, NY 10001
                        </Text>

                        <TouchableOpacity
                            onPress={onDirectionsPress}
                            activeOpacity={0.9}
                            className="self-start px-4 py-3 mt-5 rounded-full"
                            style={{ backgroundColor: '#FFFFFF' }}
                        >
                            <Text
                                className="font-body text-[13px] font-semibold"
                                style={{ color: BROWN.DarkColor }}
                            >
                                Open directions
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Studio hours */}
                <View
                    className="mt-5 rounded-[28px] border px-5 py-5"
                    style={{ borderColor: '#E8D7C8', backgroundColor: '#FFFFFF' }}
                >
                    <View className="flex-row items-center">
                        <Feather name="clock" size={18} color={BROWN.DarkColor} />
                        <Text
                            className="ml-3 font-heading text-[24px]"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            Studio hours
                        </Text>
                    </View>

                    <View className="gap-3 mt-4">
                        {STUDIO_HOURS.map((row) => (
                            <View
                                key={row.day}
                                className="flex-row items-center justify-between rounded-[20px] px-4 py-3"
                                style={{ backgroundColor: '#FAF0E8' }}
                            >
                                <Text
                                    className="font-body text-[13px]"
                                    style={{ color: BROWN.TextSecondary }}
                                >
                                    {row.day}
                                </Text>
                                <Text
                                    className="font-body text-[13px] font-semibold"
                                    style={{ color: BROWN.TextPrimary }}
                                >
                                    {row.hours}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* FAQs */}
                <View
                    className="mt-5 rounded-[28px] border px-5 py-5"
                    style={{ borderColor: '#E8D7C8', backgroundColor: '#FFFFFF' }}
                >
                    <Text
                        className="font-heading text-[24px]"
                        style={{ color: BROWN.TextPrimary }}
                    >
                        Quick answers
                    </Text>

                    <View className="gap-4 mt-4">
                        {FAQS.map((faq) => (
                            <View
                                key={faq.question}
                                className="rounded-[22px] px-4 py-4"
                                style={{ backgroundColor: '#FAF5EF' }}
                            >
                                <Text
                                    className="font-body text-[13px] font-semibold leading-6"
                                    style={{ color: BROWN.TextPrimary }}
                                >
                                    {faq.question}
                                </Text>
                                <Text
                                    className="mt-2 font-body text-[13px] leading-6"
                                    style={{ color: BROWN.TextSecondary }}
                                >
                                    {faq.answer}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}
