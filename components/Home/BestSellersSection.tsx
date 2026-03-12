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

const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

const H_PAD = isMobile ? 16 : 32;
const CARD_GAP = 14;
const CARDS_PER_VIEW = SCREEN_WIDTH >= 1280 ? 4 : SCREEN_WIDTH >= 1024 ? 3 : SCREEN_WIDTH >= 600 ? 2 : 1;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
const STEP = CARD_WIDTH + CARD_GAP;

// ─── Data ─────────────────────────────────────────────────────────────────────
const bestSellers = [
    {
        id: 1,
        name: 'Handwoven Macramé Wall Hanging',
        price: 79.99,
        originalPrice: 99.99,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        rating: 4.9,
        reviews: 312,
        soldCount: '2.4k sold',
        badge: '#1 Best Seller',
        badgeColor: '#CA8A04',
        category: 'Wall Art',
    },
    {
        id: 2,
        name: 'Artisan Ceramic Mug Set',
        price: 54.99,
        originalPrice: 69.99,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
        rating: 4.8,
        reviews: 289,
        soldCount: '1.8k sold',
        badge: 'Hot 🔥',
        badgeColor: '#DC2626',
        category: 'Kitchen',
    },
    {
        id: 3,
        name: 'Hand-Poured Soy Candle Collection',
        price: 39.99,
        originalPrice: 49.99,
        image: 'https://images.unsplash.com/photo-1602178506049-3650c8d54985?w=600&q=80',
        rating: 4.9,
        reviews: 445,
        soldCount: '3.1k sold',
        badge: 'Fan Favorite',
        badgeColor: '#8B4513',
        category: 'Home Décor',
    },
    {
        id: 4,
        name: 'Leather Bound Journal',
        price: 44.99,
        originalPrice: 59.99,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
        rating: 4.7,
        reviews: 198,
        soldCount: '1.2k sold',
        badge: 'Top Rated',
        badgeColor: '#15803D',
        category: 'Stationery',
    },
    {
        id: 5,
        name: 'Botanical Pressed Flower Frame',
        price: 64.99,
        originalPrice: 84.99,
        image: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=600&q=80',
        rating: 4.8,
        reviews: 167,
        soldCount: '980 sold',
        badge: 'Trending',
        badgeColor: '#7C3AED',
        category: 'Wall Art',
    },
    {
        id: 6,
        name: 'Knitted Throw Blanket',
        price: 89.99,
        originalPrice: 119.99,
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
        rating: 4.9,
        reviews: 523,
        soldCount: '4.2k sold',
        badge: 'Most Loved',
        badgeColor: '#BE123C',
        category: 'Textiles',
    },
];

