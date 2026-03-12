import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BlogSingleScreen() {
    const router = useRouter();
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;

    const blog = {
        title: 'Top 10 Tech Gadgets for 2024',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        category: 'Technology',
        author: 'John Smith',
        authorBio: 'Tech enthusiast and writer with over 10 years of experience in the tech industry.',
        date: 'March 20, 2024',
        readTime: '8 min',
        likes: 245,
        comments: 32,
        views: 1523,
    };

    const comments = [
        {
            id: 1,
            name: 'Sarah Johnson',
            date: 'March 21, 2024',
            comment: 'Great article! I especially loved your insights on the smart home devices. Very informative and well-written.',
        },
        {
            id: 2,
            name: 'Mike Anderson',
            date: 'March 20, 2024',
            comment: 'This is exactly what I was looking for. Thanks for the detailed breakdown of each gadget!',
        },
        {
            id: 3,
            name: 'Emily Chen',
            date: 'March 20, 2024',
            comment: 'Bookmarked for later! These gadgets look amazing. Can\'t wait to get my hands on some of them.',
        },
    ];

    const relatedBlogs = [
        {
            id: 1,
            title: 'The Future of Artificial Intelligence',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
            category: 'Technology',
            date: 'March 18, 2024',
        },
        {
            id: 2,
            title: 'Smart Home Essentials for Modern Living',
            image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
            category: 'Technology',
            date: 'March 15, 2024',
        },
        {
            id: 3,
            title: 'Wearable Tech: What\'s Next in 2024',
            image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
            category: 'Technology',
            date: 'March 12, 2024',
        },
    ];

    const tags = ['Technology', 'Gadgets', '2024', 'Innovation', 'Smart Devices', 'Reviews'];

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View className="px-4 py-8">
                            <View className="w-full max-w-4xl mx-auto">
                                {/* Breadcrumb */}
                                <View className="flex-row items-center mb-6">
                                    <TouchableOpacity onPress={() => router.push('/' as any)}>
                                        <Text className="text-gray-600">Home</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={16} color="#999" style={{ marginHorizontal: 8 }} />
                                    <TouchableOpacity onPress={() => router.push('/all-blogs' as any)}>
                                        <Text className="text-gray-600">Blog</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={16} color="#999" style={{ marginHorizontal: 8 }} />
                                    <Text className="font-semibold text-brown-primary">Article</Text>
                                </View>

                                {/* Blog Header */}
                                <View className="mb-6">
                                    <View className="flex-row items-center mb-4">
                                        <View className="px-3 py-1 mr-3 rounded-full bg-brown-primary">
                                            <Text className="text-xs font-bold text-white">{blog.category}</Text>
                                        </View>
                                        <Text className="text-gray-600">{blog.date}</Text>
                                    </View>

                                    <Text className={`text-gray-900 font-bold mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                                        {blog.title}
                                    </Text>

                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start mb-6`}>
                                        <View className="flex-row items-center mb-4">
                                            <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-brown-primary">
                                                <Text className="text-lg font-bold text-white">
                                                    {blog.author.split(' ').map(n => n[0]).join('')}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text className="text-lg font-bold text-gray-900">{blog.author}</Text>
                                                <Text className="text-gray-600">{blog.readTime} read • {blog.views} views</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-4">
                                            <TouchableOpacity className="flex-row items-center px-4 py-2 bg-craft-50 rounded-xl">
                                                <Feather name="heart" size={20} color="#8B4513" />
                                                <Text className="ml-2 font-bold text-brown-primary">{blog.likes}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity className="flex-row items-center px-4 py-2 bg-craft-50 rounded-xl">
                                                <Feather name="bookmark" size={20} color="#8B4513" />
                                            </TouchableOpacity>
                                            <TouchableOpacity className="flex-row items-center px-4 py-2 bg-craft-50 rounded-xl">
                                                <Feather name="share-2" size={20} color="#8B4513" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Featured Image */}
                                <Image
                                    source={{ uri: blog.image }}
                                    className={`w-full rounded-2xl mb-8 ${isMobile ? 'h-64' : 'h-96'}`}
                                    resizeMode="cover"
                                />

                                {/* Blog Content */}
                                <View className="mb-12">
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        In the ever-evolving world of technology, 2024 has brought us some truly remarkable gadgets that are changing the way we live, work, and play. From cutting-edge smartphones to innovative smart home devices, here's our comprehensive guide to the top tech gadgets that deserve your attention this year.
                                    </Text>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        1. Next-Gen Smartphones
                                    </Text>
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        The latest smartphones have pushed the boundaries of what's possible. With advanced AI capabilities, improved camera systems featuring multiple lenses, and 5G connectivity becoming standard, these devices are more powerful than ever. The integration of foldable displays has also become more refined, offering users unprecedented flexibility in how they use their devices.
                                    </Text>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        2. Wireless Earbuds Evolution
                                    </Text>
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        Premium wireless earbuds now offer studio-quality sound with active noise cancellation that rivals over-ear headphones. Features like spatial audio, adaptive transparency mode, and extended battery life make them perfect companions for daily commutes or intense workout sessions. The latest models also include health monitoring features like heart rate tracking.
                                    </Text>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        3. Smart Home Hubs
                                    </Text>
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        Smart home technology has matured significantly. Modern smart hubs integrate seamlessly with various devices, allowing you to control lighting, temperature, security, and entertainment systems from a single interface. Voice assistants have become more intelligent and responsive, understanding context better than ever before.
                                    </Text>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        4. Wearable Fitness Technology
                                    </Text>
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        The latest smartwatches and fitness trackers offer comprehensive health monitoring, including advanced sleep tracking, stress management, and even ECG capabilities. These devices have become invaluable tools for maintaining and improving overall wellness, with AI-powered insights that help users make better health decisions.
                                    </Text>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        5. Gaming Consoles & Accessories
                                    </Text>
                                    <Text className="mb-6 text-lg leading-8 text-gray-800">
                                        Next-generation gaming consoles deliver breathtaking graphics and immersive experiences. With support for ray tracing, 4K resolution at high frame rates, and incredibly fast load times thanks to SSD technology, gaming has reached new heights. VR headsets have also become more accessible and comfortable for extended play sessions.
                                    </Text>

                                    <View className="p-6 my-8 border-l-4 bg-craft-50 border-brown-primary rounded-r-xl">
                                        <Text className="text-xl italic leading-8 text-gray-800">
                                            "Technology is best when it brings people together and improves lives. These gadgets represent the cutting edge of innovation, designed to make our daily experiences better, more efficient, and more enjoyable."
                                        </Text>
                                    </View>

                                    <Text className="mb-4 text-2xl font-bold text-gray-900">
                                        Conclusion
                                    </Text>
                                    <Text className="text-lg leading-8 text-gray-800">
                                        As we continue through 2024, these gadgets represent the pinnacle of technological achievement. Whether you're looking to upgrade your smartphone, enhance your home automation, or improve your fitness tracking, there's never been a better time to embrace the latest technology. The key is finding devices that genuinely improve your daily life and align with your personal needs and preferences.
                                    </Text>
                                </View>

                                {/* Tags */}
                                <View className="py-6 mb-8 border-t border-b border-gray-200">
                                    <Text className="mb-3 text-lg font-bold text-gray-900">Tags:</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <TouchableOpacity
                                                key={tag}
                                                className="px-4 py-2 rounded-full bg-craft-100"
                                            >
                                                <Text className="font-semibold text-brown-primary">{tag}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Author Info */}
                                <View className="p-6 mb-12 bg-craft-50 rounded-2xl">
                                    <Text className="mb-4 text-xl font-bold text-gray-900">About the Author</Text>
                                    <View className="flex-row items-start">
                                        <View className="items-center justify-center w-16 h-16 mr-4 rounded-full bg-brown-primary">
                                            <Text className="text-2xl font-bold text-white">
                                                {blog.author.split(' ').map(n => n[0]).join('')}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="mb-2 text-lg font-bold text-gray-900">{blog.author}</Text>
                                            <Text className="mb-3 leading-6 text-gray-700">{blog.authorBio}</Text>
                                            <View className="flex-row gap-3">
                                                <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brown-primary">
                                                    <Feather name="twitter" size={18} color="#FFF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brown-primary">
                                                    <Feather name="linkedin" size={18} color="#FFF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brown-primary">
                                                    <Feather name="mail" size={18} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Comments Section */}
                                <View className="mb-12">
                                    <Text className="mb-6 text-2xl font-bold text-gray-900">
                                        Comments ({comments.length})
                                    </Text>

                                    {comments.map((c) => (
                                        <View key={c.id} className="pb-6 mb-6 border-b border-gray-200">
                                            <View className="flex-row items-start mb-3">
                                                <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-brown-primary">
                                                    <Text className="font-bold text-white">
                                                        {c.name.split(' ').map(n => n[0]).join('')}
                                                    </Text>
                                                </View>
                                                <View className="flex-1">
                                                    <View className="flex-row items-start justify-between mb-2">
                                                        <Text className="font-bold text-gray-900">{c.name}</Text>
                                                        <Text className="text-sm text-gray-600">{c.date}</Text>
                                                    </View>
                                                    <Text className="leading-6 text-gray-700">{c.comment}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Comment Form */}
                                    <View className="p-6 bg-craft-50 rounded-2xl">
                                        <Text className="mb-4 text-xl font-bold text-gray-900">Leave a Comment</Text>

                                        <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-4`}>
                                            <TextInput
                                                placeholder="Your Name *"
                                                value={name}
                                                onChangeText={setName}
                                                className="flex-1 px-4 py-3 text-base bg-white border border-gray-300 rounded-xl"
                                                placeholderTextColor="#999"
                                            />
                                            <TextInput
                                                placeholder="Your Email *"
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                className="flex-1 px-4 py-3 text-base bg-white border border-gray-300 rounded-xl"
                                                placeholderTextColor="#999"
                                            />
                                        </View>

                                        <TextInput
                                            placeholder="Your Comment *"
                                            value={comment}
                                            onChangeText={setComment}
                                            multiline
                                            numberOfLines={4}
                                            className="px-4 py-3 mb-4 text-base bg-white border border-gray-300 rounded-xl"
                                            style={{ textAlignVertical: 'top' }}
                                            placeholderTextColor="#999"
                                        />

                                        <TouchableOpacity className="items-center py-4 bg-brown-primary rounded-xl">
                                            <Text className="text-lg font-bold text-white">Post Comment</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Related Articles */}
                                <View>
                                    <Text className="mb-6 text-2xl font-bold text-gray-900">Related Articles</Text>
                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
                                        {relatedBlogs.map((related) => (
                                            <TouchableOpacity
                                                key={related.id}
                                                onPress={() => router.push('/blog-single' as any)}
                                                className="flex-1 overflow-hidden bg-white shadow-lg rounded-2xl"
                                            >
                                                <Image
                                                    source={{ uri: related.image }}
                                                    className="w-full h-48"
                                                    resizeMode="cover"
                                                />
                                                <View className="p-4">
                                                    <View className="flex-row items-center mb-2">
                                                        <View className="px-3 py-1 mr-2 rounded-full bg-brown-primary">
                                                            <Text className="text-xs font-bold text-white">{related.category}</Text>
                                                        </View>
                                                        <Text className="text-xs text-gray-600">{related.date}</Text>
                                                    </View>
                                                    <Text className="font-bold text-gray-900" numberOfLines={2}>
                                                        {related.title}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                </PageShell>
            </ScrollView>
        </View>
    );
}
