import React from 'react';
import { Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { AppButton } from '@/screens/native/shared/Buttons';
import { nativeTheme } from '@/screens/native/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        borderRadius: nativeTheme.radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: 'rgba(255, 253, 251, 0.96)',
        padding: nativeTheme.spacing.xl,
        gap: 14,
        ...nativeTheme.shadows.soft,
      }}
    >
      <View style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: nativeTheme.colors.cardStrong }}>
        <Feather name="compass" size={22} color={nativeTheme.colors.primary} />
      </View>
      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24, lineHeight: 30 }}>
        {title}
      </Text>
      <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
        {message}
      </Text>
      {actionLabel && onAction ? <AppButton label={actionLabel} icon="arrow-right" onPress={onAction} style={{ marginTop: 4 }} /> : null}
    </View>
  );
}