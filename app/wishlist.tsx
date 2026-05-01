import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { getAssetUrl } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useWishlist, WishlistProduct } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const imageUri = (img?: string) => getAssetUrl(img);

export default function WishlistScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { items, removeItem } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [addingId, setAddingId] = useState<string | null>(null);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();
    }, []);

    const handleAddToCart = useCallback(async (product: WishlistProduct) => {
        const inStock = product.availabilityStatus !== 'out_of_stock' && (product.quantity ?? 0) > 0;
        if (!inStock) {
            showToast('Product is out of stock', 'warning', { subMessage: product.name });
            return;
        }
        setAddingId(product._id);
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: product.thumbnailImage ? imageUri(product.thumbnailImage)! : '',
            price: product.price,
            salePrice: product.salePrice ?? null,
            sku: product.sku || '',
            quantity: 1,
        });
        setAddingId(null);
        showToast(`${product.name} added to cart!`, 'success');
    }, [addToCart]);

    const handleAddAllToCart = useCallback(async () => {
        const inStockItems = items.filter(p => p.availabilityStatus !== 'out_of_stock' && (p.quantity ?? 0) > 0);
        if (inStockItems.length === 0) {
            showToast('No items in stock', 'warning', { subMessage: 'None of your wishlist items are available.' });
            return;
        }
        for (const product of inStockItems) {
            await addToCart({
                product: product._id,
                name: product.name,
                thumbnailImage: product.thumbnailImage ? imageUri(product.thumbnailImage)! : '',
                price: product.price,
                salePrice: product.salePrice ?? null,
                sku: product.sku || '',
                quantity: 1,
            });
        }
        showToast(`${inStockItems.length} item(s) added to cart!`, 'success');
    }, [items, addToCart]);

    const inStockCount = items.filter(p => p.availabilityStatus !== 'out_of_stock' && (p.quantity ?? 0) > 0).length;
    const totalSavings = items.reduce((sum, p) => {
        if (p.salePrice != null && p.salePrice < p.price) return sum + (p.price - p.salePrice);
        return sum;
    }, 0);

    const categoryName = (product: WishlistProduct) =>
        product.category && typeof product.category === 'object'
            ? (product.category as any).name
            : product.category ?? '';

    const COLORS = {
        primary: '#8B4513', // SaddleBrown
        secondary: '#D2691E', // Chocolate
        accent: '#F5DEB3', // Wheat
        background: '#FAF9F6', // Off-white/Cream
        text: '#2D241E',
        muted: '#9CA3AF',
        success: '#059669',
        danger: '#EF4444',
        gold: '#D4AF37'
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Elegant Header Section */}
                        <View style={{ position: 'relative', overflow: 'hidden' }}>
                            <View style={{
                                backgroundColor: COLORS.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 80,
                                alignItems: 'center',
                                borderBottomLeftRadius: 40,
                                borderBottomRightRadius: 40,
                            }}>
                                {/* Decorative elements */}
                                <View style={{ position: 'absolute', top: -20, left: -20, opacity: 0.1 }}>
                                    <MaterialCommunityIcons name="necklace" size={120} color="#fff" />
                                </View>
                                <View style={{ position: 'absolute', bottom: -10, right: 20, opacity: 0.1 }}>
                                    <MaterialCommunityIcons name="ring" size={80} color="#fff" />
                                </View>

                                <View style={{
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    padding: 16,
                                    borderRadius: 30,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)'
                                }}>
                                    <Feather name="heart" size={36} color={COLORS.accent} />
                                </View>
                                <Text style={{
                                    color: '#fff',
                                    fontSize: isMobile ? 32 : 42,
                                    fontWeight: '800',
                                    marginBottom: 8,
                                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                                    textAlign: 'center'
                                }}>
                                    Treasured Items
                                </Text>
                                <View style={{ height: 2, width: 60, backgroundColor: COLORS.accent, marginBottom: 12 }} />
                                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 400, textAlign: 'center', lineHeight: 22 }}>
                                    {items.length === 0
                                        ? 'Start your collection by saving the hand-crafted pieces you love.'
                                        : `You have ${items.length} exquisite piece${items.length !== 1 ? 's' : ''} in your collection.`}
                                </Text>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 16, marginTop: -30 }}>
                            <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>

                                {/* Creative Stats Bar */}
                                {items.length > 0 && (
                                    <View style={{
                                        flexDirection: 'row',
                                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                                        backgroundColor: '#fff',
                                        borderRadius: 24,
                                        padding: 24,
                                        marginBottom: 24,
                                        shadowColor: COLORS.primary,
                                        shadowOpacity: 0.1,
                                        shadowRadius: 20,
                                        elevation: 5,
                                        gap: 12,
                                        borderWidth: 1,
                                        borderColor: '#F3F4F6',
                                    }}>
                                        {[
                                            { label: 'Saved Pieces', value: String(items.length), icon: 'heart', color: COLORS.primary },
                                            { label: 'Available Now', value: String(inStockCount), icon: 'check-circle', color: COLORS.success },
                                            { label: 'Total Savings', value: `$${totalSavings.toFixed(2)}`, icon: 'trending-down', color: COLORS.danger },
                                        ].map((stat, i) => (
                                            <View key={i} style={{
                                                flex: 1,
                                                minWidth: isMobile ? '45%' : 'auto',
                                                alignItems: 'center',
                                                borderRightWidth: !isMobile && i < 2 ? 1 : 0,
                                                borderRightColor: '#F3F4F6'
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    <Feather name={stat.icon as any} size={14} color={stat.color} />
                                                    <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Text>
                                                </View>
                                                <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.text }}>{stat.value}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Action Buttons */}
                                {items.length > 0 && (
                                    <View style={{
                                        flexDirection: isMobile ? 'column' : 'row',
                                        gap: 12,
                                        marginBottom: 32,
                                        paddingHorizontal: 4
                                    }}>
                                        <TouchableOpacity
                                            onPress={handleAddAllToCart}
                                            style={{
                                                flex: 1.5,
                                                backgroundColor: COLORS.primary,
                                                borderRadius: 16,
                                                paddingVertical: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 10,
                                                shadowColor: COLORS.primary,
                                                shadowOpacity: 0.3,
                                                shadowRadius: 10,
                                                elevation: 4
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Feather name="shopping-cart" size={18} color="#fff" />
                                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Move all to Bag</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => router.push('/shop' as any)}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#fff',
                                                borderWidth: 2,
                                                borderColor: COLORS.primary,
                                                borderRadius: 16,
                                                paddingVertical: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 10
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Feather name="plus" size={18} color={COLORS.primary} />
                                            <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 16 }}>Find more Art</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Empty State - Artistic */}
                                {items.length === 0 ? (
                                    <View style={{
                                        alignItems: 'center',
                                        paddingVertical: 60,
                                        backgroundColor: '#fff',
                                        borderRadius: 32,
                                        marginHorizontal: 4,
                                        paddingHorizontal: 20,
                                        borderWidth: 1,
                                        borderColor: '#F3F4F6',
                                    }}>
                                        <View style={{ position: 'relative' }}>
                                            <View style={{ backgroundColor: '#FAF3EB', padding: 40, borderRadius: 100 }}>
                                                <MaterialCommunityIcons name="hands-pray" size={80} color={COLORS.secondary} />
                                            </View>
                                            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.gold, padding: 10, borderRadius: 20 }}>
                                                <Feather name="heart" size={20} color="#fff" />
                                            </View>
                                        </View>
                                        <Text style={{
                                            color: COLORS.text,
                                            fontSize: 28,
                                            fontWeight: '800',
                                            marginTop: 24,
                                            marginBottom: 12,
                                            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                                        }}>Your heart is open</Text>
                                        <Text style={{ color: COLORS.muted, fontSize: 16, textAlign: 'center', maxWidth: 350, marginBottom: 32, lineHeight: 24 }}>
                                            Hand-crafted elegance takes time to find. Browse our artisan collections and save your favorite discoveries here.
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => router.push('/shop' as any)}
                                            style={{
                                                backgroundColor: COLORS.primary,
                                                borderRadius: 100,
                                                paddingHorizontal: 48,
                                                paddingVertical: 18,
                                                shadowColor: COLORS.primary,
                                                shadowOpacity: 0.2,
                                                shadowRadius: 15,
                                                elevation: 5
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 }}>DISCOVER ARTISANRY</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* Product Grid - Refined Cards */
                                    <View style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        gap: 20,
                                        justifyContent: isMobile ? 'center' : 'flex-start'
                                    }}>
                                        {items.map((product) => {
                                            const inStock = product.availabilityStatus !== 'out_of_stock' && (product.quantity ?? 0) > 0;
                                            const salePrice = product.salePrice;
                                            const hasDiscount = salePrice != null && salePrice < product.price;
                                            const discountPct = hasDiscount
                                                ? Math.round(((product.price - salePrice!) / product.price) * 100)
                                                : 0;
                                            const imgUri = imageUri(product.thumbnailImage);
                                            const cat = categoryName(product);

                                            return (
                                                <View
                                                    key={product._id}
                                                    style={{
                                                        backgroundColor: '#fff',
                                                        borderRadius: 24,
                                                        overflow: 'hidden',
                                                        width: isMobile ? '100%' : isTablet ? '47%' : '31.5%',
                                                        shadowColor: '#000',
                                                        shadowOpacity: 0.05,
                                                        shadowRadius: 15,
                                                        elevation: 3,
                                                        borderWidth: 1,
                                                        borderColor: '#F9FAFB'
                                                    }}
                                                >
                                                    {/* Image Container */}
                                                    <TouchableOpacity
                                                        onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                        activeOpacity={0.9}
                                                    >
                                                        <View style={{ height: 260, backgroundColor: '#FAF3EB', position: 'relative' }}>
                                                            {imgUri ? (
                                                                <Image
                                                                    source={{ uri: imgUri }}
                                                                    style={{ width: '100%', height: '100%' }}
                                                                    contentFit="cover"
                                                                    transition={400}
                                                                />
                                                            ) : (
                                                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                    <MaterialCommunityIcons name="image-off-outline" size={48} color={COLORS.muted} />
                                                                </View>
                                                            )}

                                                            {/* Badges */}
                                                            <View style={{ position: 'absolute', top: 12, left: 12, gap: 8 }}>
                                                                {hasDiscount && (
                                                                    <View style={{ backgroundColor: COLORS.danger, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                                                                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{discountPct}% OFF</Text>
                                                                    </View>
                                                                )}
                                                                {!inStock && (
                                                                    <View style={{ backgroundColor: 'rgba(55, 65, 81, 0.9)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                                                                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>RESTOCKING</Text>
                                                                    </View>
                                                                )}
                                                            </View>

                                                            {/* Quick Remove */}
                                                            <TouchableOpacity
                                                                onPress={() => removeItem(product._id)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 12,
                                                                    right: 12,
                                                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                                                    borderRadius: 12,
                                                                    width: 36,
                                                                    height: 36,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    shadowColor: '#000',
                                                                    shadowOpacity: 0.1,
                                                                    shadowRadius: 5
                                                                }}
                                                            >
                                                                <Feather name="trash-2" size={16} color={COLORS.danger} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </TouchableOpacity>

                                                    {/* Product Info */}
                                                    <View style={{ padding: 20 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                            <View style={{ flex: 1 }}>
                                                                {cat ? <Text style={{ color: COLORS.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{cat}</Text> : null}
                                                                <Text
                                                                    style={{ color: COLORS.text, fontWeight: '700', fontSize: 18, marginBottom: 4 }}
                                                                    numberOfLines={1}
                                                                >
                                                                    {product.name}
                                                                </Text>
                                                            </View>
                                                            <View style={{ alignItems: 'flex-end' }}>
                                                                <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: '800' }}>
                                                                    ${(hasDiscount ? salePrice! : product.price).toFixed(2)}
                                                                </Text>
                                                                {hasDiscount && (
                                                                    <Text style={{ color: COLORS.muted, fontSize: 12, textDecorationLine: 'line-through' }}>
                                                                        ${product.price.toFixed(2)}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                        </View>

                                                        {/* Action Buttons */}
                                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                                            <TouchableOpacity
                                                                onPress={() => handleAddToCart(product)}
                                                                disabled={!inStock || addingId === product._id}
                                                                style={{
                                                                    flex: 1,
                                                                    backgroundColor: inStock ? COLORS.primary : '#E5E7EB',
                                                                    borderRadius: 12,
                                                                    paddingVertical: 14,
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 8,
                                                                }}
                                                                activeOpacity={0.8}
                                                            >
                                                                {addingId === product._id ? (
                                                                    <ActivityIndicator color="#fff" size="small" />
                                                                ) : (
                                                                    <>
                                                                        <Feather name="shopping-bag" size={15} color="#fff" />
                                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                                                                            {inStock ? 'Add to Bag' : 'Out of Stock'}
                                                                        </Text>
                                                                    </>
                                                                )}
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                                style={{
                                                                    backgroundColor: '#FEF3E7',
                                                                    borderRadius: 12,
                                                                    width: 48,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    borderWidth: 1,
                                                                    borderColor: '#FEE2E2'
                                                                }}
                                                                activeOpacity={0.8}
                                                            >
                                                                <Feather name="eye" size={18} color={COLORS.primary} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
