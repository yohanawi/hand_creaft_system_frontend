import { BRAND_FONTS } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageBackground, Pressable, Text, View } from 'react-native';

import useCategoryLayout from './useCategoryLayout';

type Props = {
    categoryCount: number;
    featuredNames: string[];
};

function HeroBadge({ icon, label }: { icon: React.ComponentProps<typeof Feather>['name']; label: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 10 }}>
            <Feather name={icon} size={13} color="#F4D9C2" />
            <Text style={{ color: '#FFF7F0', fontFamily: BRAND_FONTS.body, fontSize: 12, fontWeight: '700' }}>
                {label}
            </Text>
        </View>
    );
}

export default function CategoryHero({ categoryCount, featuredNames }: Props) {
    const router = useRouter();
    const { width, horizontalPadding, isCompact, maxContentWidth } = useCategoryLayout();
    const stacked = width < 980;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(26)).current;
    const railAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(translateAnim, {
                toValue: 0,
                tension: 58,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(railAnim, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(railAnim, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        ).start();
    }, [fadeAnim, railAnim, translateAnim]);

    const floatingTranslate = railAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12],
    });

    const curated = featuredNames.slice(0, 3);

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1974&auto=format&fit=crop' }}
            resizeMode="cover"
            style={{ flex: 1 }}
        >
            <LinearGradient className='h-[80vh] d-flex justify-center items-center' colors={['rgba(20,10,5,0.92)', 'rgba(40,20,10,0.85)', 'rgba(20,10,5,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

                <View style={{ position: 'absolute', top: -120, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(243,206,175,0.08)' }} />

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: translateAnim }],
                        width: '100%',
                        maxWidth: maxContentWidth,
                        alignSelf: 'center',
                        paddingHorizontal: horizontalPadding,
                    }}
                >
                    <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 26, justifyContent: 'space-between', alignItems: stacked ? 'stretch' : 'center' }}>
                        <View style={{ flex: 1, maxWidth: stacked ? undefined : 700 }}>
                            <View style={{ alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8 }}>
                                <Text style={{ color: '#F4D9C2', fontFamily: BRAND_FONTS.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.7 }}>
                                    CATEGORY DISCOVERY
                                </Text>
                            </View>

                            <Text style={{ marginTop: 18, color: '#FFF9F4', fontFamily: BRAND_FONTS.heading, fontSize: isCompact ? 42 : 64, lineHeight: isCompact ? 48 : 72 }}>
                                Explore by
                            </Text>
                            <Text style={{ color: '#E0A87C', fontFamily: BRAND_FONTS.heading, fontSize: isCompact ? 44 : 68, lineHeight: isCompact ? 50 : 74, fontStyle: 'italic' }}>
                                collection.
                            </Text>

                            <Text style={{ marginTop: 16, maxWidth: 620, color: 'rgba(255,249,244,0.74)', fontFamily: BRAND_FONTS.body, fontSize: 15, lineHeight: 26 }}>
                                Move through the catalog the way a showroom would guide you: broad craft families up front, deeper subcollections inside, and quick paths into AI-assisted search when shoppers need precision.
                            </Text>

                            <View style={{ marginTop: 24, flexDirection: stacked ? 'column' : 'row', gap: 12, alignItems: stacked ? 'stretch' : 'center' }}>
                                <Pressable
                                    onPress={() => router.push('/shop' as any)}
                                    style={({ pressed }) => [{
                                        opacity: pressed ? 0.92 : 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderRadius: 16,
                                        backgroundColor: '#FFF5EA',
                                        paddingHorizontal: 22,
                                        paddingVertical: 14,
                                    }]}
                                >
                                    <Feather name="arrow-right-circle" size={16} color="#5A321B" />
                                    <Text style={{ color: '#5A321B', fontFamily: BRAND_FONTS.body, fontSize: 14, fontWeight: '700' }}>
                                        Enter the shop
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.push('/ai-search' as any)}
                                    style={({ pressed }) => [{
                                        opacity: pressed ? 0.92 : 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.28)',
                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                        paddingHorizontal: 22,
                                        paddingVertical: 14,
                                    }]}
                                >
                                    <Feather name="search" size={15} color="#FFF7F0" />
                                    <Text style={{ color: '#FFF7F0', fontFamily: BRAND_FONTS.body, fontSize: 14, fontWeight: '700' }}>
                                        Ask AI to narrow it down
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
        </ImageBackground>
    );
}