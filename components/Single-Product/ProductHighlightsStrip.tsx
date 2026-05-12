import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS, PRODUCT_PAGE_SOFT_SHADOW } from '@/components/Single-Product/theme';

type Props = {
    isMobile: boolean;
    categoryName: string;
    etaLabel: string;
    shipsFrom: string;
    inStock: boolean;
    availableStock: number;
    material?: string;
};

export default function ProductHighlightsStrip({ isMobile, categoryName, etaLabel, shipsFrom, inStock, availableStock, material }: Props) {
    const cards = [
        {
            title: 'Artisan identity',
            value: material || categoryName || 'Handcrafted design',
            note: 'Built for a premium handmade storefront presentation.',
            icon: 'award' as const,
            colors: ['#FFF8F0', '#F1E2D3'],
        },
        {
            title: 'Delivery outlook',
            value: etaLabel,
            note: shipsFrom ? `Dispatching from ${shipsFrom}.` : 'Shipping details surface before checkout.',
            icon: 'truck' as const,
            colors: ['#FFFDF8', '#EDE5DA'],
        },
        {
            title: 'Inventory signal',
            value: inStock ? `${availableStock} units ready` : 'Awaiting restock',
            note: inStock ? 'Selection-specific stock is visible before purchase.' : 'Availability updates as variants change.',
            icon: inStock ? 'check-circle' : 'clock' as const,
            colors: inStock ? ['#F2FBF7', '#DFF5E8'] : ['#FFF7ED', '#F9E3D1'],
        },
    ];

    return (
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 14, marginTop: 18, marginBottom: 28 }}>
            {cards.map((card) => (
                <View key={card.title} style={{ flex: 1, borderRadius: 24, overflow: 'hidden', ...PRODUCT_PAGE_SOFT_SHADOW }}>
                    <LinearGradient colors={card.colors as [string, string]} style={{ padding: 18 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Feather name={card.icon} size={18} color={PRODUCT_PAGE_COLORS.accentDeep} />
                        </View>
                        <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                            {card.title}
                        </Text>
                        <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 26, marginTop: 6 }}>
                            {card.value}
                        </Text>
                        <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
                            {card.note}
                        </Text>
                    </LinearGradient>
                </View>
            ))}
        </View>
    );
}