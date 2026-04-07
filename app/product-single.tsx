import PageShell from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import { CartVariantSelection, useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import {
    createProductReview,
    deleteProductReview,
    getProductById,
    getProductReviews,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = 'http://localhost:5000';

type ProductVariant = {
    _id: string;
    label?: string;
    size?: string;
    color?: string;
    style?: string;
    sku?: string;
    quantity?: number;
    price?: number;
    salePrice?: number | null;
    thumbnailImage?: string;
    isDefault?: boolean;
};

type Product = {
    _id: string;
    name: string;
    slug: string;
    thumbnailImage?: string;
    images?: string[];
    price: number;
    salePrice?: number | null;
    currency?: string;
    sku?: string;
    quantity?: number;
    availabilityStatus?: string;
    description?: string;
    color?: string;
    material?: string;
    weight?: string | number;
    tags?: string[];
    category?: { name: string; slug: string } | null;
    subcategory?: { name: string; slug: string } | null;
    isFeatured?: boolean;
    averageRating?: number;
    reviewCount?: number;
    variants?: ProductVariant[];
    deliveryEstimate?: {
        minDays?: number;
        maxDays?: number;
        label?: string;
        shipsFrom?: string;
    };
    richMedia?: {
        videos?: string[];
        view360Images?: string[];
    };
    policySurfaces?: {
        returnPolicy?: string;
        warrantyPolicy?: string;
        shippingPolicy?: string;
    };
};

type Review = {
    _id: string;
    user: { _id: string; name: string } | string;
    rating: number;
    comment: string;
    createdAt: string;
};

type VariantAttribute = 'size' | 'color' | 'style';

type VariantChoice = {
    size: string;
    color: string;
    style: string;
};

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Feather
                key={star}
                name="star"
                size={size}
                color={star <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}
            />
        ))}
    </View>
);

const StarPicker = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => onChange(star)}>
                <Feather
                    name="star"
                    size={28}
                    color={star <= value ? '#F59E0B' : '#D1D5DB'}
                />
            </TouchableOpacity>
        ))}
    </View>
);

const imageUri = (asset?: string) => (
    asset ? (asset.startsWith('http') ? asset : `${API_BASE}/${asset}`) : null
);

const normalizeVariantLabel = (variant?: ProductVariant | null) => (
    String(
        variant?.label
        || [variant?.size, variant?.color, variant?.style]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
            .join(' / ')
    ).trim()
);

const normalizeChoiceFromVariant = (variant?: ProductVariant | null): VariantChoice => ({
    size: String(variant?.size || ''),
    color: String(variant?.color || ''),
    style: String(variant?.style || ''),
});

const matchesChoice = (variant: ProductVariant, choice: VariantChoice) => (
    (!choice.size || variant.size === choice.size)
    && (!choice.color || variant.color === choice.color)
    && (!choice.style || variant.style === choice.style)
);

const buildDeliveryEstimateLabel = (deliveryEstimate?: Product['deliveryEstimate']) => {
    const minDays = Number(deliveryEstimate?.minDays || 0);
    const maxDays = Number(deliveryEstimate?.maxDays || 0);

    if (deliveryEstimate?.label) {
        return deliveryEstimate.label;
    }

    if (minDays > 0 && maxDays > 0) {
        return `${minDays}-${maxDays} business days`;
    }

    if (minDays > 0) {
        return `${minDays} business day${minDays === 1 ? '' : 's'}`;
    }

    return 'Standard delivery timeline available at checkout';
};

const isLikelyColorValue = (value?: string) => {
    if (!value) {
        return false;
    }

    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value)
        || /^(rgb|hsl)a?\(/i.test(value)
        || /^[a-z]+$/i.test(value);
};

