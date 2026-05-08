import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { WISHLIST_SANS, WISHLIST_SERIF } from './wishlistTheme';
import {
    getWishlistCategoryName,
    getWishlistDisplayPrice,
    getWishlistImageUri,
    getWishlistMaterial,
    getWishlistShortDescription,
    getWishlistSizeOptions,
    getWishlistStockLabel,
    hasWishlistDiscount,
    WishlistDetailProduct,
} from './wishlistUtils';

type Props = {
    visible: boolean;
    product: WishlistDetailProduct | null;
    loading: boolean;
    isAdding: boolean;
    onClose: () => void;
    onAddToCart: () => void;
    onOpenProduct: () => void;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View className="rounded-[22px] border border-[#EADBCB] bg-[#FFF8F1] px-4 py-3">
        <Text className="text-[11px] uppercase tracking-[1.8px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
            {label}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-[#271C18]" style={{ fontFamily: WISHLIST_SANS }}>
            {value}
        </Text>
    </View>
);

export default function WishlistQuickViewModal({
    visible,
    product,
    loading,
    isAdding,
    onClose,
    onAddToCart,
    onOpenProduct,
}: Props) {
    const { width } = useWindowDimensions();
    const imageUri = getWishlistImageUri(product);
    const sizes = getWishlistSizeOptions(product).join(', ');
    const discounted = hasWishlistDiscount(product);
    const isCompact = width < 860;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-[#1D120F]/60 px-4 py-8 md:px-8 md:py-12">
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View className="mx-auto my-auto max-h-full w-full max-w-4xl overflow-hidden rounded-[34px] border border-[#EADBCB] bg-[#FFFDFC]">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                        <View className="mb-5 flex-row items-start justify-between gap-4">
                            <View className="flex-1">
                                <Text className="mb-2 text-[12px] uppercase tracking-[2px] text-[#9A6D4D]" style={{ fontFamily: WISHLIST_SANS }}>
                                    Quick view
                                </Text>
                                <Text className="text-[30px] leading-[36px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                                    {product?.name || 'Loading piece'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="h-11 w-11 items-center justify-center rounded-full border border-[#EADBCB] bg-[#FFF8F1]">
                                <Feather name="x" size={18} color="#4A2E24" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#4A2E24" />
                                <Text className="mt-4 text-[15px] text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                                    Loading product details...
                                </Text>
                            </View>
                        ) : product ? (
                            <View style={{ gap: 20, flexDirection: isCompact ? 'column' : 'row' }}>
                                <View className="overflow-hidden rounded-[28px] border border-[#EADBCB] bg-[#FAF1E7]" style={{ width: isCompact ? '100%' : '44%' }}>
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: '100%', height: 360 }} transition={250} />
                                    ) : (
                                        <View className="h-[360px] items-center justify-center">
                                            <Feather name="image" size={34} color="#B88258" />
                                        </View>
                                    )}
                                </View>

                                <View className="flex-1 gap-4">
                                    <View className="rounded-[28px] border border-[#EADBCB] bg-[#FFF8F1] p-5">
                                        <View className="mb-3 flex-row flex-wrap items-center gap-2">
                                            <View className="rounded-full bg-[#4A2E24] px-3 py-2">
                                                <Text className="text-[11px] uppercase tracking-[1.6px] text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                                    {getWishlistCategoryName(product) || 'Jewelry'}
                                                </Text>
                                            </View>
                                            <View className="rounded-full bg-[#F3E2C6] px-3 py-2">
                                                <Text className="text-[11px] uppercase tracking-[1.6px] text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                                    {getWishlistStockLabel(product)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mb-4 flex-row items-end gap-3">
                                            <Text className="text-[30px] text-[#271C18]" style={{ fontFamily: WISHLIST_SERIF }}>
                                                ${getWishlistDisplayPrice(product).toFixed(2)}
                                            </Text>
                                            {discounted ? (
                                                <Text className="pb-1 text-[15px] text-[#9F8D7E] line-through" style={{ fontFamily: WISHLIST_SANS }}>
                                                    ${Number(product.price || 0).toFixed(2)}
                                                </Text>
                                            ) : null}
                                        </View>

                                        <Text className="text-[15px] leading-7 text-[#7A685B]" style={{ fontFamily: WISHLIST_SANS }}>
                                            {getWishlistShortDescription(product)}
                                        </Text>
                                    </View>

                                    <View style={{ gap: 12, flexDirection: isCompact ? 'column' : 'row', flexWrap: 'wrap' }}>
                                        <View style={{ width: isCompact ? '100%' : '48%' }}>
                                            <DetailRow label="Material" value={getWishlistMaterial(product)} />
                                        </View>
                                        <View style={{ width: isCompact ? '100%' : '48%' }}>
                                            <DetailRow label="Size options" value={sizes} />
                                        </View>
                                        <View style={{ width: isCompact ? '100%' : '48%' }}>
                                            <DetailRow label="SKU" value={product.sku || 'Atelier reference on request'} />
                                        </View>
                                        <View style={{ width: isCompact ? '100%' : '48%' }}>
                                            <DetailRow label="Stock status" value={getWishlistStockLabel(product)} />
                                        </View>
                                    </View>

                                    <View className="flex-row flex-wrap gap-3">
                                        <TouchableOpacity
                                            onPress={onAddToCart}
                                            activeOpacity={0.85}
                                            className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#4A2E24] px-5 py-4"
                                        >
                                            <Feather name="shopping-bag" size={16} color="#FFFFFF" />
                                            <Text className="text-sm text-white" style={{ fontFamily: WISHLIST_SANS }}>
                                                {isAdding ? 'Adding...' : 'Add to Cart'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={onOpenProduct}
                                            activeOpacity={0.85}
                                            className="flex-row items-center justify-center gap-2 rounded-full border border-[#EADBCB] bg-[#FFF8F1] px-5 py-4"
                                        >
                                            <Feather name="external-link" size={16} color="#4A2E24" />
                                            <Text className="text-sm text-[#4A2E24]" style={{ fontFamily: WISHLIST_SANS }}>
                                                View full product
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
