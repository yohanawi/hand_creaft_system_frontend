import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = 1280;

const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

const H_PAD = isMobile ? 16 : 32;
const GAP = 10;
const COLS = isMobile ? 2 : isTablet ? 3 : 4;
const CELL_W = (SCREEN_WIDTH - H_PAD * 2 - GAP * (COLS - 1)) / COLS;
const CELL_H = CELL_W; // ← all images are perfect squares

// ─── Gallery data ─────────────────────────────────────────────────────────────
const galleryItems = [
    {
        id: 1,
        uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        tag: 'Customer Photo',
        likes: 342,
        user: '@maya_crafts',
    },
    {
        id: 2,
        uri: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80',
        tag: 'Workshop Snap',
        likes: 289,
        user: '@handstudio',
    },
    {
        id: 3,
        uri: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80',
        tag: 'Detail Shot',
        likes: 198,
        user: '@artbylena',
    },
    {
        id: 4,
        uri: 'https://images.unsplash.com/photo-1602178506049-3650c8d54985?w=600&q=80',
        tag: 'Behind the Scenes',
        likes: 421,
        user: '@craftlove',
    },
    {
        id: 5,
        uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
        tag: 'Making Process',
        likes: 156,
        user: '@studio_rh',
    },
    {
        id: 6,
        uri: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=600&q=80',
        tag: 'Customer Review',
        likes: 378,
        user: '@dear_emily',
    },
    {
        id: 7,
        uri: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=600&q=80',
        tag: 'New Collection',
        likes: 512,
        user: '@craft_daily',
    },
    {
        id: 8,
        uri: 'https://images.unsplash.com/photo-1486308510493-aa64833637ef?w=600&q=80',
        tag: 'Process Video',
        likes: 633,
        user: '@loomedup',
    },
];

