import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { COLORS } from '@/constants/shopTheme';
import type { CategoryOption } from '@/types/shop';

type Props = {
    categories: CategoryOption[];
    selectedCategorySlug: string;
    setSelectedCategorySlug: (slug: string) => void;
    materials: string[];
    selectedMaterials: string[];
    toggleMaterial: (m: string) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    onClear: () => void;
};

export default function FilterPanel({
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    materials,
    selectedMaterials,
    toggleMaterial,
    searchQuery,
    setSearchQuery,
    onClear,
}: Props) {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.content}
        >
            {/* Search */}
            <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search products…"
                    placeholderTextColor={COLORS.mutedLight}
                    style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.clearX}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Categories ── */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={styles.categoryList}>
                {categories.map((cat) => {
                    const active = selectedCategorySlug === cat.slug;
                    return (
                        <TouchableOpacity
                            key={cat.slug}
                            onPress={() => setSelectedCategorySlug(cat.slug)}
                            style={[styles.categoryRow, active && styles.categoryRowActive]}
                        >
                            <View style={[styles.categoryDot, active && styles.categoryDotActive]} />
                            <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                                {cat.label}
                            </Text>
                            {active && <Text style={styles.activeArrow}>›</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Materials ── */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Materials</Text>
            </View>
            {materials.length === 0 ? (
                <Text style={styles.emptyNote}>No materials available</Text>
            ) : (
                <View style={styles.materialGrid}>
                    {materials.map((m) => {
                        const active = selectedMaterials.includes(m);
                        return (
                            <TouchableOpacity
                                key={m}
                                onPress={() => toggleMaterial(m)}
                                style={[styles.materialChip, active && styles.materialChipActive]}
                            >
                                <Text style={[styles.materialChipText, active && styles.materialChipTextActive]}>
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* ── Clear ── */}
            <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 36,
    },
    // Search
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceAlt,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        paddingHorizontal: 14,
        marginBottom: 22,
        ...Platform.select({
            ios: {
                shadowColor: '#3D1A06',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
            },
            android: { elevation: 2 },
        }),
    },
    searchIcon: {
        fontSize: 18,
        color: COLORS.muted,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 14,
        color: COLORS.ink,
    },
    clearX: {
        fontSize: 13,
        color: COLORS.mutedLight,
        paddingLeft: 8,
    },
    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionAccent: {
        width: 3,
        height: 14,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.inkLight,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    // Categories
    categoryList: {
        gap: 4,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
    },
    categoryRowActive: {
        backgroundColor: '#FBF3EC',
        borderColor: COLORS.accent,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.borderLight,
        marginRight: 10,
    },
    categoryDotActive: {
        backgroundColor: COLORS.accent,
    },
    categoryLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.muted,
    },
    categoryLabelActive: {
        color: COLORS.primaryDark,
        fontWeight: '700',
    },
    activeArrow: {
        fontSize: 18,
        color: COLORS.accent,
        lineHeight: 20,
    },
    // Materials
    emptyNote: {
        color: COLORS.mutedLight,
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    materialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    materialChip: {
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 30,
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    materialChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    materialChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.muted,
    },
    materialChipTextActive: {
        color: COLORS.white,
    },
    // Clear button
    clearBtn: {
        marginTop: 24,
        paddingVertical: 13,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        backgroundColor: COLORS.surfaceAlt,
    },
    clearBtnText: {
        color: COLORS.muted,
        fontWeight: '600',
        fontSize: 13,
        letterSpacing: 0.2,
    },
});

