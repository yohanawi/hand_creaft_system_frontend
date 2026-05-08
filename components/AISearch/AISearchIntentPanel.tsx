import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import type { AiIntent } from '@/components/AISearch/aiSearchUtils';

type Props = {
    intent: AiIntent;
    imageUsed: boolean;
};

export default function AISearchIntentPanel({ intent, imageUsed }: Props) {
    const chips = [intent.style, intent.material, intent.category, intent.occasion, intent.budget].filter(Boolean);

    return (
        <View className="rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
            <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: '#f3e6da' }}>
                    <Feather name={imageUsed ? 'image' : 'cpu'} size={18} color={AI_SEARCH_COLORS.espresso} />
                </View>
                <View className="flex-1">
                    <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                        Search intent understanding
                    </Text>
                    <Text className="mt-1 text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                        {intent.headline}
                    </Text>
                </View>
            </View>

            <Text className="mt-4 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                {intent.explanation}
            </Text>

            {chips.length ? (
                <View className="mt-4 flex-row flex-wrap gap-3">
                    {chips.map((chip) => (
                        <View key={chip} className="rounded-full border px-4 py-2" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f7efe7' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>{chip}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
}