import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

type Product = {
    _id: string;
    name: string;
    slug: string;
    thumbnailImage?: string;
    images?: string[];
    price: number;
    salePrice?: number | null;
    currency?: string;
    sku?: string;
    quantity?: number;
    availabilityStatus?: string;
    description?: string;
    color?: string;
    material?: string;
    weight?: string | number;
    tags?: string[];
    category?: { name: string; slug: string } | null;
    subcategory?: { name: string; slug: string } | null;
    isFeatured?: boolean;
};

const imageUri = (img?: string) =>
    img ? (img.startsWith('http') ? img : `${API_BASE}/${img}`) : null;

export default function ProductSingleScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { addToCart } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [addingToCart, setAddingToCart] = useState(false);

    const isMobile = SCREEN_WIDTH < 768;

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(40))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (!id) { setError('No product specified.'); setLoading(false); return; }
        let mounted = true;
        (async () => {
            try {
                setLoading(true); setError(null);
                const res = await getProductById(id);
                if (mounted) setProduct(res.data);
            } catch (e: any) {
                if (mounted) setError(e?.response?.data?.message ?? 'Failed to load product.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const allImages: string[] = [];
    if (product) {
        if (product.thumbnailImage) allImages.push(imageUri(product.thumbnailImage)!);
        (product.images || []).forEach(img => {
            const uri = imageUri(img);
            if (uri && !allImages.includes(uri)) allImages.push(uri);
        });
    }

    const currentPrice = product?.salePrice != null && product.salePrice < product!.price
        ? product!.salePrice : product?.price ?? 0;
    const originalPrice = product?.price ?? 0;
    const discountPct = product?.salePrice != null && product.salePrice < product!.price
        ? Math.round(((originalPrice - product!.salePrice!) / originalPrice) * 100) : 0;
    const inStock = product?.availabilityStatus !== 'out_of_stock' && (product?.quantity ?? 0) > 0;
    const wished = product ? isInWishlist(product._id) : false;

    const handleAddToCart = useCallback(async () => {
        if (!product || !inStock) return;
        setAddingToCart(true);
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: product.thumbnailImage ? imageUri(product.thumbnailImage)! : '',
            price: product.price,
            salePrice: product.salePrice ?? null,
            sku: product.sku || '',
            quantity,
        });
        setAddingToCart(false);
        showToast(`${product.name} added to cart!`, 'success', { subMessage: `Qty: ×${quantity}` });
    }, [product, quantity, inStock, addToCart]);

    const handleToggleWishlist = useCallback(async () => {
        if (!product) return;
        const wasWished = isInWishlist(product._id);
        await toggleItem(product._id, {
            _id: product._id,
            name: product.name,
            thumbnailImage: product.thumbnailImage,
            price: product.price,
            salePrice: product.salePrice,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: product.quantity,
            category: product.category ?? undefined,
        });
        showToast(
            wasWished ? 'Removed from wishlist' : 'Added to wishlist!',
            'wishlist',
            { subMessage: product.name }
        );
    }, [product, toggleItem, isInWishlist, showToast]);

    const categoryName = product?.category && typeof product.category === 'object'
        ? product.category.name : (product?.category as string | undefined) ?? '';

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading product…</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <Feather name="alert-circle" size={64} color="#EF4444" />
                <Text style={{ color: '#111', fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>
                    {error ?? 'Product not found'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ backgroundColor: '#8B4513', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 12, marginTop: 16 }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={{ paddingVertical: 32, paddingHorizontal: 16 }}>
                            <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>

                                {/* Breadcrumb */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                                    <TouchableOpacity onPress={() => router.push('/' as any)}>
                                        <Text style={{ color: '#6B7280' }}>Home</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                    <TouchableOpacity onPress={() => router.push('/shop' as any)}>
                                        <Text style={{ color: '#6B7280' }}>Shop</Text>
                                    </TouchableOpacity>
                                    {categoryName ? (
                                        <>
                                            <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                            <Text style={{ color: '#6B7280' }}>{categoryName}</Text>
                                        </>
                                    ) : null}
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                    <Text style={{ color: '#8B4513', fontWeight: '600' }} numberOfLines={1}>{product.name}</Text>
                                </View>

                                {/* Product Details */}
                                <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 32, marginBottom: 48 }}>

                                    {/* Images */}
                                    <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
                                        <View style={{ backgroundColor: '#FAF3EB', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                                            {allImages.length > 0 ? (
                                                <Image
                                                    source={{ uri: allImages[selectedImage] }}
                                                    style={{ width: '100%', height: 320, borderRadius: 12 }}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View style={{ width: '100%', height: 320, borderRadius: 12, backgroundColor: '#F3E8DC', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Feather name="package" size={80} color="#C1622F" />
                                                </View>
                                            )}
                                        </View>
                                        {allImages.length > 1 && (
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                {allImages.map((img, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        onPress={() => setSelectedImage(i)}
                                                        style={{
                                                            flex: 1, borderRadius: 10, overflow: 'hidden',
                                                            borderWidth: 2,
                                                            borderColor: selectedImage === i ? '#8B4513' : '#E5E7EB',
                                                        }}
                                                    >
                                                        <Image source={{ uri: img }} style={{ width: '100%', height: 72 }} contentFit="cover" />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    {/* Info */}
                                    <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
                                        {/* Badges */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                            <View style={{ backgroundColor: inStock ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                <Text style={{ color: inStock ? '#065F46' : '#991B1B', fontWeight: '700', fontSize: 12 }}>
                                                    {inStock ? 'In Stock' : 'Out of Stock'}
                                                </Text>
                                            </View>
                                            {product.sku ? <Text style={{ color: '#6B7280', fontSize: 13, alignSelf: 'center' }}>SKU: {product.sku}</Text> : null}
                                            {product.isFeatured && (
                                                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                    <Text style={{ color: '#92400E', fontWeight: '700', fontSize: 12 }}>Featured</Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text style={{ color: '#111827', fontSize: 26, fontWeight: '800', marginBottom: 16, lineHeight: 34 }}>
                                            {product.name}
                                        </Text>

                                        {/* Price */}
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                            <Text style={{ color: '#8B4513', fontSize: 36, fontWeight: '800' }}>${currentPrice.toFixed(2)}</Text>
                                            {discountPct > 0 && (
                                                <>
                                                    <Text style={{ color: '#9CA3AF', fontSize: 20, textDecorationLine: 'line-through' }}>${originalPrice.toFixed(2)}</Text>
                                                    <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{discountPct}% OFF</Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>

                                        {product.description ? (
                                            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 24, marginBottom: 20 }} numberOfLines={4}>
                                                {product.description}
                                            </Text>
                                        ) : null}

                                        {/* Attributes */}
                                        {(product.color || product.material) && (
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                                                {product.color && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={{ color: '#6B7280', fontWeight: '600' }}>Color:</Text>
                                                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: product.color, borderWidth: 1, borderColor: '#D1D5DB' }} />
                                                        <Text style={{ color: '#374151', textTransform: 'capitalize' }}>{product.color}</Text>
                                                    </View>
                                                )}
                                                {product.material && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={{ color: '#6B7280', fontWeight: '600' }}>Material:</Text>
                                                        <Text style={{ color: '#374151' }}>{product.material}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Quantity */}
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 10 }}>Quantity:</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                                    style={{ backgroundColor: '#F5EDE3', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Feather name="minus" size={18} color="#8B4513" />
                                                </TouchableOpacity>
                                                <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700', marginHorizontal: 20 }}>{quantity}</Text>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity(quantity + 1)}
                                                    style={{ backgroundColor: '#F5EDE3', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Feather name="plus" size={18} color="#8B4513" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Add to Cart + Wishlist */}
                                        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 12 }}>
                                            <TouchableOpacity
                                                onPress={handleAddToCart}
                                                disabled={!inStock || addingToCart}
                                                style={{
                                                    flex: 1, backgroundColor: inStock ? '#8B4513' : '#D1D5DB',
                                                    borderRadius: 12, paddingVertical: 16,
                                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                {addingToCart
                                                    ? <ActivityIndicator color="#fff" size="small" />
                                                    : <>
                                                        <Feather name="shopping-cart" size={20} color="#fff" />
                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                                                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                                                        </Text>
                                                    </>
                                                }
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={handleToggleWishlist}
                                                style={{
                                                    width: 52, height: 52, borderRadius: 12,
                                                    backgroundColor: wished ? '#FEE2E2' : '#F5EDE3',
                                                    borderWidth: 1, borderColor: wished ? '#FECACA' : '#E5E7EB',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Feather name="heart" size={22} color={wished ? '#EF4444' : '#8B4513'} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* View Cart link */}
                                        <TouchableOpacity
                                            onPress={() => router.push('/cart' as any)}
                                            style={{ borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 20 }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={{ color: '#8B4513', fontWeight: '700' }}>View Cart</Text>
                                        </TouchableOpacity>

                                        {/* Trust Badges */}
                                        <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16, gap: 10 }}>
                                            {[
                                                { icon: 'truck' as const, text: 'Free shipping on orders over $100' },
                                                { icon: 'rotate-ccw' as const, text: '30-day return policy' },
                                                { icon: 'shield' as const, text: 'Secure & encrypted checkout' },
                                            ].map(item => (
                                                <View key={item.icon} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Feather name={item.icon} size={16} color="#8B4513" />
                                                    <Text style={{ color: '#374151', marginLeft: 10, fontSize: 13 }}>{item.text}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                {/* Tabs */}
                                <View style={{ marginBottom: 48 }}>
                                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 20, flexWrap: 'wrap' }}>
                                        {['description', 'details'].map(tab => (
                                            <TouchableOpacity
                                                key={tab}
                                                onPress={() => setActiveTab(tab)}
                                                style={{
                                                    paddingVertical: 14, paddingHorizontal: 24,
                                                    borderBottomWidth: 2,
                                                    borderBottomColor: activeTab === tab ? '#8B4513' : 'transparent',
                                                }}
                                            >
                                                <Text style={{ fontWeight: '700', textTransform: 'capitalize', color: activeTab === tab ? '#8B4513' : '#6B7280' }}>
                                                    {tab}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {activeTab === 'description' && (
                                        <View>
                                            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 26 }}>
                                                {product.description || 'No description available for this product.'}
                                            </Text>
                                            {product.tags && product.tags.length > 0 && (
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                                                    {product.tags.map((tag, i) => (
                                                        <View key={i} style={{ backgroundColor: '#F5EDE3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                            <Text style={{ color: '#8B4513', fontSize: 13 }}>#{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {activeTab === 'details' && (
                                        <View>
                                            {[
                                                { label: 'SKU', value: product.sku },
                                                { label: 'Category', value: categoryName },
                                                { label: 'Color', value: product.color },
                                                { label: 'Material', value: product.material },
                                                { label: 'Weight', value: product.weight ? String(product.weight) : undefined },
                                                { label: 'Availability', value: product.availabilityStatus?.replace(/_/g, ' ') },
                                            ].filter(r => !!r.value).map(row => (
                                                <View key={row.label} style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                                    <Text style={{ color: '#6B7280', width: '35%', textTransform: 'capitalize' }}>{row.label}</Text>
                                                    <Text style={{ color: '#111827', fontWeight: '600', flex: 1, textTransform: 'capitalize' }}>{row.value}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </ScrollView>
        </View>
    );
}
