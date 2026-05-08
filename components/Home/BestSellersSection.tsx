import { getAssetUrl, getProducts } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
const H_PAD = isMobile ? 16 : 32;
const CARD_GAP = 14;
const CARDS_PER_VIEW = SCREEN_WIDTH >= 1280 ? 4 : SCREEN_WIDTH >= 1024 ? 3 : SCREEN_WIDTH >= 600 ? 2 : 1;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
const STEP = CARD_WIDTH + CARD_GAP;
const AUTO_SCROLL_MS = 3200;

type ApiProduct = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    currency?: string;
    thumbnailImage?: string;
    images?: string[];
    category?: { name?: string; slug?: string } | string | null;
    averageRating?: number;
    reviewCount?: number;
    soldCount?: number;
    isFeatured?: boolean;
};

const RANK_ACCENTS = ['#8B4513', '#A45A2A', '#6E3B24', '#B06A3F', '#7B4A2E', '#9A5B36'];

const getProductImage = (product: ApiProduct) => getAssetUrl(product.thumbnailImage || product.images?.[0]);

const getCategoryName = (product: ApiProduct) => {
    if (product.category && typeof product.category === 'object') {
        return product.category.name || 'Jewelry';
    }

    return product.category || 'Jewelry';
};

const getDisplayPrice = (product: ApiProduct) => (
    typeof product.salePrice === 'number' && product.salePrice < product.price
        ? product.salePrice
        : product.price
);

const formatPrice = (product: ApiProduct) => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.currency || 'USD',
            maximumFractionDigits: 2,
        }).format(getDisplayPrice(product));
    } catch {
        return `$${getDisplayPrice(product).toFixed(2)}`;
    }
};

const formatCompactCount = (value: number) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    }

    return new Intl.NumberFormat().format(value);
};

const getDiscountPercent = (product: ApiProduct) => {
    if (typeof product.salePrice !== 'number' || product.salePrice >= product.price) {
        return 0;
    }

    return Math.round(((product.price - product.salePrice) / product.price) * 100);
};

const getBadge = (product: ApiProduct, index: number) => {
    if (index === 0) return { label: '#1 Best Seller', color: '#8B4513' };
    if (index === 1) return { label: 'Customer Pick', color: '#A45A2A' };
    if (index === 2) return { label: 'Top Rated', color: '#6E3B24' };
    if ((product.soldCount || 0) >= 10) return { label: 'Popular', color: '#B06A3F' };
    if (product.isFeatured) return { label: 'Featured', color: '#7B4A2E' };
    return { label: 'Best Seller', color: '#9A5B36' };
};

function StarRow({ rating }: { rating: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                    key={star}
                    name="star"
                    size={11}
                    color={star <= Math.floor(rating) ? '#F59E0B' : '#E5E7EB'}
                />
            ))}
        </View>
    );
}

