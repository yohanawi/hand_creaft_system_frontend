import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import {
    AI_SEARCH_COLORS,
    AI_SEARCH_FONTS
} from "@/components/AISearch/aiSearchTheme";

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
} from "@/components/AISearch/aiSearchUtils";

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
            className="overflow-hidden rounded-[30px]  bg-[#FFFCF8]"
        >
            <View className={compact ? "h-[185px]" : "h-[238px]"}>
                <Image
                    source={{ uri: getAiSearchProductImage(product) }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                <View className="absolute inset-0 bg-black/10" />

                <View className="absolute px-3 py-2 border rounded-full left-4 top-4 border-white/40 bg-white/90">
                    <Text
                        className="text-[11px]"
                        style={{
                            color: AI_SEARCH_COLORS.espresso,
                            fontFamily: AI_SEARCH_FONTS.body,
                        }}
                    >
                        {getAiSearchCategoryName(product)}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onToggleWishlist}
                    className="absolute items-center justify-center border rounded-full right-4 top-4 h-11 w-11 border-white/40 bg-white/90"
                >
                    <Feather
                        name="heart"
                        size={17}
                        color={isWishlisted ? AI_SEARCH_COLORS.red : AI_SEARCH_COLORS.espresso}
                    />
                </TouchableOpacity>

                {discount > 0 ? (
                    <View className="absolute bottom-4 right-4 rounded-full bg-[#C99A3C] px-3 py-2">
                        <Text
                            className="text-[11px]"
                            style={{ color: "#fff", fontFamily: AI_SEARCH_FONTS.body }}
                        >
                            Save {discount}%
                        </Text>
                    </View>
                ) : null}
            </View>

            <View className="p-5">
                <Text
                    className="text-[22px] leading-7"
                    numberOfLines={2}
                    style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}
                >
                    {product.name}
                </Text>

                <Text
                    className="mt-2 text-[13px] leading-5"
                    numberOfLines={2}
                    style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}
                >
                    {getAiSearchInsight(product)}
                </Text>

                <View className="flex-row items-center justify-between mt-4">
                    <View>
                        <Text
                            className="text-[20px]"
                            style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.heading }}
                        >
                            {getAiSearchPrice(product)}
                        </Text>

                        {getAiSearchOriginalPrice(product) ? (
                            <Text
                                className="mt-1 text-[12px] line-through"
                                style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}
                            >
                                {getAiSearchOriginalPrice(product)}
                            </Text>
                        ) : null}
                    </View>

                    <View className="items-end">
                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}>
                            ★ {rating.toFixed(1)}
                        </Text>
                        <Text
                            className="mt-1 text-[11px]"
                            style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}
                        >
                            {reviews} reviews
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-3 mt-5">
                    <TouchableOpacity
                        onPress={onAddToCart}
                        disabled={!inStock}
                        className="flex-1 px-4 py-3 rounded-full"
                        style={{ backgroundColor: inStock ? AI_SEARCH_COLORS.espresso : "#D8C8BA" }}
                    >
                        <Text
                            className="text-center text-[13px]"
                            style={{ color: "#fff", fontFamily: AI_SEARCH_FONTS.body }}
                        >
                            {inStock ? "Add to cart" : "Out of stock"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onQuickView}
                        className="items-center justify-center w-12 h-12 bg-white border rounded-full"
                        style={{ borderColor: AI_SEARCH_COLORS.line }}
                    >
                        <Feather name="eye" size={16} color={AI_SEARCH_COLORS.espresso} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}