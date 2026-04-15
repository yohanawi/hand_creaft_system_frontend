import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// ─── Responsive sizing (recalculated on each render via hook) ─────────────────
function useLayout() {
    const [dim, setDim] = useState(Dimensions.get('window'));
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => setDim(window));
        return () => sub?.remove();
    }, []);

    const W = dim.width;
    const isMobile = W < 640;
    const isTablet = W >= 640 && W < 1024;

    // On mobile show 1 card centred; tablet/desktop always 3
    const VISIBLE = isMobile ? 1 : 3;
    const H_PAD = isMobile ? 16 : isTablet ? 32 : 60;
    const GAP = isMobile ? 12 : 20;
    // Card width: centre card is wider on mobile (full visible area)
    const CARD_WIDTH = isMobile
        ? W - H_PAD * 2
        : (W - H_PAD * 2 - GAP * (VISIBLE - 1)) / VISIBLE;
    const STEP = CARD_WIDTH + GAP;
    const SIDE_SCALE = isMobile ? 0.88 : 0.82;
    const CARD_H = isMobile ? 270 : isTablet ? 300 : 300;

    return { W, isMobile, isTablet, VISIBLE, H_PAD, GAP, CARD_WIDTH, STEP, SIDE_SCALE, CARD_H };
}

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

const TOTAL = TESTIMONIALS.length;
const EXTENDED = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
type TItem = typeof TESTIMONIALS[0];

