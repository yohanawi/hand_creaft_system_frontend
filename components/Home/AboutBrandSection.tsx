import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Text, TouchableOpacity, View, } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
    { value: '2024', label: 'Est. Year', icon: 'calendar' as const, color: '#8B4513', bg: '#FDF0E8' },
    { value: '50K+', label: 'Happy Customers', icon: 'heart' as const, color: '#BE123C', bg: '#FFF1F2' },
    { value: '200+', label: 'Artisan Products', icon: 'package' as const, color: '#0F766E', bg: '#F0FDFA' },
    { value: '35+', label: 'Local Artisans', icon: 'users' as const, color: '#7C3AED', bg: '#F5F3FF' },
];

const values = [
    {
        icon: 'scissors' as const,
        title: 'Handcrafted',
        text: 'Every piece is lovingly made by hand, never mass-produced.',
        color: '#8B4513',
        bg: '#FDF0E8',
    },
    {
        icon: 'wind' as const,
        title: 'Eco-Friendly',
        text: 'Sustainable materials sourced responsibly from local suppliers.',
        color: '#0F766E',
        bg: '#F0FDFA',
    },
    {
        icon: 'heart' as const,
        title: 'Made with Love',
        text: 'Each item carries the soul and story of its maker.',
        color: '#BE123C',
        bg: '#FFF1F2',
    },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ stat, anim }: { stat: typeof stats[0]; anim: Animated.Value }) {

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

    return (
        <Animated.View style={{ opacity: anim, transform: [{ translateY }], flex: isMobile ? undefined : 1, minWidth: isMobile ? '44%' : undefined }}>
            <View className="bg-white rounded-[22px] p-5 items-center border-[1.5px] border-[#F0E8E0]">
                <View className="w-[50px] h-[50px] rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: stat.bg }}>
                    <Feather name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text className="text-[28px] font-black text-[#1A0F0A] tracking-[-1px] leading-8">
                    {stat.value}
                </Text>
                <Text className="text-gray-400 text-[11px] font-semibold mt-1 text-center tracking-[0.3px]">
                    {stat.label}
                </Text>
                <View className="h-[3px] w-8 rounded-sm mt-2.5 opacity-70" style={{ backgroundColor: stat.color }} />
            </View>
        </Animated.View>
    );
}

