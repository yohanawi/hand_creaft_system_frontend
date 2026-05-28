import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProducts, getCategories, getApiErrorMessage } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { FormField } from '@/screens/native/shared/FormField';
import { ProductCard } from '@/screens/native/shared/ProductCard';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 4 }}>
      <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.74)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function ExploreTile({ label, route, icon }: { label: string; route: string; icon: keyof typeof Feather.glyphMap }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(route as never)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: nativeTheme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: 'rgba(255,255,255,0.72)',
        paddingHorizontal: 16,
        paddingVertical: 16,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={17} color={nativeTheme.colors.primary} />
        </View>
        <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      </View>
      <Feather name="arrow-up-right" size={18} color={nativeTheme.colors.textMuted} />
    </Pressable>
  );
}

export default function ShopScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()]);
        if (!mounted) {
          return;
        }

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories((Array.isArray(categoriesRes.data) ? categoriesRes.data : []).filter((item) => !item?.parent));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
        showToast('Catalog load failed', 'error', {
          subMessage: getApiErrorMessage(error, 'Unable to load the product catalog.'),
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    const normalized = Array.isArray(category) ? category[0] : category;
    if (!normalized) {
      setSelectedCategory('all');
      return;
    }

    setSelectedCategory(String(normalized));
  }, [category]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categorySlug = String(product?.category?.slug || product?.category || '');
      const categoryId = String(product?.category?._id || '');

      if (selectedCategory !== 'all' && ![categorySlug, categoryId].includes(selectedCategory)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = `${product?.name || ''} ${product?.description || ''} ${product?.material || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [products, search, selectedCategory]);

  const categoryCount = categories.length;

  return (
    <AppScreen title="Shop the collection" subtitle="A boutique browse flow tuned for mobile discovery and faster tap targets." showPageIntro={false}>
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
            Storefront browse
          </Text>
        </View>
        <View style={{ gap: 10 }}>
          <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
            Find handcrafted pieces without losing the website feel.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
            Search, filter, and move into product detail pages with the same warm editorial tone as the web storefront.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatChip label="Products" value={products.length} />
          <StatChip label="Collections" value={categoryCount} />
          <StatChip label="Matching" value={filteredProducts.length} />
        </View>
      </View>

      <SectionCard title="Refine your browse" subtitle="The website uses strong curation cues, so the mobile catalog now starts with search and collection chips instead of plain filters.">
        <View style={{ gap: 14 }}>
          <FormField label="Search" value={search} onChangeText={setSearch} placeholder="Search products, materials, or styles" icon="search" autoCapitalize="sentences" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
            <Pressable
              onPress={() => setSelectedCategory('all')}
              style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: selectedCategory === 'all' ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)', backgroundColor: selectedCategory === 'all' ? nativeTheme.colors.primary : 'rgba(255,255,255,0.72)' }}
            >
              <Text style={{ color: selectedCategory === 'all' ? nativeTheme.colors.white : nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>All pieces</Text>
            </Pressable>
            {categories.map((item) => {
              const slug = String(item?.slug || item?._id || '');
              const active = slug === selectedCategory;

              return (
                <Pressable
                  key={slug}
                  onPress={() => setSelectedCategory(slug)}
                  style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: active ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)', backgroundColor: active ? nativeTheme.colors.primary : 'rgba(255,255,255,0.72)' }}
                >
                  <Text style={{ color: active ? nativeTheme.colors.white : nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{item?.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SectionCard>

      {filteredProducts.length === 0 ? (
        <EmptyState title="No products match this filter" message="Try another category or clear the search to continue browsing." actionLabel="Show all products" onAction={() => { setSearch(''); setSelectedCategory('all'); }} />
      ) : (
        <SectionCard title="Curated results" subtitle="Products are stacked like editorial cards on mobile so imagery, price, and add-to-cart actions stay easy to scan.">
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{filteredProducts.length} piece(s) available</Text>
              <AppButton label="Open cart" icon="shopping-bag" variant="ghost" onPress={() => router.push('/cart' as never)} />
            </View>
            {filteredProducts.map((product) => (
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
        </SectionCard>
      )}

      <SectionCard title="More ways to explore" subtitle="These companion routes keep the same storefront vocabulary while offering faster mobile shortcuts.">
        <View style={{ gap: 10 }}>
          {[
            { label: 'Browse categories', route: '/categories', icon: 'grid' },
            { label: 'Best sellers', route: '/best-sellers', icon: 'award' },
            { label: 'Deals and offers', route: '/deals', icon: 'tag' },
          ].map((item) => (
            <ExploreTile key={item.route} label={item.label} route={item.route} icon={item.icon as keyof typeof Feather.glyphMap} />
          ))}
        </View>
      </SectionCard>
    </AppScreen>
  );
}