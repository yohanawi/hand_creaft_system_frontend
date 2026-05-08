import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { getAssetUrl, getProducts } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    DimensionValue,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

const J = {
    gold: '#C8A663',
    goldDark: '#8C6A2A',
    garnet: '#6A2336',
    garnetDark: '#351019',
    blush: '#F7ECE4',
    canvas: '#FBF7F2',
    card: '#FFFDFC',
    parchment: '#EFE3D6',
    ink: '#2B201D',
    muted: '#7C6960',
    border: '#EADCCF',
    white: '#FFFFFF',
    success: '#1F7A58',
};

const HERO_IMAGE = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80';
const STORY_IMAGES = [
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
];

const COLLECTIONS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'] as const;
const MATERIALS = ['All', 'Gold', 'Silver', 'Gemstone'] as const;
const STYLES = ['All', 'Minimal', 'Bridal', 'Custom'] as const;
const SORT_OPTIONS = ['Best deals', 'Low to High', 'New arrivals'] as const;

const PRICE_RANGES = [
    { label: 'All', min: 0, max: Number.POSITIVE_INFINITY },
    { label: 'Under $150', min: 0, max: 150 },
    { label: '$150 - $300', min: 150, max: 300 },
    { label: '$300+', min: 300, max: Number.POSITIVE_INFINITY },
] as const;

const TRUST_POINTS = [
    { icon: 'truck', title: 'Free shipping', description: 'Complimentary insured delivery on every deal order.' },
    { icon: 'refresh-ccw', title: 'Easy returns', description: 'A simple return window for peace of mind after purchase.' },
    { icon: 'lock', title: 'Secure payment', description: 'Protected checkout for high-value artisan pieces.' },
    { icon: 'shield', title: 'Authentic materials', description: 'Crafted with verified metals, stones, and finishing details.' },
] as const;

const REVIEW_STORIES = [
    {
        name: 'Amara S.',
        title: 'Verified buyer',
        quote: 'The ring looked even more refined in person. The finish feels bespoke, and the packaging made it gift-ready.',
        rating: 5,
        image: STORY_IMAGES[0],
    },
    {
        name: 'Leila K.',
        title: 'Anniversary purchase',
        quote: 'I bought the necklace set during a sale and the craftsmanship was stunning. It felt like a private atelier piece.',
        rating: 5,
        image: STORY_IMAGES[1],
    },
    {
        name: 'Nadia R.',
        title: 'Repeat customer',
        quote: 'The styling guidance, secure delivery, and finish quality made this one of the easiest luxury purchases I have made online.',
        rating: 5,
        image: STORY_IMAGES[2],
    },
] as const;

type Product = {
    _id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    thumbnailImage?: string;
    images?: string[];
    category?: { _id?: string; name?: string; slug?: string } | string;
    averageRating?: number;
    reviewCount?: number;
    availabilityStatus?: string;
    material?: string;
    style?: string;
    description?: string;
    tags?: string[];
    sku?: string;
    createdAt?: string;
    isFeatured?: boolean;
};

type Collection = typeof COLLECTIONS[number];
type Material = typeof MATERIALS[number];
type Style = typeof STYLES[number];
type SortOption = typeof SORT_OPTIONS[number];

type EnrichedProduct = Product & {
    categoryLabel: string;
    collectionLabel: Exclude<Collection, 'All'>;
    materialLabel: Exclude<Material, 'All'>;
    styleLabel: Exclude<Style, 'All'>;
    displayPrice: number;
    discount: number;
    image: string;
    orderIndex: number;
};

type BundleOffer = {
    title: string;
    offer: string;
    caption: string;
    products: [EnrichedProduct, EnrichedProduct];
    originalPrice: number;
    bundlePrice: number;
};

const CURATED_FALLBACKS: Product[] = [
    {
        _id: 'fallback-ring-1',
        name: 'Aurora Halo Ring',
        price: 320,
        salePrice: 249,
        material: 'Gold',
        style: 'Bridal',
        sku: 'DL-RNG-001',
        averageRating: 4.9,
        reviewCount: 34,
        category: { name: 'Rings', slug: 'rings' },
        tags: ['handmade', 'bridal', 'gemstone'],
        thumbnailImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
        description: 'Hand-set halo ring with warm gold detailing.',
    },
    {
        _id: 'fallback-necklace-1',
        name: 'Celeste Pendant Necklace',
        price: 280,
        salePrice: 214,
        material: 'Gemstone',
        style: 'Minimal',
        sku: 'DL-NEC-002',
        averageRating: 4.8,
        reviewCount: 22,
        category: { name: 'Necklaces', slug: 'necklaces' },
        tags: ['handmade', 'pendant', 'custom'],
        thumbnailImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
        description: 'A hand-finished pendant designed for layering.',
    },
    {
        _id: 'fallback-earring-1',
        name: 'Lustre Drop Earrings',
        price: 190,
        salePrice: 145,
        material: 'Silver',
        style: 'Custom',
        sku: 'DL-EAR-003',
        averageRating: 4.7,
        reviewCount: 18,
        category: { name: 'Earrings', slug: 'earrings' },
        tags: ['handmade', 'silver', 'drop'],
        thumbnailImage: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80',
        description: 'Statement drops with soft movement and polished edges.',
    },
    {
        _id: 'fallback-bracelet-1',
        name: 'Luna Chain Bracelet',
        price: 165,
        salePrice: 128,
        material: 'Gold',
        style: 'Minimal',
        sku: 'DL-BRC-004',
        averageRating: 4.8,
        reviewCount: 16,
        category: { name: 'Bracelets', slug: 'bracelets' },
        tags: ['handmade', 'chain'],
        thumbnailImage: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=900&q=80',
        description: 'A refined chain bracelet with a tailored clasp.',
    },
    {
        _id: 'fallback-ring-2',
        name: 'Heirloom Signet Ring',
        price: 265,
        salePrice: 209,
        material: 'Silver',
        style: 'Custom',
        sku: 'DL-RNG-005',
        averageRating: 4.9,
        reviewCount: 27,
        category: { name: 'Rings', slug: 'rings' },
        tags: ['handmade', 'signet', 'custom'],
        thumbnailImage: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=900&q=80',
        description: 'Personalized signet styling with artisan engraving.',
    },
    {
        _id: 'fallback-necklace-2',
        name: 'Velvet Stone Choker',
        price: 340,
        salePrice: 272,
        material: 'Gemstone',
        style: 'Bridal',
        sku: 'DL-NEC-006',
        averageRating: 5,
        reviewCount: 12,
        category: { name: 'Necklaces', slug: 'necklaces' },
        tags: ['handmade', 'bridal', 'gemstone'],
        thumbnailImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
        description: 'Rich gemstone detail created for occasion dressing.',
    },
    {
        _id: 'fallback-earring-2',
        name: 'Noor Pearl Drops',
        price: 210,
        salePrice: 168,
        material: 'Gemstone',
        style: 'Bridal',
        sku: 'DL-EAR-007',
        averageRating: 4.9,
        reviewCount: 21,
        category: { name: 'Earrings', slug: 'earrings' },
        tags: ['handmade', 'bridal', 'pearl'],
        thumbnailImage: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
        description: 'Elegant drops with pearl-led bridal styling.',
    },
    {
        _id: 'fallback-bracelet-2',
        name: 'Crescent Cuff',
        price: 230,
        salePrice: 179,
        material: 'Gold',
        style: 'Minimal',
        sku: 'DL-BRC-008',
        averageRating: 4.8,
        reviewCount: 19,
        category: { name: 'Bracelets', slug: 'bracelets' },
        tags: ['handmade', 'cuff', 'minimal'],
        thumbnailImage: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=80',
        description: 'Sculpted cuff with a satin polish finish.',
    },
];

