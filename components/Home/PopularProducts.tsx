import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { products } from '../../Data/product-data';

// Extend the product type to include optional image property
type ProductType = {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    badge: string;
    badgeColor: string;
    icon: string;
    color: string;
    image?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive card count helpers
const getCardsPerView = () => {
    if (SCREEN_WIDTH >= 1280) return 5;
    if (SCREEN_WIDTH >= 1024) return 4;
    if (SCREEN_WIDTH >= 768) return 3;
    if (SCREEN_WIDTH >= 480) return 2;
    return 1;
};

const CARD_GAP = 16;
const CARDS_PER_VIEW = getCardsPerView();
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * (CARDS_PER_VIEW + 1)) / CARDS_PER_VIEW;
const AUTO_SCROLL_INTERVAL = 3000; // ms between auto scrolls 

// --- Inline SVGs for flawless rendering ---
const Icons = {
    Heart: ({ filled }: { filled?: boolean }) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    ),
    Cart: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
    ),
    Star: ({ filled }: { filled?: boolean }) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#D4A373" : "none"} stroke={filled ? "#D4A373" : "#E5E7EB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    Sparkles: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"></path><path d="M3 12h18"></path>
            <path d="m18.36 5.64-12.72 12.72"></path><path d="m5.64 5.64 12.72 12.72"></path>
        </svg>
    )
};

