import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AllBlogsScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const categories = ['All', 'Technology', 'Fashion', 'Lifestyle', 'Business', 'Travel', 'Food'];

    const blogs = [
        {
            id: 1,
            title: 'Top 10 Tech Gadgets for 2024',
            excerpt: 'Discover the most innovative and game-changing tech products that are revolutionizing the way we live and work.',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
            category: 'Technology',
            author: 'John Smith',
            date: 'March 20, 2024',
            readTime: '8 min',
            likes: 245,
            comments: 32,
        },
        {
            id: 2,
            title: 'Summer Fashion Trends You Need to Know',
            excerpt: 'Stay ahead of the curve with these hot summer fashion trends that are taking over runways and streets.',
            image: 'https://images.unsplash.com/photo-1558769132-cb1aea1f1093?w=600',
            category: 'Fashion',
            author: 'Emily Davis',
            date: 'March 18, 2024',
            readTime: '6 min',
            likes: 189,
            comments: 24,
        },
        {
            id: 3,
            title: 'Minimalist Living: A Complete Guide',
            excerpt: 'Learn how to declutter your life and embrace minimalism for a more peaceful and intentional lifestyle.',
            image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600',
            category: 'Lifestyle',
            author: 'Sarah Wilson',
            date: 'March 15, 2024',
            readTime: '10 min',
            likes: 312,
            comments: 45,
        },
        {
            id: 4,
            title: 'Building a Successful Startup in 2024',
            excerpt: 'Essential tips and strategies for entrepreneurs looking to launch and grow their startups in today\'s competitive market.',
            image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600',
            category: 'Business',
            author: 'Michael Chen',
            date: 'March 12, 2024',
            readTime: '12 min',
            likes: 278,
            comments: 38,
        },
        {
            id: 5,
            title: 'Hidden Gems: Off-the-Beaten-Path Destinations',
            excerpt: 'Explore incredible travel destinations that are still relatively undiscovered by mass tourism.',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
            category: 'Travel',
            author: 'Lisa Anderson',
            date: 'March 10, 2024',
            readTime: '9 min',
            likes: 421,
            comments: 56,
        },
        {
            id: 6,
            title: 'Healthy Meal Prep Ideas for Busy Professionals',
            excerpt: 'Quick and nutritious meal prep recipes that will save you time and keep you energized throughout the week.',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
            category: 'Food',
            author: 'David Miller',
            date: 'March 8, 2024',
            readTime: '7 min',
            likes: 356,
            comments: 42,
        },
        {
            id: 7,
            title: 'The Future of Artificial Intelligence',
            excerpt: 'How AI is transforming industries and what it means for the future of work and society.',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
            category: 'Technology',
            author: 'Alex Thompson',
            date: 'March 5, 2024',
            readTime: '11 min',
            likes: 498,
            comments: 67,
        },
        {
            id: 8,
            title: 'Sustainable Fashion: Making Ethical Choices',
            excerpt: 'Understanding the impact of fast fashion and how to build a more sustainable wardrobe.',
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
            category: 'Fashion',
            author: 'Emma Roberts',
            date: 'March 3, 2024',
            readTime: '8 min',
            likes: 267,
            comments: 31,
        },
        {
            id: 9,
            title: 'Work-Life Balance in the Digital Age',
            excerpt: 'Practical strategies for maintaining healthy boundaries between work and personal life.',
            image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600',
            category: 'Lifestyle',
            author: 'James Wilson',
            date: 'March 1, 2024',
            readTime: '6 min',
            likes: 334,
            comments: 48,
        },
    ];

    const filteredBlogs = selectedCategory === 'all'
        ? blogs
        : blogs.filter(blog => blog.category.toLowerCase() === selectedCategory);

    const blogsPerPage = 6;
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const displayedBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage);

    const featuredBlog = blogs[0];

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

                        {/* Featured Blog */}
                        <View className="py-12 px-4 bg-craft-50">
                            <View className="max-w-7xl mx-auto w-full">
                                <Text className="text-gray-900 text-3xl font-bold mb-6">Featured Article</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/blog-single' as any)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg"
                                >
                                    <Image
                                        source={{ uri: featuredBlog.image }}
                                        className={`w-full ${isMobile ? 'h-56' : 'h-96'}`}
                                        resizeMode="cover"
                                    />
                                    <View className="p-6">
                                        <View className="flex-row items-center mb-3">
                                            <View className="bg-brown-primary px-3 py-1 rounded-full mr-3">
                                                <Text className="text-white font-bold text-xs">{featuredBlog.category}</Text>
                                            </View>
                                            <Text className="text-gray-600">{featuredBlog.date}</Text>
                                        </View>
                                        <Text className="text-gray-900 text-2xl font-bold mb-3">
                                            {featuredBlog.title}
                                        </Text>
                                        <Text className="text-gray-700 text-base leading-6 mb-4">
                                            {featuredBlog.excerpt}
                                        </Text>
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <View className="w-10 h-10 rounded-full bg-brown-primary items-center justify-center mr-3">
                                                    <Text className="text-white font-bold">
                                                        {featuredBlog.author.split(' ').map(n => n[0]).join('')}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text className="text-gray-900 font-semibold">{featuredBlog.author}</Text>
                                                    <Text className="text-gray-600 text-sm">{featuredBlog.readTime} read</Text>
                                                </View>
                                            </View>
                                            <View className="flex-row items-center">
                                                <View className="flex-row items-center mr-4">
                                                    <Feather name="heart" size={18} color="#8B4513" />
                                                    <Text className="text-gray-600 ml-1">{featuredBlog.likes}</Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Feather name="message-circle" size={18} color="#8B4513" />
                                                    <Text className="text-gray-600 ml-1">{featuredBlog.comments}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Category Filter */}
                        <View className="py-8 px-4 bg-white">
                            <View className="max-w-7xl mx-auto w-full">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="flex-row gap-3">
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => {
                                                    setSelectedCategory(cat.toLowerCase());
                                                    setCurrentPage(1);
                                                }}
                                                className={`px-6 py-3 rounded-full ${selectedCategory === cat.toLowerCase()
                                                    ? 'bg-brown-primary'
                                                    : 'bg-craft-100'
                                                    }`}
                                            >
                                                <Text className={`font-bold ${selectedCategory === cat.toLowerCase()
                                                    ? 'text-white'
                                                    : 'text-brown-primary'
                                                    }`}>
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>

                        {/* Blog Grid */}
                        <View className="py-8 px-4 bg-craft-50">
                            <View className="max-w-7xl mx-auto w-full">
                                <View className={`flex-row flex-wrap ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                    {displayedBlogs.map((blog) => (
                                        <TouchableOpacity
                                            key={blog.id}
                                            onPress={() => router.push('/blog-single' as any)}
                                            className={`bg-white rounded-2xl overflow-hidden shadow-lg mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[32%]'
                                                }`}
                                        >
                                            <Image
                                                source={{ uri: blog.image }}
                                                className="w-full h-48"
                                                resizeMode="cover"
                                            />
                                            <View className="p-5">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="bg-brown-primary px-3 py-1 rounded-full mr-3">
                                                        <Text className="text-white font-bold text-xs">{blog.category}</Text>
                                                    </View>
                                                    <Text className="text-gray-600 text-sm">{blog.date}</Text>
                                                </View>
                                                <Text className="text-gray-900 text-xl font-bold mb-2" numberOfLines={2}>
                                                    {blog.title}
                                                </Text>
                                                <Text className="text-gray-700 leading-6 mb-4" numberOfLines={3}>
                                                    {blog.excerpt}
                                                </Text>
                                                <View className="flex-row items-center justify-between pt-4 border-t border-gray-200">
                                                    <View className="flex-row items-center">
                                                        <View className="w-8 h-8 rounded-full bg-brown-primary items-center justify-center mr-2">
                                                            <Text className="text-white text-xs font-bold">
                                                                {blog.author.split(' ').map(n => n[0]).join('')}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-gray-900 text-sm font-semibold">{blog.author}</Text>
                                                    </View>
                                                    <View className="flex-row items-center">
                                                        <Feather name="clock" size={14} color="#999" />
                                                        <Text className="text-gray-600 text-sm ml-1">{blog.readTime}</Text>
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
