import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
    primary: '#7C4A1E',       // deep walnut brown
    primaryLight: '#A0622A',
    primaryDark: '#4E2D0E',
    accent: '#D4956A',        // warm terracotta
    accentLight: '#F0C9A8',
    cream: '#FAF6F0',
    parchment: '#F2EBE0',
    ink: '#2C1A0E',
    muted: '#9B7B6A',
    border: '#E0D0C0',
    white: '#FFFFFF',
    star: '#E8A020',
    badge: {
        bestSeller: '#C0392B',
        hotDeal: '#E67E22',
        new: '#27AE60',
        sale: '#8E44AD',
        trending: '#2980B9',
        proChoice: '#16A085',
    },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
    id: string;
    name: string;
    category: string;
    categorySlug: string;
    price: number;
    salePrice?: number;
    currency: string;
    quantity: number;
    availabilityStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
    material?: string;
    sku?: string;
    imageUrl?: string;
    description?: string;
    isFeatured?: boolean;
};

type ViewMode = 'grid' | 'list';

// ─── API Types ───────────────────────────────────────────────────────────────
type ApiCategory = {
    _id: string;
    name: string;
    slug: string;
    parent?: any;
};

type ApiProduct = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    currency?: string;
    category?: { name: string; slug: string } | string;
    quantity?: number;
    description?: string;
    images?: string[];
    thumbnailImage?: string;
    availabilityStatus?: 'in_stock' | 'out_of_stock' | 'pre_order';
    material?: string;
    sku?: string;
    isFeatured?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const discount = (orig: number, curr: number) =>
    Math.round(((orig - curr) / orig) * 100);

