import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_Value_Section() {

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
    const values = [
        { icon: 'heart', title: 'Artisan Heritage', desc: 'Every piece inherits centuries-old goldsmithing traditions — passed down through generations of master craftspeople who live and breathe the art.', g: ["#6B1A2F", "#A0344F"] },
        { icon: 'globe', title: 'Ethical Sourcing', desc: 'Our gemstones and metals are responsibly procured from conflict-free, certified suppliers who honour communities and protect the environment.', g: ["#5C3317", "#8B4513"] },
        { icon: 'award', title: 'Certified Quality', desc: 'Every gemstone bears an independent certification and every metal is hallmarked to international standards — guaranteed authenticity on each piece.', g: ["#9B7A2A", "#C9A84C"] },
        { icon: 'pen-tool', title: 'Bespoke Design', desc: 'Commission a one-of-a-kind piece designed entirely around your story — from the first sketch on paper to the final hallmark stamp.', g: ["#6B7C5E", "#8FA07E"] },
    ];
    return (
        <View className="bg-brown-Background" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center">
                    <SectionLabel text="✦ What We Stand For" />
                    <SectionTitle title="Our Core Values" center isMobile={isMobile} />
                    <GoldDivider />
                </View>
                <View className="flex-row flex-wrap" style={{ justifyContent: 'space-between', gap: 16 }}>
                    {values.map((v, i) => (
                        <View
                            key={i}
                            style={{
                                width: isMobile ? '100%' : '48%',
                                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
                            }}
                        >
                            <LinearGradient
                                colors={v.g as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={{ padding: 28, borderRadius: 24, overflow: 'hidden' }}
                            >
                                <Ring size={130} top={-35} right={-35} alpha={0.18} />
                                <View
                                    className="items-center justify-center mb-4 rounded-full w-14 h-14 bg-brown-Background"
                                >
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