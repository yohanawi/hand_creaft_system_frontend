import PageShell from '@/components/PageShell';
import CategoryChips from '@/components/Shop/CategoryChips';
import FilterPanel from '@/components/Shop/FilterPanel';
import HeroSection from '@/components/Shop/HeroSection_shop';
import ProductCard from '@/components/Shop/ProductCard';
import ShopTopBar from '@/components/Shop/ShopTopBar';
import { COLORS } from '@/constants/shopTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import api from '@/services/api';
import type { ApiCategory, ApiProduct, CategoryOption, Product, ViewMode } from '@/types/shop';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function SkeletonCard({ isMobile }: { isMobile: boolean }) {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmer]);

    const translateX = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [-240, 240],
    });

    return (
        <View className={`rounded-3xl overflow-hidden mb-4 border border-[#E8DDD2] ${isMobile ? 'w-full' : 'w-[31.5%]'}`}>
            {/* Image Placeholder */}
            <View className="h-[170px] bg-[#F8F2EA] overflow-hidden relative">
                <Animated.View style={{ transform: [{ translateX }], }} className="absolute inset-0 w-[110px] bg-white/60" />
            </View>

            {/* Title Line */}
            <View className="h-[14px] bg-[#F8F2EA] mt-3 mx-3 rounded-lg overflow-hidden relative">
                <Animated.View style={{ transform: [{ translateX }], }} className="absolute inset-0 w-[110px] bg-white/60" />
            </View>

            {/* Subtitle Line */}
            <View className="h-[12px] w-[55%] bg-[#F8F2EA] mt-2 mx-3 mb-4 rounded-lg overflow-hidden relative">
                <Animated.View style={{ transform: [{ translateX }], }} className="absolute inset-0 w-[110px] bg-white/60" />
            </View>
        </View>
    );
}