export default function ProductSingleScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { user, userToken } = useAuth();
    const { addToCart } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
    const [selectedSpinIndex, setSelectedSpinIndex] = useState(0);
    const [mediaTab, setMediaTab] = useState<'gallery' | 'video' | 'spin'>('gallery');
    const [quantity, setQuantity] = useState(1);
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
    const [addingToCart, setAddingToCart] = useState(false);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

    const isMobile = SCREEN_WIDTH < 768;
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(40))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    useEffect(() => {
        if (!id) {
            setError('No product specified.');
            setLoading(false);
            return;
        }

        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProductById(id);
                if (mounted) {
                    setProduct(response.data);
                }
            } catch (requestError: any) {
                if (mounted) {
                    setError(requestError?.response?.data?.message ?? 'Failed to load product.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    const productVariants = useMemo(
        () => (Array.isArray(product?.variants) ? product.variants : []),
        [product?.variants],
    );
    const hasVariants = productVariants.length > 0;
    const selectedVariant = useMemo(
        () => (hasVariants
            ? productVariants.find((variant) => String(variant._id) === selectedVariantId)
                || productVariants.find((variant) => variant.isDefault)
                || productVariants.find((variant) => Number(variant.quantity || 0) > 0)
                || productVariants[0]
            : null),
        [hasVariants, productVariants, selectedVariantId],
    );

    useEffect(() => {
        if (!product) {
            return;
        }

        setSelectedImage(0);
        setSelectedVideoIndex(0);
        setSelectedSpinIndex(0);
        setZoomVisible(false);
        setZoomScale(1);

        if (productVariants.length === 0) {
            setSelectedVariantId('');
            return;
        }

        const initialVariant = productVariants.find((variant) => variant.isDefault)
            || productVariants.find((variant) => Number(variant.quantity || 0) > 0)
            || productVariants[0];

        setSelectedVariantId(String(initialVariant?._id || ''));
    }, [product, productVariants]);

    const selectedChoice = useMemo(
        () => normalizeChoiceFromVariant(selectedVariant),
        [selectedVariant],
    );

    const galleryImages = useMemo(() => {
        const nextGalleryImages: string[] = [];
        const pushGalleryImage = (asset?: string) => {
            const uri = imageUri(asset);
            if (uri && !nextGalleryImages.includes(uri)) {
                nextGalleryImages.push(uri);
            }
        };

        pushGalleryImage(selectedVariant?.thumbnailImage);
        pushGalleryImage(product?.thumbnailImage);
        (product?.images || []).forEach((asset) => pushGalleryImage(asset));

        return nextGalleryImages;
    }, [product?.images, product?.thumbnailImage, selectedVariant?.thumbnailImage]);

    const spinFrames = useMemo(
        () => (product?.richMedia?.view360Images || [])
            .map((asset) => imageUri(asset))
            .filter(Boolean) as string[],
        [product?.richMedia?.view360Images],
    );
    const videoUrls = useMemo(
        () => (product?.richMedia?.videos || []).filter(Boolean),
        [product?.richMedia?.videos],
    );
    const selectedVideoUrl = useMemo(
        () => videoUrls[selectedVideoIndex] || null,
        [selectedVideoIndex, videoUrls],
    );
    const videoPlayer = useVideoPlayer(selectedVideoUrl, (player) => {
        player.loop = true;
    });

    useEffect(() => {
        if (galleryImages.length > 0) {
            setMediaTab('gallery');
            return;
        }

        if (videoUrls.length > 0) {
            setMediaTab('video');
            return;
        }

        if (spinFrames.length > 0) {
            setMediaTab('spin');
        }
    }, [galleryImages, spinFrames, videoUrls]);

    const basePrice = Number(
        typeof selectedVariant?.price !== 'undefined'
            ? selectedVariant.price
            : product?.price || 0
    );
    const salePrice = typeof selectedVariant?.salePrice !== 'undefined'
        ? selectedVariant.salePrice
        : product?.salePrice ?? null;
    const currentPrice = salePrice != null && salePrice < basePrice ? salePrice : basePrice;
    const originalPrice = basePrice;
    const discountPct = salePrice != null && salePrice < basePrice
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : 0;
    const availableStock = hasVariants
        ? Number(selectedVariant?.quantity || 0)
        : Number(product?.quantity || 0);
    const inStock = product?.availabilityStatus !== 'out_of_stock' && availableStock > 0;
    const wished = product ? isInWishlist(product._id) : false;

    useEffect(() => {
        if (availableStock > 0) {
            setQuantity((current) => Math.min(Math.max(current, 1), availableStock));
            return;
        }

        setQuantity(1);
    }, [availableStock, selectedVariantId, product?._id]);

    const findNextVariant = useCallback((attribute: VariantAttribute, value: string) => {
        const nextChoice: VariantChoice = {
            ...selectedChoice,
            [attribute]: value,
        };

        const matches = productVariants.filter((variant) => matchesChoice(variant, nextChoice));
        return matches.find((variant) => Number(variant.quantity || 0) > 0)
            || matches[0]
            || null;
    }, [productVariants, selectedChoice]);

    const handleSelectVariantOption = useCallback((attribute: VariantAttribute, value: string) => {
        const nextVariant = findNextVariant(attribute, value);
        if (!nextVariant) {
            return;
        }

        setSelectedVariantId(String(nextVariant._id));
        setSelectedImage(0);
    }, [findNextVariant]);

    const getOptionState = useCallback((attribute: VariantAttribute, value: string) => {
        const nextChoice: VariantChoice = {
            ...selectedChoice,
            [attribute]: value,
        };
        const matches = productVariants.filter((variant) => matchesChoice(variant, nextChoice));

        return {
            exists: matches.length > 0,
            inStock: matches.some((variant) => Number(variant.quantity || 0) > 0),
        };
    }, [productVariants, selectedChoice]);

    const sizeOptions = useMemo(
        () => Array.from(new Set(productVariants.map((variant) => variant.size).filter(Boolean))) as string[],
        [productVariants],
    );
    const colorOptions = useMemo(
        () => Array.from(new Set(productVariants.map((variant) => variant.color).filter(Boolean))) as string[],
        [productVariants],
    );
    const styleOptions = useMemo(
        () => Array.from(new Set(productVariants.map((variant) => variant.style).filter(Boolean))) as string[],
        [productVariants],
    );

    const selectedVariantSummary = useMemo<CartVariantSelection | undefined>(
        () => (hasVariants && selectedVariant ? {
            variantId: String(selectedVariant._id),
            label: normalizeVariantLabel(selectedVariant),
            size: selectedVariant.size,
            color: selectedVariant.color,
            style: selectedVariant.style,
            sku: selectedVariant.sku,
        } : undefined),
        [hasVariants, selectedVariant],
    );

    const handleAddToCart = useCallback(async () => {
        if (!product || !inStock) {
            return;
        }

        if (hasVariants && !selectedVariant) {
            showToast('Select a size, color, or style before adding to cart.', 'error');
            return;
        }

        setAddingToCart(true);
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: imageUri(selectedVariant?.thumbnailImage || product.thumbnailImage) || '',
            price: basePrice,
            salePrice: salePrice ?? null,
            sku: selectedVariant?.sku || product.sku || '',
            selectedVariant: selectedVariantSummary,
            quantity,
        });
        setAddingToCart(false);

        showToast(`${product.name} added to cart!`, 'success', {
            subMessage: hasVariants && selectedVariantSummary?.label
                ? `${selectedVariantSummary.label} • Qty ×${quantity}`
                : `Qty ×${quantity}`,
        });
    }, [
        addToCart,
        basePrice,
        hasVariants,
        inStock,
        product,
        quantity,
        salePrice,
        selectedVariant,
        selectedVariantSummary,
        showToast,
    ]);

    const loadReviews = useCallback(async () => {
        if (!id) {
            return;
        }

        setReviewsLoading(true);
        try {
            const response = await getProductReviews(id);
            setReviews(response.data || []);
        } catch {
            setReviews([]);
        }
        setReviewsLoading(false);
    }, [id]);

    useEffect(() => {
        if (activeTab === 'reviews') {
            loadReviews();
        }
    }, [activeTab, loadReviews]);

    const handleSubmitReview = async () => {
        if (!userToken || !id) {
            return;
        }

        setSubmittingReview(true);
        setReviewError(null);
        try {
            await createProductReview(id, { rating: reviewRating, comment: reviewComment });
            setReviewComment('');
            setReviewRating(5);
            await loadReviews();
            showToast('Review submitted!', 'success');
        } catch (requestError: any) {
            setReviewError(requestError?.response?.data?.message ?? 'Failed to submit review. You may need to have purchased this product.');
        }
        setSubmittingReview(false);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!id) {
            return;
        }

        setDeletingReviewId(reviewId);
        try {
            await deleteProductReview(id, reviewId);
            await loadReviews();
            showToast('Review deleted', 'success');
        } catch (requestError: any) {
            showToast(requestError?.response?.data?.message ?? 'Failed to delete review', 'error');
        }
        setDeletingReviewId(null);
    };

    const handleToggleWishlist = useCallback(async () => {
        if (!product) {
            return;
        }

        const wasWished = isInWishlist(product._id);
        await toggleItem(product._id, {
            _id: product._id,
            name: product.name,
            thumbnailImage: selectedVariant?.thumbnailImage || product.thumbnailImage,
            price: basePrice,
            salePrice: salePrice,
            sku: selectedVariant?.sku || product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: availableStock,
            category: product.category ?? undefined,
        });
        showToast(wasWished ? 'Removed from wishlist' : 'Added to wishlist!', 'wishlist', {
            subMessage: product.name,
        });
    }, [
        availableStock,
        basePrice,
        isInWishlist,
        product,
        salePrice,
        selectedVariant?.sku,
        selectedVariant?.thumbnailImage,
        showToast,
        toggleItem,
    ]);

    const categoryName = product?.category && typeof product.category === 'object'
        ? product.category.name
        : '';
    const etaLabel = buildDeliveryEstimateLabel(product?.deliveryEstimate);
    const shipsFrom = product?.deliveryEstimate?.shipsFrom || '';
    const selectedVariantLabel = normalizeVariantLabel(selectedVariant);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading product…</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <Feather name="alert-circle" size={64} color="#EF4444" />
                <Text style={{ color: '#111', fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>
                    {error ?? 'Product not found'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ backgroundColor: '#8B4513', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 12, marginTop: 16 }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={{ paddingVertical: 32, paddingHorizontal: 16 }}>
                            <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                                    <TouchableOpacity onPress={() => router.push('/' as any)}>
                                        <Text style={{ color: '#6B7280' }}>Home</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                    <TouchableOpacity onPress={() => router.push('/shop' as any)}>
                                        <Text style={{ color: '#6B7280' }}>Shop</Text>
                                    </TouchableOpacity>
                                    {categoryName ? (
                                        <>
                                            <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                            <Text style={{ color: '#6B7280' }}>{categoryName}</Text>
                                        </>
                                    ) : null}
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
                                    <Text style={{ color: '#8B4513', fontWeight: '600' }} numberOfLines={1}>{product.name}</Text>
                                </View>

                                <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 32, marginBottom: 36 }}>
                                    <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                            {[
                                                { key: 'gallery', label: 'Gallery', available: galleryImages.length > 0, icon: 'image' },
                                                { key: 'video', label: 'Video', available: videoUrls.length > 0, icon: 'play-circle' },
                                                { key: 'spin', label: '360° View', available: spinFrames.length > 0, icon: 'refresh-cw' },
                                            ].filter((item) => item.available).map((item) => (
                                                <TouchableOpacity
                                                    key={item.key}
                                                    onPress={() => setMediaTab(item.key as 'gallery' | 'video' | 'spin')}
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        borderRadius: 999,
                                                        paddingHorizontal: 14,
                                                        paddingVertical: 8,
                                                        backgroundColor: mediaTab === item.key ? '#8B4513' : '#F5EDE3',
                                                    }}
                                                >
                                                    <Feather name={item.icon as any} size={15} color={mediaTab === item.key ? '#fff' : '#8B4513'} />
                                                    <Text style={{ color: mediaTab === item.key ? '#fff' : '#8B4513', fontWeight: '700', fontSize: 13 }}>
                                                        {item.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <View style={{ backgroundColor: '#FAF3EB', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                                            {mediaTab === 'gallery' && galleryImages.length > 0 ? (
                                                <View>
                                                    <View style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                                                        <Image
                                                            source={{ uri: galleryImages[selectedImage] }}
                                                            style={{ width: '100%', height: 360, borderRadius: 14 }}
                                                            contentFit="cover"
                                                        />
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setZoomScale(1);
                                                                setZoomVisible(true);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                right: 14,
                                                                top: 14,
                                                                backgroundColor: 'rgba(17,24,39,0.72)',
                                                                borderRadius: 999,
                                                                paddingHorizontal: 12,
                                                                paddingVertical: 8,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 6,
                                                            }}
                                                        >
                                                            <Feather name="maximize-2" size={14} color="#fff" />
                                                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Zoom</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {mediaTab === 'gallery' && galleryImages.length === 0 ? (
                                                <View style={{ width: '100%', height: 360, borderRadius: 12, backgroundColor: '#F3E8DC', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Feather name="package" size={80} color="#C1622F" />
                                                </View>
                                            ) : null}

                                            {mediaTab === 'video' && selectedVideoUrl ? (
                                                <View>
                                                    <VideoView
                                                        player={videoPlayer}
                                                        nativeControls
                                                        contentFit="contain"
                                                        style={{ width: '100%', height: 360, borderRadius: 14, backgroundColor: '#111827' }}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => Linking.openURL(selectedVideoUrl)}
                                                        style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                                    >
                                                        <Feather name="external-link" size={14} color="#8B4513" />
                                                        <Text style={{ color: '#8B4513', fontWeight: '700' }}>Open video in browser</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : null}

                                            {mediaTab === 'spin' && spinFrames.length > 0 ? (
                                                <View>
                                                    <Image
                                                        source={{ uri: spinFrames[selectedSpinIndex] }}
                                                        style={{ width: '100%', height: 360, borderRadius: 14 }}
                                                        contentFit="cover"
                                                    />
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                                                        <TouchableOpacity
                                                            onPress={() => setSelectedSpinIndex((current) => (current === 0 ? spinFrames.length - 1 : current - 1))}
                                                            style={{ backgroundColor: '#F5EDE3', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <Feather name="chevron-left" size={18} color="#8B4513" />
                                                        </TouchableOpacity>
                                                        <View style={{ alignItems: 'center' }}>
                                                            <Text style={{ color: '#8B4513', fontWeight: '700' }}>Interactive 360° sequence</Text>
                                                            <Text style={{ color: '#6B7280', fontSize: 12 }}>Frame {selectedSpinIndex + 1} of {spinFrames.length}</Text>
                                                        </View>
                                                        <TouchableOpacity
                                                            onPress={() => setSelectedSpinIndex((current) => (current + 1) % spinFrames.length)}
                                                            style={{ backgroundColor: '#F5EDE3', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <Feather name="chevron-right" size={18} color="#8B4513" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ) : null}
                                        </View>

                                        {mediaTab === 'gallery' && galleryImages.length > 1 ? (
                                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                                {galleryImages.map((asset, index) => (
                                                    <TouchableOpacity
                                                        key={asset}
                                                        onPress={() => setSelectedImage(index)}
                                                        style={{
                                                            width: 74,
                                                            borderRadius: 10,
                                                            overflow: 'hidden',
                                                            borderWidth: 2,
                                                            borderColor: selectedImage === index ? '#8B4513' : '#E5E7EB',
                                                        }}
                                                    >
                                                        <Image source={{ uri: asset }} style={{ width: '100%', height: 72 }} contentFit="cover" />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        ) : null}

                                        {mediaTab === 'video' && videoUrls.length > 1 ? (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                {videoUrls.map((asset, index) => (
                                                    <TouchableOpacity
                                                        key={`${asset}-${index}`}
                                                        onPress={() => setSelectedVideoIndex(index)}
                                                        style={{
                                                            minWidth: 140,
                                                            borderRadius: 12,
                                                            paddingHorizontal: 14,
                                                            paddingVertical: 12,
                                                            backgroundColor: selectedVideoIndex === index ? '#8B4513' : '#F5EDE3',
                                                        }}
                                                    >
                                                        <Text style={{ color: selectedVideoIndex === index ? '#fff' : '#8B4513', fontWeight: '700' }}>
                                                            Video {index + 1}
                                                        </Text>
                                                        <Text style={{ color: selectedVideoIndex === index ? '#FDE7D3' : '#6B7280', marginTop: 4, fontSize: 12 }} numberOfLines={1}>
                                                            {asset}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        ) : null}

                                        {mediaTab === 'spin' && spinFrames.length > 1 ? (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                {spinFrames.map((asset, index) => (
                                                    <TouchableOpacity
                                                        key={`${asset}-${index}`}
                                                        onPress={() => setSelectedSpinIndex(index)}
                                                        style={{
                                                            width: 74,
                                                            borderRadius: 10,
                                                            overflow: 'hidden',
                                                            borderWidth: 2,
                                                            borderColor: selectedSpinIndex === index ? '#8B4513' : '#E5E7EB',
                                                        }}
                                                    >
                                                        <Image source={{ uri: asset }} style={{ width: '100%', height: 72 }} contentFit="cover" />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        ) : null}
                                    </View>

                                    <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                            <View style={{ backgroundColor: inStock ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                <Text style={{ color: inStock ? '#065F46' : '#991B1B', fontWeight: '700', fontSize: 12 }}>
                                                    {inStock ? 'Ready to Ship' : 'Out of Stock'}
                                                </Text>
                                            </View>
                                            {(selectedVariant?.sku || product.sku) ? (
                                                <Text style={{ color: '#6B7280', fontSize: 13, alignSelf: 'center' }}>
                                                    SKU: {selectedVariant?.sku || product.sku}
                                                </Text>
                                            ) : null}
                                            {product.isFeatured ? (
                                                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                    <Text style={{ color: '#92400E', fontWeight: '700', fontSize: 12 }}>Featured</Text>
                                                </View>
                                            ) : null}
                                        </View>

                                        <Text style={{ color: '#111827', fontSize: 28, fontWeight: '800', marginBottom: 8, lineHeight: 36 }}>
                                            {product.name}
                                        </Text>

                                        {(product.reviewCount ?? 0) > 0 ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <StarRow rating={product.averageRating ?? 0} size={16} />
                                                <Text style={{ color: '#6B7280', fontSize: 13 }}>
                                                    {(product.averageRating ?? 0).toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                                                </Text>
                                            </View>
                                        ) : null}

                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                            <Text style={{ color: '#8B4513', fontSize: 36, fontWeight: '800' }}>${currentPrice.toFixed(2)}</Text>
                                            {discountPct > 0 ? (
                                                <>
                                                    <Text style={{ color: '#9CA3AF', fontSize: 20, textDecorationLine: 'line-through' }}>${originalPrice.toFixed(2)}</Text>
                                                    <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{discountPct}% OFF</Text>
                                                    </View>
                                                </>
                                            ) : null}
                                        </View>

                                        {product.description ? (
                                            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 24, marginBottom: 20 }} numberOfLines={4}>
                                                {product.description}
                                            </Text>
                                        ) : null}

                                        {(product.color || product.material || selectedVariantLabel) ? (
                                            <View style={{ gap: 10, marginBottom: 18 }}>
                                                {selectedVariantLabel ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Text style={{ color: '#6B7280', fontWeight: '700' }}>Selected:</Text>
                                                        <Text style={{ color: '#111827', fontWeight: '700' }}>{selectedVariantLabel}</Text>
                                                    </View>
                                                ) : null}
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                                                    {product.color ? (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Text style={{ color: '#6B7280', fontWeight: '600' }}>Base Color:</Text>
                                                            {isLikelyColorValue(product.color) ? (
                                                                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: product.color, borderWidth: 1, borderColor: '#D1D5DB' }} />
                                                            ) : null}
                                                            <Text style={{ color: '#374151', textTransform: 'capitalize' }}>{product.color}</Text>
                                                        </View>
                                                    ) : null}
                                                    {product.material ? (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Text style={{ color: '#6B7280', fontWeight: '600' }}>Material:</Text>
                                                            <Text style={{ color: '#374151' }}>{product.material}</Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>
                                        ) : null}

                                        {hasVariants ? (
                                            <View style={{ gap: 16, marginBottom: 20 }}>
                                                {sizeOptions.length > 0 ? (
                                                    <View>
                                                        <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 10 }}>Size</Text>
                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                            {sizeOptions.map((value) => {
                                                                const optionState = getOptionState('size', value);
                                                                const selected = selectedChoice.size === value;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={value}
                                                                        disabled={!optionState.exists}
                                                                        onPress={() => handleSelectVariantOption('size', value)}
                                                                        style={{
                                                                            borderRadius: 12,
                                                                            paddingHorizontal: 14,
                                                                            paddingVertical: 10,
                                                                            borderWidth: 1,
                                                                            borderColor: selected ? '#8B4513' : '#E5E7EB',
                                                                            backgroundColor: selected ? '#F5EDE3' : optionState.exists ? '#fff' : '#F9FAFB',
                                                                            opacity: optionState.exists ? 1 : 0.45,
                                                                        }}
                                                                    >
                                                                        <Text style={{ color: selected ? '#8B4513' : '#374151', fontWeight: '700' }}>{value}</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                ) : null}

                                                {colorOptions.length > 0 ? (
                                                    <View>
                                                        <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 10 }}>Color</Text>
                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                            {colorOptions.map((value) => {
                                                                const optionState = getOptionState('color', value);
                                                                const selected = selectedChoice.color === value;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={value}
                                                                        disabled={!optionState.exists}
                                                                        onPress={() => handleSelectVariantOption('color', value)}
                                                                        style={{
                                                                            borderRadius: 999,
                                                                            paddingHorizontal: 14,
                                                                            paddingVertical: 10,
                                                                            borderWidth: 1,
                                                                            borderColor: selected ? '#8B4513' : '#E5E7EB',
                                                                            backgroundColor: selected ? '#F5EDE3' : optionState.exists ? '#fff' : '#F9FAFB',
                                                                            opacity: optionState.exists ? 1 : 0.45,
                                                                            flexDirection: 'row',
                                                                            alignItems: 'center',
                                                                            gap: 8,
                                                                        }}
                                                                    >
                                                                        {isLikelyColorValue(value) ? (
                                                                            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: value, borderWidth: 1, borderColor: '#D1D5DB' }} />
                                                                        ) : null}
                                                                        <Text style={{ color: selected ? '#8B4513' : '#374151', fontWeight: '700', textTransform: 'capitalize' }}>{value}</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                ) : null}

                                                {styleOptions.length > 0 ? (
                                                    <View>
                                                        <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 10 }}>Style</Text>
                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                            {styleOptions.map((value) => {
                                                                const optionState = getOptionState('style', value);
                                                                const selected = selectedChoice.style === value;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={value}
                                                                        disabled={!optionState.exists}
                                                                        onPress={() => handleSelectVariantOption('style', value)}
                                                                        style={{
                                                                            borderRadius: 12,
                                                                            paddingHorizontal: 14,
                                                                            paddingVertical: 10,
                                                                            borderWidth: 1,
                                                                            borderColor: selected ? '#8B4513' : '#E5E7EB',
                                                                            backgroundColor: selected ? '#F5EDE3' : optionState.exists ? '#fff' : '#F9FAFB',
                                                                            opacity: optionState.exists ? 1 : 0.45,
                                                                        }}
                                                                    >
                                                                        <Text style={{ color: selected ? '#8B4513' : '#374151', fontWeight: '700' }}>{value}</Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                ) : null}

                                                <View style={{ borderRadius: 14, backgroundColor: inStock ? '#F0FDF4' : '#FEF2F2', padding: 14 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Feather name={inStock ? 'check-circle' : 'alert-circle'} size={18} color={inStock ? '#15803D' : '#DC2626'} />
                                                        <Text style={{ color: inStock ? '#166534' : '#991B1B', fontWeight: '700' }}>
                                                            {inStock ? `${availableStock} in stock for this selection` : 'This variant is currently sold out'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : null}

                                        <View style={{ borderRadius: 16, backgroundColor: '#FFF7ED', padding: 16, marginBottom: 18 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <Feather name="truck" size={18} color="#C2410C" />
                                                <Text style={{ color: '#9A3412', fontWeight: '800' }}>Estimated delivery</Text>
                                            </View>
                                            <Text style={{ color: '#7C2D12', fontWeight: '700', fontSize: 16 }}>{etaLabel}</Text>
                                            {shipsFrom ? (
                                                <Text style={{ color: '#9A3412', marginTop: 4 }}>Ships from {shipsFrom}</Text>
                                            ) : null}
                                        </View>

                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 10 }}>Quantity</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                                                    style={{ backgroundColor: '#F5EDE3', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Feather name="minus" size={18} color="#8B4513" />
                                                </TouchableOpacity>
                                                <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700', marginHorizontal: 20 }}>{quantity}</Text>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity((current) => Math.min(availableStock || current + 1, current + 1))}
                                                    disabled={!inStock}
                                                    style={{
                                                        backgroundColor: inStock ? '#F5EDE3' : '#E5E7EB',
                                                        borderRadius: 10,
                                                        width: 44,
                                                        height: 44,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Feather name="plus" size={18} color={inStock ? '#8B4513' : '#9CA3AF'} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 12 }}>
                                            <TouchableOpacity
                                                onPress={handleAddToCart}
                                                disabled={!inStock || addingToCart}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: inStock ? '#8B4513' : '#D1D5DB',
                                                    borderRadius: 12,
                                                    paddingVertical: 16,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 8,
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                {addingToCart ? (
                                                    <ActivityIndicator color="#fff" size="small" />
                                                ) : (
                                                    <>
                                                        <Feather name="shopping-cart" size={20} color="#fff" />
                                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                                                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                                                        </Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={handleToggleWishlist}
                                                style={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: 12,
                                                    backgroundColor: wished ? '#FEE2E2' : '#F5EDE3',
                                                    borderWidth: 1,
                                                    borderColor: wished ? '#FECACA' : '#E5E7EB',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Feather name="heart" size={22} color={wished ? '#EF4444' : '#8B4513'} />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => router.push('/cart' as any)}
                                            style={{ borderWidth: 2, borderColor: '#8B4513', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 20 }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={{ color: '#8B4513', fontWeight: '700' }}>View Cart</Text>
                                        </TouchableOpacity>

                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                            {[
                                                {
                                                    title: 'Returns',
                                                    icon: 'rotate-ccw' as const,
                                                    content: product.policySurfaces?.returnPolicy || '30-day return window for unused items.',
                                                },
                                                {
                                                    title: 'Warranty',
                                                    icon: 'shield' as const,
                                                    content: product.policySurfaces?.warrantyPolicy || 'Craftsmanship backed by product warranty coverage.',
                                                },
                                                {
                                                    title: 'Shipping',
                                                    icon: 'truck' as const,
                                                    content: product.policySurfaces?.shippingPolicy || 'Tracked shipping options shown before you pay.',
                                                },
                                            ].map((item) => (
                                                <View key={item.title} style={{ flexBasis: isMobile ? '100%' : '31%', backgroundColor: '#FAF3EB', borderRadius: 14, padding: 14 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                        <Feather name={item.icon} size={16} color="#8B4513" />
                                                        <Text style={{ color: '#111827', fontWeight: '800' }}>{item.title}</Text>
                                                    </View>
                                                    <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 20 }}>{item.content}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginBottom: 48 }}>
                                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 20, flexWrap: 'wrap' }}>
                                        {(['description', 'details', 'reviews'] as const).map((tab) => (
                                            <TouchableOpacity
                                                key={tab}
                                                onPress={() => setActiveTab(tab)}
                                                style={{
                                                    paddingVertical: 14,
                                                    paddingHorizontal: 24,
                                                    borderBottomWidth: 2,
                                                    borderBottomColor: activeTab === tab ? '#8B4513' : 'transparent',
                                                }}
                                            >
                                                <Text style={{ fontWeight: '700', textTransform: 'capitalize', color: activeTab === tab ? '#8B4513' : '#6B7280' }}>
                                                    {tab === 'reviews'
                                                        ? `Reviews${product.reviewCount ? ` (${product.reviewCount})` : ''}`
                                                        : tab}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {activeTab === 'description' ? (
                                        <View>
                                            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 26 }}>
                                                {product.description || 'No description available for this product.'}
                                            </Text>
                                            {product.tags && product.tags.length > 0 ? (
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                                                    {product.tags.map((tag, index) => (
                                                        <View key={`${tag}-${index}`} style={{ backgroundColor: '#F5EDE3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                                                            <Text style={{ color: '#8B4513', fontSize: 13 }}>#{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : null}

                                    {activeTab === 'details' ? (
                                        <View>
                                            {[
                                                { label: 'SKU', value: selectedVariant?.sku || product.sku },
                                                { label: 'Category', value: categoryName },
                                                { label: 'Selected variant', value: selectedVariantLabel },
                                                { label: 'Stock for selection', value: hasVariants ? String(availableStock) : String(product.quantity || 0) },
                                                { label: 'Material', value: product.material },
                                                { label: 'Weight', value: product.weight ? String(product.weight) : '' },
                                                { label: 'Delivery ETA', value: etaLabel },
                                                { label: 'Ships from', value: shipsFrom },
                                                { label: 'Availability', value: inStock ? 'in stock' : 'out of stock' },
                                            ].filter((row) => Boolean(row.value)).map((row) => (
                                                <View key={row.label} style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                                    <Text style={{ color: '#6B7280', width: '35%', textTransform: 'capitalize' }}>{row.label}</Text>
                                                    <Text style={{ color: '#111827', fontWeight: '600', flex: 1, textTransform: row.label === 'SKU' ? 'none' : 'capitalize' }}>{row.value}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}

                                    {activeTab === 'reviews' ? (
                                        <View>
                                            {reviewsLoading ? (
                                                <ActivityIndicator color="#8B4513" style={{ marginVertical: 32 }} />
                                            ) : (
                                                <>
                                                    {reviews.length === 0 ? (
                                                        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                                                            <Feather name="message-square" size={48} color="#D1D5DB" />
                                                            <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 15 }}>
                                                                No reviews yet. Be the first to review this product!
                                                            </Text>
                                                        </View>
                                                    ) : null}

                                                    {reviews.map((review) => {
                                                        const reviewerName = typeof review.user === 'object' ? review.user.name : 'Customer';
                                                        const isOwn = typeof review.user === 'object' && review.user._id === user?.id;
                                                        return (
                                                            <View key={review._id} style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 16 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5EDE3', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Text style={{ color: '#8B4513', fontWeight: '700', fontSize: 14 }}>
                                                                                {reviewerName.charAt(0).toUpperCase()}
                                                                            </Text>
                                                                        </View>
                                                                        <View>
                                                                            <Text style={{ color: '#111827', fontWeight: '600', fontSize: 14 }}>{reviewerName}</Text>
                                                                            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                        <StarRow rating={review.rating} />
                                                                        {isOwn ? (
                                                                            <TouchableOpacity
                                                                                onPress={() => handleDeleteReview(review._id)}
                                                                                disabled={deletingReviewId === review._id}
                                                                            >
                                                                                {deletingReviewId === review._id
                                                                                    ? <ActivityIndicator size="small" color="#EF4444" />
                                                                                    : <Feather name="trash-2" size={16} color="#EF4444" />}
                                                                            </TouchableOpacity>
                                                                        ) : null}
                                                                    </View>
                                                                </View>
                                                                {review.comment ? (
                                                                    <Text style={{ color: '#374151', fontSize: 14, lineHeight: 22 }}>{review.comment}</Text>
                                                                ) : null}
                                                            </View>
                                                        );
                                                    })}

                                                    {userToken ? (
                                                        <View style={{ marginTop: 24, backgroundColor: '#FAF3EB', borderRadius: 12, padding: 16 }}>
                                                            <Text style={{ color: '#111827', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Write a Review</Text>
                                                            <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 8 }}>Your rating:</Text>
                                                            <StarPicker value={reviewRating} onChange={setReviewRating} />
                                                            <TextInput
                                                                value={reviewComment}
                                                                onChangeText={setReviewComment}
                                                                placeholder="Share your experience with this product (optional)"
                                                                placeholderTextColor="#9CA3AF"
                                                                multiline
                                                                numberOfLines={3}
                                                                style={{
                                                                    marginTop: 12,
                                                                    backgroundColor: '#fff',
                                                                    borderWidth: 1,
                                                                    borderColor: '#E5E7EB',
                                                                    borderRadius: 8,
                                                                    padding: 12,
                                                                    fontSize: 14,
                                                                    color: '#111827',
                                                                    textAlignVertical: 'top',
                                                                    minHeight: 80,
                                                                }}
                                                            />
                                                            {reviewError ? (
                                                                <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 8 }}>{reviewError}</Text>
                                                            ) : null}
                                                            <TouchableOpacity
                                                                onPress={handleSubmitReview}
                                                                disabled={submittingReview}
                                                                style={{
                                                                    marginTop: 12,
                                                                    backgroundColor: submittingReview ? '#C1622F' : '#8B4513',
                                                                    borderRadius: 8,
                                                                    paddingVertical: 12,
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                {submittingReview
                                                                    ? <ActivityIndicator color="#fff" size="small" />
                                                                    : <Text style={{ color: '#fff', fontWeight: '700' }}>Submit Review</Text>}
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <View style={{ marginTop: 16, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 8, alignItems: 'center' }}>
                                                            <Text style={{ color: '#6B7280', fontSize: 14 }}>
                                                                <Text style={{ color: '#8B4513', fontWeight: '700' }} onPress={() => router.push('/login' as any)}>
                                                                    Sign in
                                                                </Text>
                                                                {' '}to leave a review.
                                                            </Text>
                                                        </View>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </ScrollView>

            <Modal visible={zoomVisible} animationType="fade" transparent onRequestClose={() => setZoomVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(17,24,39,0.95)', padding: 20, justifyContent: 'center' }}>
                    <TouchableOpacity
                        onPress={() => setZoomVisible(false)}
                        style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.14)', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Feather name="x" size={20} color="#fff" />
                    </TouchableOpacity>

                    {galleryImages[selectedImage] ? (
                        <Image
                            source={{ uri: galleryImages[selectedImage] }}
                            style={{ width: '100%', height: '70%', transform: [{ scale: zoomScale }] }}
                            contentFit="contain"
                        />
                    ) : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                        {[
                            { label: '-', onPress: () => setZoomScale((current) => Math.max(1, Number((current - 0.25).toFixed(2)))) },
                            { label: 'Reset', onPress: () => setZoomScale(1) },
                            { label: '+', onPress: () => setZoomScale((current) => Math.min(3, Number((current + 0.25).toFixed(2)))) },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                onPress={item.onPress}
                                style={{ backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 }}
                            >
                                <Text style={{ color: '#111827', fontWeight: '800' }}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}