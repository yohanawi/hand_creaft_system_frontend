import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_Process_Section() {
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
    const steps = [
        { num: '01', icon: 'edit-3', title: 'Design Sketch', desc: 'Our artisans translate your vision into detailed hand-drawn concept sketches, iterated until every detail is perfect.' },
        { num: '02', icon: 'search', title: 'Gem Selection', desc: 'Each gemstone is individually hand-picked under 10× magnification for optimal brilliance, purity, and colour saturation.' },
        { num: '03', icon: 'tool', title: 'Handcrafting', desc: 'Master goldsmiths shape, set, and solder every component using a blend of traditional technique and precision tooling.' },
        { num: '04', icon: 'sun', title: 'Polish & Finish', desc: 'The finished piece is meticulously buffed, quality-inspected at multiple stages, hallmarked, and presented in our signature packaging.' },
    ];
    return (
        <LinearGradient
            colors={["#5C3317", "#B5A192", "#6B1A2F"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 72, paddingHorizontal: px, overflow: 'hidden' }}
        >
            <Ring size={520} top={-160} right={-160} alpha={0.07} />
            <Ring size={320} bottom={-110} left={-110} alpha={0.06} />
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center mb-8">
                    <SectionLabel text="✦ The Craft" light />
                    <SectionTitle title="How We Create" center light isMobile={isMobile} />
                    <View className="flex-row items-center mt-4 w-[200px]">
                        <View className="flex-1 h-px bg-brown-lightColor opacity-80" />
                        <View className="w-2 h-2 mx-2 rounded-full bg-brown-DarkColor" />
                        <View className="flex-1 h-px bg-brown-lightColor opacity-80" />
                    </View>
                </View>
                {/* Step cards */}
                <View className={isMobile ? 'flex-col' : 'flex-row'} style={{ gap: 16 }}>
                    {/* Connector line — desktop only */}
                    {!isMobile && (
                        <View className="bg-brown-lightColor opacity-60" style={{ position: 'absolute', top: 36, left: '6%', right: '6%', height: 2, zIndex: 0 }} />
                    )}
                    {steps.map((step, i) => (
                        <View key={i} style={{ flex: isMobile ? undefined : 1, alignItems: 'center', marginBottom: isMobile ? 28 : 0 }}>
                            {/* Number circle */}
                            <LinearGradient
                                colors={["#B08463", "#714329"]}
                                style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 18, zIndex: 1 }}
                            >
                                <Text className="font-extrabold text-brown-SecondaryBackground" style={{ fontSize: 11, letterSpacing: 1 }}>{step.num}</Text>
                                <Feather name={step.icon as any} size={18} color="#714329" style={{ marginTop: 2 }} />
                            </LinearGradient>
                            {/* Card */}
                            <View
                                className="w-full p-5 border rounded-2xl bg-brown-Background border-brown-Border"
                            >
                                <Text className="mb-2 text-base font-bold text-center text-brown-lightColor">{step.title}</Text>
                                <Text className="text-sm leading-relaxed text-center text-brown-TextSecondary">{step.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}