import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Jewellery Brand Design Tokens ────────────────────────────────────────────
const J = {
    gold: '#C9A84C',
    goldLight: '#E8CA7A',
    goldDark: '#9B7A2A',
    garnet: '#6B1A2F',
    garnetLight: '#A0344F',
    roseGold: '#B87333',
    cream: '#FAF6F0',
    parchment: '#F2EBE0',
    linen: '#F5EDE0',
    ivory: '#FFFAF5',
    ink: '#2C1A0E',
    wood: '#8B4513',
    woodDark: '#5C3317',
    muted: '#9B7B6A',
    sage: '#6B7C5E',
    border: '#E8D9C8',
    white: '#FFFFFF',
    pearl: '#F5F0EA',
};

const GoldDivider = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: J.gold, marginHorizontal: 8 }} />
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: J.goldLight, marginHorizontal: 4 }} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: J.gold, marginHorizontal: 8 }} />
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
    </View>
);

export default function AboutUsScreen() {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideUpAnim = useState(new Animated.Value(50))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];
    const goldShimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(slideUpAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        ]).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(goldShimmer, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(goldShimmer, { toValue: 0, duration: 2000, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const stats = [
        { icon: 'users', value: '28K+', label: 'Happy Clients', color: J.gold },
        { icon: 'award', value: '5K+', label: 'Pieces Crafted', color: J.garnet },
        { icon: 'scissors', value: '18+', label: 'Years of Craft', color: J.roseGold },
        { icon: 'globe', value: '80+', label: 'Countries Reached', color: J.sage },
    ];

    const values = [
        {
            icon: 'heart',
            title: 'Artisan Heritage',
            description: 'Every piece is handcrafted by master jewellers who have inherited centuries-old techniques, ensuring unmatched quality and soul.',
            gradient: [J.garnet, '#A0344F'] as [string, string],
        },
        {
            icon: 'shield',
            title: 'Certified Excellence',
            description: 'All gemstones are ethically sourced and certified. Every metal is hallmarked to international standards you can trust.',
            gradient: [J.woodDark, J.wood] as [string, string],
        },
        {
            icon: 'star',
            title: 'Bespoke Creations',
            description: 'Commission a one-of-a-kind piece designed around your story — from sketch to hallmarked masterpiece.',
            gradient: [J.goldDark, J.gold] as [string, string],
        },
        {
            icon: 'globe',
            title: 'Ethical Sourcing',
            description: 'Our gemstones and metals are responsibly sourced from certified suppliers who respect people and the environment.',
            gradient: [J.sage, '#8FA07E'] as [string, string],
        },
    ];

    const team = [
        { name: 'Amara Silva', role: 'Master Goldsmith', icon: 'scissors' },
        { name: 'Priya Nair', role: 'Gemologist & Designer', icon: 'star' },
        { name: 'David Craft', role: 'Head of Bespoke', icon: 'pen-tool' },
        { name: 'Lena Voss', role: 'Client Experience', icon: 'heart' },
    ];

    const milestones = [
        { year: '2007', title: 'Founded', description: 'Began as a single craftsman\'s workshop in Colombo' },
        { year: '2012', title: 'First Gallery', description: 'Opened our celebrated artisan showroom' },
        { year: '2018', title: 'Global Reach', description: 'Shipped to 50+ countries worldwide' },
        { year: '2026', title: 'Today', description: '28,000+ clients across 80 countries' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: J.cream }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>

                    {/* ── Hero Section ─────────────────────────────────────── */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                        <LinearGradient
                            colors={[J.woodDark, J.wood, J.garnet]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ paddingVertical: isMobile ? 72 : 100, paddingHorizontal: isMobile ? 20 : 48, overflow: 'hidden', position: 'relative' }}
                        >
                            {/* Decorative rings */}
                            <View style={[styles.ring, { width: 320, height: 320, top: -100, right: -80, borderColor: 'rgba(201,168,76,0.15)' }]} />
                            <View style={[styles.ring, { width: 200, height: 200, top: 40, right: 40, borderColor: 'rgba(201,168,76,0.10)' }]} />
                            <View style={[styles.ring, { width: 160, height: 160, bottom: -60, left: -40, borderColor: 'rgba(255,255,255,0.08)' }]} />

                            <View style={{ maxWidth: 700, alignSelf: 'center', width: '100%', alignItems: 'center', zIndex: 2 }}>
                                {/* Eyebrow */}
                                <View style={styles.heroBadge}>
                                    <Feather name="scissors" size={12} color={J.goldLight} />
                                    <Text style={styles.heroBadgeText}>HAND CRAFTED SINCE 2007</Text>
                                    <Feather name="scissors" size={12} color={J.goldLight} />
                                </View>

                                <Text style={[styles.heroTitle, { fontSize: isMobile ? 36 : 60 }]}>
                                    Our Artisan{'\n'}
                                    <Text style={{ color: J.goldLight }}>Story</Text>
                                </Text>
                                <Text style={styles.heroSub}>
                                    Every gem tells a tale. Every ring carries a moment. We are the craftspeople{'\n'}
                                    behind jewellery that outlives generations.
                                </Text>

                                {/* Gold ornament */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.4)' }} />
                                    <Feather name="star" size={18} color={J.gold} style={{ marginHorizontal: 12 }} />
                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.4)' }} />
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>


                    {/* ── Our Story ─────────────────────────────────────────── */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}>
                        <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 48, backgroundColor: J.ivory }}>
                            <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                                <View style={[{ flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }]}>
                                    <View style={{ flex: isMobile ? undefined : 1, marginRight: isMobile ? 0 : 56, marginBottom: isMobile ? 36 : 0 }}>
                                        <Text style={styles.eyebrow}>✦ Our Story</Text>
                                        <Text style={[styles.sectionTitle, { fontSize: isMobile ? 28 : 40 }]}>
                                            Craftsmanship Born{'\n'}From Passion
                                        </Text>
                                        <GoldDivider />
                                        <Text style={styles.bodyText}>
                                            Founded in 2007 in a small Colombo workshop, ArtisanGems was born from a single master jeweller's lifelong devotion to the craft. What started with a hammer, an anvil, and a burning passion for perfection has grown into Sri Lanka's most celebrated artisan jewellery house.
                                        </Text>
                                        <Text style={[styles.bodyText, { marginTop: 14 }]}>
                                            Every ring, pendant, and bracelet we create carries the spirit of centuries-old techniques fused with contemporary design. We never mass-produce — each piece is hand-finished to perfection before it leaves our atelier.
                                        </Text>
                                        <TouchableOpacity style={styles.goldButton}>
                                            <Text style={styles.goldButtonText}>Explore Our Collections</Text>
                                            <Feather name="arrow-right" size={16} color={J.white} style={{ marginLeft: 8 }} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: isMobile ? undefined : 1 }}>
                                        <LinearGradient
                                            colors={[J.woodDark, J.garnet]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.storyImageBox}
                                        >
                                            <View style={styles.storyIconRing}>
                                                <Feather name="scissors" size={48} color={J.goldLight} />
                                            </View>
                                            <Text style={styles.storyImageCaption}>Handcrafted with Love</Text>
                                            {/* Gem dots */}
                                            <View style={[styles.gemDot, { top: 20, right: 20, backgroundColor: J.gold }]} />
                                            <View style={[styles.gemDot, { bottom: 32, left: 24, backgroundColor: J.garnetLight, width: 10, height: 10 }]} />
                                            <View style={[styles.gemDot, { top: 60, left: 18, backgroundColor: J.goldLight, width: 6, height: 6 }]} />
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* ── Stats ─────────────────────────────────────────────── */}
                    <LinearGradient
                        colors={[J.garnet, J.wood]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 48, paddingHorizontal: isMobile ? 20 : 48 }}
                    >
                        <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                            <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                {stats.map((stat, index) => (
                                    <React.Fragment key={index}>
                                        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginBottom: isMobile ? 32 : 0 }}>
                                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,168,76,0.2)', borderWidth: 2, borderColor: J.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                                <Feather name={stat.icon as any} size={28} color={stat.color} />
                                            </View>
                                            <Text style={{ fontSize: 36, fontWeight: '800', color: J.goldLight, marginBottom: 4 }}>{stat.value}</Text>
                                            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500', letterSpacing: 0.5 }}>{stat.label}</Text>
                                        </Animated.View>
                                        {!isMobile && index < stats.length - 1 && (
                                            <View style={{ width: 1, height: 64, backgroundColor: 'rgba(201,168,76,0.3)' }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    </LinearGradient>

                    {/* ── Our Values ────────────────────────────────────────── */}
                    <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 48, backgroundColor: J.parchment }}>
                        <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                            <Text style={[styles.eyebrow, { textAlign: 'center' }]}>✦ What We Stand For</Text>
                            <Text style={[styles.sectionTitle, { textAlign: 'center', fontSize: isMobile ? 28 : 40 }]}>Our Core Values</Text>
                            <GoldDivider />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 }}>
                                {values.map((value, index) => (
                                    <Animated.View
                                        key={index}
                                        style={[styles.valueCard, { width: isMobile ? '100%' : '48%', marginBottom: 20 }, { opacity: fadeAnim }]}
                                    >
                                        <LinearGradient
                                            colors={value.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{ padding: 28, borderRadius: 20, position: 'relative', overflow: 'hidden' }}
                                        >
                                            <View style={[styles.ring, { width: 120, height: 120, top: -30, right: -30, borderColor: 'rgba(255,255,255,0.15)' }]} />
                                            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                                <Feather name={value.icon as any} size={24} color="#FFF" />
                                            </View>
                                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 10 }}>{value.title}</Text>
                                            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 22 }}>{value.description}</Text>
                                        </LinearGradient>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* ── Timeline / Milestones ─────────────────────────────── */}
                    <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 48, backgroundColor: J.ivory }}>
                        <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                            <Text style={[styles.eyebrow, { textAlign: 'center' }]}>✦ Our Journey</Text>
                            <Text style={[styles.sectionTitle, { textAlign: 'center', fontSize: isMobile ? 28 : 40 }]}>Milestones of Mastery</Text>
                            <GoldDivider />
                            <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginTop: 12 }}>
                                {milestones.map((m, index) => (
                                    <View key={index} style={{ alignItems: 'center', flex: isMobile ? undefined : 1, marginBottom: isMobile ? 32 : 0 }}>
                                        <LinearGradient
                                            colors={[J.garnet, J.wood]}
                                            style={styles.milestoneYear}
                                        >
                                            <Text style={{ color: J.goldLight, fontWeight: '800', fontSize: 16 }}>{m.year}</Text>
                                        </LinearGradient>
                                        {!isMobile && index < milestones.length - 1 && (
                                            <View style={{ position: 'absolute', top: 28, left: '50%', right: '-50%', height: 2, backgroundColor: J.border, zIndex: 0 }} />
                                        )}
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: J.garnet, marginTop: 12, textAlign: 'center' }}>{m.title}</Text>
                                        <Text style={{ fontSize: 13, color: J.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>{m.description}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* ── Team ──────────────────────────────────────────────── */}
                    <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 48, backgroundColor: J.parchment }}>
                        <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
                            <Text style={[styles.eyebrow, { textAlign: 'center' }]}>✦ The Artisans</Text>
                            <Text style={[styles.sectionTitle, { textAlign: 'center', fontSize: isMobile ? 28 : 40 }]}>Meet the Makers</Text>
                            <GoldDivider />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: isTablet || !isMobile ? 'space-between' : 'center', marginTop: 8 }}>
                                {team.map((member, index) => (
                                    <Animated.View
                                        key={index}
                                        style={[styles.teamCard, { width: isMobile ? '100%' : isTablet ? '48%' : '23%', marginBottom: 20 }, { opacity: fadeAnim }]}
                                    >
                                        <View style={{ alignItems: 'center', padding: 28, backgroundColor: J.white, borderRadius: 20, borderWidth: 1, borderColor: J.border }}>
                                            <LinearGradient
                                                colors={[J.garnet, J.wood]}
                                                style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
                                            >
                                                <Feather name={member.icon as any} size={36} color={J.goldLight} />
                                            </LinearGradient>
                                            <Text style={{ fontSize: 16, fontWeight: '700', color: J.ink, textAlign: 'center', marginBottom: 4 }}>{member.name}</Text>
                                            <Text style={{ fontSize: 13, color: J.wood, fontWeight: '600', textAlign: 'center' }}>{member.role}</Text>
                                        </View>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* ── CTA ───────────────────────────────────────────────── */}
                    <View style={{ paddingVertical: 64, paddingHorizontal: isMobile ? 20 : 48, backgroundColor: J.ivory }}>
                        <View style={{ maxWidth: 900, alignSelf: 'center', width: '100%' }}>
                            <LinearGradient
                                colors={[J.woodDark, J.garnet]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: isMobile ? 36 : 56, borderRadius: 28, alignItems: 'center', overflow: 'hidden', position: 'relative' }}
                            >
                                <View style={[styles.ring, { width: 280, height: 280, top: -80, right: -60, borderColor: 'rgba(201,168,76,0.2)' }]} />
                                <Feather name="star" size={40} color={J.goldLight} style={{ marginBottom: 20 }} />
                                <Text style={{ fontSize: isMobile ? 28 : 38, fontWeight: '800', color: J.white, textAlign: 'center', marginBottom: 14 }}>
                                    Begin Your Jewellery Journey
                                </Text>
                                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 26, marginBottom: 32, maxWidth: 520 }}>
                                    Discover pieces that speak your story. From everyday elegance to once-in-a-lifetime masterpieces.
                                </Text>
                                <TouchableOpacity style={[styles.goldButton, { paddingHorizontal: 40 }]}>
                                    <Text style={styles.goldButtonText}>Shop the Collection</Text>
                                    <Feather name="arrow-right" size={16} color={J.white} style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>

                </PageShell>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1.5,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201,168,76,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.35)',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 28,
        gap: 8,
    },
    heroBadgeText: {
        color: J.goldLight,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
    },
    heroTitle: {
        color: J.white,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 68,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2.5,
        color: J.wood,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    sectionTitle: {
        fontWeight: '800',
        color: J.ink,
        lineHeight: 50,
    },
    bodyText: {
        fontSize: 15,
        color: J.muted,
        lineHeight: 26,
    },
    goldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: J.garnet,
        borderRadius: 999,
        paddingHorizontal: 28,
        paddingVertical: 14,
        marginTop: 28,
        alignSelf: 'flex-start',
    },
    goldButtonText: {
        color: J.white,
        fontWeight: '700',
        fontSize: 15,
    },
    storyImageBox: {
        borderRadius: 24,
        height: 360,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    storyIconRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'rgba(201,168,76,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    storyImageCaption: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 16,
        letterSpacing: 1.2,
    },
    gemDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        opacity: 0.7,
    },
    valueCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    milestoneYear: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    teamCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
});
