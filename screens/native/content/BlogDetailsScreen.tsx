import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useAuth } from '@/context/AuthContext';
import { createBlogComment, getAssetUrl, getBlogBySlug, getBlogComments } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

export default function BlogDetailsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const auth = useAuth();

  const [blog, setBlog] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!slug) {
      setBlog(null);
      setComments([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const blogRes = await getBlogBySlug(String(slug));
        const nextBlog = blogRes.data?.blog || blogRes.data;
        const commentsRes = await getBlogComments(nextBlog._id).catch(() => ({ data: [] }));
        if (!mounted) {
          return;
        }
        setBlog(nextBlog);
        setComments(commentsRes.data?.comments || commentsRes.data || []);
      } catch {
        if (mounted) {
          setBlog(null);
          setComments([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (!blog) {
    return (
      <AppScreen title="Blog" subtitle="Open a published article in the native customer app." canGoBack>
        <SectionCard title="Article unavailable" subtitle="Select another published post from the blogs list.">
          <AppButton label="Back to blogs" onPress={() => router.replace('/blogs' as never)} />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen title={blog.title || 'Article'} subtitle={blog.category || 'Published story'} canGoBack showPageIntro={false}>
      <View
        style={{
          borderRadius: 32,
          overflow: 'hidden',
          backgroundColor: nativeTheme.colors.primaryDark,
          ...nativeTheme.shadows.strong,
        }}
      >
        {(blog.coverImage || blog.featuredImage || blog.image) ? (
          <View style={{ height: 240, backgroundColor: nativeTheme.colors.cardStrong }}>
            <Image source={{ uri: getAssetUrl(blog.coverImage || blog.featuredImage || blog.image) || blog.coverImage || blog.featuredImage || blog.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
        ) : null}
        <View style={{ padding: 22, gap: 12 }}>
          <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>{blog.title || 'Article'}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>{blog.author || 'HandCraft editorial'} • {blog.category || 'Published story'}</Text>
        </View>
      </View>

      <SectionCard title="Article" subtitle={blog.author || 'HandCraft editorial'}>
        <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 24 }}>{blog.content || blog.body || blog.excerpt || 'No article content available.'}</Text>
      </SectionCard>

      <SectionCard title="Comments" subtitle="Keep customer discussion available on mobile too.">
        <View style={{ gap: 10 }}>
          {comments.length > 0 ? comments.map((comment) => (
            <View key={String(comment._id)} style={{ padding: 12, borderRadius: 18, backgroundColor: nativeTheme.colors.cardStrong }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{comment?.user?.name || 'Reader'}</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{comment?.comment || ''}</Text>
            </View>
          )) : <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>No comments yet.</Text>}
          {auth.userToken ? (
            <>
              <FormField label="Add a comment" value={commentText} onChangeText={setCommentText} placeholder="Share your thoughts" icon="message-square" multiline autoCapitalize="sentences" />
              <AppButton
                label="Post comment"
                icon="send"
                onPress={async () => {
                  if (!commentText.trim()) {
                    return;
                  }
                  const response = await createBlogComment(blog._id, { comment: commentText.trim() });
                  setComments((current) => [response.data?.comment || response.data, ...current]);
                  setCommentText('');
                }}
              />
            </>
          ) : (
            <AppButton label="Log in to comment" icon="log-in" variant="secondary" onPress={() => router.push('/login' as never)} />
          )}
        </View>
      </SectionCard>
    </AppScreen>
  );
}