const badgeColor = (badge: string): string => {
    const map: Record<string, string> = {
        'Best Seller': COLORS.badge.bestSeller,
        'Hot Deal': COLORS.badge.hotDeal,
        'New': COLORS.badge.new,
        'Sale': COLORS.badge.sale,
        'Trending': COLORS.badge.trending,
        'Pro Choice': COLORS.badge.proChoice,
        'Featured': COLORS.badge.trending,
    };
    return map[badge] ?? COLORS.primary;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated product card */
const ProductCard = ({
    product,
    viewMode,
    index,
    isMobile,
}: {
    product: Product;
    viewMode: ViewMode;
    index: number;
    isMobile: boolean;
}) => {
    const router = useRouter();
    const { addToCart } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { showToast } = useToast();
    const [addingToCart, setAddingToCart] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const wished = isInWishlist(product.id);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, index, slideAnim]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const isListMode = viewMode === 'list';
    const currentPrice = typeof product.salePrice === 'number' ? product.salePrice : product.price;
    const originalPrice = product.price;
    const disc = discount(originalPrice, currentPrice);
    const inStock = product.availabilityStatus === 'in_stock' && product.quantity > 0;

    const badgeText = product.isFeatured
        ? 'Featured'
        : typeof product.salePrice === 'number' && product.salePrice < product.price
            ? 'Sale'
            : 'New';

    const handleAddToCart = async () => {
        if (!inStock || addingToCart) return;
        setAddingToCart(true);
        const imgUrl = product.imageUrl ?? '';
        await addToCart({
            product: product.id,
            name: product.name,
            thumbnailImage: imgUrl,
            price: product.price,
            salePrice: typeof product.salePrice === 'number' ? product.salePrice : null,
            sku: product.sku ?? '',
            quantity: 1,
        });
        setAddingToCart(false);
        showToast(`${product.name} added to cart!`, 'success');
    };

    const handleToggleWishlist = () => {
        const wasWished = isInWishlist(product.id);
        toggleItem(product.id, {
            _id: product.id,
            name: product.name,
            thumbnailImage: product.imageUrl,
            price: product.price,
            salePrice: typeof product.salePrice === 'number' ? product.salePrice : null,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: product.quantity,
        });
        showToast(wasWished ? 'Removed from wishlist' : 'Added to wishlist!', 'wishlist', { subMessage: product.name });
    };

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                width: isListMode ? '100%' : isMobile ? '100%' : '48%',
                marginBottom: 16,
            }}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push({ pathname: '/product-single', params: { id: product.id } } as any)}
                style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 18,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    shadowColor: COLORS.primaryDark,
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                    flexDirection: isListMode ? 'row' : 'column',
                }}
            >
                {/* Image area */}
                <View
                    style={{
                        backgroundColor: COLORS.parchment,
                        height: isListMode ? undefined : 160,
                        width: isListMode ? 140 : undefined,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: 16,
                    }}
                >
                    {product.imageUrl ? (
                        <Image
                            source={{ uri: product.imageUrl }}
                            style={{ width: '100%', height: '100%', borderRadius: 14 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={{ fontSize: isListMode ? 52 : 72 }}>📦</Text>
                    )}

                    {/* Badge */}
                    <View
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            backgroundColor: badgeColor(badgeText),
                            borderRadius: 20,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                        }}
                    >
                        <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '700' }}>
                            {badgeText}
                        </Text>
                    </View>

                    {/* Discount circle */}
                    {disc > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                width: 38,
                                height: 38,
                                borderRadius: 19,
                                backgroundColor: COLORS.accent,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: COLORS.white, fontSize: 9, fontWeight: '800' }}>
                                -{disc}%
                            </Text>
                        </View>
                    )}

                    {/* Out of stock overlay */}
                    {!inStock && (
                        <View
                            style={{
                                ...StyleSheet_absoluteFill,
                                backgroundColor: 'rgba(44,26,14,0.55)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>
                                Out of Stock
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={{ flex: 1, padding: 14 }}>
                    <Text style={{ fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        {product.category}
                        {product.material ? ` · ${product.material}` : ''}
                    </Text>
                    <Text
                        style={{ fontSize: 15, fontWeight: '700', color: COLORS.ink, marginBottom: 4, lineHeight: 20 }}
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>
                    {!!product.description && (
                        <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }} numberOfLines={1}>
                            {product.description}
                        </Text>
                    )}

                    {/* Price row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.primary, marginRight: 8 }}>
                            {product.currency} {currentPrice}
                        </Text>
                        {typeof product.salePrice === 'number' && product.salePrice < product.price && (
                            <Text style={{ fontSize: 13, color: COLORS.muted, textDecorationLine: 'line-through' }}>
                                {product.currency} {originalPrice}
                            </Text>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                            disabled={!inStock || addingToCart}
                            onPress={handleAddToCart}
                            style={{
                                flex: 1,
                                backgroundColor: inStock ? COLORS.primary : COLORS.border,
                                borderRadius: 30,
                                paddingVertical: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                        >
                            <Text style={{ fontSize: 14 }}>{addingToCart ? '⏳' : '🛒'}</Text>
                            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>
                                {inStock ? (addingToCart ? 'Adding…' : 'Add to Cart') : 'Out of Stock'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleToggleWishlist}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                backgroundColor: wished ? '#FFEAEA' : COLORS.parchment,
                                borderWidth: 1,
                                borderColor: wished ? '#FFB3B3' : COLORS.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 18 }}>{wished ? '❤️' : '🤍'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// absoluteFill helper without StyleSheet import
const StyleSheet_absoluteFill = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

/** Filter sidebar content */
const FilterPanel = ({
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    materials,
    selectedMaterials,
    toggleMaterial,
    searchQuery,
    setSearchQuery,
    onClear,
}: any) => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 16 }}>
        {/* Search */}
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 14,
                marginBottom: 20,
            }}
        >
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products…"
                placeholderTextColor={COLORS.muted}
                style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.ink }}
            />
        </View>

        {/* Categories */}
        <Text style={sectionTitle}>Categories</Text>
        {categories.map((cat: { label: string; slug: string }) => (
            <TouchableOpacity
                key={cat.slug}
                onPress={() => setSelectedCategorySlug(cat.slug)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    marginBottom: 6,
                    backgroundColor: selectedCategorySlug === cat.slug ? COLORS.primary : COLORS.white,
                    borderWidth: 1,
                    borderColor: selectedCategorySlug === cat.slug ? COLORS.primary : COLORS.border,
                }}
            >
                <Text style={{ fontWeight: '600', color: selectedCategorySlug === cat.slug ? COLORS.white : COLORS.ink, fontSize: 14 }}>
                    {cat.label}
                </Text>
                {selectedCategorySlug === cat.slug && <Text style={{ color: COLORS.white }}>✓</Text>}
            </TouchableOpacity>
        ))}

        {/* Materials */}
        <Text style={{ ...sectionTitle, marginTop: 16 }}>Materials</Text>
        {materials.length === 0 ? (
            <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 4 }}>
                No materials available
            </Text>
        ) : null}
        {materials.map((m: string) => (
            <TouchableOpacity
                key={m}
                onPress={() => toggleMaterial(m)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
            >
                <View
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: selectedMaterials.includes(m) ? COLORS.primary : COLORS.border,
                        backgroundColor: selectedMaterials.includes(m) ? COLORS.primary : COLORS.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                    }}
                >
                    {selectedMaterials.includes(m) && (
                        <Text style={{ color: COLORS.white, fontSize: 11 }}>✓</Text>
                    )}
                </View>
                <Text style={{ fontSize: 14, color: COLORS.ink }}>{m}</Text>
            </TouchableOpacity>
        ))}

        {/* Clear */}
        <TouchableOpacity
            onPress={onClear}
            style={{
                marginTop: 20,
                marginBottom: 32,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: COLORS.primary,
                alignItems: 'center',
            }}
        >
            <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 14 }}>Clear All Filters</Text>
        </TouchableOpacity>
    </ScrollView>
);

