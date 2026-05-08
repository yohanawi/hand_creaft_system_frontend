import PageShell from '@/components/PageShell';
import WishlistEmptyState from '@/components/Wishlist/WishlistEmptyState';
import WishlistHeader from '@/components/Wishlist/WishlistHeader';
import WishlistItemCard from '@/components/Wishlist/WishlistItemCard';
import WishlistQuickViewModal from '@/components/Wishlist/WishlistQuickViewModal';
import WishlistRecommendationCard from '@/components/Wishlist/WishlistRecommendationCard';
import WishlistSectionHeader from '@/components/Wishlist/WishlistSectionHeader';
import WishlistSharePanel from '@/components/Wishlist/WishlistSharePanel';
import { WISHLIST_CARD_SHADOW, WISHLIST_COLORS, WISHLIST_PANEL_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from '@/components/Wishlist/wishlistTheme';
import WishlistTrustSignals from '@/components/Wishlist/WishlistTrustSignals';
import {
    buildRecommendedProducts,
    buildSaleHighlights,
    buildWishlistShareMessage,
    getWishlistCategoryName,
    getWishlistImageUri,
    getWishlistMaterial,
    getWishlistStockLabel,
    hasWishlistDiscount,
    isWishlistItemInStock,
    normalizeWishlistCatalog,
    WishlistDetailProduct,
} from '@/components/Wishlist/wishlistUtils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { getProductById, getProducts } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Linking,
    Platform,
    Share,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

type AlertPreferenceKey = 'priceDrop' | 'backInStock';
type AlertPreferences = Record<string, { priceDrop: boolean; backInStock: boolean }>;

const getRecommendationReason = (product: WishlistDetailProduct, items: WishlistDetailProduct[]) => {
    const category = getWishlistCategoryName(product).toLowerCase();
    const material = getWishlistMaterial(product).toLowerCase();

    if (items.some((item) => getWishlistCategoryName(item).toLowerCase() === category)) {
        return `Pairs with your ${getWishlistCategoryName(product) || 'saved style'}`;
    }

    if (items.some((item) => getWishlistMaterial(item).toLowerCase() === material)) {
        return `Similar ${getWishlistMaterial(product).toLowerCase()} finish`;
    }

    return 'Recommended for your wishlist';
};

export default function WishlistScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { items, removeItem, clearItems } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [addingId, setAddingId] = useState<string | null>(null);
    const [catalog, setCatalog] = useState<WishlistDetailProduct[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [quickViewVisible, setQuickViewVisible] = useState(false);
    const [quickViewLoading, setQuickViewLoading] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<WishlistDetailProduct | null>(null);
    const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>({});

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(26))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 650,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 52,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            setCatalogLoading(true);
            try {
                const response = await getProducts({ limit: 24, sort: 'popular' });
                if (!mounted) {
                    return;
                }

                setCatalog(normalizeWishlistCatalog(response.data));
            } catch {
                if (mounted) {
                    setCatalog([]);
                }
            } finally {
                if (mounted) {
                    setCatalogLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const wishlistItems = useMemo<WishlistDetailProduct[]>(
        () => items.map((item) => ({ ...item })),
        [items],
    );

    const isCompact = width < 768;
    const isWideDesktop = width >= 1400;
    const contentWidth = Math.min(width - (isCompact ? 24 : 48), 1240);
    const cardGap = 20;
    const gridColumns = width >= 1440 ? 4 : width >= 1120 ? 3 : width >= 760 ? 2 : 1;
    const cardWidth = gridColumns === 1
        ? '100%'
        : Math.max(240, Math.floor((contentWidth - cardGap * (gridColumns - 1)) / gridColumns));

    const inStockCount = wishlistItems.filter((item) => isWishlistItemInStock(item)).length;
    const discountedCount = wishlistItems.filter((item) => hasWishlistDiscount(item)).length;
    const totalSavings = wishlistItems.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const salePrice = Number(item.salePrice ?? price);
        return salePrice < price ? sum + (price - salePrice) : sum;
    }, 0);
    const activeAlertCount = Object.values(alertPreferences).reduce(
        (sum, value) => sum + (value.priceDrop ? 1 : 0) + (value.backInStock ? 1 : 0),
        0,
    );

    const recommendedProducts = useMemo(
        () => buildRecommendedProducts(catalog, wishlistItems, 4),
        [catalog, wishlistItems],
    );
    const saleHighlights = useMemo(
        () => buildSaleHighlights(wishlistItems, recommendedProducts, 3),
        [recommendedProducts, wishlistItems],
    );

    const wishlistLink = useMemo(() => ExpoLinking.createURL('/wishlist'), []);
    const shareMessage = useMemo(
        () => `${buildWishlistShareMessage(wishlistItems)} ${wishlistLink}`.trim(),
        [wishlistItems, wishlistLink],
    );

    const navigateToShop = useCallback(() => {
        router.push('/shop' as any);
    }, [router]);

    const openProduct = useCallback((id: string) => {
        router.push({ pathname: '/product-single', params: { id } } as any);
    }, [router]);

    const handleAddToCart = useCallback(async (product: WishlistDetailProduct) => {
        const inStock = isWishlistItemInStock(product);
        if (!inStock) {
            setAlertPreferences((previous) => ({
                ...previous,
                [product._id]: {
                    priceDrop: previous[product._id]?.priceDrop ?? false,
                    backInStock: true,
                },
            }));
            showToast('Back in stock alert enabled', 'success', { subMessage: product.name });
            return;
        }

        setAddingId(product._id);
        try {
            await addToCart({
                product: product._id,
                name: product.name,
                thumbnailImage: getWishlistImageUri(product) || '',
                price: product.price,
                salePrice: product.salePrice ?? null,
                sku: product.sku || '',
                quantity: 1,
            });
            showToast(`${product.name} added to cart`, 'success');
        } finally {
            setAddingId(null);
        }
    }, [addToCart, showToast]);

    const handleAddAllToCart = useCallback(async () => {
        const inStockItems = wishlistItems.filter((item) => isWishlistItemInStock(item));
        if (inStockItems.length === 0) {
            showToast('No wishlist items are currently in stock', 'warning');
            return;
        }

        for (const product of inStockItems) {
            await addToCart({
                product: product._id,
                name: product.name,
                thumbnailImage: getWishlistImageUri(product) || '',
                price: product.price,
                salePrice: product.salePrice ?? null,
                sku: product.sku || '',
                quantity: 1,
            });
        }

        showToast(`${inStockItems.length} item(s) moved to cart`, 'success');
    }, [addToCart, showToast, wishlistItems]);

    const handleRemoveAll = useCallback(async () => {
        if (wishlistItems.length === 0) {
            return;
        }

        await clearItems();
        showToast('Wishlist cleared', 'success');
    }, [clearItems, showToast, wishlistItems.length]);

    const toggleAlert = useCallback((product: WishlistDetailProduct, key: AlertPreferenceKey) => {
        let enabled = false;
        setAlertPreferences((previous) => {
            const next = {
                priceDrop: previous[product._id]?.priceDrop ?? false,
                backInStock: previous[product._id]?.backInStock ?? false,
            };
            next[key] = !next[key];
            enabled = next[key];
            return {
                ...previous,
                [product._id]: next,
            };
        });

        showToast(
            enabled ? `${key === 'priceDrop' ? 'Price drop' : 'Back in stock'} alert enabled` : 'Alert removed',
            'success',
            { subMessage: product.name },
        );
    }, [showToast]);

    const openQuickView = useCallback(async (product: WishlistDetailProduct) => {
        setQuickViewVisible(true);
        setQuickViewProduct(product);
        setQuickViewLoading(true);

        try {
            const response = await getProductById(product._id);
            const detail = normalizeWishlistCatalog([response.data])[0];
            setQuickViewProduct(detail ? { ...product, ...detail } : product);
        } catch {
            setQuickViewProduct(product);
        } finally {
            setQuickViewLoading(false);
        }
    }, []);

    const closeQuickView = useCallback(() => {
        setQuickViewVisible(false);
    }, []);

    const handleShareWhatsApp = useCallback(async () => {
        try {
            await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`);
        } catch {
            showToast('Unable to open WhatsApp share', 'warning');
        }
    }, [shareMessage, showToast]);

    const handleCopyLink = useCallback(async () => {
        try {
            await Clipboard.setStringAsync(wishlistLink);
            showToast('Wishlist link copied', 'success');
        } catch {
            showToast('Unable to copy wishlist link', 'warning');
        }
    }, [showToast, wishlistLink]);

    const handleOpenShareSheet = useCallback(async () => {
        try {
            if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator) {
                await (navigator as any).share({
                    title: 'My Wishlist',
                    text: buildWishlistShareMessage(wishlistItems),
                    url: wishlistLink,
                });
                return;
            }

            await Share.share({
                title: 'My Wishlist',
                message: shareMessage,
                url: wishlistLink,
            });
        } catch {
            showToast('Share action cancelled', 'warning');
        }
    }, [shareMessage, showToast, wishlistItems, wishlistLink]);

    return (
        <View style={{ flex: 1, backgroundColor: WISHLIST_COLORS.background }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 72 }}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <WishlistHeader itemCount={wishlistItems.length} isCompact={isCompact} />

                        <View className="px-4 pb-10 md:px-6" style={{ marginTop: -32 }}>
                            <View className="mx-auto w-full" style={{ maxWidth: 1240 }}>
                                <View className="mb-8 overflow-hidden rounded-[32px] border border-[#EADBCB] bg-white p-5 md:p-6" style={WISHLIST_CARD_SHADOW}>
                                    <View style={{ gap: 16, flexDirection: isCompact ? 'column' : 'row', justifyContent: 'space-between' }}>
                                        <View style={{ gap: 12, flex: isCompact ? undefined : 1.5, flexDirection: isCompact ? 'column' : 'row', flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Saved pieces', value: String(wishlistItems.length), icon: 'heart' },
                                                { label: 'Available now', value: String(inStockCount), icon: 'package' },
                                                { label: 'On sale', value: String(discountedCount), icon: 'tag' },
                                                { label: 'Alerts on', value: String(activeAlertCount), icon: 'bell' },
                                            ].map((item) => (
                                                <View key={item.label} className="min-w-[140px] flex-1 rounded-[24px] border border-[#F0E3D7] bg-[#FFF8F1] px-4 py-4">
                                                    <View className="mb-2 flex-row items-center gap-2">
                                                        <Feather name={item.icon as any} size={14} color="#9A6D4D" />
                                                        <Text className="text-[11px] uppercase tracking-[1.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-[30px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                                                        {item.value}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={{ gap: 12, flex: isCompact ? undefined : 1, minWidth: isCompact ? undefined : 300 }}>
                                            <View className="rounded-[24px] border border-[#F0E3D7] bg-[#4A2E24] px-5 py-4">
                                                <Text className="text-[11px] uppercase tracking-[2px] text-[#F3E2C6]" style={{ fontFamily: WISHLIST_SANS }}>
                                                    Estimated savings
                                                </Text>
                                                <Text className="mt-2 text-[34px] text-white" style={{ fontFamily: WISHLIST_SERIF }}>
                                                    ${totalSavings.toFixed(2)}
                                                </Text>
                                                <Text className="mt-2 text-[14px] leading-6 text-[#F6EADF]" style={{ fontFamily: WISHLIST_SANS }}>
                                                    Move pieces to cart quickly or hold them with alert coverage while stock is limited.
                                                </Text>
                                            </View>

                                            <View className="flex-row flex-wrap gap-3">
                                                <TouchableOpacity
                                                    onPress={handleAddAllToCart}
                                                    activeOpacity={0.85}
                                                    className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#B88258] px-5 py-4"
                                                >
                                                    <Feather name="shopping-cart" size={16} color="#FFFFFF" />
                                                    <Text className="text-sm text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                                        Add all to cart
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handleRemoveAll}
                                                    activeOpacity={0.85}
                                                    className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-5 py-4"
                                                >
                                                    <Feather name="trash-2" size={16} color="#4A2E24" />
                                                    <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                                        Remove all
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {wishlistItems.length === 0 ? (
                                    <WishlistEmptyState onExplore={navigateToShop} />
                                ) : (
                                    <>
                                        <View className="mb-10">
                                            <WishlistSectionHeader
                                                eyebrow="Saved pieces"
                                                title="Your handcrafted collection"
                                                description="A responsive wishlist grid designed to keep key jewelry details visible, actionable, and easy to compare across devices."
                                                action={
                                                    <TouchableOpacity
                                                        onPress={navigateToShop}
                                                        activeOpacity={0.85}
                                                        className="flex-row items-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-5 py-3"
                                                    >
                                                        <Feather name="plus" size={15} color="#4A2E24" />
                                                        <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                                            Explore more
                                                        </Text>
                                                    </TouchableOpacity>
                                                }
                                            />

                                            <View className="flex-row flex-wrap gap-5">
                                                {wishlistItems.map((product) => {
                                                    const alerts = alertPreferences[product._id] || { priceDrop: false, backInStock: false };
                                                    return (
                                                        <WishlistItemCard
                                                            key={product._id}
                                                            product={product}
                                                            width={cardWidth}
                                                            isAdding={addingId === product._id}
                                                            priceDropEnabled={alerts.priceDrop}
                                                            backInStockEnabled={alerts.backInStock}
                                                            onAddToCart={() => handleAddToCart(product)}
                                                            onRemove={() => removeItem(product._id)}
                                                            onQuickView={() => openQuickView(product)}
                                                            onOpenProduct={() => openProduct(product._id)}
                                                            onTogglePriceDrop={() => toggleAlert(product, 'priceDrop')}
                                                            onToggleBackInStock={() => toggleAlert(product, 'backInStock')}
                                                        />
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        <View className="mb-10">
                                            <WishlistSectionHeader
                                                eyebrow="Recommended for you"
                                                title="Matching pieces your wishlist suggests"
                                                description="Use what customers usually do next: rings lead to necklace pairings, gemstone picks lead to coordinated accents, and discounts create a fast conversion path."
                                            />

                                            {catalogLoading && recommendedProducts.length === 0 ? (
                                                <View className="items-center justify-center rounded-[30px] border border-[#EADBCB] bg-white py-12" style={WISHLIST_PANEL_SHADOW}>
                                                    <ActivityIndicator color="#4A2E24" size="large" />
                                                    <Text className="mt-4 text-[15px] text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                                                        Curating suggestions from your saved styles...
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View className="flex-row flex-wrap gap-5">
                                                    {recommendedProducts.map((product) => (
                                                        <WishlistRecommendationCard
                                                            key={product._id}
                                                            product={product}
                                                            reason={getRecommendationReason(product, wishlistItems)}
                                                            onOpen={() => openProduct(product._id)}
                                                            onAddToCart={() => handleAddToCart(product)}
                                                        />
                                                    ))}
                                                </View>
                                            )}
                                        </View>

                                        <View className="mb-10">
                                            <WishlistSectionHeader
                                                eyebrow="Special offers"
                                                title="Wishlist items on sale"
                                                description="Keep deal-driven pieces close to checkout with a focused section for discounted saves and matching sale discoveries."
                                            />

                                            <View className="flex-row flex-wrap gap-5">
                                                {saleHighlights.map((product) => (
                                                    <WishlistRecommendationCard
                                                        key={`sale-${product._id}`}
                                                        product={product}
                                                        reason={hasWishlistDiscount(product) ? `${getWishlistStockLabel(product)} | Sale now live` : 'Offer spotlight'}
                                                        onOpen={() => openProduct(product._id)}
                                                        onAddToCart={() => handleAddToCart(product)}
                                                    />
                                                ))}
                                            </View>
                                        </View>

                                        <View style={{ gap: 20, flexDirection: isCompact ? 'column' : 'row' }}>
                                            <View style={{ flex: isCompact ? undefined : 1.1 }}>
                                                <WishlistSharePanel
                                                    count={wishlistItems.length}
                                                    onShareWhatsApp={handleShareWhatsApp}
                                                    onCopyLink={handleCopyLink}
                                                    onOpenShareSheet={handleOpenShareSheet}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <WishlistTrustSignals isCompact={isCompact && !isWideDesktop} />
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>

                        <WishlistQuickViewModal
                            visible={quickViewVisible}
                            product={quickViewProduct}
                            loading={quickViewLoading}
                            isAdding={addingId === quickViewProduct?._id}
                            onClose={closeQuickView}
                            onAddToCart={() => {
                                if (quickViewProduct) {
                                    handleAddToCart(quickViewProduct);
                                }
                            }}
                            onOpenProduct={() => {
                                if (quickViewProduct) {
                                    closeQuickView();
                                    openProduct(quickViewProduct._id);
                                }
                            }}
                        />
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}