import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProducts } from '@/services/api';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { ProductCard } from '@/screens/native/shared/ProductCard';

type CuratedProductsScreenProps = {
  mode: 'best-sellers' | 'deals';
};

export default function CuratedProductsScreen({ mode }: CuratedProductsScreenProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    getProducts()
      .then((response) => {
        if (mounted) {
          setProducts(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const curated = useMemo(() => {
    if (mode === 'deals') {
      return products.filter((product) => Number(product?.salePrice || 0) > 0 && Number(product?.salePrice || 0) < Number(product?.price || 0));
    }

    return products.filter((product) => Boolean(product?.isFeatured));
  }, [mode, products]);

  const title = mode === 'deals' ? 'Deals' : 'Best sellers';
  const subtitle = mode === 'deals'
    ? 'Discounted products already published by the existing backend.'
    : 'Featured customer-facing products for the native storefront.';

  return (
    <AppScreen title={title} subtitle={subtitle} canGoBack>
      {curated.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} message="Once the existing catalog has matching products, the native screen will show them automatically." />
      ) : (
        <View style={{ gap: 14 }}>
          <Text style={{ color: '#6f5a4d', fontFamily: 'Inter', fontSize: 13 }}>{curated.length} product(s)</Text>
          {curated.map((product) => (
            <ProductCard
              key={String(product?._id)}
              product={product}
              onPress={() => router.push(`/product-single?id=${product._id}` as never)}
              onAddToCart={async () => {
                await addToCart({
                  product: product._id,
                  name: product.name,
                  thumbnailImage: product.thumbnailImage || product.images?.[0] || '',
                  price: Number(product.price || 0),
                  salePrice: product.salePrice == null ? null : Number(product.salePrice),
                  sku: String(product.sku || ''),
                });
                showToast('Added to cart', 'success', { subMessage: product.name });
              }}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}