
import CartEmptyState from '@/components/Cart/CartEmptyState';
import CartHeader from '@/components/Cart/CartHeader';
import CartItemCard from '@/components/Cart/CartItemCard';
import CartSummarySidebar from '@/components/Cart/CartSummarySidebar';
import CartSupportSections from '@/components/Cart/CartSupportSections';
import { CART_COLORS } from '@/components/Cart/cartTheme';
import {
    CartCustomization,
    buildRecommendations,
    formatCurrency,
    getCartItemKey,
    toWishlistProduct,
} from '@/components/Cart/cartUtils';
import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { WishlistProduct, useWishlist } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { validateCoupon } from '@/services/api'; 
import { formatConvertedPrice } from '@/utils/currency';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, View, useWindowDimensions } from 'react-native';

const EMPTY_CUSTOMIZATION: CartCustomization = {
    engraving: false,
    notes: '',
};

export default function CartScreen() {

    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { showToast } = useToast();
    const { items, cartCount, subtotal, shippingCost, total, removeFromCart, updateQty, addToCart } = useCart();
    const { currency } = useCurrency();
    const { items: wishlistItems, isInWishlist, toggleItem, removeItem } = useWishlist();
    const { width } = useWindowDimensions();

    const isDesktop = width >= 1080;
    const isCompact = width < 780;

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(28))[0];
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [customizations, setCustomizations] = useState<Record<string, CartCustomization>>({});
    const [movingWishlistKey, setMovingWishlistKey] = useState<string | null>(null);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const recommendations = useMemo(() => buildRecommendations(items), [items]);

    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    const adjustedTax = Number((discountedSubtotal * 0.1).toFixed(2));
    const adjustedTotal = Number((discountedSubtotal + shippingCost + adjustedTax).toFixed(2));

    const updateCustomization = (itemKey: string, patch: Partial<CartCustomization>) => {
        setCustomizations((prev) => ({
            ...prev,
            [itemKey]: {
                ...(prev[itemKey] || EMPTY_CUSTOMIZATION),
                ...patch,
            },
        }));
    };

    const getCustomization = (itemKey: string) => customizations[itemKey] || EMPTY_CUSTOMIZATION;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Alert.alert('Coupon', 'Enter a coupon code first.');
            return;
        }

        setCouponLoading(true);
        try {
            const { data } = await validateCoupon({ code: couponCode.trim(), subtotal });
            const discount = Number(data.discount || 0);
            setCouponDiscount(discount);
            setCouponCode(String(data.coupon?.code || couponCode).trim());
            showToast('Coupon applied to cart preview', 'success', { subMessage: `${formatConvertedPrice(discount, currency)} discount ready` });
        } catch (error: any) {
            setCouponDiscount(0);
            Alert.alert('Coupon Error', error?.response?.data?.message ?? 'Failed to validate coupon.');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleMoveToWishlist = async (item: (typeof items)[number]) => {
        const itemKey = getCartItemKey(item);
        setMovingWishlistKey(itemKey);

        try {
            if (!isInWishlist(item.product)) {
                await toggleItem(item.product, toWishlistProduct(item));
            }
            await removeFromCart(item.product, item.selectedVariant?.variantId);
            showToast('Moved to wishlist', 'wishlist', { subMessage: item.name });
        } finally {
            setMovingWishlistKey(null);
        }
    };

    const handleAddSavedToCart = async (item: WishlistProduct) => {
        await addToCart({
            product: item._id,
            name: item.name,
            thumbnailImage: item.thumbnailImage || '',
            price: item.price,
            salePrice: item.salePrice ?? null,
            sku: item.sku || '',
            quantity: 1,
        });
        showToast('Saved piece added to cart', 'success', { subMessage: item.name });
    };

    return (
        <View style={{ flex: 1, backgroundColor: CART_COLORS.parchment }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View
                        className="px-4 py-8 md:px-5 md:py-10"
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    >
                        <View className="w-full gap-6 mx-auto py-28 max-w-7xl">
                            <CartHeader
                                cartCount={cartCount}
                                onNavigateHome={() => router.push('/' as any)}
                                onNavigateShop={() => router.push('/shop' as any)}
                            />

                            {items.length === 0 ? (
                                <CartEmptyState onBrowseCollections={() => router.push('/shop' as any)} />
                            ) : (
                                <View className={`${isDesktop ? 'flex-row items-start' : 'flex-col'} gap-6`}>
                                    <View className={`${isDesktop ? 'flex-1' : 'w-full'} gap-6`}>
                                        {items.map((item) => {
                                            const itemKey = getCartItemKey(item);

                                            return (
                                                <CartItemCard
                                                    key={itemKey}
                                                    item={item}
                                                    isCompact={isCompact}
                                                    isSaved={isInWishlist(item.product)}
                                                    isMovingToWishlist={movingWishlistKey === itemKey}
                                                    customization={getCustomization(itemKey)}
                                                    onDecreaseQty={() => updateQty(item.product, item.quantity - 1, item.selectedVariant?.variantId)}
                                                    onIncreaseQty={() => updateQty(item.product, item.quantity + 1, item.selectedVariant?.variantId)}
                                                    onRemove={() => removeFromCart(item.product, item.selectedVariant?.variantId)}
                                                    onMoveToWishlist={() => handleMoveToWishlist(item)}
                                                    onOpenProduct={() => router.push(`/product-single?id=${item.product}` as any)}
                                                    onCustomizationChange={(patch) => updateCustomization(itemKey, patch)}
                                                />
                                            );
                                        })}

                                        <CartSupportSections
                                            couponCode={couponCode}
                                            couponDiscount={couponDiscount}
                                            couponLoading={couponLoading}
                                            onCouponChange={setCouponCode}
                                            onApplyCoupon={handleApplyCoupon}
                                            onOpenDeals={() => router.push('/deals' as any)}
                                            recommendations={recommendations}
                                            onOpenRecommendation={(route) => router.push(route as any)}
                                            savedItems={wishlistItems}
                                            onAddSavedToCart={handleAddSavedToCart}
                                            onRemoveSaved={removeItem}
                                            onBrowseWishlist={() => router.push('/wishlist' as any)}
                                            cartItems={items}
                                        />
                                    </View>

                                    <View className={`${isDesktop ? 'w-[360px]' : 'w-full'}`}>
                                        <CartSummarySidebar
                                            subtotal={subtotal}
                                            shippingCost={shippingCost}
                                            tax={adjustedTax}
                                            discount={couponDiscount}
                                            total={adjustedTotal || total}
                                            itemCount={cartCount}
                                            isDesktop={isDesktop}
                                            onCheckout={() => router.push('/checkout' as any)}
                                            onContinueShopping={() => router.push('/shop' as any)}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}