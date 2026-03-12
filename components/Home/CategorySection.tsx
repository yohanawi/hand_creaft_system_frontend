import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Responsive layout helpers ────────────────────────────────────────────────
const getCardsPerView = (): number => {
    if (SCREEN_WIDTH >= 1280) return 5;
    if (SCREEN_WIDTH >= 1024) return 4;
    if (SCREEN_WIDTH >= 768)  return 3;
    if (SCREEN_WIDTH >= 480)  return 2;
    return 1;
};

const CARDS_PER_VIEW  = getCardsPerView();
const CARD_GAP        = 14;
const H_PADDING       = 20;
const CARD_WIDTH      = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
const CARD_HEIGHT     = CARD_WIDTH * 1.35;
const AUTO_SCROLL_MS  = 3200;

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
const CategoryCard = ({
    category,
    fadeAnim,
}: {
    category: typeof categories[0];
    fadeAnim: Animated.Value;
}) => {
    const cardScale   = useRef(new Animated.Value(1)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(cardScale, { toValue: 0.96, useNativeDriver: true }),
            Animated.timing(overlayAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(cardScale, { toValue: 1, tension: 55, friction: 4, useNativeDriver: true }),
            Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: false }),
        ]).start();
    };

    const overlayOpacity = overlayAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.18],
    });

    return (
        <Animated.View
            style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                marginRight: CARD_GAP,
                borderRadius: 22,
                overflow: 'hidden',
                opacity: fadeAnim,
                transform: [{ scale: cardScale }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.22,
                shadowRadius: 18,
                elevation: 10,
            }}
        >
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={{ flex: 1 }}
            >
                {/* ── Full-bleed image ── */}
                <Image
                    source={{ uri: category.imageUri }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="cover"
                />

                {/* ── Dark gradient overlay (bottom-heavy) ── */}
                <View
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        // Simulate gradient with two overlapping views
                    }}
                >
                    {/* Top scrim (subtle) */}
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        backgroundColor: 'rgba(0,0,0,0.18)',
                    }} />
                    {/* Bottom scrim (strong) */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '70%',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                    }} />
                </View>

                {/* ── Accent colour press overlay ── */}
                <Animated.View style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: category.accentColor,
                    opacity: overlayOpacity,
                }} />

                {/* ── Accent top-left corner stripe ── */}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: 50,
                    backgroundColor: category.accentColor,
                    borderBottomRightRadius: 4,
                }} />

                {/* ── Icon badge ── */}
                <View style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.28)',
                }}>
                    <Feather name={category.icon} size={22} color="#FFF" />
                </View>

                {/* ── Bottom text content ── */}
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                }}>
                    {/* Description pill */}
                    <View style={{
                        alignSelf: 'flex-start',
                        backgroundColor: category.accentColor,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 20,
                        marginBottom: 8,
                    }}>
                        <Text style={{
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: '700',
                            letterSpacing: 0.8,
                            textTransform: 'uppercase',
                        }}>
                            {category.description}
                        </Text>
                    </View>

                    {/* Category name */}
                    <Text style={{
                        color: '#fff',
                        fontSize: CARD_WIDTH < 130 ? 14 : 17,
                        fontWeight: '800',
                        letterSpacing: -0.3,
                        marginBottom: 6,
                    }} numberOfLines={1}>
                        {category.name}
                    </Text>

                    {/* Divider + item count */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginRight: 10 }} />
                        <Text style={{
                            color: 'rgba(255,255,255,0.80)',
                            fontSize: 11,
                            fontWeight: '600',
                            letterSpacing: 0.3,
                        }}>
                            {category.itemCount} items
                        </Text>
                    </View>
                </View>
            </TouchableOpacity> 
        </Animated.View>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function CategorySection() {
    const fadeAnim    = useRef(new Animated.Value(0)).current;
    const slideAnim   = useRef(new Animated.Value(40)).current;

    const scrollRef       = useRef<ScrollView>(null);
    const scrollX         = useRef(0);
    const maxScroll       = useRef(0);
    const isUserDragging  = useRef(false);
    const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const goLeft  = () => goToIndex(Math.max(0, activeIndex - 1));
    const goRight = () => goToIndex(Math.min(totalDots - 1, activeIndex + 1));

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#0F0F0F',
            paddingVertical: 56,
        }}>
            <View style={{ maxWidth: 1400, width: '100%', alignSelf: 'center' }}>

                {/* ── Section Header ── */}
                <View style={{ alignItems: 'center', marginBottom: 36, paddingHorizontal: H_PADDING }}>
                    {/* Eyebrow */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ width: 32, height: 2, backgroundColor: '#8B4513', borderRadius: 2, marginRight: 10 }} />
                        <Feather name="grid" size={18} color="#8B4513" />
                        <View style={{ width: 32, height: 2, backgroundColor: '#8B4513', borderRadius: 2, marginLeft: 10 }} />
                    </View>

                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: SCREEN_WIDTH < 768 ? 26 : 36,
                        fontWeight: '800',
                        letterSpacing: -1,
                        textAlign: 'center',
                        marginBottom: 8,
                    }}>
                        Shop by{' '}
                        <Text style={{ color: '#8B4513' }}>Category</Text>
                    </Text>

                    <Text style={{
                        color: 'rgba(255,255,255,0.50)',
                        fontSize: 14,
                        textAlign: 'center',
                        lineHeight: 22,
                        maxWidth: 420,
                    }}>
                        Explore our wide range of categories and find exactly what you're looking for
                    </Text>
                </View>

                {/* ── Carousel ── */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_GAP}
                    snapToAlignment="start"
                    contentContainerStyle={{ paddingHorizontal: H_PADDING }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onScrollEndDrag={handleScrollEndDrag}
                    onMomentumScrollEnd={handleScrollEndDrag}
                    onContentSizeChange={(w) => { maxScroll.current = w - SCREEN_WIDTH; }}
                >
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} fadeAnim={fadeAnim} />
                    ))}
                </ScrollView>

                {/* ── Dots + Arrows ── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 28,
                    paddingHorizontal: H_PADDING,
                    gap: 10,
                }}>
                    {/* Left arrow */}
                    <TouchableOpacity
                        onPress={goLeft}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: 'rgba(255,255,255,0.18)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                        }}
                    >
                        <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    {/* Dot indicators */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                        {Array.from({ length: totalDots }, (_, i) => {
                            const isActive = activeIndex === i;
                            return (
                                <TouchableOpacity key={i} onPress={() => goToIndex(i)}>
                                    <View style={{
                                        width: isActive ? 28 : 7,
                                        height: 7,
                                        borderRadius: 4,
                                        backgroundColor: isActive ? '#8B4513' : 'rgba(255,255,255,0.25)',
                                    }} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Right arrow */}
                    <TouchableOpacity
                        onPress={goRight}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#8B4513',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Feather name="chevron-right" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* ── Browse All CTA ── */}
                <View style={{ alignItems: 'center', marginTop: 36, paddingHorizontal: H_PADDING }}>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#8B4513',
                        paddingHorizontal: 32,
                        paddingVertical: 15,
                        borderRadius: 50,
                        shadowColor: '#8B4513',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.45,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <Feather name="compass" size={18} color="#FFF" />
                        <Text style={{
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: 15,
                            marginLeft: 10,
                            letterSpacing: 0.3,
                        }}>
                            Browse All Categories
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}