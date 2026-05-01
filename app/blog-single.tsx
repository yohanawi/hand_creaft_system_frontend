import PageShell from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { createBlogComment, getAssetUrl, getBlogBySlug, getBlogComments, getBlogs } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const blogImageUri = (img?: string) =>
    getAssetUrl(img) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';

const formatDate = (d?: string) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch { return ''; }
};

const stripHtml = (html?: string) => {
    if (!html) return '';
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BlogPost = {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    category?: string;
    author?: { name: string; profile_image?: string };
    readingTimeText?: string;
    views?: number;
    createdAt?: string;
    published_date?: string;
    tags?: string[];
};

type Comment = {
    _id: string;
    user?: { _id: string; name: string } | string;
    comment: string;
    createdAt?: string;
    likes?: string[];
};

const J = {
    gold: '#C9A84C',
    goldLight: '#E8CA7A',
    garnet: '#6B1A2F',
    garnetLight: '#A0344F',
    cream: '#FAF6F0',
    parchment: '#F2EBE0',
    ivory: '#FFFAF5',
    ink: '#2C1A0E',
    wood: '#8B4513',
    woodDark: '#5C3317',
    muted: '#9B7B6A',
    border: '#E8D9C8',
    white: '#FFFFFF',
};

const GoldDivider = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
        <Feather name="star" size={13} color={J.gold} style={{ marginHorizontal: 10 }} />
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: J.goldLight, marginHorizontal: 4 }} />
        <Feather name="star" size={13} color={J.gold} style={{ marginHorizontal: 10 }} />
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
    </View>
);

