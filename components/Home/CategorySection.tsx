import { Feather } from '@expo/vector-icons';
import { ArrowRightIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Responsive layout helpers ────────────────────────────────────────────────
const getCardsPerView = (): number => {
    if (SCREEN_WIDTH >= 1280) return 5;
    if (SCREEN_WIDTH >= 1024) return 4;
    if (SCREEN_WIDTH >= 768) return 3;
    if (SCREEN_WIDTH >= 480) return 2;
    return 1;
};

const CARDS_PER_VIEW = getCardsPerView();
const CARD_GAP = 14;
const H_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
const CARD_HEIGHT = CARD_WIDTH * 1.35;
const AUTO_SCROLL_MS = 3200;

// ─── Category data with Unsplash image URIs ──────────────────────────────────
const categories = [
    {
        id: 1,
        name: 'Electronics',
        icon: 'smartphone' as const,
        itemCount: '2,543',
        description: 'Latest Tech',
        imageUri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        accentColor: '#6366F1',
    },
    {
        id: 2,
        name: 'Fashion',
        icon: 'shopping-bag' as const,
        itemCount: '4,231',
        description: 'Trending Styles',
        imageUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
        accentColor: '#EC4899',
    },
    {
        id: 3,
        name: 'Home & Living',
        icon: 'home' as const,
        itemCount: '1,876',
        description: 'Comfort Zone',
        imageUri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
        accentColor: '#06B6D4',
    },
    {
        id: 4,
        name: 'Sports',
        icon: 'activity' as const,
        itemCount: '987',
        description: 'Stay Active',
        imageUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        accentColor: '#10B981',
    },
    {
        id: 5,
        name: 'Books',
        icon: 'book' as const,
        itemCount: '3,456',
        description: 'Knowledge Hub',
        imageUri: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
        accentColor: '#F59E0B',
    },
    {
        id: 6,
        name: 'Beauty',
        icon: 'heart' as const,
        itemCount: '2,109',
        description: 'Self Care',
        imageUri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
        accentColor: '#F43F5E',
    },
    {
        id: 7,
        name: 'Toys & Games',
        icon: 'gift' as const,
        itemCount: '1,543',
        description: 'Fun Time',
        imageUri: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
        accentColor: '#8B5CF6',
    },
    {
        id: 8,
        name: 'Automotive',
        icon: 'truck' as const,
        itemCount: '765',
        description: 'On The Road',
        imageUri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
        accentColor: '#EF4444',
    },
];

// ─── CategoryCard ─────────────────────────────────────────────────────────────
const CategoryCard = ({ category, index }: { category: typeof categories[0], index: number }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Entrance Animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, index * 100 + 100);
        return () => clearTimeout(timer);
    }, [index]);

    return (
        <div className={`relative flex-shrink-0 w-[280px] sm:w-[320px] h-[380px] sm:h-[420px] snap-center rounded-md overflow-hidden group cursor-pointer transition-all duration-700 ease-out
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-12'}`}>
            {/* --- Animated Background Image --- */}
            <img
                src={category.imageUri}
                alt={category.name}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
            />

            {/* --- Ambient Gradients --- */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            </div>

            {/* --- Tint Overlay on Hover --- */}
            <div className="absolute inset-0 w-full h-full transition-opacity duration-500 opacity-0 mix-blend-overlay group-hover:opacity-40"
                style={{ backgroundColor: category.accentColor }}
            />

            {/* --- Detached Bottom Glass Panel --- */}
            <div className="absolute bottom-5 left-5 right-5 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-2">
                {/* Floating Pill
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 shadow-lg border border-white/10 bg-black/60 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: category.accentColor }} />
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/90 uppercase">
                        {category.description}
                    </span>
                </div> */}

                {/* Main Content Glass Box */}
                <div className="relative p-5 rounded-[24px] overflow-hidden bg-black/40 backdrop-blur-xl transition-colors duration-500 group-hover:bg-black/50">
                    {/* Dynamic Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ backgroundColor: category.accentColor }} />

                    <h3 className="mb-1 text-2xl font-black tracking-tight text-white truncate">
                        {category.name}
                    </h3>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-wider uppercase transition-colors duration-300 text-white/60 group-hover:text-white/90">
                                Explore
                            </span>
                            <span className="text-sm transition-all duration-300 text-white/40 group-hover:translate-x-1 group-hover:text-white">
                                <ArrowRightIcon size={16} color="currentColor" className="transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-white/10 transition-colors duration-300 group-hover:bg-white/20">
                            <span className="text-[11px] font-bold text-white">
                                {category.itemCount} items
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function CategorySection() {

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const maxScroll = useRef(0);
    const isUserDragging = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const totalDots = Math.max(0, categories.length - CARDS_PER_VIEW + 1);

    // Entry animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    // Auto-scroll
    const startAutoScroll = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (isUserDragging.current) return;
            const step = CARD_WIDTH + CARD_GAP;
            const nextX = scrollX.current + step;
            if (nextX >= maxScroll.current) {
                scrollRef.current?.scrollTo({ x: 0, animated: true });
                scrollX.current = 0;
                setActiveIndex(0);
            } else {
                scrollRef.current?.scrollTo({ x: nextX, animated: true });
                scrollX.current = nextX;
                setActiveIndex(Math.round(nextX / step));
            }
        }, AUTO_SCROLL_MS);
    };

    const stopAutoScroll = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, []);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollX.current = e.nativeEvent.contentOffset.x;
        setActiveIndex(Math.round(scrollX.current / (CARD_WIDTH + CARD_GAP)));
    };

    const handleScrollBeginDrag = () => {
        isUserDragging.current = true;
        stopAutoScroll();
    };

    const handleScrollEndDrag = () => {
        isUserDragging.current = false;
        startAutoScroll();
    };

    const goToIndex = (i: number) => {
        const x = i * (CARD_WIDTH + CARD_GAP);
        scrollRef.current?.scrollTo({ x, animated: true });
        scrollX.current = x;
        setActiveIndex(i);
    };

    const goLeft = () => goToIndex(Math.max(0, activeIndex - 1));
    const goRight = () => goToIndex(Math.min(totalDots - 1, activeIndex + 1));

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#fbf7f3', // Tailwind amber-900 background for dark theme
        }}>

            <View className="px-5 py-28">
                {/* Header */}
                <header className={`text-center max-w-3xl transition-all duration-700 ease-out mx-auto pb-28`}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold flex-row items-center gap-1.5">
                            <Feather name="grid" size={14} color="#8B4513" /> Categories
                        </span>
                        <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>

                    <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                        Shop by <em style={{ color: '#8B4513' }}>Category</em>
                    </h1>

                    <p className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75]">
                        Explore our wide range of categories and find exactly what you're looking for
                    </p>
                </header>

                {/* ── Carousel ── */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_GAP}
                    snapToAlignment="start"
                    className="px-5"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onScrollEndDrag={handleScrollEndDrag}
                    onMomentumScrollEnd={handleScrollEndDrag}
                    onContentSizeChange={(w) => { maxScroll.current = w - SCREEN_WIDTH; }}
                >
                    {categories.map((cat, index) => (
                        <View key={cat.id} style={{ marginRight: CARD_GAP }}>
                            <CategoryCard category={cat} index={index} />
                        </View>
                    ))}
                </ScrollView>

                {/* ── Dots + Arrows ── */}
                <View className="flex-row items-center justify-center mt-7 px-5 gap-2.5">
                    {/* Left arrow */}
                    <TouchableOpacity onPress={goLeft} className="items-center justify-center w-10 h-10 rounded-full shadow-lg bg-amber-900 active:opacity-80">
                        <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    {/* Dot indicators */}
                    <View className="flex-row items-center gap-1.5 flex-1 justify-center">
                        {Array.from({ length: totalDots }, (_, i) => {
                            const isActive = activeIndex === i;
                            return (
                                <TouchableOpacity key={i} onPress={() => goToIndex(i)}>
                                    <View className={`h-1.5 rounded-full ${isActive ? 'w-7 bg-amber-900' : 'w-1.5 bg-[#DDD0C4]'}`} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Right arrow */}
                    <TouchableOpacity onPress={goRight} className="items-center justify-center w-10 h-10 rounded-full shadow-lg bg-amber-900 active:opacity-80">
                        <Feather name="chevron-right" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* ── Browse All CTA ── */}
                <View className="items-center px-5 mt-9">
                    <TouchableOpacity className="flex-row items-center px-8 py-4 rounded-full bg-amber-900 active:opacity-80 active:scale-95">
                        <Feather name="compass" size={18} color="#FFF" />
                        <Text className="text-white font-black text-base ml-2.5 tracking-wide">
                            Browse All Categories
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}