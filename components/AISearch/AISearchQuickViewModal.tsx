import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import {
    getAiSearchCategoryName,
    getAiSearchPrice,
    getAiSearchProductImage,
    getAiSearchRating,
    getAiSearchReviewCount,
    inferAiSearchOccasion,
    inferAiSearchStyle,
    isAiSearchInStock,
    type AiSearchProduct,
} from '@/components/AISearch/aiSearchUtils';

type Props = {
    visible: boolean;
    product: AiSearchProduct | null;
    onClose: () => void;
    onAddToCart: () => void;
    onOpenProduct: () => void;
};

export default function AISearchQuickViewModal({ visible, product, onClose, onAddToCart, onOpenProduct }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/35 px-4 py-8">
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

                <View className="max-h-[82%] overflow-hidden rounded-[30px] border bg-[#fffdfb]" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                    {product ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="h-[280px]">
                                <Image source={{ uri: getAiSearchProductImage(product) }} className="h-full w-full" resizeMode="cover" />
                                <TouchableOpacity onPress={onClose} className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/90">
                                    <Feather name="x" size={16} color={AI_SEARCH_COLORS.ink} />
                                </TouchableOpacity>
                            </View>

                            <View className="p-5">
                                <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    {getAiSearchCategoryName(product)}
                                </Text>
                                <Text className="mt-2 text-[30px] leading-[38px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    {product.name}
                                </Text>
                                <Text className="mt-3 text-[18px]" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    {getAiSearchPrice(product)}
                                </Text>

                                <View className="mt-4 flex-row flex-wrap gap-3">
                                    {[`Style: ${inferAiSearchStyle(product)}`, `Occasion: ${inferAiSearchOccasion(product)}`, product.material ? `Material: ${product.material}` : null, isAiSearchInStock(product) ? 'Ready to ship' : 'Currently unavailable']
                                        .filter(Boolean)
                                        .map((item) => (
                                            <View key={item} className="rounded-full border px-4 py-2" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}>
                                                <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>{item}</Text>
                                            </View>
                                        ))}
                                </View>

                                <Text className="mt-5 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                    {product.description || 'A refined handcrafted piece selected by the AI concierge for its silhouette, material story, and styling fit.'}
                                </Text>

                                <View className="mt-5 rounded-[22px] border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fff7f0' }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                                        {getAiSearchRating(product).toFixed(1)} / 5 rating
                                    </Text>
                                    <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                        Based on {getAiSearchReviewCount(product)} verified interactions and saves.
                                    </Text>
                                </View>

                                <View className="mt-6 flex-row gap-3">
                                    <TouchableOpacity onPress={onAddToCart} className="flex-1 rounded-full px-4 py-4" style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}>
                                        <Text className="text-center" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Add to cart</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onOpenProduct} className="rounded-full border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                        <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Full details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
                </View>

                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
            </View>
        </Modal>
    );
}