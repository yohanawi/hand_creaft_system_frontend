import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import PageShell from '@/components/PageShell';
import CategoryChips from '@/components/Shop/CategoryChips';
import FilterPanel from '@/components/Shop/FilterPanel';
import ProductCard from '@/components/Shop/ProductCard';
import ShopTopBar from '@/components/Shop/ShopTopBar';
import { COLORS } from '@/constants/shopTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import api from '@/services/api';
import type { ApiCategory, ApiProduct, CategoryOption, Product, ViewMode } from '@/types/shop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShopScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
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

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    // Sync search param when navigating to this screen with a query
    useEffect(() => {
        if (searchParam) setSearchQuery(searchParam);
    }, [searchParam]);

    // Fetch categories and products
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
        return () => { mounted = false; };
    }, []);

    const toggleMaterial = (m: string) =>
        setSelectedMaterials((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

    const clearFilters = () => {
        setSelectedCategorySlug('all');
        setSelectedMaterials([]);
        setSearchQuery('');
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    const topLevelCategories = categories.filter((c) => !c.parent);
    const categoryOptions: CategoryOption[] = [
        { label: 'All', slug: 'all' },
        ...topLevelCategories.map((c) => ({ label: c.name, slug: c.slug })).filter((c) => !!c.slug),
    ];

    const products: Product[] = apiProducts.map((p) => {
        const categoryObj = p.category && typeof p.category === 'object' ? (p.category as any) : null;
        const imageUrl = p.thumbnailImage ?? (Array.isArray(p.images) ? p.images[0] : undefined);
        return {
            id: p._id,
            name: p.name,
            category: categoryObj?.name ?? 'Uncategorized',
            categorySlug: categoryObj?.slug ?? '',
            price: p.price,
            salePrice: p.salePrice,
            currency: p.currency ?? 'USD',
            quantity: typeof p.quantity === 'number' ? p.quantity : 0,
            availabilityStatus: p.availabilityStatus ?? 'in_stock',
            material: p.material,
            sku: p.sku,
            imageUrl,
            description: p.description,
            isFeatured: p.isFeatured,
        };
    });

    const materialOptions = Array.from(
        new Set(products.map((p) => p.material).filter((m): m is string => !!m && m.trim().length > 0)),
    ).sort((a, b) => a.localeCompare(b));

    const filteredProducts = products.filter((p) => {
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

    const activeFilterCount = selectedMaterials.length + (selectedCategorySlug !== 'all' ? 1 : 0);

    // Shared filter panel node (reused in sidebar and modal)
    const filterPanelNode = (
        <FilterPanel
            categories={categoryOptions}
            selectedCategorySlug={selectedCategorySlug}
            setSelectedCategorySlug={(slug) => {
                setSelectedCategorySlug(slug);
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
            <StatusBar barStyle="dark-content" />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <View style={[styles.body, { flexDirection: isMobile ? 'column' : 'row' }]}>

                        {/* ── Desktop / Tablet sidebar ── */}
                        {!isMobile && (
                            <View style={[styles.sidebar, { width: isTablet ? 240 : 280 }]}>
                                <View style={styles.sidebarHeader}>
                                    <Text style={styles.sidebarIcon}>🎛</Text>
                                    <Text style={styles.sidebarTitle}>Filters</Text>
                                    {activeFilterCount > 0 && (
                                        <View style={styles.filterBadge}>
                                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                                        </View>
                                    )}
                                </View>
                                {filterPanelNode}
                            </View>
                        )}

                        {/* ── Product section ── */}
                        <View style={styles.productSection}>
                            <ShopTopBar
                                productCount={sortedProducts.length}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                isMobile={isMobile}
                                onOpenFilter={() => setShowFilterModal(true)}
                            />

                            {/* Category chips — mobile only */}
                            {isMobile && (
                                <CategoryChips
                                    categories={categoryOptions}
                                    selectedCategorySlug={selectedCategorySlug}
                                    onSelect={setSelectedCategorySlug}
                                />
                            )}

                            {/* Product grid / list */}
                            <View style={styles.productListContainer}>
                                {loading ? (
                                    <View style={styles.stateContainer}>
                                        <Text style={styles.stateEmoji}>⏳</Text>
                                        <Text style={styles.stateText}>Loading products…</Text>
                                    </View>
                                ) : error ? (
                                    <View style={styles.stateContainer}>
                                        <Text style={styles.stateEmoji}>⚠️</Text>
                                        <Text style={[styles.stateText, styles.stateTextCenter]}>{error}</Text>
                                        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                                            <Text style={styles.clearButtonText}>Clear Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : sortedProducts.length === 0 ? (
                                    <View style={styles.stateContainer}>
                                        <Text style={styles.emptyEmoji}>🧺</Text>
                                        <Text style={styles.emptyTitle}>No products found</Text>
                                        <Text style={styles.stateText}>Try adjusting your filters</Text>
                                        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                                            <Text style={styles.clearButtonText}>Clear Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={
                                            viewMode === 'grid' && !isMobile
                                                ? styles.gridLayout
                                                : styles.listLayout
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
            </Animated.ScrollView>

            {/* ── Filter modal (mobile) ── */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalRoot}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>🎛 Filters</Text>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {filterPanelNode}
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
    body: {
        flex: 1,
    },
    // Sidebar
    sidebar: {
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sidebarIcon: {
        fontSize: 18,
    },
    sidebarTitle: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
    filterBadge: {
        marginLeft: 8,
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    filterBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    // Product section
    productSection: {
        flex: 1,
    },
    productListContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    // State views
    stateContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    stateEmoji: {
        fontSize: 34,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    stateText: {
        marginTop: 10,
        color: COLORS.muted,
    },
    stateTextCenter: {
        textAlign: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 12,
    },
    clearButton: {
        marginTop: 16,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    // Grid / list layouts
    gridLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    listLayout: {
        flexDirection: 'column',
    },
    // Filter modal
    modalRoot: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 52,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.parchment,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseIcon: {
        fontSize: 18,
        color: COLORS.primary,
    },
});