// ─── Star row ─────────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 1 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <Feather
                    key={s}
                    name="star"
                    size={11}
                    color={s <= Math.floor(rating) ? '#F59E0B' : '#E5E7EB'}
                />
            ))}
        </View>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
    item,
    index,
    fadeAnim,
}: {
    item: typeof bestSellers[0];
    index: number;
    fadeAnim: Animated.Value;
}) {
    const [wished, setWished] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const heartAnim = useRef(new Animated.Value(1)).current;
    const entryAnim = useRef(new Animated.Value(0)).current;

    const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

    useEffect(() => {
        Animated.spring(entryAnim, {
            toValue: 1,
            delay: index * 75,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleWish = () => {
        setWished(v => !v);
        Animated.sequence([
            Animated.spring(heartAnim, { toValue: 1.45, useNativeDriver: true }),
            Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    return (
        <Animated.View style={{
            width: CARD_WIDTH,
            marginRight: CARD_GAP,
            opacity: entryAnim,
            transform: [{ scale: entryAnim }],
        }}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 4, useNativeDriver: true }).start()}
            >
                <Animated.View style={{
                    transform: [{ scale: scaleAnim }],
                    backgroundColor: '#fff',
                    borderRadius: 24,
                    overflow: 'hidden',
                    shadowColor: '#8B4513',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.10,
                    shadowRadius: 18,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#F0E8E0',
                }}>

                    {/* ── Image ── */}
                    <View style={{ position: 'relative' }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: '100%', height: isMobile ? 195 : 210 }}
                            resizeMode="cover"
                        />
                        {/* Bottom scrim */}
                        <View style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
                            backgroundColor: 'rgba(0,0,0,0.28)',
                        }} />

                        {/* Category pill — top-left */}
                        <View style={{
                            position: 'absolute', top: 12, left: 12,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            paddingHorizontal: 9, paddingVertical: 4,
                            borderRadius: 20,
                        }}>
                            <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }}>
                                {item.category.toUpperCase()}
                            </Text>
                        </View>

                        {/* Discount badge — top-right */}
                        {discount > 0 && (
                            <View style={{
                                position: 'absolute', top: 12, right: 48,
                                backgroundColor: '#EF4444',
                                width: 38, height: 38, borderRadius: 19,
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', lineHeight: 13 }}>
                                    -{discount}%
                                </Text>
                            </View>
                        )}

                        {/* Wishlist — top-right */}
                        <TouchableOpacity
                            onPress={handleWish}
                            style={{
                                position: 'absolute', top: 12, right: 12,
                                width: 34, height: 34, borderRadius: 11,
                                backgroundColor: wished ? '#EF4444' : 'rgba(255,255,255,0.92)',
                                alignItems: 'center', justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.12,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                                <Feather name="heart" size={15} color={wished ? '#fff' : '#8B4513'} />
                            </Animated.View>
                        </TouchableOpacity>

                        {/* Badge pill — bottom-left */}
                        <View style={{
                            position: 'absolute', bottom: 12, left: 12,
                            backgroundColor: item.badgeColor,
                            paddingHorizontal: 9, paddingVertical: 4,
                            borderRadius: 20,
                        }}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                                {item.badge}
                            </Text>
                        </View>

                        {/* Sold count — bottom-right */}
                        <View style={{
                            position: 'absolute', bottom: 12, right: 12,
                            flexDirection: 'row', alignItems: 'center', gap: 3,
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            paddingHorizontal: 8, paddingVertical: 4,
                            borderRadius: 20,
                        }}>
                            <Feather name="trending-up" size={9} color="#FFD700" />
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{item.soldCount}</Text>
                        </View>
                    </View>

                    {/* ── Content ── */}
                    <View style={{ padding: 14 }}>
                        {/* Name */}
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '800',
                            color: '#1A0F0A',
                            letterSpacing: -0.2,
                            lineHeight: 20,
                            marginBottom: 8,
                        }} numberOfLines={2}>
                            {item.name}
                        </Text>

                        {/* Stars + count */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <StarRow rating={item.rating} />
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#F59E0B' }}>{item.rating}</Text>
                            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>({item.reviews})</Text>
                        </View>

                        {/* Price row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: '#8B4513', letterSpacing: -0.5 }}>
                                    ${item.price}
                                </Text>
                                <Text style={{ fontSize: 11, color: '#D1D5DB', textDecorationLine: 'line-through', marginTop: 1 }}>
                                    ${item.originalPrice}
                                </Text>
                            </View>

                            {/* Add to cart */}
                            <TouchableOpacity style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#8B4513',
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 14,
                                shadowColor: '#8B4513',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.30,
                                shadowRadius: 8,
                                elevation: 4,
                            }}>
                                <Feather name="shopping-cart" size={13} color="#fff" />
                                {!isMobile && CARD_WIDTH > 200 && (
                                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Add</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BestSellersSection() {
    const titleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(36)).current;
    const ctaAnim = useRef(new Animated.Value(0)).current;

    const scrollRef = useRef<ScrollView>(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const scrollXRef = useRef(0);
    const isDragging = useRef(false);
    const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const maxIndex = bestSellers.length - CARDS_PER_VIEW;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
        Animated.timing(ctaAnim, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }).start();
        startAuto();
        return () => stopAuto();
    }, []);

    const startAuto = () => {
        stopAuto();
        autoRef.current = setInterval(() => {
            if (isDragging.current) return;
            setActiveIdx(prev => {
                const next = prev >= maxIndex ? 0 : prev + 1;
                scrollRef.current?.scrollTo({ x: next * STEP, animated: true });
                return next;
            });
        }, 3200);
    };

    const stopAuto = () => {
        if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollXRef.current = e.nativeEvent.contentOffset.x;
        setActiveIdx(Math.round(scrollXRef.current / STEP));
    };

    const goTo = (idx: number) => {
        const clamped = Math.max(0, Math.min(idx, maxIndex));
        scrollRef.current?.scrollTo({ x: clamped * STEP, animated: true });
        setActiveIdx(clamped);
        stopAuto();
        startAuto();
    };

    return (
        <View style={{ backgroundColor: '#FBF7F3', paddingTop: 64, paddingBottom: 56, overflow: 'hidden' }}>

            {/* ── Decorative blobs ── */}
            <View style={{
                position: 'absolute', top: -80, right: -80,
                width: 300, height: 300, borderRadius: 150,
                backgroundColor: '#8B4513', opacity: 0.05,
            }} />
            <View style={{
                position: 'absolute', bottom: -60, left: -60,
                width: 240, height: 240, borderRadius: 120,
                backgroundColor: '#CD853F', opacity: 0.07,
            }} />

            {/* ═══════════════════════════════════
                CENTERED HEADER
            ═══════════════════════════════════ */}
            <Animated.View style={{
                opacity: titleAnim,
                transform: [{ translateY: slideAnim }],
                alignItems: 'center',
                paddingHorizontal: H_PAD,
                marginBottom: 36,
            }}>
                {/* Eyebrow */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <View style={{ width: 28, height: 2, backgroundColor: '#8B4513', borderRadius: 2 }} />
                    <Text style={{
                        fontSize: 11, fontWeight: '700',
                        color: '#8B4513', letterSpacing: 2.5,
                        textTransform: 'uppercase',
                    }}>
                        Our Most Loved Crafts
                    </Text>
                    <View style={{ width: 28, height: 2, backgroundColor: '#8B4513', borderRadius: 2 }} />
                </View>

                {/* Title */}
                <Text style={{
                    fontSize: isMobile ? 28 : isTablet ? 34 : 42,
                    fontWeight: '900',
                    color: '#1A0F0A',
                    textAlign: 'center',
                    letterSpacing: -1,
                    lineHeight: isMobile ? 34 : 50,
                    marginBottom: 10,
                }}>
                    Customer{' '}
                    <Text style={{ color: '#8B4513' }}>Favorites</Text>
                    {' '}❤️
                </Text>

                <Text style={{
                    color: '#6B7280',
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 22,
                    maxWidth: 420,
                }}>
                    Real products loved by thousands of happy customers worldwide
                </Text>
            </Animated.View>

            {/* ═══════════════════════════════════
                PRODUCT CAROUSEL
            ═══════════════════════════════════ */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                onScrollBeginDrag={() => { isDragging.current = true; stopAuto(); }}
                onScrollEndDrag={() => { isDragging.current = false; startAuto(); }}
                onMomentumScrollEnd={() => { isDragging.current = false; }}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={STEP}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: H_PAD }}
            >
                {bestSellers.map((item, idx) => (
                    <ProductCard
                        key={item.id}
                        item={item}
                        index={idx}
                        fadeAnim={titleAnim}
                    />
                ))}
            </ScrollView>

            {/* ═══════════════════════════════════
                BOTTOM: Dots + Arrows + CTA  (all centered)
            ═══════════════════════════════════ */}
            <Animated.View style={{
                opacity: ctaAnim,
                alignItems: 'center',
                marginTop: 28,
                paddingHorizontal: H_PAD,
                gap: 18,
            }}>
                {/* Dot indicators */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {bestSellers.map((_, idx) => (
                        <TouchableOpacity key={idx} onPress={() => goTo(idx)}>
                            <View style={{
                                width: activeIdx === idx ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: activeIdx === idx ? '#8B4513' : '#DDD0C4',
                            }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Navigation arrows + CTA row */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    {/* Left arrow */}
                    <TouchableOpacity
                        onPress={() => goTo(activeIdx - 1)}
                        disabled={activeIdx === 0}
                        style={{
                            width: 44, height: 44, borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: activeIdx === 0 ? '#E5E7EB' : '#8B4513',
                            backgroundColor: activeIdx === 0 ? '#F9F9F9' : '#fff',
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: activeIdx === 0 ? 0 : 0.10,
                            shadowRadius: 6,
                            elevation: activeIdx === 0 ? 0 : 2,
                        }}
                    >
                        <Feather name="chevron-left" size={20} color={activeIdx === 0 ? '#D1D5DB' : '#8B4513'} />
                    </TouchableOpacity>

                    {/* View All CTA */}
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#8B4513',
                        paddingHorizontal: 28,
                        paddingVertical: 14,
                        borderRadius: 50,
                        shadowColor: '#8B4513',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.38,
                        shadowRadius: 12,
                        elevation: 7,
                    }}>
                        <Feather name="award" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 }}>
                            View All Best Sellers
                        </Text>
                        <Feather name="arrow-right" size={15} color="#fff" />
                    </TouchableOpacity>

                    {/* Right arrow */}
                    <TouchableOpacity
                        onPress={() => goTo(activeIdx + 1)}
                        disabled={activeIdx >= maxIndex}
                        style={{
                            width: 44, height: 44, borderRadius: 14,
                            backgroundColor: activeIdx >= maxIndex ? '#F9F9F9' : '#8B4513',
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: activeIdx >= maxIndex ? 0 : 0.32,
                            shadowRadius: 8,
                            elevation: activeIdx >= maxIndex ? 0 : 4,
                        }}
                    >
                        <Feather name="chevron-right" size={20} color={activeIdx >= maxIndex ? '#D1D5DB' : '#fff'} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}