export default function ShopScreen() {

    const { scrollY, onScroll } = useHeaderScroll();
    const {
        search: searchParam,
        category: categoryParam,
        subcategory: subcategoryParam,
    } = useLocalSearchParams<{
        search?: string;
        category?: string | string[];
        subcategory?: string | string[];
    }>();

    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
    const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState('all');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState(searchParam ?? '');
    const [sortBy, setSortBy] = useState('featured');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const heroOpacity = useRef(new Animated.Value(0)).current;
    const heroSlide = useRef(new Animated.Value(30)).current;
    const heroBadgeScale = useRef(new Animated.Value(0.5)).current;

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroOpacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(heroSlide, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.spring(heroBadgeScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [heroBadgeScale, heroOpacity, heroSlide]);

    useEffect(() => {
        if (searchParam) setSearchQuery(searchParam);
    }, [searchParam]);

    useEffect(() => {
        const rawCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
        const rawSubcategory = Array.isArray(subcategoryParam) ? subcategoryParam[0] : subcategoryParam;

        if (!rawCategory) {
            setSelectedCategorySlug('all');
        } else {
            const matchedCategory = categories.find(
                (category) => category.slug === rawCategory || category._id === rawCategory,
            );
            setSelectedCategorySlug(matchedCategory?.slug ?? rawCategory);
        }

        setSelectedSubcategorySlug(rawSubcategory ?? 'all');
    }, [categoryParam, categories, subcategoryParam]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [catsRes, prodsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/products'),
                ]);

                if (!mounted) return;

                setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
                setApiProducts(Array.isArray(prodsRes.data) ? prodsRes.data : []);
            } catch (e: any) {
                if (!mounted) return;

                setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load products');
                setCategories([]);
                setApiProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const toggleMaterial = (material: string) =>
        setSelectedMaterials((materials) =>
            materials.includes(material)
                ? materials.filter((entry) => entry !== material)
                : [...materials, material],
        );

    const clearFilters = () => {
        setSelectedCategorySlug('all');
        setSelectedSubcategorySlug('all');
        setSelectedMaterials([]);
        setSearchQuery('');
    };

    const topLevelCategories = categories.filter((category) => !category.parent);
    const categoryOptions: CategoryOption[] = [
        { label: 'All', slug: 'all' },
        ...topLevelCategories
            .map((category) => ({ label: category.name, slug: category.slug }))
            .filter((category) => !!category.slug),
    ];

    const products: Product[] = apiProducts.map((product) => {
        const categoryObj = product.category && typeof product.category === 'object' ? (product.category as any) : null;
        const imageUrl = product.thumbnailImage ?? (Array.isArray(product.images) ? product.images[0] : undefined);

        return {
            id: product._id,
            name: product.name,
            category: categoryObj?.name ?? 'Uncategorized',
            categorySlug: categoryObj?.slug ?? '',
            subcategory: typeof product.subcategory === 'object' ? product.subcategory?.name ?? '' : '',
            subcategorySlug: typeof product.subcategory === 'object' ? product.subcategory?.slug ?? '' : '',
            price: product.price,
            salePrice: product.salePrice,
            currency: product.currency ?? 'USD',
            quantity: typeof product.quantity === 'number' ? product.quantity : 0,
            availabilityStatus: product.availabilityStatus ?? 'in_stock',
            material: product.material,
            sku: product.sku,
            imageUrl,
            description: product.description,
            isFeatured: product.isFeatured,
        };
    });

    const materialOptions = Array.from(
        new Set(
            products.map((product) => product.material).filter((material): material is string => !!material && material.trim().length > 0),
        ),
    ).sort((a, b) => a.localeCompare(b));

    const filteredProducts = products.filter((product) => {
        if (selectedCategorySlug !== 'all' && product.categorySlug !== selectedCategorySlug) return false;
        if (selectedSubcategorySlug !== 'all' && product.subcategorySlug !== selectedSubcategorySlug)
            return false;
        if (selectedMaterials.length && (!product.material || !selectedMaterials.includes(product.material)))
            return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const haystack = `${product.name} ${product.description ?? ''} ${product.sku ?? ''}`.toLowerCase();
            if (!haystack.includes(query)) return false;
        }

        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const aCurr = typeof a.salePrice === 'number' ? a.salePrice : a.price;
        const bCurr = typeof b.salePrice === 'number' ? b.salePrice : b.price;

        if (sortBy === 'price-asc') return aCurr - bCurr;
        if (sortBy === 'price-desc') return bCurr - aCurr;
        return 0;
    });

    const activeFilterCount = selectedMaterials.length + (selectedCategorySlug !== 'all' ? 1 : 0) + (selectedSubcategorySlug !== 'all' ? 1 : 0);
    const heroStats = [
        { icon: '◉', value: loading ? '...' : `${products.length}+`, label: 'Products' },
        { icon: '◎', value: `${Math.max(categoryOptions.length - 1, 0)}`, label: 'Categories' },
        { icon: '◇', value: `${materialOptions.length}`, label: 'Materials' },
    ];

    const filterPanelNode = (
        <FilterPanel
            categories={categoryOptions}
            selectedCategorySlug={selectedCategorySlug}
            setSelectedCategorySlug={(slug) => {
                setSelectedCategorySlug(slug);
                setSelectedSubcategorySlug('all');
                if (isMobile) setShowFilterModal(false);
            }}
            materials={materialOptions}
            selectedMaterials={selectedMaterials}
            toggleMaterial={toggleMaterial}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClear={clearFilters}
        />
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <Animated.ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>

                    <HeroSection
                        heroStats={heroStats}
                        loading={loading}
                        products={products}
                        heroOpacity={heroOpacity}
                        heroSlide={heroSlide}
                        heroBadgeScale={heroBadgeScale}
                    />

                    <View style={[styles.body, { flexDirection: isMobile ? 'column' : 'row' }]}>
                        {!isMobile && (
                            <View style={[styles.sidebar, { width: isTablet ? 248 : 288 }]}>
                                <LinearGradient
                                    colors={['#7C4A1E', '#A0622A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.sidebarHeader}
                                >
                                    <View style={styles.sidebarHeaderLeft}>
                                        <View style={styles.sidebarIconWrap}>
                                            <Text className="font-body" style={styles.sidebarIcon}>
                                                ⊟
                                            </Text>
                                        </View>
                                        <Text className="font-body" style={styles.sidebarTitle}>
                                            Filters
                                        </Text>
                                    </View>
                                    {activeFilterCount > 0 ? (
                                        <View style={styles.filterBadge}>
                                            <Text className="font-body" style={styles.filterBadgeText}>
                                                {activeFilterCount}
                                            </Text>
                                        </View>
                                    ) : null}
                                </LinearGradient>
                                {filterPanelNode}
                            </View>
                        )}

                        <View style={styles.productSection}>
                            <View style={styles.topBarWrapper}>
                                <ShopTopBar
                                    productCount={sortedProducts.length}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    isMobile={isMobile}
                                    onOpenFilter={() => setShowFilterModal(true)}
                                    activeFilterCount={activeFilterCount}
                                />

                                {activeFilterCount > 0 && (
                                    <View style={styles.activePills}>
                                        {selectedCategorySlug !== 'all' && (
                                            <TouchableOpacity
                                                style={styles.pill}
                                                onPress={() => setSelectedCategorySlug('all')}
                                            >
                                                <Text className="font-body" style={styles.pillText}>
                                                    {categoryOptions.find(
                                                        (option) => option.slug === selectedCategorySlug,
                                                    )?.label ?? selectedCategorySlug}
                                                </Text>
                                                <Text className="font-body" style={styles.pillX}>
                                                    {' '}✕
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {selectedMaterials.map((material) => (
                                            <TouchableOpacity
                                                key={material}
                                                style={styles.pill}
                                                onPress={() => toggleMaterial(material)}
                                            >
                                                <Text className="font-body" style={styles.pillText}>
                                                    {material}
                                                </Text>
                                                <Text className="font-body" style={styles.pillX}>
                                                    {' '}✕
                                                </Text>
                                            </TouchableOpacity>
                                        ))}

                                        <TouchableOpacity style={styles.pillClear} onPress={clearFilters}>
                                            <Text className="font-body" style={styles.pillClearText}>
                                                Clear all
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {isMobile && (
                                <CategoryChips
                                    categories={categoryOptions}
                                    selectedCategorySlug={selectedCategorySlug}
                                    onSelect={setSelectedCategorySlug}
                                />
                            )}

                            <View style={styles.productListContainer}>
                                {loading ? (
                                    <View
                                        style={
                                            viewMode === 'grid' && !isMobile
                                                ? styles.gridLayout
                                                : styles.listLayout
                                        }
                                    >
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <SkeletonCard key={index} isMobile={isMobile} />
                                        ))}
                                    </View>
                                ) : error ? (
                                    <View style={styles.stateContainer}>
                                        <LinearGradient colors={['#FFF0EC', '#FFE4DC']} style={styles.stateCard}>
                                            <Text style={styles.stateEmoji}>⚠️</Text>
                                            <Text className="font-heading" style={styles.stateTitle}>
                                                Something went wrong
                                            </Text>
                                            <Text className="font-body" style={[styles.stateText, styles.stateTextCenter]}>
                                                {error}
                                            </Text>
                                            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                                                <LinearGradient
                                                    colors={['#7C4A1E', '#A0622A']}
                                                    style={styles.clearButtonGrad}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                >
                                                    <Text className="font-body" style={styles.clearButtonText}>
                                                        Clear Filters
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                ) : sortedProducts.length === 0 ? (
                                    <View style={styles.stateContainer}>
                                        <LinearGradient
                                            colors={[COLORS.parchment, COLORS.cream]}
                                            style={styles.stateCard}
                                        >
                                            <Text style={styles.emptyEmoji}>🧺</Text>
                                            <Text className="font-heading" style={styles.emptyTitle}>
                                                No products found
                                            </Text>
                                            <Text className="font-body" style={styles.stateText}>
                                                Try adjusting your filters
                                            </Text>
                                            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                                                <LinearGradient
                                                    colors={['#7C4A1E', '#A0622A']}
                                                    style={styles.clearButtonGrad}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                >
                                                    <Text className="font-body" style={styles.clearButtonText}>
                                                        Clear Filters
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                ) : (
                                    <View style={viewMode === 'grid' && !isMobile
                                        ? styles.gridLayout
                                        : styles.listLayout
                                    }>
                                        {sortedProducts.map((item, index) => (
                                            <ProductCard key={item.id} product={item} viewMode={isMobile ? 'grid' : viewMode} index={index} isMobile={isMobile} />
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <LinearGradient
                        colors={['#4E2D0E', '#7C4A1E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.footerBand}
                    >
                        <Text className="font-body" style={styles.footerBandText}>
                            Handcrafted with passion · Every piece tells a story
                        </Text>
                    </LinearGradient>
                </PageShell>
            </Animated.ScrollView>

            <Modal
                visible={showFilterModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalRoot}>
                    <LinearGradient
                        colors={['#4E2D0E', '#7C4A1E', '#A0622A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalHeader}
                    >
                        <View style={styles.modalHeaderRow}>
                            <View>
                                <Text className="font-heading" style={styles.modalTitle}>
                                    ⊟  Filters
                                </Text>
                                {activeFilterCount > 0 && (
                                    <Text className="font-body" style={styles.modalSub}>
                                        {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowFilterModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text className="font-body" style={styles.modalCloseIcon}>
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalDivider} />
                    </LinearGradient>

                    {filterPanelNode}

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(false)}
                            style={styles.applyBtn}
                        >
                            <LinearGradient
                                colors={['#7C4A1E', '#A0622A']}
                                style={styles.applyBtnGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text className="font-body" style={styles.applyBtnText}>
                                    Show {sortedProducts.length} product
                                    {sortedProducts.length !== 1 ? 's' : ''}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },
    scrollView: {
        flex: 1,
    },

    heroBanner: {
        overflow: 'hidden',
        paddingTop: Platform.OS === 'ios' ? 56 : 36,
        position: 'relative',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    heroNoise: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.06,
        backgroundColor: '#FFFFFF',
    },
    orb1: {
        position: 'absolute',
        top: -40,
        right: -28,
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: 'rgba(255,204,160,0.16)',
    },
    orb2: {
        position: 'absolute',
        bottom: 26,
        left: -44,
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.09)',
    },
    orb3: {
        position: 'absolute',
        top: 56,
        left: '46%',
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: 'rgba(240,201,168,0.1)',
    },
    heroContent: {
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 22,
        maxWidth: 980,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
        marginBottom: 12,
    },
    heroBadgeText: {
        color: '#F0C9A8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 35,
        fontWeight: '900',
        lineHeight: 41,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14.5,
        marginTop: 8,
        fontWeight: '400',
    },
    heroSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
        gap: 8,
    },
    heroSearchDesktop: {
        maxWidth: 460,
    },
    heroSearchIcon: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
    },
    heroSearchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        ...Platform.select({ web: { outlineStyle: 'none' } as any }),
    },
    heroSearchClear: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    heroStats: {
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    heroStat: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 13,
        gap: 2,
    },
    heroStatBorder: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.15)',
    },
    heroStatIcon: {
        fontSize: 16,
    },
    heroStatVal: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    heroStatLbl: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    body: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },

    sidebar: {
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: { elevation: 3 },
        }),
    },
    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    sidebarHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sidebarIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebarIcon: {
        fontSize: 16,
        color: COLORS.white,
    },
    sidebarTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    filterBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '800',
    },

    topBarWrapper: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        overflow: 'hidden',
    },
    activePills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 14,
        paddingTop: 6,
        paddingBottom: 10,
        gap: 7,
        alignItems: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.parchment,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    pillText: {
        color: COLORS.primary,
        fontSize: 12.5,
        fontWeight: '700',
    },
    pillX: {
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: '700',
    },
    pillClear: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    pillClearText: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    productSection: {
        flex: 1,
    },
    productListContainer: {
        padding: 16,
        paddingBottom: 40,
    },

    stateContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    stateCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#7C4A1E',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
            },
            android: { elevation: 4 },
        }),
    },
    stateEmoji: {
        fontSize: 40,
    },
    stateTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 12,
    },
    stateText: {
        marginTop: 8,
        color: COLORS.muted,
        fontSize: 13,
        textAlign: 'center',
    },
    stateTextCenter: {
        textAlign: 'center',
    },
    emptyEmoji: {
        fontSize: 52,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 12,
    },
    clearButton: {
        marginTop: 20,
        borderRadius: 24,
        overflow: 'hidden',
    },
    clearButtonGrad: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },

    gridLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    listLayout: {
        flexDirection: 'column',
    },

    footerBand: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerBandText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.8,
    },

    modalRoot: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    modalHeader: {
        paddingTop: Platform.OS === 'ios' ? 52 : 28,
        paddingHorizontal: 20,
        paddingBottom: 0,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.3,
    },
    modalSub: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        marginTop: 3,
        fontWeight: '500',
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    modalCloseIcon: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: '700',
    },
    modalDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    modalFooter: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    applyBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    applyBtnGrad: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 16,
    },
    applyBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});
