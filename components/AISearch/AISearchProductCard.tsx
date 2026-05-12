import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_CARD_SHADOW, AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import {
    getAiSearchCategoryName,
    getAiSearchDiscountPercent,
    getAiSearchInsight,
    getAiSearchOriginalPrice,
    getAiSearchPrice,
    getAiSearchProductImage,
    getAiSearchRating,
    getAiSearchReviewCount,
    isAiSearchInStock,
    type AiSearchProduct,
} from '@/components/AISearch/aiSearchUtils';

type Props = {
    product: AiSearchProduct;
    onPress: () => void;
    onQuickView: () => void;
    onToggleWishlist: () => void;
    onAddToCart: () => void;
    isWishlisted: boolean;
    accentLabel?: string;
    accentValue?: string;
    compact?: boolean;
};

export default function AISearchProductCard({
    product,
    onPress,
    onQuickView,
    onToggleWishlist,
    onAddToCart,
    isWishlisted,
    accentLabel,
    accentValue,
    compact = false,
}: Props) {
    const inStock = isAiSearchInStock(product);
    const discount = getAiSearchDiscountPercent(product);
    const rating = getAiSearchRating(product);
    const reviews = getAiSearchReviewCount(product);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.92}
            className="overflow-hidden rounded-[24px] border bg-[#fffdfb]"
            style={[{ borderColor: AI_SEARCH_COLORS.line }, AI_SEARCH_CARD_SHADOW]}
        >
            <View className={compact ? 'h-[180px]' : 'h-[220px]'}>
                <Image source={{ uri: getAiSearchProductImage(product) }} className="h-full w-full" resizeMode="cover" />
                <View className="absolute left-4 top-4 rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(255,250,246,0.92)' }}>
                    <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>
                        {getAiSearchCategoryName(product)}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onToggleWishlist}
                    className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255,250,246,0.92)' }}
                >
                    <Feather name={isWishlisted ? 'heart' : 'heart'} size={16} color={isWishlisted ? AI_SEARCH_COLORS.red : AI_SEARCH_COLORS.espresso} />
                </TouchableOpacity>
                {discount > 0 ? (
                    <View className="absolute bottom-4 left-4 rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(201,154,60,0.92)' }}>
                        <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>
                            Save {discount}%
                        </Text>
                    </View>
                ) : null}
            </View>

            <View className="p-4">
                <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                        <Text className="text-[20px] leading-7" numberOfLines={2} style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            {product.name}
                        </Text>
                        <Text className="mt-2 text-[12px]" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            {getAiSearchInsight(product)}
                        </Text>
                    </View>

                    {accentLabel && accentValue ? (
                        <View className="rounded-[16px] px-3 py-2" style={{ backgroundColor: '#f4e7db' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 10 }}>{accentLabel}</Text>
                            <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>{accentValue}</Text>
                        </View>
                    ) : null}
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-[18px]" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.heading }}>{getAiSearchPrice(product)}</Text>
                        {getAiSearchOriginalPrice(product) ? (
                            <Text className="mt-1 line-through" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                {getAiSearchOriginalPrice(product)}
                            </Text>
                        ) : null}
                    </View>

                    <View className="items-end">
                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>{rating.toFixed(1)} / 5</Text>
                        <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>{reviews} reviews</Text>
                    </View>
                </View>

                <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                        onPress={onAddToCart}
                        disabled={!inStock}
                        className="flex-1 rounded-full px-4 py-3"
                        style={{ backgroundColor: inStock ? AI_SEARCH_COLORS.espresso : '#d5c7bc' }}
                    >
                        <Text className="text-center" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                            {inStock ? 'Add to cart' : 'Out of stock'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onQuickView}
                        className="rounded-full border px-4 py-3"
                        style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.card }}
                    >
                        <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                            View product
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}