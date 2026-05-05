import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const CONTACT_METHODS = [
    {
        icon: 'phone',
        title: 'Customer support',
        detail: '+1 (555) 123-4567',
        note: 'Mon to Fri · 9AM to 6PM',
        href: 'tel:+15551234567',
        colors: ['#714329', '#B08463'],
    },
    {
        icon: 'mail',
        title: 'Email us',
        detail: 'support@shophub.com',
        note: 'We reply within 24 hours',
        href: 'mailto:support@shophub.com',
        colors: ['#B9937B', '#D0B9A7'],
    },
    {
        icon: 'map-pin',
        title: 'Visit our store',
        detail: '123 Shopping Street',
        note: 'New York, NY 10001',
        href: 'https://maps.google.com/?q=123+Shopping+Street+New+York+NY+10001',
        colors: ['#8C5A3C', '#B9937B'],
    },
] as const;

interface ContactMethodsProps {
    isDesktop: boolean;
    isTablet: boolean;
    onMethodPress: (href: string) => void;
}

export default function ContactMethods({ isDesktop, isTablet, onMethodPress }: ContactMethodsProps) {
    return (
        <View className={`grid md:grid-cols-3 items-center justify-items-center gap-4 `}>
            {CONTACT_METHODS.map((method) => (
                <TouchableOpacity
                    key={method.title}
                    activeOpacity={0.92}
                    onPress={() => onMethodPress(method.href)}
                    className="rounded-[28px] p-5 w-full"
                >
                    <LinearGradient
                        colors={method.colors as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-[28px] p-5 "
                    >
                        <View className="self-center p-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                            <Feather name={method.icon as keyof typeof Feather.glyphMap} size={20} color="#FFFFFF" />
                        </View>
                        <Text className="mt-5 font-heading text-[24px] text-center" style={{ color: '#FFFFFF' }}>
                            {method.title}
                        </Text>
                        <Text className="mt-2 font-body text-[15px] font-semibold text-center" style={{ color: '#FFF6EF' }}>
                            {method.detail}
                        </Text>
                        <Text className="mt-2 font-body text-[13px] leading-6 text-center" style={{ color: '#F8E9DE' }}>
                            {method.note}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </View>
    );
}
