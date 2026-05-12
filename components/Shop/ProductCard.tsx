import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import type { Product, ViewMode } from '@/types/shop';
import { badgeColor, discount } from '@/utils/shopHelpers';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';

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
    const cardWidth = isList ? '100%' : (isMobile ? '100%' : '31.5%');

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

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, speed: 30 }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

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

    const renderPriceBlock = () => (
        <View className="flex-row flex-wrap items-center gap-2">
            {/* Current Price */}
            <Text className="text-[17px] font-bold text-[#6B4226] tracking-tight">
                ${curr.toFixed(2)}
            </Text>

            {/* Original Price */}
            {hasSale && (
                <Text className="text-[13px] text-[#A08B7D] line-through">
                    ${orig.toFixed(2)}
                </Text>
            )}

            {/* Discount Pill */}
            {disc > 0 && (
                <View className="bg-[#FCEAD8] px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-semibold text-[#7C4A1E]">
                        Save {disc}%
                    </Text>
                </View>
            )}
        </View>
    );

    const renderCartButton = () => {
        const label = !inStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart';

        return (
            <TouchableOpacity
                disabled={!inStock || addingToCart}
                onPress={handleAddToCart}
                activeOpacity={0.9}
                className={`rounded-full overflow-hidden ${!inStock ? 'border border-[#E5D9CD]' : ''
                    }`}
            >
                {inStock ? (
                    <LinearGradient
                        colors={['#4E2D0E', '#7C4A1E', '#B5743F']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="items-center justify-center py-3 rounded-full"
                    >
                        <Text className="text-white text-[12px] font-semibold tracking-wide">
                            {label}
                        </Text>
                    </LinearGradient>
                ) : (
                    <View className="py-3 rounded-full items-center justify-center bg-[#EDE3D8]">
                        <Text className="text-white text-[12px] font-semibold tracking-wide">
                            {label}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // ── List Mode ─────────────────────────────────────────────────────────────
    if (isList) {
        return (
            <Animated.View style={animatedStyle} className="mb-4">
                <TouchableOpacity
                    activeOpacity={0.95}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() =>
                        router.push({
                            pathname: '/product-single',
                            params: { id: product.id },
                        } as any)
                    }
                    className="bg-white rounded-3xl border border-[#E8DDD2] flex-row overflow-hidden mb-4">
                    {/* Image Section */}
                    <View className="w-1/4 h-full bg-[#F8F2EA] relative shrink-0">
                        {product.imageUrl ? (
                            <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="items-center justify-center flex-1">
                                <Text className="text-4xl text-[#8B5E3C]">
                                    ◇
                                </Text>
                            </View>
                        )}

                        {/* Badge */}
                        <View className="absolute px-3 py-1 border rounded-full top-2 left-2 border-white/20" style={{ backgroundColor: badgeColor(badgeText), }} >
                            <Text className="text-white text-[10px] font-semibold uppercase tracking-wide">
                                {badgeText}
                            </Text>
                        </View>

                        {/* Discount */}
                        {disc > 0 && (
                            <View className="absolute px-2 py-1 rounded-full bottom-2 right-2 bg-white/90">
                                <Text className="text-[10px] font-bold text-[#6B4226]">
                                    -{disc}%
                                </Text>
                            </View>
                        )}

                        {/* Out of stock */}
                        {!inStock && (
                            <View className="absolute bottom-0 left-0 right-0 items-center py-1 bg-black/50">
                                <Text className="text-white text-[10px] font-semibold tracking-wide">
                                    Out of Stock
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View className="justify-between flex-1 px-3 py-3">
                        <View>
                            {/* Meta */}
                            <Text numberOfLines={1} className="text-[10px] uppercase tracking-widest text-[#9A8478] font-medium">
                                {product.category} {product.material ? ` · ${product.material}` : ''}
                            </Text>

                            {/* Product Name */}
                            <Text numberOfLines={2} className="text-[15px] font-bold text-[#2D1810] leading-5 mt-1">
                                {product.name}
                            </Text>

                            {/* Stock */}
                            <View className="flex-row items-center mt-2">
                                <View className={`w-2 h-2 rounded-full mr-2 ${inStock ? 'bg-green-700' : 'bg-gray-400'}`} />
                                <Text className="text-[11px] text-[#7A6A5E]">
                                    {inStock ? 'Ready to ship' : 'Currently unavailable'}
                                </Text>
                            </View>

                            {/* Price Block */}
                            <View className="mt-3">
                                {renderPriceBlock()}
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row items-center gap-2 mt-4">
                            <View className="flex-1 max-w-[120px]">
                                {renderCartButton()}
                            </View>

                            <TouchableOpacity onPress={handleToggleWishlist} className={`w-10 h-10 rounded-full items-center justify-center border 
                            ${wished ? 'bg-red-50 border-red-200' : 'bg-[#FAF7F3] border-[#E5D9CD]'}`} >
                                <Text className={`text-lg ${wished ? 'text-red-500' : 'text-[#8A7668]'}`}>
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
        <Animated.View style={animatedStyle} className="mb-4">
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() =>
                    router.push({
                        pathname: '/product-single',
                        params: { id: product.id },
                    } as any)
                }
                className="bg-white rounded-3xl border border-[#E8DDD2] overflow-hidden w-[18rem] h-[24rem] mb-4">
                {/* Product Image */}
                <View className="w-full aspect-[4/3] bg-[#F8F2EA] relative">
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="items-center justify-center flex-1">
                            <Text className="text-5xl text-[#8B5E3C]">
                                ◇
                            </Text>
                        </View>
                    )}

                    {/* Badge */}
                    <View className="absolute px-3 py-1 border rounded-full top-2 left-2 border-white/20" style={{ backgroundColor: badgeColor(badgeText), }}>
                        <Text className="text-white text-[10px] font-semibold uppercase tracking-wide">
                            {badgeText}
                        </Text>
                    </View>

                    {/* Wishlist */}
                    <TouchableOpacity onPress={handleToggleWishlist} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        className={`absolute top-2 right-2 w-9 h-9 rounded-full items-center justify-center border 
                            ${wished ? 'bg-red-50 border-red-200' : 'bg-white/90 border-[#E5D9CD]'}`}>
                        <Text className={`text-lg ${wished ? 'text-red-500' : 'text-[#8A7668]'}`}>
                            {wished ? '♥' : '♡'}
                        </Text>
                    </TouchableOpacity>

                    {/* Discount */}
                    {disc > 0 && (
                        <View className="absolute bottom-3 right-3 bg-[#B5743F] px-3 py-1 rounded-full border border-white/20">
                            <Text className="text-white text-[10px] font-bold">
                                -{disc}%
                            </Text>
                        </View>
                    )}

                    {/* Out of Stock */}
                    {!inStock && (
                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                            <View className="px-4 py-2 border rounded-full bg-black/60 border-white/20">
                                <Text className="text-xs font-semibold tracking-wide text-white">
                                    Out of Stock
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View className="px-3 pt-3 pb-4">
                    {/* Meta */}
                    <Text numberOfLines={1} className="text-[10px] uppercase tracking-widest text-[#9A8478] font-medium">
                        {product.category} {product.material ? ` · ${product.material}` : ''}
                    </Text>

                    {/* Product Name */}
                    <Text numberOfLines={2} className="text-[14px] font-bold text-[#2D1810] leading-5 mt-1 mb-1 h-10">
                        {product.name}
                    </Text>

                    {/* Price */}
                    <View className="mb-3">
                        {renderPriceBlock()}
                    </View>

                    {/* Cart Button */}
                    {renderCartButton()}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
