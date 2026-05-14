import { CartItem } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { formatConvertedPrice } from '@/utils/currency';
import { CART_COLORS, SANS_FONT, SERIF_FONT } from './cartTheme';
import {
    CartCustomization,
    getCartItemImageUri,
    getMaterialLabel,
    getSizeLabel,
    getUnitPrice,
    getVariantLabel,
    hasDiscount,
} from './cartUtils';

type Props = {
    item: CartItem;
    isCompact: boolean;
    isSaved: boolean;
    isMovingToWishlist: boolean;
    customization: CartCustomization;
    onDecreaseQty: () => void;
    onIncreaseQty: () => void;
    onRemove: () => void;
    onMoveToWishlist: () => void;
    onOpenProduct: () => void;
    onCustomizationChange: (patch: Partial<CartCustomization>) => void;
};

export default function CartItemCard({
    item,
    isCompact,
    isSaved,
    isMovingToWishlist,
    onDecreaseQty,
    onIncreaseQty,
    onRemove,
    onMoveToWishlist,
    onOpenProduct,
}: Props) {
    const { currency } = useCurrency();
    const unitPrice = useMemo(() => getUnitPrice(item), [item]);
    const discounted = hasDiscount(item);
    const lineTotal = unitPrice * item.quantity;

    return (
        <View className="rounded-[22px] border border-[#E7D7C7] bg-white p-3">
            <View className="flex-row gap-3">
                <Pressable
                    onPress={onOpenProduct}
                    className="h-[104px] w-[104px] overflow-hidden rounded-[18px] border border-[#F0DDCA] bg-[#FBF3EA]"
                >
                    {item.thumbnailImage ? (
                        <Image
                            source={{ uri: getCartItemImageUri(item.thumbnailImage) }}
                            contentFit="cover"
                            style={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <View className="items-center justify-center flex-1">
                            <Feather name="image" size={26} color={CART_COLORS.clay} />
                        </View>
                    )}
                </Pressable>

                <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                        <Pressable onPress={onOpenProduct} className="flex-1">
                            <Text
                                numberOfLines={1}
                                className="text-[19px] text-[#2E221B]"
                                style={{ fontFamily: SERIF_FONT }}
                            >
                                {item.name}
                            </Text>

                            <Text
                                numberOfLines={1}
                                className="mt-1 text-[13px] text-[#7D6B5D]"
                                style={{ fontFamily: SANS_FONT }}
                            >
                                {getVariantLabel(item)}
                            </Text>
                        </Pressable>

                        <TouchableOpacity
                            onPress={onRemove}
                            className="h-8 w-8 items-center justify-center rounded-full bg-[#FFF4ED]"
                        >
                            <Feather name="x" size={16} color={CART_COLORS.mocha} />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-2 flex-row flex-wrap gap-1.5">
                        <View className="rounded-full bg-[#F8EFE6] px-2.5 py-1">
                            <Text className="text-[11px] text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                                {getMaterialLabel(item)}
                            </Text>
                        </View>

                        <View className="rounded-full bg-[#F8EFE6] px-2.5 py-1">
                            <Text className="text-[11px] text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                                {getSizeLabel(item)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-end justify-between gap-3 mt-3">
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-[19px] text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                    {formatConvertedPrice(unitPrice, currency)}
                                </Text>

                                {discounted ? (
                                    <Text className="text-xs text-[#A89686] line-through" style={{ fontFamily: SANS_FONT }}>
                                        {formatConvertedPrice(item.price, currency)}
                                    </Text>
                                ) : null}
                            </View>

                            <Text className="mt-0.5 text-[12px] text-[#9A7A62]" style={{ fontFamily: SANS_FONT }}>
                                Total: {formatConvertedPrice(lineTotal, currency)}
                            </Text>
                        </View>

                        <View className="flex-row items-center rounded-full border border-[#E7D7C7] bg-[#FFF8F2] p-1">
                            <TouchableOpacity
                                onPress={onDecreaseQty}
                                disabled={item.quantity <= 1}
                                className="items-center justify-center w-8 h-8 bg-white rounded-full"
                                style={{ opacity: item.quantity <= 1 ? 0.4 : 1 }}
                            >
                                <Feather name="minus" size={14} color={CART_COLORS.mocha} />
                            </TouchableOpacity>

                            <Text
                                className="min-w-[34px] text-center text-[15px] text-[#2E221B]"
                                style={{ fontFamily: SANS_FONT }}
                            >
                                {item.quantity}
                            </Text>

                            <TouchableOpacity
                                onPress={onIncreaseQty}
                                className="h-8 w-8 items-center justify-center rounded-full bg-[#6B4A36]"
                            >
                                <Feather name="plus" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between border-t border-[#F1E2D5] pt-3">
                <Text numberOfLines={1} className="flex-1 text-[12px] text-[#8A7564]" style={{ fontFamily: SANS_FONT }}>
                    SKU: {item.sku || 'Pending'} · Handmade item
                </Text>

                <TouchableOpacity
                    onPress={onMoveToWishlist}
                    disabled={isMovingToWishlist}
                    className="ml-3 flex-row items-center gap-1.5 rounded-full bg-[#FFF4ED] px-3 py-2"
                    style={{ opacity: isMovingToWishlist ? 0.6 : 1 }}
                >
                    <Feather name="heart" size={14} color={isSaved ? CART_COLORS.danger : CART_COLORS.mocha} />
                    <Text className="text-[12px] text-[#6B4A36]" style={{ fontFamily: SANS_FONT }}>
                        {isSaved ? 'Saved' : 'Wishlist'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}