// ─── Gallery cell ─────────────────────────────────────────────────────────────
function GalleryCell({ item, animVal, }: { item: typeof galleryItems[0]; animVal: Animated.Value; }) {

    const [liked, setLiked] = useState(false);
    const heartScale = useRef(new Animated.Value(1)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    const handleLike = () => {
        setLiked((v) => !v);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    const handleHoverIn = () => {
        Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };

    const handleHoverOut = () => {
        Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    };

    const overlayOpacity = overlayAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.45],
    });

    return (
        <Animated.View style={{ opacity: animVal, transform: [{ scale: animVal }], marginBottom: GAP, width: CELL_W, height: CELL_H, }}
            className="rounded-[18px] overflow-hidden">
            <TouchableOpacity activeOpacity={0.95} onPressIn={handleHoverIn} onPressOut={handleHoverOut} style={{ width: CELL_W, height: CELL_H }}>
                {/* Image */}
                <Image source={{ uri: item.uri }} style={{ width: CELL_W, height: CELL_H }} resizeMode="cover" />
                {/* Bottom gradient scrim */}
                <View className="absolute bottom-0 left-0 right-0 h-full">
                    <View className="h-full bg-black/40" />
                </View>
                {/* Hover color wash */}
                <Animated.View
                    style={{
                        opacity: overlayOpacity,
                        width: CELL_W,
                        height: CELL_H,
                    }}
                    className="absolute top-0 left-0 bg-[#8B4513]" />

                {/* Like button */}
                <TouchableOpacity onPress={handleLike}
                    className={`absolute top-[10px] right-[10px] w-8 h-8 rounded-[10px] items-center justify-center ${liked ? "bg-red-500" : "bg-black/50 border border-white/25"}`}>
                    <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                        <Feather name="heart" size={14} color="#fff" />
                    </Animated.View>
                </TouchableOpacity>

                {/* Bottom info row */}
                <View className="absolute bottom-0 left-0 right-0 px-[10px] py-2 flex-row items-center justify-between">
                    <View>
                        <Text className="text-white/70 text-[14px] font-medium">
                            {item.user}
                        </Text>
                        <View className="flex-row items-center gap-[3px] mt-[2px]">
                            <Feather name="heart" size={14} color="#FF4444" />
                            <Text className="text-white text-[16px] font-bold">
                                {liked ? item.likes + 1 : item.likes}
                            </Text>
                        </View>
                    </View>
                    <View className="w-[28px] h-[28px] rounded-[8px] bg-black/40 items-center justify-center border border-white/20">
                        <Feather name="instagram" size={15} color="rgba(255,255,255,0.85)" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
    return (
        <View className="flex-row items-center gap-1.5 bg-white/10 border border-white/15 px-3.5 py-2 rounded-full">
            <Feather name={icon} size={16} color="#CD853F" />
            <Text className="text-base font-semibold text-black/75">
                {label}
            </Text>
        </View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InstagramGallerySection() {

    const titleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(36)).current;
    const ctaAnim = useRef(new Animated.Value(0)).current;
    const cellAnims = useRef(galleryItems.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();

        galleryItems.forEach((_, i) => {
            Animated.spring(cellAnims[i], {
                toValue: 1,
                delay: 200 + i * 90,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }).start();
        });

        Animated.timing(ctaAnim, {
            toValue: 1,
            duration: 600,
            delay: 900,
            useNativeDriver: true,
        }).start();
    }, []);

    // Distribute into columns
    const columns: (typeof galleryItems)[] = Array.from({ length: COLS }, () => []);
    galleryItems.forEach((item, i) => columns[i % COLS].push(item));

    return (

        <View className="bg-[#fbf7f3] overflow-hidden px-28 py-28">
            {/* Glow blobs */}
            <View className="absolute bg-[#8B4513] opacity-10 rounded-full" style={{ top: -80, left: -80, width: 300, height: 300, }} />
            <View className="absolute bg-[#CD853F] opacity-10 rounded-full" style={{ bottom: -60, right: -60, width: 260, height: 260, }} />

            {/* Header */}
            <header className={`text-center max-w-3xl transition-all duration-700 ease-out mx-auto pb-28`}>
                <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    <LinearGradient colors={['#833ab4', '#fd1d1d', '#fcb045']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 1.5, marginBottom: 16 }}>
                        <View className="flex-row items-center gap-2 bg-gray-200 px-[14px] py-[7px] rounded-[19px]">
                            <Feather name="instagram" size={14} color="#fcb045" />
                            <Text className="text-black text-xs font-bold tracking-[1px]">
                                @handcraft.studio
                            </Text>
                        </View>
                    </LinearGradient>
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                </View>

                <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                    Craft in <em style={{ color: '#8B4513' }}>Real Life</em>
                </h1>

                <p className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75]">
                    Behind the scenes · Customer photos · Making process
                </p>

                <View className="flex-row flex-wrap justify-center gap-2 mt-4">
                    <StatPill icon="users" label="24K Followers" />
                    <StatPill icon="image" label="860+ Posts" />
                    <StatPill icon="heart" label="12K Likes/mo" />
                </View>
            </header> 

            {/* Uniform Grid */}
            <View style={{ paddingHorizontal: H_PAD }} className="flex-row items-start gap-2 py-10">
                {columns.map((col, colIdx) => (
                    <View key={colIdx} className="flex-1">
                        {col.map((item, rowIdx) => {
                            const flatIdx = colIdx + rowIdx * COLS;
                            return (
                                <GalleryCell key={item.id} item={item} animVal={cellAnims[Math.min(flatIdx, cellAnims.length - 1)]} />
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* CTA */}
            <Animated.View
                style={{
                    opacity: ctaAnim,
                    paddingHorizontal: H_PAD,
                }} className="items-center mt-9">
                <LinearGradient className='w-[300px]  mx-auto'
                    colors={['#833ab4', '#fd1d1d', '#fcb045']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 50, padding: 2, marginBottom: 14 }}
                >
                    <TouchableOpacity className="flex-row items-center gap-2 bg-[#0F0A07] px-7 py-[14px] rounded-[49px]">
                        <Feather name="instagram" size={18} color="#fcb045" />
                        <Text className="text-white text-[15px] font-extrabold tracking-[0.3px]">
                            Follow us on Instagram
                        </Text>
                        <Feather name="arrow-right" size={16} color="#fcb045" />
                    </TouchableOpacity>
                </LinearGradient>
                <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-[1px] max-w-[60px] bg-white/10" />
                    <Text className="text-white/40 text-[11px] font-semibold tracking-[0.5px]">
                        #HandcraftLove · Tag us to be featured
                    </Text>
                    <View className="flex-1 h-[1px] max-w-[60px] bg-white/10" />
                </View>
            </Animated.View>
        </View>
    );
}