import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
    { value: '2024', label: 'Est. Year', icon: 'calendar' as const, color: '#8B4513', bg: '#FDF0E8' },
    { value: '50K+', label: 'Happy Customers', icon: 'heart' as const, color: '#BE123C', bg: '#FFF1F2' },
    { value: '200+', label: 'Artisan Products', icon: 'package' as const, color: '#0F766E', bg: '#F0FDFA' },
    { value: '35+', label: 'Local Artisans', icon: 'users' as const, color: '#7C3AED', bg: '#F5F3FF' },
];

const values = [
    {
        icon: 'scissors' as const,
        title: 'Handcrafted',
        text: 'Every piece is lovingly made by hand, never mass-produced.',
        color: '#8B4513',
        bg: '#FDF0E8',
    },
    {
        icon: 'wind' as const,
        title: 'Eco-Friendly',
        text: 'Sustainable materials sourced responsibly from local suppliers.',
        color: '#0F766E',
        bg: '#F0FDFA',
    },
    {
        icon: 'heart' as const,
        title: 'Made with Love',
        text: 'Each item carries the soul and story of its maker.',
        color: '#BE123C',
        bg: '#FFF1F2',
    },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ stat, anim }: { stat: typeof stats[0]; anim: Animated.Value }) {
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

    return (
        <Animated.View style={{
            opacity: anim,
            transform: [{ translateY }],
            flex: isMobile ? undefined : 1,
            minWidth: isMobile ? '44%' : undefined,
        }}>
            <View style={{
                backgroundColor: '#fff',
                borderRadius: 22,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#F0E8E0',
                shadowColor: stat.color,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.10,
                shadowRadius: 14,
                elevation: 4,
            }}>
                {/* Icon tile */}
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    backgroundColor: stat.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                }}>
                    <Feather name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={{
                    fontSize: 28,
                    fontWeight: '900',
                    color: '#1A0F0A',
                    letterSpacing: -1,
                    lineHeight: 32,
                }}>
                    {stat.value}
                </Text>
                <Text style={{
                    color: '#9CA3AF',
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                    textAlign: 'center',
                    letterSpacing: 0.3,
                }}>
                    {stat.label}
                </Text>
                {/* Accent bottom bar */}
                <View style={{
                    height: 3,
                    width: 32,
                    borderRadius: 2,
                    backgroundColor: stat.color,
                    marginTop: 10,
                    opacity: 0.7,
                }} />
            </View>
        </Animated.View>
    );
}

