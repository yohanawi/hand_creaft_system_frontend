import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getCategories, getAssetUrl } from '@/services/api';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';
import { Image } from 'expo-image';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    getCategories()
      .then((response) => {
        if (!mounted) {
          return;
        }

        setCategories((Array.isArray(response.data) ? response.data : []).filter((category) => !category?.parent));
      })
      .catch(() => {
        if (mounted) {
          setCategories([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppScreen title="Categories" subtitle="Use a cleaner mobile browsing surface without changing the existing web routes." canGoBack>
      {categories.length === 0 ? (
        <EmptyState title="Categories are unavailable" message="The native categories screen is already wired to the same backend endpoint used by the web storefront." />
      ) : (
        categories.map((category) => {
          const imageUri = getAssetUrl(category?.image);

          return (
            <SectionCard key={String(category?._id)} title={String(category?.name || 'Collection')} subtitle={String(category?.description || 'Explore this handcrafted collection.')}> 
              <Pressable
                onPress={() => router.push(`/shop?category=${encodeURIComponent(String(category?.slug || category?._id || ''))}` as never)}
                style={{ gap: 14 }}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: nativeTheme.radius.lg }} contentFit="cover" />
                ) : null}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Open collection</Text>
                  <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{category?.slug || 'shop'}</Text>
                </View>
              </Pressable>
            </SectionCard>
          );
        })
      )}
    </AppScreen>
  );
}