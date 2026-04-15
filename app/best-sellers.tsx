import PageShell from '@/components/PageShell';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { getProducts } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://localhost:5000';

const productImageUri = (img?: string) =>
    img ? (img.startsWith('http') ? img : `${API_BASE}/${img.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Product = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    thumbnailImage?: string;
    images?: string[];
    category?: { _id: string; name: string; slug: string } | string;
    averageRating?: number;
    reviewCount?: number;
};

const RANK_BADGES = ['🔥', '⭐', '💎'];
const RANK_COLORS: [string, string][] = [
    ['#FFD700', '#FFA500'],
    ['#C0C0C0', '#808080'],
    ['#CD7F32', '#8B4513'],
];

export default function BestSellersScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('weekly');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getProducts({ sort: 'popular', limit: 12 });
                const list: Product[] = res.data.products || res.data.data || res.data || [];
                setProducts(list);
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const filters = ['Daily', 'Weekly', 'Monthly', 'All Time'];

    const rawCategories = products.map(p => typeof p.category === 'object' ? p.category?.name : '').filter(Boolean);
    const uniqueCategories = ['All', ...Array.from(new Set(rawCategories))];

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => {
            const cat = typeof p.category === 'object' ? p.category?.name?.toLowerCase() : '';
            return cat === selectedCategory;
        });

    const topThree = filteredProducts.slice(0, 3);
    const restProducts = filteredProducts.slice(3);

    const getImage = (p: Product) => productImageUri(p.thumbnailImage || p.images?.[0]);

    const renderStars = (rating: number) => (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <Feather key={star} name="star" size={14}
                    color={star <= Math.floor(rating) ? '#FFD700' : '#E5E5E5'}
                    style={{ marginRight: 2 }}
                />
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Hero Section */}
                        <LinearGradient
                            colors={['#8B4513', '#D2691E', '#CD853F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="px-4 py-16"
                        >
                            <View className="w-full mx-auto max-w-7xl">
                                <View className="items-center">
                                    <View className="flex-row items-center mb-4">
                                        <View className="p-3 mr-3 bg-yellow-400 rounded-full">
                                            <Feather name="award" size={32} color="#8B4513" />
                                        </View>
                                        <Text className="text-4xl font-bold text-white">Best Sellers</Text>
                                    </View>
                                    <Text className="max-w-2xl text-lg text-center text-white/90">
                                        Discover our most popular products loved by thousands of customers
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>

                        <View className="px-4 py-8">
                            <View className="w-full mx-auto max-w-7xl">
                                {/* Filter Tabs */}
                                <View className="mb-8">
                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between mb-6`}>
                                        <Text className="mb-4 text-2xl font-bold text-gray-900">Top Performers</Text>
                                        <View className="flex-row gap-2">
                                            {filters.map((filter) => (
                                                <TouchableOpacity
                                                    key={filter}
                                                    onPress={() => setSelectedFilter(filter.toLowerCase())}
                                                    className={`px-4 py-2 rounded-full ${selectedFilter === filter.toLowerCase()
                                                        ? 'bg-brown-primary'
                                                        : 'bg-white border border-gray-300'
                                                        }`}
                                                >
                                                    <Text className={`font-bold text-sm ${selectedFilter === filter.toLowerCase() ? 'text-white' : 'text-gray-700'}`}>
                                                        {filter}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Category Filter */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-3">
                                            {uniqueCategories.map((category) => (
                                                <TouchableOpacity
                                                    key={category}
                                                    onPress={() => setSelectedCategory(category.toLowerCase())}
                                                    className={`px-5 py-3 rounded-full border-2 ${selectedCategory === category.toLowerCase()
                                                        ? 'bg-brown-primary border-brown-primary'
                                                        : 'bg-white border-gray-300'
                                                        }`}
                                                >
                                                    <Text className={`font-bold ${selectedCategory === category.toLowerCase() ? 'text-white' : 'text-gray-700'}`}>
                                                        {category}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>

                                {loading ? (
                                    <View className="items-center py-12">
                                        <ActivityIndicator size="large" color="#8B4513" />
                                    </View>
                                ) : (
                                    <>
                                        {/* Top 3 Best Sellers - Large Cards */}
                                        {topThree.length > 0 && (
                                            <View className="mb-12">
                                                <View className="flex-row items-center mb-6">
                                                    <Text className="text-3xl">🏆</Text>
                                                    <Text className="ml-3 text-3xl font-bold text-gray-900">Top 3 Champions</Text>
                                                </View>
                                                {topThree.map((product, index) => {
                                                    const catName = typeof product.category === 'object' ? product.category?.name ?? '' : '';
                                                    const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
                                                    return (
                                                        <TouchableOpacity
                                                            key={product._id}
                                                            onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                            className="mb-6 overflow-hidden bg-white shadow-xl rounded-2xl"
                                                        >
                                                            <View className={`${isMobile ? 'flex-col' : 'flex-row'}`}>
                                                                <View className={`${isMobile ? 'w-full' : 'w-2/5'} relative`}>
                                                                    <Image
                                                                        source={{ uri: getImage(product) }}
                                                                        className="w-full h-80"
                                                                        resizeMode="cover"
                                                                    />
                                                                    <LinearGradient
                                                                        colors={RANK_COLORS[index] as any}
                                                                        className="absolute items-center justify-center w-16 h-16 rounded-full shadow-lg top-4 left-4"
                                                                    >
                                                                        <Text className="text-2xl font-bold text-white">#{index + 1}</Text>
                                                                    </LinearGradient>
                                                                    <View className="absolute p-3 bg-white rounded-full shadow-lg top-4 right-4">
                                                                        <Text className="text-3xl">{RANK_BADGES[index]}</Text>
                                                                    </View>
                                                                    <View className="absolute flex-row items-center px-3 py-2 bg-green-500 rounded-full bottom-4 left-4">
                                                                        <Feather name="trending-up" size={16} color="#FFF" />
                                                                        <Text className="ml-1 font-bold text-white">Trending</Text>
                                                                    </View>
                                                                </View>
                                                                <View className={`${isMobile ? 'w-full' : 'flex-1'} p-6`}>
                                                                    {catName ? (
                                                                        <View className="self-start px-3 py-1 mb-2 rounded-full bg-craft-100">
                                                                            <Text className="text-xs font-bold text-brown-primary">{catName}</Text>
                                                                        </View>
                                                                    ) : null}
                                                                    <Text className="mb-3 text-2xl font-bold text-gray-900">{product.name}</Text>
                                                                    <View className="flex-row items-center mb-4">
                                                                        {renderStars(product.averageRating ?? 0)}
                                                                        <Text className="ml-2 text-gray-600">
                                                                            {(product.averageRating ?? 0).toFixed(1)} ({(product.reviewCount ?? 0).toLocaleString()} reviews)
                                                                        </Text>
                                                                    </View>
                                                                    <View className="flex-row items-baseline mb-4">
                                                                        <Text className="mr-3 text-4xl font-bold text-brown-primary">${displayPrice.toFixed(2)}</Text>
                                                                        {product.salePrice && product.salePrice < product.price && (
                                                                            <Text className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</Text>
                                                                        )}
                                                                    </View>
                                                                    <View className="flex-row gap-3">
                                                                        <TouchableOpacity className="flex-row items-center justify-center flex-1 py-4 bg-brown-primary rounded-xl">
                                                                            <Feather name="shopping-cart" size={18} color="#FFF" />
                                                                            <Text className="ml-2 font-bold text-white">Add to Cart</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity className="items-center justify-center px-4 py-4 bg-craft-100 rounded-xl">
                                                                            <Feather name="heart" size={20} color="#8B4513" />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}

                                        {/* Remaining Best Sellers - Grid */}
                                        {restProducts.length > 0 && (
                                            <View className="mb-12">
                                                <Text className="mb-6 text-3xl font-bold text-gray-900">More Best Sellers</Text>
                                                <View className={`flex-row flex-wrap ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                                    {restProducts.map((product, idx) => {
                                                        const rank = idx + 4;
                                                        const catName = typeof product.category === 'object' ? product.category?.name ?? '' : '';
                                                        const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
                                                        return (
                                                            <TouchableOpacity
                                                                key={product._id}
                                                                onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as any)}
                                                                className={`bg-white rounded-2xl overflow-hidden shadow-lg mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[31%]'}`}
                                                            >
                                                                <View className="relative">
                                                                    <Image
                                                                        source={{ uri: getImage(product) }}
                                                                        className="w-full h-64"
                                                                        resizeMode="cover"
                                                                    />
                                                                    <View className="absolute items-center justify-center w-12 h-12 rounded-full shadow-lg top-4 left-4 bg-brown-primary">
                                                                        <Text className="font-bold text-white">#{rank}</Text>
                                                                    </View>
                                                                    <View className="absolute px-3 py-1 bg-yellow-400 rounded-full top-4 right-4">
                                                                        <Text className="text-xs font-bold text-brown-primary">Popular</Text>
                                                                    </View>
                                                                    <View className="absolute p-2 bg-white rounded-full shadow-lg bottom-4 right-4">
                                                                        <Feather name="trending-up" size={18} color="#10B981" />
                                                                    </View>
                                                                    <TouchableOpacity className="absolute p-2 rounded-full shadow-lg bottom-4 left-4 bg-white/90">
                                                                        <Feather name="heart" size={18} color="#8B4513" />
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View className="p-4">
                                                                    {catName ? <Text className="mb-1 text-sm text-gray-500">{catName}</Text> : null}
                                                                    <Text className="mb-2 text-lg font-bold text-gray-900" numberOfLines={2}>{product.name}</Text>
                                                                    <View className="flex-row items-center mb-3">
                                                                        {renderStars(product.averageRating ?? 0)}
                                                                        <Text className="ml-2 text-sm text-gray-600">({product.reviewCount ?? 0})</Text>
                                                                    </View>
                                                                    <View className="flex-row items-baseline mb-3">
                                                                        <Text className="mr-2 text-2xl font-bold text-brown-primary">${displayPrice.toFixed(2)}</Text>
                                                                        {product.salePrice && product.salePrice < product.price && (
                                                                            <Text className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</Text>
                                                                        )}
                                                                    </View>
                                                                    <TouchableOpacity className="flex-row items-center justify-center py-3 bg-brown-primary rounded-xl">
                                                                        <Feather name="shopping-cart" size={16} color="#FFF" />
                                                                        <Text className="ml-2 font-bold text-white">Add to Cart</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        )}
                                    </>
                                )}

                                {/* Stats Section */}
                                <View className="p-8 mb-8 bg-brown-primary rounded-2xl">
                                    <Text className="mb-6 text-3xl font-bold text-center text-white">Why Our Customers Love These</Text>
                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} justify-around gap-6`}>
                                        <View className="items-center">
                                            <Text className="mb-2 text-5xl font-bold text-white">98%</Text>
                                            <Text className="text-center text-white/90">Customer Satisfaction</Text>
                                        </View>
                                        <View className="items-center">
                                            <Text className="mb-2 text-5xl font-bold text-white">50k+</Text>
                                            <Text className="text-center text-white/90">Units Sold</Text>
                                        </View>
                                        <View className="items-center">
                                            <Text className="mb-2 text-5xl font-bold text-white">4.8</Text>
                                            <Text className="text-center text-white/90">Average Rating</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* CTA Banner */}
                                <View className="items-center p-8 bg-white shadow-xl rounded-2xl">
                                    <Text className="mb-3 text-2xl font-bold text-center text-gray-900">Want to See All Products?</Text>
                                    <Text className="max-w-md mb-6 text-center text-gray-600">
                                        Explore our complete collection and find the perfect items for you
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/shop' as any)}
                                        className="flex-row items-center px-8 py-4 bg-brown-primary rounded-xl"
                                    >
                                        <Feather name="grid" size={20} color="#FFF" />
                                        <Text className="ml-2 text-lg font-bold text-white">Browse All Products</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}