import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { WISHLIST_PANEL_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';
import {
    getWishlistCategoryName,
    getWishlistDisplayPrice,
    getWishlistImageUri,
    getWishlistShortDescription,
    hasWishlistDiscount,
    WishlistDetailProduct,
} from './wishlistUtils';

type Props = {
    product: WishlistDetailProduct;
    reason: string;
    onOpen: () => void;
    onAddToCart?: () => void;
};

export default function WishlistRecommendationCard({ product, reason, onOpen, onAddToCart }: Props) {
    const imageUri = getWishlistImageUri(product);
    const discounted = hasWishlistDiscount(product);

    return (
        <View className="min-w-[250px] flex-1 overflow-hidden rounded-[28px] border border-[#EADBCB] bg-white" style={WISHLIST_PANEL_SHADOW}>
            <TouchableOpacity onPress={onOpen} activeOpacity={0.92} className="h-[210px] bg-[#FAF1E7]">
                {imageUri ? (
                    <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: '100%', height: '100%' }} transition={250} />
                ) : (
                    <View className="h-full items-center justify-center">
                        <Feather name="image" size={28} color="#B88258" />
                    </View>
                )}
            </TouchableOpacity>

            <View className="p-5">
                <Text className="mb-2 text-[11px] uppercase tracking-[1.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                    {reason}
                </Text>
                <Text className="mb-1 text-[24px] leading-[30px] text-[#271C18]" numberOfLines={2} style={{ fontFamily: WISHLIST_SERIF }}>
                    {product.name}
                </Text>
                <Text className="mb-3 text-[13px] uppercase tracking-[1.6px] text-[#B88258]" style={{ fontFamily: WISHLIST_SANS }}>
                    {getWishlistCategoryName(product) || 'Jewelry'}
                </Text>
                <Text className="mb-4 text-[14px] leading-6 text-[#7A685B]" numberOfLines={2} style={{ fontFamily: WISHLIST_SANS }}>
                    {getWishlistShortDescription(product)}
                </Text>

                <View className="mb-4 flex-row items-end gap-2">
                    <Text className="text-[24px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SERIF }}>
                        ${getWishlistDisplayPrice(product).toFixed(2)}
                    </Text>
                    {discounted ? (
                        <Text className="pb-1 text-[13px] text-[#9F8D7E] line-through" style={{ fontFamily: WISHLIST_SANS }}>
                            ${Number(product.price || 0).toFixed(2)}
                        </Text>
                    ) : null}
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={onOpen} className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-4 py-3">
                        <Feather name="eye" size={15} color="#4A2E24" />
                        <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                            View
                        </Text>
                    </TouchableOpacity>
                    {onAddToCart ? (
                        <TouchableOpacity onPress={onAddToCart} className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#4A2E24] px-4 py-3">
                            <Feather name="shopping-bag" size={15} color="#FFFFFF" />
                            <Text className="text-sm text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                Add
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </View>
    );
}
