import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AboutUsScreen() {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideUpAnim = useState(new Animated.Value(50))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const stats = [
        { icon: 'users', value: '50K+', label: 'Happy Customers' },
        { icon: 'package', value: '100K+', label: 'Products Sold' },
        { icon: 'award', value: '15+', label: 'Years Experience' },
        { icon: 'globe', value: '150+', label: 'Countries Served' },
    ];

    const values = [
        {
            icon: 'heart',
            title: 'Customer First',
            description: 'We prioritize customer satisfaction above all else, ensuring every interaction exceeds expectations.',
            gradient: ['#f093fb', '#f5576c'],
        },
        {
            icon: 'shield',
            title: 'Quality Assurance',
            description: 'Every product undergoes rigorous quality checks to guarantee excellence in every purchase.',
            gradient: ['#4facfe', '#00f2fe'],
        },
        {
            icon: 'zap',
            title: 'Innovation',
            description: 'Constantly evolving to bring you the latest trends and cutting-edge shopping experience.',
            gradient: ['#43e97b', '#38f9d7'],
        },
        {
            icon: 'globe',
            title: 'Sustainability',
            description: 'Committed to eco-friendly practices and supporting sustainable product choices.',
            gradient: ['#fa709a', '#fee140'],
        },
    ];

    const team = [
        { name: 'Sarah Johnson', role: 'CEO & Founder', icon: 'user' },
        { name: 'Michael Chen', role: 'CTO', icon: 'cpu' },
        { name: 'Emily Davis', role: 'Head of Design', icon: 'pen-tool' },
        { name: 'David Wilson', role: 'Marketing Director', icon: 'trending-up' },
    ];

    const milestones = [
        { year: '2011', title: 'Founded', description: 'ShopHub was born with a vision' },
        { year: '2014', title: 'Expansion', description: 'Reached 10,000 customers' },
        { year: '2018', title: 'Global', description: 'Expanded to 50 countries' },
        { year: '2026', title: 'Today', description: '50,000+ happy customers worldwide' },
    ];

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>

                    {/* Hero Section */}
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
                    >
                        <LinearGradient
                            colors={['#8B4513', '#A0522D', '#CD853F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="px-4 py-20"
                        >
                            <View className="max-w-7xl mx-auto w-full">
                                <View className={`${isMobile ? 'text-center' : 'items-center'}`}>
                                    <Text className={`text-white font-bold mb-4 text-center ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                                        About ShopHub
                                    </Text>
                                    <Text className="text-white text-lg text-center max-w-3xl leading-8 opacity-90">
                                        Your trusted destination for quality products, exceptional service, and unforgettable shopping experiences since 2011.
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Our Story Section */}
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}
                        className="py-16 px-4 bg-craft-50"
                    >
                        <View className="max-w-7xl mx-auto w-full">
                            <View className={`${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
                                <View className={`${isMobile ? 'mb-8' : 'w-1/2 pr-12'}`}>
                                    <Text className="text-brown-primary text-lg font-semibold mb-3 uppercase tracking-wider">
                                        Our Story
                                    </Text>
                                    <Text className={`text-gray-900 font-bold mb-6 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                        Building Trust Through Excellence
                                    </Text>
                                    <Text className="text-gray-600 text-base leading-7 mb-4">
                                        Founded in 2011, ShopHub began as a small online store with a big dream: to revolutionize the way people shop online. What started in a garage has grown into a global marketplace serving customers in over 150 countries.
                                    </Text>
                                    <Text className="text-gray-600 text-base leading-7 mb-6">
                                        Our commitment to quality, customer satisfaction, and innovation has been the cornerstone of our success. Today, we're proud to be recognized as one of the leading e-commerce platforms, trusted by millions of customers worldwide.
                                    </Text>
                                    <TouchableOpacity className="bg-brown-primary rounded-full px-8 py-4 self-start">
                                        <Text className="text-white font-bold">Learn More</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className={`${isMobile ? 'w-full' : 'w-1/2'}`}>
                                    <View className="bg-brown-primary rounded-3xl p-8 items-center justify-center h-96">
                                        <Feather name="shopping-bag" size={120} color="#FFF" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Stats Section */}
                    <View className="py-16 px-4 bg-white">
                        <View className="max-w-7xl mx-auto w-full">
                            <View className={`${isMobile ? 'flex-col' : 'flex-row justify-between'}`}>
                                {stats.map((stat, index) => (
                                    <Animated.View
                                        key={index}
                                        style={{ opacity: fadeAnim }}
                                        className={`${isMobile ? 'mb-8' : 'w-1/4'} items-center`}
                                    >
                                        <View className="bg-brown-primary rounded-full p-6 mb-4">
                                            <Feather name={stat.icon as any} size={40} color="#FFF" />
                                        </View>
                                        <Text className="text-brown-primary text-4xl font-bold mb-2">
                                            {stat.value}
                                        </Text>
                                        <Text className="text-gray-600 text-base font-semibold">
                                            {stat.label}
                                        </Text>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Our Values */}
                    <View className="py-16 px-4 bg-craft-100">
                        <View className="max-w-7xl mx-auto w-full">
                            <Text className={`text-brown-primary font-bold text-center mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                Our Core Values
                            </Text>
                            <Text className="text-gray-600 text-center text-base mb-12 max-w-2xl mx-auto">
                                These principles guide everything we do
                            </Text>
                            <View className={`${isMobile ? 'flex-col' : 'flex-row flex-wrap justify-between'}`}>
                                {values.map((value, index) => (
                                    <Animated.View
                                        key={index}
                                        style={{ opacity: fadeAnim }}
                                        className={`${isMobile ? 'mb-6' : isTablet ? 'w-[48%] mb-6' : 'w-[48%] mb-6'}`}
                                    >
                                        <LinearGradient
                                            colors={value.gradient as any}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="rounded-2xl p-8"
                                        >
                                            <View className="bg-white bg-opacity-30 rounded-full p-4 w-16 h-16 items-center justify-center mb-4">
                                                <Feather name={value.icon as any} size={28} color="#FFF" />
                                            </View>
                                            <Text className="text-white text-2xl font-bold mb-3">
                                                {value.title}
                                            </Text>
                                            <Text className="text-white text-base leading-7 opacity-90">
                                                {value.description}
                                            </Text>
                                        </LinearGradient>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View className="py-16 px-4 bg-white">
                        <View className="max-w-7xl mx-auto w-full">
                            <Text className={`text-brown-primary font-bold text-center mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                Our Journey
                            </Text>
                            <Text className="text-gray-600 text-center text-base mb-12">
                                Milestones that shaped our story
                            </Text>
                            <View className={`${isMobile ? 'flex-col' : 'flex-row justify-between items-center'}`}>
                                {milestones.map((milestone, index) => (
                                    <View key={index} className={`${isMobile ? 'mb-8' : 'w-1/4'} items-center`}>
                                        <View className="bg-brown-primary rounded-full w-16 h-16 items-center justify-center mb-4">
                                            <Text className="text-white font-bold text-xl">{milestone.year}</Text>
                                        </View>
                                        <Text className="text-brown-primary text-xl font-bold mb-2 text-center">
                                            {milestone.title}
                                        </Text>
                                        <Text className="text-gray-600 text-sm text-center">
                                            {milestone.description}
                                        </Text>
                                        {!isMobile && index < milestones.length - 1 && (
                                            <View className="absolute top-8 left-1/2 w-full h-1 bg-craft-300" style={{ zIndex: -1 }} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Team Section */}
                    <View className="py-16 px-4 bg-craft-50">
                        <View className="max-w-7xl mx-auto w-full">
                            <Text className={`text-brown-primary font-bold text-center mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                Meet Our Team
                            </Text>
                            <Text className="text-gray-600 text-center text-base mb-12">
                                The people behind our success
                            </Text>
                            <View className={`${isMobile ? 'flex-col' : 'flex-row flex-wrap justify-between'}`}>
                                {team.map((member, index) => (
                                    <Animated.View
                                        key={index}
                                        style={{ opacity: fadeAnim }}
                                        className={`${isMobile ? 'mb-6' : isTablet ? 'w-[48%] mb-6' : 'w-[23%]'}`}
                                    >
                                        <View className="bg-white rounded-2xl p-6 items-center shadow-lg">
                                            <View className="bg-brown-primary rounded-full p-8 mb-4">
                                                <Feather name={member.icon as any} size={48} color="#FFF" />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
                                                {member.name}
                                            </Text>
                                            <Text className="text-brown-primary text-sm font-semibold text-center">
                                                {member.role}
                                            </Text>
                                        </View>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* CTA Section */}
                    <View className="py-16 px-4 bg-white">
                        <View className="max-w-4xl mx-auto">
                            <LinearGradient
                                colors={['#8B4513', '#A0522D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-3xl p-12"
                            >
                                <Text className={`text-white font-bold text-center mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                    Join Our Journey
                                </Text>
                                <Text className="text-white text-center text-lg mb-8 opacity-90">
                                    Be part of our growing community and experience shopping like never before
                                </Text>
                                <View className="flex-row justify-center space-x-4">
                                    <TouchableOpacity className="bg-white rounded-full px-8 py-4">
                                        <Text className="text-brown-primary font-bold">Start Shopping</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                </PageShell>
            </ScrollView>
        </View>
    );
}
