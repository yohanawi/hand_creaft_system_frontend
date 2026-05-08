import { CartItem } from '@/context/CartContext';
import { WishlistProduct } from '@/context/WishlistContext';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CARD_SHADOW, SANS_FONT, SERIF_FONT } from './cartTheme';
import { CartRecommendation, formatCurrency, getCartItemImageUri } from './cartUtils';

type Props = {
    couponCode: string;
    couponDiscount: number;
    couponLoading: boolean;
    onCouponChange: (value: string) => void;
    onApplyCoupon: () => void;
    onOpenDeals: () => void;
    recommendations: CartRecommendation[];
    onOpenRecommendation: (route: CartRecommendation['route']) => void;
    savedItems: WishlistProduct[];
    onAddSavedToCart: (item: WishlistProduct) => void;
    onRemoveSaved: (productId: string) => void;
    onBrowseWishlist: () => void;
    cartItems: CartItem[];
};

const reviews = [
    {
        quote: 'The finish felt more luxurious in person and the packaging made it gift-ready instantly.',
        name: 'Nethmi P.',
    },
    {
        quote: 'Sizing was accurate, the engraving came out clean, and shipping updates were very clear.',
        name: 'Akeel R.',
    },
];

export default function CartSupportSections({
    couponCode,
    couponDiscount,
    couponLoading,
    onCouponChange,
    onApplyCoupon,
    onOpenDeals,
    recommendations,
    onOpenRecommendation,
    savedItems,
    onAddSavedToCart,
    onRemoveSaved,
    onBrowseWishlist,
    cartItems,
}: Props) {
    return (
        <View className="gap-6">
            <View className="rounded-[30px] border border-[#E7D7C7] bg-white p-5 md:p-6" style={CARD_SHADOW}>
                <View className="mb-4 flex-row flex-wrap items-center justify-between gap-3">
                    <View>
                        <Text className="text-2xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                            Promo Code
                        </Text>
                        <Text className="mt-1 text-sm text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                            Enter coupon code and preview the cart discount before checkout.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onOpenDeals} activeOpacity={0.82}>
                        <Text className="text-sm text-[#A06A4D]" style={{ fontFamily: SANS_FONT }}>
                            Have a deal code?
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-col gap-3 md:flex-row md:items-center">
                    <TextInput
                        value={couponCode}
                        onChangeText={onCouponChange}
                        placeholder="Enter coupon code"
                        placeholderTextColor="#B49E8B"
                        autoCapitalize="characters"
                        className="flex-1 rounded-full border border-[#E7D7C7] bg-[#FCF7F1] px-5 py-4 text-[14px] text-[#2E221B]"
                        style={{ fontFamily: SANS_FONT }}
                    />
                    <TouchableOpacity
                        onPress={onApplyCoupon}
                        disabled={couponLoading}
                        activeOpacity={0.85}
                        className="items-center justify-center rounded-full bg-[#6B4A36] px-6 py-4"
                    >
                        <Text className="text-sm text-white" style={{ fontFamily: SANS_FONT }}>
                            {couponLoading ? 'Applying...' : 'Apply'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {couponDiscount > 0 ? (
                    <View className="mt-4 flex-row items-center gap-3 rounded-[20px] bg-[#F3FBF5] px-4 py-3">
                        <Feather name="tag" size={16} color="#317159" />
                        <Text className="flex-1 text-sm text-[#317159]" style={{ fontFamily: SANS_FONT }}>
                            Discount preview applied: {formatCurrency(couponDiscount)}.
                        </Text>
                    </View>
                ) : null}
            </View>

            <View className="rounded-[30px] border border-[#E7D7C7] bg-white p-5 md:p-6" style={CARD_SHADOW}>
                <Text className="text-2xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                    Customer Reviews
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                    <Feather name="star" size={16} color="#C49742" />
                    <Text className="text-sm text-[#5F4A3C]" style={{ fontFamily: SANS_FONT }}>
                        Rated 4.8/5 by 2,000+ customers
                    </Text>
                </View>

                <View className="mt-4 gap-4 md:flex-row">
                    {reviews.map((review) => (
                        <View key={review.name} className="flex-1 rounded-[24px] bg-[#FBF5EE] p-4">
                            <Text className="mb-4 text-sm leading-7 text-[#5F4A3C]" style={{ fontFamily: SANS_FONT }}>
                                “{review.quote}”
                            </Text>
                            <Text className="text-base text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                {review.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View className="rounded-[30px] border border-[#E7D7C7] bg-white p-5 md:p-6" style={CARD_SHADOW}>
                <View className="mb-4 flex-row items-center justify-between gap-3">
                    <View>
                        <Text className="text-2xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                            You May Also Like
                        </Text>
                        <Text className="mt-1 text-sm text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                            Upsell ideas matched to the pieces already in your cart.
                        </Text>
                    </View>
                    <Text className="text-xs uppercase tracking-[1.8px] text-[#A06A4D]" style={{ fontFamily: SANS_FONT }}>
                        {cartItems.length} curated from cart intent
                    </Text>
                </View>

                <View className="gap-4 md:flex-row">
                    {recommendations.map((card) => (
                        <TouchableOpacity
                            key={card.id}
                            onPress={() => onOpenRecommendation(card.route)}
                            activeOpacity={0.84}
                            className="flex-1 rounded-[24px] border border-[#EEDFD2] bg-[#FFF8F2] p-4"
                        >
                            <Text className="text-xs uppercase tracking-[1.8px] text-[#A06A4D]" style={{ fontFamily: SANS_FONT }}>
                                {card.subtitle}
                            </Text>
                            <Text className="mt-2 text-xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                                {card.title}
                            </Text>
                            <Text className="mt-2 text-sm leading-6 text-[#6D5B4E]" style={{ fontFamily: SANS_FONT }}>
                                {card.description}
                            </Text>
                            <View className="mt-4 flex-row items-center gap-2">
                                <Text className="text-sm text-[#6B4A36]" style={{ fontFamily: SANS_FONT }}>
                                    Explore pairing
                                </Text>
                                <Feather name="arrow-right" size={15} color="#6B4A36" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="rounded-[30px] border border-[#E7D7C7] bg-white p-5 md:p-6" style={CARD_SHADOW}>
                <View className="mb-4 flex-row flex-wrap items-center justify-between gap-3">
                    <View>
                        <Text className="text-2xl text-[#2E221B]" style={{ fontFamily: SERIF_FONT }}>
                            Saved Items
                        </Text>
                        <Text className="mt-1 text-sm text-[#7D6B5D]" style={{ fontFamily: SANS_FONT }}>
                            Keep pieces warm for later without losing them from your journey.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onBrowseWishlist} activeOpacity={0.82}>
                        <Text className="text-sm text-[#A06A4D]" style={{ fontFamily: SANS_FONT }}>
                            Open full wishlist
                        </Text>
                    </TouchableOpacity>
                </View>

                {savedItems.length === 0 ? (
                    <View className="rounded-[22px] bg-[#FBF5EE] px-4 py-5">
                        <Text className="text-sm leading-6 text-[#6D5B4E]" style={{ fontFamily: SANS_FONT }}>
                            No saved pieces yet. Use “Move to Wishlist” on a cart item to create a save-for-later rail.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {savedItems.slice(0, 3).map((item) => {
                            const displayPrice = item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price;

                            return (
                                <View key={item._id} className="gap-4 rounded-[22px] border border-[#EEE2D8] bg-[#FFF8F2] p-4 md:flex-row md:items-center md:justify-between">
                                    <View className="flex-row items-center gap-4">
                                        <View className="h-20 w-20 overflow-hidden rounded-[20px] bg-white">
                                            {item.thumbnailImage ? (
                                                <Image source={{ uri: getCartItemImageUri(item.thumbnailImage) }} style={{ flex: 1 }} contentFit="cover" />
                                            ) : (
                                                <View className="flex-1 items-center justify-center bg-[#F5E8D7]">
                                                    <Feather name="heart" size={18} color="#A06A4D" />
                                                </View>
                                            )}
                                        </View>
                                        <View className="max-w-[480px]">
                                            <Text className="text-lg text-[#2E221B]" style={{ fontFamily: SERIF_FONT }} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <Text className="mt-1 text-sm text-[#6D5B4E]" style={{ fontFamily: SANS_FONT }}>
                                                {formatCurrency(displayPrice)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row flex-wrap gap-3">
                                        <TouchableOpacity onPress={() => onAddSavedToCart(item)} className="rounded-full bg-[#6B4A36] px-4 py-3">
                                            <Text className="text-sm text-white" style={{ fontFamily: SANS_FONT }}>
                                                Add to Cart
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => onRemoveSaved(item._id)} className="rounded-full border border-[#E3CCBD] px-4 py-3">
                                            <Text className="text-sm text-[#2E221B]" style={{ fontFamily: SANS_FONT }}>
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}
