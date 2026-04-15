import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;
const H_PAD = isMobile ? 16 : 32;
const CARD_GAP = 14;
const CARDS_PER_VIEW = SCREEN_WIDTH >= 1280 ? 4 : SCREEN_WIDTH >= 1024 ? 3 : SCREEN_WIDTH >= 600 ? 2 : 1;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
const STEP = CARD_WIDTH + CARD_GAP;

// --- Delicate, Thin-stroke SVGs for Luxury Aesthetic ---
const Icons = {
    Heart: ({ filled }: { filled?: boolean }) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#D4AF37" : "none"} stroke={filled ? "#D4AF37" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    ),
    Cart: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    ),
    Star: ({ filled }: { filled?: boolean }) => (
        <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "#D4AF37" : "none"} stroke={filled ? "#D4AF37" : "#E5E7EB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    Crown: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="2 4 6 16 12 10 18 16 22 4 2 4"></polygon>
            <line x1="4" y1="20" x2="20" y2="20"></line>
        </svg>
    )
};

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
                <Feather key={s} name="star" size={11} color={s <= Math.floor(rating) ? '#F59E0B' : '#E5E7EB'} />
            ))}
        </View>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function JewelryCard({ item, index }: { item: typeof bestSellers[0]; index: number; }) {
    const [wished, setWished] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Calculate discount for the elegant tag
    const originalNum = item.originalPrice;
    const priceNum = item.price;
    const discount = originalNum > priceNum ? Math.round(((originalNum - priceNum) / originalNum) * 100) : 0;

    // Staggered elegant fade-in
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 150 + 200);
        return () => clearTimeout(timer);
    }, [index]);

    const handleWish = (e: React.MouseEvent) => {
        e.preventDefault();
        setWished(!wished);
    };

    return (
        <div className={`group relative flex-shrink-0 w-[280px] sm:w-[320px] snap-center rounded-[2rem] bg-white cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] 
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
            hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(212,175,55,0.15)]`}
            style={{ transitionDelay: isVisible ? '0ms' : `${index * 100}ms` }}
        >
            {/* Elegant Border Wrapper */}
            <div className="absolute inset-0 rounded-[2rem] border-[1.5px] border-[#F5F2ED] transition-colors duration-700 group-hover:border-[#E8DFD0] pointer-events-none" />

            {/* ── Image Section ── */}
            <div className="relative aspect-[1/1] w-full overflow-hidden rounded-t-[2rem] rounded-b-[1rem] bg-[#FAFAFA] p-2 pb-0">
                <div className="relative w-full h-full overflow-hidden rounded-[1.5rem] bg-[#F4F1ED]">
                    <Image
                        source={{ uri: item.image }}
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                        }}
                    />

                    {/* Soft luxury lighting overlay */}
                    <div className="absolute inset-0 transition-opacity duration-700 opacity-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 group-hover:opacity-100" />

                    {/* Category Pill — Top Left */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/50">
                        <span className="text-[#8C7A6B] text-[8px] font-bold tracking-[0.25em] uppercase">
                            {item.category}
                        </span>
                    </div>

                    {/* Wishlist Button — Top Right */}
                    <button
                        onClick={handleWish}
                        className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm border
                            ${wished ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/90 border-white/50 hover:bg-white'}`}
                        style={{ transform: wished ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <div className={`transition-transform duration-500 ${wished ? 'scale-110' : 'scale-100'}`}>
                            <Icons.Heart filled={wished} />
                        </div>
                    </button>

                    {/* Best Seller Badge — Bottom Left */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg"
                        style={{ backgroundColor: item.badgeColor }}>
                        {item.badge === 'Best Seller' && <span className="text-[#D4AF37]"><Icons.Crown /></span>}
                        <span className="text-white text-[9px] font-semibold tracking-[0.15em] uppercase">
                            {item.badge}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Content Section ── */}
            <div className="relative p-6 pt-5 bg-white rounded-b-[2rem]">

                {/* Title & Rating */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <StarRow rating={item.rating} />
                        <span className="text-[10px] text-[#A69B91] tracking-wider">
                            ({item.reviews})
                        </span>
                    </div>
                    <h3 className="text-[17px] font-serif font-medium text-[#1A1A1A] leading-snug tracking-tight line-clamp-2">
                        {item.name}
                    </h3>
                </div>

                {/* Price & Action Row */}
                <div className="flex items-end justify-between pt-4 border-t border-[#F5F2ED]">
                    <div className="flex flex-col">
                        {discount > 0 && (
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] text-[#A69B91] line-through decoration-[#D4AF37]/40">
                                    LKR {item.originalPrice}
                                </span>
                                <span className="text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase">
                                    Save {discount}%
                                </span>
                            </div>
                        )}
                        <span className="text-[18px] font-serif text-[#1A1A1A]">
                            LKR {item.price}
                        </span>
                    </div>

                    {/* Elegant Cart Button */}
                    <button className="relative overflow-hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E8DFD0] text-[#1A1A1A] transition-all duration-500 hover:bg-[#1A1A1A] hover:border-[#1A1A1A] hover:text-white group/btn">
                        <span className="relative z-10 transition-transform duration-500 group-hover/btn:scale-90">
                            <Icons.Cart />
                        </span>
                    </button>
                </div>
            </div>
        </div>
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
        <View className="bg-[#FBF7F3] pt-16 pb-14 overflow-hidden">
            {/* Header */}
            <header className={`text-center max-w-3xl transition-all duration-700 ease-out mx-auto pb-20`}>
                <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                        Our Most Loved Crafts
                    </span>
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                </View>

                <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                    Customer <em style={{ color: '#8B4513' }}>Favorites</em>
                </h1>

                <p className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75]">
                    Real products loved by thousands of happy customers worldwide
                </p>
            </header>

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
                    <View key={item.id} style={{ marginRight: idx < bestSellers.length - 1 ? CARD_GAP : 0 }}>
                        <JewelryCard item={item} index={idx} />
                    </View>
                ))}
            </ScrollView>

            {/* ═══════════════════════════════════
                BOTTOM: Dots + Arrows + CTA  (all centered)
            ═══════════════════════════════════ */}
            <Animated.View className="items-center mt-7 px-5 gap-4.5" style={{ opacity: ctaAnim }} >
                {/* Navigation arrows + CTA row */}
                <View className="flex-row items-center justify-center gap-3.5 mt-7 px-5">
                    {/* Left arrow */}
                    <TouchableOpacity onPress={() => goTo(activeIdx - 1)} disabled={activeIdx === 0} className="w-[42px] h-[42px] rounded-xl bg-[#8B4513] items-center justify-center shadow-md">
                        <Feather name="chevron-left" size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* View All CTA */}
                    <TouchableOpacity className="flex-row items-center gap-2 bg-[#8B4513] px-7 py-3.5 rounded-full">
                        <Feather name="award" size={16} color="#fff" />
                        <Text className="text-white font-extrabold text-sm tracking-[0.2px]">
                            View All Best Sellers
                        </Text>
                        <Feather name="arrow-right" size={15} color="#fff" />
                    </TouchableOpacity>

                    {/* Right arrow */}
                    <TouchableOpacity onPress={() => goTo(activeIdx + 1)} disabled={activeIdx >= maxIndex} className="w-[42px] h-[42px] rounded-xl bg-[#8B4513] items-center justify-center shadow-md" >
                        <Feather name="chevron-right" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Animated.View >
        </View >
    );
}