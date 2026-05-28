import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  getAddresses,
  getPayHereStatus,
  initiatePayHerePayment,
  placeOrder,
  validateCoupon,
} from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import { formatConvertedPrice } from '@/utils/currency';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Sri Lanka',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const auth = useProtectedRoute();
  const { items, subtotal, shippingCost, clearCart } = useCart();
  const { currency } = useCurrency();

  const [form, setForm] = useState(EMPTY_FORM);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'payhere'>('cod');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [payHereAvailable, setPayHereAvailable] = useState(false);

  useEffect(() => {
    if (!auth.userToken) {
      return;
    }

    getAddresses()
      .then((response) => {
        const nextAddresses = Array.isArray(response.data) ? response.data : [];
        setAddresses(nextAddresses);
        const defaultAddress = nextAddresses.find((item) => item.isDefault) || nextAddresses[0];
        if (!defaultAddress) {
          return;
        }

        setSelectedAddressId(defaultAddress._id);
        setForm((current) => ({
          ...current,
          fullName: defaultAddress.fullName || current.fullName,
          email: auth.user?.email || current.email,
          phone: defaultAddress.phone || current.phone,
          address: defaultAddress.addressLine1 || current.address,
          city: defaultAddress.city || current.city,
          state: defaultAddress.state || current.state,
          zipCode: defaultAddress.zipCode || current.zipCode,
          country: defaultAddress.country || current.country,
        }));
      })
      .catch(() => setAddresses([]));

    getPayHereStatus()
      .then((response) => {
        const available = Boolean(response.data?.available);
        setPayHereAvailable(available);
        if (!available) {
          setPaymentMethod('cod');
        }
      })
      .catch(() => {
        setPayHereAvailable(false);
        setPaymentMethod('cod');
      });
  }, [auth.user?.email, auth.userToken]);

  useEffect(() => {
    if (auth.user?.email) {
      setForm((current) => ({ ...current, email: current.email || auth.user?.email || '', fullName: current.fullName || auth.user?.name || '' }));
    }
  }, [auth.user?.email, auth.user?.name]);

  const total = useMemo(() => Math.max(0, subtotal + shippingCost + Number(((subtotal + shippingCost) * 0.1).toFixed(2)) - couponDiscount), [couponDiscount, shippingCost, subtotal]);

  if (items.length === 0) {
    return (
      <AppScreen title="Checkout" subtitle="Customer checkout flow for the APK." canGoBack>
        <SectionCard title="Your cart is empty" subtitle="Add products before attempting checkout from the native app.">
          <AppButton label="Open shop" onPress={() => router.replace('/shop' as never)} />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Checkout" subtitle="A guided boutique checkout layered on top of the same backend order and payment flows." canGoBack showPageIntro={false}>
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
            Guided checkout
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Finalize your order with a cleaner mobile flow.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          Saved addresses, coupon validation, COD, and PayHere stay intact. This pass only changes the presentation to better match the storefront.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Items', value: String(items.length) },
            { label: 'Addresses', value: String(addresses.length) },
            { label: 'Total', value: formatConvertedPrice(total, currency) },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 22 }}>{item.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionCard title="Shipping details" subtitle="Choose a saved address or complete the boutique shipping form manually.">
        <View style={{ gap: 12 }}>
          {addresses.length > 0 ? (
            <View style={{ gap: 10 }}>
              {addresses.map((address) => {
                const active = selectedAddressId === address._id;

                return (
                  <Pressable
                    key={String(address._id)}
                    onPress={() => setSelectedAddressId(address._id)}
                    style={{
                      padding: 16,
                      borderRadius: nativeTheme.radius.lg,
                      borderWidth: 1,
                      borderColor: active ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)',
                      backgroundColor: active ? 'rgba(113, 67, 41, 0.1)' : 'rgba(255,255,255,0.72)',
                      gap: 6,
                    }}
                  >
                    <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{address.label || 'Saved address'}</Text>
                    <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{address.addressLine1 || ''} {address.city ? `, ${address.city}` : ''}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <FormField label="Full name" value={form.fullName} onChangeText={(value) => setForm((current) => ({ ...current, fullName: value }))} placeholder="Recipient name" icon="user" autoCapitalize="words" />
          <FormField label="Email" value={form.email} onChangeText={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="Email address" icon="mail" keyboardType="email-address" />
          <FormField label="Phone" value={form.phone} onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))} placeholder="Phone number" icon="phone" keyboardType="phone-pad" />
          <FormField label="Address" value={form.address} onChangeText={(value) => setForm((current) => ({ ...current, address: value }))} placeholder="Street address" icon="home" autoCapitalize="words" />
          <FormField label="City" value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="City" icon="map" autoCapitalize="words" />
          <FormField label="State" value={form.state} onChangeText={(value) => setForm((current) => ({ ...current, state: value }))} placeholder="State or province" icon="navigation" autoCapitalize="words" />
          <FormField label="ZIP code" value={form.zipCode} onChangeText={(value) => setForm((current) => ({ ...current, zipCode: value }))} placeholder="Postal code" icon="hash" />
        </View>
      </SectionCard>

      <SectionCard title="Payment and note" subtitle="Cash on delivery and PayHere remain unchanged underneath, but the choice is now presented like the website’s premium purchase cards.">
        <View style={{ gap: 12 }}>
          <View style={{ gap: 10 }}>
            {[
              { id: 'cod', title: 'Cash on delivery', subtitle: 'Pay after delivery confirmation.', icon: 'package', disabled: false },
              { id: 'payhere', title: 'PayHere', subtitle: payHereAvailable ? 'Online payment is available for this order.' : 'Online payment is currently unavailable.', icon: 'credit-card', disabled: !payHereAvailable },
            ].map((option) => {
              const active = paymentMethod === option.id;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => !option.disabled && setPaymentMethod(option.id as 'cod' | 'payhere')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: nativeTheme.radius.lg,
                    borderWidth: 1,
                    borderColor: active ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)',
                    backgroundColor: active ? 'rgba(113, 67, 41, 0.1)' : 'rgba(255,255,255,0.72)',
                    opacity: option.disabled ? 0.6 : 1,
                  }}
                >
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name={option.icon as any} size={18} color={nativeTheme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{option.title}</Text>
                    <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, lineHeight: 18 }}>{option.subtitle}</Text>
                  </View>
                  {active ? <Feather name="check-circle" size={18} color={nativeTheme.colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
          <FormField label="Coupon" value={couponCode} onChangeText={setCouponCode} placeholder="Coupon code" icon="tag" autoCapitalize="characters" />
          <AppButton
            label="Validate coupon"
            icon="arrow-right"
            variant="ghost"
            onPress={async () => {
              if (!couponCode.trim()) {
                return;
              }
              try {
                const response = await validateCoupon({ code: couponCode.trim(), subtotal });
                setCouponDiscount(Number(response.data?.discount || 0));
              } catch {
                setCouponDiscount(0);
              }
            }}
          />
          <FormField label="Order note" value={customerNote} onChangeText={setCustomerNote} placeholder="Delivery or gift note" icon="edit" multiline autoCapitalize="sentences" />
        </View>
      </SectionCard>

      <SectionCard title="Summary" subtitle="The final amount still comes from the shared cart state, shipping totals, tax, and coupon logic already in the app.">
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Items</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontWeight: '700' }}>{items.length}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Subtotal</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontWeight: '700' }}>{formatConvertedPrice(subtotal, currency)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Shipping</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontWeight: '700' }}>{formatConvertedPrice(shippingCost, currency)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>Discount</Text>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontWeight: '700' }}>{couponDiscount > 0 ? `- ${formatConvertedPrice(couponDiscount, currency)}` : formatConvertedPrice(0, currency)}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(113, 67, 41, 0.08)', marginVertical: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 15, fontWeight: '700' }}>Total</Text>
            <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.heading, fontSize: 26 }}>{formatConvertedPrice(total, currency)}</Text>
          </View>
        </View>
      </SectionCard>

      <AppButton
        label="Place order"
        icon="arrow-right"
        loading={loading}
        onPress={async () => {
          setLoading(true);
          try {
            const orderResponse = await placeOrder({
              items: items.map((item) => ({
                product: item.product,
                quantity: item.quantity,
                variantId: item.selectedVariant?.variantId,
                selectedVariant: item.selectedVariant,
              })),
              shippingAddress: selectedAddressId ? undefined : form,
              addressId: selectedAddressId || undefined,
              paymentMethod,
              customerNote: customerNote.trim() || undefined,
              couponCode: couponDiscount > 0 ? couponCode.trim() : undefined,
            });

            const order = orderResponse.data?.order;
            if (paymentMethod === 'payhere') {
              const returnUrl = Linking.createURL('/payment-success', { queryParams: { orderId: order._id, orderNumber: order.orderNumber } });
              const cancelUrl = Linking.createURL('/payment-failure', { queryParams: { orderId: order._id, orderNumber: order.orderNumber } });
              const session = await initiatePayHerePayment({ orderId: order._id, returnUrl, cancelUrl });
              await clearCart();
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.assign(session.data.checkoutUrl);
                return;
              }
              await WebBrowser.openBrowserAsync(session.data.checkoutUrl);
              return;
            }

            await clearCart();
            router.replace(`/payment-success?orderId=${encodeURIComponent(String(order._id))}&orderNumber=${encodeURIComponent(String(order.orderNumber || ''))}&mode=cod` as never);
          } catch (error: any) {
            Alert.alert('Checkout failed', error?.response?.data?.message || 'Unable to complete checkout right now.');
          } finally {
            setLoading(false);
          }
        }}
      />
    </AppScreen>
  );
}