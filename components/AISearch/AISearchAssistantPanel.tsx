import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';

type Props = {
    prompt: string;
    onChangePrompt: (value: string) => void;
    onSend: () => void;
    response: string;
    promptChips: string[];
    onSelectPrompt: (value: string) => void;
};

export default function AISearchAssistantPanel({
    prompt,
    onChangePrompt,
    onSend,
    response,
    promptChips,
    onSelectPrompt,
}: Props) {
    return (
        <View className="rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
            <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: '#f2dfd1' }}>
                    <Feather name="message-circle" size={18} color={AI_SEARCH_COLORS.espresso} />
                </View>
                <View className="flex-1">
                    <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                        AI assistant chat
                    </Text>
                    <Text className="mt-1 text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                        Refine the brief conversationally.
                    </Text>
                </View>
            </View>

            <Text className="mt-4 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                Ask for gifting ideas, a certain finish, or a piece that suits a specific event. The assistant will translate that into search and filter cues.
            </Text>

            <View className="mt-4 flex-row flex-wrap gap-3">
                {promptChips.map((chip) => (
                    <TouchableOpacity key={chip} onPress={() => onSelectPrompt(chip)} className="rounded-full border px-4 py-2" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}>
                        <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>{chip}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="mt-5 rounded-[22px] border bg-[#fff7f0] px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                <TextInput
                    value={prompt}
                    onChangeText={onChangePrompt}
                    placeholder="Ask the assistant to narrow the edit"
                    placeholderTextColor="#9d8a7e"
                    multiline
                    className="min-h-[90px] text-[14px] leading-7"
                    style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, textAlignVertical: 'top' }}
                />

                <View className="mt-4 flex-row items-center justify-between gap-3">
                    <Text className="flex-1" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                        Current assistant note: {response}
                    </Text>
                    <TouchableOpacity onPress={onSend} className="rounded-full px-4 py-3" style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}>
                        <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}