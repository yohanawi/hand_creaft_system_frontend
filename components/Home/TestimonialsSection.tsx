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

// ── Exactly 3 cards always visible, center = active ───────────────────────────
const PEEK    = isMobile ? 28 : 52;
const GAP     = isMobile ? 12 : 18;
const CARD_W  = SCREEN_WIDTH - PEEK * 2 - GAP * 2;
const CARD_H  = isMobile ? 360 : 400;   // ← fixed height: all cards identical
const STEP    = CARD_W + GAP;

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Sarah Mitchell',
        role: 'Interior Designer',
        location: 'New York, USA',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        review: `Absolutely in love with my Macramé wall hanging! The craftsmanship is stunning and surpassed all my expectations. It's now the centrepiece of my living room. Will definitely order again!`,
        product: 'Handwoven Macramé Wall Hanging',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80',
        date: '2 days ago',
    },
    {
        id: 2,
        name: "James O'Brien",
        role: 'Coffee Enthusiast',
        location: 'Dublin, Ireland',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        review: `The ceramic mug set arrived beautifully packaged. Each piece is unique and imperfect in the most perfect way. You can feel the love that went into making these. Morning ritual: elevated!`,
        product: 'Artisan Ceramic Mug Set',
        productImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&q=80',
        date: '1 week ago',
    },
    {
        id: 3,
        name: 'Priya Sharma',
        role: 'Home Decorator',
        location: 'Mumbai, India',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        review: `These soy candles are something else — the scent is rich and natural. They burn evenly for hours. I've gifted them to three friends and they all asked where I got them.`,
        product: 'Hand-Poured Soy Candle Collection',
        productImage: 'https://images.unsplash.com/photo-1602178506049-3650c8d54985?w=100&q=80',
        date: '3 days ago',
    },
    {
        id: 4,
        name: 'Lena Novak',
        role: 'Journalist & Writer',
        location: 'Berlin, Germany',
        avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
        review: `The leather journal feels like an heirloom. Supple, warm-toned pages perfect for fountain pens. I use it as my daily sketchbook. Shipping was fast and packaging gorgeous.`,
        product: 'Leather Bound Journal',
        productImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&q=80',
        date: '5 days ago',
    },
    {
        id: 5,
        name: 'Carlos Rivera',
        role: 'Gift Enthusiast',
        location: 'Barcelona, Spain',
        avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
        review: `Ordered the knitted blanket as a gift and my sister literally cried when she opened it. The texture, the weight, the colours — pure art. Worth every penny and more.`,
        product: 'Knitted Throw Blanket',
        productImage: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=100&q=80',
        date: '1 week ago',
    },
];

type TItem = typeof TESTIMONIALS[0];

