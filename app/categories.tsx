import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import api from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const PALETTE = {
    cream: '#FAF6F0',
    warmWhite: '#FDF9F4',
    linen: '#F5EDE0',
    kraft: '#D4A96A',
    terra: '#C1622F',
    clay: '#8B4513',
    bark: '#5C3317',
    sage: '#6B7C5E',
    dustyRose: '#C9948A',
    charcoal: '#2D2926',
    muted: '#8C7B6E',
    accent: '#E8703A',
};

const CATEGORY_PALETTES: Array<{ bg: [string, string, string]; badge: string; text: string }> = [
    { bg: ['#8B4513', '#C1622F', '#D4A96A'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#6B7C5E', '#8FA07E', '#B5C9A4'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#C9948A', '#D4756A', '#E8A090'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#5C3D2E', '#8B6353', '#C4956A'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#2D4A3E', '#3D6B5A', '#6B9E87'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#6B4E3D', '#8B6E5C', '#C4997A'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#4A3728', '#7D5A45', '#B08060'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
    { bg: ['#3D3028', '#6B5544', '#9E8070'], badge: 'rgba(255,255,255,0.2)', text: '#FFF' },
];

const ICONS: Array<React.ComponentProps<typeof Feather>['name']> = [
    'scissors', 'package', 'home', 'heart', 'gift', 'sun', 'feather', 'star',
];

const CRAFT_LABELS = [
    'Handmade', 'Artisan', 'Bespoke', 'Heritage', 'Curated', 'Crafted', 'Unique', 'Natural',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

const getCardWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '48%';
    return '31%';
};

// ─── Decorative Stitch Line ───────────────────────────────────────────────────
const StitchDivider = () => (
    <View style={styles.stitchRow}>
        {Array.from({ length: 32 }).map((_, i) => (
            <View key={i} style={styles.stitchDash} />
        ))}
    </View>
);

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
    <View style={styles.statBadge}>
        <View style={styles.statIcon}>
            <Feather name={icon as any} size={20} color={PALETTE.clay} />
        </View>
        <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </View>
);

// ─── Category Card ────────────────────────────────────────────────────────────
const CategoryCard = ({ category, index }: { category: any; index: number }) => {
    const cardScale = useRef(new Animated.Value(1)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(24)).current;
    const palette = CATEGORY_PALETTES[index % CATEGORY_PALETTES.length];
    const craftLabel = CRAFT_LABELS[index % CRAFT_LABELS.length];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(cardTranslate, {
                toValue: 0,
                tension: 60,
                friction: 10,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () =>
        Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true }).start();

    const handlePressOut = () =>
        Animated.spring(cardScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                {
                    width: getCardWidth() as any,
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }, { translateY: cardTranslate }],
                },
            ]}
        >
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.95}
            >
                <LinearGradient
                    colors={palette.bg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Texture overlay — decorative corner circles */}
                    <View style={styles.cardCornerAccent} />
                    <View style={styles.cardCornerAccentBR} />

                    {/* Top row: craft label + icon */}
                    <View style={styles.cardTopRow}>
                        <View style={styles.craftBadge}>
                            <Text style={styles.craftBadgeText}>{craftLabel}</Text>
                        </View>
                        <View style={styles.iconCircle}>
                            <Feather name={category.icon as any} size={26} color="#FFF" />
                        </View>
                    </View>

                    {/* Category name */}
                    <Text style={styles.cardTitle}>{category.name}</Text>

                    {/* Description */}
                    <Text style={styles.cardDesc}>{category.description}</Text>

                    {/* Stitch divider */}
                    <StitchDivider />

                    {/* Subcategory tags */}
                    {category.subcategories.length > 0 && (
                        <View style={styles.tagRow}>
                            {category.subcategories.slice(0, 4).map((sub: string, idx: number) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>{sub}</Text>
                                </View>
                            ))}
                            {category.subcategories.length > 4 && (
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>+{category.subcategories.length - 4}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Footer: item count + browse */}
                    <View style={styles.cardFooter}>
                        <View style={styles.itemCountBadge}>
                            <Feather name="layers" size={13} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.itemCountText}>{category.itemCount} subcategories</Text>
                        </View>
                        <TouchableOpacity style={styles.browseBtn} activeOpacity={0.85}>
                            <Text style={styles.browseBtnText}>Explore</Text>
                            <Feather name="arrow-right" size={15} color={PALETTE.clay} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CategoriesScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const heroTranslate = useRef(new Animated.Value(-20)).current;
    const statsAnim = useRef(new Animated.Value(0)).current;

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        Animated.stagger(120, [
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(heroTranslate, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
            ]),
            Animated.timing(statsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoadingCategories(true);
                setCategoriesError(null);
                const [catsRes, subsRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/subcategories'),
                ]);
                const apiCategories = Array.isArray(catsRes.data) ? catsRes.data : [];
                const apiSubcategories = Array.isArray(subsRes.data) ? subsRes.data : [];
                const topLevel = apiCategories
                    .filter((c: any) => !c.parent)
                    .filter((c: any) => c.status !== 'inactive');

                const cards = topLevel.map((cat: any, index: number) => {
                    const subs = apiSubcategories
                        .filter((s: any) => (s?.category?._id ?? s?.category) === cat._id)
                        .filter((s: any) => s.status !== 'inactive')
                        .map((s: any) => s.name)
                        .filter(Boolean);
                    return {
                        id: cat._id,
                        name: cat.name,
                        icon: ICONS[index % ICONS.length],
                        itemCount: String(subs.length),
                        description: cat.description || 'Discover handpicked artisan pieces in this collection',
                        subcategories: subs,
                    };
                });
                if (!mounted) return;
                setCategories(cards);
            } catch (e: any) {
                if (!mounted) return;
                setCategoriesError(e?.response?.data?.message ?? e?.message ?? 'Failed to load categories');
                setCategories([]);
            } finally {
                if (mounted) setLoadingCategories(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <View style={styles.root}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: PALETTE.cream }}>
                <PageShell>

                    {/* ── Hero ──────────────────────────────────────────────── */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: heroTranslate }] }}>
                        <LinearGradient
                            colors={[PALETTE.bark, PALETTE.clay, PALETTE.terra]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hero}
                        >
                            {/* Decorative pattern rings */}
                            <View style={styles.heroRing1} />
                            <View style={styles.heroRing2} />
                            <View style={styles.heroRing3} />

                            <View style={styles.heroContent}>
                                {/* Eyebrow */}
                                <View style={styles.heroBadge}>
                                    <Feather name="scissors" size={13} color={PALETTE.kraft} />
                                    <Text style={styles.heroBadgeText}>HANDMADE WITH LOVE</Text>
                                </View>

                                {/* Title */}
                                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                                    Shop by{'\n'}
                                    <Text style={styles.heroTitleAccent}>Category</Text>
                                </Text>

                                {/* Subtitle */}
                                <Text style={styles.heroSub}>
                                    Explore our curated collections of artisan goods — each category
                                    tells a story of craftsmanship and tradition.
                                </Text>

                                {/* Search bar mock */}
                                <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
                                    <Feather name="search" size={18} color={PALETTE.muted} />
                                    <Text style={styles.searchPlaceholder}>Search handcrafted goods…</Text>
                                    <View style={styles.searchBtn}>
                                        <Text style={styles.searchBtnText}>Search</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Torn paper edge effect */}
                    <View style={styles.tornEdge} />

                    {/* ── Stats Bar ─────────────────────────────────────────── */}
                    <Animated.View
                        style={[styles.statsBar, { opacity: statsAnim, transform: [{ translateY: Animated.multiply(Animated.subtract(new Animated.Value(1), statsAnim), new Animated.Value(16)) }] }]}
                    >
                        <StatBadge icon="package" value="18,500+" label="Products" />
                        <View style={styles.statDivider} />
                        <StatBadge icon="grid" value={String(categories.length || '—')} label="Categories" />
                        <View style={styles.statDivider} />
                        <StatBadge icon="star" value="4.9★" label="Avg. Rating" />
                        <View style={styles.statDivider} />
                        <StatBadge icon="truck" value="Free" label="Shipping over $50" />
                    </Animated.View>

                    {/* ── Categories Grid ───────────────────────────────────── */}
                    <View style={styles.gridSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderLine} />
                            <View style={styles.sectionHeaderCenter}>
                                <Feather name="feather" size={16} color={PALETTE.clay} />
                                <Text style={styles.sectionTitle}>ALL CATEGORIES</Text>
                                <Feather name="feather" size={16} color={PALETTE.clay} />
                            </View>
                            <View style={styles.sectionHeaderLine} />
                        </View>

                        <Text style={styles.sectionSubtitle}>
                            Every item lovingly handcrafted by independent artisans
                        </Text>

                        {/* Grid */}
                        <View style={[styles.grid, !isMobile && styles.gridRow]}>
                            {loadingCategories ? (
                                <View style={styles.stateCenter}>
                                    {[0, 1, 2].map(i => (
                                        <View key={i} style={[styles.skeletonCard, { width: getCardWidth() as any }]} />
                                    ))}
                                </View>
                            ) : categoriesError ? (
                                <View style={styles.stateCenter}>
                                    <Feather name="alert-circle" size={40} color={PALETTE.dustyRose} />
                                    <Text style={styles.errorText}>{categoriesError}</Text>
                                    <TouchableOpacity style={styles.retryBtn}>
                                        <Text style={styles.retryBtnText}>Try Again</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : categories.length === 0 ? (
                                <View style={styles.stateCenter}>
                                    <Feather name="inbox" size={48} color={PALETTE.muted} />
                                    <Text style={styles.emptyText}>No categories found yet.</Text>
                                </View>
                            ) : (
                                categories.map((category, index) => (
                                    <CategoryCard key={category.id} category={category} index={index} />
                                ))
                            )}
                        </View>
                    </View>
                </PageShell>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: PALETTE.cream,
    },

    // ── Hero ──
    hero: {
        paddingTop: isMobile ? 72 : 100,
        paddingBottom: 80,
        paddingHorizontal: isMobile ? 20 : 48,
        overflow: 'hidden',
        position: 'relative',
    },
    heroContent: {
        maxWidth: 680,
        alignSelf: 'center',
        width: '100%',
        zIndex: 2,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: isMobile ? 'center' : 'flex-start',
        backgroundColor: 'rgba(212,169,106,0.18)',
        borderRadius: 100,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginBottom: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(212,169,106,0.35)',
    },
    heroBadgeText: {
        color: PALETTE.kraft,
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 2,
    },
    heroTitle: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: isMobile ? 40 : 62,
        lineHeight: isMobile ? 48 : 72,
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    heroTitleMobile: {
        fontSize: 38,
        lineHeight: 46,
        textAlign: 'center',
    },
    heroTitleAccent: {
        color: PALETTE.kraft,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 15,
        lineHeight: 24,
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: 32,
        maxWidth: 520,
    },
    heroRing1: {
        position: 'absolute',
        right: -80,
        top: -80,
        width: 320,
        height: 320,
        borderRadius: 160,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        zIndex: 0,
    },
    heroRing2: {
        position: 'absolute',
        right: -30,
        top: -30,
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        zIndex: 0,
    },
    heroRing3: {
        position: 'absolute',
        left: -60,
        bottom: -60,
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        zIndex: 0,
    },

    // ── Search ──
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 100,
        paddingVertical: 10,
        paddingLeft: 18,
        paddingRight: 6,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    searchPlaceholder: {
        flex: 1,
        color: PALETTE.muted,
        fontSize: 14,
        marginLeft: 10,
    },
    searchBtn: {
        backgroundColor: PALETTE.clay,
        borderRadius: 100,
        paddingVertical: 9,
        paddingHorizontal: 20,
    },
    searchBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },

    // ── Torn edge ──
    tornEdge: {
        height: 24,
        backgroundColor: PALETTE.cream,
        marginTop: -1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    // ── Stats ──
    statsBar: {
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginHorizontal: isMobile ? 16 : 32,
        marginTop: isMobile ? 0 : -28,
        borderRadius: 20,
        paddingVertical: isMobile ? 20 : 22,
        paddingHorizontal: 28,
        shadowColor: PALETTE.bark,
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        gap: isMobile ? 16 : 0,
        borderWidth: 1,
        borderColor: 'rgba(212,169,106,0.15)',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: isMobile ? undefined : 1,
        justifyContent: isMobile ? 'flex-start' : 'center',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: PALETTE.linen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: PALETTE.bark,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    statLabel: {
        fontSize: 12,
        color: PALETTE.muted,
        marginTop: 1,
    },
    statDivider: {
        width: isMobile ? '100%' : 1,
        height: isMobile ? 1 : 40,
        backgroundColor: 'rgba(212,169,106,0.2)',
    },

    // ── Section ──
    gridSection: {
        paddingHorizontal: isMobile ? 16 : 32,
        paddingTop: 56,
        paddingBottom: 24,
        backgroundColor: PALETTE.cream,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },
    sectionHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(139,69,19,0.18)',
    },
    sectionHeaderCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: PALETTE.clay,
        letterSpacing: 3,
    },
    sectionSubtitle: {
        textAlign: 'center',
        color: PALETTE.muted,
        fontSize: 14,
        marginBottom: 40,
    },
    grid: {
        flexDirection: 'column',
        gap: 20,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    // ── Card ──
    cardWrapper: {
        marginBottom: isMobile ? 0 : 24,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    cardCornerAccent: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    cardCornerAccentBR: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    craftBadge: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 100,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    craftBadgeText: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cardTitle: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 24,
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    cardDesc: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },

    // ── Stitch divider ──
    stitchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 3,
        overflow: 'hidden',
    },
    stitchDash: {
        width: 8,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 1,
    },

    // ── Tags ──
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 18,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: 100,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    tagText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
        fontWeight: '500',
    },

    // ── Card footer ──
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    itemCountText: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: 12,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 100,
        paddingVertical: 9,
        paddingHorizontal: 18,
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    browseBtnText: {
        color: PALETTE.clay,
        fontWeight: '700',
        fontSize: 13,
    },

    // ── Skeleton ──
    stateCenter: {
        alignItems: 'center',
        paddingVertical: 48,
        width: '100%',
    },
    skeletonCard: {
        height: 280,
        borderRadius: 24,
        backgroundColor: PALETTE.linen,
        marginBottom: 20,
        opacity: 0.7,
    },

    // ── Error / Empty ──
    errorText: {
        color: PALETTE.dustyRose,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: PALETTE.clay,
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    retryBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyText: {
        color: PALETTE.muted,
        fontSize: 15,
        marginTop: 12,
    },

    // ── CTA ──
    ctaBanner: {
        marginHorizontal: isMobile ? 16 : 32,
        marginTop: 16,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: PALETTE.bark,
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
        borderWidth: 1.5,
        borderColor: 'rgba(212,169,106,0.3)',
    },
    ctaInner: {
        padding: isMobile ? 32 : 48,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    ctaDecorLeft: {
        position: 'absolute',
        left: -40,
        top: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(212,169,106,0.08)',
    },
    ctaDecorRight: {
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(139,69,19,0.06)',
    },
    ctaIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: PALETTE.linen,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(212,169,106,0.4)',
    },
    ctaTitle: {
        color: PALETTE.bark,
        fontWeight: '800',
        fontSize: isMobile ? 22 : 28,
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    ctaSubtitle: {
        color: PALETTE.muted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 420,
        marginBottom: 28,
    },
    ctaBtnRow: {
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
        alignItems: 'center',
    },
    ctaPrimaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PALETTE.clay,
        borderRadius: 100,
        paddingVertical: 13,
        paddingHorizontal: 28,
        gap: 8,
        shadowColor: PALETTE.clay,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    ctaPrimaryBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
    ctaSecondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: PALETTE.clay,
        borderRadius: 100,
        paddingVertical: 11,
        paddingHorizontal: 28,
        gap: 8,
        backgroundColor: 'transparent',
    },
    ctaSecondaryBtnText: {
        color: PALETTE.clay,
        fontWeight: '700',
        fontSize: 15,
    },
});