// ─── Value row ────────────────────────────────────────────────────────────────
function ValueItem({ v, delay }: { v: typeof values[0]; delay: number }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 550,
            delay,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{
            opacity: anim,
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 18,
        }}>
            <View style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: v.bg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                marginTop: 2,
                borderWidth: 1,
                borderColor: `${v.color}22`,
            }}>
                <Feather name={v.icon} size={20} color={v.color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A0F0A', marginBottom: 3, letterSpacing: -0.2 }}>
                    {v.title}
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20 }}>
                    {v.text}
                </Text>
            </View>
        </Animated.View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutBrandSection() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const leftAnim = useRef(new Animated.Value(-50)).current;
    const rightAnim = useRef(new Animated.Value(50)).current;
    const imgScaleAnim = useRef(new Animated.Value(0.92)).current;
    const statAnims = useRef(stats.map(() => new Animated.Value(0))).current;
    const stripAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(leftAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
            Animated.timing(rightAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
            Animated.spring(imgScaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.timing(stripAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        ]).start();

        stats.forEach((_, i) => {
            Animated.timing(statAnims[i], {
                toValue: 1,
                duration: 600,
                delay: 300 + i * 130,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    return (
        <View style={{ backgroundColor: '#FBF7F3', overflow: 'hidden' }}>

            {/* ── Decorative blobs ── */}
            <View style={{
                position: 'absolute', top: -80, left: -80,
                width: 280, height: 280, borderRadius: 140,
                backgroundColor: '#8B4513', opacity: 0.05,
            }} />
            <View style={{
                position: 'absolute', bottom: -60, right: -60,
                width: 220, height: 220, borderRadius: 110,
                backgroundColor: '#CD853F', opacity: 0.07,
            }} /> 

            <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 40 }}>
                <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%' }}>

                    {/* ═══════════════════════════════════════════
                        TWO-COLUMN: Image Left + Text Right
                    ═══════════════════════════════════════════ */}
                    <View style={{
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: isMobile ? 0 : 56,
                        marginBottom: 60,
                    }}>

                        {/* ── LEFT: Image collage ── */}
                        <Animated.View style={{
                            opacity: fadeAnim,
                            transform: [{ translateX: leftAnim }],
                            width: isMobile ? '100%' : isTablet ? '45%' : '42%',
                            marginBottom: isMobile ? 48 : 0,
                        }}>
                            {/* Main image */}
                            <Animated.View style={{
                                transform: [{ scale: imgScaleAnim }],
                                borderRadius: 28,
                                overflow: 'hidden',
                                shadowColor: '#8B4513',
                                shadowOffset: { width: 0, height: 16 },
                                shadowOpacity: 0.20,
                                shadowRadius: 28,
                                elevation: 12,
                            }}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=85' }}
                                    style={{ width: '100%', height: isMobile ? 280 : 400 }}
                                    resizeMode="cover"
                                />
                                {/* Gradient overlay at bottom */}
                                <View style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
                                    backgroundColor: 'rgba(0,0,0,0.35)',
                                }} />
                                {/* Bottom-left text on image */}
                                <View style={{ position: 'absolute', bottom: 16, left: 16 }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>
                                        OUR WORKSHOP
                                    </Text>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>
                                        Where craft begins ✦
                                    </Text>
                                </View>
                            </Animated.View>

                            {/* Floating badge: Est. 2024 */}
                            <View style={{
                                position: 'absolute',
                                bottom: isMobile ? -18 : -22,
                                right: isMobile ? 12 : -16,
                                backgroundColor: '#8B4513',
                                paddingHorizontal: 20,
                                paddingVertical: 14,
                                borderRadius: 20,
                                shadowColor: '#8B4513',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.40,
                                shadowRadius: 16,
                                elevation: 10,
                                alignItems: 'center',
                            }}>
                                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                    Crafting Since
                                </Text>
                                <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1, lineHeight: 38 }}>
                                    2024
                                </Text>
                            </View>

                            {/* Floating artisan card: top-left */}
                            <View style={{
                                position: 'absolute',
                                top: -18,
                                left: isMobile ? 12 : -18,
                                backgroundColor: '#fff',
                                borderRadius: 18,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.12,
                                shadowRadius: 12,
                                elevation: 8,
                                gap: 10,
                            }}>
                                {/* Stacked avatars */}
                                <View style={{ flexDirection: 'row' }}>
                                    {[
                                        'https://randomuser.me/api/portraits/women/44.jpg',
                                        'https://randomuser.me/api/portraits/women/68.jpg',
                                        'https://randomuser.me/api/portraits/men/32.jpg',
                                    ].map((uri, i) => (
                                        <Image
                                            key={i}
                                            source={{ uri }}
                                            style={{
                                                width: 30, height: 30, borderRadius: 15,
                                                borderWidth: 2, borderColor: '#fff',
                                                marginLeft: i > 0 ? -8 : 0,
                                            }}
                                        />
                                    ))}
                                </View>
                                <View>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#1A0F0A' }}>35+ Artisans</Text>
                                    <View style={{ flexDirection: 'row', gap: 1, marginTop: 2 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Feather key={i} name="star" size={9} color="#F59E0B" />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Small inset image: bottom-left (desktop) */}
                            {!isMobile && (
                                <View style={{
                                    position: 'absolute',
                                    bottom: -24,
                                    left: -20,
                                    borderRadius: 20,
                                    overflow: 'hidden',
                                    borderWidth: 4,
                                    borderColor: '#fff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=240&q=80' }}
                                        style={{ width: 110, height: 110 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        </Animated.View>

                        {/* ── RIGHT: Story text ── */}
                        <Animated.View style={{
                            opacity: fadeAnim,
                            transform: [{ translateX: rightAnim }],
                            flex: isMobile ? undefined : 1,
                            marginTop: isMobile ? 32 : 0,
                        }}>
                            {/* Eyebrow */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <View style={{ width: 32, height: 2, backgroundColor: '#8B4513', borderRadius: 2 }} />
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: '#8B4513',
                                    letterSpacing: 2.5,
                                    textTransform: 'uppercase',
                                }}>
                                    Our Story
                                </Text>
                            </View>

                            {/* Title */}
                            <Text style={{
                                fontSize: isMobile ? 28 : isTablet ? 32 : 40,
                                fontWeight: '900',
                                color: '#1A0F0A',
                                letterSpacing: -1,
                                lineHeight: isMobile ? 36 : 50,
                                marginBottom: 18,
                            }}>
                                Crafted by Local{'\n'}
                                <Text style={{ color: '#8B4513' }}>Artisans</Text> with Love
                            </Text>

                            {/* Body text */}
                            <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 24, marginBottom: 12 }}>
                                Born from a passion for preserving traditional crafts, our platform was founded in 2024 to give talented local artisans a global stage. Every product is made entirely by hand — no factories, no shortcuts, just skilled hands and sincere hearts.
                            </Text>
                            <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 24, marginBottom: 28 }}>
                                When you buy from us, you support a real person, a real family, and a living craft tradition that deserves to thrive.
                            </Text>

                            {/* Value rows */}
                            <View style={{ marginBottom: 28 }}>
                                {values.map((v, i) => (
                                    <ValueItem key={v.title} v={v} delay={400 + i * 120} />
                                ))}
                            </View>

                            {/* CTA buttons */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: '#8B4513',
                                    paddingHorizontal: 24,
                                    paddingVertical: 14,
                                    borderRadius: 50,
                                    shadowColor: '#8B4513',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 12,
                                    elevation: 6,
                                }}>
                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 }}>
                                        Meet Our Artisans
                                    </Text>
                                    <Feather name="arrow-right" size={16} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    borderWidth: 1.5,
                                    borderColor: '#8B4513',
                                    paddingHorizontal: 24,
                                    paddingVertical: 14,
                                    borderRadius: 50,
                                }}>
                                    <Feather name="play-circle" size={16} color="#8B4513" />
                                    <Text style={{ color: '#8B4513', fontWeight: '700', fontSize: 14 }}>
                                        Our Story
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>

                    {/* ═══════════════════════════════════════════
                        STATS ROW
                    ═══════════════════════════════════════════ */}
                    <View style={{ marginTop: isMobile ? 40 : 20 }}>
                        {/* Divider with label */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#EDE5DC' }} />
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#fff',
                                paddingHorizontal: 14,
                                paddingVertical: 6,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: '#EDE5DC',
                            }}>
                                <Feather name="trending-up" size={13} color="#8B4513" />
                                <Text style={{ color: '#8B4513', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>
                                    BY THE NUMBERS
                                </Text>
                            </View>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#EDE5DC' }} />
                        </View>

                        {/* Stat cards */}
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                            gap: 14,
                            justifyContent: 'center',
                        }}>
                            {stats.map((s, i) => (
                                <StatCard key={s.label} stat={s} anim={statAnims[i]} />
                            ))}
                        </View>
                    </View>

                    {/* ═══════════════════════════════════════════
                        BOTTOM TRUST BANNER
                    ═══════════════════════════════════════════ */}
                    <Animated.View style={{
                        opacity: fadeAnim,
                        marginTop: 48,
                        borderRadius: 24,
                        overflow: 'hidden',
                    }}>
                        <LinearGradient
                            colors={['#8B4513', '#A0522D', '#CD853F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 24 }}
                        >
                            <View style={{
                                paddingVertical: 28,
                                paddingHorizontal: isMobile ? 20 : 40,
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: isMobile ? 16 : 0,
                            }}>
                                <View style={{ alignItems: isMobile ? 'center' : 'flex-start' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                                        Start Supporting Artisans
                                    </Text>
                                    <Text style={{ color: '#fff', fontSize: isMobile ? 18 : 22, fontWeight: '900', letterSpacing: -0.5, textAlign: isMobile ? 'center' : 'left' }}>
                                        Every purchase tells a human story ✦
                                    </Text>
                                </View>
                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: '#fff',
                                    paddingHorizontal: 24,
                                    paddingVertical: 13,
                                    borderRadius: 50,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}>
                                    <Text style={{ color: '#8B4513', fontWeight: '800', fontSize: 14 }}>
                                        Shop Handmade
                                    </Text>
                                    <Feather name="arrow-right" size={16} color="#8B4513" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                </View>
            </View> 
        </View>
    );
}