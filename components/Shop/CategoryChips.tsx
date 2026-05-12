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
        <View style={styles.rail}>
            <Text className="font-body" style={styles.railLabel}>Browse by category</Text>
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
                            <Text className="font-body" style={[styles.chipText, active && styles.chipTextActive]}>
                                {cat.label}
                            </Text>
                            {active && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    rail: {
        backgroundColor: '#FFFDFC',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingTop: 10,
    },
    railLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
        color: COLORS.muted,
        paddingHorizontal: 14,
        marginBottom: 8,
        fontWeight: '700',
    },
    scroll: {
        backgroundColor: '#FFFDFC',
    },
    content: {
        paddingHorizontal: 14,
        paddingBottom: 12,
        gap: 9,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 9,
        borderRadius: 30,
        backgroundColor: COLORS.parchment,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        gap: 3,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.2,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    chipText: {
        fontSize: 12.5,
        fontWeight: '600',
        color: COLORS.muted,
    },
    chipTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: COLORS.accentLight,
    },
});

