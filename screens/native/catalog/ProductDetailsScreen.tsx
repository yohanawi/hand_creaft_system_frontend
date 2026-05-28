import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { createProductReview, getAssetUrl, getProductById, getProductReviews } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import { formatConvertedPrice } from '@/utils/currency';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(113, 67, 41, 0.06)' }}>
      <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { userToken } = useAuth();
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const { showToast } = useToast();
  const { isInWishlist, toggleItem } = useWishlist();

  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          getProductById(id),
          getProductReviews(id).catch(() => ({ data: [] })),
        ]);

        if (!mounted) {
          return;
        }

        const nextProduct = productRes.data;
        setProduct(nextProduct);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);

        const defaultVariant = Array.isArray(nextProduct?.variants)
          ? nextProduct.variants.find((variant: any) => variant.isDefault) || nextProduct.variants[0]
          : null;

        setSelectedVariantId(defaultVariant ? String(defaultVariant._id) : '');
      } catch {
        if (mounted) {
          setProduct(null);
          setReviews([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const selectedVariant = useMemo(() => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return variants.find((variant: any) => String(variant._id) === selectedVariantId) || variants[0] || null;
  }, [product?.variants, selectedVariantId]);

  const imageUri = getAssetUrl(selectedVariant?.thumbnailImage || product?.thumbnailImage || product?.images?.[0] || null);
  const basePrice = Number(typeof selectedVariant?.price !== 'undefined' ? selectedVariant.price : product?.price || 0);
  const salePrice = selectedVariant?.salePrice == null ? product?.salePrice ?? null : selectedVariant.salePrice;
  const finalPrice = salePrice != null && Number(salePrice) < basePrice ? Number(salePrice) : basePrice;
  const inStock = Number(selectedVariant?.quantity ?? product?.quantity ?? 0) > 0 && product?.availabilityStatus !== 'out_of_stock';
  const quantityValue = Math.max(1, Number(quantity || '1'));
  const reviewAverage = Number(product?.averageRating || 0);

  if (!product) {
    return (
      <AppScreen title="Product" subtitle="Product details and purchase actions stay separated for the native app." canGoBack>
        <EmptyState title="Product not found" message="Open the shop again and choose another product." actionLabel="Back to shop" onAction={() => router.replace('/shop' as never)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title={product?.name || 'Product'} subtitle={product?.category?.name || product?.material || 'Handcrafted jewellery'} canGoBack showPageIntro={false}>
      <View
        style={{
          borderRadius: 32,
          overflow: 'hidden',
          backgroundColor: nativeTheme.colors.primaryDark,
          ...nativeTheme.shadows.strong,
        }}
      >
        <View style={{ aspectRatio: 1.02, backgroundColor: nativeTheme.colors.surfaceMuted }}>
          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
        </View>
        <View style={{ padding: 22, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' }}>
                {product?.category?.name || 'HandCraft piece'}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: inStock ? 'rgba(40,116,90,0.22)' : 'rgba(185,62,51,0.18)' }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{inStock ? 'Ready to ship' : 'Unavailable'}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
              {product?.name || 'Product'}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
              {product?.description || 'A handcrafted piece presented with the same warm editorial treatment as the website.'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 28 }}>{formatConvertedPrice(finalPrice, currency)}</Text>
              {salePrice != null && Number(salePrice) < basePrice ? <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: nativeTheme.fonts.body, fontSize: 12, textDecorationLine: 'line-through' }}>{formatConvertedPrice(basePrice, currency)}</Text> : null}
            </View>
            <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 12, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>Average rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Feather name="star" size={16} color={nativeTheme.colors.accent} />
                <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 16, fontWeight: '700' }}>{reviewAverage > 0 ? reviewAverage.toFixed(1) : 'New'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <SectionCard title="Purchase options" subtitle="The detail view now prioritizes the website’s premium purchase flow, but with larger mobile controls.">
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'truck', label: 'Fast delivery' },
              { icon: 'shield', label: 'Secure purchase' },
              { icon: 'refresh-ccw', label: 'Easy return support' },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, gap: 8 }}>
                <Feather name={item.icon as any} size={17} color={nativeTheme.colors.primary} />
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
              </View>
            ))}
          </View>

          {Array.isArray(product?.variants) && product.variants.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Choose a variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {product.variants.map((variant: any) => {
                  const active = String(variant._id) === String(selectedVariant?._id || '');
                  const label = [variant.label, variant.size, variant.color, variant.style].filter(Boolean).join(' · ') || 'Variant';

                  return (
                    <Pressable
                      key={String(variant._id)}
                      onPress={() => setSelectedVariantId(String(variant._id))}
                      style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: active ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)', backgroundColor: active ? nativeTheme.colors.primary : 'rgba(255,255,255,0.72)' }}
                    >
                      <Text style={{ color: active ? nativeTheme.colors.white : nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setQuantity(String(Math.max(1, quantityValue - 1)))} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="minus" size={16} color={nativeTheme.colors.primaryDark} />
              </Pressable>
              <View style={{ minWidth: 76, height: 48, borderRadius: nativeTheme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)' }}>
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{quantityValue}</Text>
              </View>
              <Pressable onPress={() => setQuantity(String(quantityValue + 1))} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="plus" size={16} color={nativeTheme.colors.primaryDark} />
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <AppButton
              label={inStock ? 'Add to cart' : 'Unavailable'}
              icon={inStock ? 'shopping-bag' : undefined}
              disabled={!inStock}
              onPress={async () => {
                const nextQuantity = quantityValue;
                await addToCart({
                  product: product._id,
                  name: product.name,
                  thumbnailImage: product.thumbnailImage || product.images?.[0] || '',
                  price: Number(product.price || 0),
                  salePrice: product.salePrice == null ? null : Number(product.salePrice),
                  sku: String(selectedVariant?.sku || product?.sku || ''),
                  quantity: nextQuantity,
                  selectedVariant: selectedVariant ? {
                    variantId: String(selectedVariant._id),
                    label: String(selectedVariant.label || ''),
                    size: String(selectedVariant.size || ''),
                    color: String(selectedVariant.color || ''),
                    style: String(selectedVariant.style || ''),
                    sku: String(selectedVariant.sku || ''),
                  } : undefined,
                });
                showToast('Added to cart', 'success', { subMessage: product.name });
              }}
            />
            <AppButton
              label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Save to wishlist'}
              variant="secondary"
              icon="heart"
              onPress={async () => {
                await toggleItem(product._id, {
                  _id: product._id,
                  name: product.name,
                  thumbnailImage: product.thumbnailImage || product.images?.[0] || '',
                  price: Number(product.price || 0),
                  salePrice: product.salePrice == null ? null : Number(product.salePrice),
                  sku: String(product.sku || ''),
                  availabilityStatus: product.availabilityStatus,
                  quantity: product.quantity,
                  category: product.category,
                  description: product.description,
                  material: product.material,
                  tags: product.tags,
                });
                showToast('Wishlist updated', 'wishlist', { subMessage: product.name });
              }}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Details" subtitle="Key product facts are grouped into cleaner boutique-style rows for faster reading on mobile.">
        <View style={{ gap: 10 }}>
          <DetailRow label="SKU" value={selectedVariant?.sku || product?.sku || 'Not specified'} />
          <DetailRow label="Material" value={product?.material || 'Not specified'} />
          <DetailRow label="Stock" value={inStock ? `${selectedVariant?.quantity ?? product?.quantity ?? 0} available` : 'Out of stock'} />
          <DetailRow label="Average rating" value={reviewAverage > 0 ? reviewAverage.toFixed(1) : 'No ratings yet'} />
        </View>
      </SectionCard>

      <SectionCard title="Reviews" subtitle="Reviews now read more like testimonial cards from the website while keeping the same backend review actions.">
        <View style={{ gap: 12 }}>
          {reviews.length > 0 ? reviews.slice(0, 5).map((review) => (
            <View key={String(review?._id)} style={{ gap: 8, borderRadius: nativeTheme.radius.lg, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: nativeTheme.colors.cardStrong, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{review?.user?.name || 'Customer'}</Text>
                <Text style={{ color: nativeTheme.colors.warning, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{'★'.repeat(Number(review?.rating || 0))}</Text>
              </View>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{review?.comment || 'No comment provided.'}</Text>
            </View>
          )) : <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>No reviews yet.</Text>}

          {userToken ? (
            <View style={{ gap: 10 }}>
              <FormField label="Rating" value={reviewRating} onChangeText={setReviewRating} placeholder="5" icon="star" keyboardType="number-pad" />
              <FormField label="Comment" value={reviewComment} onChangeText={setReviewComment} placeholder="Share your experience with this piece" icon="message-square" multiline autoCapitalize="sentences" />
              <AppButton
                label="Submit review"
                loading={sendingReview}
                onPress={async () => {
                  if (!id || !reviewComment.trim()) {
                    return;
                  }

                  setSendingReview(true);
                  try {
                    const response = await createProductReview(id, {
                      rating: Math.max(1, Math.min(5, Number(reviewRating || '5'))),
                      comment: reviewComment.trim(),
                    });
                    setReviews((current) => [response.data?.review || response.data, ...current]);
                    setReviewComment('');
                    setReviewRating('5');
                    showToast('Review submitted', 'success');
                  } catch {
                    showToast('Review failed', 'error', { subMessage: 'Unable to submit this review right now.' });
                  } finally {
                    setSendingReview(false);
                  }
                }}
              />
            </View>
          ) : (
            <Pressable onPress={() => router.push('/login' as never)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Feather name="log-in" size={16} color={nativeTheme.colors.primary} />
              <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Log in to write a review</Text>
            </Pressable>
          )}
        </View>
      </SectionCard>
    </AppScreen>
  );
}