import BlogCategoryFilter from '@/components/Blog/BlogCategoryFilter';
import BlogGrid from '@/components/Blog/BlogGrid';
import BlogHero from '@/components/Blog/BlogHero';
import BlogNewsletter from '@/components/Blog/BlogNewsletter';
import BlogPagination from '@/components/Blog/BlogPagination';
import { Blog, BLOG_COLORS, BLOGS_PER_PAGE } from '@/components/Blog/blogTheme';
import PageShell from '@/components/PageShell';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { getBlogs } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Text, View, } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AllBlogsScreen() {

    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 450);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        let mounted = true;

        const loadBlogs = async () => {
            setLoading(true);

            try {
                const params: any = {
                    page: currentPage,
                    limit: BLOGS_PER_PAGE,
                    status: 'published',
                };

                if (debouncedSearch) params.search = debouncedSearch;
                if (selectedCategory) params.category = selectedCategory;

                const res = await getBlogs(params);
                const data = res.data;
                const list: Blog[] = data.data || data.blogs || data || [];

                if (!mounted) return;

                setBlogs(list);
                setTotalPages(
                    data.pages ??
                    Math.max(1, Math.ceil((data.total ?? list.length) / BLOGS_PER_PAGE))
                );

                if (categories.length === 0) {
                    const cats = Array.from(
                        new Set(list.map((b) => b.category).filter(Boolean))
                    ) as string[];

                    setCategories(cats);
                }
            } catch {
                if (mounted) setBlogs([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadBlogs();

        return () => {
            mounted = false;
        };
    }, [currentPage, debouncedSearch, selectedCategory]);

    const featuredBlog = blogs[0] ?? null;
    const gridBlogs = useMemo(() => blogs.slice(featuredBlog ? 1 : 0), [blogs]);

    const openBlog = (blog: Blog) => {
        router.push({
            pathname: '/blog-single',
            params: { slug: blog.slug },
        } as any);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: BLOG_COLORS.cream }}>
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }} className="py-32">
                        <BlogHero searchQuery={searchQuery} onSearchChange={setSearchQuery} isMobile={isMobile} />

                        {loading && (
                            <View className="items-center py-16">
                                <ActivityIndicator size="large" color={BLOG_COLORS.brown2} />
                                <Text className="mt-4 text-sm font-semibold text-[#8A7565]">
                                    Loading artisan stories...
                                </Text>
                            </View>
                        )}

                        {!loading && (
                            <>
                                <BlogCategoryFilter categories={categories} selectedCategory={selectedCategory}
                                    onSelect={(cat) => {
                                        setSelectedCategory(cat);
                                        setCurrentPage(1);
                                    }}
                                />

                                <View className="px-4 py-12">
                                    <View className="w-full mx-auto max-w-7xl">
                                        <BlogGrid blogs={gridBlogs.length ? gridBlogs : blogs} isMobile={isMobile} isTablet={isTablet} onBlogPress={openBlog} />
                                        <BlogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </View>
                                </View>
                                <BlogNewsletter isMobile={isMobile} />
                            </>
                        )}
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}