// ─── Card ─────────────────────────────────────────────────────────────────────
function ReviewCard({ item, cardWidth, cardH, scale, opacity }: {
    item: TItem;
    cardWidth: number;
    cardH: number;
    scale: Animated.AnimatedInterpolation<number>;
    opacity: Animated.AnimatedInterpolation<number>;
}) {
    return (
        <Animated.View style={{ width: cardWidth, height: cardH, transform: [{ scale }], opacity, }}>
            <View className="flex-1 overflow-hidden bg-white border rounded-3xl">
                <View className="h-1 w-full bg-[#8B4513]" />
                <View className="justify-between flex-1 p-5">
                    <View>
                        <View className="flex-row items-start justify-between mb-3">
                            {/* Quote icon box */}
                            <View className="w-11 h-11 rounded-xl bg-[#FDF0E8] items-center justify-center">
                                <Text className="text-[32px] leading-[38px] text-[#8B4513] font-black -mt-1">
                                    "
                                </Text>
                            </View>
                            {/* Verified badge */}
                            <View className="flex-row items-center gap-1 bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-full">
                                <Feather name="check-circle" size={11} color="#16A34A" />
                                <Text className="text-[#16A34A] text-[10px] font-bold">
                                    Verified
                                </Text>
                            </View>
                        </View>
                        {/* Stars */}
                        <View className="flex-row gap-1 mb-2.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Feather key={i} name="star" size={14} color="#F59E0B" />
                            ))}
                        </View>

                        {/* Review text */}
                        <Text className="text-[#1A0F0A] text-[13px] leading-[21px] font-medium" numberOfLines={4}>
                            {item.review}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-[#EDE5DC] my-3" />

                    {/* Avatar + name + role + location */}
                    <View className="flex-row items-center gap-2.5 mb-3">
                        <Image source={{ uri: item.avatar }} className="w-11 h-11 rounded-full border-2 border-[#8B4513]" />
                        <View className="flex-1">
                            <Text className="text-[14px] font-extrabold text-[#1A0F0A] tracking-[-0.2px]">
                                {item.name}
                            </Text>
                            <Text className="text-[11px] text-[#8B4513] font-semibold mt-0.5">
                                {item.role}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Feather name="map-pin" size={12} color="#8B4513" />
                            <Text className="text-[#8B4513] font-medium" numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function TestimonialsSection() {

    const { W, CARD_WIDTH, STEP, GAP, CARD_H, SIDE_SCALE } = useLayout();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);
    const centreOffset = (W - CARD_WIDTH) / 2;
    const [activeIdx, setActiveIdx] = useState(0);
    const rawIdxRef = useRef(TOTAL);
    const isScrollingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── entry animation ──
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    // ── jump to initial position (second copy) without animation ──
    useEffect(() => {
        const t = setTimeout(() => {
            scrollRef.current?.scrollTo({ x: TOTAL * STEP, animated: false });
        }, 60);
        return () => clearTimeout(t);
    }, [STEP]);

    // ── scroll to a given extended index ──
    const scrollToRaw = useCallback((rawIdx: number, animated = true) => {
        scrollRef.current?.scrollTo({ x: rawIdx * STEP, animated });
        rawIdxRef.current = rawIdx;
        setActiveIdx(((rawIdx % TOTAL) + TOTAL) % TOTAL);

        // onMomentumScrollEnd does NOT fire for programmatic scrollTo calls,
        // so we schedule the loop correction ourselves after the animation finishes.
        if (animated) {
            if (rawIdx >= TOTAL * 2) {
                setTimeout(() => {
                    const corrected = rawIdx - TOTAL;
                    scrollRef.current?.scrollTo({ x: corrected * STEP, animated: false });
                    rawIdxRef.current = corrected;
                }, 350);
            } else if (rawIdx < TOTAL) {
                setTimeout(() => {
                    const corrected = rawIdx + TOTAL;
                    scrollRef.current?.scrollTo({ x: corrected * STEP, animated: false });
                    rawIdxRef.current = corrected;
                }, 350);
            }
        }
    }, [STEP]);

    // ── shared correction logic (used by both scroll-end handlers) ──
    const correctLoop = useCallback((offsetX: number) => {
        isScrollingRef.current = false;
        const raw = Math.round(offsetX / STEP);
        rawIdxRef.current = raw;
        setActiveIdx(((raw % TOTAL) + TOTAL) % TOTAL);

        if (raw < TOTAL) {
            // Slid into first copy → silently jump to middle copy
            setTimeout(() => {
                const target = raw + TOTAL;
                scrollRef.current?.scrollTo({ x: target * STEP, animated: false });
                rawIdxRef.current = target;
            }, 0);
        } else if (raw >= TOTAL * 2) {
            // Slid into third copy → silently jump to middle copy
            setTimeout(() => {
                const target = raw - TOTAL;
                scrollRef.current?.scrollTo({ x: target * STEP, animated: false });
                rawIdxRef.current = target;
            }, 0);
        }
    }, [STEP]);

    // ── infinite-loop correction after momentum scroll ends ──
    const onMomentumScrollEnd = useCallback((e: any) => {
        correctLoop(e.nativeEvent.contentOffset.x);
    }, [correctLoop]);

    // ── also correct after slow drag-and-release (no momentum) ──
    const onScrollEndDrag = useCallback((e: any) => {
        correctLoop(e.nativeEvent.contentOffset.x);
    }, [correctLoop]);

    // ── auto-play ──
    const startAutoPlay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!isScrollingRef.current) {
                const next = rawIdxRef.current + 1;
                scrollToRaw(next);
            }
        }, 3500);
    }, [scrollToRaw]);

    useEffect(() => {
        startAutoPlay();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startAutoPlay]);

    // ── arrow nav ──
    const goTo = useCallback((direction: -1 | 1) => {
        isScrollingRef.current = false;
        const next = rawIdxRef.current + direction;
        scrollToRaw(next);
        startAutoPlay(); // reset timer
    }, [scrollToRaw, startAutoPlay]);

    return (
        <View className="bg-[#FAF6F2] overflow-hidden relative py-28">
            {/* Background blobs */}
            <View className="absolute -bottom-[40px] -left-[40px] w-[180px] h-[180px] rounded-full bg-[#CD853F] opacity-[0.06]" />

            {/* Header */}
            <header className={`text-center max-w-3xl transition-all duration-700 ease-out mx-auto pb-28`}>
                <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                        Customer Reviews
                    </span>
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                </View>

                <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                    What Our <em style={{ color: '#8B4513' }}>Customers</em> Are Saying
                </h1>

                <p className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75]">
                    Real stories from people who love handmade craft
                </p>
            </header>

            {/* ════════ CAROUSEL ════════ */}
            <Animated.View style={{ opacity: fadeAnim }}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={STEP}
                    decelerationRate="fast"
                    snapToAlignment="center"
                    contentContainerStyle={{
                        paddingHorizontal: centreOffset,
                        gap: GAP,
                        alignItems: 'center',
                    }}
                    onScrollBeginDrag={() => { isScrollingRef.current = true; }}
                    onMomentumScrollBegin={() => { isScrollingRef.current = true; }}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    onScrollEndDrag={onScrollEndDrag}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                >
                    {EXTENDED.map((item, idx) => {
                        // relative offset of this card's centre vs scroll origin
                        const cardCentre = idx * STEP;
                        const inputRange = [
                            cardCentre - STEP,
                            cardCentre,
                            cardCentre + STEP,
                        ];

                        const scale = scrollX.interpolate({
                            inputRange,
                            outputRange: [SIDE_SCALE, 1, SIDE_SCALE],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.55, 1, 0.55],
                            extrapolate: 'clamp',
                        });

                        return (
                            <ReviewCard
                                key={`${item.id}-${idx}`}
                                item={item}
                                cardWidth={CARD_WIDTH}
                                cardH={CARD_H}
                                scale={scale}
                                opacity={opacity}
                            />
                        );
                    })}
                </ScrollView>
            </Animated.View>

            {/* ════════ DOTS + ARROWS ════════ */}
            <View className="flex-row items-center justify-center gap-3.5 mt-7 px-5">
                {/* Left arrow */}
                <TouchableOpacity onPress={() => goTo(-1)} className="w-[42px] h-[42px] rounded-xl border-[1.5px] border-[#DDD0C4] bg-white items-center justify-center shadow-sm" accessibilityLabel="Previous testimonial">
                    <Feather name="chevron-left" size={18} color="#8B4513" />
                </TouchableOpacity>

                {/* Dot indicators */}
                <View className="flex-row items-center gap-[7px]">
                    {TESTIMONIALS.map((_, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => {
                                const target = TOTAL + idx;
                                scrollToRaw(target);
                                startAutoPlay();
                            }}
                            accessibilityLabel={`Go to testimonial ${idx + 1}`}
                        >
                            <View
                                style={{
                                    height: 8,
                                    width: activeIdx === idx ? 28 : 8,
                                    borderRadius: 4,
                                    backgroundColor: activeIdx === idx ? '#8B4513' : '#DDD0C4',
                                }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Right arrow */}
                <TouchableOpacity onPress={() => goTo(1)} className="w-[42px] h-[42px] rounded-xl bg-[#8B4513] items-center justify-center shadow-md" accessibilityLabel="Next testimonial">
                    <Feather name="chevron-right" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ════════ TRUST STRIP ════════ */}
            <View className="flex-row flex-wrap justify-center gap-2.5 mt-16 px-5">
                {(
                    [
                        { icon: 'shield', label: '100% Authentic' },
                        { icon: 'users', label: '50K+ Customers' },
                        { icon: 'star', label: '4.9 Avg Rating' },
                        { icon: 'package', label: 'Free Returns' },
                    ] as { icon: React.ComponentProps<typeof Feather>['name']; label: string }[]
                ).map(b => (
                    <View key={b.label} className="flex-row items-center gap-1.5 bg-white px-5 py-2.5 rounded-full border border-[#EDE5DC] shadow-sm">
                        <Feather name={b.icon} size={13} color="#8B4513" />
                        <Text className="text-[#374151] text-sm font-semibold">{b.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}