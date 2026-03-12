import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = 'http://localhost:5000';

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
    }, []);

    const imageUri = (img: string) => (img?.startsWith('http') ? img : `${API_BASE}/${img}`);
    const unitPrice = (item: (typeof items)[number]) =>
        item.salePrice !== null && item.salePrice < item.price ? item.salePrice : item.price;

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="py-14 px-4 bg-craft-50"
                    >
                        <View className="max-w-6xl mx-auto w-full">
                            {/* Heading */}
                            <View className="flex-row items-center mb-8">
                                <Feather name="shopping-cart" size={28} color="#8B4513" />
                                <Text className={`text-brown-primary font-bold ml-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                    My Cart
                                </Text>
                                {cartCount > 0 && (
                                    <View className="ml-3 bg-brown-primary rounded-full px-3 py-1">
                                        <Text className="text-white text-xs font-bold">
                                            {cartCount} item{cartCount !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Empty State */}
                            {items.length === 0 ? (
                                <View className="bg-white rounded-3xl p-12 items-center shadow-md">
                                    <Feather name="shopping-cart" size={80} color="#D1D5DB" />
                                    <Text className="text-gray-900 text-2xl font-bold mt-6 mb-2">Your cart is empty</Text>
                                    <Text className="text-gray-500 text-center text-base mb-8">
                                        Add some handcrafted items to get started.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/shop' as any)}
                                        className="bg-brown-primary rounded-full px-10 py-4"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-bold text-base">Browse Shop</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
                                    {/* Items */}
                                    <View className={isMobile ? 'w-full' : 'flex-1'}>
                                        {items.map(item => (
                                            <View key={item.product} className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                                                <View className="flex-row">
                                                    {/* Thumbnail */}
                                                    {item.thumbnailImage ? (
                                                        <Image
                                                            source={{ uri: imageUri(item.thumbnailImage) }}
                                                            style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: '#F3E8DC' }}
                                                            contentFit="cover"
                                                        />
                                                    ) : (
                                                        <View className="rounded-xl items-center justify-center"
                                                            style={{ width: 90, height: 90, backgroundColor: '#F3E8DC' }}>
                                                            <Feather name="package" size={36} color="#C1622F" />
                                                        </View>
                                                    )}

                                                    {/* Info */}
                                                    <View className="flex-1 ml-4 justify-between">
                                                        <View>
                                                            <Text className="text-gray-900 font-semibold text-base" numberOfLines={2}>
                                                                {item.name}
                                                            </Text>
                                                            <Text className="text-gray-400 text-xs mt-1">SKU: {item.sku}</Text>
                                                        </View>

                                                        <View className="flex-row items-center mt-2">
                                                            <Text className="text-brown-primary font-bold text-lg">
                                                                ${unitPrice(item).toFixed(2)}
                                                            </Text>
                                                            {item.salePrice !== null && item.salePrice < item.price && (
                                                                <Text className="text-gray-400 text-sm line-through ml-2">
                                                                    ${item.price.toFixed(2)}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {/* Qty + remove */}
                                                        <View className="flex-row items-center justify-between mt-3">
                                                            <View className="flex-row items-center bg-craft-100 rounded-xl">
                                                                <TouchableOpacity
                                                                    onPress={() => updateQty(item.product, item.quantity - 1)}
                                                                    className="px-3 py-2"
                                                                >
                                                                    <Feather name="minus" size={16} color="#8B4513" />
                                                                </TouchableOpacity>
                                                                <Text className="text-gray-900 font-bold px-3">{item.quantity}</Text>
                                                                <TouchableOpacity
                                                                    onPress={() => updateQty(item.product, item.quantity + 1)}
                                                                    className="px-3 py-2"
                                                                >
                                                                    <Feather name="plus" size={16} color="#8B4513" />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => removeFromCart(item.product)}
                                                                className="bg-red-50 p-2 rounded-xl"
                                                            >
                                                                <Feather name="trash-2" size={18} color="#EF4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>

                                                    {/* Line total (desktop) */}
                                                    {!isMobile && (
                                                        <View className="items-end justify-center ml-4 w-24">
                                                            <Text className="text-gray-400 text-xs mb-1">Line total</Text>
                                                            <Text className="text-brown-primary font-bold text-lg">
                                                                ${(unitPrice(item) * item.quantity).toFixed(2)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Order Summary */}
                                    <View className={isMobile ? 'w-full' : 'w-80'}>
                                        <View className="bg-white rounded-2xl p-6 shadow-md">
                                            <Text className="text-gray-900 text-xl font-bold mb-5">Order Summary</Text>

                                            <View className="border-t border-b border-gray-100 py-4 mb-4 gap-y-3">
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-500">Subtotal</Text>
                                                    <Text className="text-gray-800 font-semibold">${subtotal.toFixed(2)}</Text>
                                                </View>
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-row items-center">
                                                        <Text className="text-gray-500">Shipping</Text>
                                                        {shippingCost === 0 && (
                                                            <View className="ml-2 bg-green-100 rounded-full px-2 py-0.5">
                                                                <Text className="text-green-600 text-xs font-semibold">FREE</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text className="text-gray-800 font-semibold">
                                                        {shippingCost === 0 ? '$0.00' : `$${shippingCost.toFixed(2)}`}
                                                    </Text>
                                                </View>
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-500">Tax (10%)</Text>
                                                    <Text className="text-gray-800 font-semibold">${tax.toFixed(2)}</Text>
                                                </View>
                                            </View>

                                            <View className="flex-row justify-between mb-5">
                                                <Text className="text-gray-900 text-lg font-bold">Total</Text>
                                                <Text className="text-brown-primary text-2xl font-extrabold">${total.toFixed(2)}</Text>
                                            </View>

                                            {subtotal < 100 && (
                                                <View className="bg-amber-50 rounded-xl px-4 py-3 mb-5 flex-row items-center">
                                                    <Feather name="truck" size={16} color="#D97706" />
                                                    <Text className="text-amber-700 text-xs ml-2 flex-1">
                                                        Add <Text className="font-bold">${(100 - subtotal).toFixed(2)}</Text> more for free shipping!
                                                    </Text>
                                                </View>
                                            )}

                                            <TouchableOpacity
                                                onPress={() => router.push('/checkout' as any)}
                                                className="bg-brown-primary rounded-xl py-4 mb-3"
                                                activeOpacity={0.85}
                                            >
                                                <View className="flex-row items-center justify-center">
                                                    <Text className="text-white font-bold text-base mr-2">Proceed to Checkout</Text>
                                                    <Feather name="arrow-right" size={18} color="#fff" />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => router.push('/shop' as any)}
                                                className="border border-brown-primary rounded-xl py-4"
                                                activeOpacity={0.8}
                                            >
                                                <Text className="text-brown-primary text-center font-semibold">Continue Shopping</Text>
                                            </TouchableOpacity>

                                            {/* Trust badges */}
                                            <View className="mt-5 pt-5 border-t border-gray-100 gap-y-3">
                                                {[
                                                    { icon: 'shield', text: 'Secure & encrypted checkout' },
                                                    { icon: 'truck', text: 'Free shipping on orders over $100' },
                                                    { icon: 'rotate-ccw', text: 'Easy 30-day returns' },
                                                ].map(({ icon, text }) => (
                                                    <View key={icon} className="flex-row items-center">
                                                        <Feather name={icon as any} size={16} color="#10B981" />
                                                        <Text className="text-gray-500 text-xs ml-2 flex-1">{text}</Text>
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