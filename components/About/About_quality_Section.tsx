import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_quality_Section() {
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
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);
    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1024;
    const px = isMobile ? 20 : 48;
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
    const materials = [
        { icon: 'star', title: '18K & 22K Gold', desc: 'Pure alloys blended for lasting brilliance, available in yellow, rose, and white gold finishes for every style.', badge: 'Hallmarked' },
        { icon: 'zap', title: 'Natural Gemstones', desc: 'Hand-selected sapphires, rubies, emeralds, and diamonds — each stone evaluated for cut, clarity, colour, and carat.', badge: 'GIA Certified' },
        { icon: 'check-circle', title: 'International Hallmarks', desc: 'Every piece carries a certified hallmark that verifies its metal purity — your unambiguous proof of genuine craftsmanship.', badge: 'BIS / BASL' },
        { icon: 'shield', title: 'Conflict-Free Stones', desc: 'We source exclusively through the Kimberley Process Certification Scheme — ethically and transparently, every single time.', badge: 'Kimberley Certified' },
    ];
    return (
        <View className="bg-brown-Background" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center">
                    <SectionLabel text="✦ Our Standards" />
                    <SectionTitle title={`Only the Finest\nMaterials`} center isMobile={isMobile} />
                    <GoldDivider />
                </View>
                {/* Quality banner */}
                <LinearGradient
                    colors={["#9B7A2A", "#C9A84C", "#E8CA7A"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 20, padding: 20, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }}
                >
                    <View
                        className="items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-brown-Background"
                    >
                        <Feather name="award" size={22} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-base mb-0.5 text-white">
                            International Quality Guarantee
                        </Text>
                        <Text className="text-sm text-white/90">
                            Every piece certified, hallmarked, and multi-stage quality inspected before delivery
                        </Text>
                    </View>
                </LinearGradient>
                {/* Material cards */}
                <View className="flex-row flex-wrap" style={{ justifyContent: 'space-between', gap: 16 }}>
                    {materials.map((m, i) => (
                        <View
                            key={i}
                            className="border bg-brown-Background border-brown-Border rounded-2xl"
                            style={{
                                width: isMobile ? '100%' : '48%',
                                padding: 24,
                                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
                            }}
                        >
                            {/* Badge */}
                            <View
                                className="absolute px-3 py-1 rounded-full top-4 right-4 bg-brown-DarkColor"
                            >
                                <Text className="text-xs font-bold text-brown-lightColor">{m.badge}</Text>
                            </View>
                            <View
                                className="items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-brown-SecondaryBackground"
                            >
                                <Feather name={m.icon as any} size={22} color="#6B1A2F" />
                            </View>
                            <Text className="mb-2 text-lg font-bold text-brown-TextPrimary">{m.title}</Text>
                            <Text className="text-sm leading-relaxed text-brown-TextSecondary">{m.desc}</Text>
                        </View>
                    ))}
                </View>
                {/* Certification pills */}
                <View className="flex-row flex-wrap items-center justify-center mt-8" style={{ gap: 12 }}>
                    {['GIA Certified', 'BIS Hallmark', 'ISO 9001', 'Kimberley Process'].map((cert, i) => (
                        <View
                            key={i}
                            className="flex-row items-center px-4 py-2 border rounded-full bg-brown-SecondaryBackground border-brown-Border"
                            style={{ gap: 6 }}
                        >
                            <Feather name="check-circle" size={13} color="#6B1A2F" />
                            <Text className="text-xs font-bold text-brown-DarkColor" style={{ letterSpacing: 0.5 }}>{cert}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}