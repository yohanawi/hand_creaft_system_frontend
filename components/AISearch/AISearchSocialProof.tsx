import React from 'react';
import { Text, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';

type Item = {
    label: string;
    value: string;
};

type Props = {
    metrics: Item[];
};

export default function AISearchSocialProof({ metrics }: Props) {
    return (
        <View className="rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
            <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                Social proof
            </Text>
            <Text className="mt-1 text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                What shoppers are discovering now.
            </Text>

            <View className="mt-5 gap-3">
                {metrics.map((metric) => (
                    <View key={metric.label} className="rounded-[20px] border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>{metric.label}</Text>
                        <Text className="mt-2 text-[28px]" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.heading }}>{metric.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}