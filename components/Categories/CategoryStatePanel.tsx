import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
    variant: 'error' | 'empty';
    message: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function CategoryStatePanel({ variant, message, actionLabel, onAction }: Props) {
    const iconName = variant === 'error' ? 'alert-circle' : 'inbox';
    const accent = variant === 'error' ? BROWN.SecondaryBackground : BROWN.DarkColor;

    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 28,
                borderWidth: 1,
                borderColor: '#E9D8C8',
                backgroundColor: '#FFF8F1',
                paddingHorizontal: 24,
                paddingVertical: 40,
            }}
        >
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#F7E8DA', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={iconName} size={30} color={accent} />
            </View>

            <Text style={{ marginTop: 18, color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.heading, fontSize: 28, textAlign: 'center' }}>
                {variant === 'error' ? 'Unable to load collections' : 'No categories available yet'}
            </Text>

            <Text style={{ marginTop: 10, maxWidth: 460, color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 24, textAlign: 'center' }}>
                {message}
            </Text>

            {actionLabel && onAction ? (
                <Pressable
                    onPress={onAction}
                    style={({ pressed }) => [{
                        opacity: pressed ? 0.92 : 1,
                        marginTop: 24,
                        borderRadius: 14,
                        backgroundColor: BROWN.DarkColor,
                        paddingHorizontal: 24,
                        paddingVertical: 13,
                    }]}
                >
                    <Text style={{ color: '#FFFFFF', fontFamily: BRAND_FONTS.body, fontSize: 14, fontWeight: '700' }}>
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}