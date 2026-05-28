import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { AppScreen } from '@/screens/native/shared/AppScreen';
import { nativeTheme } from '@/screens/native/theme';

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthScreenLayout({ title, subtitle, children }: AuthScreenLayoutProps) {
  return (
    <AppScreen title={title} subtitle={subtitle} showBottomNav={false} scroll={false} canGoBack showPageIntro={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View
            style={{
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: nativeTheme.colors.primaryDark,
              minHeight: 260,
              ...nativeTheme.shadows.strong,
            }}
          >
            <View style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: 999, backgroundColor: 'rgba(212, 175, 55, 0.18)' }} />
            <View style={{ position: 'absolute', bottom: -40, left: -20, width: 140, height: 140, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ padding: 24, gap: 18 }}>
              <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' }}>
                <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
                  Account access
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
                  {title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
                  {subtitle}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                {[
                  { icon: 'heart', label: 'Wishlist' },
                  { icon: 'shopping-bag', label: 'Orders' },
                  { icon: 'shield', label: 'Secure' },
                ].map((item) => (
                  <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 12, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.1)', gap: 8 }}>
                    <Feather name={item.icon as any} size={16} color={nativeTheme.colors.accent} />
                    <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View
            style={{
              borderRadius: nativeTheme.radius.xl,
              borderWidth: 1,
              borderColor: 'rgba(113, 67, 41, 0.08)',
              backgroundColor: 'rgba(255, 253, 251, 0.96)',
              padding: 20,
              gap: 18,
              ...nativeTheme.shadows.soft,
            }}
          >
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 2, borderRadius: 999, backgroundColor: nativeTheme.colors.primary }} />
                <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
                  Sign in securely
                </Text>
              </View>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 21 }}>
                These screens still use the same auth endpoints and shared context as the website. Only the presentation is being tailored for the APK storefront.
              </Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}