import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DealsScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 45,
        seconds: 30,
    });

    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'];

    const featuredDeals = [
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 89.99,
            originalPrice: 199.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            discount: 55,
            rating: 4.9,
            reviews: 234,
            tag: 'Lightning Deal',
            tagColor: '#FF6B6B',
            soldPercentage: 75,
            unitsLeft: 12,
        },
        {
            id: 2,
            name: 'Smart Watch Ultra Pro',
            price: 249.99,
            originalPrice: 499.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
            discount: 50,
            rating: 4.8,
            reviews: 445,
            tag: 'Flash Sale',
            tagColor: '#FF9F43',
            soldPercentage: 85,
            unitsLeft: 8,
        },
    ];

    const deals = [
        {
            id: 3,
            name: 'Designer Leather Wallet',
            price: 39.99,
            originalPrice: 89.99,
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
            discount: 56,
            rating: 4.7,
            reviews: 156,
            category: 'Fashion',
            tag: 'Hot Deal',
            endsIn: '4h 30m',
        },
        {
            id: 4,
            name: 'Fitness Tracker Band',
            price: 49.99,
            originalPrice: 129.99,
            image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
            discount: 62,
            rating: 4.6,
            reviews: 289,
            category: 'Sports',
            tag: 'Best Seller',
            endsIn: '2h 15m',
        },
        {
            id: 5,
            name: 'Wireless Gaming Mouse',
            price: 59.99,
            originalPrice: 119.99,
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
            discount: 50,
            rating: 4.9,
            reviews: 512,
            category: 'Electronics',
            tag: 'Limited',
            endsIn: '6h 45m',
        },
        {
            id: 6,
            name: 'Premium Yoga Mat Set',
            price: 34.99,
            originalPrice: 79.99,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
            discount: 56,
            rating: 4.8,
            reviews: 178,
            category: 'Sports',
            tag: 'Trending',
            endsIn: '5h 20m',
        },
        {
            id: 7,
            name: 'Luxury Sunglasses',
            price: 79.99,
            originalPrice: 189.99,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
            discount: 58,
            rating: 4.7,
            reviews: 234,
            category: 'Fashion',
            tag: 'Exclusive',
            endsIn: '3h 10m',
        },
        {
            id: 8,
            name: 'Smart Home Speaker',
            price: 69.99,
            originalPrice: 149.99,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
            discount: 53,
            rating: 4.6,
            reviews: 367,
            category: 'Electronics',
            tag: 'New',
            endsIn: '7h 30m',
        },
        {
            id: 9,
            name: 'Cashmere Scarf',
            price: 45.99,
            originalPrice: 109.99,
            image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500',
            discount: 58,
            rating: 4.9,
            reviews: 145,
            category: 'Fashion',
            tag: 'Limited',
            endsIn: '1h 45m',
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

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <View className="items-center">
            <View className="bg-white rounded-xl px-4 py-3 shadow-lg min-w-[70px]">
                <Text className="text-brown-primary text-3xl font-bold text-center">
                    {value.toString().padStart(2, '0')}
                </Text>
            </View>
            <Text className="text-white text-sm mt-2 font-semibold">{label}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                        {/* Hero Section with Countdown */}
                        <LinearGradient
                            colors={['#FF6B6B', '#FF8E53']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-12 px-4"
                        >
                            <View className="max-w-7xl mx-auto w-full">
                                <View className="items-center">
                                    <View className="flex-row items-center mb-4">
                                        <Feather name="zap" size={32} color="#FFF" />
                                        <Text className="text-white text-4xl font-bold ml-3">
                                            Flash Deals
                                        </Text>
                                    </View>
                                    <Text className="text-white/90 text-lg mb-6 text-center">
                                        Limited time offers - Don't miss out!
                                    </Text>

                                    {/* Countdown Timer */}
                                    <View className="bg-white/20 rounded-2xl px-6 py-4 mb-2">
                                        <Text className="text-white text-center font-semibold mb-3">
                                            DEALS END IN
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <TimeBox value={timeLeft.hours} label="Hours" />
                                            <View className="justify-center">
                                                <Text className="text-white text-3xl font-bold">:</Text>
                                            </View>
                                            <TimeBox value={timeLeft.minutes} label="Minutes" />
                                            <View className="justify-center">
                                                <Text className="text-white text-3xl font-bold">:</Text>
                                            </View>
                                            <TimeBox value={timeLeft.seconds} label="Seconds" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>

                        <View className="px-4 py-8">
                            <View className="max-w-7xl mx-auto w-full">
                                {/* Featured Lightning Deals */}
                                <View className="mb-12">
                                    <View className="flex-row items-center mb-6">
                                        <Feather name="zap" size={28} color="#FF6B6B" />
                                        <Text className="text-gray-900 text-3xl font-bold ml-3">
                                            Lightning Deals
                                        </Text>
                                    </View>

                                    {featuredDeals.map((deal) => (
                                        <View key={deal.id} className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
                                            <View className={`${isMobile ? 'flex-col' : 'flex-row'}`}>
                                                <View className={`${isMobile ? 'w-full' : 'w-2/5'} relative`}>
                                                    <Image
                                                        source={{ uri: deal.image }}
                                                        className="w-full h-80"
                                                        resizeMode="cover"
                                                    />
                                                    <View className="absolute top-4 left-4" style={{ backgroundColor: deal.tagColor }}>
                                                        <LinearGradient
                                                            colors={[deal.tagColor, `${deal.tagColor}CC`]}
                                                            className="px-4 py-2 rounded-full"
                                                        >
                                                            <Text className="text-white font-bold">{deal.tag}</Text>
                                                        </LinearGradient>
                                                    </View>
                                                    <View className="absolute top-4 right-4 bg-white rounded-full px-4 py-2">
                                                        <Text className="text-red-500 font-bold text-lg">-{deal.discount}%</Text>
                                                    </View>
                                                </View>

                                                <View className={`${isMobile ? 'w-full' : 'flex-1'} p-6`}>
                                                    <Text className="text-gray-900 text-2xl font-bold mb-3">
                                                        {deal.name}
                                                    </Text>

                                                    <View className="flex-row items-center mb-4">
                                                        {renderStars(deal.rating)}
                                                        <Text className="text-gray-600 ml-2">
                                                            {deal.rating} ({deal.reviews} reviews)
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row items-baseline mb-6">
                                                        <Text className="text-brown-primary text-4xl font-bold mr-3">
                                                            ${deal.price}
                                                        </Text>
                                                        <Text className="text-gray-400 text-xl line-through">
                                                            ${deal.originalPrice}
                                                        </Text>
                                                    </View>

                                                    <View className="mb-4">
                                                        <View className="flex-row justify-between mb-2">
                                                            <Text className="text-gray-700 font-semibold">
                                                                {deal.soldPercentage}% claimed
                                                            </Text>
                                                            <Text className="text-red-500 font-bold">
                                                                Only {deal.unitsLeft} left!
                                                            </Text>
                                                        </View>
                                                        <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                                            <View
                                                                className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                                                                style={{ width: `${deal.soldPercentage}%` }}
                                                            />
                                                        </View>
                                                    </View>

                                                    <TouchableOpacity className="bg-brown-primary rounded-xl py-4 flex-row items-center justify-center shadow-lg">
                                                        <Feather name="shopping-cart" size={20} color="#FFF" />
                                                        <Text className="text-white font-bold text-lg ml-2">
                                                            Grab This Deal
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <View className="flex-row items-center justify-center mt-4">
                                                        <Feather name="clock" size={16} color="#8B4513" />
                                                        <Text className="text-brown-primary font-semibold ml-2">
                                                            Hurry! Limited time offer
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Category Filter */}
                                <View className="mb-8">
                                    <Text className="text-gray-900 text-2xl font-bold mb-4">Browse by Category</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                                        {categories.map((category) => (
                                            <TouchableOpacity
                                                key={category}
                                                onPress={() => setSelectedCategory(category.toLowerCase())}
                                                className={`px-6 py-3 rounded-full border-2 ${selectedCategory === category.toLowerCase()
                                                    ? 'bg-brown-primary border-brown-primary'
                                                    : 'bg-white border-gray-300'
                                                    }`}
                                            >
                                                <Text className={`font-bold ${selectedCategory === category.toLowerCase() ? 'text-white' : 'text-gray-700'
                                                    }`}>
                                                    {category}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* All Deals Grid */}
                                <View className="mb-8">
                                    <View className="flex-row items-center justify-between mb-6">
                                        <Text className="text-gray-900 text-3xl font-bold">All Deals</Text>
                                        <TouchableOpacity className="flex-row items-center">
                                            <Feather name="sliders" size={20} color="#8B4513" />
                                            <Text className="text-brown-primary font-bold ml-2">Filter</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className={`flex-row flex-wrap ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                        {deals.map((deal) => (
                                            <TouchableOpacity
                                                key={deal.id}
                                                onPress={() => router.push('/product-single' as any)}
                                                className={`bg-white rounded-2xl overflow-hidden shadow-lg mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[31%]'
                                                    }`}
                                            >
                                                <View className="relative">
                                                    <Image
                                                        source={{ uri: deal.image }}
                                                        className="w-full h-64"
                                                        resizeMode="cover"
                                                    />

                                                    {/* Discount Badge */}
                                                    <View className="absolute top-4 left-4 bg-red-500 rounded-full px-3 py-1">
                                                        <Text className="text-white font-bold">-{deal.discount}%</Text>
                                                    </View>

                                                    {/* Tag Badge */}
                                                    <View className="absolute top-4 right-4 bg-brown-primary rounded-full px-3 py-1">
                                                        <Text className="text-white font-bold text-xs">{deal.tag}</Text>
                                                    </View>

                                                    {/* Wishlist Button */}
                                                    <TouchableOpacity className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg">
                                                        <Feather name="heart" size={20} color="#8B4513" />
                                                    </TouchableOpacity>

                                                    {/* Timer Badge */}
                                                    <View className="absolute bottom-4 left-4 bg-black/70 rounded-full px-3 py-1 flex-row items-center">
                                                        <Feather name="clock" size={12} color="#FFF" />
                                                        <Text className="text-white font-bold text-xs ml-1">{deal.endsIn}</Text>
                                                    </View>
                                                </View>

                                                <View className="p-4">
                                                    <Text className="text-gray-500 text-sm mb-1">{deal.category}</Text>
                                                    <Text className="text-gray-900 font-bold text-lg mb-2" numberOfLines={2}>
                                                        {deal.name}
                                                    </Text>

                                                    <View className="flex-row items-center mb-3">
                                                        {renderStars(deal.rating)}
                                                        <Text className="text-gray-600 text-sm ml-2">
                                                            ({deal.reviews})
                                                        </Text>
                                                    </View>

                                                    <View className="flex-row items-baseline mb-4">
                                                        <Text className="text-brown-primary text-2xl font-bold mr-2">
                                                            ${deal.price}
                                                        </Text>
                                                        <Text className="text-gray-400 text-base line-through">
                                                            ${deal.originalPrice}
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

                                {/* Deal Alert Banner */}
                                <View className="bg-gradient-to-r from-brown-primary to-orange-600 rounded-2xl p-8 mb-8">
                                    <View className="items-center">
                                        <Feather name="bell" size={48} color="#FFF" className="mb-4" />
                                        <Text className="text-white text-2xl font-bold mb-2 text-center">
                                            Never Miss a Deal!
                                        </Text>
                                        <Text className="text-white/90 text-center mb-6 max-w-md">
                                            Subscribe to get instant notifications about new deals and exclusive offers
                                        </Text>
                                        <TouchableOpacity className="bg-white rounded-xl py-4 px-8">
                                            <Text className="text-brown-primary font-bold text-lg">
                                                Subscribe Now
                                            </Text>
                                        </TouchableOpacity>
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
