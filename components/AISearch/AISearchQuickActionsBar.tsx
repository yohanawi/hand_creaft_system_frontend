import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS, AI_SEARCH_PANEL_SHADOW } from '@/components/AISearch/aiSearchTheme';

type Props = {
    resultCount: number;
    visualCount: number;
    sortLabel: string;
    activeFilterCount: number;
    aiStatusLabel: string;
    indexedCount: number;
    onRefreshStatus: () => void;
    refreshingStatus: boolean;
    onOpenFilters: () => void;
    onCycleSort: () => void;
};

export default function AISearchQuickActionsBar({
    resultCount,
    visualCount,
    sortLabel,
    activeFilterCount,
    aiStatusLabel,
    indexedCount,
    onRefreshStatus,
    refreshingStatus,
    onOpenFilters,
    onCycleSort,
}: Props) {
    return (
        <View
            className="rounded-[26px] border bg-[#fffaf6] px-4 py-4"
            style={[{ borderColor: AI_SEARCH_COLORS.line }, AI_SEARCH_PANEL_SHADOW]}
        >
            <View className="flex-row flex-wrap items-center justify-between gap-3">
                <View className="flex-row flex-wrap gap-3">
                    {[
                        { label: 'Search results', value: String(resultCount) },
                        { label: 'Visual matches', value: String(visualCount) },
                        { label: 'Active filters', value: String(activeFilterCount) },
                        { label: 'Vision status', value: aiStatusLabel },
                        { label: 'Indexed now', value: String(indexedCount) },
                    ].map((item) => (
                        <View key={item.label} className="rounded-full border px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>{item.label}</Text>
                            <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                <View className="flex-row flex-wrap gap-3">
                    <TouchableOpacity onPress={onRefreshStatus} className="flex-row items-center rounded-full border px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                        <Feather name="refresh-cw" size={15} color={AI_SEARCH_COLORS.espresso} />
                        <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                            {refreshingStatus ? 'Refreshing...' : 'Refresh AI'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onOpenFilters} className="flex-row items-center rounded-full px-4 py-3" style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}>
                        <Feather name="sliders" size={15} color={AI_SEARCH_COLORS.white} />
                        <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Filters</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onCycleSort} className="flex-row items-center rounded-full border px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.card }}>
                        <Feather name="arrow-up-down" size={15} color={AI_SEARCH_COLORS.espresso} />
                        <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>{sortLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}