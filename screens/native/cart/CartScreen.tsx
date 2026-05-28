import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { getAssetUrl, validateCoupon } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import { formatConvertedPrice } from '@/utils/currency';

function SummaryRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: emphasize ? nativeTheme.colors.text : nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: emphasize ? 16 : 14, fontWeight: emphasize ? '700' : '600' }}>{value}</Text>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotal, shippingCost, tax, total, updateQty, removeFromCart } = useCart();
  const { currency } = useCurrency();
  const { showToast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const payableTotal = useMemo(() => Math.max(0, total - couponDiscount), [couponDiscount, total]);

  if (items.length === 0) {
    return (
      <AppScreen title="Cart" subtitle="Your bag is ready for the APK flow.">
        <EmptyState title="Your cart is empty" message="Add a few handcrafted pieces and come back when you are ready to check out." actionLabel="Start shopping" onAction={() => router.replace('/shop' as never)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Your bag" subtitle="A storefront-style bag review with the same live cart state and totals logic." showPageIntro={false}>
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
            Curated bag
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Review your selected pieces before checkout.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          The bag now follows the same premium tone as the website while keeping quantities, coupon preview, and totals connected to the existing cart context.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Items', value: items.length },
            { label: 'Subtotal', value: formatConvertedPrice(subtotal, currency) },
            { label: 'Ready total', value: formatConvertedPrice(payableTotal, currency) },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 22 }}>{item.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionCard title="Selected pieces" subtitle="Each cart line is presented like a mobile boutique card with clearer quantity controls and pricing.">
        <View style={{ gap: 14 }}>
          {items.map((item) => (
            <View key={`${item.product}:${item.selectedVariant?.variantId || 'base'}`} style={{ borderRadius: nativeTheme.radius.xl, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: 'rgba(255,255,255,0.72)', padding: 16, gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ width: 92, height: 92, borderRadius: nativeTheme.radius.lg, overflow: 'hidden', backgroundColor: nativeTheme.colors.cardStrong }}>
                  {item.thumbnailImage ? <Image source={{ uri: getAssetUrl(item.thumbnailImage) || item.thumbnailImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24, lineHeight: 28 }}>{item.name}</Text>
                  <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{item.selectedVariant?.label || item.sku || 'Base product'}</Text>
                  <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.body, fontSize: 16, fontWeight: '700' }}>
                    {formatConvertedPrice((item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price) * item.quantity, currency)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Pressable onPress={() => updateQty(item.product, Math.max(1, item.quantity - 1), item.selectedVariant?.variantId)} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="minus" size={16} color={nativeTheme.colors.primaryDark} />
                  </Pressable>
                  <View style={{ minWidth: 52, alignItems: 'center' }}>
                    <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{item.quantity}</Text>
                  </View>
                  <Pressable onPress={() => updateQty(item.product, item.quantity + 1, item.selectedVariant?.variantId)} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="plus" size={16} color={nativeTheme.colors.primaryDark} />
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <AppButton label="Remove" icon="trash-2" variant="danger" onPress={() => removeFromCart(item.product, item.selectedVariant?.variantId)} style={{ flex: 1 }} />
                <AppButton label="Details" icon="arrow-up-right" variant="secondary" onPress={() => router.push(`/product-single?id=${item.product}` as never)} style={{ flex: 1 }} />
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Coupon preview" subtitle="The website’s offer handling is preserved, but the mobile coupon card now feels more integrated with the bag view.">
        <View style={{ gap: 12 }}>
          <FormField label="Coupon code" value={couponCode} onChangeText={setCouponCode} placeholder="Enter your code" icon="tag" autoCapitalize="characters" />
          <AppButton
            label="Validate coupon"
            icon="arrow-right"
            loading={couponLoading}
            variant="secondary"
            onPress={async () => {
              if (!couponCode.trim()) {
                showToast('Coupon required', 'warning', { subMessage: 'Enter a coupon code first.' });
                return;
              }

              setCouponLoading(true);
              try {
                const response = await validateCoupon({ code: couponCode.trim(), subtotal });
                setCouponDiscount(Number(response.data?.discount || 0));
                showToast('Coupon applied', 'success', { subMessage: `Discount: ${formatCurrency(Number(response.data?.discount || 0))}` });
              } catch {
                setCouponDiscount(0);
                showToast('Coupon failed', 'error', { subMessage: 'This coupon could not be applied.' });
              } finally {
                setCouponLoading(false);
              }
            }}
          />
        </View>
      </SectionCard>

      <SectionCard title="Order summary" subtitle="Shipping, tax, discounts, and final total still come from the shared cart state and coupon preview logic.">
        <View style={{ gap: 10 }}>
          <SummaryRow label="Subtotal" value={formatConvertedPrice(subtotal, currency)} />
          <SummaryRow label="Shipping" value={formatConvertedPrice(shippingCost, currency)} />
          <SummaryRow label="Tax" value={formatConvertedPrice(tax, currency)} />
          <SummaryRow label="Discount" value={couponDiscount > 0 ? `- ${formatConvertedPrice(couponDiscount, currency)}` : formatConvertedPrice(0, currency)} />
          <SummaryRow label="Total" value={formatConvertedPrice(payableTotal, currency)} emphasize />
        </View>
      </SectionCard>

      <View style={{ gap: 12 }}>
        <AppButton label="Proceed to checkout" icon="arrow-right" onPress={() => router.push('/checkout' as never)} />
        <AppButton label="Open wishlist" icon="heart" variant="ghost" onPress={() => router.push('/wishlist' as never)} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="shield" size={16} color={nativeTheme.colors.success} />
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, flex: 1 }}>Cart, coupon preview, and totals stay aligned with the current backend logic.</Text>
        </View>
      </View>
    </AppScreen>
  );
}