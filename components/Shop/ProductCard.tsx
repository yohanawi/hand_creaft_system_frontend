import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { COLORS } from '@/constants/shopTheme';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import type { Product, ViewMode } from '@/types/shop';
import { badgeColor, discount } from '@/utils/shopHelpers';

type Props = {
    product: Product;
    viewMode: ViewMode;
    index: number;
    isMobile: boolean;
};

export default function ProductCard({ product, viewMode, index, isMobile }: Props) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { showToast } = useToast();
    const [addingToCart, setAddingToCart] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const wished = isInWishlist(product.id);
    const isList = viewMode === 'list';
    const curr = typeof product.salePrice === 'number' ? product.salePrice : product.price;
    const orig = product.price;
    const disc = discount(orig, curr);
    const inStock = product.availabilityStatus === 'in_stock' && product.quantity > 0;
    const hasSale = typeof product.salePrice === 'number' && product.salePrice < product.price;
    const badgeText = product.isFeatured ? 'Featured' : hasSale ? 'Sale' : 'New';

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 380,
                delay: Math.min(index * 60, 480),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 380,
                delay: Math.min(index * 60, 480),
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, index, slideAnim]);

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, speed: 30 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    const handleAddToCart = async () => {
        if (!inStock || addingToCart) return;
        setAddingToCart(true);
        await addToCart({
            product: product.id,
            name: product.name,
            thumbnailImage: product.imageUrl ?? '',
            price: product.price,
            salePrice: hasSale ? (product.salePrice as number) : null,
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
            salePrice: hasSale ? (product.salePrice as number) : null,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: product.quantity,
        });
        showToast(
            wasWished ? 'Removed from wishlist' : 'Added to wishlist!',
            'wishlist',
            { subMessage: product.name },
        );
    };

    const animatedStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    };

    // ── List Mode ─────────────────────────────────────────────────────────────
    if (isList) {
        return (
            <Animated.View style={[styles.wrapper, animatedStyle]}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => router.push({ pathname: '/product-single', params: { id: product.id } } as any)}
                    style={styles.listCard}
                >
                    {/* Image */}
                    <View style={styles.listImageWrap}>
                        {product.imageUrl
                            ? <Image source={{ uri: product.imageUrl }} style={styles.listImage} resizeMode="cover" />
                            : <View style={styles.imageFallback}><Text style={styles.fallbackIcon}>📦</Text></View>
                        }
                        <View style={[styles.badgePill, { backgroundColor: badgeColor(badgeText) }]}>
                            <Text style={styles.badgeLabel}>{badgeText}</Text>
                        </View>
                        {!inStock && (
                            <View style={styles.oosBanner}>
                                <Text style={styles.oosBannerText}>Out of Stock</Text>
                            </View>
                        )}
                    </View>

                    {/* Info */}
                    <View style={styles.listInfo}>
                        <Text style={styles.metaLabel} numberOfLines={1}>
                            {product.category}{product.material ? `  ·  ${product.material}` : ''}
                        </Text>
                        <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>${curr.toFixed(2)}</Text>
                            {hasSale && <Text style={styles.origPrice}>${orig.toFixed(2)}</Text>}
                            {disc > 0 && (
                                <View style={styles.discPill}>
                                    <Text style={styles.discPillText}>-{disc}%</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.listActions}>
                            <TouchableOpacity
                                disabled={!inStock || addingToCart}
                                onPress={handleAddToCart}
                                style={[styles.cartBtn, !inStock && styles.cartBtnDisabled]}
                            >
                                <Text style={styles.cartBtnText}>
                                    {!inStock ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleToggleWishlist}
                                style={[styles.wishBtn, wished && styles.wishBtnActive]}
                            >
                                <Text style={[styles.wishIcon, { color: wished ? '#E05252' : COLORS.muted }]}>
                                    {wished ? '♥' : '♡'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // ── Grid Mode ─────────────────────────────────────────────────────────────
    return (
        <Animated.View style={[styles.wrapper, styles.gridWrapper, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push({ pathname: '/product-single', params: { id: product.id } } as any)}
                style={styles.gridCard}
            >
                {/* Image */}
                <View style={styles.gridImageWrap}>
                    {product.imageUrl
                        ? <Image source={{ uri: product.imageUrl }} style={styles.gridImage} resizeMode="cover" />
                        : <View style={styles.imageFallback}><Text style={styles.fallbackIconLg}>📦</Text></View>
                    }
                    {/* Badge */}
                    <View style={[styles.badgePill, { backgroundColor: badgeColor(badgeText) }]}>
                        <Text style={styles.badgeLabel}>{badgeText}</Text>
                    </View>
                    {/* Wishlist float */}
                    <TouchableOpacity
                        onPress={handleToggleWishlist}
                        style={[styles.wishFloat, wished && styles.wishFloatActive]}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                        <Text style={[styles.wishFloatIcon, { color: wished ? '#E05252' : COLORS.muted }]}>
                            {wished ? '♥' : '♡'}
                        </Text>
                    </TouchableOpacity>
                    {/* Discount pill */}
                    {disc > 0 && (
                        <View style={styles.discFloat}>
                            <Text style={styles.discFloatText}>-{disc}%</Text>
                        </View>
                    )}
                    {/* OOS overlay */}
                    {!inStock && (
                        <View style={styles.oosOverlay}>
                            <View style={styles.oosPill}>
                                <Text style={styles.oosOverlayText}>Out of Stock</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.gridInfo}>
                    <Text style={styles.metaLabel} numberOfLines={1}>
                        {product.category}{product.material ? `  ·  ${product.material}` : ''}
                    </Text>
                    <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${curr.toFixed(2)}</Text>
                        {hasSale && <Text style={styles.origPrice}>${orig.toFixed(2)}</Text>}
                    </View>
                    <TouchableOpacity
                        disabled={!inStock || addingToCart}
                        onPress={handleAddToCart}
                        style={[styles.cartBtn, !inStock && styles.cartBtnDisabled]}
                    >
                        <Text style={styles.cartBtnText}>
                            {!inStock ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 14,
    },

    // ── Grid ──────────────────────────────────────────────────────────────────
    gridWrapper: {
        width: '31.5%',
    },
    gridCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#3D1A06',
                shadowOpacity: 0.09,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 5 },
        }),
    },
    gridImageWrap: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: COLORS.parchment,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridInfo: {
        padding: 7,
        paddingTop: 6,
        gap: 1,
    },
    gridName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.ink,
        lineHeight: 16,
        marginTop: 1,
        marginBottom: 3,
    },

    // ── List ──────────────────────────────────────────────────────────────────
    listCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                shadowColor: '#3D1A06',
                shadowOpacity: 0.09,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 5 },
        }),
    },
    listImageWrap: {
        width: 90,
        height: 110,
        backgroundColor: COLORS.parchment,
        position: 'relative',
        flexShrink: 0,
    },
    listImage: {
        width: '100%',
        height: '100%',
    },
    listInfo: {
        flex: 1,
        padding: 8,
        justifyContent: 'space-between',
    },
    listName: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.ink,
        lineHeight: 16,
        marginTop: 1,
        marginBottom: 1,
    },
    listActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    oosBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(30,8,0,0.6)',
        paddingVertical: 5,
        alignItems: 'center',
    },
    oosBannerText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.4,
    },

    // ── Shared image overlays ──────────────────────────────────────────────────
    imageFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackIcon: {
        fontSize: 40,
    },
    fallbackIconLg: {
        fontSize: 52,
    },
    badgePill: {
        position: 'absolute',
        top: 10,
        left: 10,
        borderRadius: 30,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    badgeLabel: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    wishFloat: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.88)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wishFloatActive: {
        backgroundColor: '#FFF0F0',
    },
    wishFloatIcon: {
        fontSize: 16,
        lineHeight: 20,
    },
    discFloat: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: COLORS.accent,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    discFloatText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
    oosOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(30,8,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    oosPill: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 30,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    oosOverlayText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.4,
    },

    // ── Shared info elements ───────────────────────────────────────────────────
    metaLabel: {
        fontSize: 10,
        color: COLORS.mutedLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 2,
    },
    price: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: -0.3,
    },
    origPrice: {
        fontSize: 13,
        color: COLORS.mutedLight,
        textDecorationLine: 'line-through',
    },
    discPill: {
        backgroundColor: COLORS.accentLight,
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    discPillText: {
        fontSize: 10,
        color: COLORS.primaryDark,
        fontWeight: '700',
    },

    // ── Cart & wishlist buttons ─────────────────────────────────────────────────
    cartBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    cartBtnDisabled: {
        backgroundColor: COLORS.border,
    },
    cartBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 0.2,
    },
    wishBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.parchment,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    wishBtnActive: {
        backgroundColor: '#FFF0F0',
        borderColor: '#F5B8B8',
    },
    wishIcon: {
        fontSize: 17,
        lineHeight: 21,
    },
});

