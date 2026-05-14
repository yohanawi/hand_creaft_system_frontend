import { useCurrency } from '@/context/CurrencyContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatConvertedPrice } from '@/utils/currency';
import { WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';
import {
    getWishlistBadge,
    getWishlistCategoryName,
    getWishlistDiscountPercent,
    getWishlistDisplayPrice,
    getWishlistImageUri,
    getWishlistMaterial,
    getWishlistStockLabel,
    hasWishlistDiscount,
    isWishlistItemInStock,
    WishlistDetailProduct
} from './wishlistUtils';

type Props = {
    product: WishlistDetailProduct;
    width: number | string;
    isAdding: boolean;
    priceDropEnabled: boolean;
    backInStockEnabled: boolean;
    onAddToCart: () => void;
    onRemove: () => void;
    onQuickView: () => void;
    onOpenProduct: () => void;
    onTogglePriceDrop: () => void;
    onToggleBackInStock: () => void;
};

export default function WishlistItemCard({
    product,
    width,
    isAdding,
    onAddToCart,
    onRemove,
    onOpenProduct,
    onTogglePriceDrop,
    onToggleBackInStock,
}: Props) {
    const { currency } = useCurrency();
    const imageUri = getWishlistImageUri(product);
    const discounted = hasWishlistDiscount(product);
    const inStock = isWishlistItemInStock(product);
    const badge = getWishlistBadge(product);
    const stockLabel = getWishlistStockLabel(product);
    const discountPercent = getWishlistDiscountPercent(product);
    const material = getWishlistMaterial(product);
    const category = getWishlistCategoryName(product) || 'Jewelry';

    return (
        <View className="overflow-hidden rounded-[32px] border border-[#EADBCB] bg-[#FFFDFC]" style={{ width: width as any }}>
            <TouchableOpacity
                onPress={onOpenProduct}
                activeOpacity={0.92}
                className="relative h-[300px] overflow-hidden bg-[#FAF1E7]"
            >
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        contentFit="cover"
                        style={{ width: '100%', height: '100%' }}
                        transition={250}
                    />
                ) : (
                    <View className="items-center justify-center h-full">
                        <Feather name="image" size={34} color="#B88258" />
                    </View>
                )}

                <View className="absolute inset-0 bg-[#1E120F]/10" />

                <View className="absolute flex-row flex-wrap gap-2 left-4 top-4">
                    <View className="rounded-full bg-[#4A2E24] px-3 py-2">
                        <Text className="text-[10px] uppercase tracking-[1.6px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                            {badge}
                        </Text>
                    </View>

                    {discounted ? (
                        <View className="rounded-full bg-[#B44848] px-3 py-2">
                            <Text className="text-[10px] uppercase tracking-[1.6px] text-white" style={{ fontFamily: WISHLIST_SANS }} >
                                {discountPercent}% off
                            </Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    onPress={onRemove}
                    activeOpacity={0.85}
                    className="absolute items-center justify-center border rounded-full right-4 top-4 h-11 w-11 border-white/50 bg-white/90"
                >
                    <Feather name="heart" size={18} color="#B44848" fill="#B44848" />
                </TouchableOpacity>

                <View className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/20 bg-[#271C18]/80 px-4 py-3">
                    <Text className="text-[11px] uppercase tracking-[2px] text-[#F3E2C6]" style={{ fontFamily: WISHLIST_SANS }}>
                        {material}
                    </Text>

                    <Text className="mt-1 text-[13px] leading-5 text-white" numberOfLines={1} style={{ fontFamily: WISHLIST_SANS }}>
                        {stockLabel}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="p-5">
                <View className="flex-row items-center justify-between gap-3 mb-3">
                    <Text className="text-[11px] uppercase tracking-[2px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                        {category}
                    </Text>

                    <View className="flex-row items-center gap-1">
                        <Feather name="star" size={13} color="#C59B5F" />
                        <Text className="text-[12px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                            Handcrafted
                        </Text>
                    </View>
                </View>

                <Text className="mb-3 text-[20px] leading-[31px] text-[#271C18]" numberOfLines={2} style={{ fontFamily: WISHLIST_SERIF }}>
                    {product.name}
                </Text>

                <View className="flex-row items-end justify-between gap-3 mb-5">
                    <View>
                        <Text className="text-[20px] text-[#4A2E24] font-body">
                            {formatConvertedPrice(getWishlistDisplayPrice(product), currency)}
                        </Text>

                        {discounted ? (
                            <Text className="text-[13px] text-[#9F8D7E] line-through" style={{ fontFamily: WISHLIST_SANS }} >
                                {formatConvertedPrice(Number(product.price || 0), currency)}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={onAddToCart}
                        disabled={!inStock || isAdding}
                        activeOpacity={0.85}
                        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full px-4 py-4 
                            ${inStock ? 'bg-[#4A2E24]' : 'bg-[#D9CEC2]'}`}>
                        <Feather name={inStock ? 'shopping-bag' : 'bell'} size={16} color="#FFFFFF" />
                        <Text className="text-sm text-white" style={{ fontFamily: WISHLIST_SANS }}>
                            {isAdding ? 'Adding...' : inStock ? 'Add to Cart' : 'Notify Me'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}