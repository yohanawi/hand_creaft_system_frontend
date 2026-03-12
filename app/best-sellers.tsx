import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BestSellersScreen() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('weekly');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const filters = ['Daily', 'Weekly', 'Monthly', 'All Time'];
    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

    const topBestSellers = [
        {
            id: 1,
            rank: 1,
            name: 'Premium Wireless Headphones',
            price: 129.99,
            originalPrice: 199.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            rating: 4.9,
            reviews: 1234,
            sales: 15420,
            category: 'Electronics',
            badge: '🔥',
            trending: 'up',
            trendingValue: '+235%',
        },
        {
            id: 2,
            rank: 2,
            name: 'Smart Watch Ultra',
            price: 299.99,
            originalPrice: 499.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
            rating: 4.8,
            reviews: 2156,
            sales: 12890,
            category: 'Electronics',
            badge: '⭐',
            trending: 'up',
            trendingValue: '+189%',
        },
        {
            id: 3,
            rank: 3,
            name: 'Designer Leather Bag',
            price: 179.99,
            originalPrice: 349.99,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
            rating: 4.9,
            reviews: 987,
            sales: 9876,
            category: 'Fashion',
            badge: '💎',
            trending: 'up',
            trendingValue: '+156%',
        },
    ];

    const bestSellers = [
        {
            id: 4,
            rank: 4,
            name: 'Wireless Gaming Mouse',
            price: 59.99,
            originalPrice: 119.99,
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
            rating: 4.7,
            reviews: 756,
            sales: 7654,
            category: 'Electronics',
            badge: 'Best Choice',
            trending: 'up',
        },
        {
            id: 5,
            rank: 5,
            name: 'Luxury Sunglasses',
            price: 89.99,
            originalPrice: 189.99,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
            rating: 4.8,
            reviews: 654,
            sales: 6543,
            category: 'Fashion',
            badge: 'Trending',
            trending: 'up',
        },
        {
            id: 6,
            rank: 6,
            name: 'Fitness Tracker Pro',
            price: 79.99,
            originalPrice: 149.99,
            image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
            rating: 4.6,
            reviews: 543,
            sales: 5432,
            category: 'Sports',
            badge: 'Popular',
            trending: 'stable',
        },
        {
            id: 7,
            rank: 7,
            name: 'Premium Yoga Mat',
            price: 44.99,
            originalPrice: 89.99,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
            rating: 4.9,
            reviews: 432,
            sales: 4321,
            category: 'Sports',
            badge: 'Top Rated',
            trending: 'up',
        },
        {
            id: 8,
            rank: 8,
            name: 'Smart Home Speaker',
            price: 69.99,
            originalPrice: 149.99,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
            rating: 4.7,
            reviews: 398,
            sales: 3987,
            category: 'Electronics',
            badge: 'Hot Item',
            trending: 'up',
        },
        {
            id: 9,
            rank: 9,
            name: 'Cashmere Scarf',
            price: 54.99,
            originalPrice: 119.99,
            image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500',
            rating: 4.8,
            reviews: 321,
            sales: 3210,
            category: 'Fashion',
            badge: 'Premium',
            trending: 'up',
        },
        {
            id: 10,
            rank: 10,
            name: 'Wireless Earbuds Pro',
            price: 89.99,
            originalPrice: 179.99,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
            rating: 4.9,
            reviews: 876,
            sales: 8765,
            category: 'Electronics',
            badge: 'Fan Favorite',
            trending: 'up',
        },
    ];

    const renderStars = (rating: number) => {
        return (
            <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                        key={star}
                        name="star"
                        size={14}
                        color={star <= Math.floor(rating) ? '#FFD700' : '#E5E5E5'}
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    };

    const formatSales = (sales: number) => {
        if (sales >= 1000) {
            return `${(sales / 1000).toFixed(1)}k`;
        }
        return sales.toString();
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Hero Section */}
                        <LinearGradient
                            colors={['#8B4513', '#D2691E', '#CD853F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-16 px-4"
                        >
                            <View className="max-w-7xl mx-auto w-full">
                                <View className="items-center">
                                    <View className="flex-row items-center mb-4">
                                        <View className="bg-yellow-400 rounded-full p-3 mr-3">
                                            <Feather name="award" size={32} color="#8B4513" />
                                        </View>
                                        <Text className="text-white text-4xl font-bold">
                                            Best Sellers
                                        </Text>
                                    </View>
                                    <Text className="text-white/90 text-lg text-center max-w-2xl">
                                        Discover our most popular products loved by thousands of customers
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>

                        <View className="px-4 py-8">
                            <View className="max-w-7xl mx-auto w-full">
                                {/* Filter Tabs */}
                                <View className="mb-8">
                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between mb-6`}>
                                        <Text className="text-gray-900 text-2xl font-bold mb-4">
                                            Top Performers
                                        </Text>
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
                                                    <Text className={`font-bold text-sm ${selectedFilter === filter.toLowerCase()
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                        }`}>
                                                        {filter}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Category Filter */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                                        {categories.map((category) => (
                                            <TouchableOpacity
                                                key={category}
                                                onPress={() => setSelectedCategory(category.toLowerCase())}
                                                className={`px-5 py-3 rounded-full border-2 ${selectedCategory === category.toLowerCase()
                                                    ? 'bg-brown-primary border-brown-primary'
                                                    : 'bg-white border-gray-300'
                                                    }`}
                                            >
                                                <Text className={`font-bold ${selectedCategory === category.toLowerCase()
                                                    ? 'text-white'
                                                    : 'text-gray-700'
                                                    }`}>
                                                    {category}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Top 3 Best Sellers - Large Cards */}
                                <View className="mb-12">
                                    <View className="flex-row items-center mb-6">
                                        <Text className="text-3xl">🏆</Text>
                                        <Text className="text-gray-900 text-3xl font-bold ml-3">
                                            Top 3 Champions
                                        </Text>
                                    </View>

                                    {topBestSellers.map((product, index) => (
                                        <TouchableOpacity
                                            key={product.id}
                                            onPress={() => router.push('/product-single' as any)}
                                            className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden"
                                        >
                                            <View className={`${isMobile ? 'flex-col' : 'flex-row'}`}>
                                                <View className={`${isMobile ? 'w-full' : 'w-2/5'} relative`}>
                                                    <Image
                                                        source={{ uri: product.image }}
                                                        className="w-full h-80"
                                                        resizeMode="cover"
                                                    />
                                                    {/* Rank Badge */}
                                                    <LinearGradient
                                                        colors={index === 0 ? ['#FFD700', '#FFA500'] : index === 1 ? ['#C0C0C0', '#808080'] : ['#CD7F32', '#8B4513']}
                                                        className="absolute top-4 left-4 rounded-full w-16 h-16 items-center justify-center shadow-lg"
                                                    >
                                                        <Text className="text-white text-2xl font-bold">#{product.rank}</Text>
                                                    </LinearGradient>

                                                    {/* Badge Emoji */}
                                                    <View className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
                                                        <Text className="text-3xl">{product.badge}</Text>
                                                    </View>

                                                    {/* Trending Indicator */}
                                                    <View className="absolute bottom-4 left-4 bg-green-500 rounded-full px-3 py-2 flex-row items-center">
                                                        <Feather name="trending-up" size={16} color="#FFF" />
                                                        <Text className="text-white font-bold ml-1">{product.trendingValue}</Text>
                                                    </View>
                                                </View>

                                                <View className={`${isMobile ? 'w-full' : 'flex-1'} p-6`}>
                                                    <View className="flex-row items-center mb-2">
                                                        <View className="bg-craft-100 px-3 py-1 rounded-full">
                                                            <Text className="text-brown-primary font-bold text-xs">
                                                                {product.category}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <Text className="text-gray-900 text-2xl font-bold mb-3">
                                                        {product.name}
                                                    </Text>

                                                    <View className="flex-row items-center mb-4">
                                                        {renderStars(product.rating)}
                                                        <Text className="text-gray-600 ml-2">
                                                            {product.rating} ({product.reviews.toLocaleString()} reviews)
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row items-baseline mb-4">
                                                        <Text className="text-brown-primary text-4xl font-bold mr-3">
                                                            ${product.price}
                                                        </Text>
                                                        <Text className="text-gray-400 text-xl line-through">
                                                            ${product.originalPrice}
                                                        </Text>
                                                    </View>

                                                    <View className="bg-gradient-to-r from-craft-50 to-white rounded-xl p-4 mb-4">
                                                        <View className="flex-row items-center">
                                                            <Feather name="shopping-bag" size={20} color="#8B4513" />
                                                            <Text className="text-gray-700 font-bold ml-2">
                                                                {formatSales(product.sales)} units sold
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View className="flex-row gap-3">
                                                        <TouchableOpacity className="flex-1 bg-brown-primary rounded-xl py-4 flex-row items-center justify-center">
                                                            <Feather name="shopping-cart" size={18} color="#FFF" />
                                                            <Text className="text-white font-bold ml-2">Add to Cart</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity className="bg-craft-100 rounded-xl px-4 py-4 items-center justify-center">
                                                            <Feather name="heart" size={20} color="#8B4513" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Remaining Best Sellers - Grid */}
                                <View className="mb-12">
                                    <Text className="text-gray-900 text-3xl font-bold mb-6">
                                        More Best Sellers
                                    </Text>

                                    <View className={`flex-row flex-wrap ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                        {bestSellers.map((product) => (
                                            <TouchableOpacity
                                                key={product.id}
                                                onPress={() => router.push('/product-single' as any)}
                                                className={`bg-white rounded-2xl overflow-hidden shadow-lg mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[31%]'
                                                    }`}
                                            >
                                                <View className="relative">
                                                    <Image
                                                        source={{ uri: product.image }}
                                                        className="w-full h-64"
                                                        resizeMode="cover"
                                                    />

                                                    {/* Rank Badge */}
                                                    <View className="absolute top-4 left-4 bg-brown-primary rounded-full w-12 h-12 items-center justify-center shadow-lg">
                                                        <Text className="text-white font-bold">#{product.rank}</Text>
                                                    </View>

                                                    {/* Badge */}
                                                    <View className="absolute top-4 right-4 bg-yellow-400 rounded-full px-3 py-1">
                                                        <Text className="text-brown-primary font-bold text-xs">{product.badge}</Text>
                                                    </View>

                                                    {/* Trending Icon */}
                                                    {product.trending === 'up' && (
                                                        <View className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg">
                                                            <Feather name="trending-up" size={18} color="#10B981" />
                                                        </View>
                                                    )}

                                                    {/* Wishlist */}
                                                    <TouchableOpacity className="absolute bottom-4 left-4 bg-white/90 rounded-full p-2 shadow-lg">
                                                        <Feather name="heart" size={18} color="#8B4513" />
                                                    </TouchableOpacity>
                                                </View>

                                                <View className="p-4">
                                                    <Text className="text-gray-500 text-sm mb-1">{product.category}</Text>
                                                    <Text className="text-gray-900 font-bold text-lg mb-2" numberOfLines={2}>
                                                        {product.name}
                                                    </Text>

                                                    <View className="flex-row items-center mb-3">
                                                        {renderStars(product.rating)}
                                                        <Text className="text-gray-600 text-sm ml-2">
                                                            ({product.reviews})
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row items-baseline mb-3">
                                                        <Text className="text-brown-primary text-2xl font-bold mr-2">
                                                            ${product.price}
                                                        </Text>
                                                        <Text className="text-gray-400 text-sm line-through">
                                                            ${product.originalPrice}
                                                        </Text>
                                                    </View>

                                                    <View className="bg-craft-50 rounded-lg p-2 mb-3">
                                                        <Text className="text-brown-primary text-sm font-semibold text-center">
                                                            {formatSales(product.sales)} sold
                                                        </Text>
                                                    </View>

                                                    <TouchableOpacity className="bg-brown-primary rounded-xl py-3 flex-row items-center justify-center">
                                                        <Feather name="shopping-cart" size={16} color="#FFF" />
                                                        <Text className="text-white font-bold ml-2">Add to Cart</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Stats Section */}
                                <View className="bg-gradient-to-r from-brown-primary to-orange-600 rounded-2xl p-8 mb-8">
                                    <Text className="text-white text-3xl font-bold mb-6 text-center">
                                        Why Our Customers Love These
                                    </Text>
                                    <View className={`${isMobile ? 'flex-col' : 'flex-row'} justify-around gap-6`}>
                                        <View className="items-center">
                                            <Text className="text-white text-5xl font-bold mb-2">98%</Text>
                                            <Text className="text-white/90 text-center">Customer Satisfaction</Text>
                                        </View>
                                        <View className="items-center">
                                            <Text className="text-white text-5xl font-bold mb-2">50k+</Text>
                                            <Text className="text-white/90 text-center">Units Sold</Text>
                                        </View>
                                        <View className="items-center">
                                            <Text className="text-white text-5xl font-bold mb-2">4.8</Text>
                                            <Text className="text-white/90 text-center">Average Rating</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* CTA Banner */}
                                <View className="bg-white rounded-2xl shadow-xl p-8 items-center">
                                    <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
                                        Want to See All Products?
                                    </Text>
                                    <Text className="text-gray-600 text-center mb-6 max-w-md">
                                        Explore our complete collection and find the perfect items for you
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/shop' as any)}
                                        className="bg-brown-primary rounded-xl py-4 px-8 flex-row items-center"
                                    >
                                        <Feather name="grid" size={20} color="#FFF" />
                                        <Text className="text-white font-bold text-lg ml-2">
                                            Browse All Products
                                        </Text>
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