// ─── Card ─────────────────────────────────────────────────────────────────────
function ReviewCard({ item, active }: { item: TItem; active: boolean }) {
    const scaleAnim = useRef(new Animated.Value(active ? 1 : 0.92)).current;
    const opacAnim  = useRef(new Animated.Value(active ? 1 : 0.55)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: active ? 1 : 0.92,
                tension: 70, friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(opacAnim, {
                toValue: active ? 1 : 0.55,
                duration: 260,
                useNativeDriver: true,
            }),
        ]).start();
    }, [active]);

    return (
        <Animated.View style={{
            width: CARD_W,
            height: CARD_H,
            marginRight: GAP,
            transform: [{ scale: scaleAnim }],
            opacity: opacAnim,
        }}>
            <View style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 24,
                borderWidth: active ? 2 : 1.5,
                borderColor: active ? '#8B4513' : '#EDE5DC',
                shadowColor: active ? '#8B4513' : '#000',
                shadowOffset: { width: 0, height: active ? 12 : 4 },
                shadowOpacity: active ? 0.18 : 0.06,
                shadowRadius: active ? 24 : 10,
                elevation: active ? 12 : 3,
                overflow: 'hidden',
            }}>

                {/* ── Active top accent bar ── */}
                {active && (
                    <View style={{ height: 4, backgroundColor: '#8B4513', width: '100%' }} />
                )}

                <View style={{ flex: 1, padding: isMobile ? 18 : 22, justifyContent: 'space-between' }}>

                    {/* ── TOP: Quote + Stars + Verified ── */}
                    <View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 14,
                        }}>
                            {/* Quote mark */}
                            <View style={{
                                width: 44, height: 44, borderRadius: 14,
                                backgroundColor: active ? '#FDF0E8' : '#F7F3F0',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: 32, lineHeight: 38,
                                    color: active ? '#8B4513' : '#C4A882',
                                    fontWeight: '900', marginTop: -4,
                                }}>"</Text>
                            </View>

                            {/* Verified badge */}
                            <View style={{
                                flexDirection: 'row', alignItems: 'center', gap: 4,
                                backgroundColor: active ? '#F0FDF4' : '#F9F9F9',
                                borderWidth: 1,
                                borderColor: active ? '#BBF7D0' : '#EEE',
                                paddingHorizontal: 9, paddingVertical: 4,
                                borderRadius: 20,
                            }}>
                                <Feather name="check-circle" size={11} color={active ? '#16A34A' : '#9CA3AF'} />
                                <Text style={{
                                    color: active ? '#16A34A' : '#9CA3AF',
                                    fontSize: 10, fontWeight: '700',
                                }}>
                                    Verified
                                </Text>
                            </View>
                        </View>

                        {/* Stars */}
                        <View style={{ flexDirection: 'row', gap: 3, marginBottom: 12 }}>
                            {[1,2,3,4,5].map(i => (
                                <Feather
                                    key={i}
                                    name="star"
                                    size={14}
                                    color={active ? '#F59E0B' : '#D4C4B0'}
                                />
                            ))}
                        </View>

                        {/* Review text */}
                        <Text style={{
                            color: active ? '#1A0F0A' : '#6B7280',
                            fontSize: 13,
                            lineHeight: 21,
                            fontWeight: active ? '500' : '400',
                        }} numberOfLines={4}>
                            {item.review}
                        </Text>
                    </View>

                    {/* ── MIDDLE: Divider ── */}
                    <View style={{
                        height: 1,
                        backgroundColor: active ? '#EDE5DC' : '#F3F4F6',
                        marginVertical: 14,
                    }} />

                    {/* ── AUTHOR ROW ── */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 14,
                    }}>
                        <View style={{ position: 'relative' }}>
                            <Image
                                source={{ uri: item.avatar }}
                                style={{
                                    width: 44, height: 44, borderRadius: 22,
                                    borderWidth: 2,
                                    borderColor: active ? '#8B4513' : '#E5DDD5',
                                }}
                            />
                            {active && (
                                <View style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 13, height: 13, borderRadius: 7,
                                    backgroundColor: '#22C55E',
                                    borderWidth: 2, borderColor: '#fff',
                                }} />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 14, fontWeight: '800',
                                color: active ? '#1A0F0A' : '#374151',
                                letterSpacing: -0.2,
                            }}>
                                {item.name}
                            </Text>
                            <Text style={{
                                fontSize: 11,
                                color: active ? '#8B4513' : '#9CA3AF',
                                fontWeight: '600', marginTop: 1,
                            }}>
                                {item.role}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Feather name="map-pin" size={9} color={active ? '#8B4513' : '#D1D5DB'} />
                            <Text style={{
                                color: active ? '#8B4513' : '#9CA3AF',
                                fontSize: 10, fontWeight: '500',
                            }} numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
                    </View>

                    {/* ── PURCHASED STRIP ── */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        padding: 10,
                        borderRadius: 14,
                        backgroundColor: active ? '#FDF0E8' : '#F9F7F5',
                        borderWidth: 1,
                        borderColor: active ? '#E8C8A8' : '#EDE5DC',
                    }}>
                        <Image
                            source={{ uri: item.productImage }}
                            style={{
                                width: 38, height: 38, borderRadius: 10,
                                borderWidth: 1,
                                borderColor: active ? '#D4A07A' : '#E5DDD5',
                            }}
                            resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: active ? '#8B4513' : '#9CA3AF',
                                fontSize: 9, fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: 0.8,
                            }}>
                                Purchased
                            </Text>
                            <Text style={{
                                color: active ? '#1A0F0A' : '#4B5563',
                                fontSize: 11, fontWeight: '700', marginTop: 2,
                            }} numberOfLines={1}>
                                {item.product}
                            </Text>
                        </View>
                        <Feather
                            name="shopping-bag"
                            size={14}
                            color={active ? '#8B4513' : '#D1D5DB'}
                        />
                    </View>

                    {/* Date */}
                    <Text style={{
                        color: active ? '#A07050' : '#C4B8AD',
                        fontSize: 10,
                        fontWeight: '500',
                        textAlign: 'right',
                        marginTop: 10,
                    }}>
                        {item.date}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const scrollRef = useRef<ScrollView>(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const autoRef   = useRef<ReturnType<typeof setInterval> | null>(null);
    const dragging  = useRef(false);

    const total     = TESTIMONIALS.length;
    const avgRating = (TESTIMONIALS.reduce((a, t) => a + 5, 0) / total).toFixed(1);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
        startAuto();
        return () => stopAuto();
    }, []);

    const startAuto = () => {
        stopAuto();
        autoRef.current = setInterval(() => {
            if (dragging.current) return;
            setActiveIdx(prev => {
                const next = (prev + 1) % total;        // ← loop
                scrollRef.current?.scrollTo({ x: next * STEP, animated: true });
                return next;
            });
        }, 4000);
    };

    const stopAuto = () => {
        if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / STEP);
        setActiveIdx(Math.max(0, Math.min(idx, total - 1)));
    };

    const goTo = (idx: number) => {
        // loop wrap
        const c = ((idx % total) + total) % total;
        scrollRef.current?.scrollTo({ x: c * STEP, animated: true });
        setActiveIdx(c);
        stopAuto();
        startAuto();
    };

    return (
        <View style={{
            backgroundColor: '#FAF6F2',
            paddingVertical: 60,
            overflow: 'hidden',
        }}>
            {/* ── Subtle background dots pattern ── */}
            <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.025,
                backgroundColor: '#8B4513',
            }} />

            {/* ── Blobs ── */}
            <View style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#8B4513', opacity: 0.04 }} />
            <View style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: 90,  backgroundColor: '#CD853F', opacity: 0.06 }} />

            {/* ════════════ HEADER ════════════ */}
            <Animated.View style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                alignItems: isMobile ? 'center' : 'flex-start',
                paddingHorizontal: isMobile ? 20 : 48,
                marginBottom: 36,
            }}>
                <View style={{
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: isMobile ? 20 : 0,
                }}>
                    {/* Text */}
                    <View style={{ alignItems: isMobile ? 'center' : 'flex-start' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <View style={{ width: 24, height: 2, backgroundColor: '#8B4513', borderRadius: 2 }} />
                            <Text style={{
                                fontSize: 10, fontWeight: '700',
                                color: '#8B4513', letterSpacing: 2.5,
                                textTransform: 'uppercase',
                            }}>
                                Customer Reviews
                            </Text>
                            <View style={{ width: 24, height: 2, backgroundColor: '#8B4513', borderRadius: 2 }} />
                        </View>

                        <Text style={{
                            fontSize: isMobile ? 26 : isTablet ? 32 : 40,
                            fontWeight: '900', color: '#1A0F0A',
                            letterSpacing: -1,
                            lineHeight: isMobile ? 32 : 48,
                            textAlign: isMobile ? 'center' : 'left',
                            marginBottom: 8,
                        }}>
                            What Our{' '}
                            <Text style={{ color: '#8B4513' }}>Customers</Text>
                            {'\n'}Are Saying
                        </Text>

                        <Text style={{
                            color: '#6B7280', fontSize: 14, lineHeight: 22,
                            textAlign: isMobile ? 'center' : 'left', maxWidth: 400,
                        }}>
                            Real stories from people who love handmade craft
                        </Text>
                    </View>

                    {/* Rating summary */}
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 22,
                        paddingHorizontal: 24, paddingVertical: 16,
                        alignItems: 'center',
                        borderWidth: 1.5, borderColor: '#EDE5DC',
                        shadowColor: '#8B4513',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.09, shadowRadius: 16,
                        elevation: 4, minWidth: 140,
                    }}>
                        <Text style={{ fontSize: 44, fontWeight: '900', color: '#8B4513', letterSpacing: -2, lineHeight: 50 }}>
                            {avgRating}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                            {[1,2,3,4,5].map(i => (
                                <Feather key={i} name="star" size={14} color="#F59E0B" />
                            ))}
                        </View>
                        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', marginTop: 5 }}>
                            {total * 89}+ verified reviews
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* ════════════ CAROUSEL ════════════ */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                onScrollBeginDrag={() => { dragging.current = true;  stopAuto(); }}
                onScrollEndDrag={() =>   { dragging.current = false; startAuto(); }}
                onMomentumScrollEnd={() => { dragging.current = false; }}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={STEP}
                snapToAlignment="center"
                contentContainerStyle={{ paddingHorizontal: PEEK }}
            >
                {TESTIMONIALS.map((item, idx) => (
                    <ReviewCard
                        key={item.id}
                        item={item}
                        active={activeIdx === idx}
                    />
                ))}
            </ScrollView>

            {/* ════════════ DOTS + ARROWS ════════════ */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                marginTop: 28,
                paddingHorizontal: 20,
            }}>
                {/* Left arrow */}
                <TouchableOpacity
                    onPress={() => goTo(activeIdx - 1)}
                    style={{
                        width: 42, height: 42, borderRadius: 12,
                        borderWidth: 1.5, borderColor: '#DDD0C4',
                        backgroundColor: '#fff',
                        alignItems: 'center', justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06, shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <Feather name="chevron-left" size={18} color="#8B4513" />
                </TouchableOpacity>

                {/* Dot indicators */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    {TESTIMONIALS.map((_, idx) => (
                        <TouchableOpacity key={idx} onPress={() => goTo(idx)}>
                            <View style={{
                                width: activeIdx === idx ? 28 : 8,
                                height: 8, borderRadius: 4,
                                backgroundColor: activeIdx === idx ? '#8B4513' : '#DDD0C4',
                            }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Right arrow */}
                <TouchableOpacity
                    onPress={() => goTo(activeIdx + 1)}
                    style={{
                        width: 42, height: 42, borderRadius: 12,
                        backgroundColor: '#8B4513',
                        alignItems: 'center', justifyContent: 'center',
                        shadowColor: '#8B4513',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.30, shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Feather name="chevron-right" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ════════════ TRUST STRIP ════════════ */}
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 10,
                marginTop: 32,
                paddingHorizontal: 20,
            }}>
                {[
                    { icon: 'shield'  as const, label: '100% Authentic'       },
                    { icon: 'users'   as const, label: '50K+ Customers'        },
                    { icon: 'star'    as const, label: '4.9 Avg Rating'        },
                    { icon: 'package' as const, label: 'Free Returns'          },
                ].map(b => (
                    <View key={b.label} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 7,
                        backgroundColor: '#fff',
                        paddingHorizontal: 14, paddingVertical: 9,
                        borderRadius: 50,
                        borderWidth: 1, borderColor: '#EDE5DC',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04, shadowRadius: 4,
                        elevation: 1,
                    }}>
                        <Feather name={b.icon} size={13} color="#8B4513" />
                        <Text style={{ color: '#374151', fontSize: 12, fontWeight: '600' }}>
                            {b.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}