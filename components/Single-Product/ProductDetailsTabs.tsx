import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS, PRODUCT_PAGE_SHADOW } from '@/components/Single-Product/theme';
import { Product, ProductTab } from '@/components/Single-Product/types';
import { isLikelyColorValue } from '@/components/Single-Product/utils';

type Props = {
    activeTab: ProductTab;
    onChangeTab: (tab: ProductTab) => void;
    product: Product;
    categoryName: string;
    displaySku: string;
    selectedVariantLabel: string;
    availableStock: number;
    inStock: boolean;
    etaLabel: string;
    shipsFrom: string;
    reviewCount: number;
    reviewsContent: ReactNode;
};

const tabs: ProductTab[] = ['description', 'details', 'reviews'];

export default function ProductDetailsTabs({
    activeTab,
    onChangeTab,
    product,
    categoryName,
    displaySku,
    selectedVariantLabel,
    availableStock,
    inStock,
    etaLabel,
    shipsFrom,
    reviewCount,
    reviewsContent,
}: Props) {
    return (
        <View style={{ borderRadius: 32, overflow: 'hidden', backgroundColor: PRODUCT_PAGE_COLORS.surface, ...PRODUCT_PAGE_SHADOW }}>
            <LinearGradient colors={['#FFFDF9', '#F6EBDE']} style={{ padding: 24 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
                    {tabs.map((tab) => {
                        const active = tab === activeTab;
                        return (
                            <TouchableOpacity key={tab} onPress={() => onChangeTab(tab)}>
                                <View style={{
                                    borderRadius: 999,
                                    paddingHorizontal: 18,
                                    paddingVertical: 11,
                                    backgroundColor: active ? PRODUCT_PAGE_COLORS.accentDeep : 'rgba(255,255,255,0.8)',
                                    borderWidth: 1,
                                    borderColor: active ? PRODUCT_PAGE_COLORS.accentDeep : PRODUCT_PAGE_COLORS.line,
                                }}>
                                    <Text style={{ color: active ? PRODUCT_PAGE_COLORS.white : PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', textTransform: 'capitalize' }}>
                                        {tab === 'reviews' ? `Reviews (${reviewCount})` : tab}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {activeTab === 'description' ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                        <View style={{ flex: 2, minWidth: 260 }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 32 }}>
                                Product Story
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 15, lineHeight: 27, marginTop: 12 }}>
                                {product.description || 'No description available for this product.'}
                            </Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 260, gap: 12 }}>
                            {[
                                { icon: 'layers' as const, title: 'Material', value: product.material || 'Crafted to product specifications' },
                                { icon: 'droplet' as const, title: 'Base color', value: product.color || 'Selection-based finish' },
                                { icon: 'tag' as const, title: 'Collection', value: categoryName || 'Handcrafted catalog' },
                            ].map((item) => (
                                <View key={item.title} style={{ borderRadius: 18, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line, backgroundColor: 'rgba(255,255,255,0.8)', padding: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: PRODUCT_PAGE_COLORS.surfaceStrong, alignItems: 'center', justifyContent: 'center' }}>
                                            <Feather name={item.icon} size={16} color={PRODUCT_PAGE_COLORS.accentDeep} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                                                {item.title}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                {item.title === 'Base color' && isLikelyColorValue(product.color) ? (
                                                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: product.color, borderWidth: 1, borderColor: '#D1D5DB' }} />
                                                ) : null}
                                                <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', flex: 1 }}>
                                                    {item.value}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {activeTab === 'details' ? (
                    <View>
                        {[
                            { label: 'SKU', value: displaySku },
                            { label: 'Category', value: categoryName },
                            { label: 'Selected variant', value: selectedVariantLabel },
                            { label: 'Stock for selection', value: String(availableStock) },
                            { label: 'Material', value: product.material },
                            { label: 'Weight', value: product.weight ? String(product.weight) : '' },
                            { label: 'Delivery ETA', value: etaLabel },
                            { label: 'Ships from', value: shipsFrom },
                            { label: 'Availability', value: inStock ? 'in stock' : 'out of stock' },
                        ].filter((row) => Boolean(row.value)).map((row) => (
                            <View key={row.label} style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: PRODUCT_PAGE_COLORS.line }}>
                                <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, width: 180, marginRight: 20, textTransform: 'capitalize' }}>
                                    {row.label}
                                </Text>
                                <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', flex: 1, textTransform: row.label === 'SKU' ? 'none' : 'capitalize' }}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {activeTab === 'reviews' ? reviewsContent : null}
            </LinearGradient>
        </View>
    );
}