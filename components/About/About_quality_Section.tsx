import { Feather } from '@expo/vector-icons';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_quality_Section() {

    const { width: W } = Dimensions.get('window');
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
    const px = isMobile ? 20 : 48;

    const materials = [
        { icon: 'star', title: '18K & 22K Gold', desc: 'Pure alloys blended for lasting brilliance, available in yellow, rose, and white gold finishes for every style.', badge: 'Hallmarked' },
        { icon: 'zap', title: 'Natural Gemstones', desc: 'Hand-selected sapphires, rubies, emeralds, and diamonds — each stone evaluated for cut, clarity, colour, and carat.', badge: 'GIA Certified' },
        { icon: 'check-circle', title: 'International Hallmarks', desc: 'Every piece carries a certified hallmark that verifies its metal purity — your unambiguous proof of genuine craftsmanship.', badge: 'BIS / BASL' },
        { icon: 'shield', title: 'Conflict-Free Stones', desc: 'We source exclusively through the Kimberley Process Certification Scheme — ethically and transparently, every single time.', badge: 'Kimberley Certified' },
    ];

    return (

        <View className="py-32 bg-[#FAF6F2]" style={{ paddingHorizontal: px }}>
            <View className="self-center w-full max-w-7xl">
                <View style={{ alignItems: "center", marginBottom: 28 }}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                            Our Standards
                        </span>
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                        Only the Finest <em className="italic text-[#714329]">Materials</em>
                    </h1>
                </View>

                {/* Material cards */}
                <View className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {materials.map((m, i) => (
                        <View key={i} className="border bg-brown-Background border-brown-Border rounded-2xl" style={{ padding: 24 }}>
                            {/* Badge */}
                            <View className="absolute px-3 py-1 rounded-full top-4 right-4 bg-brown-DarkColor">
                                <Text className="text-xs font-bold text-white">{m.badge}</Text>
                            </View>
                            <View className="items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-brown-SecondaryBackground">
                                <Feather name={m.icon as any} size={22} color="#FFF" />
                            </View>
                            <Text className="mb-2 text-lg font-bold text-brown-TextPrimary">{m.title}</Text>
                            <Text className="text-sm leading-relaxed text-brown-TextSecondary">{m.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}