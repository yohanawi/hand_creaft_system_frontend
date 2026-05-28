import React from 'react';
import { Text, View } from 'react-native';

import { nativeTheme } from '@/screens/native/theme';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View
      style={{
        borderRadius: nativeTheme.radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: 'rgba(255, 253, 251, 0.92)',
        padding: nativeTheme.spacing.lg,
        gap: nativeTheme.spacing.md,
        ...nativeTheme.shadows.soft,
      }}
    >
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 34, height: 2, borderRadius: 999, backgroundColor: nativeTheme.colors.primary }} />
          <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
            Boutique section
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24, lineHeight: 30 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}