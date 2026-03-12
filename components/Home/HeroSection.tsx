import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
const HERO_HEIGHT = isMobile ? 580 : isTablet ? 540 : 600;

// ─── Slide data ───────────────────────────────────────────────────────────────
const slides = [
    {
        id: 0,
        subtitle: 'New Arrivals',
        title: 'Summer\nCollection\n2026',
        description: 'Discover the latest trends with up to 50% off on handpicked styles.',
        buttonText: 'Shop Now',
        buttonRoute: '/shop',
        imageUri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85',
        overlayColor: 'rgba(139,69,19,0.52)',
        accentColor: '#CD853F',
        icon: 'sun' as const,
        badge: '⚡ Limited Offer',
    },
    {
        id: 1,
        subtitle: 'Tech Deals',
        title: 'Electronics\nSale Up To\n60% Off',
        description: 'Get the latest gadgets at unbeatable prices. Upgrade your life today.',
        buttonText: 'Explore Deals',
        buttonRoute: '/shop',
        imageUri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85',
        overlayColor: 'rgba(15,40,80,0.60)',
        accentColor: '#3B82F6',
        icon: 'smartphone' as const,
        badge: '🔥 Best Sellers',
    },
    {
        id: 2,
        subtitle: 'Comfort Zone',
        title: 'Home &\nLiving\nRedefined',
        description: 'Transform your space with our curated home décor and furniture.',
        buttonText: 'Browse Collection',
        buttonRoute: '/shop',
        imageUri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85',
        overlayColor: 'rgba(20,83,45,0.52)',
        accentColor: '#10B981',
        icon: 'home' as const,
        badge: '🌿 Eco Friendly',
    },
];

// ─── Floating stat badge ──────────────────────────────────────────────────────
function StatBadge({
    icon,
    value,
    label,
    delay,
    style,
}: {
    icon: keyof typeof Feather.glyphMap;
    value: string;
    label: string;
    delay: number;
    style?: object;
}) {
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
            Animated.spring(slideUp, { toValue: 0, delay, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[{
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.22)',
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
            }, style]}
        >
            <View style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Feather name={icon} size={15} color="#fff" />
            </View>
            <View>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: -0.3 }}>{value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.70)', fontSize: 10, fontWeight: '500' }}>{label}</Text>
            </View>
        </Animated.View>
    );
}

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
                            onPress={onShopPress}
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
                                {slide.buttonText}
                            </Text>
                            <Feather name="arrow-right" size={16} color="#8B4513" />
                        </TouchableOpacity>

                        <TouchableOpacity style={{
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
                        </TouchableOpacity>
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

            {/* ── Desktop floating icon orb (top-right) ── */}
            {!isMobile && (
                <Animated.View style={{
                    position: 'absolute',
                    top: isMobile ? 40 : 60,
                    right: isMobile ? 20 : 56,
                    transform: [{ translateY: floatAnim }],
                    pointerEvents: 'none',
                }}>
                    <View style={{
                        width: isTablet ? 160 : 200,
                        height: isTablet ? 160 : 200,
                        borderRadius: isTablet ? 80 : 100,
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.18)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            width: isTablet ? 110 : 140,
                            height: isTablet ? 110 : 140,
                            borderRadius: isTablet ? 55 : 70,
                            backgroundColor: 'rgba(255,255,255,0.14)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Feather
                                name={slides[currentSlide].icon}
                                size={isTablet ? 50 : 64}
                                color="rgba(255,255,255,0.90)"
                            />
                        </View>
                    </View>
                </Animated.View>
            )}

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