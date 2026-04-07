
import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_BASE = 'http://localhost:5000';

// Font families (assume loaded globally or via expo-font)
const SERIF_FONT = 'PlayfairDisplay_700Bold';
const SANS_FONT = 'PlusJakartaSans_400Regular';

// Colors
const BROWN = '#8B4513';
const CREAM = '#FCFAF8';
const ACCENT_ORANGE = '#F6A96B';
const SLATE = '#64748B';
const SHADOW = Platform.OS === 'ios' ? {
    shadowColor: '#C2B6A0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
} : {
    elevation: 8,
};

// Glassmorphism style for header
const GLASS = {
    backgroundColor: 'rgba(252,250,248,0.7)',
    borderRadius: 32,
    ...SHADOW,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(12px)', // web only, ignored on native
};

export default function CartScreen() {
    const router = useRouter();
    const { items, cartCount, subtotal, shippingCost, tax, total, removeFromCart, updateQty } = useCart();

    const isMobile = SCREEN_WIDTH < 768;
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(40))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const imageUri = (img: string) => (img?.startsWith('http') ? img : `${API_BASE}/${img}`);
    const unitPrice = (item: (typeof items)[number]) =>
        item.salePrice !== null && item.salePrice < item.price ? item.salePrice : item.price;
    const cartItemKey = (item: (typeof items)[number]) => `${item.product}:${item.selectedVariant?.variantId || 'base'}`;

    // Sale badge logic
    const showSale = (item: (typeof items)[number]) => item.salePrice !== null && item.salePrice < item.price;

    // Trust badges (Jewellery themed)
    const trustBadges = [
        { icon: 'shield', text: 'Secure & Encrypted Checkout' },
        { icon: 'gem', text: 'Certified Artisan Jewellery' },
        { icon: 'heart', text: '30-Day Sparkle Guarantee' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: CREAM }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingHorizontal: 16, paddingTop: 32, paddingBottom: 32, backgroundColor: 'transparent' }}
                    >
                        <View style={{ width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
                            {/* Header with glassmorphism */}
                            <View style={[{
                                flexDirection: 'row', alignItems: 'center', marginBottom: 32, padding: 24, gap: 16,
                            }, GLASS]}
                            >
                                <Feather name="shopping-cart" size={32} color={BROWN} />
                                <Text style={{
                                    color: BROWN,
                                    fontFamily: SERIF_FONT,
                                    fontWeight: '700',
                                    fontSize: isMobile ? 28 : 36,
                                    letterSpacing: 1,
                                }}>
                                    Your Jewellery Box
                                </Text>
                                {cartCount > 0 && (
                                    <View style={{ paddingHorizontal: 16, paddingVertical: 4, marginLeft: 12, borderRadius: 999, backgroundColor: BROWN }}>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', fontFamily: SANS_FONT }}>
                                            {cartCount} piece{cartCount !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Empty State */}
                            {items.length === 0 ? (
                                <View style={{ alignItems: 'center', padding: 48, backgroundColor: '#fff', borderRadius: 40, ...SHADOW }}>
                                    <Feather name="gem" size={80} color={ACCENT_ORANGE} />
                                    <Text style={{ marginTop: 24, marginBottom: 8, fontSize: 28, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '700', letterSpacing: 1 }}>
                                        Your jewellery box is empty
                                    </Text>
                                    <Text style={{ marginBottom: 32, fontSize: 16, color: SLATE, textAlign: 'center', fontFamily: SANS_FONT }}>
                                        Add artisan-crafted rings, necklaces, and more to begin your collection.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/shop' as any)}
                                        style={{ paddingHorizontal: 40, paddingVertical: 16, borderRadius: 999, backgroundColor: BROWN, ...SHADOW }}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', fontFamily: SANS_FONT }}>Browse Jewellery</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
                                    {/* Items List */}
                                    <View style={{ width: isMobile ? '100%' : '70%', maxWidth: isMobile ? '100%' : 700 }}>
                                        {items.map(item => (
                                            <Animated.View
                                                key={cartItemKey(item)}
                                                style={{
                                                    marginBottom: 32,
                                                    backgroundColor: '#fff',
                                                    borderRadius: 40,
                                                    flexDirection: 'row',
                                                    alignItems: 'stretch',
                                                    borderWidth: 1.5,
                                                    borderColor: '#EFE2D1', // Soft champagne border
                                                    ...SHADOW,
                                                    padding: 0,
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Decorative Corner Element */}
                                                <View style={{
                                                    position: 'absolute',
                                                    right: -10,
                                                    top: -10,
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 30,
                                                    backgroundColor: '#FDF6ED',
                                                    opacity: 0.5,
                                                    zIndex: 0,
                                                }} />

                                                {/* Image Section with "Jewel-box" feel */}
                                                <View style={{
                                                    width: 140,
                                                    height: 150,
                                                    position: 'relative',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: '#F9F1EB',
                                                    borderRightWidth: 1,
                                                    borderRightColor: '#F3E8DC',
                                                    zIndex: 1
                                                }}>
                                                    {item.thumbnailImage ? (
                                                        <View style={{
                                                            width: 110,
                                                            height: 110,
                                                            borderRadius: 55, // Circular for a "locket" look
                                                            borderWidth: 3,
                                                            borderColor: '#D4AF37',
                                                            padding: 4,
                                                            backgroundColor: '#fff',
                                                            ...SHADOW
                                                        }}>
                                                            <Image
                                                                source={{ uri: imageUri(item.thumbnailImage) }}
                                                                style={{ flex: 1, borderRadius: 50 }}
                                                                contentFit="cover"
                                                            />
                                                        </View>
                                                    ) : (
                                                        <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#F3E8DC', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D4AF37' }}>
                                                            <Feather name="package" size={44} color={ACCENT_ORANGE} />
                                                        </View>
                                                    )}

                                                    {/* Floating Sale Tag */}
                                                    {showSale(item) && (
                                                        <View style={{
                                                            position: 'absolute',
                                                            bottom: 12,
                                                            backgroundColor: '#D4AF37',
                                                            borderRadius: 8,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 4,
                                                            zIndex: 2,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            transform: [{ rotate: '-5deg' }]
                                                        }}>
                                                            <Feather name="star" size={10} color="#fff" />
                                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10, fontFamily: SANS_FONT, letterSpacing: 1 }}>OFFER</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                {/* Info Section */}
                                                <View style={{ flex: 1, padding: 24, justifyContent: 'space-between', zIndex: 1 }}>
                                                    <View>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Text style={{ flex: 1, fontSize: 18, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '700', lineHeight: 24 }} numberOfLines={2}>
                                                                {item.name}
                                                            </Text>
                                                            <TouchableOpacity
                                                                onPress={() => removeFromCart(item.product, item.selectedVariant?.variantId)}
                                                                style={{ marginLeft: 10 }}
                                                            >
                                                                <Feather name="x" size={20} color={SLATE} />
                                                            </TouchableOpacity>
                                                        </View>

                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                                                            <View style={{ backgroundColor: '#F0EAD6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                                                <Text style={{ fontSize: 11, color: BROWN, fontFamily: SANS_FONT, fontWeight: '600' }}>SKU: {item.sku}</Text>
                                                            </View>
                                                            {item.selectedVariant?.label && (
                                                                <Text style={{ fontSize: 13, color: SLATE, fontFamily: SANS_FONT, fontStyle: 'italic' }}>
                                                                    {item.selectedVariant.label}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
                                                        <View>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Text style={{ fontSize: 20, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '700' }}>
                                                                    ${unitPrice(item).toFixed(2)}
                                                                </Text>
                                                                {showSale(item) && (
                                                                    <Text style={{ marginLeft: 8, fontSize: 14, color: SLATE, textDecorationLine: 'line-through', fontFamily: SANS_FONT }}>
                                                                        ${item.price.toFixed(2)}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            <Text style={{ fontSize: 11, color: ACCENT_ORANGE, fontFamily: SANS_FONT, marginTop: 2, fontWeight: '600' }}>
                                                                Handcrafted Piece
                                                            </Text>
                                                        </View>

                                                        {/* Modern Quantity Selector */}
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderRadius: 12,
                                                            borderWidth: 1,
                                                            borderColor: '#F3E8DC',
                                                            ...SHADOW
                                                        }}>
                                                            <TouchableOpacity
                                                                onPress={() => item.quantity > 1 && updateQty(item.product, item.quantity - 1, item.selectedVariant?.variantId)}
                                                                style={{ padding: 8, opacity: item.quantity === 1 ? 0.3 : 1 }}
                                                                disabled={item.quantity === 1}
                                                            >
                                                                <Feather name="minus" size={16} color={BROWN} />
                                                            </TouchableOpacity>
                                                            <Text style={{ width: 30, textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: BROWN, fontFamily: SANS_FONT }}>{item.quantity}</Text>
                                                            <TouchableOpacity
                                                                onPress={() => updateQty(item.product, item.quantity + 1, item.selectedVariant?.variantId)}
                                                                style={{ padding: 8 }}
                                                            >
                                                                <Feather name="plus" size={16} color={BROWN} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            </Animated.View>
                                        ))}
                                    </View>
                                    {/* Sticky Order Summary Sidebar */}
                                    <View style={{ width: isMobile ? '100%' : '30%', maxWidth: 400, position: isMobile ? 'relative' : 'sticky', top: isMobile ? undefined : 32, alignSelf: isMobile ? 'auto' : 'flex-start' }}>
                                        <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 32, ...SHADOW, position: 'relative' }}>
                                            <Text style={{ fontSize: 24, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '700', marginBottom: 24 }}>Order Details</Text>
                                            <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3E8DC', paddingVertical: 20, marginBottom: 20, gap: 12 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={{ color: SLATE, fontFamily: SANS_FONT }}>Jewellery Subtotal</Text>
                                                    <Text style={{ color: BROWN, fontWeight: '600', fontFamily: SANS_FONT }}>${subtotal.toFixed(2)}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={{ color: SLATE, fontFamily: SANS_FONT }}>Shipping</Text>
                                                    <Text style={{ color: BROWN, fontWeight: '600', fontFamily: SANS_FONT }}>
                                                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={{ color: SLATE, fontFamily: SANS_FONT }}>Tax (10%)</Text>
                                                    <Text style={{ color: BROWN, fontWeight: '600', fontFamily: SANS_FONT }}>${tax.toFixed(2)}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                                <Text style={{ fontSize: 20, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '700' }}>Total</Text>
                                                <Text style={{ fontSize: 28, fontFamily: SERIF_FONT, color: BROWN, fontWeight: '900' }}>${total.toFixed(2)}</Text>
                                            </View>
                                            {/* Upsell: Progress to Free Shipping */}
                                            {subtotal < 100 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7E6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 }}>
                                                    <Feather name="truck" size={18} color={ACCENT_ORANGE} />
                                                    <Text style={{ marginLeft: 10, color: ACCENT_ORANGE, fontFamily: SANS_FONT, fontSize: 14 }}>
                                                        Add <Text style={{ fontWeight: 'bold' }}>${(100 - subtotal).toFixed(2)}</Text> more to unlock free shipping for your precious jewels!
                                                    </Text>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                onPress={() => router.push('/checkout' as any)}
                                                style={{ paddingVertical: 18, backgroundColor: BROWN, borderRadius: 999, marginBottom: 16, alignItems: 'center', ...SHADOW }}
                                                activeOpacity={0.85}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ marginRight: 8, fontSize: 18, fontWeight: 'bold', color: '#fff', fontFamily: SANS_FONT }}>Secure My Jewels</Text>
                                                    <Feather name="arrow-right" size={20} color="#fff" />
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => router.push('/shop' as any)}
                                                style={{ paddingVertical: 18, borderWidth: 2, borderColor: BROWN, borderRadius: 999, alignItems: 'center' }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={{ fontWeight: '600', color: BROWN, fontFamily: SANS_FONT, fontSize: 16 }}>Browse More Gems</Text>
                                            </TouchableOpacity>
                                            {/* Trust badges */}
                                            <View style={{ borderTopWidth: 1, borderColor: '#F3E8DC', marginTop: 32, paddingTop: 20, gap: 16 }}>
                                                {trustBadges.map(({ icon, text }) => (
                                                    <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                        <Feather name={icon as any} size={18} color={BROWN} />
                                                        <Text style={{ color: SLATE, fontFamily: SANS_FONT, fontSize: 14 }}>{text}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </PageShell>
            </ScrollView>
        </View>
    );
}