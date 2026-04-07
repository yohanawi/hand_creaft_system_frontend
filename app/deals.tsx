import PageShell from '@/components/PageShell';
import { getProducts } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE = 'http://localhost:5000';

const productImageUri = (img?: string) =>
    img ? (img.startsWith('http') ? img : `${API_BASE}/${img.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Jewellery Design Tokens ──────────────────────────────────────────────────
const J = {
    gold: '#C9A84C',
    goldLight: '#E8CA7A',
    garnet: '#6B1A2F',
    garnetLight: '#A0344F',
    roseGold: '#B87333',
    cream: '#FAF6F0',
    parchment: '#F2EBE0',
    ivory: '#FFFAF5',
    ink: '#2C1A0E',
    wood: '#8B4513',
    woodDark: '#5C3317',
    muted: '#9B7B6A',
    border: '#E8D9C8',
    white: '#FFFFFF',
};

type Product = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    thumbnailImage?: string;
    images?: string[];
    category?: { _id: string; name: string; slug: string } | string;
    averageRating?: number;
    reviewCount?: number;
    availabilityStatus?: string;
};

const GoldDivider = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
        <Feather name="star" size={14} color={J.gold} style={{ marginHorizontal: 10 }} />
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: J.goldLight, marginHorizontal: 4 }} />
        <Feather name="star" size={14} color={J.gold} style={{ marginHorizontal: 10 }} />
        <View style={{ flex: 1, height: 1, backgroundColor: J.border }} />
    </View>
);

export default function DealsScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) { seconds--; }
                else if (minutes > 0) { minutes--; seconds = 59; }
                else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getProducts({ sort: 'popular', limit: 20 });
                const list: Product[] = res.data.products || res.data.data || res.data || [];
                setProducts(list);
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const saleProducts = products.filter(p => p.salePrice && p.salePrice < p.price);
    const displayProducts = saleProducts.length >= 4 ? saleProducts : products;
    const featuredDeals = displayProducts.slice(0, 2);
    const restDeals = displayProducts.slice(2);

    const rawCategories = products.map(p => typeof p.category === 'object' ? p.category?.name : '').filter(Boolean);
    const uniqueCategories = ['All', ...Array.from(new Set(rawCategories))];

    const filteredDeals = selectedCategory === 'all'
        ? restDeals
        : restDeals.filter(p => {
            const cat = typeof p.category === 'object' ? p.category?.name?.toLowerCase() : '';
            return cat === selectedCategory;
        });

    const calcDiscount = (price: number, salePrice?: number) => {
        if (!salePrice || salePrice >= price) return 0;
        return Math.round((1 - salePrice / price) * 100);
    };

    const getImage = (p: Product) => productImageUri(p.thumbnailImage || p.images?.[0]);

    const renderStars = (rating: number) => (
        <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Feather key={star} name="star" size={13}
                    color={star <= Math.floor(rating) ? J.gold : J.border}
                    style={{ marginRight: 2 }}
                />
            ))}
        </View>
    );

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <View style={{ alignItems: 'center' }}>
            <LinearGradient
                colors={[J.woodDark, J.garnet]}
                style={styles.timeBox}
            >
                <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>
            </LinearGradient>
            <Text style={styles.timeLabel}>{label}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: J.cream }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

                        {/* ── Hero + Countdown ──────────────────────────────── */}
                        <LinearGradient
                            colors={[J.woodDark, J.garnet, '#3D0D1A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hero}
                        >
                            <View style={[styles.ring, { width: 340, height: 340, top: -100, right: -80, borderColor: 'rgba(201,168,76,0.15)' }]} />
                            <View style={[styles.ring, { width: 200, height: 200, bottom: -60, left: -40, borderColor: 'rgba(255,255,255,0.08)' }]} />

                            <View style={{ alignItems: 'center', zIndex: 2 }}>
                                <View style={styles.heroBadge}>
                                    <Text style={styles.heroBadgeText}>✦ EXCLUSIVE OFFERS ✦</Text>
                                </View>
                                <Text style={[styles.heroTitle, { fontSize: isMobile ? 34 : 52 }]}>
                                    Private Sale
                                </Text>
                                <Text style={styles.heroSub}>
                                    Rare gems. Limited time. Extraordinary savings.{'\n'}
                                    Elevate your collection at exceptional prices.
                                </Text>

                                {/* Countdown */}
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownLabel}>✦ OFFER EXPIRES IN ✦</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
                                        <TimeBox value={timeLeft.hours} label="Hours" />
                                        <Text style={{ fontSize: 28, fontWeight: '800', color: J.goldLight }}>:</Text>
                                        <TimeBox value={timeLeft.minutes} label="Minutes" />
                                        <Text style={{ fontSize: 28, fontWeight: '800', color: J.goldLight }}>:</Text>
                                        <TimeBox value={timeLeft.seconds} label="Seconds" />
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>

                        <View style={{ paddingHorizontal: isMobile ? 16 : 48, paddingVertical: 40, backgroundColor: J.ivory }}>
                            <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>

                                {loading ? (
                                    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                                        <ActivityIndicator size="large" color={J.garnet} />
                                        <Text style={{ marginTop: 16, color: J.muted, fontSize: 14 }}>Preparing exclusive offers…</Text>
                                    </View>
                                ) : (
                                    <>
                                        {/* ── Featured Private Deals ────────── */}
                                        {featuredDeals.length > 0 && (
                                            <View style={{ marginBottom: 48 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                    <Feather name="star" size={22} color={J.gold} />
                                                    <Text style={[styles.sectionTitle, { marginLeft: 10 }]}>Private Collection Deals</Text>
                                                </View>
                                                <GoldDivider />
                                                {featuredDeals.map((deal) => {
                                                    const disc = calcDiscount(deal.price, deal.salePrice);
                                                    const displayPrice = deal.salePrice && deal.salePrice < deal.price ? deal.salePrice : deal.price;
                                                    const catName = typeof deal.category === 'object' ? deal.category?.name ?? '' : '';
                                                    return (
                                                        <TouchableOpacity
                                                            key={deal._id}
                                                            onPress={() => router.push({ pathname: '/product-single', params: { id: deal._id } } as any)}
                                                            style={styles.featuredCard}
                                                        >
                                                            <View style={{ flexDirection: isMobile ? 'column' : 'row' }}>
                                                                <View style={{ width: isMobile ? '100%' : '40%', position: 'relative' }}>
                                                                    <Image
                                                                        source={{ uri: getImage(deal) }}
                                                                        style={{ width: '100%', height: 320 }}
                                                                        resizeMode="cover"
                                                                    />
                                                                    {/* Private Sale tag */}
                                                                    <LinearGradient
                                                                        colors={[J.garnet, J.garnetLight]}
                                                                        style={styles.privateBadge}
                                                                    >
                                                                        <Text style={{ color: J.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>PRIVATE SALE</Text>
                                                                    </LinearGradient>
                                                                    {disc > 0 && (
                                                                        <View style={styles.discBadge}>
                                                                            <Text style={{ color: J.garnet, fontSize: 15, fontWeight: '800' }}>-{disc}%</Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                                <View style={{ flex: 1, padding: 28 }}>
                                                                    {catName ? (
                                                                        <View style={styles.catBadge}>
                                                                            <Text style={styles.catBadgeText}>{catName}</Text>
                                                                        </View>
                                                                    ) : null}
                                                                    <Text style={styles.productName}>{deal.name}</Text>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                                                                        {renderStars(deal.averageRating ?? 0)}
                                                                        <Text style={{ marginLeft: 8, color: J.muted, fontSize: 13 }}>
                                                                            {(deal.averageRating ?? 0).toFixed(1)} ({deal.reviewCount ?? 0} reviews)
                                                                        </Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
                                                                        <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
                                                                        {deal.salePrice && deal.salePrice < deal.price && (
                                                                            <Text style={styles.priceOld}>${deal.price.toFixed(2)}</Text>
                                                                        )}
                                                                    </View>
                                                                    <TouchableOpacity style={styles.addToCartBtn}>
                                                                        <Feather name="shopping-bag" size={16} color={J.white} />
                                                                        <Text style={styles.addToCartText}>Claim This Offer</Text>
                                                                    </TouchableOpacity>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                                                                        <Feather name="clock" size={14} color={J.roseGold} />
                                                                        <Text style={{ marginLeft: 6, fontSize: 12, color: J.roseGold, fontWeight: '600' }}>
                                                                            Limited quantity — act quickly
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}

                                        {/* ── Category Filter ───────────────── */}
                                        <View style={{ marginBottom: 28 }}>
                                            <Text style={styles.sectionTitle}>Browse by Collection</Text>
                                            <GoldDivider />
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    {uniqueCategories.map((category) => {
                                                        const active = selectedCategory === category.toLowerCase();
                                                        return (
                                                            <TouchableOpacity
                                                                key={category}
                                                                onPress={() => setSelectedCategory(category.toLowerCase())}
                                                                style={[styles.catPill, active && styles.catPillActive]}
                                                            >
                                                                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                                                                    {category}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </ScrollView>
                                        </View>

                                        {/* ── All Deals Grid ────────────────── */}
                                        <View style={{ marginBottom: 40 }}>
                                            <Text style={styles.sectionTitle}>All Sale Pieces</Text>
                                            <GoldDivider />
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isMobile ? 0 : 16, justifyContent: 'space-between' }}>
                                                {filteredDeals.map((deal) => {
                                                    const disc = calcDiscount(deal.price, deal.salePrice);
                                                    const displayPrice = deal.salePrice && deal.salePrice < deal.price ? deal.salePrice : deal.price;
                                                    const catName = typeof deal.category === 'object' ? deal.category?.name ?? '' : '';
                                                    const cardWidth = isMobile ? '100%' : isTablet ? '48%' : '31%';
                                                    return (
                                                        <TouchableOpacity
                                                            key={deal._id}
                                                            onPress={() => router.push({ pathname: '/product-single', params: { id: deal._id } } as any)}
                                                            style={[styles.gridCard, { width: cardWidth as any, marginBottom: 20 }]}
                                                        >
                                                            <View style={{ position: 'relative' }}>
                                                                <Image
                                                                    source={{ uri: getImage(deal) }}
                                                                    style={{ width: '100%', height: 240 }}
                                                                    resizeMode="cover"
                                                                />
                                                                {disc > 0 && (
                                                                    <View style={styles.gridDiscBadge}>
                                                                        <Text style={{ color: J.white, fontWeight: '800', fontSize: 11 }}>-{disc}%</Text>
                                                                    </View>
                                                                )}
                                                                <LinearGradient
                                                                    colors={[J.gold, J.goldDark ?? '#9B7A2A']}
                                                                    style={styles.saleBadge}
                                                                >
                                                                    <Text style={{ color: J.ink, fontSize: 10, fontWeight: '800' }}>SALE</Text>
                                                                </LinearGradient>
                                                                <TouchableOpacity style={styles.wishlistFloating}>
                                                                    <Feather name="heart" size={16} color={J.garnet} />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <View style={{ padding: 16 }}>
                                                                {catName ? <Text style={{ fontSize: 12, color: J.muted, marginBottom: 4 }}>{catName}</Text> : null}
                                                                <Text style={styles.gridProductName} numberOfLines={2}>{deal.name}</Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                                                    {renderStars(deal.averageRating ?? 0)}
                                                                    <Text style={{ marginLeft: 6, fontSize: 12, color: J.muted }}>({deal.reviewCount ?? 0})</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                                                                    <Text style={{ fontSize: 20, fontWeight: '800', color: J.garnet }}>${displayPrice.toFixed(2)}</Text>
                                                                    {deal.salePrice && deal.salePrice < deal.price && (
                                                                        <Text style={{ fontSize: 13, color: J.muted, textDecorationLine: 'line-through', marginLeft: 6 }}>${deal.price.toFixed(2)}</Text>
                                                                    )}
                                                                </View>
                                                                <TouchableOpacity style={styles.addToCartBtn}>
                                                                    <Feather name="shopping-bag" size={14} color={J.white} />
                                                                    <Text style={styles.addToCartText}>Add to Cart</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    </>
                                )}

                                {/* ── Newsletter / Alert Banner ─────────────── */}
                                <LinearGradient
                                    colors={[J.woodDark, J.garnet]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.alertBanner}
                                >
                                    <View style={[styles.ring, { width: 240, height: 240, top: -60, right: -50, borderColor: 'rgba(201,168,76,0.2)' }]} />
                                    <Feather name="bell" size={40} color={J.goldLight} style={{ marginBottom: 16 }} />
                                    <Text style={{ fontSize: isMobile ? 20 : 26, fontWeight: '800', color: J.white, textAlign: 'center', marginBottom: 10 }}>
                                        Never Miss an Exclusive Sale
                                    </Text>
                                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 22, marginBottom: 28, maxWidth: 460 }}>
                                        Our private sales are reserved for discerning clients. Be first to know when new pieces go on offer.
                                    </Text>
                                    <TouchableOpacity style={styles.whiteCta}>
                                        <Text style={styles.whiteCtaText}>Join the Inner Circle</Text>
                                    </TouchableOpacity>
                                </LinearGradient>

                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5 },
    hero: {
        paddingVertical: 72, paddingHorizontal: 24,
        alignItems: 'center', overflow: 'hidden', position: 'relative',
    },
    heroBadge: {
        backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.4)', borderRadius: 999,
        paddingHorizontal: 20, paddingVertical: 7, marginBottom: 20,
    },
    heroBadgeText: { color: '#E8CA7A', fontSize: 11, fontWeight: '700', letterSpacing: 2.5 },
    heroTitle: { color: '#FFF', fontWeight: '800', textAlign: 'center', marginBottom: 16 },
    heroSub: { color: 'rgba(255,255,255,0.80)', fontSize: 15, textAlign: 'center', lineHeight: 26, marginBottom: 28 },
    countdownBox: {
        backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.3)', borderRadius: 20,
        paddingHorizontal: 32, paddingVertical: 20, alignItems: 'center',
    },
    countdownLabel: { color: '#E8CA7A', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    timeBox: {
        width: 70, height: 70, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    timeValue: { color: '#E8CA7A', fontSize: 28, fontWeight: '800' },
    timeLabel: { color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '600', marginTop: 8, letterSpacing: 0.5 },
    sectionTitle: { fontSize: 24, fontWeight: '800', color: '#2C1A0E' },
    featuredCard: {
        backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10, shadowRadius: 16, elevation: 6,
        borderWidth: 1, borderColor: '#E8D9C8',
    },
    privateBadge: {
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingVertical: 9, alignItems: 'center',
    },
    discBadge: {
        position: 'absolute', top: 52, right: 16,
        backgroundColor: '#E8CA7A', borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 5,
    },
    catBadge: {
        alignSelf: 'flex-start', backgroundColor: '#FAF6F0',
        borderWidth: 1, borderColor: '#E8D9C8', borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
    },
    catBadgeText: { fontSize: 11, fontWeight: '700', color: '#8B4513', letterSpacing: 0.5 },
    productName: { fontSize: 22, fontWeight: '800', color: '#2C1A0E', marginBottom: 10, lineHeight: 30 },
    price: { fontSize: 32, fontWeight: '800', color: '#6B1A2F' },
    priceOld: { fontSize: 18, color: '#9B7B6A', textDecorationLine: 'line-through', marginLeft: 10 },
    addToCartBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#6B1A2F', borderRadius: 12, paddingVertical: 13, gap: 8,
    },
    addToCartText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    catPill: {
        paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
        borderWidth: 2, borderColor: '#E8D9C8', backgroundColor: '#FFF',
    },
    catPillActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
    catPillText: { fontSize: 13, fontWeight: '700', color: '#9B7B6A' },
    catPillTextActive: { color: '#FFF' },
    gridCard: {
        backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
        borderWidth: 1, borderColor: '#E8D9C8',
    },
    gridDiscBadge: {
        position: 'absolute', top: 14, left: 14,
        backgroundColor: '#6B1A2F', borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    saleBadge: {
        position: 'absolute', top: 14, right: 14,
        borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    },
    wishlistFloating: {
        position: 'absolute', bottom: 12, right: 12,
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6,
        elevation: 3,
    },
    gridProductName: { fontSize: 15, fontWeight: '700', color: '#2C1A0E', marginBottom: 8, lineHeight: 22 },
    alertBanner: {
        borderRadius: 24, padding: 40, alignItems: 'center',
        overflow: 'hidden', position: 'relative',
    },
    whiteCta: {
        backgroundColor: '#FFF', borderRadius: 12,
        paddingHorizontal: 32, paddingVertical: 14,
    },
    whiteCtaText: { color: '#6B1A2F', fontWeight: '800', fontSize: 15 },
});
