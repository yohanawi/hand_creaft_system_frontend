import { getAssetUrl, getCategories } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

type ApiCategory = {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parent?: { _id?: string } | string | null;
    status?: 'active' | 'inactive';
    productCount?: number;
};

type ShowcaseCategory = {
    id: string;
    name: string;
    slug?: string;
    description: string;
    imageUri: string | null;
    itemCount: number;
    accentColor: string;
    icon: FeatherIconName;
};

const CATEGORY_ACCENTS = ['#8B4513', '#A45A2A', '#6E3B24', '#B06A3F', '#7B4A2E', '#9A5B36'];

const resolveCategoryIcon = (category: Pick<ApiCategory, 'name' | 'slug'>): FeatherIconName => {
    const value = `${category.name} ${category.slug || ''}`.toLowerCase();

    if (/(ring|jewel|necklace|bracelet|earring|gem|bead)/.test(value)) return 'disc';
    if (/(home|decor|living)/.test(value)) return 'home';
    if (/(gift|occasion|wedding)/.test(value)) return 'gift';
    if (/(fashion|style|wear)/.test(value)) return 'shopping-bag';
    if (/(book|guide|journal)/.test(value)) return 'book';
    if (/(beauty|care|spa)/.test(value)) return 'heart';
    return 'grid';
};

const buildCategoryCards = (apiCategories: ApiCategory[]): ShowcaseCategory[] => (
    apiCategories
        .filter((category) => !category.parent)
        .filter((category) => category.status !== 'inactive')
        .map((category, index) => ({
            id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description?.trim() || 'Discover handcrafted jewelry and artisan collections in this category.',
            imageUri: getAssetUrl(category.image),
            itemCount: Number(category.productCount || 0),
            accentColor: CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length],
            icon: resolveCategoryIcon(category),
        }))
);

const formatItemCount = (value: number) => new Intl.NumberFormat().format(value);