const productImageUri = (image?: string) =>
    getAssetUrl(image) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80';

const currency = (value: number) => `$${value.toFixed(2)}`;

const calcDiscount = (price: number, salePrice?: number | null) => {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round((1 - salePrice / price) * 100);
};

const displayPrice = (price: number, salePrice?: number | null) =>
    salePrice && salePrice < price ? salePrice : price;

const getCountdownParts = (endAt: number) => {
    const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    return { hours, minutes, seconds };
};

const getCategoryLabel = (product: Product) => {
    if (typeof product.category === 'string') return product.category;
    return product.category?.name || 'Jewelry';
};

const inferCollection = (product: Product, index: number): Exclude<Collection, 'All'> => {
    const haystack = [
        product.name,
        getCategoryLabel(product),
        product.description,
        product.tags?.join(' '),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (haystack.includes('ring')) return 'Rings';
    if (haystack.includes('necklace') || haystack.includes('pendant') || haystack.includes('choker')) return 'Necklaces';
    if (haystack.includes('earring') || haystack.includes('drop')) return 'Earrings';
    if (haystack.includes('bracelet') || haystack.includes('cuff') || haystack.includes('chain')) return 'Bracelets';

    return COLLECTIONS[(index % (COLLECTIONS.length - 1)) + 1] as Exclude<Collection, 'All'>;
};

const inferMaterial = (product: Product): Exclude<Material, 'All'> => {
    const haystack = [product.material, product.name, product.description, product.tags?.join(' ')].filter(Boolean).join(' ').toLowerCase();
    if (haystack.includes('silver')) return 'Silver';
    if (haystack.includes('stone') || haystack.includes('gem') || haystack.includes('pearl')) return 'Gemstone';
    return 'Gold';
};

const inferStyle = (product: Product): Exclude<Style, 'All'> => {
    const haystack = [product.style, product.name, product.description, product.tags?.join(' ')].filter(Boolean).join(' ').toLowerCase();
    if (haystack.includes('bridal') || haystack.includes('wedding')) return 'Bridal';
    if (haystack.includes('custom') || haystack.includes('engrave') || haystack.includes('personal')) return 'Custom';
    return 'Minimal';
};

const renderStars = (rating: number, size = 13) => (
    <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
            <Feather
                key={star}
                name="star"
                size={size}
                color={star <= Math.round(rating) ? J.gold : J.border}
                style={{ marginRight: 3 }}
            />
        ))}
    </View>
);

function GoldDivider() {
    return (
        <View className="mt-4 flex-row items-center">
            <View className="h-px flex-1" style={{ backgroundColor: J.border }} />
            <Feather name="star" size={13} color={J.gold} style={{ marginHorizontal: 10 }} />
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: J.gold, marginRight: 10 }} />
            <Feather name="star" size={13} color={J.gold} style={{ marginRight: 10 }} />
            <View className="h-px flex-1" style={{ backgroundColor: J.border }} />
        </View>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <View>
            <Text className="font-body text-[11px] uppercase tracking-[2.4px]" style={{ color: J.goldDark }}>
                {eyebrow}
            </Text>
            <Text className="mt-3 font-heading text-[28px] leading-[34px]" style={{ color: J.ink }}>
                {title}
            </Text>
            {description ? (
                <Text className="mt-3 max-w-[720px] font-body text-[15px] leading-7" style={{ color: J.muted }}>
                    {description}
                </Text>
            ) : null}
            <GoldDivider />
        </View>
    );
}

function FilterChip({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            className="mr-3 rounded-full border px-4 py-3"
            style={{
                borderColor: active ? J.garnet : J.border,
                backgroundColor: active ? J.garnet : J.white,
            }}
        >
            <Text
                className="font-body text-[13px] font-semibold"
                style={{ color: active ? J.white : J.ink }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function ProductCard({
    product,
    width,
    isWishlisted,
    onView,
    onAddToCart,
    onToggleWishlist,
}: {
    product: EnrichedProduct;
    width: DimensionValue;
    isWishlisted: boolean;
    onView: () => void;
    onAddToCart: () => void;
    onToggleWishlist: () => void;
}) {
    return (
        <View style={[styles.productCard, { width }]}>
            <View className="relative overflow-hidden rounded-[26px]">
                <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                <LinearGradient
                    colors={['transparent', 'rgba(53,16,25,0.55)']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View className="absolute left-4 top-4 flex-row flex-wrap gap-2">
                    {product.discount > 0 ? (
                        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: J.garnet }}>
                            <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.3px] text-white">
                                {product.discount}% off
                            </Text>
                        </View>
                    ) : null}
                    <View className="rounded-full border px-3 py-1.5" style={{ borderColor: 'rgba(255,255,255,0.42)', backgroundColor: 'rgba(255,255,255,0.18)' }}>
                        <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.2px] text-white">
                            Handmade
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={onToggleWishlist}
                    className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
                >
                    <Feather name={isWishlisted ? 'heart' : 'heart'} size={17} color={isWishlisted ? J.garnet : J.ink} />
                </TouchableOpacity>
            </View>

            <View className="px-5 pb-5 pt-5">
                <View className="flex-row items-center justify-between">
                    <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: J.goldDark }}>
                        {product.collectionLabel}
                    </Text>
                    <Text className="font-body text-[12px]" style={{ color: J.muted }}>
                        {product.materialLabel}
                    </Text>
                </View>
                <Text className="mt-3 font-heading text-[22px] leading-[28px]" style={{ color: J.ink }} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text className="mt-2 font-body text-[14px] leading-6" style={{ color: J.muted }} numberOfLines={2}>
                    {product.description || `Hand-finished ${product.collectionLabel.toLowerCase()} piece for elevated daily styling.`}
                </Text>
                <View className="mt-4 flex-row items-center justify-between">
                    <View>
                        <View className="flex-row items-end">
                            <Text className="font-heading text-[26px]" style={{ color: J.garnet }}>
                                {currency(product.displayPrice)}
                            </Text>
                            {product.salePrice && product.salePrice < product.price ? (
                                <Text className="ml-2 font-body text-[13px] line-through" style={{ color: J.muted }}>
                                    {currency(product.price)}
                                </Text>
                            ) : null}
                        </View>
                        <View className="mt-2 flex-row items-center">
                            {renderStars(product.averageRating ?? 4.8)}
                            <Text className="ml-2 font-body text-[12px]" style={{ color: J.muted }}>
                                {`${(product.averageRating ?? 4.8).toFixed(1)} · ${product.reviewCount ?? 18} reviews`}
                            </Text>
                        </View>
                    </View>
                    <View className="rounded-full px-3 py-2" style={{ backgroundColor: J.blush }}>
                        <Text className="font-body text-[12px] font-semibold" style={{ color: J.garnet }}>
                            {product.styleLabel}
                        </Text>
                    </View>
                </View>
                <View className="mt-5 flex-row gap-3">
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={onView}
                        className="flex-1 items-center rounded-full px-4 py-3"
                        style={{ backgroundColor: J.garnet }}
                    >
                        <Text className="font-body text-[13px] font-semibold text-white">View piece</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={onAddToCart}
                        className="flex-row items-center rounded-full border px-4 py-3"
                        style={{ borderColor: J.border, backgroundColor: J.white }}
                    >
                        <Feather name="shopping-bag" size={15} color={J.ink} />
                        <Text className="ml-2 font-body text-[13px] font-semibold" style={{ color: J.ink }}>
                            Add
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

