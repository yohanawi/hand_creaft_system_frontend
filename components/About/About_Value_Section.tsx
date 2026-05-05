import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_Value_Section() {

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

    const values = [
        { icon: 'heart', title: 'Artisan Heritage', desc: 'Every piece inherits centuries-old goldsmithing traditions - passed down through generations of master craftspeople who live and breathe the art.', g: ["#9B7A2A", "#C9A84C"] },
        { icon: 'globe', title: 'Ethical Sourcing', desc: 'Our gemstones and metals are responsibly procured from conflict-free, certified suppliers who honour communities and protect the environment.', g: ["#9B7A2A", "#C9A84C"] },
        { icon: 'award', title: 'Certified Quality', desc: 'Every gemstone bears an independent certification and every metal is hallmarked to international standards - guaranteed authenticity on each piece.', g: ["#9B7A2A", "#C9A84C"] },
        { icon: 'pen-tool', title: 'Bespoke Design', desc: 'Commission a one-of-a-kind piece designed entirely around your story - from the first sketch on paper to the final hallmark stamp. \n \n', g: ["#9B7A2A", "#C9A84C"] },
    ];

    return (
        <View className="py-32 bg-gray-100" style={{ paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View style={{ alignItems: "center", marginBottom: 28 }}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                            What We Stand For
                        </span>
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                        Our Core <em className="italic text-[#714329]">Values</em>
                    </h1>
                </View>

                <View className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {values.map((v, i) => (
                        <View key={i} className="max-h-80">
                            <LinearGradient className='overflow-hidden rounded-3xl' style={{ padding: 24 }} colors={v.g as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View className="items-center justify-center mb-4 rounded-full w-14 h-14 bg-brown-Background">
                                    <Feather name={v.icon as any} size={26} color="#FFF" />
                                </View>
                                <Text className="text-xl font-bold mb-2.5 text-white">{v.title}</Text>
                                <Text className="text-sm leading-relaxed text-white/90">{v.desc}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}