import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/shopTheme';
import type { ViewMode } from '@/types/shop';

const SORT_OPTIONS = [
    { key: 'featured', label: 'Curated' },
    { key: 'price-asc', label: 'Price Low' },
    { key: 'price-desc', label: 'Price High' },
] as const;

type Props = {
    productCount: number;
    sortBy: string;
    setSortBy: (sort: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isMobile: boolean;
    onOpenFilter: () => void;
    activeFilterCount?: number;
};

export default function ShopTopBar({
    productCount,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isMobile,
    onOpenFilter,
    activeFilterCount = 0,
}: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.countWrap}>
                <Text className="font-body" style={styles.countEyebrow}>Live Results</Text>
                <Text style={styles.count}>
                    <Text className="font-heading" style={styles.countNum}>{productCount}</Text>
                    <Text className="font-body" style={styles.countLabel}> product{productCount !== 1 ? 's' : ''}</Text>
                </Text>
            </View>

            <View style={styles.controls}>
                {isMobile && (
                    <TouchableOpacity onPress={onOpenFilter} style={styles.filterBtn}>
                        <LinearGradient
                            colors={['#4E2D0E', '#7C4A1E', '#B5743F']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.filterBtnGrad}
                        >
                            <Text className="font-body" style={styles.filterBtnIcon}>⊟</Text>
                            <Text className="font-body" style={styles.filterBtnText}>Filters</Text>
                            {activeFilterCount > 0 && (
                                <View style={styles.filterCountBadge}>
                                    <Text className="font-body" style={styles.filterCountText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <View style={styles.sortControl}>
                    {SORT_OPTIONS.map((opt) => {
                        const active = sortBy === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setSortBy(opt.key)}
                                style={[styles.sortOption, active && styles.sortOptionActive]}
                            >
                                <Text className="font-body" style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

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
                                    <Text className="font-body" style={[styles.viewIcon, { color: active ? COLORS.white : COLORS.muted }]}>
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
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    countWrap: {
        gap: 2,
    },
    countEyebrow: {
        color: COLORS.muted,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    count: {
        color: COLORS.mutedLight,
    },
    countNum: {
        fontSize: 21,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: -0.4,
    },
    countLabel: {
        fontSize: 14,
        color: COLORS.muted,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterBtn: {
        borderRadius: 999,
        overflow: 'hidden',
    },
    filterBtnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
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
    filterCountBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 5,
    },
    filterCountText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '800',
    },
    sortControl: {
        flexDirection: 'row',
        backgroundColor: COLORS.parchment,
        borderRadius: 999,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortOption: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
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
        fontSize: 11.5,
        color: COLORS.muted,
        fontWeight: '700',
    },
    sortOptionTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.parchment,
        borderRadius: 999,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    viewOption: {
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 999,
    },
    viewOptionActive: {
        backgroundColor: COLORS.primary,
    },
    viewIcon: {
        fontSize: 13,
        lineHeight: 18,
    },
});