function CountdownTile({ value, label }: { value: number; label: string }) {
    return (
        <View className="items-center">
            <LinearGradient colors={[J.garnetDark, J.garnet]} style={styles.countdownTile}>
                <Text className="font-heading text-[32px] text-white">{value.toString().padStart(2, '0')}</Text>
            </LinearGradient>
            <Text className="mt-2 font-body text-[11px] uppercase tracking-[1.4px]" style={{ color: J.muted }}>
                {label}
            </Text>
        </View>
    );
}

export default function DealsScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const { addToCart } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { showToast } = useToast();
    const router = useRouter();
    const { width } = useWindowDimensions();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [usedFallbacks, setUsedFallbacks] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<Collection>('All');
    const [selectedMaterial, setSelectedMaterial] = useState<Material>('All');
    const [selectedStyle, setSelectedStyle] = useState<Style>('All');
    const [selectedSort, setSelectedSort] = useState<SortOption>('Best deals');
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
    const [email, setEmail] = useState('');
    const [joinedList, setJoinedList] = useState(false);
    const [offerEndAt] = useState(() => Date.now() + (2 * 60 * 60 + 15 * 60 + 20) * 1000);
    const [timeLeft, setTimeLeft] = useState(getCountdownParts(offerEndAt));
    const [featuredOffset, setFeaturedOffset] = useState(0);
    const [gridOffset, setGridOffset] = useState(0);

    const scrollRef = useRef<any>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const riseAnim = useRef(new Animated.Value(18)).current;

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1120;
    const isDesktop = width >= 1120;
    const gridCardWidth = isMobile ? '100%' : isTablet ? '48%' : '31.5%';
    const shelfCardWidth = isMobile ? 280 : 300;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(riseAnim, { toValue: 0, friction: 9, tension: 48, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, riseAnim]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getCountdownParts(offerEndAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [offerEndAt]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            setLoading(true);
            try {
                const res = await getProducts({ limit: 24 });
                const list: Product[] = res?.data?.products || res?.data?.data || res?.data || [];
                if (!isMounted) return;
                if (Array.isArray(list) && list.length > 0) {
                    setProducts(list);
                    setUsedFallbacks(false);
                } else {
                    setProducts(CURATED_FALLBACKS);
                    setUsedFallbacks(true);
                }
            } catch {
                if (!isMounted) return;
                setProducts(CURATED_FALLBACKS);
                setUsedFallbacks(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const catalog = useMemo<EnrichedProduct[]>(() => {
        return products.map((product, index) => ({
            ...product,
            categoryLabel: getCategoryLabel(product),
            collectionLabel: inferCollection(product, index),
            materialLabel: inferMaterial(product),
            styleLabel: inferStyle(product),
            displayPrice: displayPrice(product.price, product.salePrice),
            discount: calcDiscount(product.price, product.salePrice),
            image: productImageUri(product.thumbnailImage || product.images?.[0]),
            orderIndex: index,
        }));
    }, [products]);

    const filteredAndSortedDeals = useMemo(() => {
        const activeRange = PRICE_RANGES.find((range) => range.label === selectedPriceRange) || PRICE_RANGES[0];

        const filtered = catalog.filter((product) => {
            const matchesCollection = selectedCollection === 'All' || product.collectionLabel === selectedCollection;
            const matchesMaterial = selectedMaterial === 'All' || product.materialLabel === selectedMaterial;
            const matchesStyle = selectedStyle === 'All' || product.styleLabel === selectedStyle;
            const matchesPrice = product.displayPrice >= activeRange.min && product.displayPrice < activeRange.max;
            return matchesCollection && matchesMaterial && matchesStyle && matchesPrice;
        });

        return filtered.sort((a, b) => {
            if (selectedSort === 'Low to High') return a.displayPrice - b.displayPrice;
            if (selectedSort === 'New arrivals') {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : a.orderIndex;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : b.orderIndex;
                return bDate - aDate;
            }

            if (b.discount !== a.discount) return b.discount - a.discount;
            return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        });
    }, [catalog, selectedCollection, selectedMaterial, selectedPriceRange, selectedSort, selectedStyle]);

    const featuredDeals = filteredAndSortedDeals.slice(0, 4);
    const editorChoices = filteredAndSortedDeals.slice(0, 6);
    const recommendedDeals = filteredAndSortedDeals.slice(4, 7).length ? filteredAndSortedDeals.slice(4, 7) : catalog.slice(0, 3);

    const collectionShelves = useMemo(
        () => COLLECTIONS.slice(1).map((collection) => ({
            label: collection,
            items: catalog.filter((product) => product.collectionLabel === collection).slice(0, 3),
        })).filter((section) => section.items.length > 0),
        [catalog],
    );

    const bundleOffers = useMemo<BundleOffer[]>(() => {
        const pairings: [Exclude<Collection, 'All'>, Exclude<Collection, 'All'>, string, string, string][] = [
            ['Rings', 'Necklaces', 'Complete Set Discount', 'Signature pairing', 'A coordinated look for events and gifting.'],
            ['Earrings', 'Bracelets', 'Buy 2 get 10% off', 'Weekend edit', 'A polished combination for elevated everyday wear.'],
        ];

        return pairings
            .map(([firstCollection, secondCollection, offer, title, caption]) => {
                const first = catalog.find((item) => item.collectionLabel === firstCollection);
                const second = catalog.find((item) => item.collectionLabel === secondCollection && item._id !== first?._id);
                if (!first || !second) return null;
                const originalPrice = first.displayPrice + second.displayPrice;
                return {
                    title,
                    offer,
                    caption,
                    products: [first, second] as [EnrichedProduct, EnrichedProduct],
                    originalPrice,
                    bundlePrice: parseFloat((originalPrice * 0.9).toFixed(2)),
                };
            })
            .filter(Boolean) as BundleOffer[];
    }, [catalog]);

    const scrollToSection = (offset: number) => {
        scrollRef.current?.scrollTo?.({ y: Math.max(offset - 90, 0), animated: true });
    };

    const openProduct = (id: string) => {
        router.push({ pathname: '/product-single', params: { id } } as any);
    };

    const handleAddToCart = async (product: EnrichedProduct) => {
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: product.thumbnailImage || product.image,
            price: product.price,
            salePrice: product.salePrice ?? null,
            sku: product.sku || `deal-${product._id}`,
        });

        showToast('Added to cart', 'success', {
            subMessage: `${product.name} is ready in your bag.`,
            icon: 'shopping-bag',
        });
    };

    const handleToggleWishlist = async (product: EnrichedProduct) => {
        const alreadySaved = isInWishlist(product._id);
        const normalizedCategory = typeof product.category === 'string'
            ? product.category
            : product.category?.name && product.category?.slug
                ? { name: product.category.name, slug: product.category.slug }
                : undefined;

        await toggleItem(product._id, {
            _id: product._id,
            name: product.name,
            thumbnailImage: product.thumbnailImage,
            price: product.price,
            salePrice: product.salePrice ?? null,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            category: normalizedCategory,
        });

        showToast(alreadySaved ? 'Removed from wishlist' : 'Saved to wishlist', alreadySaved ? 'info' : 'wishlist', {
            subMessage: product.name,
            icon: 'heart',
        });
    };

    const handleJoinList = () => {
        const normalized = email.trim();
        if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
            showToast('Enter a valid email address', 'warning', { subMessage: 'We will use it for first-order offers only.' });
            return;
        }

        setJoinedList(true);
        setEmail('');
        showToast('You unlocked 10% off your first order', 'success', {
            subMessage: 'Watch your inbox for the welcome code.',
            icon: 'mail',
        });
    };

    return (
        <View className="flex-1" style={{ backgroundColor: J.canvas }}>
            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: riseAnim }] }}>
                        <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroImageWrap} imageStyle={styles.heroImage}>
                            <LinearGradient
                                colors={['rgba(20,10,12,0.34)', 'rgba(53,16,25,0.78)', 'rgba(53,16,25,0.92)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View style={[styles.heroOrb, { width: 280, height: 280, top: -70, right: -90, borderColor: 'rgba(255,255,255,0.12)' }]} />
                            <View style={[styles.heroOrb, { width: 210, height: 210, bottom: -65, left: -35, borderColor: 'rgba(200,166,99,0.35)' }]} />

                            <View className="self-center w-full px-5 py-16" style={{ maxWidth: 1240 }}>
                                <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 28 }}>
                                    <View style={{ maxWidth: 640 }}>
                                        <View className="self-start rounded-full border px-4 py-2" style={{ borderColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                            <Text className="font-body text-[11px] uppercase tracking-[2.4px]" style={{ color: '#F0DFC4' }}>
                                                Private artisan event
                                            </Text>
                                        </View>
                                        <Text className="mt-5 font-heading text-[38px] leading-[44px] text-white" style={{ fontSize: isMobile ? 38 : 62, lineHeight: isMobile ? 44 : 72 }}>
                                            Limited Time Handmade Jewelry Deals
                                        </Text>
                                        <Text className="mt-5 font-body text-[16px] leading-8" style={{ color: 'rgba(255,255,255,0.84)', maxWidth: 560 }}>
                                            Up to 30% off unique artisan pieces. Discover statement rings, heirloom necklaces, sculpted earrings, and refined bracelets in a clean luxury layout designed for confident browsing on any device.
                                        </Text>
                                        <View className="mt-8 flex-row flex-wrap gap-3">
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => scrollToSection(featuredOffset)}
                                                className="flex-row items-center rounded-full px-6 py-4"
                                                style={{ backgroundColor: J.white }}
                                            >
                                                <Text className="font-body text-[14px] font-semibold" style={{ color: J.garnet }}>
                                                    Shop Deals Now
                                                </Text>
                                                <Feather name="arrow-right" size={16} color={J.garnet} style={{ marginLeft: 10 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                activeOpacity={0.88}
                                                onPress={() => scrollToSection(gridOffset)}
                                                className="rounded-full border px-6 py-4"
                                                style={{ borderColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(255,255,255,0.09)' }}
                                            >
                                                <Text className="font-body text-[14px] font-semibold text-white">Browse all collections</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{ width: isDesktop ? 360 : '100%', maxWidth: 420, gap: 14 }}>
                                        <View style={styles.glassCard}>
                                            <Text className="font-body text-[11px] uppercase tracking-[2px]" style={{ color: '#F0DFC4' }}>
                                                First look
                                            </Text>
                                            <Text className="mt-3 font-heading text-[26px] text-white">Rare pieces, framed to sell with clarity.</Text>
                                            <Text className="mt-3 font-body text-[14px] leading-6" style={{ color: 'rgba(255,255,255,0.82)' }}>
                                                Large imagery, clear savings, and handcrafted details stay above the fold so high-intent shoppers can evaluate value immediately.
                                            </Text>
                                        </View>
                                        <View style={[styles.glassCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                                            <View>
                                                <Text className="font-body text-[11px] uppercase tracking-[2px]" style={{ color: '#F0DFC4' }}>
                                                    Offer intensity
                                                </Text>
                                                <Text className="mt-3 font-heading text-[34px] text-white">30%</Text>
                                                <Text className="mt-1 font-body text-[13px]" style={{ color: 'rgba(255,255,255,0.82)' }}>
                                                    off selected handmade pieces
                                                </Text>
                                            </View>
                                            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                                                <Feather name="gift" size={24} color="#F0DFC4" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>

                        <View className="px-4" style={{ marginTop: -52 }}>
                            <View style={[styles.countdownCard, { maxWidth: 1180, alignSelf: 'center' }]}>
                                <View style={{ flexDirection: isTablet || isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isTablet || isDesktop ? 'center' : 'flex-start', gap: 24 }}>
                                    <View style={{ maxWidth: 420 }}>
                                        <Text className="font-body text-[11px] uppercase tracking-[2px]" style={{ color: J.goldDark }}>
                                            Offer ends in...
                                        </Text>
                                        <Text className="mt-3 font-heading text-[30px]" style={{ color: J.ink }}>
                                            A short window for rare handcrafted savings
                                        </Text>
                                        <Text className="mt-3 font-body text-[14px] leading-7" style={{ color: J.muted }}>
                                            Jewelry is a considered purchase, so the urgency block stays prominent without clutter. The page makes the value and deadline easy to scan on mobile and desktop.
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                                        <CountdownTile value={timeLeft.hours} label="Hours" />
                                        <Text className="font-heading text-[28px]" style={{ color: J.goldDark }}>:</Text>
                                        <CountdownTile value={timeLeft.minutes} label="Minutes" />
                                        <Text className="font-heading text-[28px]" style={{ color: J.goldDark }}>:</Text>
                                        <CountdownTile value={timeLeft.seconds} label="Seconds" />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View className="px-4 pb-20 pt-10" style={{ backgroundColor: J.canvas }}>
                            <View className="self-center w-full" style={{ maxWidth: 1240 }}>
                                {usedFallbacks ? (
                                    <View className="mb-8 rounded-[22px] border px-5 py-4" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                        <Text className="font-body text-[13px] leading-6" style={{ color: J.muted }}>
                                            Live products were unavailable, so this page is showing a curated luxury preview to preserve the full deals experience.
                                        </Text>
                                    </View>
                                ) : null}

                                {loading ? (
                                    <View className="items-center justify-center py-20">
                                        <ActivityIndicator size="large" color={J.garnet} />
                                        <Text className="mt-4 font-body text-[14px]" style={{ color: J.muted }}>
                                            Curating today&apos;s artisan offers...
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <View onLayout={(event) => setFeaturedOffset(event.nativeEvent.layout.y)}>
                                            <SectionHeading
                                                eyebrow="Featured deals"
                                                title="Top picks with luxury visuals and clear savings"
                                                description="These lead cards are intentionally image-forward so jewelry buyers can judge finish, scale, and sparkle before they commit to the product page."
                                            />
                                        </View>

                                        <View className="mt-8 flex-row flex-wrap justify-between" style={{ gap: 18 }}>
                                            {featuredDeals.map((product, index) => {
                                                const cardWidth = isMobile ? '100%' : isDesktop ? (index === 0 ? '48.5%' : '48.5%') : '100%';
                                                return (
                                                    <View key={product._id} style={[styles.featuredCard, { width: cardWidth }]}>
                                                        <View style={{ flexDirection: isMobile ? 'column' : index % 2 === 0 ? 'column' : 'column' }}>
                                                            <Image source={{ uri: product.image }} style={styles.featuredImage} resizeMode="cover" />
                                                            <View className="px-6 pb-6 pt-5">
                                                                <View className="flex-row items-center justify-between">
                                                                    <View className="flex-row flex-wrap gap-2">
                                                                        <View className="rounded-full border px-3 py-1.5" style={{ borderColor: J.border, backgroundColor: J.blush }}>
                                                                            <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.2px]" style={{ color: J.garnet }}>
                                                                                Handmade
                                                                            </Text>
                                                                        </View>
                                                                        <View className="rounded-full border px-3 py-1.5" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                                            <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.2px]" style={{ color: J.goldDark }}>
                                                                                {product.collectionLabel}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    {product.discount > 0 ? (
                                                                        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: J.garnet }}>
                                                                            <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.2px] text-white">
                                                                                {product.discount}% off
                                                                            </Text>
                                                                        </View>
                                                                    ) : null}
                                                                </View>
                                                                <Text className="mt-5 font-heading text-[28px] leading-[34px]" style={{ color: J.ink }}>
                                                                    {product.name}
                                                                </Text>
                                                                <Text className="mt-3 font-body text-[15px] leading-7" style={{ color: J.muted }}>
                                                                    {product.description || 'Handmade in small batches with refined metalwork and gift-ready finishing.'}
                                                                </Text>
                                                                <View className="mt-5 flex-row items-center justify-between">
                                                                    <View>
                                                                        <View className="flex-row items-end">
                                                                            <Text className="font-heading text-[34px]" style={{ color: J.garnet }}>
                                                                                {currency(product.displayPrice)}
                                                                            </Text>
                                                                            {product.salePrice && product.salePrice < product.price ? (
                                                                                <Text className="ml-3 font-body text-[15px] line-through" style={{ color: J.muted }}>
                                                                                    {currency(product.price)}
                                                                                </Text>
                                                                            ) : null}
                                                                        </View>
                                                                        <View className="mt-2 flex-row items-center">
                                                                            {renderStars(product.averageRating ?? 4.8, 14)}
                                                                            <Text className="ml-2 font-body text-[12px]" style={{ color: J.muted }}>
                                                                                {`${(product.averageRating ?? 4.8).toFixed(1)} · ${product.reviewCount ?? 16} reviews`}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <View className="rounded-full px-3 py-2" style={{ backgroundColor: J.blush }}>
                                                                        <Text className="font-body text-[12px] font-semibold" style={{ color: J.garnet }}>
                                                                            {product.materialLabel}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                <View className="mt-6 flex-row flex-wrap gap-3">
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.9}
                                                                        onPress={() => openProduct(product._id)}
                                                                        className="rounded-full px-5 py-3"
                                                                        style={{ backgroundColor: J.garnet }}
                                                                    >
                                                                        <Text className="font-body text-[14px] font-semibold text-white">View details</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        activeOpacity={0.88}
                                                                        onPress={() => handleAddToCart(product)}
                                                                        className="flex-row items-center rounded-full border px-5 py-3"
                                                                        style={{ borderColor: J.border, backgroundColor: J.white }}
                                                                    >
                                                                        <Feather name="shopping-bag" size={16} color={J.ink} />
                                                                        <Text className="ml-2 font-body text-[14px] font-semibold" style={{ color: J.ink }}>
                                                                            Claim this offer
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        <View className="mt-16">
                                            <SectionHeading
                                                eyebrow="Category-based deals"
                                                title="Four collections shoppers expect to browse immediately"
                                                description="Rings, necklaces, earrings, and bracelets each get their own quick shelf so shoppers can move by intent before they start filtering deeply."
                                            />
                                            <View className="mt-8" style={{ gap: 18 }}>
                                                {collectionShelves.map((section) => (
                                                    <View key={section.label} className="rounded-[30px] border p-5" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                        <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12 }}>
                                                            <View>
                                                                <Text className="font-heading text-[24px]" style={{ color: J.ink }}>{section.label}</Text>
                                                                <Text className="mt-2 font-body text-[14px] leading-6" style={{ color: J.muted }}>
                                                                    Curated sale pieces grouped for fast comparison and easier navigation.
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                activeOpacity={0.88}
                                                                onPress={() => {
                                                                    setSelectedCollection(section.label as Collection);
                                                                    scrollToSection(gridOffset);
                                                                }}
                                                                className="rounded-full border px-4 py-3"
                                                                style={{ borderColor: J.border, backgroundColor: J.white }}
                                                            >
                                                                <Text className="font-body text-[13px] font-semibold" style={{ color: J.ink }}>
                                                                    Explore {section.label.toLowerCase()}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
                                                            <View className="flex-row" style={{ gap: 14, paddingRight: 6 }}>
                                                                {section.items.map((product) => (
                                                                    <ProductCard
                                                                        key={product._id}
                                                                        product={product}
                                                                        width={shelfCardWidth}
                                                                        isWishlisted={isInWishlist(product._id)}
                                                                        onView={() => openProduct(product._id)}
                                                                        onAddToCart={() => handleAddToCart(product)}
                                                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                                                    />
                                                                ))}
                                                            </View>
                                                        </ScrollView>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        <View className="mt-16" onLayout={(event) => setGridOffset(event.nativeEvent.layout.y)}>
                                            <SectionHeading
                                                eyebrow="Filter and sort"
                                                title="Refine by price, material, style, and savings priority"
                                                description="Jewelry shoppers usually arrive with a budget or finish in mind, so the filters stay visible, tactile, and easy to use across narrow and wide screens."
                                            />
                                            <View className="mt-8 rounded-[30px] border p-5" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                <View style={{ gap: 18 }}>
                                                    <View>
                                                        <Text className="mb-3 font-body text-[12px] uppercase tracking-[1.7px]" style={{ color: J.goldDark }}>
                                                            Category
                                                        </Text>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                            <View className="flex-row">
                                                                {COLLECTIONS.map((collection) => (
                                                                    <FilterChip
                                                                        key={collection}
                                                                        label={collection}
                                                                        active={selectedCollection === collection}
                                                                        onPress={() => setSelectedCollection(collection)}
                                                                    />
                                                                ))}
                                                            </View>
                                                        </ScrollView>
                                                    </View>

                                                    <View>
                                                        <Text className="mb-3 font-body text-[12px] uppercase tracking-[1.7px]" style={{ color: J.goldDark }}>
                                                            Material
                                                        </Text>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                            <View className="flex-row">
                                                                {MATERIALS.map((material) => (
                                                                    <FilterChip
                                                                        key={material}
                                                                        label={material}
                                                                        active={selectedMaterial === material}
                                                                        onPress={() => setSelectedMaterial(material)}
                                                                    />
                                                                ))}
                                                            </View>
                                                        </ScrollView>
                                                    </View>

                                                    <View>
                                                        <Text className="mb-3 font-body text-[12px] uppercase tracking-[1.7px]" style={{ color: J.goldDark }}>
                                                            Style
                                                        </Text>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                            <View className="flex-row">
                                                                {STYLES.map((style) => (
                                                                    <FilterChip
                                                                        key={style}
                                                                        label={style}
                                                                        active={selectedStyle === style}
                                                                        onPress={() => setSelectedStyle(style)}
                                                                    />
                                                                ))}
                                                            </View>
                                                        </ScrollView>
                                                    </View>

                                                    <View style={{ flexDirection: isTablet || isDesktop ? 'row' : 'column', gap: 16 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text className="mb-3 font-body text-[12px] uppercase tracking-[1.7px]" style={{ color: J.goldDark }}>
                                                                Price range
                                                            </Text>
                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                                <View className="flex-row">
                                                                    {PRICE_RANGES.map((range) => (
                                                                        <FilterChip
                                                                            key={range.label}
                                                                            label={range.label}
                                                                            active={selectedPriceRange === range.label}
                                                                            onPress={() => setSelectedPriceRange(range.label)}
                                                                        />
                                                                    ))}
                                                                </View>
                                                            </ScrollView>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text className="mb-3 font-body text-[12px] uppercase tracking-[1.7px]" style={{ color: J.goldDark }}>
                                                                Sort
                                                            </Text>
                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                                <View className="flex-row">
                                                                    {SORT_OPTIONS.map((option) => (
                                                                        <FilterChip
                                                                            key={option}
                                                                            label={option}
                                                                            active={selectedSort === option}
                                                                            onPress={() => setSelectedSort(option)}
                                                                        />
                                                                    ))}
                                                                </View>
                                                            </ScrollView>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="mt-10 flex-row flex-wrap justify-between" style={{ gap: 18 }}>
                                            {editorChoices.map((product) => (
                                                <ProductCard
                                                    key={product._id}
                                                    product={product}
                                                    width={gridCardWidth}
                                                    isWishlisted={isInWishlist(product._id)}
                                                    onView={() => openProduct(product._id)}
                                                    onAddToCart={() => handleAddToCart(product)}
                                                    onToggleWishlist={() => handleToggleWishlist(product)}
                                                />
                                            ))}
                                        </View>

                                        <View className="mt-16 rounded-[34px] border p-6" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                            <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24 }}>
                                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                                    <Text className="font-body text-[11px] uppercase tracking-[2.3px]" style={{ color: J.goldDark }}>
                                                        Handcrafted story
                                                    </Text>
                                                    <Text className="mt-3 font-heading text-[32px] leading-[38px]" style={{ color: J.ink }}>
                                                        Each piece is handmade by artisans who design for longevity, not speed.
                                                    </Text>
                                                    <Text className="mt-4 font-body text-[15px] leading-7" style={{ color: J.muted }}>
                                                        This section gives the deals page an emotional anchor. It slows the shopper down in the right way by connecting the lower price to real craftsmanship instead of making the product feel discounted or generic.
                                                    </Text>
                                                    <View className="mt-6" style={{ gap: 14 }}>
                                                        {[
                                                            'Small-batch finishing with hand-set stones and polished edges.',
                                                            'Studio-led quality checks before each piece is packed and insured.',
                                                            'A balanced story block that adds trust without overcrowding the page.',
                                                        ].map((item) => (
                                                            <View key={item} className="flex-row items-start">
                                                                <View className="mt-1 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: J.blush }}>
                                                                    <Feather name="check" size={14} color={J.garnet} />
                                                                </View>
                                                                <Text className="ml-3 flex-1 font-body text-[14px] leading-6" style={{ color: J.ink }}>
                                                                    {item}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>

                                                <View style={{ flex: 1.05, gap: 14 }}>
                                                    <Image source={{ uri: STORY_IMAGES[0] }} style={styles.storyImageLarge} resizeMode="cover" />
                                                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 14 }}>
                                                        <Image source={{ uri: STORY_IMAGES[1] }} style={[styles.storyImageSmall, { flex: 1 }]} resizeMode="cover" />
                                                        <View style={{ flex: 1, justifyContent: 'center', borderRadius: 24, padding: 20, backgroundColor: J.blush }}>
                                                            <Text className="font-body text-[11px] uppercase tracking-[2px]" style={{ color: J.goldDark }}>
                                                                Craft detail
                                                            </Text>
                                                            <Text className="mt-3 font-heading text-[24px]" style={{ color: J.ink }}>
                                                                Studio-made, gift-ready, and photographed to feel tactile.
                                                            </Text>
                                                            <Text className="mt-3 font-body text-[14px] leading-6" style={{ color: J.muted }}>
                                                                Use this block for artisan process imagery or a short behind-the-scenes video when available.
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="mt-16">
                                            <SectionHeading
                                                eyebrow="Social proof"
                                                title="Reviews and lifestyle imagery that reduce hesitation"
                                                description="High-value jewelry depends on trust. These review cards and UGC-style visuals reassure shoppers that the finish, sizing, and presentation meet expectations."
                                            />
                                            <View className="mt-8" style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 18 }}>
                                                <View style={{ flex: 1.05, gap: 18 }}>
                                                    {REVIEW_STORIES.map((review) => (
                                                        <View key={review.name} className="rounded-[28px] border p-5" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                            <View className="flex-row items-center">
                                                                <Image source={{ uri: review.image }} style={styles.reviewAvatar} resizeMode="cover" />
                                                                <View className="ml-4 flex-1">
                                                                    <Text className="font-heading text-[22px]" style={{ color: J.ink }}>{review.name}</Text>
                                                                    <Text className="mt-1 font-body text-[13px]" style={{ color: J.muted }}>{review.title}</Text>
                                                                    <View className="mt-2">{renderStars(review.rating, 14)}</View>
                                                                </View>
                                                            </View>
                                                            <Text className="mt-4 font-body text-[15px] leading-7" style={{ color: J.ink }}>
                                                                “{review.quote}”
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                                <View style={{ flex: 0.95, gap: 14 }}>
                                                    <Image source={{ uri: STORY_IMAGES[2] }} style={styles.ugcLarge} resizeMode="cover" />
                                                    <View style={{ flexDirection: 'row', gap: 14 }}>
                                                        {featuredDeals.slice(0, 2).map((product) => (
                                                            <View key={`ugc-${product._id}`} className="flex-1 rounded-[24px] border p-3" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                                <Image source={{ uri: product.image }} style={styles.ugcThumb} resizeMode="cover" />
                                                                <Text className="mt-3 font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: J.goldDark }}>
                                                                    Worn and loved
                                                                </Text>
                                                                <Text className="mt-2 font-heading text-[18px]" style={{ color: J.ink }} numberOfLines={2}>
                                                                    {product.name}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="mt-16">
                                            <SectionHeading
                                                eyebrow="Bundle offers"
                                                title="Set-based deals that lift average order value"
                                                description="Pair complementary pieces into bundles so shoppers can see the extra value in buying a complete look instead of a single item."
                                            />
                                            <View className="mt-8" style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 18 }}>
                                                {bundleOffers.map((bundle) => (
                                                    <View key={bundle.title} className="flex-1 rounded-[30px] border p-6" style={{ borderColor: J.border, backgroundColor: J.card }}>
                                                        <View className="self-start rounded-full px-3 py-1.5" style={{ backgroundColor: J.blush }}>
                                                            <Text className="font-body text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: J.garnet }}>
                                                                {bundle.offer}
                                                            </Text>
                                                        </View>
                                                        <Text className="mt-4 font-heading text-[26px]" style={{ color: J.ink }}>
                                                            {bundle.title}
                                                        </Text>
                                                        <Text className="mt-3 font-body text-[14px] leading-6" style={{ color: J.muted }}>
                                                            {bundle.caption}
                                                        </Text>
                                                        <View className="mt-5 flex-row" style={{ gap: 12 }}>
                                                            {bundle.products.map((product) => (
                                                                <View key={product._id} className="flex-1 rounded-[22px] border p-3" style={{ borderColor: J.border, backgroundColor: J.white }}>
                                                                    <Image source={{ uri: product.image }} style={styles.bundleThumb} resizeMode="cover" />
                                                                    <Text className="mt-3 font-heading text-[18px]" style={{ color: J.ink }} numberOfLines={2}>
                                                                        {product.name}
                                                                    </Text>
                                                                    <Text className="mt-1 font-body text-[13px]" style={{ color: J.muted }}>
                                                                        {product.collectionLabel}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                        <View className="mt-5 flex-row items-end justify-between">
                                                            <View>
                                                                <Text className="font-body text-[12px] uppercase tracking-[1.6px]" style={{ color: J.goldDark }}>
                                                                    Bundle price
                                                                </Text>
                                                                <View className="mt-2 flex-row items-end">
                                                                    <Text className="font-heading text-[30px]" style={{ color: J.garnet }}>
                                                                        {currency(bundle.bundlePrice)}
                                                                    </Text>
                                                                    <Text className="ml-2 font-body text-[13px] line-through" style={{ color: J.muted }}>
                                                                        {currency(bundle.originalPrice)}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity
                                                                activeOpacity={0.88}
                                                                onPress={() => scrollToSection(gridOffset)}
                                                                className="rounded-full px-5 py-3"
                                                                style={{ backgroundColor: J.garnet }}
                                                            >
                                                                <Text className="font-body text-[13px] font-semibold text-white">Build my set</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        <View className="mt-16">
                                            <SectionHeading
                                                eyebrow="Trust and benefits"
                                                title="Confidence signals for high-ticket purchase behavior"
                                                description="Free shipping, easy returns, secure payment, and authentic materials are surfaced as a compact reassurance layer before the email and final conversion banners."
                                            />
                                            <View className="mt-8 flex-row flex-wrap justify-between" style={{ gap: 16 }}>
                                                {TRUST_POINTS.map((item) => (
                                                    <View key={item.title} style={[styles.trustCard, { width: isMobile ? '100%' : isTablet ? '48%' : '23.7%' }]}>
                                                        <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: J.blush }}>
                                                            <Feather name={item.icon as keyof typeof Feather.glyphMap} size={20} color={J.garnet} />
                                                        </View>
                                                        <Text className="mt-4 font-heading text-[22px]" style={{ color: J.ink }}>{item.title}</Text>
                                                        <Text className="mt-3 font-body text-[14px] leading-6" style={{ color: J.muted }}>{item.description}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        <LinearGradient
                                            colors={[J.garnetDark, J.garnet]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[styles.emailBanner, { marginTop: 64 }]}
                                        >
                                            <View style={[styles.heroOrb, { width: 220, height: 220, top: -80, right: -60, borderColor: 'rgba(255,255,255,0.12)' }]} />
                                            <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'center' : 'flex-start', gap: 18 }}>
                                                <View style={{ maxWidth: 580 }}>
                                                    <Text className="font-body text-[11px] uppercase tracking-[2.4px]" style={{ color: '#F0DFC4' }}>
                                                        Email capture
                                                    </Text>
                                                    <Text className="mt-3 font-heading text-[32px] text-white">
                                                        Get 10% off your first order and early access to private sale drops.
                                                    </Text>
                                                    <Text className="mt-4 font-body text-[15px] leading-7" style={{ color: 'rgba(255,255,255,0.82)' }}>
                                                        The capture sits inside a premium-looking banner instead of a generic popup, which keeps the page calmer while still supporting long-term email marketing.
                                                    </Text>
                                                </View>
                                                <View style={{ width: isDesktop ? 420 : '100%', maxWidth: 460 }}>
                                                    <View className="rounded-[22px] p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                        <TextInput
                                                            value={email}
                                                            onChangeText={setEmail}
                                                            onSubmitEditing={handleJoinList}
                                                            placeholder="Enter your email"
                                                            placeholderTextColor="rgba(255,255,255,0.62)"
                                                            className="rounded-[16px] px-4 py-4 font-body text-[15px] text-white"
                                                            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                                        />
                                                        <TouchableOpacity
                                                            activeOpacity={0.9}
                                                            onPress={handleJoinList}
                                                            className="mt-3 items-center rounded-[16px] px-4 py-4"
                                                            style={{ backgroundColor: J.white }}
                                                        >
                                                            <Text className="font-body text-[14px] font-semibold" style={{ color: J.garnet }}>
                                                                Unlock My Offer
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <Text className="mt-3 text-center font-body text-[12px]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                                                            {joinedList ? 'You are on the list for first-order offers.' : 'One welcome offer, no noise.'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </LinearGradient>

                                        <View className="mt-16">
                                            <SectionHeading
                                                eyebrow="Recommended deals"
                                                title="Recently viewed style inspiration and manual recommendations"
                                                description="If AI recommendations are not wired yet, this section still works as a curated row of likely complements based on the current deal mix."
                                            />
                                            <View className="mt-8 flex-row flex-wrap justify-between" style={{ gap: 18 }}>
                                                {recommendedDeals.map((product) => (
                                                    <ProductCard
                                                        key={`recommended-${product._id}`}
                                                        product={product}
                                                        width={gridCardWidth}
                                                        isWishlisted={isInWishlist(product._id)}
                                                        onView={() => openProduct(product._id)}
                                                        onAddToCart={() => handleAddToCart(product)}
                                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                                    />
                                                ))}
                                            </View>
                                        </View>

                                        <LinearGradient
                                            colors={['#FAF2E8', '#F4E5D5']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[styles.finalBanner, { marginTop: 64 }]}
                                        >
                                            <View style={{ maxWidth: 660 }}>
                                                <Text className="font-body text-[11px] uppercase tracking-[2.2px]" style={{ color: J.goldDark }}>
                                                    Final call
                                                </Text>
                                                <Text className="mt-3 font-heading text-[36px] leading-[42px]" style={{ color: J.ink }}>
                                                    Don&apos;t miss your chance to secure handcrafted pieces at limited-time prices.
                                                </Text>
                                                <Text className="mt-4 font-body text-[15px] leading-7" style={{ color: J.muted }}>
                                                    The closeout banner keeps the final CTA visually distinct from the rest of the page while staying within the same neutral luxury palette.
                                                </Text>
                                            </View>
                                            <View className="mt-7 flex-row flex-wrap gap-3">
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={() => {
                                                        setSelectedCollection('All');
                                                        setSelectedMaterial('All');
                                                        setSelectedStyle('All');
                                                        setSelectedPriceRange('All');
                                                        setSelectedSort('Best deals');
                                                        scrollToSection(gridOffset);
                                                    }}
                                                    className="rounded-full px-6 py-4"
                                                    style={{ backgroundColor: J.garnet }}
                                                >
                                                    <Text className="font-body text-[14px] font-semibold text-white">Shop All Deals</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    activeOpacity={0.88}
                                                    onPress={() => scrollToSection(0)}
                                                    className="rounded-full border px-6 py-4"
                                                    style={{ borderColor: J.border, backgroundColor: J.white }}
                                                >
                                                    <Text className="font-body text-[14px] font-semibold" style={{ color: J.ink }}>
                                                        Back to top
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </LinearGradient>
                                    </>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    heroImageWrap: {
        overflow: 'hidden',
        minHeight: 640,
    },
    heroImage: {
        transform: [{ scale: 1.04 }],
    },
    heroOrb: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1.4,
    },
    glassCard: {
        borderRadius: 28,
        padding: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    countdownCard: {
        borderRadius: 30,
        paddingHorizontal: 28,
        paddingVertical: 24,
        backgroundColor: J.white,
        borderWidth: 1,
        borderColor: J.border,
        shadowColor: '#1E120F',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
    },
    countdownTile: {
        width: 82,
        height: 82,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredCard: {
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: J.card,
        borderWidth: 1,
        borderColor: J.border,
        shadowColor: '#1E120F',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 5,
    },
    featuredImage: {
        width: '100%',
        height: 320,
    },
    productCard: {
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: J.card,
        borderWidth: 1,
        borderColor: J.border,
        shadowColor: '#1E120F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 4,
    },
    productImage: {
        width: '100%',
        height: 260,
    },
    storyImageLarge: {
        width: '100%',
        height: 320,
        borderRadius: 28,
    },
    storyImageSmall: {
        height: 170,
        borderRadius: 24,
    },
    reviewAvatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
    },
    ugcLarge: {
        width: '100%',
        height: 320,
        borderRadius: 28,
    },
    ugcThumb: {
        width: '100%',
        height: 170,
        borderRadius: 18,
    },
    bundleThumb: {
        width: '100%',
        height: 140,
        borderRadius: 18,
    },
    trustCard: {
        borderRadius: 28,
        padding: 20,
        backgroundColor: J.card,
        borderWidth: 1,
        borderColor: J.border,
    },
    emailBanner: {
        borderRadius: 34,
        padding: 28,
        overflow: 'hidden',
    },
    finalBanner: {
        borderRadius: 34,
        padding: 30,
        borderWidth: 1,
        borderColor: J.border,
    },
});