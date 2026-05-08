import { AI_SEARCH_COLORS, AI_SEARCH_FONTS } from '@/components/AISearch/aiSearchTheme';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
    eyebrow?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function AISearchSectionHeader({
    eyebrow,
    title,
    description,
    actionLabel,
    onAction,
}: Props) {
    return (
        <View className="mb-4 flex-row items-end justify-between gap-3">
            <View className="flex-1">
                {eyebrow ? (
                    <Text
                        className="mb-1 uppercase tracking-[2px]"
                        style={{ color: AI_SEARCH_COLORS.clay, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}
                    >
                        {eyebrow}
                    </Text>
                ) : null}
                <Text
                    className="text-2xl"
                    style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}
                >
                    {title}
                </Text>
                {description ? (
                    <Text
                        className="mt-1 text-sm leading-6"
                        style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}
                    >
                        {description}
                    </Text>
                ) : null}
            </View>

            {actionLabel && onAction ? (
                <TouchableOpacity
                    onPress={onAction}
                    className="rounded-full border px-4 py-2"
                    style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.card }}
                >
                    <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}