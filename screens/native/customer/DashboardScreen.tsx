import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { getCustomerOverview } from '@/services/api';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { AppButton } from '@/screens/native/shared/Buttons';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useFocusEffect } from 'expo-router';

function formatCurrency(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function MetricCard({ label, value, icon, accent }: { label: string; value: string | number; icon: keyof typeof Feather.glyphMap; accent: string }) {
  return (
    <View style={{ flexGrow: 1, minWidth: 145, borderRadius: nativeTheme.radius.xl, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', padding: 16, gap: 10 }}>
      <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: `${accent}18`, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={18} color={accent} />
      </View>
      <Text style={{ color: accent, fontFamily: nativeTheme.fonts.heading, fontSize: 30 }}>{value}</Text>
      <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

function ActionTile({ label, route, icon }: { label: string; route: string; icon: keyof typeof Feather.glyphMap }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(route as never)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: nativeTheme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: 'rgba(255,255,255,0.72)',
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: nativeTheme.colors.cardStrong }}>
          <Feather name={icon} size={16} color={nativeTheme.colors.primary} />
        </View>
        <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      </View>
      <Feather name="arrow-up-right" size={17} color={nativeTheme.colors.textMuted} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const auth = useProtectedRoute();
  const { updateUser } = auth;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!auth.userToken) {
      return;
    }

    try {
      const response = await getCustomerOverview();
      setData(response.data || null);
      if (response.data?.user) {
        updateUser(response.data.user);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth.userToken, updateUser]);

  useFocusEffect(
    React.useCallback(() => {
      if (!auth.isAuthorized) {
        return;
      }

      setLoading(true);
      loadDashboard();
    }, [auth.isAuthorized, loadDashboard]),
  );

  if (auth.shouldBlock || loading) {
    return (
      <AppScreen title="Dashboard" subtitle="Customer account summary for the native app." showBottomNav={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={nativeTheme.colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!data) {
    return (
      <AppScreen title="Dashboard" subtitle="Customer account summary for the native app.">
        <EmptyState title="Dashboard unavailable" message="The customer overview endpoint did not return data right now." actionLabel="Refresh" onAction={() => { setRefreshing(true); loadDashboard(); }} />
      </AppScreen>
    );
  }

  const summary = data.summary || {};
  const recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : [];
  const recentSupportTickets = Array.isArray(data.recentSupportTickets) ? data.recentSupportTickets : [];
  const defaultAddress = data.defaultAddress || data.addresses?.[0] || null;

  return (
    <AppScreen title="Dashboard" subtitle="Orders, wishlist, support, and address data from the same backend used by the web storefront." showPageIntro={false} scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor={nativeTheme.colors.primary} />}
        contentContainerStyle={{ gap: 18, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 20 }}
      >
        <View
          style={{
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: nativeTheme.colors.primaryDark,
            padding: 22,
            gap: 18,
            ...nativeTheme.shadows.strong,
          }}
        >
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
              Client atelier
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
              Welcome back, {data.user?.name || 'Customer'}.
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
              Your dashboard now carries the same boutique tone as the storefront while keeping orders, support, addresses, and cart data live from the current backend.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AppButton label="Explore collection" icon="arrow-right" variant="secondary" onPress={() => router.push('/shop' as never)} style={{ flex: 1, backgroundColor: nativeTheme.colors.white, borderColor: nativeTheme.colors.white }} />
            <AppButton label="View orders" icon="package" variant="secondary" onPress={() => router.push('/orders' as never)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)' }} />
          </View>
        </View>

        <SectionCard title={`Welcome back, ${data.user?.name || 'Customer'}`} subtitle="Use the native customer dashboard as the command center for the APK.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <MetricCard label="Orders" value={summary.orderCount || 0} icon="package" accent={nativeTheme.colors.primary} />
            <MetricCard label="Delivered" value={summary.deliveredOrderCount || 0} icon="check-circle" accent={nativeTheme.colors.success} />
            <MetricCard label="Wishlist" value={summary.wishlistCount || 0} icon="heart" accent="#E11D48" />
            <MetricCard label="Open tickets" value={summary.openTicketCount || 0} icon="message-square" accent={nativeTheme.colors.info} />
          </View>
        </SectionCard>

        <SectionCard title="Quick actions" subtitle="These routes now have their own native customer implementations, but the entry points feel closer to the website’s premium navigation cues.">
          <View style={{ gap: 10 }}>
            <ActionTile label="Open orders" route="/orders" icon="package" />
            <ActionTile label="Edit profile" route="/profile" icon="user" />
            <ActionTile label="Support tickets" route="/support-tickets" icon="message-square" />
            <ActionTile label="Continue shopping" route="/shop" icon="shopping-bag" />
          </View>
        </SectionCard>

        <SectionCard title="Cart snapshot" subtitle="Shared cart and wishlist state still stay in sync with the backend, but the summary is surfaced in a cleaner storefront card.">
          <View style={{ gap: 8 }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Cart lines: {summary.cartLineCount || 0}</Text>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Items in cart: {summary.cartItemCount || 0}</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontWeight: '700' }}>Cart total: {formatCurrency(summary.cartTotal || 0)}</Text>
          </View>
        </SectionCard>

        <SectionCard title="Recent orders" subtitle="The same backend order data is now presented in richer cards for mobile review.">
          {recentOrders.length > 0 ? recentOrders.map((order: any) => (
            <Pressable key={String(order?._id)} onPress={() => router.push(`/order-tracking?orderNumber=${encodeURIComponent(String(order?.orderNumber || ''))}` as never)} style={{ padding: 16, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.06)', gap: 6, marginBottom: 10 }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{order?.orderNumber}</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{String(order?.status || '').replace(/_/g, ' ')}</Text>
            </Pressable>
          )) : <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>No recent orders yet.</Text>}
        </SectionCard>

        <SectionCard title="Support and address" subtitle="Support history and default address stay live across web and APK, now grouped into a clearer account summary.">
          <View style={{ gap: 12 }}>
            <View style={{ gap: 6, padding: 16, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Support activity</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>Latest ticket count: {recentSupportTickets.length}</Text>
              {recentSupportTickets[0] ? <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>Most recent: {recentSupportTickets[0]?.subject || recentSupportTickets[0]?.ticketNumber}</Text> : null}
            </View>

            <View style={{ gap: 6, padding: 16, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Default address</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
                {defaultAddress ? `${defaultAddress.addressLine1 || ''}, ${defaultAddress.city || ''}` : 'No address saved yet'}
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
}