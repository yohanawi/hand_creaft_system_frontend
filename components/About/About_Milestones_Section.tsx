import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Text, View } from "react-native";

export default function About_Milestones_Section() {
    const { width: W } = Dimensions.get('window');
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
    const milestones = [
        { year: '2007', title: 'Founded', desc: "Began as a single craftsman's workshop in Colombo's heritage district, born from a lifelong devotion to the craft." },
        { year: '2012', title: 'First Gallery', desc: 'Opened our celebrated artisan showroom, welcoming collectors, connoisseurs, and first-time jewellery buyers.' },
        { year: '2018', title: 'Global Reach', desc: 'Achieved shipping to 50+ countries and recognition by the Sri Lanka Export Development Board.' },
        { year: '2026', title: 'Today', desc: '28,000+ satisfied clients across 80 countries — and still crafting, one extraordinary piece at a time.' },
    ];
    return (
        <View className="bg-brown-Background" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center">
                    <SectionLabel text="✦ Our Journey" />
                    <SectionTitle title="Milestones of Mastery" center isMobile={isMobile} />
                    <GoldDivider />
                </View>
                <View
                    className={isMobile ? 'flex-col' : 'flex-row'}
                    style={{ justifyContent: 'space-between', gap: isMobile ? 0 : 16, marginTop: 8, position: 'relative' }}
                >
                    {/* Timeline connector */}
                    {!isMobile && (
                        <View className="bg-brown-Border" style={{ position: 'absolute', top: 36, left: '6.25%', right: '6.25%', height: 2, zIndex: 0 }} />
                    )}
                    {milestones.map((m, i) => (
                        <View
                            key={i}
                            style={{ flex: isMobile ? undefined : 1, alignItems: 'center', marginBottom: isMobile ? 36 : 0 }}
                        >
                            {/* Year bubble */}
                            <LinearGradient
                                colors={["#6B1A2F", "#8B4513"]}
                                style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: 14 }}
                            >
                                <Text className="text-base font-extrabold text-brown-lightColor">{m.year}</Text>
                            </LinearGradient>
                            <Text className="text-base font-bold text-center mb-1.5 text-brown-DarkColor">{m.title}</Text>
                            <Text className="text-sm leading-relaxed text-center text-brown-TextSecondary" style={{ maxWidth: 200 }}>{m.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}