import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import type { AiSuggestion } from '@/components/AISearch/aiSearchUtils';

type Props = {
    suggestions: AiSuggestion[];
    onSelect: (suggestion: AiSuggestion) => void;
};

export default function AISearchSuggestionStrip({ suggestions, onSelect }: Props) {
    if (!suggestions.length) return null;

    return (
        <View className="mt-5 rounded-[24px] border bg-[#fffaf6] px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line }}>
            <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                AI suggestions
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                <View className="flex-row gap-3 pr-4">
                    {suggestions.map((suggestion) => (
                        <TouchableOpacity
                            key={suggestion.id}
                            onPress={() => onSelect(suggestion)}
                            className="rounded-[20px] border px-4 py-3"
                            style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.card }}
                        >
                            <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>
                                {suggestion.label}
                            </Text>
                            <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>
                                {suggestion.hint}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}