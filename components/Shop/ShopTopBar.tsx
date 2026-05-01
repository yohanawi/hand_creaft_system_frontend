import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/shopTheme';
import type { ViewMode } from '@/types/shop';

const SORT_OPTIONS = [
    { key: 'featured', label: 'Featured' },
    { key: 'price-asc', label: 'Price ↑' },
    { key: 'price-desc', label: 'Price ↓' },
] as const;

type Props = {
    productCount: number;
    sortBy: string;
    setSortBy: (sort: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isMobile: boolean;
    onOpenFilter: () => void;
};

export default function ShopTopBar({
    productCount,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isMobile,
    onOpenFilter,
}: Props) {
    return (
        <View style={styles.container}>
            {/* Count */}
            <Text style={styles.count}>
                <Text style={styles.countNum}>{productCount}</Text>
                {' '}product{productCount !== 1 ? 's' : ''}
            </Text>

            <View style={styles.controls}>
                {/* Mobile filter button */}
                {isMobile && (
                    <TouchableOpacity onPress={onOpenFilter} style={styles.filterBtn}>
                        <Text style={styles.filterBtnIcon}>⊟</Text>
                        <Text style={styles.filterBtnText}>Filters</Text>
                    </TouchableOpacity>
                )}

                {/* Sort segmented control */}
                <View style={styles.sortControl}>
                    {SORT_OPTIONS.map((opt) => {
                        const active = sortBy === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setSortBy(opt.key)}
                                style={[styles.sortOption, active && styles.sortOptionActive]}
                            >
                                <Text style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Grid / List toggle */}
                {!isMobile && (
                    <View style={styles.viewToggle}>
                        {(['grid', 'list'] as const).map((mode) => {
                            const active = viewMode === mode;
                            return (
                                <TouchableOpacity
                                    key={mode}
                                    onPress={() => setViewMode(mode)}
                                    style={[styles.viewOption, active && styles.viewOptionActive]}
                                >
                                    <Text style={[styles.viewIcon, { color: active ? COLORS.white : COLORS.muted }]}>
                                        {mode === 'grid' ? '⊞' : '☰'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    count: {
        fontSize: 13,
        color: COLORS.mutedLight,
        flex: 1,
    },
    countNum: {
        fontWeight: '800',
        color: COLORS.primary,
        fontSize: 15,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    // Filter button (mobile)
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    filterBtnIcon: {
        fontSize: 14,
        color: COLORS.white,
    },
    filterBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },
    // Sort control
    sortControl: {
        flexDirection: 'row',
        backgroundColor: COLORS.parchment,
        borderRadius: 22,
        padding: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortOption: {
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 18,
    },
    sortOptionActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sortOptionText: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '600',
    },
    sortOptionTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    // View toggle
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.parchment,
        borderRadius: 22,
        padding: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    viewOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 18,
    },
    viewOptionActive: {
        backgroundColor: COLORS.primary,
    },
    viewIcon: {
        fontSize: 14,
        lineHeight: 18,
    },
});

