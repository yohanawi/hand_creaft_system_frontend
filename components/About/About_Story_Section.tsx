import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, TouchableOpacity, View } from "react-native";

export default function About_Story_Section() {
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
    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="bg-brown-Background" style={{ paddingVertical: 72, paddingHorizontal: px }}>
                <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                    <View className={isMobile ? 'flex-col' : 'flex-row items-center'}>
                        {/* Text column */}
                        <View style={{ flex: 1, marginRight: isMobile ? 0 : 56, marginBottom: isMobile ? 40 : 0 }}>
                            <SectionLabel text="✦ Our Story" />
                            <SectionTitle title={`Craftsmanship Born\nFrom Passion`} isMobile={isMobile} />
                            <GoldDivider />
                            <Text className="mb-4 text-base leading-7 text-brown-TextSecondary">
                                Founded in 2007 in a small Colombo workshop, ArtisanGems was born from a single master jeweller's lifelong devotion to the craft. What started with a hammer, an anvil, and a burning passion for perfection has grown into Sri Lanka's most celebrated artisan jewellery house.
                            </Text>
                            <Text className="mb-4 text-base leading-7 text-brown-TextSecondary">
                                Our founder believed jewellery should outlive its wearer — not just physically, but emotionally. Every ring, pendant, and bracelet is imbued with intent: to mark milestones, celebrate love, and carry forward the stories of those who wear them.
                            </Text>
                            <Text className="text-base leading-7 text-brown-TextSecondary">
                                We never mass-produce. Each piece is hand-finished by our artisans, individually inspected, and only released when it meets our exacting standards — a promise kept since the very first piece we made.
                            </Text>
                            <TouchableOpacity
                                className="flex-row items-center self-start py-4 rounded-full mt-7 bg-brown-DarkColor"
                                style={{ paddingHorizontal: 28, gap: 10 }}
                            >
                                <Text className="text-base font-bold text-white">Explore Our Collections</Text>
                                <Feather name="arrow-right" size={15} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {/* Visual column */}
                        <View style={{ flex: isMobile ? undefined : 1 }}>
                            <LinearGradient
                                colors={["#5C3317", "#B5A192", "#6B1A2F"]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={{ borderRadius: 28, height: isMobile ? 260 : 380, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                            >
                                <Ring size={220} top={-65} right={-65} alpha={0.2} />
                                <Ring size={150} bottom={-45} left={-45} alpha={0.15} />
                                <View
                                    className="items-center justify-center w-32 h-32 border-2 rounded-full bg-brown-Background border-brown-lightColor"
                                >
                                    <Feather name="scissors" size={54} color="#B08463" />
                                </View>
                                <Text className="mt-4 font-semibold text-white/80" style={{ fontSize: 12, letterSpacing: 2 }}>
                                    HANDCRAFTED WITH LOVE
                                </Text>
                                {/* Gem accents */}
                                <View style={{ position: 'absolute', top: 22, right: 26, width: 13, height: 13, borderRadius: 7, backgroundColor: '#B08463', opacity: 0.8 }} />
                                <View style={{ position: 'absolute', bottom: 34, left: 28, width: 10, height: 10, borderRadius: 5, backgroundColor: '#A0344F', opacity: 0.75 }} />
                                <View style={{ position: 'absolute', top: 68, left: 22, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E8CA7A', opacity: 0.65 }} />
                            </LinearGradient>
                            {/* Mini stat cards */}
                            <View className="flex-row mt-4" style={{ gap: 10 }}>
                                {[{ v: '18+', l: 'Years' }, { v: '5K+', l: 'Pieces' }, { v: '28K+', l: 'Clients' }].map((s, i) => (
                                    <View
                                        key={i}
                                        className="items-center flex-1 py-4 border rounded-2xl bg-brown-Background border-brown-Border"
                                    >
                                        <Text className="text-xl font-extrabold text-brown-DarkColor">{s.v}</Text>
                                        <Text className="text-xs font-medium mt-0.5 text-brown-TextSecondary">{s.l}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}