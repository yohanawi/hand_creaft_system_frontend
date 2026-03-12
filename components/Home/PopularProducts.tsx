import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { products } from '../../Data/product-data';

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
const AUTO_SCROLL_SPEED = 1; // px per frame

export default function PopularProducts() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;

    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUserScrolling = useRef(false);
    const animFrameRef = useRef<number | null>(null);
    const maxScroll = useRef(0);
    const contentWidth = useRef(0);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeIndex, setActiveIndex] = useState(0);

    const categories = ['All', 'Electronics', 'Fashion', 'Wearables', 'Accessories'];

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

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

    const handleScrollBeginDrag = () => {
        isUserScrolling.current = true;
        stopAutoScroll();
    };

    const handleScrollEndDrag = () => {
        isUserScrolling.current = false;
        startAutoScroll();
    };

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollX.current = e.nativeEvent.contentOffset.x;
        const idx = Math.round(scrollX.current / (CARD_WIDTH + CARD_GAP));
        setActiveIndex(idx);
    };

    const handleContentSizeChange = (w: number) => {
        contentWidth.current = w;
        maxScroll.current = w - SCREEN_WIDTH;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Feather
                key={i}
                name="star"
                size={12}
                color={i < Math.floor(rating) ? '#F59E0B' : '#E5E7EB'}
                style={{ marginRight: 1 }}
            />
        ));
    };

    const ProductCard = ({ product }: { product: typeof products[0] }) => {
        const cardScale = useRef(new Animated.Value(1)).current;
        const shadowAnim = useRef(new Animated.Value(0)).current;
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

        const handlePressIn = () => {
            Animated.parallel([
                Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true }),
                Animated.timing(shadowAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
            ]).start();
        };

        const handlePressOut = () => {
            Animated.parallel([
                Animated.spring(cardScale, { toValue: 1, tension: 50, friction: 4, useNativeDriver: true }),
                Animated.timing(shadowAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
            ]).start();
        };

        return (
            <Animated.View
                style={{
                    width: CARD_WIDTH,
                    marginRight: CARD_GAP,
                    transform: [{ scale: cardScale }],
                    opacity: fadeAnim,
                    borderRadius: 20,
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    shadowColor: '#8B4513',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16,
                    elevation: 6,
                }}
            >
                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    {/* Image Area */}
                    <View
                        style={{
                            height: 170,
                            backgroundColor: product.color,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        {/* Decorative circle */}
                        <View style={{
                            width: 90,
                            height: 90,
                            borderRadius: 45,
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Feather name={product.icon as any} size={48} color="#FFF" />
                        </View>

                        {/* Badge top-left */}
                        <View style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: product.badgeColor,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                        }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                                {product.badge}
                            </Text>
                        </View>

                        {/* Discount badge */}
                        {discount > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#EF4444',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>-{discount}%</Text>
                            </View>
                        )}

                        {/* Wishlist */}
                        <TouchableOpacity style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            backgroundColor: '#fff',
                            borderRadius: 20,
                            padding: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Feather name="heart" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={{ padding: 14 }}>
                        <Text style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                            {product.category}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6 }} numberOfLines={2}>
                            {product.name}
                        </Text>

                        {/* Stars */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', marginRight: 4 }}>{renderStars(product.rating)}</View>
                            <Text style={{ fontSize: 10, color: '#6B7280' }}>({product.reviews})</Text>
                        </View>

                        {/* Price row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: '800', color: '#8B4513' }}>${product.price}</Text>
                                {product.originalPrice > product.price && (
                                    <Text style={{ fontSize: 12, color: '#D1D5DB', textDecorationLine: 'line-through' }}>
                                        ${product.originalPrice}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Add to Cart */}
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#8B4513',
                            paddingVertical: 12,
                            borderRadius: 50,
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 4,
                        }}>
                            <Feather name="shopping-cart" size={14} color="#FFF" />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const totalDots = Math.max(0, filteredProducts.length - CARDS_PER_VIEW + 1);

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ width: 40, height: 2, backgroundColor: '#8B4513', marginRight: 10, borderRadius: 2 }} />
                        <Feather name="trending-up" size={22} color="#8B4513" />
                        <View style={{ width: 40, height: 2, backgroundColor: '#8B4513', marginLeft: 10, borderRadius: 2 }} />
                    </View>
                    <Text style={{
                        fontSize: SCREEN_WIDTH < 768 ? 28 : 36,
                        fontWeight: '800',
                        color: '#8B4513',
                        textAlign: 'center',
                        letterSpacing: -0.5,
                        marginBottom: 6,
                    }}>
                        Popular Products
                    </Text>
                    <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
                        Discover our best-selling items loved by thousands
                    </Text>
                </View>

                {/* ── Category Filter ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
                    style={{ marginBottom: 28 }}
                >
                    {categories.map((cat, i) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setSelectedCategory(cat)}
                                style={{
                                    marginRight: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 50,
                                    backgroundColor: isActive ? '#8B4513' : '#fff',
                                    borderWidth: 1.5,
                                    borderColor: '#8B4513',
                                    shadowColor: '#8B4513',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: isActive ? 0.25 : 0.08,
                                    shadowRadius: 4,
                                    elevation: isActive ? 4 : 1,
                                }}
                            >
                                <Text style={{
                                    fontWeight: '700',
                                    fontSize: 13,
                                    color: isActive ? '#fff' : '#8B4513',
                                    letterSpacing: 0.3,
                                }}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ── Product Carousel ── */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_GAP}
                    snapToAlignment="start"
                    contentContainerStyle={{ paddingHorizontal: CARD_GAP }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onScrollEndDrag={handleScrollEndDrag}
                    onMomentumScrollEnd={handleScrollEndDrag}
                    onContentSizeChange={handleContentSizeChange}
                >
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </ScrollView>

                {/* ── Dots Indicator ── */}
                {totalDots > 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 6 }}>
                        {Array.from({ length: totalDots }, (_, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    const x = i * (CARD_WIDTH + CARD_GAP);
                                    scrollRef.current?.scrollTo({ x, animated: true });
                                    scrollX.current = x;
                                    setActiveIndex(i);
                                }}
                            >
                                <View style={{
                                    width: activeIndex === i ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: activeIndex === i ? '#8B4513' : '#D1B89A',
                                    marginHorizontal: 2,
                                    // smooth width transition via inline style (RN doesn't animate width easily without Animated.Value)
                                }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ── Arrow Navigation ── */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                    <TouchableOpacity
                        onPress={() => {
                            const x = Math.max(0, scrollX.current - (CARD_WIDTH + CARD_GAP));
                            scrollRef.current?.scrollTo({ x, animated: true });
                            scrollX.current = x;
                            setActiveIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: '#fff',
                            borderWidth: 1.5,
                            borderColor: '#8B4513',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <Feather name="chevron-left" size={20} color="#8B4513" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            const x = Math.min(maxScroll.current, scrollX.current + (CARD_WIDTH + CARD_GAP));
                            scrollRef.current?.scrollTo({ x, animated: true });
                            scrollX.current = x;
                            setActiveIndex(Math.round(x / (CARD_WIDTH + CARD_GAP)));
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: '#8B4513',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#8B4513',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 4,
                        }}
                    >
                        <Feather name="chevron-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* ── View All Button ── */}
                <View style={{ alignItems: 'center', marginTop: 32, paddingHorizontal: 24 }}>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 32,
                        paddingVertical: 14,
                        borderRadius: 50,
                        backgroundColor: '#fff',
                        borderWidth: 2,
                        borderColor: '#8B4513',
                        shadowColor: '#8B4513',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                        <Text style={{ color: '#8B4513', fontWeight: '700', fontSize: 15, marginRight: 8 }}>
                            View All Products
                        </Text>
                        <Feather name="arrow-right" size={18} color="#8B4513" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}