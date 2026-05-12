import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS } from '@/components/Single-Product/theme';

export function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                    key={star}
                    name="star"
                    size={size}
                    color={star <= Math.round(rating) ? PRODUCT_PAGE_COLORS.gold : '#E5E7EB'}
                />
            ))}
        </View>
    );
}

export function StarPicker({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const selected = star <= value;
                return (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: selected ? '#FFF4DD' : PRODUCT_PAGE_COLORS.white,
                            borderWidth: 1,
                            borderColor: selected ? '#F7D087' : PRODUCT_PAGE_COLORS.line,
                        }}
                    >
                        <Feather
                            name="star"
                            size={20}
                            color={selected ? PRODUCT_PAGE_COLORS.gold : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                );
            })}
            <View style={{ justifyContent: 'center' }}>
                <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 12 }}>
                    {value} of 5
                </Text>
            </View>
        </View>
    );
}