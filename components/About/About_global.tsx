import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Text, View } from "react-native";


export default function About_global() {
    const { width: W } = Dimensions.get('window');


    const Ring = ({ size, top, right, bottom, left, alpha = 0.15 }: {
        size: number; top?: number; right?: number; bottom?: number; left?: number; alpha?: number;
    }) => (
        <View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 1.5, borderColor: `rgba(113,67,41,${alpha})`,
            top, right, bottom, left,
        }} />
    );

    const SectionLabel = ({ text, light = false }: { text: string; light?: boolean }) => (
        <Text
            className={`mb-2 text-xs font-bold tracking-widest uppercase ${light ? 'text-brown-lightColor' : 'text-brown-DarkColor'}`}
            style={{ letterSpacing: 2.5 }}
        >
            {text}
        </Text>
    );

    const SectionTitle = ({ title, center = false, light = false, isMobile }: {
        title: string; center?: boolean; light?: boolean; isMobile: boolean;
    }) => (
        <Text
            className={`font-extrabold${center ? ' text-center' : ''} ${light ? 'text-brown-Background' : 'text-brown-TextPrimary'}`}
            style={{ fontSize: isMobile ? 28 : 40, lineHeight: isMobile ? 38 : 52 }}
        >
            {title}
        </Text>
    );

    const GoldDivider = () => (
        <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-brown-Border" />
            <View className="w-2 h-2 mx-2 rounded-full bg-brown-DarkColor" />
            <View className="w-1.5 h-1.5 rounded-full mx-1 bg-brown-lightColor" />
            <View className="w-2 h-2 mx-2 rounded-full bg-brown-DarkColor" />
            <View className="flex-1 h-px bg-brown-Border" />
        </View>
    );

    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1024;
    const px = isMobile ? 20 : 48;

    const globalTrust = [
        { icon: 'globe', title: '80+ Countries', desc: 'Trusted by clients across six continents — from Colombo to Copenhagen.' },
        { icon: 'truck', title: 'Insured Shipping', desc: 'Fully insured, tracked express delivery worldwide with discreet packaging.' },
        { icon: 'lock', title: 'Secure Payments', desc: 'Bank-grade 256-bit SSL encryption on every checkout and transaction.' },
        { icon: 'refresh-cw', title: 'Easy Returns', desc: '30-day hassle-free returns on all non-bespoke items, no questions asked.' },
    ];

    return (
        <View className="bg-brown-Background" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center">
                    <SectionLabel text="✦ Trusted Worldwide" />
                    <SectionTitle title={`Global Presence,\nLocal Heart`} center isMobile={isMobile} />
                    <GoldDivider />
                </View>

                {/* World banner */}
                <LinearGradient
                    colors={["#714329", "#B5A192", "#B9937B"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 24, padding: 40, alignItems: 'center', marginBottom: 24, overflow: 'hidden' }}
                >
                    <Ring size={320} top={-90} right={-90} alpha={0.12} />
                    <Ring size={180} bottom={-55} left={-55} alpha={0.09} />
                    <View
                        className="items-center justify-center w-24 h-24 mb-5 border-2 rounded-full bg-brown-Background border-brown-lightColor"
                    >
                        <Feather name="globe" size={46} color="#B08463" />
                    </View>
                    <Text className="mb-2 font-extrabold text-center text-brown-TextPrimary" style={{ fontSize: isMobile ? 26 : 36 }}>
                        Ships to 80+ Countries
                    </Text>
                    <Text className="text-sm text-center text-brown-TextSecondary" style={{ lineHeight: 22, maxWidth: 420 }}>
                        From our atelier in Colombo to your doorstep — anywhere in the world, fully insured, discreetly packaged, and expertly tracked.
                    </Text>
                </LinearGradient>

                {/* Trust pillars */}
                <View className="flex-row flex-wrap" style={{ justifyContent: 'space-between', gap: 16 }}>
                    {globalTrust.map((g, i) => (
                        <View
                            key={i}
                            className="flex-row items-center border bg-brown-lightBackground border-brown-Border rounded-2xl"
                            style={{
                                width: isMobile ? '100%' : '48%',
                                padding: 20,
                                gap: 16,
                                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
                            }}
                        >
                            <View className="items-center justify-center flex-shrink-0 w-12 h-12 rounded-2xl bg-brown-SecondaryBackground">
                                <Feather name={g.icon as any} size={22} color="#714329" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-base mb-0.5 text-brown-TextPrimary">{g.title}</Text>
                                <Text className="text-sm text-brown-TextSecondary">{g.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}