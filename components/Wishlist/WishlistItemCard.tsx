import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { WISHLIST_CARD_SHADOW, WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';
import {
    getWishlistBadge,
    getWishlistCategoryName,
    getWishlistDiscountPercent,
    getWishlistDisplayPrice,
    getWishlistImageUri,
    getWishlistMaterial,
    getWishlistShortDescription,
    getWishlistSizeOptions,
    getWishlistStockLabel,
    hasWishlistDiscount,
    isWishlistItemInStock,
    WishlistDetailProduct,
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

const AlertChip = ({
    icon,
    label,
    active,
    onPress,
}: {
    icon: React.ComponentProps<typeof Feather>['name'];
    label: string;
    active: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${active ? 'bg-[#4A2E24]' : 'border border-[#EADBCB] bg-[#FFF8F1]'}`}
    >
        <Feather name={icon} size={14} color={active ? '#FFFFFF' : '#6F4A3B'} />
        <Text className={`text-[12px] ${active ? 'text-white' : 'text-[#6F4A3B]'}`} style={{ fontFamily: WISHLIST_SANS }}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default function WishlistItemCard({
    product,
    width,
    isAdding,
    priceDropEnabled,
    backInStockEnabled,
    onAddToCart,
    onRemove,
    onQuickView,
    onOpenProduct,
    onTogglePriceDrop,
    onToggleBackInStock,
}: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const imageUri = getWishlistImageUri(product);
    const discounted = hasWishlistDiscount(product);
    const inStock = isWishlistItemInStock(product);
    const stockLabel = getWishlistStockLabel(product);
    const sizeOptions = getWishlistSizeOptions(product).slice(0, 3).join('  ·  ');
    const badge = getWishlistBadge(product);
    const discountPercent = getWishlistDiscountPercent(product);
    const showAlertFire = inStock && Number(product.quantity ?? 0) <= 3;

    return (
        <View className="overflow-hidden rounded-[30px] border border-[#EADBCB] bg-white" style={[WISHLIST_CARD_SHADOW, { width }]}>
            <Pressable
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPress={onOpenProduct}
                className="relative h-[280px] overflow-hidden bg-[#FAF1E7]"
            >
                {imageUri ? (
                    <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: '100%', height: '100%' }} transition={250} />
                ) : (
                    <View className="h-full items-center justify-center">
                        <Feather name="image" size={34} color="#B88258" />
                    </View>
                )}

                <View className="absolute left-4 top-4 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-[#4A2E24] px-3 py-2">
                        <Text className="text-[11px] uppercase tracking-[1.6px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                            {badge}
                        </Text>
                    </View>
                    {discounted ? (
                        <View className="rounded-full bg-[#B44848] px-3 py-2">
                            <Text className="text-[11px] uppercase tracking-[1.6px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                {discountPercent}% off
                            </Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    onPress={onRemove}
                    activeOpacity={0.85}
                    className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/90"
                >
                    <Feather name="x" size={18} color="#6F4A3B" />
                </TouchableOpacity>

                <View className="absolute bottom-0 left-0 right-0 bg-[#271C18]/70 px-5 py-4">
                    <Text className="mb-1 text-[12px] uppercase tracking-[2px] text-[#F3E2C6]" style={{ fontFamily: WISHLIST_SANS }}>
                        {getWishlistMaterial(product)}
                    </Text>
                    <Text className="text-sm leading-6 text-white" numberOfLines={isHovered ? 3 : 2} style={{ fontFamily: WISHLIST_SANS }}>
                        {getWishlistShortDescription(product)}
                    </Text>
                    {isHovered ? (
                        <Text className="mt-2 text-[12px] text-[#F4E8D8]" style={{ fontFamily: WISHLIST_SANS }}>
                            Sizes: {sizeOptions}
                        </Text>
                    ) : null}
                </View>
            </Pressable>

            <View className="p-5">
                <View className="mb-3 flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                        <Text className="mb-1 text-[12px] uppercase tracking-[2px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                            {getWishlistCategoryName(product) || 'Jewelry'}
                        </Text>
                        <Text className="text-[24px] leading-[30px] text-[#271C18]" numberOfLines={2} style={{ fontFamily: WISHLIST_SERIF }}>
                            {product.name}
                        </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-[24px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SERIF }}>
                            ${getWishlistDisplayPrice(product).toFixed(2)}
                        </Text>
                        {discounted ? (
                            <Text className="text-[13px] text-[#9F8D7E] line-through" style={{ fontFamily: WISHLIST_SANS }}>
                                ${Number(product.price || 0).toFixed(2)}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <View className="mb-4 flex-row flex-wrap items-center gap-2">
                    <View className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${showAlertFire ? 'bg-[#FFF1E5]' : 'bg-[#F8F2EC]'}`}>
                        <Feather name={showAlertFire ? 'zap' : 'package'} size={14} color={showAlertFire ? '#D97706' : '#6F4A3B'} />
                        <Text className={`text-[12px] ${showAlertFire ? 'text-[#D97706]' : 'text-[#6F4A3B]'}`} style={{ fontFamily: WISHLIST_SANS }}>
                            {stockLabel}
                        </Text>
                    </View>
                    <View className="rounded-full bg-[#FBF3E9] px-3 py-2">
                        <Text className="text-[12px] text-[#6F4A3B]" style={{ fontFamily: WISHLIST_SANS }}>
                            {sizeOptions}
                        </Text>
                    </View>
                </View>

                <View className="mb-3 flex-row gap-3">
                    <TouchableOpacity
                        onPress={onAddToCart}
                        disabled={!inStock || isAdding}
                        activeOpacity={0.85}
                        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full px-4 py-4 ${inStock ? 'bg-[#4A2E24]' : 'bg-[#D9CEC2]'}`}
                    >
                        <Feather name="shopping-bag" size={16} color="#FFFFFF" />
                        <Text className="text-sm text-white" style={{ fontFamily: WISHLIST_SANS }}>
                            {isAdding ? 'Adding...' : inStock ? 'Add to Cart' : 'Notify Me'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onQuickView}
                        activeOpacity={0.85}
                        className="h-[54px] w-[54px] items-center justify-center rounded-full border border-[#EADBCB] bg-[#FFF8F1]"
                    >
                        <Feather name="eye" size={18} color="#4A2E24" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    <AlertChip icon="bell" label="Price drop" active={priceDropEnabled} onPress={onTogglePriceDrop} />
                    <AlertChip icon="clock" label="Back in stock" active={backInStockEnabled} onPress={onToggleBackInStock} />
                </View>
            </View>
        </View>
    );
}