export default function BlogSingleScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const auth = useAuth();

    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        if (!slug) return;
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const blogRes = await getBlogBySlug(slug as string);
                const b: BlogPost = blogRes.data.blog || blogRes.data;
                if (!mounted) return;
                setBlog(b);
                try {
                    const cr = await getBlogComments(b._id);
                    if (mounted) setComments(cr.data.comments || cr.data || []);
                } catch { /* ignore */ }
                if (b.category) {
                    try {
                        const rel = await getBlogs({ category: b.category, limit: 4, status: 'published' });
                        const list: BlogPost[] = rel.data.data || rel.data.blogs || [];
                        if (mounted) setRelatedBlogs(list.filter((r: BlogPost) => r._id !== b._id).slice(0, 3));
                    } catch { /* ignore */ }
                }
            } catch { /* ignore */ }
            if (mounted) setLoading(false);
        })();
        return () => { mounted = false; };
    }, [slug]);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !blog) return;
        if (!auth?.userToken) { router.push('/login' as any); return; }
        setSubmitting(true);
        setCommentError('');
        try {
            const res = await createBlogComment(blog._id, { comment: commentText.trim() });
            const newComment: Comment = res.data.comment || res.data;
            setComments(prev => [newComment, ...prev]);
            setCommentText('');
        } catch (e: any) {
            setCommentError(e?.response?.data?.message || 'Failed to post comment');
        }
        setSubmitting(false);
    };

    const isMobile = SCREEN_WIDTH < 768;
    const authorInitials = (blog?.author?.name ?? 'A').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={J.garnet} />
                <Text style={styles.loadingText}>Opening the journal...</Text>
            </View>
        );
    }

    if (!blog) {
        return (
            <View style={styles.errorWrap}>
                <Feather name="book-open" size={48} color={J.garnet} />
                <Text style={styles.errorTitle}>Article not found</Text>
                <TouchableOpacity onPress={() => router.push('/blogs' as any)} style={styles.errorBtn}>
                    <Text style={styles.errorBtnText}>Back to Journal</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* ── Hero Banner ──────────────────────────────────── */}
                        <View style={styles.heroWrap}>
                            <Image source={{ uri: blogImageUri(blog.image) }} style={styles.heroImg} resizeMode="cover" />
                            <LinearGradient colors={['transparent', J.ink + 'F0']} style={styles.heroOverlay} />
                            <View style={styles.heroCrumbs}>
                                <TouchableOpacity onPress={() => router.push('/' as any)}>
                                    <Text style={styles.crumbText}>Home</Text>
                                </TouchableOpacity>
                                <Feather name="chevron-right" size={14} color={J.goldLight + '99'} style={{ marginHorizontal: 6 }} />
                                <TouchableOpacity onPress={() => router.push('/blogs' as any)}>
                                    <Text style={styles.crumbText}>Journal</Text>
                                </TouchableOpacity>
                                <Feather name="chevron-right" size={14} color={J.goldLight + '99'} style={{ marginHorizontal: 6 }} />
                                <Text style={[styles.crumbText, { color: J.goldLight }]} numberOfLines={1}>{blog.category}</Text>
                            </View>
                            <View style={styles.heroContent}>
                                {blog.category && (
                                    <View style={styles.catBadge}>
                                        <Text style={styles.catBadgeText}>{blog.category}</Text>
                                    </View>
                                )}
                                <Text style={[styles.heroTitle, isMobile && { fontSize: 24 }]}>{blog.title}</Text>
                                <View style={styles.heroMeta}>
                                    <View style={styles.authorRow}>
                                        <View style={styles.authorAvatar}>
                                            <Text style={styles.authorInitials}>{authorInitials}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.authorName}>{blog.author?.name ?? 'ArtisanGems'}</Text>
                                            <Text style={styles.authorSub}>{formatDate(blog.createdAt || blog.published_date)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.heroMetaRight}>
                                        <Feather name="book-open" size={14} color={J.gold} />
                                        <Text style={styles.heroMetaText}>{blog.readingTimeText ?? '5 min'}</Text>
                                        <Feather name="eye" size={14} color={J.goldLight + 'AA'} style={{ marginLeft: 12 }} />
                                        <Text style={[styles.heroMetaText, { color: J.goldLight + 'AA' }]}>{blog.views ?? 0}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* ── Article Body ─────────────────────────────────── */}
                        <View style={styles.articleWrap}>
                            <GoldDivider />
                            <Text style={styles.articleBody}>{stripHtml(blog.description)}</Text>
                            <GoldDivider />

                            {/* Tags */}
                            {(blog.tags ?? []).length > 0 && (
                                <View style={styles.tagsWrap}>
                                    <Text style={styles.tagsLabel}>✦ Topics</Text>
                                    <View style={styles.tagsRow}>
                                        {(blog.tags ?? []).map(tag => (
                                            <View key={tag} style={styles.tagChip}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Share row */}
                            <View style={styles.shareRow}>
                                <TouchableOpacity style={styles.shareBtn}>
                                    <Feather name="share-2" size={16} color={J.garnet} />
                                    <Text style={styles.shareBtnText}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.shareBtn, { backgroundColor: J.garnet + '18' }]}>
                                    <Feather name="bookmark" size={16} color={J.garnet} />
                                    <Text style={styles.shareBtnText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ── Author Card ──────────────────────────────────── */}
                        <LinearGradient colors={[J.parchment, J.cream]} style={styles.authorCard}>
                            <View style={styles.authorCardInner}>
                                <View style={[styles.authorAvatar, { width: 60, height: 60, borderRadius: 30 }]}>
                                    <Text style={[styles.authorInitials, { fontSize: 22 }]}>{authorInitials}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.authorCardLabel}>✦ WRITTEN BY</Text>
                                    <Text style={styles.authorCardName}>{blog.author?.name ?? 'ArtisanGems'}</Text>
                                    <Text style={styles.authorCardRole}>{blog.category ?? 'Jewellery Expert'}</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* ── Comments ─────────────────────────────────────── */}
                        <View style={styles.commentsWrap}>
                            <Text style={styles.commentsTitle}>Conversations ({comments.length})</Text>
                            <GoldDivider />
                            {comments.map(c => {
                                const userName = typeof c.user === 'object' ? (c.user as any)?.name : 'Guest';
                                const initials = (userName ?? 'G').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <View key={c._id} style={styles.commentCard}>
                                        <View style={[styles.authorAvatar, { width: 38, height: 38, borderRadius: 19 }]}>
                                            <Text style={[styles.authorInitials, { fontSize: 13 }]}>{initials}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <View style={styles.commentHeader}>
                                                <Text style={styles.commentUser}>{userName}</Text>
                                                <Text style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
                                            </View>
                                            <Text style={styles.commentBody}>{c.comment}</Text>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Comment form */}
                            <View style={styles.commentForm}>
                                <Text style={styles.formTitle}>Leave a Note</Text>
                                {auth?.userToken ? (
                                    <>
                                        {!!commentError && <Text style={styles.errorMsg}>{commentError}</Text>}
                                        <TextInput
                                            placeholder="Share your thoughts on this piece..."
                                            placeholderTextColor={J.muted}
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            multiline
                                            numberOfLines={4}
                                            style={styles.commentInput}
                                            textAlignVertical="top"
                                        />
                                        <TouchableOpacity
                                            onPress={handleSubmitComment}
                                            disabled={submitting}
                                            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                        >
                                            <LinearGradient colors={[J.garnetLight, J.garnet]} style={styles.submitBtnGrad}>
                                                <Text style={styles.submitBtnText}>{submitting ? 'Posting...' : 'Post Comment'}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.signInBtn}>
                                        <LinearGradient colors={[J.garnetLight, J.garnet]} style={styles.submitBtnGrad}>
                                            <Text style={styles.submitBtnText}>Sign In to Comment</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* ── Related Articles ─────────────────────────────── */}
                        {relatedBlogs.length > 0 && (
                            <View style={[styles.commentsWrap, { backgroundColor: J.parchment }]}>
                                <Text style={styles.commentsTitle}>From the Atelier</Text>
                                <GoldDivider />
                                <View style={[styles.relatedGrid, !isMobile && { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
                                    {relatedBlogs.map(rel => (
                                        <TouchableOpacity
                                            key={rel._id}
                                            onPress={() => router.push({ pathname: '/blog-single', params: { slug: rel.slug } } as any)}
                                            style={[styles.relatedCard, !isMobile && { width: '31%' }]}
                                            activeOpacity={0.88}
                                        >
                                            <Image source={{ uri: blogImageUri(rel.image) }} style={styles.relatedImg} resizeMode="cover" />
                                            <View style={styles.relatedBody}>
                                                {rel.category && <Text style={styles.relatedCat}>{rel.category}</Text>}
                                                <Text style={styles.relatedTitle} numberOfLines={2}>{rel.title}</Text>
                                                <Text style={styles.relatedDate}>{formatDate(rel.createdAt || rel.published_date)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: J.cream },
    loadingWrap: { flex: 1, backgroundColor: J.cream, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, color: J.muted, fontStyle: 'italic' },
    errorWrap: { flex: 1, backgroundColor: J.cream, alignItems: 'center', justifyContent: 'center', padding: 24 },
    errorTitle: { fontSize: 20, fontWeight: '700', color: J.ink, marginTop: 16 },
    errorBtn: { marginTop: 16, backgroundColor: J.garnet, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
    errorBtnText: { color: J.white, fontWeight: '700' },

    // Hero
    heroWrap: { position: 'relative', height: 400 },
    heroImg: { width: '100%', height: 400 },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },
    heroCrumbs: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center' },
    crumbText: { color: J.goldLight + 'BB', fontSize: 12 },
    heroContent: { position: 'absolute', bottom: 24, left: 20, right: 20 },
    catBadge: { alignSelf: 'flex-start', backgroundColor: J.garnet, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
    catBadgeText: { color: J.white, fontSize: 11, fontWeight: '700' },
    heroTitle: { fontSize: 28, fontWeight: '800', color: J.white, lineHeight: 36, marginBottom: 14 },
    heroMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    authorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: J.garnet, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: J.gold },
    authorInitials: { color: J.white, fontWeight: '700', fontSize: 15 },
    authorName: { color: J.white, fontWeight: '700', fontSize: 13 },
    authorSub: { color: J.goldLight + '99', fontSize: 11 },
    heroMetaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroMetaText: { color: J.gold, fontSize: 12 },

    // Article
    articleWrap: { padding: 24, backgroundColor: J.ivory },
    articleBody: { fontSize: 16, lineHeight: 28, color: J.ink },
    tagsWrap: { marginTop: 8 },
    tagsLabel: { color: J.gold, fontWeight: '700', fontSize: 12, letterSpacing: 1, marginBottom: 10 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: { backgroundColor: J.garnet + '18', borderWidth: 1, borderColor: J.garnet + '33', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
    tagText: { color: J.garnet, fontSize: 12, fontWeight: '600' },
    shareRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: J.parchment, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: J.border },
    shareBtnText: { color: J.garnet, fontWeight: '600', fontSize: 13 },

    // Author card
    authorCard: { margin: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: J.border },
    authorCardInner: { flexDirection: 'row', alignItems: 'center' },
    authorCardLabel: { color: J.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
    authorCardName: { color: J.ink, fontSize: 18, fontWeight: '800', marginTop: 2 },
    authorCardRole: { color: J.muted, fontSize: 13, marginTop: 2 },

    // Comments
    commentsWrap: { padding: 24, backgroundColor: J.cream },
    commentsTitle: { color: J.ink, fontSize: 22, fontWeight: '800' },
    commentCard: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: J.border },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    commentUser: { color: J.ink, fontWeight: '700', fontSize: 13 },
    commentDate: { color: J.muted, fontSize: 11 },
    commentBody: { color: J.ink + 'CC', fontSize: 14, lineHeight: 22 },
    commentForm: { backgroundColor: J.ivory, borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 1, borderColor: J.border },
    formTitle: { color: J.ink, fontSize: 18, fontWeight: '800', marginBottom: 14 },
    errorMsg: { color: '#c0392b', fontSize: 13, marginBottom: 10 },
    commentInput: { backgroundColor: J.white, borderWidth: 1, borderColor: J.border, borderRadius: 12, padding: 14, fontSize: 14, color: J.ink, minHeight: 100 },
    submitBtn: { marginTop: 14, borderRadius: 12, overflow: 'hidden' },
    submitBtnGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
    submitBtnText: { color: J.white, fontWeight: '800', fontSize: 15 },
    signInBtn: { borderRadius: 12, overflow: 'hidden' },

    // Related
    relatedGrid: {},
    relatedCard: { width: '100%', backgroundColor: J.white, borderRadius: 14, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: J.border },
    relatedImg: { width: '100%', height: 140 },
    relatedBody: { padding: 14 },
    relatedCat: { color: J.garnet, fontSize: 11, fontWeight: '700', marginBottom: 4 },
    relatedTitle: { color: J.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
    relatedDate: { color: J.muted, fontSize: 11, marginTop: 4 },
});
