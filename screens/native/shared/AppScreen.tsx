import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { nativeTheme, screenPadding } from '@/screens/native/theme';

type AppScreenProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  showBottomNav?: boolean;
  canGoBack?: boolean;
  rightSlot?: React.ReactNode;
  showPageIntro?: boolean;
};

const NAV_ITEMS = [
  { label: 'Home', icon: 'home', route: '/' },
  { label: 'Shop', icon: 'shopping-bag', route: '/shop' },
  { label: 'AI', icon: 'camera', route: '/ai-search' },
  { label: 'Cart', icon: 'shopping-cart', route: '/cart' },
  { label: 'Account', icon: 'user', route: '/customer-dashboard' },
];

function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const auth = useAuth();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 14,
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        borderRadius: nativeTheme.radius.xl,
        backgroundColor: 'rgba(255, 253, 251, 0.96)',
        ...nativeTheme.shadows.strong,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const targetRoute = item.route === '/customer-dashboard' && !auth.userToken ? '/login' : item.route;
        const active = pathname === targetRoute;
        const badge = item.route === '/cart' ? cartCount : 0;

        return (
          <Pressable
            key={item.route}
            onPress={() => router.push(targetRoute as never)}
            style={{
              alignItems: 'center',
              gap: 5,
              minWidth: 58,
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: nativeTheme.radius.lg,
              backgroundColor: active ? 'rgba(113, 67, 41, 0.1)' : 'transparent',
              opacity: active ? 1 : 0.82,
            }}
          >
            <View>
              <Feather name={(item.route === '/customer-dashboard' && !auth.userToken ? 'log-in' : item.icon) as any} size={18} color={active ? nativeTheme.colors.primary : nativeTheme.colors.textMuted} />
              {badge > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: -6,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: nativeTheme.colors.danger,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 10, fontWeight: '700' }}>
                    {badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: active ? nativeTheme.colors.primary : nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '700' }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AppScreen({
  title,
  subtitle,
  children,
  scroll = true,
  showBottomNav = true,
  canGoBack,
  rightSlot,
  showPageIntro = true,
}: AppScreenProps) {
  const router = useRouter();
  const { cartCount } = useCart();

  const intro = showPageIntro ? (
    <View
      style={{
        gap: 8,
        padding: nativeTheme.spacing.lg,
        borderRadius: nativeTheme.radius.xl,
        backgroundColor: 'rgba(255, 250, 246, 0.88)',
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        ...nativeTheme.shadows.soft,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 34, height: 2, borderRadius: 999, backgroundColor: nativeTheme.colors.primary }} />
        <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
          Mobile boutique
        </Text>
      </View>
      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 32, lineHeight: 38 }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>{subtitle}</Text>
      ) : null}
    </View>
  ) : null;

  const body = scroll ? (
    <ScrollView contentContainerStyle={{ padding: screenPadding, gap: 18, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {intro}
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: screenPadding, gap: 18 }}>
      {intro}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: nativeTheme.colors.background }}>
      <View style={{ position: 'absolute', top: -80, right: -40, width: 220, height: 220, borderRadius: 999, backgroundColor: 'rgba(212, 175, 55, 0.16)' }} />
      <View style={{ position: 'absolute', top: 140, left: -80, width: 180, height: 180, borderRadius: 999, backgroundColor: 'rgba(113, 67, 41, 0.08)' }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: screenPadding,
          paddingTop: 10,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(113, 67, 41, 0.08)',
          backgroundColor: 'rgba(248, 242, 236, 0.92)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {canGoBack ? (
            <Pressable
              onPress={() => router.back()}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)' }}
            >
              <Feather name="arrow-left" size={18} color={nativeTheme.colors.primaryDark} />
            </Pressable>
          ) : (
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: nativeTheme.colors.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.24)' }}>
              <Text style={{ color: nativeTheme.colors.accent, fontFamily: nativeTheme.fonts.heading, fontSize: 21 }}>H</Text>
            </View>
          )}
          <View>
            <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '800' }}>HandCraft</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 18 }}>Mobile Boutique</Text>
          </View>
        </View>

        {rightSlot || (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => router.push('/shop' as never)}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)' }}
            >
              <Feather name="search" size={18} color={nativeTheme.colors.primaryDark} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/cart' as never)}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)' }}
            >
              <Feather name="shopping-bag" size={18} color={nativeTheme.colors.primaryDark} />
              {cartCount > 0 ? (
                <View style={{ position: 'absolute', right: -2, top: -2, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: nativeTheme.colors.primary }}>
                  <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 10, fontWeight: '800' }}>{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>{body}</View>
      {showBottomNav ? <NavBar /> : null}
    </SafeAreaView>
  );
}