export default function PopularProducts() {

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;
    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUserScrolling = useRef(false);
    const maxScroll = useRef(0);
    const contentWidth = useRef(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeIndex, setActiveIndex] = useState(0);

    const categories = ['All', 'Electronics', 'Fashion', 'Wearables', 'Accessories'];
    const filteredProducts: ProductType[] = selectedCategory === 'All' ? products : products.filter((p: ProductType) => p.category === selectedCategory);

    // Reset scroll on category change
    useEffect(() => {
        scrollRef.current?.scrollTo({ x: 0, animated: true });
        scrollX.current = 0;
        setActiveIndex(0);
    }, [selectedCategory]);

    // Entry animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Auto scroll logic
    const startAutoScroll = () => {
        if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
        autoScrollTimer.current = setInterval(() => {
            if (isUserScrolling.current) return;
            const nextX = scrollX.current + CARD_WIDTH + CARD_GAP;
            if (nextX >= maxScroll.current) {
                scrollRef.current?.scrollTo({ x: 0, animated: true });
                scrollX.current = 0;
                setActiveIndex(0);
            } else {
                scrollRef.current?.scrollTo({ x: nextX, animated: true });
                scrollX.current = nextX;
                setActiveIndex(Math.round(nextX / (CARD_WIDTH + CARD_GAP)));
            }
        }, AUTO_SCROLL_INTERVAL);
    };

    const stopAutoScroll = () => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
            autoScrollTimer.current = null;
        }
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, [filteredProducts.length]);

    const HandcraftCard = ({ product, index }: { product: typeof products[0], index: number }) => {
        const [isVisible, setIsVisible] = useState(false);
        const [isWishlisted, setIsWishlisted] = useState(false);
        const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        // Smooth staggered entrance
        useEffect(() => {
            const timer = setTimeout(() => setIsVisible(true), index * 120 + 150);
            return () => clearTimeout(timer);
        }, [index]);

        const renderStars = (rating: number) => {
            return [...Array(5)].map((_, i) => (
                <Icons.Star key={i} filled={i < Math.floor(rating)} />
            ));
        };

        return (
            <div className={`group relative flex-shrink-0 w-[300px] sm:w-[340px] snap-center rounded-2xl bg-[#FCFAF8] border border-[#F0EBE1] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-12px_rgba(140,90,65,0.12)]
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-12'}`}
            >
                {/* --- Framed Image Area --- */}
                <div className="p-3 pb-0">
                    <div className="relative h-[260px] w-full overflow-hidden rounded-xl bg-[#F3EFEA]">
                        <img
                            src={product.image}
                            alt={product.name}
                            draggable={false}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                        />

                        {/* Subtle warm overlay on hover for that organic feel */}
                        <div className="absolute inset-0 bg-[#8C5A41] mix-blend-overlay opacity-0 transition-opacity duration-700 group-hover:opacity-20" />

                        {/* Top Left Badge */}
                        {product.badge && (
                            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full shadow-sm" style={{ backgroundColor: product.badgeColor }}>
                                <span className="text-white text-[9px] font-bold uppercase tracking-[0.15em]">
                                    {product.badge}
                                </span>
                            </div>
                        )}

                        {/* Top Right Discount Pill */}
                        {discount > 0 && (
                            <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-[#E85D4E] shadow-sm flex items-center justify-center">
                                <span className="text-white text-[10px] font-black tracking-wider">
                                    -{discount}%
                                </span>
                            </div>
                        )}

                        {/* New Arrival Floating Tag */}
                        {product.isNew ? (
                            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-stone-100 flex items-center gap-1.5 text-stone-700">
                                <Icons.Sparkles />
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">New</span>
                            </div>
                        ) : null}

                        {/* Wishlist Button (Glassmorphic) */}
                        <button onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95">
                            <Icons.Heart filled={isWishlisted} />
                        </button>
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div className="p-5 pt-4 flex flex-col h-[180px]">
                    {/* Category & Rating Row */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-[#A68A7C] uppercase tracking-[0.2em]">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">{renderStars(product.rating)}</div>
                            <span className="text-[10px] text-stone-400 font-medium">({product.reviews})</span>
                        </div>
                    </div>

                    {/* Product Name (Serif font for artisanal feel) */}
                    <h3 className="text-lg sm:text-xl font-serif font-medium text-[#2C2420] leading-tight mb-auto line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Price & Action Row */}
                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-[#F0EBE1]/80">
                        <div className="flex flex-col">
                            {discount > 0 ? (
                                <>
                                    <span className="text-xs text-stone-400 line-through mb-0.5 decoration-stone-300">
                                        LKR.{product.originalPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xl font-serif font-semibold text-[#8C5A41]">
                                        LKR.{product.price.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-serif font-semibold text-[#2C2420]">
                                    LKR.{product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Modern Pill Button replacing standard circular button */}
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C2420] text-[#FDFBF7] shadow-md transition-all duration-300 hover:bg-[#8C5A41] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                            <Icons.Cart />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                Add
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
                backgroundColor: '#FDF8F4',
                paddingVertical: 56,
            }}
        >
            <View style={{ maxWidth: 1400, width: '100%', alignSelf: 'center' }}>
                {/* ── Section Header ── */}
                <View style={{ alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
                    <View className="flex flex-row items-center justify-center gap-4 px-6 mb-8">
                        <View className="w-10 h-0.5 bg-amber-900 rounded mr-2.5" />
                        <Feather name="trending-up" size={22} color="#8B4513" />
                        <View className="w-10 h-0.5 bg-amber-900 rounded ml-2.5" />
                    </View>
                    <Text className="text-[28px] md:text-[36px] font-extrabold text-[#8B4513] text-center tracking-[-0.5px] mb-[6px]">
                        Popular Products
                    </Text>
                    <Text className="text-[15px] text-gray-500 text-center">
                        Discover our best-selling items loved by thousands
                    </Text>
                </View>

                {/* ── Category Filter ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
                    className="mb-7">
                    {categories.map((cat, i) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <TouchableOpacity key={i} onPress={() => setSelectedCategory(cat)}
                                className={`mr-2.5 px-5 py-2.5 rounded-full border-1.5 
                                    ${isActive
                                        ? 'bg-amber-900 border-amber-900 shadow-md shadow-amber-900'
                                        : 'bg-white border-amber-900 shadow-sm shadow-amber-900'
                                    }`}>
                                <Text className={`font-bold text-sm tracking-wide ${isActive ? 'text-white' : 'text-amber-900'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ── Product Carousel ── */}
                <div className="flex w-full gap-6 px-6 pt-4 pb-16 overflow-x-auto md:px-12 snap-x snap-mandatory md:gap-8 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {products.map((item, index) => (
                        <HandcraftCard key={item.id} product={item} index={index} />
                    ))}
                    <div className="w-2 shrink-0 md:w-4" />
                </div>

                {/* ── Navigation Controls ── */}
                <View className="flex flex-row items-center justify-center gap-4 px-6 mt-8">
                    {/* Left Arrow */}
                    <TouchableOpacity
                        onPress={() => {
                            const x = Math.max(0, scrollX.current - (CARD_WIDTH + CARD_GAP));
                            scrollRef.current?.scrollTo({ x, animated: true });
                            scrollX.current = x;
                            setActiveIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
                        }}
                        className="w-11 h-11 rounded-full bg-white border-1.5 border-amber-900 items-center justify-center shadow-md shadow-amber-900">
                        <Feather name="chevron-left" size={20} color="#8B4513" />
                    </TouchableOpacity>

                    {/* View All Button */}
                    <TouchableOpacity className="flex flex-row items-center px-8 py-3 bg-white border-2 rounded-full shadow-md border-amber-900 shadow-amber-900">
                        <Text className="mr-2 text-base font-bold text-amber-900">
                            View All Products
                        </Text>
                        <Feather name="arrow-right" size={18} color="#8B4513" />
                    </TouchableOpacity>

                    {/* Right Arrow */}
                    <TouchableOpacity
                        onPress={() => {
                            const x = Math.min(maxScroll.current, scrollX.current + (CARD_WIDTH + CARD_GAP));
                            scrollRef.current?.scrollTo({ x, animated: true });
                            scrollX.current = x;
                            setActiveIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
                        }}
                        className="w-11 h-11 rounded-full bg-amber-900 border-1.5 border-amber-900 items-center justify-center shadow-lg shadow-amber-900">
                        <Feather name="chevron-right" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}