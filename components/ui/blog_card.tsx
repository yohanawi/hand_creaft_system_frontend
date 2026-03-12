import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { BLOGS } from '../../Data/blog-data';

export function BlogCard({
    blog,
    cardWidth,
    cardMargin,
    isActive,
}: {
    blog: typeof BLOGS[0];
    cardWidth: number;
    cardMargin: number;
    isActive: boolean;
}) {
    const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.93)).current;
    const cardFade = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isActive ? 1 : 0.93,
                tension: 70,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(cardFade, {
                toValue: isActive ? 1 : 0.7,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isActive]);

    const pressScale = useRef(new Animated.Value(1)).current;

    return (
        <Animated.View
            style={{
                width: cardWidth,
                marginRight: cardMargin,
                transform: [{ scale: Animated.multiply(scaleAnim, pressScale) }],
                opacity: cardFade,
            }}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={() =>
                    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start()
                }
                onPressOut={() =>
                    Animated.spring(pressScale, { toValue: 1, tension: 60, friction: 4, useNativeDriver: true }).start()
                }
            >
                <View
                    style={{
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: '#FFF',
                        shadowColor: blog.accentColor,
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    {/* Gradient Header */}
                    <LinearGradient
                        colors={blog.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 300, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
                    >
                        {/* Background Image */}
                        <Image
                            source={{ uri: blog.image }}
                            style={{ position: 'absolute', width: '100%', height: '100%' }}
                        />

                        {/* Overlay */}
                        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)' }} />

                        {/* Background decorative circles */}
                        <View style={{
                            position: 'absolute', top: -30, right: -30,
                            width: 120, height: 120, borderRadius: 60,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        }} />
                        <View style={{
                            position: 'absolute', bottom: -20, left: -20,
                            width: 90, height: 90, borderRadius: 45,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                        }} />

                        {/* Category Badge */}
                        <View style={{
                            position: 'absolute', top: 14, left: 14,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            paddingHorizontal: 12, paddingVertical: 5,
                            borderRadius: 20,
                        }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#1F2937' }}>
                                {blog.category}
                            </Text>
                        </View>

                        {/* Read time badge */}
                        <View style={{
                            position: 'absolute', top: 14, right: 14,
                            backgroundColor: 'rgba(0,0,0,0.25)',
                            paddingHorizontal: 10, paddingVertical: 5,
                            borderRadius: 20, flexDirection: 'row', alignItems: 'center',
                        }}>
                            <Feather name="clock" size={10} color="#FFF" />
                            <Text style={{ fontSize: 10, color: '#FFF', marginLeft: 4, fontWeight: '600' }}>
                                {blog.readTime}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Card Body */}
                    <View style={{ padding: 20 }}>
                        {/* Title */}
                        <Text numberOfLines={2} style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 8, lineHeight: 24 }}>
                            {blog.title}
                        </Text>

                        {/* Excerpt */}
                        <Text numberOfLines={2} style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 16 }}>
                            {blog.excerpt}
                        </Text>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 }} />

                        {/* Footer */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Author */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={{
                                    width: 32, height: 32, borderRadius: 16,
                                    backgroundColor: blog.accentColor,
                                    justifyContent: 'center', alignItems: 'center',
                                    marginRight: 8,
                                }}>
                                    <Feather name="user" size={15} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151' }} numberOfLines={1}>
                                        {blog.author}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{blog.date}</Text>
                                </View>
                            </View>

                            {/* Stats */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="heart" size={13} color="#EF4444" />
                                    <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 3 }}>{blog.likes}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Feather name="message-circle" size={13} color="#3B82F6" />
                                    <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 3 }}>{blog.comments}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}