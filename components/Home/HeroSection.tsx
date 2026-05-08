import { Feather } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
const HERO_HEIGHT = isMobile ? 580 : isTablet ? 540 : 600;

// ─── Slide data ───────────────────────────────────────────────────────────────
const slides = [
    {
        id: 'aurora-collection-2026',
        subtitle: 'Ethically Sourced',
        title: 'The Aurora\nHand-Cut\nSeries',
        description: 'AI-curated selections based on your style profile. Sustainable gems meeting master craftsmanship.',
        buttonText: 'View Your Matches', // AI-centric CTA
        buttonRoute: '/curated-for-you',
        imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=85',
        overlayColor: 'rgba(44, 24, 16, 0.45)', // Warm amber tones
        accentColor: '#D4AF37', // Gold
        icon: 'sparkles' as const,
        badge: '✨ AI Recommended',
    },
    {
        id: 'bespoke-silver-01',
        subtitle: 'Artisan Spotlight',
        title: 'Sterling\nSilver & \nTurquoise',
        description: 'Hand-hammered pieces by local silversmiths. Each piece carries a unique digital certificate.',
        buttonText: 'Explore Artistry',
        buttonRoute: '/shop/artisan-made',
        imageUri: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1400&q=85',
        overlayColor: 'rgba(15, 45, 55, 0.55)', // Deep teal
        accentColor: '#4FD1C5', // Turquoise
        icon: 'hammer' as const,
        badge: '🔨 Hand-Forged',
    },
];

// ─── Single slide ─────────────────────────────────────────────────────────────
function SlideView({
    slide,
    isActive,
    onShopPress,
    globalFloat,
}: {
    slide: typeof slides[0];
    isActive: boolean;
    onShopPress: () => void;
    globalFloat: Animated.Value;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(40)).current;
    const imgScale = useRef(new Animated.Value(1.06)).current;

    useEffect(() => {
        if (isActive) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.spring(textSlide, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
                Animated.timing(imgScale, { toValue: 1, duration: 6000, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textSlide, { toValue: 40, duration: 300, useNativeDriver: true }),
                Animated.timing(imgScale, { toValue: 1.06, duration: 400, useNativeDriver: true }),
            ]).start();
        }
    }, [isActive]);

    return (
        <Animated.View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity,
            pointerEvents: isActive ? 'auto' : 'none',
        }}>
            {/* ── Full-bleed image with Ken Burns ── */}
            <Animated.View style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                transform: [{ scale: imgScale }],
            }}>
                <Image
                    source={{ uri: slide.imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* ── Layered overlays ── */}
            <View style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                backgroundColor: slide.overlayColor,
            }} />

            {/* ── Content ── */}
            <View style={{
                flex: 1,
                paddingHorizontal: isMobile ? 24 : 56,
                paddingVertical: isMobile ? 60 : 80,
                justifyContent: 'flex-start',
                maxWidth: 1280,
                alignSelf: 'center',
                width: '100%',
            }}>
                <Animated.View style={{ transform: [{ translateY: textSlide }] }}>

                    {/* Badge */}
                    <View style={{
                        alignSelf: 'flex-start',
                        backgroundColor: slide.accentColor,
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 20,
                        marginBottom: 14,
                    }}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 }}>
                            {slide.badge}
                        </Text>
                    </View>

                    {/* Eyebrow */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                        <View style={{
                            width: 36,
                            height: 2,
                            backgroundColor: slide.accentColor,
                            borderRadius: 2,
                        }} />
                        <Text style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: 12,
                            fontWeight: '700',
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                        }}>
                            {slide.subtitle}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={{
                        color: '#fff',
                        fontSize: isMobile ? 38 : isTablet ? 52 : 66,
                        fontWeight: '900',
                        lineHeight: isMobile ? 44 : isTablet ? 60 : 74,
                        letterSpacing: -1.5,
                        marginBottom: 18,
                    }}>
                        {slide.title}
                    </Text>



                    {/* CTA row */}
                    <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginBottom: isMobile ? 32 : 40 }}>
                        <TouchableOpacity
                            onPress={() => router.push("/shop")}
                            style={{
                                backgroundColor: '#fff',
                                paddingHorizontal: 28,
                                paddingVertical: 15,
                                borderRadius: 50,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.25,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                        >
                            <Text style={{ color: '#8B4513', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 }}>
                                Explore Collection
                            </Text>
                            <Feather name="arrow-right" size={16} color="#8B4513" />
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={{
                            borderWidth: 1.5,
                            borderColor: 'rgba(255,255,255,0.55)',
                            paddingHorizontal: 28,
                            paddingVertical: 15,
                            borderRadius: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <Feather name="play-circle" size={16} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                Watch Video
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

// ─── Main HeroSection ─────────────────────────────────────────────────────────
export default function HeroSection() {

    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    // Floating decorative orb
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -18, duration: 3200, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 3200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Progress bar + auto-advance
    const startProgress = (slideIndex: number) => {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                const next = (slideIndex + 1) % slides.length;
                setCurrentSlide(next);
                startProgress(next);
            }
        });
    };

    useEffect(() => {
        startProgress(currentSlide);
        return () => progressAnim.stopAnimation();
    }, []);

    const goTo = (i: number) => {
        progressAnim.stopAnimation();
        setCurrentSlide(i);
        startProgress(i);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (

        <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>

            {/* ── Slides ── */}
            {slides.map((slide, i) => (
                <SlideView
                    key={slide.id}
                    slide={slide}
                    isActive={currentSlide === i}
                    onShopPress={() => router.push(slide.buttonRoute as any)}
                    globalFloat={floatAnim}
                />
            ))}

            {/* ── Navigation arrows (desktop) ── */}
            {!isMobile && (
                <>
                    <TouchableOpacity
                        onPress={() => goTo((currentSlide - 1 + slides.length) % slides.length)}
                        style={{
                            position: 'absolute',
                            left: 20,
                            top: '50%',
                            marginTop: -24,
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.25)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => goTo((currentSlide + 1) % slides.length)}
                        style={{
                            position: 'absolute',
                            right: 20,
                            top: '50%',
                            marginTop: -24,
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.25)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Feather name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>
                </>
            )}

            {/* ── Slide counter (top-right) ── */}
            <View style={{
                position: 'absolute',
                bottom: 20,
                right: isMobile ? 20 : !isTablet ? 100 : 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
            }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                    {String(currentSlide + 1).padStart(2, '0')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '500', marginHorizontal: 4 }}>
                    /
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '500' }}>
                    {String(slides.length).padStart(2, '0')}
                </Text>
            </View>

            {/* ── Progress dots + bar ── */}
            <View style={{
                position: 'absolute',
                bottom: 28,
                left: 0,
                right: 0,
                paddingHorizontal: isMobile ? 24 : 56,
            }}>
                {/* Dot row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    {slides.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => goTo(i)}>
                            <View style={{
                                width: currentSlide === i ? 32 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: currentSlide === i ? slides[currentSlide].accentColor : 'rgba(255,255,255,0.35)',
                            }} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
} 