// ─── Value row ────────────────────────────────────────────────────────────────
function ValueItem({ v, delay }: { v: typeof values[0]; delay: number }) {

    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 550,
            delay,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View className="items-center"
            style={{
                flexDirection: isMobile ? 'column' : 'row',
                paddingBottom: 14,
                opacity: anim,
                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            }}>
            <View className="w-[46px] h-[46px] rounded-xl items-center justify-center mr-3.5 mt-0.5 border" style={{ backgroundColor: v.bg, borderColor: `${v.color}22` }}>
                <Feather name={v.icon} size={20} color={v.color} />
            </View>

            {/* Text content */}
            <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-[#1A0F0A] mb-1 tracking-[-0.2px]">
                    {v.title}
                </Text>

                <Text className="text-[13px] text-gray-500 leading-5">
                    {v.text}
                </Text>
            </View>
        </Animated.View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutBrandSection() {

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const leftAnim = useRef(new Animated.Value(-50)).current;
    const rightAnim = useRef(new Animated.Value(50)).current;
    const imgScaleAnim = useRef(new Animated.Value(0.92)).current;
    const statAnims = useRef(stats.map(() => new Animated.Value(0))).current;
    const stripAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(leftAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
            Animated.timing(rightAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
            Animated.spring(imgScaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.timing(stripAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        ]).start();

        stats.forEach((_, i) => {
            Animated.timing(statAnims[i], {
                toValue: 1,
                duration: 600,
                delay: 300 + i * 130,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    return (
        <View className="bg-[#FBF7F3] overflow-hidden">
            {/* ── Decorative blobs ── */}
            <View className="absolute -top-[80px] -left-[80px] w-[280px] h-[280px] rounded-full bg-[#8B4513] opacity-[0.05]" />
            <View className="absolute -bottom-[60px] -right-[60px] w-[220px] h-[220px] rounded-full bg-[#CD853F] opacity-[0.07]" />

            <View className="py-28" style={{ paddingHorizontal: isMobile ? 20 : 40 }}>
                <View className="w-full max-w-[1280px] self-center">

                    {/* ═══════════════════════════════════════════
                        TWO-COLUMN: Image Left + Text Right
                    ═══════════════════════════════════════════ */}
                    <View className="flex-col items-stretch mb-24 md:flex-row md:items-center" style={{ gap: isMobile ? 0 : 56, }}>
                        {/* ── LEFT: Image collage ── */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateX: leftAnim }],
                                width: isMobile ? '100%' : isTablet ? '45%' : '42%',
                                marginBottom: isMobile ? 48 : 0,
                            }}>
                            {/* Main image */}
                            <Animated.View className="rounded-[28px] overflow-hidden" style={{ transform: [{ scale: imgScaleAnim }] }}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=85' }}
                                    className="w-full"
                                    style={{ height: isMobile ? 280 : 400 }}
                                    resizeMode="cover"
                                />
                            </Animated.View>

                            {/* Floating badge */}
                            <View className="absolute bg-[#8B4513] px-5 py-3.5 rounded-2xl items-center"
                                style={{
                                    bottom: isMobile ? -18 : -22,
                                    right: isMobile ? 12 : -16,
                                }}>
                                <Text className="text-white/75 text-[9px] font-bold tracking-[1.5px] uppercase">
                                    Crafting Since
                                </Text>
                                <Text className="text-white text-[32px] font-black tracking-[-1px] leading-[38px]">
                                    2024
                                </Text>
                            </View>

                            {/* Artisan card */}
                            <View className="absolute bg-white rounded-xl px-3.5 py-2.5 flex-row items-center gap-2.5"
                                style={{
                                    top: -18,
                                    left: isMobile ? 12 : -18,
                                }}>
                                <View className="flex-row">
                                    {[
                                        'https://randomuser.me/api/portraits/women/44.jpg',
                                        'https://randomuser.me/api/portraits/women/68.jpg',
                                        'https://randomuser.me/api/portraits/men/32.jpg',
                                    ].map((uri, i) => (
                                        <Image
                                            key={i}
                                            source={{ uri }}
                                            className="w-[30px] h-[30px] rounded-full border-2 border-white"
                                            style={{ marginLeft: i > 0 ? -8 : 0 }}
                                        />
                                    ))}
                                </View>

                                <View>
                                    <Text className="text-[11px] font-extrabold text-[#1A0F0A]">
                                        35+ Artisans
                                    </Text>

                                    <View className="flex-row gap-[1px] mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Feather key={i} name="star" size={9} color="#F59E0B" />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Small inset image */}
                            {!isMobile && (
                                <View className="absolute rounded-[20px] overflow-hidden border-4 border-white" style={{ bottom: -24, left: -20, }}>
                                    <Image source={{ uri: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=240&q=80' }} className="w-[110px] h-[110px]" />
                                </View>
                            )}
                        </Animated.View>

                        {/* ── RIGHT: Content ── */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateX: rightAnim }],
                                flex: isMobile ? undefined : 1,
                                marginTop: isMobile ? 32 : 0,
                            }} >
                            {/* Eyebrow */}
                            <View className="flex-row items-center justify-start gap-3 mb-4">
                                <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                                <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                                    Our Story
                                </span>
                            </View>

                            {/* Title */}
                            <h1 className="text-4xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                                Crafted by Local <br /><em style={{ color: '#8B4513' }}>Artisans</em> with Love
                            </h1>
                            {/* Text */}
                            <Text className="mb-3 text-sm leading-6 text-gray-500">
                                Born from a passion for preserving traditional crafts, our platform was founded in 2024 to give talented local artisans a global stage. Every product is made entirely by hand - no factories, no shortcuts, just skilled hands and sincere hearts.
                            </Text>

                            <Text className="text-sm leading-6 text-gray-500 mb-7">
                                When you buy from us, you support a real person, a real family, and a living craft tradition that deserves to thrive.
                            </Text>

                            {/* Values */}
                            <View className="mb-7">
                                {values.map((v, i) => (
                                    <ValueItem key={v.title} v={v} delay={400 + i * 120} />
                                ))}
                            </View>

                            {/* Buttons */}
                            <View className="flex-row flex-wrap gap-3">
                                <TouchableOpacity
                                    onPress={() => router.push('/shop')}
                                    activeOpacity={0.9}
                                    className="flex-row items-center gap-2 bg-[#8B4513] px-6 py-3.5 rounded-full"
                                >
                                    <Text className="text-sm font-extrabold text-white">
                                        Shop Now
                                    </Text>
                                    <Feather name="arrow-right" size={16} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity className="flex-row items-center gap-2 border-[1.5px] border-[#8B4513] px-6 py-3.5 rounded-full">
                                    <Feather name="play-circle" size={16} color="#8B4513" />
                                    <Text className="text-[#8B4513] font-bold text-sm">
                                        Our Story
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>

                    {/* ═══════════════════════════════════════════
                        STATS ROW
                    ═══════════════════════════════════════════ */}
                    <View className={`${isMobile ? 'mt-10' : 'mt-5'}`}>
                        {/* Divider with label */}
                        <View className="flex-row items-center gap-3 mb-7">
                            <View className="flex-1 h-[1px] bg-[#EDE5DC]" />
                            <View className="flex-row items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#EDE5DC]">
                                <Feather name="trending-up" size={13} color="#8B4513" />
                                <Text className="text-[#8B4513] text-[11px] font-bold tracking-[0.8px]">
                                    BY THE NUMBERS
                                </Text>
                            </View>
                            <View className="flex-1 h-[1px] bg-[#EDE5DC]" />
                        </View>

                        {/* Stat cards */}
                        <View className="flex-row justify-center gap-3.5" style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                            {stats.map((s, i) => (
                                <StatCard key={s.label} stat={s} anim={statAnims[i]} />
                            ))}
                        </View>
                    </View>

                </View>
            </View>
        </View>
    );
}