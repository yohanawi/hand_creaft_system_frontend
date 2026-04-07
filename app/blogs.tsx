import PageShell from '@/components/PageShell';
import { getBlogs } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://localhost:5000';

type Blog = {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    description?: string;
    image?: string;
    category?: string;
    author?: { name: string; profile_image?: string };
    readingTimeText?: string;
    views?: number;
    createdAt?: string;
    published_date?: string;
    tags?: string[];
    is_popular?: boolean;
};

const blogImageUri = (img?: string) =>
    img ? (img.startsWith('http') ? img : `${API_BASE}/${img.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600';

const formatDate = (d?: string) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch { return ''; }
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BLOGS_PER_PAGE = 6;

export default function AllBlogsScreen() {
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

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, []);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Fetch blogs from API
    useEffect(() => {
        let mounted = true;
        (async () => {
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
                if (mounted) {
                    const list: Blog[] = data.data || data.blogs || data || [];
                    setBlogs(list);
                    setTotalPages(data.pages ?? Math.ceil((data.total ?? list.length) / BLOGS_PER_PAGE));
                    // Build category list from fetched blogs
                    if (categories.length === 0) {
                        const cats = Array.from(new Set(list.map((b: Blog) => b.category).filter(Boolean))) as string[];
                        setCategories(cats);
                    }
                }
            } catch { /* silently fail */ }
            if (mounted) setLoading(false);
        })();
        return () => { mounted = false; };
    }, [currentPage, debouncedSearch, selectedCategory]);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const featuredBlog = blogs[0] ?? null;
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Hero Section */}
                        <LinearGradient
                            colors={['#8B4513', '#D2691E', '#DEB887'] as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-16 px-4"
                        >
                            <View className="max-w-7xl mx-auto w-full">
                                <Text className={`text-white font-bold mb-4 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                                    Our Blog
                                </Text>
                                <Text className={`text-white mb-8 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                    Discover stories, insights, and inspiration
                                </Text>

                                {/* Search Bar */}
                                <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg">
                                    <Feather name="search" size={20} color="#8B4513" />
                                    <TextInput
                                        placeholder="Search articles..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        className="flex-1 ml-3 text-base"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Loading */}
                        {loading && (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="large" color="#8B4513" />
                            </View>
                        )}

                        {/* Featured Blog */}
                        {!loading && featuredBlog && (
                            <View className="py-12 px-4 bg-craft-50">
                                <View className="max-w-7xl mx-auto w-full">
                                    <Text className="text-gray-900 text-3xl font-bold mb-6">Featured Article</Text>
                                    <TouchableOpacity
                                        onPress={() => router.push({ pathname: '/blog-single', params: { slug: featuredBlog.slug } } as any)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-lg"
                                    >
                                        <Image
                                            source={{ uri: blogImageUri(featuredBlog.image) }}
                                            className={`w-full ${isMobile ? 'h-56' : 'h-96'}`}
                                            resizeMode="cover"
                                        />
                                        <View className="p-6">
                                            <View className="flex-row items-center mb-3">
                                                <View className="bg-brown-primary px-3 py-1 rounded-full mr-3">
                                                    <Text className="text-white font-bold text-xs">{featuredBlog.category}</Text>
                                                </View>
                                                <Text className="text-gray-600">{formatDate(featuredBlog.createdAt || featuredBlog.published_date)}</Text>
                                            </View>
                                            <Text className="text-gray-900 text-2xl font-bold mb-3">
                                                {featuredBlog.title}
                                            </Text>
                                            <Text className="text-gray-700 text-base leading-6 mb-4">
                                                {featuredBlog.excerpt || featuredBlog.description}
                                            </Text>
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <View className="w-10 h-10 rounded-full bg-brown-primary items-center justify-center mr-3">
                                                        <Text className="text-white font-bold">
                                                            {(featuredBlog.author?.name ?? 'A').split(' ').map((n: string) => n[0]).join('')}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-gray-900 font-semibold">{featuredBlog.author?.name ?? ''}</Text>
                                                        <Text className="text-gray-600 text-sm">{featuredBlog.readingTimeText ?? ''} read</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Feather name="eye" size={18} color="#8B4513" />
                                                    <Text className="text-gray-600 ml-1">{featuredBlog.views ?? 0}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Category Filter */}
                        {!loading && (
                            <View className="py-8 px-4 bg-white">
                                <View className="max-w-7xl mx-auto w-full">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => { setSelectedCategory(''); setCurrentPage(1); }}
                                                className={`px-6 py-3 rounded-full ${selectedCategory === '' ? 'bg-brown-primary' : 'bg-craft-100'}`}
                                            >
                                                <Text className={`font-bold ${selectedCategory === '' ? 'text-white' : 'text-brown-primary'}`}>All</Text>
                                            </TouchableOpacity>
                                            {categories.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    onPress={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                                    className={`px-6 py-3 rounded-full ${selectedCategory === cat ? 'bg-brown-primary' : 'bg-craft-100'}`}
                                                >
                                                    <Text className={`font-bold ${selectedCategory === cat ? 'text-white' : 'text-brown-primary'}`}>
                                                        {cat}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        )}

                        {/* Blog Grid */}
                        {!loading && (
                            <View className="py-8 px-4 bg-craft-50">
                                <View className="max-w-7xl mx-auto w-full">
                                    <View className={`flex-row flex-wrap ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                        {blogs.map((blog) => (
                                            <TouchableOpacity
                                                key={blog._id}
                                                onPress={() => router.push({ pathname: '/blog-single', params: { slug: blog.slug } } as any)}
                                                className={`bg-white rounded-2xl overflow-hidden shadow-lg mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[32%]'
                                                    }`}
                                            >
                                                <Image
                                                    source={{ uri: blogImageUri(blog.image) }}
                                                    className="w-full h-48"
                                                    resizeMode="cover"
                                                />
                                                <View className="p-5">
                                                    <View className="flex-row items-center mb-3">
                                                        <View className="bg-brown-primary px-3 py-1 rounded-full mr-3">
                                                            <Text className="text-white font-bold text-xs">{blog.category}</Text>
                                                        </View>
                                                        <Text className="text-gray-600 text-sm">{formatDate(blog.createdAt || blog.published_date)}</Text>
                                                    </View>
                                                    <Text className="text-gray-900 text-xl font-bold mb-2" numberOfLines={2}>
                                                        {blog.title}
                                                    </Text>
                                                    <Text className="text-gray-700 leading-6 mb-4" numberOfLines={3}>
                                                        {blog.excerpt || blog.description}
                                                    </Text>
                                                    <View className="flex-row items-center justify-between pt-4 border-t border-gray-200">
                                                        <View className="flex-row items-center">
                                                            <View className="w-8 h-8 rounded-full bg-brown-primary items-center justify-center mr-2">
                                                                <Text className="text-white text-xs font-bold">
                                                                    {(blog.author?.name ?? 'A').split(' ').map((n: string) => n[0]).join('')}
                                                                </Text>
                                                            </View>
                                                            <Text className="text-gray-900 text-sm font-semibold">{blog.author?.name ?? ''}</Text>
                                                        </View>
                                                        <View className="flex-row items-center">
                                                            <Feather name="clock" size={14} color="#999" />
                                                            <Text className="text-gray-600 text-sm ml-1">{blog.readingTimeText ?? ''}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <View className="flex-row justify-center items-center mt-8">
                                            <TouchableOpacity
                                                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className={`w-10 h-10 rounded-lg items-center justify-center mr-2 ${currentPage === 1 ? 'bg-gray-200' : 'bg-craft-100'
                                                    }`}
                                            >
                                                <Feather
                                                    name="chevron-left"
                                                    size={20}
                                                    color={currentPage === 1 ? '#999' : '#8B4513'}
                                                />
                                            </TouchableOpacity>

                                            {[...Array(totalPages)].map((_, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => setCurrentPage(index + 1)}
                                                    className={`w-10 h-10 rounded-lg items-center justify-center mx-1 ${currentPage === index + 1 ? 'bg-brown-primary' : 'bg-craft-100'
                                                        }`}
                                                >
                                                    <Text className={`font-bold ${currentPage === index + 1 ? 'text-white' : 'text-brown-primary'
                                                        }`}>
                                                        {index + 1}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}

                                            <TouchableOpacity
                                                onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`w-10 h-10 rounded-lg items-center justify-center ml-2 ${currentPage === totalPages ? 'bg-gray-200' : 'bg-craft-100'
                                                    }`}
                                            >
                                                <Feather
                                                    name="chevron-right"
                                                    size={20}
                                                    color={currentPage === totalPages ? '#999' : '#8B4513'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Newsletter Section */}
                        <View className="py-16 px-4 bg-brown-primary">
                            <View className="max-w-7xl mx-auto w-full text-center">
                                <Text className={`text-white font-bold mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                    Subscribe to Our Newsletter
                                </Text>
                                <Text className="text-white text-lg mb-8 opacity-90">
                                    Get the latest articles and insights delivered to your inbox
                                </Text>
                                <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-3 max-w-xl mx-auto`}>
                                    <TextInput
                                        placeholder="Enter your email"
                                        className="flex-1 bg-white rounded-xl px-6 py-4 text-base"
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity className="bg-craft-900 rounded-xl px-8 py-4 items-center justify-center">
                                        <Text className="text-white font-bold text-lg">Subscribe</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                </PageShell>
            </ScrollView>
        </View>
    );
}
