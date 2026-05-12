import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { StarRow } from '@/components/Single-Product/RatingStars';
import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS, PRODUCT_PAGE_SHADOW, PRODUCT_PAGE_SOFT_SHADOW } from '@/components/Single-Product/theme';
import { Product, VariantAttribute, VariantChoice } from '@/components/Single-Product/types';
import { formatCurrency, isLikelyColorValue } from '@/components/Single-Product/utils';

type Props = {
    product: Product;
    isMobile: boolean;
    categoryName: string;
    displaySku: string;
    selectedVariantLabel: string;
    currentPrice: number;
    originalPrice: number;
    discountPct: number;
    currency: string;
    averageRating: number;
    reviewCount: number;
    inStock: boolean;
    availableStock: number;
    etaLabel: string;
    shipsFrom: string;
    hasVariants: boolean;
    sizeOptions: string[];
    colorOptions: string[];
    styleOptions: string[];
    selectedChoice: VariantChoice;
    getOptionState: (attribute: VariantAttribute, value: string) => { exists: boolean; inStock: boolean };
    onSelectVariantOption: (attribute: VariantAttribute, value: string) => void;
    quantity: number;
    onDecreaseQuantity: () => void;
    onIncreaseQuantity: () => void;
    onAddToCart: () => void;
    addingToCart: boolean;
    wished: boolean;
    onToggleWishlist: () => void;
};

type OptionGroupProps = {
    label: string;
    attribute: VariantAttribute;
    values: string[];
    selectedValue: string;
    getOptionState: Props['getOptionState'];
    onSelect: Props['onSelectVariantOption'];
};

