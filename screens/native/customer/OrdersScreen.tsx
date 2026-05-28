import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import useProtectedRoute from '@/hooks/useProtectedRoute';
import { cancelMyOrder, getMyOrders, initiatePayHerePayment } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const FILTERS = ['all', 'awaiting_payment', 'payment_failed', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  awaiting_payment: '#2563EB',
  payment_failed: '#DC2626',
  pending: '#D97706',
  confirmed: '#2563EB',
  processing: '#7C3AED',
  shipped: '#C1622F',
  delivered: '#15803D',
  cancelled: '#6B7280',
  out_for_delivery: '#EA580C',
};

function formatCurrency(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function OrdersScreen() {
  const router = useRouter();
  const auth = useProtectedRoute();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    if (!auth.userToken) {
      return;
    }

    try {
      const response = await getMyOrders(filter === 'all' ? {} : { status: filter });
      setOrders(Array.isArray(response.data?.orders) ? response.data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth.userToken, filter]);

  useFocusEffect(
    React.useCallback(() => {
      if (!auth.isAuthorized) {
        return;
      }

      setLoading(true);
      loadOrders();
    }, [auth.isAuthorized, loadOrders]),
  );

  const summary = useMemo(() => ({
    active: orders.filter((order) => ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status)).length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    unpaid: orders.filter((order) => ['awaiting_payment', 'payment_failed'].includes(order.status)).length,
  }), [orders]);

  if (auth.shouldBlock || loading) {
    return (
      <AppScreen title="Orders" subtitle="Track customer orders in the native app." showBottomNav={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={nativeTheme.colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Orders" subtitle="This APK route uses the same customer order endpoints as the current web version." showPageIntro={false} scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor={nativeTheme.colors.primary} />}
        contentContainerStyle={{ gap: 18, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
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
              Order archive
            </Text>
          </View>
          <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
            Track handmade orders with the same polished tone as the storefront.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
            Payment retries, delivery progress, cancellations, and order tracking still use the same backend endpoints. This redesign only improves the mobile presentation.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Active', value: summary.active },
              { label: 'Delivered', value: summary.delivered },
              { label: 'Need payment', value: summary.unpaid },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
                <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{item.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionCard title="Order summary" subtitle="Filter and action the orders that matter most on mobile.">
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Active', value: summary.active },
              { label: 'Delivered', value: summary.delivered },
              { label: 'Need payment', value: summary.unpaid },
            ].map((item) => (
              <View key={item.label} style={{ flexGrow: 1, minWidth: 120, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, padding: 14 }}>
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{item.value}</Text>
                <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Filter" subtitle="Keep the filter set mobile-friendly while preserving the existing order states.">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {FILTERS.map((item) => {
              const active = item === filter;
              return (
                <Pressable key={item} onPress={() => setFilter(item)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: active ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)', backgroundColor: active ? nativeTheme.colors.primary : 'rgba(255,255,255,0.72)' }}>
                  <Text style={{ color: active ? nativeTheme.colors.white : nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{item.replace(/_/g, ' ')}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </SectionCard>

        {orders.length === 0 ? (
          <EmptyState title="No orders in this view" message="Place a new order or switch the current order filter." />
        ) : orders.map((order) => (
          <SectionCard key={String(order._id)} title={String(order.orderNumber || 'Order')} subtitle={`${String(order.status || '').replace(/_/g, ' ')} • ${String(order.paymentStatus || 'unknown')}`}>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{order.items?.length || 0} item(s)</Text>
                <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: nativeTheme.radius.pill, backgroundColor: `${STATUS_COLORS[order.status] || nativeTheme.colors.primary}18` }}>
                  <Text style={{ color: STATUS_COLORS[order.status] || nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{String(order.status || '').replace(/_/g, ' ')}</Text>
                </View>
              </View>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 28 }}>{formatCurrency(Number(order.total || 0))}</Text>
              <AppButton label="Track order" icon="map-pin" variant="secondary" onPress={() => router.push(`/order-tracking?orderNumber=${encodeURIComponent(String(order.orderNumber || ''))}` as never)} />
              {['pending', 'confirmed', 'awaiting_payment', 'payment_failed'].includes(order.status) ? (
                <AppButton label="Cancel order" icon="x-circle" variant="danger" onPress={async () => { try { await cancelMyOrder(order._id); await loadOrders(); showToast('Order cancelled', 'success'); } catch { showToast('Cancel failed', 'error'); } }} />
              ) : null}
              {order.paymentMethod === 'payhere' && ['awaiting_payment', 'payment_failed'].includes(order.status) ? (
                <AppButton
                  label="Retry payment"
                  icon="credit-card"
                  onPress={async () => {
                    try {
                      const returnUrl = Linking.createURL('/payment-success', { queryParams: { orderId: order._id, orderNumber: order.orderNumber } });
                      const cancelUrl = Linking.createURL('/payment-failure', { queryParams: { orderId: order._id, orderNumber: order.orderNumber } });
                      const session = await initiatePayHerePayment({ orderId: order._id, returnUrl, cancelUrl });
                      const checkoutUrl = session.data?.checkoutUrl;
                      if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.location.assign(checkoutUrl);
                        return;
                      }
                      await WebBrowser.openBrowserAsync(checkoutUrl);
                    } catch {
                      showToast('Payment retry failed', 'error');
                    }
                  }}
                />
              ) : null}
            </View>
          </SectionCard>
        ))}
      </ScrollView>
    </AppScreen>
  );
}