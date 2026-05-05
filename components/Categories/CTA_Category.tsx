import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

type Props = {
    featuredNames: string[];
};

export default function CTACategory({ featuredNames }: Props) {

    const router = useRouter();
    const { width } = useWindowDimensions();
    const compact = width < 860;

    return (
        <LinearGradient
            colors={['#24140E', '#4A2A1A', '#7A4322']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                borderRadius: 34,
                overflow: 'hidden',
                paddingHorizontal: compact ? 22 : 40,
                paddingVertical: compact ? 26 : 40,
            }}
        >

            {/* soft luxury glow elements */}
            <View style={{ position: 'absolute', top: -90, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View style={{ position: 'absolute', bottom: -80, left: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,215,180,0.08)' }} />

            <View style={{ flexDirection: compact ? 'column' : 'row', justifyContent: 'center', alignItems: compact ? 'flex-start' : 'center', gap: 28 }}>

                {/* LEFT CONTENT */}
                <View style={{ flex: 1, maxWidth: 640 }}>

                    {/* badge */}
                    <View style={{
                        alignSelf: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.14)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        paddingHorizontal: 14,
                        paddingVertical: 8
                    }}>
                        <Feather name="compass" size={13} color="#F7E6D6" />
                        <Text style={{
                            color: '#F7E6D6',
                            fontFamily: BRAND_FONTS.body,
                            fontSize: 11,
                            fontWeight: '700',
                            letterSpacing: 1.5
                        }}>
                            CURATED DISCOVERY
                        </Text>
                    </View>

                    {/* title */}
                    <Text className='text-center' style={{
                        marginTop: 18,
                        color: '#FFF9F4',
                        fontFamily: BRAND_FONTS.heading,
                        fontSize: compact ? 30 : 40,
                        lineHeight: compact ? 36 : 46,
                    }}>
                        Find pieces that feel personally made for you.
                    </Text>

                    {/* accent line */}
                    <View style={{ width: 60, height: 2, backgroundColor: '#E0A87C', marginTop: 16, marginBottom: 16, alignSelf: 'center' }} />

                    {/* description */}
                    <Text className='mx-auto text-center' style={{
                        color: 'rgba(255,249,244,0.75)',
                        fontFamily: BRAND_FONTS.body,
                        fontSize: 14,
                        lineHeight: 23,
                    }}>
                        Explore handcrafted collections, refined designs, or let our AI guide you to the perfect match in seconds.
                    </Text>

                    {/* buttons */}
                    <View style={{
                        marginTop: 24,
                        flexDirection: compact ? 'column' : 'row',
                        gap: 12,
                        justifyContent: 'center',                        
                    }}>

                        {/* primary */}
                        <Pressable
                            onPress={() => router.push('/shop' as any)}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.9 : 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                borderRadius: 16,
                                backgroundColor: '#FFF4E8',
                                paddingHorizontal: 22,
                                paddingVertical: 14,
                            })}
                        >
                            <Feather name="grid" size={15} color={BROWN.DarkColor} />
                            <Text style={{
                                color: BROWN.DarkColor,
                                fontFamily: BRAND_FONTS.body,
                                fontSize: 14,
                                fontWeight: '800'
                            }}>
                                Explore Collection
                            </Text>
                        </Pressable>

                        {/* secondary */}
                        <Pressable
                            onPress={() => router.push('/ai-search' as any)}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.9 : 1,
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
                            })}
                        >
                            <Feather name="search" size={15} color="#FFF7F4" />
                            <Text style={{
                                color: '#FFF7F4',
                                fontFamily: BRAND_FONTS.body,
                                fontSize: 14,
                                fontWeight: '700'
                            }}>
                                Ask AI Stylist
                            </Text>
                        </Pressable>

                    </View>

                </View>

            </View>

        </LinearGradient>
    );
}