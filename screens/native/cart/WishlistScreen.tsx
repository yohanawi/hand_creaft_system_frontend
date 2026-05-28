import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { getAssetUrl } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import { formatConvertedPrice } from '@/utils/currency';

export default function WishlistScreen() {
  const router = useRouter();
  const { items, removeItem } = useWishlist();
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const { showToast } = useToast();

  if (items.length === 0) {
    return (
      <AppScreen title="Wishlist" subtitle="Save products for later across web and mobile.">
        <EmptyState title="Nothing saved yet" message="When customers save products, they will appear here from the existing wishlist API and context." actionLabel="Browse products" onAction={() => router.replace('/shop' as never)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Wishlist" subtitle="The APK uses the same shared wishlist state as the current storefront." showPageIntro={false}>
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
            Saved collection
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Keep favourite pieces close until you are ready to buy.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          The wishlist now follows the same boutique presentation as the storefront while staying connected to the existing wishlist context and add-to-cart flow.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{items.length}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>Saved pieces</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>Mobile</Text>
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>Quick re-entry</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 14 }}>
        {items.map((item) => (
          <SectionCard key={String(item._id)} title={item.name} subtitle={item.category && typeof item.category === 'object' ? item.category.name : item.material || 'Saved piece'}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ width: 96, height: 96, borderRadius: nativeTheme.radius.lg, overflow: 'hidden', backgroundColor: nativeTheme.colors.cardStrong }}>
                  {item.thumbnailImage || item.images?.[0] ? (
                    <Image source={{ uri: getAssetUrl(item.thumbnailImage || item.images?.[0]) || item.thumbnailImage || item.images?.[0] }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : null}
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>
                    {formatConvertedPrice(Number(item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price), currency)}
                  </Text>
                  <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
                    {item.description || 'Saved from the storefront for a later checkout decision.'}
                  </Text>
                </View>
              </View>
              <AppButton
                label="Add to cart"
                icon="shopping-bag"
                onPress={async () => {
                  await addToCart({
                    product: item._id,
                    name: item.name,
                    thumbnailImage: item.thumbnailImage || item.images?.[0] || '',
                    price: Number(item.price || 0),
                    salePrice: item.salePrice == null ? null : Number(item.salePrice),
                    sku: String(item.sku || ''),
                  });
                  showToast('Added to cart', 'success', { subMessage: item.name });
                }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <AppButton label="View product" icon="arrow-up-right" variant="secondary" onPress={() => router.push(`/product-single?id=${item._id}` as never)} style={{ flex: 1 }} />
                <AppButton label="Remove" icon="trash-2" variant="danger" onPress={() => removeItem(item._id)} style={{ flex: 1 }} />
              </View>
            </View>
          </SectionCard>
        ))}
      </View>
    </AppScreen>
  );
}