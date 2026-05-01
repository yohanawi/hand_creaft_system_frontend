import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from "react-native";


export default function About_Hero_Section() {

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

    // Fix: Start animation on mount
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

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
                colors={["#5C3317", "#3D2210", "#6B1A2F", "#7A1C33"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingVertical: isMobile ? 88 : 128, paddingHorizontal: px, overflow: 'hidden' }}
            >
                <Ring size={440} top={-140} right={-110} alpha={0.12} />
                <Ring size={260} top={20} right={40} alpha={0.09} />
                <Ring size={180} bottom={-70} left={-50} alpha={0.07} />
                <Ring size={110} top={90} left={px + 10} alpha={0.11} />

                <View className="items-center w-full" style={{ maxWidth: 680, alignSelf: 'center', zIndex: 2 }}>
                    {/* Eyebrow badge */}
                    <View
                        className="flex-row items-center px-5 py-2 mb-8 border rounded-full border-brown-Border"
                        style={{ backgroundColor: 'rgba(201,168,76,0.14)', gap: 8 }}
                    >
                        <Feather name="scissors" size={11} color="#E8CA7A" />
                        <Text className="text-xs font-bold text-brown-lightColor" style={{ letterSpacing: 2.5 }}>
                            HANDCRAFTED SINCE 2007
                        </Text>
                        <Feather name="scissors" size={11} color="#E8CA7A" />
                    </View>

                    {/* Headline */}
                    <Text
                        className="mb-5 font-extrabold text-center text-white"
                        style={{ fontSize: isMobile ? 40 : 68, lineHeight: isMobile ? 50 : 82 }}
                    >
                        Our Artisan{"\n"}
                        <Text className="text-brown-lightColor">Story</Text>
                    </Text>

                    {/* Intro */}
                    <Text
                        className="mb-8 text-center text-white/80"
                        style={{ fontSize: isMobile ? 15 : 17, lineHeight: 28, maxWidth: 520 }}
                    >
                        Every gem tells a tale. Every ring carries a moment.{"\n"}
                        We are the craftspeople behind jewellery that outlives generations.
                    </Text>

                    {/* Gold rule */}
                    <View className="flex-row items-center mb-9 w-4/5 max-w-[380px]">
                        <View className="flex-1 h-px bg-brown-Border/60" />
                        <Feather name="star" size={16} color="#C9A84C" style={{ marginHorizontal: 12 }} />
                        <View className="w-2 h-2 mx-1 rounded-full bg-brown-lightColor" />
                        <Feather name="star" size={16} color="#C9A84C" style={{ marginHorizontal: 12 }} />
                        <View className="flex-1 h-px bg-brown-Border/60" />
                    </View>

                    {/* CTA buttons */}
                    <View className={isMobile ? 'flex-col w-full items-stretch' : 'flex-row items-center'} style={{ gap: 12 }}>
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 rounded-full bg-brown-DarkColor"
                            style={{ paddingHorizontal: 32, gap: 10 }}
                        >
                            <Text className="text-base font-bold text-brown-Background">Shop the Collection</Text>
                            <Feather name="arrow-right" size={16} color="#FFFAF5" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 border rounded-full border-brown-lightColor"
                            style={{ paddingHorizontal: 32, gap: 8 }}
                        >
                            <Feather name="pen-tool" size={14} color="#E8CA7A" />
                            <Text className="text-base font-semibold text-brown-lightColor">Custom Design</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    )
}
