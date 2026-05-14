import SingleBlogContent from '@/components/Blog/single-blog/SingleBlogContent';
import SingleBlogHero from '@/components/Blog/single-blog/SingleBlogHero';
import SingleBlogLoading from '@/components/Blog/single-blog/SingleBlogLoading';
import {
    BlogComment,
    BlogPost,
    SINGLE_BLOG_COLORS,
} from '@/components/Blog/single-blog/singleBlogTheme';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import {
    createBlogComment,
    getBlogBySlug,
    getBlogComments,
    getBlogs,
} from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BlogSingleScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const scrollRef = useRef<typeof Animated.ScrollView>(null);
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const auth = useAuth();

    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isMobile = SCREEN_WIDTH < 768;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (!slug) return;

        let mounted = true;

        const loadSingleBlog = async () => {
            setLoading(true);

            try {
                const blogRes = await getBlogBySlug(slug as string);
                const selectedBlog: BlogPost = blogRes.data.blog || blogRes.data;

                if (!mounted) return;

                setBlog(selectedBlog);

                try {
                    const commentsRes = await getBlogComments(selectedBlog._id);
                    if (mounted) {
                        setComments(commentsRes.data.comments || commentsRes.data || []);
                    }
                } catch {
                    if (mounted) setComments([]);
                }

                if (selectedBlog.category) {
                    try {
                        const relatedRes = await getBlogs({
                            category: selectedBlog.category,
                            limit: 6,
                            status: 'published',
                        });

                        const list: BlogPost[] =
                            relatedRes.data.data || relatedRes.data.blogs || [];

                        if (mounted) {
                            setRelatedBlogs(
                                list.filter((item) => item._id !== selectedBlog._id).slice(0, 5)
                            );
                        }
                    } catch {
                        if (mounted) setRelatedBlogs([]);
                    }
                }
            } catch {
                if (mounted) setBlog(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadSingleBlog();

        return () => {
            mounted = false;
        };
    }, [slug]);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !blog) return;

        if (!auth?.userToken) {
            router.push('/login' as any);
            return;
        }

        setSubmitting(true);
        setCommentError('');

        try {
            const res = await createBlogComment(blog._id, {
                comment: commentText.trim(),
            });

            const newComment: BlogComment = res.data.comment || res.data;

            setComments((prev) => [newComment, ...prev]);
            setCommentText('');
        } catch (e: any) {
            setCommentError(e?.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <SingleBlogLoading />;

    if (!blog) {
        return (
            <SingleBlogLoading
                type="not-found"
                onBack={() => router.push('/blogs' as any)}
            />
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: SINGLE_BLOG_COLORS.cream }}>
            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <SingleBlogHero
                            blog={blog}
                            isMobile={isMobile}
                            onBackHome={() => router.push('/' as any)}
                            onBackBlogs={() => router.push('/blogs' as any)}
                            onScrollToContent={() => {
                                scrollRef.current?.scrollTo({
                                    y: 620,
                                    animated: true,
                                });
                            }}
                        />

                        <SingleBlogContent
                            blog={blog}
                            relatedBlogs={relatedBlogs}
                            comments={comments}
                            commentText={commentText}
                            submitting={submitting}
                            error={commentError}
                            isMobile={isMobile}
                            onChangeComment={setCommentText}
                            onSubmitComment={handleSubmitComment}
                            onRelatedPress={(item) =>
                                router.push({
                                    pathname: '/blog-single',
                                    params: { slug: item.slug },
                                } as any)
                            }
                            onViewAllBlogs={() => router.push('/blogs' as any)}
                        />
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}