function OptionGroup({ label, attribute, values, selectedValue, getOptionState, onSelect }: OptionGroupProps) {
    if (values.length === 0) {
        return null;
    }

    return (
        <View>
            <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', marginBottom: 10 }}>
                {label}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {values.map((value) => {
                    const optionState = getOptionState(attribute, value);
                    const selected = selectedValue === value;
                    const isColor = attribute === 'color' && isLikelyColorValue(value);
                    return (
                        <TouchableOpacity
                            key={value}
                            disabled={!optionState.exists}
                            onPress={() => onSelect(attribute, value)}
                            style={{
                                borderRadius: attribute === 'color' ? 999 : 16,
                                paddingHorizontal: 14,
                                paddingVertical: 11,
                                borderWidth: 1,
                                borderColor: selected ? PRODUCT_PAGE_COLORS.accent : PRODUCT_PAGE_COLORS.line,
                                backgroundColor: selected ? '#F4E7D8' : optionState.exists ? PRODUCT_PAGE_COLORS.white : '#F9FAFB',
                                opacity: optionState.exists ? 1 : 0.45,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {isColor ? (
                                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: value, borderWidth: 1, borderColor: '#D1D5DB' }} />
                            ) : null}
                            <Text style={{ color: selected ? PRODUCT_PAGE_COLORS.accentDeep : PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', textTransform: attribute === 'color' ? 'capitalize' : 'none' }}>
                                {value}
                            </Text>
                            {!optionState.inStock ? (
                                <Feather name="slash" size={14} color={PRODUCT_PAGE_COLORS.muted} />
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function ProductPurchasePanel({
    product,
    isMobile,
    categoryName,
    displaySku,
    selectedVariantLabel,
    currentPrice,
    originalPrice,
    discountPct,
    currency,
    averageRating,
    reviewCount,
    inStock,
    availableStock,
    etaLabel,
    shipsFrom,
    hasVariants,
    sizeOptions,
    colorOptions,
    styleOptions,
    selectedChoice,
    getOptionState,
    onSelectVariantOption,
    quantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onAddToCart,
    addingToCart,
    wished,
    onToggleWishlist,
}: Props) {
    return (
        <View style={{ flex: isMobile ? undefined : 0.96, width: isMobile ? '100%' : undefined }}>
            <View style={{ borderRadius: 32, overflow: 'hidden', backgroundColor: PRODUCT_PAGE_COLORS.surface, ...PRODUCT_PAGE_SHADOW }}>
                <LinearGradient colors={['#FFFDF8', '#F5E7D8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: isMobile ? 20 : 24 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {categoryName ? (
                            <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.84)' }}>
                                <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                    {categoryName}
                                </Text>
                            </View>
                        ) : null}
                        <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: inStock ? PRODUCT_PAGE_COLORS.successSoft : PRODUCT_PAGE_COLORS.dangerSoft }}>
                            <Text style={{ color: inStock ? PRODUCT_PAGE_COLORS.success : PRODUCT_PAGE_COLORS.danger, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                {inStock ? 'Ready to ship' : 'Sold out'}
                            </Text>
                        </View>
                        {product.isFeatured ? (
                            <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#FFF2D6' }}>
                                <Text style={{ color: '#9A6700', fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                    Featured piece
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: isMobile ? 34 : 42, lineHeight: isMobile ? 42 : 52 }}>
                        {product.name}
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 14 }}>
                        <StarRow rating={averageRating} size={16} />
                        <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13 }}>
                            {averageRating.toFixed(1)} rating from {reviewCount} review{reviewCount === 1 ? '' : 's'}
                        </Text>
                    </View>

                    <View style={{ borderRadius: 24, overflow: 'hidden', marginTop: 22, ...PRODUCT_PAGE_SOFT_SHADOW }}>
                        <LinearGradient colors={['#60351F', '#8B5E3C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                                        Current price
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10, marginTop: 6 }}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 34 }}>
                                            {formatCurrency(currentPrice, currency)}
                                        </Text>
                                        {discountPct > 0 ? (
                                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 15, textDecorationLine: 'line-through', marginBottom: 4 }}>
                                                {formatCurrency(originalPrice, currency)}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                                {discountPct > 0 ? (
                                    <View style={{ borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 8 }}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                            Save {discountPct}%
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                            <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 10, lineHeight: 20 }}>
                                Transparent pricing with selection-aware stock, shipping cues, and handcrafted detail upfront.
                            </Text>
                        </LinearGradient>
                    </View>

                    {product.description ? (
                        <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 15, lineHeight: 25, marginTop: 20 }} numberOfLines={4}>
                            {product.description}
                        </Text>
                    ) : null}

                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 22 }}>
                        <View style={{ flex: 1, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.84)', padding: 16, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                Crafted notes
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', marginTop: 6 }}>
                                {selectedVariantLabel || product.material || 'Hand-finished by artisans'}
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 6 }}>
                                {product.material ? `Material: ${product.material}` : 'Each finish is checked before dispatch.'}
                            </Text>
                        </View>
                        <View style={{ flex: 1, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.84)', padding: 16, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                Delivery promise
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', marginTop: 6 }}>
                                {etaLabel}
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 6 }}>
                                {shipsFrom ? `Ships from ${shipsFrom}` : 'Shipping options surface before payment.'}
                            </Text>
                        </View>
                    </View>

                    {hasVariants ? (
                        <View style={{ gap: 16, marginTop: 24 }}>
                            <OptionGroup
                                label="Size"
                                attribute="size"
                                values={sizeOptions}
                                selectedValue={selectedChoice.size}
                                getOptionState={getOptionState}
                                onSelect={onSelectVariantOption}
                            />
                            <OptionGroup
                                label="Color"
                                attribute="color"
                                values={colorOptions}
                                selectedValue={selectedChoice.color}
                                getOptionState={getOptionState}
                                onSelect={onSelectVariantOption}
                            />
                            <OptionGroup
                                label="Style"
                                attribute="style"
                                values={styleOptions}
                                selectedValue={selectedChoice.style}
                                getOptionState={getOptionState}
                                onSelect={onSelectVariantOption}
                            />
                        </View>
                    ) : null}

                    <View style={{ borderRadius: 20, backgroundColor: inStock ? '#ECFDF5' : '#FEF2F2', padding: 16, marginTop: 22 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Feather name={inStock ? 'check-circle' : 'alert-circle'} size={18} color={inStock ? '#15803D' : '#DC2626'} />
                            <Text style={{ color: inStock ? PRODUCT_PAGE_COLORS.success : PRODUCT_PAGE_COLORS.danger, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700' }}>
                                {inStock ? `${availableStock} available for this selection` : 'This selection is currently unavailable'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 22 }}>
                        <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', marginBottom: 10 }}>
                            Quantity
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: PRODUCT_PAGE_COLORS.white, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line, overflow: 'hidden' }}>
                                <TouchableOpacity onPress={onDecreaseQuantity} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Feather name="minus" size={18} color={PRODUCT_PAGE_COLORS.accentDeep} />
                                </TouchableOpacity>
                                <View style={{ minWidth: 60, alignItems: 'center' }}>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 18 }}>
                                        {quantity}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onIncreaseQuantity} disabled={!inStock} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', opacity: inStock ? 1 : 0.5 }}>
                                    <Feather name="plus" size={18} color={PRODUCT_PAGE_COLORS.accentDeep} />
                                </TouchableOpacity>
                            </View>

                            {displaySku ? (
                                <View style={{ flex: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                                        SKU
                                    </Text>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', marginTop: 3 }} numberOfLines={1}>
                                        {displaySku}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 22 }}>
                        <TouchableOpacity onPress={onAddToCart} disabled={!inStock || addingToCart} activeOpacity={0.88} style={{ flex: 1 }}>
                            <LinearGradient
                                colors={inStock ? ['#8B5E3C', '#5B3522'] : ['#D1D5DB', '#9CA3AF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 18,
                                    paddingVertical: 17,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                }}
                            >
                                {addingToCart ? (
                                    <ActivityIndicator size="small" color={PRODUCT_PAGE_COLORS.white} />
                                ) : (
                                    <>
                                        <Feather name="shopping-bag" size={18} color={PRODUCT_PAGE_COLORS.white} />
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 16 }}>
                                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onToggleWishlist}
                            style={{
                                width: isMobile ? '100%' : 58,
                                height: 58,
                                borderRadius: 18,
                                backgroundColor: wished ? '#FEE2E2' : PRODUCT_PAGE_COLORS.white,
                                borderWidth: 1,
                                borderColor: wished ? '#FECACA' : PRODUCT_PAGE_COLORS.line,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Feather name="heart" size={22} color={wished ? '#DC2626' : PRODUCT_PAGE_COLORS.accentDeep} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 22 }}>
                        {[
                            {
                                title: 'Returns',
                                icon: 'rotate-ccw' as const,
                                content: product.policySurfaces?.returnPolicy || '30-day return window for unused items.',
                            },
                            {
                                title: 'Warranty',
                                icon: 'shield' as const,
                                content: product.policySurfaces?.warrantyPolicy || 'Protected by craftsmanship warranty coverage.',
                            },
                            {
                                title: 'Shipping',
                                icon: 'truck' as const,
                                content: product.policySurfaces?.shippingPolicy || 'Tracked delivery options shown before payment.',
                            },
                        ].map((item) => (
                            <View key={item.title} style={{ flex: 1, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line, padding: 14 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <Feather name={item.icon} size={16} color={PRODUCT_PAGE_COLORS.accent} />
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '800' }}>
                                        {item.title}
                                    </Text>
                                </View>
                                <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, lineHeight: 19 }}>
                                    {item.content}
                                </Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}