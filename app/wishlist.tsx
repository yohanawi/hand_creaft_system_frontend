import PageShell from '@/components/PageShell';
import WishlistEmptyState from '@/components/Wishlist/WishlistEmptyState';
import WishlistHeader from '@/components/Wishlist/WishlistHeader';
import WishlistItemCard from '@/components/Wishlist/WishlistItemCard';
import WishlistSectionHeader from '@/components/Wishlist/WishlistSectionHeader';
import WishlistTrustSignals from '@/components/Wishlist/WishlistTrustSignals';
import {
    WISHLIST_COLORS,
    WISHLIST_SANS
} from '@/components/Wishlist/wishlistTheme';
import {
    buildWishlistShareMessage,
    getWishlistImageUri,
    hasWishlistDiscount,
    isWishlistItemInStock,
    normalizeWishlistCatalog,
    WishlistDetailProduct,
} from '@/components/Wishlist/wishlistUtils';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { getProductById } from '@/services/api';
import { formatConvertedPrice } from '@/utils/currency';
import { Feather } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

type AlertPreferenceKey = 'priceDrop' | 'backInStock';

type AlertPreferences = Record<
    string,
    {
        priceDrop: boolean;
        backInStock: boolean;
    }
>;

export default function WishlistScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { width } = useWindowDimensions();

    const { items, removeItem, clearItems } = useWishlist();
    const { addToCart } = useCart();
    const { currency } = useCurrency();
    const { showToast } = useToast();

    const [addingId, setAddingId] = useState<string | null>(null);
    const [quickViewVisible, setQuickViewVisible] = useState(false);
    const [quickViewLoading, setQuickViewLoading] = useState(false);
    const [quickViewProduct, setQuickViewProduct] =
        useState<WishlistDetailProduct | null>(null);
    const [alertPreferences, setAlertPreferences] =
        useState<AlertPreferences>({});

    const wishlistItems = useMemo<WishlistDetailProduct[]>(
        () => items.map((item) => ({ ...item })),
        [items],
    );

    const isCompact = width < 768;
    const contentWidth = Math.min(width - (isCompact ? 24 : 48), 1180);
    const gridColumns = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
    const cardGap = 20;

    const cardWidth = gridColumns === 1
        ? '100%'
        : Math.floor((contentWidth - cardGap * (gridColumns - 1)) / gridColumns);

    const inStockCount = wishlistItems.filter(isWishlistItemInStock).length;
    const discountedCount = wishlistItems.filter(hasWishlistDiscount).length;

    const totalSavings = wishlistItems.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const salePrice = Number(item.salePrice ?? price);
        return salePrice < price ? sum + (price - salePrice) : sum;
    }, 0);

    const wishlistLink = useMemo(() => ExpoLinking.createURL('/wishlist'), []);

    const shareMessage = useMemo(
        () => `${buildWishlistShareMessage(wishlistItems)} ${wishlistLink}`.trim(),
        [wishlistItems, wishlistLink],
    );

    const navigateToShop = useCallback(() => {
        router.push('/shop' as any);
    }, [router]);

    const openProduct = useCallback(
        (id: string) => {
            router.push({ pathname: '/product-single', params: { id } } as any);
        },
        [router],
    );

    const handleAddToCart = useCallback(
        async (product: WishlistDetailProduct) => {
            if (!isWishlistItemInStock(product)) {
                setAlertPreferences((previous) => ({
                    ...previous,
                    [product._id]: {
                        priceDrop: previous[product._id]?.priceDrop ?? false,
                        backInStock: true,
                    },
                }));

                showToast('Back in stock alert enabled', 'success', {
                    subMessage: product.name,
                });
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
        },
        [addToCart, showToast],
    );

    const toggleAlert = useCallback(
        (product: WishlistDetailProduct, key: AlertPreferenceKey) => {
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
                enabled
                    ? `${key === 'priceDrop' ? 'Price drop' : 'Back in stock'} alert enabled`
                    : 'Alert removed',
                'success',
                { subMessage: product.name },
            );
        },
        [showToast],
    );

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

    return (
        <View style={{ flex: 1, backgroundColor: WISHLIST_COLORS.background }}>
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>

                    <WishlistHeader itemCount={wishlistItems.length} isCompact={isCompact} />

                    <View className="px-4 md:px-6">
                        <View className="w-full mx-auto" style={{ maxWidth: 1180 }}>
                            {wishlistItems.length === 0 ? (
                                <WishlistEmptyState onExplore={navigateToShop} />
                            ) : (
                                <>
                                    <View className="mb-10 mt-8 md:mt-16 overflow-hidden rounded-[32px] border border-[#EADBCB] bg-white p-5 md:p-6">
                                        <View
                                            style={{
                                                gap: 16,
                                                flexDirection: isCompact ? 'column' : 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            {[
                                                { label: 'Saved Pieces', value: wishlistItems.length, icon: 'heart' },
                                                { label: 'Available Now', value: inStockCount, icon: 'package' },
                                                { label: 'On Sale', value: discountedCount, icon: 'tag' },
                                            ].map((item) => (
                                                <View key={item.label} className="flex-1 rounded-[24px] border border-[#F0E3D7] bg-[#FFF8F1] px-5 py-4">
                                                    <View className="flex-row items-center gap-2 mb-2">
                                                        <Feather name={item.icon as any} size={15} color="#9A6D4D" />
                                                        <Text className="text-[11px] uppercase tracking-[1.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }} >
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-[32px] text-[#271C18] font-body">
                                                        {item.value}
                                                    </Text>
                                                </View>
                                            ))}

                                            <View className="flex-1 rounded-[24px] bg-[#4A2E24] px-5 py-4">
                                                <Text className="text-[11px] uppercase tracking-[2px] text-[#F3E2C6]" style={{ fontFamily: WISHLIST_SANS }}>
                                                    Estimated Savings
                                                </Text>

                                                <Text className="mt-2 text-[32px] text-white font-body">
                                                    {formatConvertedPrice(totalSavings, currency)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="mb-10">
                                        <WishlistSectionHeader
                                            eyebrow="Saved pieces"
                                            title="Your handcrafted favorites"
                                            description="Keep your favorite artisan jewelry pieces close, compare styles, and move them to checkout when you are ready."
                                            action={
                                                <TouchableOpacity
                                                    onPress={navigateToShop}
                                                    activeOpacity={0.85}
                                                    className="flex-row items-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-5 py-3" >
                                                    <Feather name="plus" size={15} color="#4A2E24" />
                                                    <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                                        Explore more
                                                    </Text>
                                                </TouchableOpacity>
                                            }
                                        />

                                        <View className="flex-row flex-wrap gap-5">
                                            {wishlistItems.map((product) => {
                                                const alerts = alertPreferences[product._id] || {
                                                    priceDrop: false,
                                                    backInStock: false,
                                                };

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

                                    <WishlistTrustSignals isCompact={isCompact} />
                                </>
                            )}
                        </View>
                    </View>

                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}