import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist, WishlistProduct } from '@/context/WishlistContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = 'http://localhost:5000';

const imageUri = (img?: string) =>
    img ? (img.startsWith('http') ? img : `${API_BASE}/${img}`) : null;

export default function WishlistScreen() {
    const router = useRouter();
    const { items, removeItem } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [addingId, setAddingId] = useState<string | null>(null);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
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

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Hero */}
                        <View style={{ backgroundColor: '#8B4513', paddingHorizontal: 16, paddingVertical: 56, alignItems: 'center' }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 14, borderRadius: 999, marginBottom: 14 }}>
                                <Feather name="heart" size={44} color="#fff" />
                            </View>
                            <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 6 }}>My Wishlist</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                                {items.length} item{items.length !== 1 ? 's' : ''} saved for later
                            </Text>
                        </View>

                        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
                            <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>

                                {/* Stats Bar */}
                                {items.length > 0 && (
                                    <View style={{
                                        flexDirection: isMobile ? 'column' : 'row',
                                        backgroundColor: '#fff',
                                        borderRadius: 16,
                                        padding: 20,
                                        marginBottom: 20,
                                        shadowColor: '#000',
                                        shadowOpacity: 0.06,
                                        shadowRadius: 10,
                                        elevation: 3,
                                        gap: 16,
                                    }}>
                                        {[
                                            { label: 'Saved Items', value: String(items.length), color: '#8B4513' },
                                            { label: 'In Stock', value: String(inStockCount), color: '#059669' },
                                            { label: 'Total Savings', value: `$${totalSavings.toFixed(2)}`, color: '#EF4444' },
                                        ].map((stat, i) => (
                                            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                                                <Text style={{ fontSize: 28, fontWeight: '800', color: stat.color, marginBottom: 4 }}>{stat.value}</Text>
                                                <Text style={{ color: '#6B7280', fontSize: 13 }}>{stat.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Action Buttons */}
                                {items.length > 0 && (
                                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 24 }}>
                                        <TouchableOpacity
                                            onPress={handleAddAllToCart}
                                            style={{ flex: 1, backgroundColor: '#8B4513', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                            activeOpacity={0.8}
                                        >
                                            <Feather name="shopping-cart" size={18} color="#fff" />
                                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Add All to Cart</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => router.push('/shop' as any)}
                                            style={{ flex: 1, borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                            activeOpacity={0.8}
                                        >
                                            <Feather name="shopping-bag" size={18} color="#8B4513" />
                                            <Text style={{ color: '#8B4513', fontWeight: '700', fontSize: 15 }}>Continue Shopping</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Empty State */}
                                {items.length === 0 ? (
                                    <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                                        <View style={{ backgroundColor: '#FEF3E7', padding: 32, borderRadius: 999, marginBottom: 24 }}>
                                            <Feather name="heart" size={64} color="#D2691E" />
                                        </View>
                                        <Text style={{ color: '#111827', fontSize: 24, fontWeight: '800', marginBottom: 10 }}>Your Wishlist is Empty</Text>
                                        <Text style={{ color: '#6B7280', fontSize: 15, textAlign: 'center', maxWidth: 320, marginBottom: 28 }}>
                                            Browse products and tap the heart icon to save your favorites here.
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => router.push('/shop' as any)}
                                            style={{ backgroundColor: '#8B4513', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Start Shopping</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* Product Grid */
                                    <View style={
                                        isMobile
                                            ? { flexDirection: 'column' }
                                            : { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }
                                    }>
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
                                                        borderRadius: 16,
                                                        overflow: 'hidden',
                                                        marginBottom: isMobile ? 16 : 0,
                                                        width: isMobile ? '100%' : isTablet ? '48%' : '31.5%',
                                                        shadowColor: '#000',
                                                        shadowOpacity: 0.07,
                                                        shadowRadius: 12,
                                                        elevation: 3,
                                                    }}
                                                >
                                                    {/* Image */}
                                                    <TouchableOpacity
                                                        onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                        activeOpacity={0.9}
                                                    >
                                                        <View style={{ position: 'relative', height: 220, backgroundColor: '#FAF3EB' }}>
                                                            {imgUri ? (
                                                                <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                                            ) : (
                                                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Feather name="package" size={64} color="#C1622F" />
                                                                </View>
                                                            )}
                                                            {hasDiscount && (
                                                                <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#EF4444', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                                                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>-{discountPct}%</Text>
                                                                </View>
                                                            )}
                                                            {!inStock && (
                                                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', paddingVertical: 8 }}>
                                                                    <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Out of Stock</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>

                                                    {/* Remove button */}
                                                    <TouchableOpacity
                                                        onPress={() => removeItem(product._id)}
                                                        style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 7, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                                                    >
                                                        <Feather name="x" size={16} color="#EF4444" />
                                                    </TouchableOpacity>

                                                    {/* Info */}
                                                    <View style={{ padding: 14 }}>
                                                        {cat ? <Text style={{ color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{cat}</Text> : null}
                                                        <Text
                                                            style={{ color: '#111827', fontWeight: '700', fontSize: 16, marginBottom: 8 }}
                                                            numberOfLines={2}
                                                        >
                                                            {product.name}
                                                        </Text>

                                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                                                            <Text style={{ color: '#8B4513', fontSize: 22, fontWeight: '800' }}>
                                                                ${(hasDiscount ? salePrice! : product.price).toFixed(2)}
                                                            </Text>
                                                            {hasDiscount && (
                                                                <Text style={{ color: '#9CA3AF', fontSize: 15, textDecorationLine: 'line-through' }}>
                                                                    ${product.price.toFixed(2)}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {/* Action Row */}
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <TouchableOpacity
                                                                onPress={() => handleAddToCart(product)}
                                                                disabled={!inStock || addingId === product._id}
                                                                style={{
                                                                    flex: 1, backgroundColor: inStock ? '#8B4513' : '#D1D5DB',
                                                                    borderRadius: 10, paddingVertical: 12,
                                                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                                }}
                                                                activeOpacity={0.8}
                                                            >
                                                                {addingId === product._id
                                                                    ? <ActivityIndicator color="#fff" size="small" />
                                                                    : <>
                                                                        <Feather name="shopping-cart" size={15} color="#fff" />
                                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                                                                            {inStock ? 'Add to Cart' : 'Unavailable'}
                                                                        </Text>
                                                                    </>
                                                                }
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                                style={{ backgroundColor: '#F5EDE3', borderRadius: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }}
                                                                activeOpacity={0.8}
                                                            >
                                                                <Feather name="eye" size={17} color="#8B4513" />
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
            </ScrollView>
        </View>
    );
}
