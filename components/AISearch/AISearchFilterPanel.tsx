import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import { AI_OCCASION_OPTIONS, AI_PRICE_OPTIONS, AI_STYLE_OPTIONS, type AiFilterState } from '@/components/AISearch/aiSearchUtils';

type Props = {
    filters: AiFilterState;
    materialOptions: string[];
    onToggleMaterial: (value: string) => void;
    onToggleStyle: (value: string) => void;
    onToggleOccasion: (value: string) => void;
    onSetPriceRange: (value: string) => void;
    onToggleInStock: () => void;
    onToggleDiscounted: () => void;
    onReset: () => void;
};

type ChipProps = {
    label: string;
    active: boolean;
    onPress: () => void;
};

function FilterChip({ label, active, onPress }: ChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-full border px-4 py-2"
            style={{
                borderColor: active ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line,
                backgroundColor: active ? '#f2dfd1' : AI_SEARCH_COLORS.card,
            }}
        >
            <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function AISearchFilterPanel({
    filters,
    materialOptions,
    onToggleMaterial,
    onToggleStyle,
    onToggleOccasion,
    onSetPriceRange,
    onToggleInStock,
    onToggleDiscounted,
    onReset,
}: Props) {
    return (
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[540px]">
            <View className="rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                            Smart filters
                        </Text>
                        <Text className="mt-1 text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            AI powered refinement
                        </Text>
                    </View>

                    <TouchableOpacity onPress={onReset} className="rounded-full border px-4 py-2" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                        <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-5">
                    <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Budget</Text>
                    <View className="mt-3 flex-row flex-wrap gap-3">
                        {AI_PRICE_OPTIONS.map((option) => (
                            <FilterChip
                                key={option.id}
                                label={option.label}
                                active={filters.priceRange === option.id}
                                onPress={() => onSetPriceRange(option.id)}
                            />
                        ))}
                    </View>
                </View>

                <View className="mt-5">
                    <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Material</Text>
                    <View className="mt-3 flex-row flex-wrap gap-3">
                        {materialOptions.map((material) => (
                            <FilterChip
                                key={material}
                                label={material}
                                active={filters.materials.includes(material)}
                                onPress={() => onToggleMaterial(material)}
                            />
                        ))}
                    </View>
                </View>

                <View className="mt-5">
                    <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Style</Text>
                    <View className="mt-3 flex-row flex-wrap gap-3">
                        {AI_STYLE_OPTIONS.map((style) => (
                            <FilterChip
                                key={style}
                                label={style}
                                active={filters.styles.includes(style)}
                                onPress={() => onToggleStyle(style)}
                            />
                        ))}
                    </View>
                </View>

                <View className="mt-5">
                    <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Occasion</Text>
                    <View className="mt-3 flex-row flex-wrap gap-3">
                        {AI_OCCASION_OPTIONS.map((occasion) => (
                            <FilterChip
                                key={occasion}
                                label={occasion}
                                active={filters.occasions.includes(occasion)}
                                onPress={() => onToggleOccasion(occasion)}
                            />
                        ))}
                    </View>
                </View>

                <View className="mt-6 rounded-[20px] border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8f0e8' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Only show ready-to-ship pieces</Text>
                            <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>Keep the catalog focused on in-stock matches.</Text>
                        </View>
                        <Switch value={filters.onlyInStock} onValueChange={onToggleInStock} trackColor={{ false: '#ddd1c6', true: '#8b5a3e' }} thumbColor="#fff" />
                    </View>

                    <View className="mt-4 flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Highlight best-value edits</Text>
                            <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>Prioritize discounted pieces with strong reviews.</Text>
                        </View>
                        <Switch value={filters.onlyDiscounted} onValueChange={onToggleDiscounted} trackColor={{ false: '#ddd1c6', true: '#8b5a3e' }} thumbColor="#fff" />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}