const sectionTitle = {
    fontSize: 13,
    fontWeight: '700' as const,
    color: COLORS.ink,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ShopScreen() {
    const { search: searchParam } = useLocalSearchParams<{ search?: string }>();

    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState(searchParam ?? '');
    const [sortBy, setSortBy] = useState('featured');
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Sync new search param on navigation
    useEffect(() => {
        if (searchParam) setSearchQuery(searchParam);
    }, [searchParam]);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

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

    const toggleMaterial = (m: string) =>
        setSelectedMaterials(ms => ms.includes(m) ? ms.filter(x => x !== m) : [...ms, m]);

    const clearFilters = () => {
        setSelectedCategorySlug('all');
        setSelectedMaterials([]);
        setSearchQuery('');
    };

    const topLevelCategories = categories.filter(c => !c.parent);
    const categoryOptions = [
        { label: 'All', slug: 'all' },
        ...topLevelCategories
            .map(c => ({ label: c.name, slug: c.slug }))
            .filter(c => !!c.slug),
    ];

    const products: Product[] = apiProducts.map((p) => {
        const categoryObj = (p.category && typeof p.category === 'object') ? (p.category as any) : null;
        const imageUrl = p.thumbnailImage || (Array.isArray(p.images) ? p.images[0] : undefined);

        return {
            id: p._id,
            name: p.name,
            category: categoryObj?.name ?? 'Uncategorized',
            categorySlug: categoryObj?.slug ?? '',
            price: p.price,
            salePrice: p.salePrice,
            currency: p.currency || 'USD',
            quantity: typeof p.quantity === 'number' ? p.quantity : 0,
            availabilityStatus: p.availabilityStatus || 'in_stock',
            material: p.material,
            sku: p.sku,
            imageUrl,
            description: p.description,
            isFeatured: p.isFeatured,
        };
    });

    const materialOptions = Array.from(
        new Set(products.map(p => p.material).filter((m): m is string => !!m && m.trim().length > 0))
    ).sort((a, b) => a.localeCompare(b));

    const filteredProducts = products.filter(p => {
        if (selectedCategorySlug !== 'all' && p.categorySlug !== selectedCategorySlug) return false;
        if (selectedMaterials.length && (!p.material || !selectedMaterials.includes(p.material))) return false;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const hay = `${p.name} ${p.description ?? ''} ${p.sku ?? ''}`.toLowerCase();
            if (!hay.includes(q)) return false;
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

    const filterPanel = (
        <FilterPanel
            categories={categoryOptions}
            selectedCategorySlug={selectedCategorySlug}
            setSelectedCategorySlug={(slug: string) => { setSelectedCategorySlug(slug); if (isMobile) setShowFilterModal(false); }}
            materials={materialOptions}
            selectedMaterials={selectedMaterials}
            toggleMaterial={toggleMaterial}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClear={clearFilters}
        />
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
            <StatusBar barStyle="dark-content" />

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <PageShell>
                    {/* ── Body ── */}
                    <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>

                        {/* Sidebar (desktop / tablet) */}
                        {!isMobile && (
                            <View
                                style={{
                                    width: isTablet ? 240 : 280,
                                    backgroundColor: COLORS.white,
                                    borderRightWidth: 1,
                                    borderRightColor: COLORS.border,
                                }}
                            >
                                {/* Sidebar header */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: COLORS.border,
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>🎛</Text>
                                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '800', color: COLORS.primary }}>
                                        Filters
                                    </Text>
                                    {(selectedMaterials.length || selectedCategorySlug !== 'all') ? (
                                        <View
                                            style={{
                                                marginLeft: 8,
                                                backgroundColor: COLORS.accent,
                                                borderRadius: 10,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                            }}
                                        >
                                            <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '700' }}>
                                                {selectedMaterials.length + (selectedCategorySlug !== 'all' ? 1 : 0)}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                                {filterPanel}
                            </View>
                        )}

                        {/* Product section */}
                        <View style={{ flex: 1 }}>
                            {/* Top bar */}
                            <View
                                style={{
                                    backgroundColor: COLORS.white,
                                    borderBottomWidth: 1,
                                    borderBottomColor: COLORS.border,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}
                            >
                                <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>
                                    <Text style={{ fontWeight: '700', color: COLORS.primary }}>{sortedProducts.length}</Text> products found
                                </Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {/* Mobile filter button */}
                                    {isMobile && (
                                        <TouchableOpacity
                                            onPress={() => setShowFilterModal(true)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: COLORS.primary,
                                                borderRadius: 20,
                                                paddingHorizontal: 14,
                                                paddingVertical: 8, 
                                                gap: 6,
                                            }}
                                        >
                                            <Text style={{ fontSize: 14 }}>🎛</Text>
                                            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>Filter</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Sort picker */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: COLORS.parchment,
                                            borderRadius: 20,
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            gap: 4,
                                            borderWidth: 1,
                                            borderColor: COLORS.border,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, color: COLORS.muted }}>Sort:</Text>
                                        {(['featured', 'price-asc', 'price-desc'] as const).map((s) => (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => setSortBy(s)}
                                                style={{
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 12,
                                                    backgroundColor: sortBy === s ? COLORS.primary : 'transparent',
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, color: sortBy === s ? COLORS.white : COLORS.ink, fontWeight: '600' }}>
                                                    {s === 'featured' ? '✨ Featured' : s === 'price-asc' ? '$ Low' : '$ High'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Grid/List toggle (tablet+) */}
                                    {!isMobile && (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor: COLORS.parchment,
                                                borderRadius: 20,
                                                padding: 4,
                                                borderWidth: 1,
                                                borderColor: COLORS.border,
                                            }}
                                        >
                                            {(['grid', 'list'] as const).map(mode => (
                                                <TouchableOpacity
                                                    key={mode}
                                                    onPress={() => setViewMode(mode)}
                                                    style={{
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderRadius: 16,
                                                        backgroundColor: viewMode === mode ? COLORS.primary : 'transparent',
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 13, color: viewMode === mode ? COLORS.white : COLORS.muted }}>
                                                        {mode === 'grid' ? '⊞' : '☰'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Category chips (mobile) */}
                            {isMobile && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
                                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
                                >
                                    {categoryOptions.map(cat => (
                                        <TouchableOpacity
                                            key={cat.slug}
                                            onPress={() => setSelectedCategorySlug(cat.slug)}
                                            style={{
                                                paddingHorizontal: 14,
                                                paddingVertical: 7,
                                                borderRadius: 20,
                                                backgroundColor: selectedCategorySlug === cat.slug ? COLORS.primary : COLORS.parchment,
                                                borderWidth: 1,
                                                borderColor: selectedCategorySlug === cat.slug ? COLORS.primary : COLORS.border,
                                            }}
                                        >
                                            <Text style={{ fontSize: 13, fontWeight: '600', color: selectedCategorySlug === cat.slug ? COLORS.white : COLORS.ink }}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {/* Product list */}
                            <View style={{ padding: 16, paddingBottom: 40 }}>
                                {loading ? (
                                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                                        <Text style={{ fontSize: 34 }}>⏳</Text>
                                        <Text style={{ marginTop: 10, color: COLORS.muted }}>Loading products…</Text>
                                    </View>
                                ) : error ? (
                                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                                        <Text style={{ fontSize: 34 }}>⚠️</Text>
                                        <Text style={{ marginTop: 10, color: COLORS.muted, textAlign: 'center' }}>{error}</Text>
                                        <TouchableOpacity
                                            onPress={clearFilters}
                                            style={{
                                                marginTop: 16,
                                                backgroundColor: COLORS.primary,
                                                borderRadius: 20,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                            }}
                                        >
                                            <Text style={{ color: COLORS.white, fontWeight: '700' }}>Clear Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : sortedProducts.length === 0 ? (
                                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                                        <Text style={{ fontSize: 48 }}>🧺</Text>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 12 }}>
                                            No products found
                                        </Text>
                                        <Text style={{ color: COLORS.muted, marginTop: 4 }}>Try adjusting your filters</Text>
                                        <TouchableOpacity
                                            onPress={clearFilters}
                                            style={{
                                                marginTop: 16,
                                                backgroundColor: COLORS.primary,
                                                borderRadius: 20,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                            }}
                                        >
                                            <Text style={{ color: COLORS.white, fontWeight: '700' }}>Clear Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={
                                            viewMode === 'grid' && !isMobile
                                                ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
                                                : { flexDirection: 'column' }
                                        }
                                    >
                                        {sortedProducts.map((item, index) => (
                                            <ProductCard
                                                key={item.id}
                                                product={item}
                                                viewMode={isMobile ? 'grid' : viewMode}
                                                index={index}
                                                isMobile={isMobile}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                </PageShell>
            </ScrollView>

            {/* ── Filter Modal (mobile) ── */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: COLORS.border,
                            paddingTop: 52,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.primary }}>🎛 Filters</Text>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(false)}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: COLORS.parchment,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 18, color: COLORS.primary }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {filterPanel}
                </View>
            </Modal>
        </View>
    );
}