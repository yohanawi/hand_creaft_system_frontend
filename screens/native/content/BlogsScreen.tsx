import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { getAssetUrl, getBlogs } from '@/services/api';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { AppButton } from '@/screens/native/shared/Buttons';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

export default function BlogsScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    getBlogs({ status: 'published', limit: 20 })
      .then((response) => {
        if (!mounted) {
          return;
        }
        setBlogs(response.data?.data || response.data?.blogs || response.data || []);
      })
      .catch(() => {
        if (mounted) {
          setBlogs([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = blogs.filter((blog) => `${blog?.title || ''} ${blog?.category || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const featuredBlog = filtered[0] || null;

  return (
    <AppScreen title="Blogs" subtitle="Editorial content stays available on mobile without reusing the web shell." showPageIntro={false}>
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
            Editorial journal
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Browse artisan stories with the same warm tone as the website.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          Search and open published stories from the existing blog feed, now presented like a boutique editorial surface on mobile.
        </Text>
      </View>

      <SectionCard title="Find a story" subtitle="Use the published blog feed from the existing backend.">
        <FormField label="Search" value={search} onChangeText={setSearch} placeholder="Search posts" icon="search" autoCapitalize="sentences" />
      </SectionCard>

      {featuredBlog ? (
        <SectionCard title="Featured story" subtitle={featuredBlog.category || 'HandCraft editorial'}>
          <View style={{ gap: 14 }}>
            {(featuredBlog.coverImage || featuredBlog.featuredImage || featuredBlog.image) ? (
              <View style={{ height: 220, borderRadius: nativeTheme.radius.xl, overflow: 'hidden', backgroundColor: nativeTheme.colors.cardStrong }}>
                <Image source={{ uri: getAssetUrl(featuredBlog.coverImage || featuredBlog.featuredImage || featuredBlog.image) || featuredBlog.coverImage || featuredBlog.featuredImage || featuredBlog.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            ) : null}
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 28, lineHeight: 32 }}>{featuredBlog.title || 'Featured article'}</Text>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 21 }}>{featuredBlog.excerpt || featuredBlog.summary || 'Open this story to read the full article in the mobile flow.'}</Text>
            <AppButton label="Read featured article" icon="arrow-right" onPress={() => router.push(`/blog-single?slug=${encodeURIComponent(String(featuredBlog.slug || ''))}` as never)} />
          </View>
        </SectionCard>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title="No stories found" message="Try another search or publish more content in the existing CMS flow." />
      ) : filtered.slice(featuredBlog ? 1 : 0).map((blog) => (
        <SectionCard key={String(blog._id)} title={blog.title || 'Blog post'} subtitle={blog.category || 'Story'}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="book-open" size={16} color={nativeTheme.colors.primary} />
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{blog.author || 'HandCraft editorial'}</Text>
            </View>
            <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{blog.excerpt || blog.summary || 'Open this story to read the full article in the mobile flow.'}</Text>
            <AppButton label="Read article" icon="arrow-right" variant="secondary" onPress={() => router.push(`/blog-single?slug=${encodeURIComponent(String(blog.slug || ''))}` as never)} />
          </View>
        </SectionCard>
      ))}
    </AppScreen>
  );
}