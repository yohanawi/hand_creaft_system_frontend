import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, TouchableOpacity, View } from "react-native";

export default function CTA_Section() {
    const { width: W } = Dimensions.get('window');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;
    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1024;
    const px = isMobile ? 20 : 48;
    const Ring = ({ size, top, right, bottom, left, alpha = 0.15 }: {
        size: number; top?: number; right?: number; bottom?: number; left?: number; alpha?: number;
    }) => (
        <View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 1.5, borderColor: `rgba(113,67,41,${alpha})`,
            top, right, bottom, left,
        }} />
    );
    return (
        <View className="bg-brown-SecondaryBackground" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 860 }}>
                <LinearGradient
                    colors={["#5C3317", "#B5A192", "#6B1A2F"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 32, padding: isMobile ? 36 : 64, alignItems: 'center', overflow: 'hidden' }}
                >
                    <Ring size={380} top={-110} right={-90} alpha={0.16} />
                    <Ring size={220} bottom={-70} left={-70} alpha={0.11} />
                    {/* Icon ring */}
                    <View
                        className="items-center justify-center w-20 h-20 mb-6 border-2 rounded-full bg-brown-Background border-brown-lightColor"
                    >
                        <Feather name="star" size={36} color="#B08463" />
                    </View>
                    <Text
                        className="mb-4 font-extrabold text-center text-brown-Background"
                        style={{ fontSize: isMobile ? 28 : 42, lineHeight: isMobile ? 38 : 54 }}
                    >
                        Begin Your Jewellery Journey
                    </Text>
                    <Text
                        className="mb-10 text-base text-center text-brown-TextSecondary"
                        style={{ lineHeight: 26, maxWidth: 480 }}
                    >
                        Discover pieces that speak your story — from everyday elegance to once-in-a-lifetime masterpieces. Or commission something entirely your own.
                    </Text>
                    <View className={isMobile ? 'flex-col w-full items-stretch' : 'flex-row items-center'} style={{ gap: 14 }}>
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 rounded-full bg-brown-lightColor"
                            style={{ paddingHorizontal: 32, gap: 10 }}
                        >
                            <Text className="text-base font-bold text-brown-woodDark">Shop the Collection</Text>
                            <Feather name="arrow-right" size={16} color="#5C3317" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 border-2 rounded-full border-brown-lightColor"
                            style={{ paddingHorizontal: 32, gap: 8 }}
                        >
                            <Feather name="pen-tool" size={15} color="#B08463" />
                            <Text className="text-base font-semibold text-brown-lightColor">Commission a Design</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 border-2 rounded-full border-brown-Background"
                            style={{ paddingHorizontal: 32, gap: 8 }}
                        >
                            <Feather name="mail" size={15} color="#D0B9A7" />
                            <Text className="text-base font-semibold text-brown-Background">Get in Touch</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}