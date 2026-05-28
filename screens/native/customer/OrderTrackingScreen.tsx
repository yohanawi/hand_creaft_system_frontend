import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { trackOrder } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

function formatCurrency(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function OrderTrackingScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber?: string }>();
  const [input, setInput] = useState(String(orderNumber || ''));
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    setLoading(true);
    trackOrder(String(orderNumber))
      .then((response) => setOrder(response.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <AppScreen title="Track order" subtitle="Search order status and tracking events without leaving the native customer flow." canGoBack showPageIntro={false}>
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
            Delivery progress
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Follow each order update with a cleaner mobile timeline.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          The tracking endpoint is unchanged. This redesign only reframes order lookup and status events so they feel like part of the storefront experience.
        </Text>
      </View>

      <SectionCard title="Find your order" subtitle="Use the existing order tracking endpoint with the same order number format already supported on web.">
        <View style={{ gap: 12 }}>
          <FormField label="Order number" value={input} onChangeText={setInput} placeholder="Enter order number" icon="search" autoCapitalize="characters" />
          <AppButton
            label="Track"
            icon="map-pin"
            loading={loading}
            onPress={async () => {
              if (!input.trim()) {
                return;
              }
              setLoading(true);
              try {
                const response = await trackOrder(input.trim());
                setOrder(response.data);
              } catch {
                setOrder(null);
              } finally {
                setLoading(false);
              }
            }}
          />
        </View>
      </SectionCard>

      {loading ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
          <ActivityIndicator color={nativeTheme.colors.primary} size="large" />
        </View>
      ) : order ? (
        <SectionCard title={String(order.orderNumber || 'Order')} subtitle={`${String(order.status || '').replace(/_/g, ' ')} • ${String(order.paymentStatus || '')}`}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, gap: 4 }}>
                <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{formatCurrency(Number(order.total || 0))}</Text>
                <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>Order total</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, gap: 4 }}>
                <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{(order.trackingEvents || []).length}</Text>
                <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>Timeline events</Text>
              </View>
            </View>
            {(order.trackingEvents || []).map((event: any, index: number) => (
              <View key={`${event?.status || 'event'}-${index}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 8 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(113, 67, 41, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="check-circle" size={16} color={nativeTheme.colors.primary} />
                  </View>
                  {index === (order.trackingEvents || []).length - 1 ? null : <View style={{ width: 2, flex: 1, marginTop: 4, backgroundColor: 'rgba(113, 67, 41, 0.12)' }} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 12 }}>
                  <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{String(event?.status || '').replace(/_/g, ' ')}</Text>
                  <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{event?.message || 'Status updated'}</Text>
                </View>
              </View>
            ))}
          </View>
        </SectionCard>
      ) : (
        <SectionCard title="No order loaded" subtitle="Enter an order number above to see tracking events and delivery status." >
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>This screen is ready to consume the same track-order response already used by the current system.</Text>
        </SectionCard>
      )}
    </AppScreen>
  );
}