function JewelryCard({
    item,
    index,
    onOpenProduct,
}: {
    item: ApiProduct;
    index: number;
    onOpenProduct: (productId: string) => void;
}) {
    const [liked, setLiked] = useState(false);
    const imageUri = getProductImage(item);
    const badge = getBadge(item, index);
    const rating = Number(item.averageRating || 0);
    const reviewCount = Number(item.reviewCount || 0);
    const soldCount = Number(item.soldCount || 0);
    const discountPercent = getDiscountPercent(item);

    return (
        <View
            style={{
                width: CARD_WIDTH,
                backgroundColor: '#FFFFFF',
                borderRadius: 28,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#F0E7DE',
                elevation: 5,
            }}
        >
            <View style={{ position: 'relative', padding: 8, paddingBottom: 0, backgroundColor: '#FAFAFA' }}>
                <View
                    style={{
                        height: CARD_WIDTH,
                        borderRadius: 22,
                        overflow: 'hidden',
                        backgroundColor: '#F4F1ED',
                    }}
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            resizeMode="cover"
                            style={{ width: '50%', height: '50%' }}
                        />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Feather name="image" size={28} color="#8C7A6B" />
                        </View>
                    )}

                    <View
                        style={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        <Text style={{ color: '#8C7A6B', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                            {getCategoryName(item)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setLiked((value) => !value)}
                        style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: liked ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.92)',
                            borderWidth: 1,
                            borderColor: liked ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.6)',
                        }}
                    >
                        <Feather name="heart" size={16} color={liked ? '#D4AF37' : '#5A4A3F'} />
                    </TouchableOpacity>

                    <View
                        style={{
                            position: 'absolute',
                            bottom: 14,
                            left: 14,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 999,
                            backgroundColor: badge.color,
                            shadowColor: badge.color,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.18,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                            {badge.label}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ padding: 22 }}>
                <View style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <StarRow rating={rating} />
                        <Text style={{ color: '#A69B91', fontSize: 10 }}>
                            ({reviewCount.toLocaleString()})
                        </Text>
                    </View>

                    <Text
                        numberOfLines={2}
                        style={{
                            color: '#1A1A1A',
                            fontSize: 17,
                            fontWeight: '600',
                            lineHeight: 24,
                        }}
                    >
                        {item.name}
                    </Text>

                    <Text style={{ color: '#8C7A6B', fontSize: 11, marginTop: 7 }}>
                        {soldCount > 0 ? `${formatCompactCount(soldCount)} sold` : 'Freshly featured'}
                    </Text>
                </View>

                <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F5F2ED' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            {discountPercent > 0 ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <Text style={{ color: '#A69B91', fontSize: 11, textDecorationLine: 'line-through' }}>
                                        {item.currency === 'USD' || !item.currency ? `$${item.price.toFixed(2)}` : `${item.currency} ${item.price.toFixed(2)}`}
                                    </Text>
                                    <Text style={{ color: '#D4AF37', fontSize: 9, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }}>
                                        Save {discountPercent}%
                                    </Text>
                                </View>
                            ) : null}
                            <Text style={{ color: '#1A1A1A', fontSize: 19, fontWeight: '600' }}>
                                {formatPrice(item)}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => onOpenProduct(item._id)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: 999,
                                    backgroundColor: '#F8F5F1',
                                    borderWidth: 1,
                                    borderColor: '#E8DFD0',
                                }}
                            >
                                <Text style={{ color: '#1A1A1A', fontSize: 12, fontWeight: '700' }}>
                                    View
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => onOpenProduct(item._id)}
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 21,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: RANK_ACCENTS[index % RANK_ACCENTS.length],
                                }}
                            >
                                <Feather name="shopping-bag" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function BestSellersSection() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(36)).current;
    const ctaAnim = useRef(new Animated.Value(0)).current;

    const scrollRef = useRef<ScrollView>(null);
    const scrollXRef = useRef(0);
    const isDragging = useRef(false);
    const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [activeIdx, setActiveIdx] = useState(0);

    const maxIndex = Math.max(0, products.length - CARDS_PER_VIEW);
    const totalDots = products.length === 0 ? 0 : Math.max(1, products.length - CARDS_PER_VIEW + 1);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
        Animated.timing(ctaAnim, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }).start();
    }, [ctaAnim, fadeAnim, slideAnim]);

    useEffect(() => {
        let mounted = true;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProducts({ sort: 'popular', page: 1, limit: 6 });
                const rawProducts = Array.isArray(response.data?.products)
                    ? response.data.products
                    : Array.isArray(response.data)
                        ? response.data
                        : [];

                if (!mounted) {
                    return;
                }

                const visibleProducts = rawProducts.filter((product: ApiProduct) => Number(product.price || 0) > 0);
                setProducts(visibleProducts);
                setActiveIdx(0);
            } catch (fetchError: any) {
                if (!mounted) {
                    return;
                }

                setProducts([]);
                setError(fetchError?.response?.data?.message ?? fetchError?.message ?? 'Failed to load best sellers');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            mounted = false;
        };
    }, [reloadNonce]);

    const stopAuto = () => {
        if (autoRef.current) {
            clearInterval(autoRef.current);
            autoRef.current = null;
        }
    };

    const startAuto = () => {
        stopAuto();
        if (maxIndex <= 0) {
            return;
        }

        autoRef.current = setInterval(() => {
            if (isDragging.current) {
                return;
            }

            setActiveIdx((previous) => {
                const next = previous >= maxIndex ? 0 : previous + 1;
                scrollRef.current?.scrollTo({ x: next * STEP, animated: true });
                return next;
            });
        }, AUTO_SCROLL_MS);
    };

    useEffect(() => {
        startAuto();
        return () => stopAuto();
    }, [maxIndex]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollXRef.current = event.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(scrollXRef.current / STEP);
        setActiveIdx(Math.max(0, Math.min(nextIndex, maxIndex)));
    };

    const goTo = (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, maxIndex));
        scrollRef.current?.scrollTo({ x: clampedIndex * STEP, animated: true });
        setActiveIdx(clampedIndex);
        startAuto();
    };

    const handleOpenProduct = (productId: string) => {
        router.push({ pathname: '/product-single', params: { id: productId } } as any);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="small" color="#8B4513" />
                    <Text style={{ color: '#714329', marginTop: 12, fontWeight: '600' }}>
                        Loading best sellers...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 20 }}>
                    <Text style={{ color: '#714329', textAlign: 'center', lineHeight: 22 }}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setReloadNonce((value) => value + 1)}
                        style={{
                            marginTop: 16,
                            borderRadius: 999,
                            backgroundColor: '#8B4513',
                            paddingHorizontal: 18,
                            paddingVertical: 10,
                        }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '800' }}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (products.length === 0) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 20 }}>
                    <Text style={{ color: '#714329', textAlign: 'center', lineHeight: 22 }}>
                        Best-selling products will appear here once customers start placing orders.
                    </Text>
                </View>
            );
        }

        return (
            <>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    onScrollBeginDrag={() => {
                        isDragging.current = true;
                        stopAuto();
                    }}
                    onScrollEndDrag={() => {
                        isDragging.current = false;
                        startAuto();
                    }}
                    onMomentumScrollEnd={() => {
                        isDragging.current = false;
                        startAuto();
                    }}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={STEP}
                    snapToAlignment="start"
                    scrollEnabled={maxIndex > 0}
                    contentContainerStyle={{ paddingHorizontal: H_PAD }}
                >
                    {products.map((item, idx) => (
                        <View key={item._id} style={{ marginRight: idx < products.length - 1 ? CARD_GAP : 0 }}>
                            <JewelryCard item={item} index={idx} onOpenProduct={handleOpenProduct} />
                        </View>
                    ))}
                </ScrollView>

                {totalDots > 1 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }}>
                        {Array.from({ length: totalDots }, (_, index) => {
                            const isActive = activeIdx === index;
                            return (
                                <TouchableOpacity key={index} onPress={() => goTo(index)}>
                                    <View
                                        style={{
                                            width: isActive ? 28 : 7,
                                            height: 7,
                                            borderRadius: 999,
                                            backgroundColor: isActive ? '#8B4513' : '#D8CCC0',
                                        }}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : null}
            </>
        );
    };

    return (
        <View style={{ backgroundColor: '#FBF7F3', paddingTop: 64, paddingBottom: 56, overflow: 'hidden' }}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={{ alignItems: 'center', paddingBottom: 52, paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        <View style={{ width: 32, height: 1, backgroundColor: 'rgba(113,67,41,0.35)' }} />
                        <Text style={{ color: '#714329', textTransform: 'uppercase', letterSpacing: 3.5, fontSize: 12, fontWeight: '800' }}>
                            Our Most Loved Pieces
                        </Text>
                        <View style={{ width: 32, height: 1, backgroundColor: 'rgba(113,67,41,0.35)' }} />
                    </View>

                    <Text className='font-serif' style={{ color: '#1C1C1C', fontSize: SCREEN_WIDTH < 768 ? 34 : 46, fontWeight: '600', lineHeight: SCREEN_WIDTH < 768 ? 42 : 54, textAlign: 'center' }}>
                        Customer <Text style={{ color: '#8B4513' }}>Favorites</Text>
                    </Text>

                    <Text style={{ maxWidth: 580, marginTop: 14, color: '#5A4A3F', lineHeight: 28, textAlign: 'center' }}>
                        Live best sellers from the database, ranked by real completed order volume and backed by product reviews.
                    </Text>
                </View>

                {renderContent()}

                <Animated.View style={{ opacity: ctaAnim, alignItems: 'center', marginTop: 28, paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <TouchableOpacity
                            onPress={() => goTo(activeIdx - 1)}
                            disabled={activeIdx === 0 || maxIndex === 0}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                backgroundColor: '#8B4513',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: activeIdx === 0 || maxIndex === 0 ? 0.4 : 1,
                            }}
                        >
                            <Feather name="chevron-left" size={18} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/best-sellers')}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                backgroundColor: '#8B4513',
                                paddingHorizontal: 28,
                                paddingVertical: 14,
                                borderRadius: 999,
                            }}
                        >
                            <Feather name="award" size={16} color="#FFFFFF" />
                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                                View All Best Sellers
                            </Text>
                            <Feather name="arrow-right" size={15} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => goTo(activeIdx + 1)}
                            disabled={activeIdx >= maxIndex || maxIndex === 0}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                backgroundColor: '#8B4513',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: activeIdx >= maxIndex || maxIndex === 0 ? 0.4 : 1,
                            }}
                        >
                            <Feather name="chevron-right" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </View>
    );
}