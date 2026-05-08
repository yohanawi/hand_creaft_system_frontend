import { CartItem } from '@/context/CartContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_SHADOW, CART_COLORS, SANS_FONT, SERIF_FONT } from './cartTheme';
import {
    CartCustomization,
    formatCurrency,
    getCartItemImageUri,
    getCustomizationSummary,
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

const DetailPill = ({ label, value }: { label: string; value: string }) => (
    <View className="rounded-full border border-[#E7D7C7] bg-[#FBF5EE] px-3 py-2">
        <Text className="text-[11px] uppercase tracking-[1.4px] text-[#9A7A62]" style={{ fontFamily: SANS_FONT }}>
            {label}
        </Text>
        <Text className="mt-1 text-sm text-[#2E221B]" style={{ fontFamily: SANS_FONT }}>
            {value}
        </Text>
    </View>
);

export default function CartItemCard({
    item,
    isCompact,
    isSaved,
    isMovingToWishlist,
    customization,
    onDecreaseQty,
    onIncreaseQty,
    onRemove,
    onMoveToWishlist,
    onOpenProduct,
    onCustomizationChange,
}: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const unitPrice = useMemo(() => getUnitPrice(item), [item]);
    const discounted = hasDiscount(item);
    const summary = getCustomizationSummary(customization);

    return (
        <View className="overflow-hidden rounded-[30px] border border-[#E7D7C7] bg-white" style={CARD_SHADOW}>
            <View className={`${isCompact ? 'flex-col' : 'flex-row'} w-full`}>
                <Pressable
                    onPress={onOpenProduct}
                    onHoverIn={() => setIsHovered(true)}
                    onHoverOut={() => setIsHovered(false)}
                    onPressIn={() => setIsHovered(true)}
                    onPressOut={() => setIsHovered(false)}
                    className={`${isCompact ? 'h-[220px] w-full border-b' : 'w-[220px] border-r'} items-center justify-center border-[#F2E4D6] bg-[#FCF5EE]`}
                >
                    <View className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1">
                        <Text className="text-[11px] uppercase tracking-[1.5px] text-[#9A7A62]" style={{ fontFamily: SANS_FONT }}>
                            Hover to zoom
                        </Text>
                    </View>
                    <View
                        className="h-36 w-36 overflow-hidden rounded-full border-4 border-[#F1D7B7] bg-white p-2"
                        style={{ transform: [{ scale: isHovered ? 1.07 : 1 }] }}
                    >
                        {item.thumbnailImage ? (
                            <Image
                                source={{ uri: getCartItemImageUri(item.thumbnailImage) }}
                                contentFit="cover"
                                style={{ flex: 1, borderRadius: 999 }}
                            />
                        ) : (
                            <View className="flex-1 items-center justify-center rounded-full bg-[#F5E8D7]">
                                <Feather name="image" size={30} color={CART_COLORS.clay} />
                            </View>
                        )}
                    </View>
                </Pressable>

                <View className="flex-1 px-5 py-5 md:px-6 md:py-6">
                    <View className="mb-4 flex-row items-start justify-between gap-4">
                        <View className="flex-1">
                            <Text className="mb-2 text-2xl text-[#2E221B]" numberOfLines={2} style={{ fontFamily: SERIF_FONT }}>
                                {item.name}
                            </Text>
                            <Text className="text-sm leading-6 text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                                {getVariantLabel(item)}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={onRemove} className="h-10 w-10 items-center justify-center rounded-full border border-[#ECD9CB] bg-[#FFF8F2]">
                            <Feather name="x" size={18} color={CART_COLORS.mocha} />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-5 flex-row flex-wrap gap-2">
                        <DetailPill label="Material" value={getMaterialLabel(item)} />
                        <DetailPill label="Size" value={getSizeLabel(item)} />
                        <DetailPill label="SKU" value={item.sku || 'Atelier SKU pending'} />
                    </View>

                    <View className={`${isCompact ? 'gap-4' : 'mb-5 flex-row items-end justify-between gap-6'}`}>
                        <View>
                            <Text className="mb-1 text-xs uppercase tracking-[1.8px] text-[#9A7A62]" style={{ fontFamily: SANS_FONT }}>
                                Price
                            </Text>
                            <View className="flex-row flex-wrap items-center gap-2">
                                <Text className="text-3xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                    {formatCurrency(unitPrice)}
                                </Text>
                                {discounted ? (
                                    <Text className="text-base text-[#9A8A7A] line-through" style={{ fontFamily: SANS_FONT }}>
                                        {formatCurrency(item.price)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <View className="rounded-[18px] border border-[#E7D7C7] bg-[#FFF8F2] px-2 py-2">
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity
                                    onPress={onDecreaseQty}
                                    disabled={item.quantity <= 1}
                                    className="h-10 w-10 items-center justify-center rounded-full bg-white"
                                    style={{ opacity: item.quantity <= 1 ? 0.35 : 1 }}
                                >
                                    <Feather name="minus" size={16} color={CART_COLORS.mocha} />
                                </TouchableOpacity>
                                <View className="min-w-[42px] items-center">
                                    <Text className="text-lg text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                        {item.quantity}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onIncreaseQty} className="h-10 w-10 items-center justify-center rounded-full bg-[#6B4A36]">
                                    <Feather name="plus" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="rounded-[24px] border border-[#E7D7C7] bg-[#FDF8F3] p-4">
                        <View className="mb-3 flex-row items-center justify-between gap-3">
                            <Text className="text-lg text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                Customization Summary
                            </Text>
                            <TouchableOpacity
                                onPress={onMoveToWishlist}
                                disabled={isMovingToWishlist}
                                className="flex-row items-center gap-2 rounded-full border border-[#EDD7CB] bg-white px-4 py-2"
                                style={{ opacity: isMovingToWishlist ? 0.6 : 1 }}
                            >
                                <Feather name="heart" size={15} color={isSaved ? '#B44848' : CART_COLORS.mocha} />
                                <Text className="text-sm text-[#2E221B]" style={{ fontFamily: SANS_FONT }}>
                                    {isSaved ? 'Saved in Wishlist' : 'Move to Wishlist'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3 flex-row flex-wrap gap-3">
                            <TouchableOpacity
                                onPress={() => onCustomizationChange({ engraving: !customization.engraving })}
                                className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${customization.engraving ? 'bg-[#6B4A36]' : 'border border-[#E7D7C7] bg-white'}`}
                            >
                                <Feather name={customization.engraving ? 'check-circle' : 'circle'} size={15} color={customization.engraving ? '#fff' : CART_COLORS.mocha} />
                                <Text className={`${customization.engraving ? 'text-white' : 'text-[#2E221B]'} text-sm`} style={{ fontFamily: SANS_FONT }}>
                                    Custom engraving: {summary.engravingLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="mb-2 text-xs uppercase tracking-[1.8px] text-[#9A7A62]" style={{ fontFamily: SANS_FONT }}>
                            Special request notes
                        </Text>
                        <TextInput
                            value={customization.notes}
                            onChangeText={(notes) => onCustomizationChange({ notes })}
                            placeholder="Add gifting notes, clasp preferences, engraving text, or production details"
                            placeholderTextColor="#B49E8B"
                            multiline
                            textAlignVertical="top"
                            className="min-h-[92px] rounded-[20px] border border-[#E7D7C7] bg-white px-4 py-3 text-[14px] leading-6 text-[#2E221B]"
                            style={{ fontFamily: SANS_FONT }}
                        />
                        <Text className="mt-3 text-sm leading-6 text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                            Summary: {summary.notesLabel}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
