import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/shopTheme';
import type { CategoryOption } from '@/types/shop';

type Props = {
    categories: CategoryOption[];
    selectedCategorySlug: string;
    onSelect: (slug: string) => void;
};

export default function CategoryChips({ categories, selectedCategorySlug, onSelect }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.content}
        >
            {categories.map((cat) => {
                const active = selectedCategorySlug === cat.slug;
                return (
                    <TouchableOpacity
                        key={cat.slug}
                        onPress={() => onSelect(cat.slug)}
                        style={[styles.chip, active && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {cat.label}
                        </Text>
                        {active && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    content: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        backgroundColor: COLORS.parchment,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        gap: 4,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.muted,
    },
    chipTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.accentLight,
    },
});

