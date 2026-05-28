import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCurrency } from '@/context/CurrencyContext';
import { getAssetUrl } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { nativeTheme } from '@/screens/native/theme';
import { formatConvertedPrice } from '@/utils/currency';

type ProductCardProps = {
  product: any;
  onPress: () => void;
  onAddToCart?: () => void;
};

function getPrice(product: any) {
  const basePrice = Number(product?.price || 0);
  const salePrice = product?.salePrice == null ? null : Number(product.salePrice);
  const finalPrice = salePrice != null && salePrice < basePrice ? salePrice : basePrice;

  return {
    basePrice,
    salePrice,
    finalPrice,
  };
}

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const { currency } = useCurrency();
  const { basePrice, salePrice, finalPrice } = getPrice(product);
  const imageUri = getAssetUrl(product?.thumbnailImage || product?.images?.[0] || null);
  const inStock = Number(product?.quantity || 0) > 0 && product?.availabilityStatus !== 'out_of_stock';
  const badge = product?.isFeatured ? 'Featured' : (product?.category?.name || 'HandCraft');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: nativeTheme.radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: nativeTheme.colors.card,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
        ...nativeTheme.shadows.soft,
      })}
    >
      <View style={{ aspectRatio: 0.98, backgroundColor: nativeTheme.colors.surfaceMuted, padding: 10 }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ flex: 1, borderRadius: nativeTheme.radius.lg }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong }}>
            <Feather name="image" size={30} color={nativeTheme.colors.textMuted} />
          </View>
        )}
        <View style={{ position: 'absolute', top: 18, left: 18, paddingHorizontal: 12, paddingVertical: 7, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255, 255, 255, 0.94)' }}>
          <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {badge}
          </Text>
        </View>
      </View>

      <View style={{ padding: 18, gap: 12 }}>
        <View style={{ gap: 6 }}>
          <Text numberOfLines={2} style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 22, lineHeight: 28 }}>
            {product?.name || 'Handcrafted piece'}
          </Text>
          <Text numberOfLines={2} style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
            {product?.category?.name || product?.material || 'Artisan jewellery'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.body, fontSize: 18, fontWeight: '700' }}>
              {formatConvertedPrice(finalPrice, currency)}
            </Text>
            {salePrice != null && salePrice < basePrice ? (
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, textDecorationLine: 'line-through' }}>
                {formatConvertedPrice(basePrice, currency)}
              </Text>
            ) : null}
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: inStock ? '#edf8f2' : '#fff1ef' }}>
            <Text style={{ color: inStock ? nativeTheme.colors.success : nativeTheme.colors.danger, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>
              {inStock ? 'In stock' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {onAddToCart ? <AppButton label="Add to cart" icon="arrow-right" onPress={onAddToCart} disabled={!inStock} /> : null}
      </View>
    </Pressable>
  );
}