// ─── CategoryCard ─────────────────────────────────────────────────────────────
const CategoryCard = ({
    category,
    index,
    onPress,
}: {
    category: ShowcaseCategory;
    index: number;
    onPress: (category: ShowcaseCategory) => void;
}) => {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 450,
                delay: Math.min(index * 90, 420),
                useNativeDriver: true,
            }),
            Animated.spring(translateAnim, {
                toValue: 0,
                tension: 62,
                friction: 9,
                delay: Math.min(index * 90, 420),
                useNativeDriver: true,
            }),
        ]).start();
    }, [index, opacityAnim, translateAnim]);

    return (
        <Animated.View
            style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                opacity: opacityAnim,
                transform: [{ translateY: translateAnim }],
            }}
        >
            <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => onPress(category)}
                style={{
                    flex: 1,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: '#2A160C',
                }}
            >
                {category.imageUri ? (
                    <Image
                        source={{ uri: category.imageUri }}
                        resizeMode="cover"
                        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                    />
                ) : (
                    <LinearGradient
                        colors={[category.accentColor, '#3D2417']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                    />
                )}

                <LinearGradient
                    colors={['rgba(20,10,2,0.08)', 'rgba(20,10,2,0.24)', 'rgba(12,7,3,0.92)']}
                    locations={[0, 0.45, 1]}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                />

                <View
                    style={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                    }}
                >
                    <Feather name="package" size={12} color="#5C3317" />
                    <Text style={{ color: '#5C3317', fontSize: 11, fontWeight: '800' }}>
                        {formatItemCount(category.itemCount)} items
                    </Text>
                </View>

                <View
                    style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.16)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.18)',
                    }}
                >
                    <Feather name={category.icon} size={18} color="#FFF7EE" />
                </View>

                <View
                    style={{
                        position: 'absolute',
                        left: 18,
                        right: 18,
                        bottom: 18,
                        padding: 18,
                        borderRadius: 22,
                        backgroundColor: 'rgba(12,7,3,0.56)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                    }}
                >
                    <View
                        style={{
                            height: 2,
                            width: 54,
                            borderRadius: 999,
                            backgroundColor: category.accentColor,
                            marginBottom: 14,
                        }}
                    />

                    <Text style={{ color: '#FFF7EE', fontSize: 24, fontWeight: '900' }} numberOfLines={2}>
                        {category.name}
                    </Text>

                    <Text
                        style={{ color: 'rgba(255,247,238,0.78)', fontSize: 13, lineHeight: 20, marginTop: 8 }}
                        numberOfLines={2}
                    >
                        {category.description}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <Text style={{ color: '#FFF7EE', fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                            Explore Collection
                        </Text>
                        <View
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255,255,255,0.12)',
                            }}
                        >
                            <Feather name="arrow-up-right" size={16} color="#FFF7EE" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function CategorySection() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const maxScroll = useRef(0);
    const isUserDragging = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [categories, setCategories] = useState<ShowcaseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const totalDots = categories.length === 0 ? 0 : Math.max(1, categories.length - CARDS_PER_VIEW + 1);

    // Entry animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    useEffect(() => {
        let mounted = true;

        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCategories();
                const apiCategories = Array.isArray(response.data) ? response.data : [];

                if (!mounted) {
                    return;
                }

                setCategories(buildCategoryCards(apiCategories));
                setActiveIndex(0);
            } catch (fetchError: any) {
                if (!mounted) {
                    return;
                }

                setCategories([]);
                setError(fetchError?.response?.data?.message ?? fetchError?.message ?? 'Failed to load categories');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadCategories();

        return () => {
            mounted = false;
        };
    }, [reloadNonce]);

    // Auto-scroll
    const startAutoScroll = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (totalDots <= 1) return;

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
    }, [totalDots]);

    useEffect(() => {
        if (totalDots === 0) {
            setActiveIndex(0);
            return;
        }

        if (activeIndex > totalDots - 1) {
            setActiveIndex(totalDots - 1);
        }
    }, [activeIndex, totalDots]);

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
        if (totalDots === 0) return;

        const x = Math.min(i * (CARD_WIDTH + CARD_GAP), maxScroll.current);
        scrollRef.current?.scrollTo({ x, animated: true });
        scrollX.current = x;
        setActiveIndex(i);
    };

    const goLeft = () => goToIndex(Math.max(0, activeIndex - 1));
    const goRight = () => goToIndex(Math.min(totalDots - 1, activeIndex + 1));

    const handleCategoryPress = (category: ShowcaseCategory) => {
        router.push({
            pathname: '/shop',
            params: category.slug ? { category: category.slug } : { category: category.id },
        } as any);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                    <ActivityIndicator size="small" color="#8B4513" />
                    <Text style={{ color: '#714329', marginTop: 12, fontWeight: '600' }}>
                        Loading categories...
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
                    <Text style={{ color: '#714329', textAlign: 'center', lineHeight: 22 }}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setReloadNonce((value) => value + 1);
                        }}
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

        if (categories.length === 0) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
                    <Text style={{ color: '#714329', textAlign: 'center', lineHeight: 22 }}>
                        Categories will appear here once they are published from the admin system.
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
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_GAP}
                    snapToAlignment="start"
                    scrollEnabled={totalDots > 1}
                    contentContainerStyle={{ paddingHorizontal: H_PADDING }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onScrollEndDrag={handleScrollEndDrag}
                    onMomentumScrollEnd={handleScrollEndDrag}
                    onContentSizeChange={(width) => {
                        maxScroll.current = Math.max(0, width - SCREEN_WIDTH);
                    }}
                >
                    {categories.map((cat, index) => (
                        <View key={cat.id} style={{ marginRight: index === categories.length - 1 ? 0 : CARD_GAP }}>
                            <CategoryCard category={cat} index={index} onPress={handleCategoryPress} />
                        </View>
                    ))}
                </ScrollView>

                {totalDots > 1 && (
                    <View className="flex-row items-center justify-center mt-7 px-5 gap-2.5">
                        <TouchableOpacity
                            onPress={goLeft}
                            className="items-center justify-center w-10 h-10 rounded-full shadow-lg bg-amber-900 active:opacity-80"
                        >
                            <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>

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

                        <TouchableOpacity
                            onPress={goRight}
                            className="items-center justify-center w-10 h-10 rounded-full shadow-lg bg-amber-900 active:opacity-80"
                        >
                            <Feather name="chevron-right" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </>
        );
    };

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#fbf7f3', // Tailwind amber-900 background for dark theme
        }}>

            <View className="px-5 py-28">
                {/* Header */}
                <View className="items-center pb-16 mx-auto" style={{ maxWidth: 760 }}>
                    <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                        <View className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                        <View className="flex-row items-center gap-1.5">
                            <Feather name="grid" size={14} color="#8B4513" />
                            <Text className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                                Categories
                            </Text>
                        </View>
                        <View className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    </View>

                    <Text className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight text-center">
                        Shop by <Text style={{ color: '#8B4513' }}>Category</Text>
                    </Text>

                    <Text className="max-w-[580px] mx-auto text-[#5A4A3F] leading-[1.75] text-center">
                        Explore our wide range of categories and find exactly what you're looking for
                    </Text>
                </View>

                {renderContent()}

                {/* ── Browse All CTA ── */}
                <View className="items-center px-5 mt-9">
                    <TouchableOpacity
                        className="flex-row items-center px-8 py-4 rounded-full bg-amber-900 active:opacity-80 active:scale-95"
                        onPress={() => router.push('/categories')}
                    >
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