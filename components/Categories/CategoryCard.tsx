import { BROWN } from '@/constants/brandTheme';
import { getAssetUrl } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import useCategoryLayout from './useCategoryLayout';

const FALLBACK_GRADIENTS: [string, string][] = [
    ['#714329', '#B08463'],
    ['#5C3317', '#8B4513'],
    ['#3D2B1F', '#714329'],
    ['#8B4513', '#D4A96A'],
    ['#4A3728', '#9E6B45'],
    ['#2D1B0E', '#714329'],
];

export type CategoryCardData = {
    id: string;
    name: string;
    description: string;
    image?: string;
    subcategories: string[];
    itemCount: string;
    slug?: string;
};

type Props = {
    category: CategoryCardData;
    index: number;
};

export default function CategoryCard({ category, index }: Props) {

    const router = useRouter();
    const { cardWidth } = useCategoryLayout();
    const cardScale = useRef(new Animated.Value(1)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(28)).current;
    const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
    const imageUrl = getAssetUrl(category.image);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1, duration: 500,
                delay: Math.min(index * 80, 400),
                useNativeDriver: true,
            }),
            Animated.spring(cardTranslate, {
                toValue: 0, tension: 65, friction: 10,
                delay: Math.min(index * 80, 400),
                useNativeDriver: true,
            }),
        ]).start();
    }, [cardOpacity, cardTranslate, index]);

    const handlePressIn = () =>
        Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();

    const handlePressOut = () =>
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

    const handlePress = () => {
        router.push({ pathname: '/shop', params: { category: category.id } } as any);
    };

    return (
        <Animated.View
            style={{
                width: cardWidth as any,
                marginBottom: 20,
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: cardTranslate }],
            }}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={{
                    borderRadius: 28,
                    overflow: 'hidden',
                    backgroundColor: '#FFF9F3',
                    borderWidth: 1,
                    borderColor: '#EAD9CA',
                    ...Platform.select({
                        ios: { shadowColor: '#3B2417', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
                        android: { elevation: 5 },
                        web: { boxShadow: '0 14px 30px rgba(77,42,26,0.08)' } as any,
                    }),
                }}
            >
                {/* ── Image / Gradient top section ── */}
                <View style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
                    )}

                    {/* Dark overlay for text readability */}
                    <LinearGradient colors={['rgba(28,12,4,0.02)', 'rgba(28,12,4,0.78)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }} />
                    <View style={{ position: 'absolute', inset: 0 as any, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Sub count badge (top-right) */}
                    <View style={{
                        position: 'absolute', top: 16, right: 16,
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        borderRadius: 100, paddingVertical: 5, paddingHorizontal: 11,
                    }}>
                        <Feather name="layers" size={11} color={BROWN.DarkColor} />
                        <Text style={{ color: BROWN.DarkColor, fontSize: 11, fontWeight: '700' }}>
                            {category.itemCount} subs
                        </Text>
                    </View>

                    {/* Category name on image */}
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 18, paddingBottom: 18 }}>
                        <Text
                            style={{
                                color: '#FFF',
                                fontFamily: Platform.OS !== 'web' ? 'PlayfairDisplay' : 'Georgia, serif',
                                fontSize: 24, fontWeight: '800', lineHeight: 30,
                            }}
                            numberOfLines={2}
                        >
                            {category.name}
                        </Text>
                    </View>
                </View>

                {/* ── Card body ── */}
                <View style={{ paddingHorizontal: 18, paddingVertical: 18 }}>
                    {/* Description */}
                    <Text style={{ color: BROWN.TextSecondary, fontFamily: 'Inter', fontSize: 13, lineHeight: 21, marginBottom: 16, }} numberOfLines={3}>
                        {category.description}
                    </Text>

                    {/* Subcategory tags */}
                    {category.subcategories.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                            {category.subcategories.slice(0, 3).map((sub, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        backgroundColor: '#F6EBDD',
                                        borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10,
                                        borderWidth: 1, borderColor: '#E7D3C0',
                                    }}
                                >
                                    <Text style={{ color: BROWN.DarkColor, fontSize: 11, fontWeight: '600' }}>
                                        {sub}
                                    </Text>
                                </View>
                            ))}
                            {category.subcategories.length > 3 && (
                                <View style={{
                                    backgroundColor: '#F6EBDD', borderRadius: 100,
                                    paddingVertical: 4, paddingHorizontal: 10,
                                    borderWidth: 1, borderColor: '#E7D3C0',
                                }}>
                                    <Text style={{ color: BROWN.SecondaryBackground, fontSize: 11, fontWeight: '600' }}>
                                        +{category.subcategories.length - 3} more
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Footer: Explore button */}
                    <TouchableOpacity
                        onPress={handlePress}
                        activeOpacity={0.85}
                        style={{
                            flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#5A321B',
                            borderRadius: 16, paddingVertical: 13, paddingHorizontal: 16,
                        }}
                    >
                        <View>
                            <Text style={{ color: '#FFF', fontFamily: 'Inter', fontSize: 13, fontWeight: '700', marginTop: 4 }}>
                                Explore Collection
                            </Text>
                        </View>
                        <View style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Feather name="arrow-up-right" size={15} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
