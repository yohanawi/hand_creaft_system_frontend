import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Text, View } from "react-native";

export default function About_global() {

    const { width: W } = Dimensions.get('window');
    const isMobile = W < 768;
    const px = isMobile ? 20 : 48;

    const globalTrust = [
        { icon: 'globe', title: '80+ Countries', desc: 'Trusted by clients across six continents - from Colombo to Copenhagen.' },
        { icon: 'truck', title: 'Insured Shipping', desc: 'Fully insured, tracked express delivery worldwide with discreet packaging.' },
        { icon: 'lock', title: 'Secure Payments', desc: 'Bank-grade 256-bit SSL encryption on every checkout and transaction.' },
        { icon: 'refresh-cw', title: 'Easy Returns', desc: '30-day hassle-free returns on all non-bespoke items, no questions asked.' },
    ];

    return (
        <View className="bg-gray-100" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View style={{ alignItems: "center", marginBottom: 28 }}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                            Trusted Worldwide
                        </span>
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer text-center">
                        Global Presence <br /><em className="italic text-[#714329]">Local Heart</em>
                    </h1>
                </View>

                {/* World banner */}
                <LinearGradient colors={["#714329", "#B5A192", "#B9937B"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 40, alignItems: 'center', marginBottom: 24, overflow: 'hidden' }}>
                    <View className="items-center justify-center w-24 h-24 mb-5 border-2 rounded-full bg-brown-Background border-brown-lightColor">
                        <Feather name="globe" size={46} color="#B08463" />
                    </View>
                    <Text className="mb-2 font-extrabold text-center text-brown-TextPrimary" style={{ fontSize: isMobile ? 26 : 36 }}>
                        Ships to 80+ Countries
                    </Text>
                    <Text className="text-sm text-center text-brown-TextSecondary" style={{ lineHeight: 22, maxWidth: 420 }}>
                        From our atelier in Colombo to your doorstep - anywhere in the world, fully insured, discreetly packaged, and expertly tracked.
                    </Text>
                </LinearGradient>

                {/* Trust pillars */}
                <View className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {globalTrust.map((g, i) => (
                        <View key={i} className="flex-row items-center gap-6 border bg-brown-lightBackground border-brown-Border rounded-2xl" style={{ padding: 20 }}>
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