import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import useCategoryLayout from './useCategoryLayout';

type Props = {
    categoryCount: number;
    subcategoryCount: number;
};

export default function CategorySectionIntro({ categoryCount, subcategoryCount }: Props) {
    const { isCompact } = useCategoryLayout();

    return (
        <View
            style={{
                borderRadius: 30,
                borderWidth: 1,
                borderColor: '#E9D8C8',
                backgroundColor: '#FFF8F1',
                paddingHorizontal: isCompact ? 20 : 28,
                paddingVertical: isCompact ? 22 : 26,
                gap: 18,
                flexDirection: isCompact ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isCompact ? 'flex-start' : 'center',
            }}
        >
            <View style={{ flex: 1, maxWidth: 720 }}>
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, backgroundColor: '#F4E5D6', paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Feather name="grid" size={13} color={BROWN.DarkColor} />
                    <Text style={{ color: BROWN.DarkColor, fontFamily: BRAND_FONTS.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.3 }}>
                        ALL CATEGORIES
                    </Text>
                </View>

                <Text
                    style={{
                        marginTop: 16,
                        color: BROWN.TextPrimary,
                        fontFamily: BRAND_FONTS.heading,
                        fontSize: isCompact ? 28 : 36,
                        lineHeight: isCompact ? 34 : 42,
                    }}
                >
                    A curated map of handmade collections.
                </Text>

                <Text
                    style={{
                        marginTop: 10,
                        color: BROWN.TextSecondary,
                        fontFamily: BRAND_FONTS.body,
                        fontSize: 14,
                        lineHeight: 24,
                        maxWidth: 660,
                    }}
                >
                    Each collection is organized to help shoppers move from broad discovery into the exact craft style they want, without losing the warmth of the brand.
                </Text>
            </View>

            <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, width: isCompact ? '100%' : undefined }}>
                {[
                    { label: 'Active categories', value: String(categoryCount || 0), icon: 'layers' as const },
                    { label: 'Visible subcollections', value: String(subcategoryCount || 0), icon: 'tag' as const },
                ].map((item) => (
                    <View
                        key={item.label}
                        style={{
                            minWidth: isCompact ? undefined : 180,
                            flex: isCompact ? 1 : undefined,
                            borderRadius: 22,
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#EAD7C4',
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#F8EBDD', alignItems: 'center', justifyContent: 'center' }}>
                                <Feather name={item.icon} size={17} color={BROWN.DarkColor} />
                            </View>
                            <View>
                                <Text style={{ color: BROWN.DarkColor, fontFamily: BRAND_FONTS.heading, fontSize: 24 }}>
                                    {item.value}
                                </Text>
                                <Text style={{ color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 12 }}>
                                    {item.label}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}