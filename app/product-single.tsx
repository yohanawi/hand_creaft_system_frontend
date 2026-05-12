import PageShell from '@/components/PageShell';
import {
    MediaTab,
    PRODUCT_PAGE_COLORS,
    PRODUCT_PAGE_FONTS,
    Product,
    ProductDetailsTabs,
    ProductHeroMedia,
    ProductHighlightsStrip,
    ProductImageZoomModal,
    ProductPurchasePanel,
    ProductReviewsSection,
    ProductTab,
    Review,
    VariantAttribute,
    VariantChoice,
    buildDeliveryEstimateLabel,
    getDiscountPercent,
    imageUri,
    matchesChoice,
    normalizeChoiceFromVariant,
    normalizeVariantLabel,
} from '@/components/Single-Product';
import { useAuth } from '@/context/AuthContext';
import { CartVariantSelection, useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import {
    createProductReview,
    deleteProductReview,
    getProductById,
    getProductReviews,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductSingleScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
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
    const [mediaTab, setMediaTab] = useState<MediaTab>('gallery');
    const [quantity, setQuantity] = useState(1);
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [activeTab, setActiveTab] = useState<ProductTab>('description');
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
    const slideAnim = useState(new Animated.Value(38))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 58, friction: 9, useNativeDriver: true }),
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

    const selectedChoice = useMemo<VariantChoice>(
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
            : product?.price || 0,
    );
    const salePrice = typeof selectedVariant?.salePrice !== 'undefined'
        ? selectedVariant.salePrice
        : product?.salePrice ?? null;
    const currentPrice = salePrice != null && salePrice < basePrice ? salePrice : basePrice;
    const discountPct = getDiscountPercent(basePrice, salePrice);
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

    const reviewStats = useMemo(() => {
        if (reviews.length === 0) {
            return {
                average: product?.averageRating ?? 0,
                count: product?.reviewCount ?? 0,
            };
        }

        const count = reviews.length;
        const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;
        return { average, count };
    }, [product?.averageRating, product?.reviewCount, reviews]);

    const handleAddToCart = useCallback(async () => {
        if (!product || !inStock) {
            return;
        }

        if (hasVariants && !selectedVariant) {
            showToast('Select a size, color, or style before adding to cart.', 'error');
            return;
        }

        try {
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

            showToast(`${product.name} added to cart!`, 'success', {
                subMessage: hasVariants && selectedVariantSummary?.label
                    ? `${selectedVariantSummary.label} | Qty x${quantity}`
                    : `Qty x${quantity}`,
            });
        } catch {
            showToast('Failed to add this item to cart.', 'error');
        } finally {
            setAddingToCart(false);
        }
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

        try {
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
        } catch {
            showToast('Wishlist update failed.', 'error');
        }
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
    const displaySku = selectedVariant?.sku || product?.sku || '';
    const displayCurrency = product?.currency || 'USD';

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: PRODUCT_PAGE_COLORS.page, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <LinearGradient
                    colors={['#FFF8F1', '#F1E2D2']}
                    style={{ borderRadius: 28, paddingHorizontal: 28, paddingVertical: 30, alignItems: 'center', minWidth: 280 }}
                >
                    <ActivityIndicator size="large" color={PRODUCT_PAGE_COLORS.accent} />
                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 28, marginTop: 18 }}>
                        Loading product
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, marginTop: 8 }}>
                        Preparing media, variants, reviews, and purchase actions.
                    </Text>
                </LinearGradient>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={{ flex: 1, backgroundColor: PRODUCT_PAGE_COLORS.page, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                <LinearGradient
                    colors={['#FFF7F0', '#F5E1D4']}
                    style={{ borderRadius: 30, padding: 28, width: '100%', maxWidth: 520, alignItems: 'center' }}
                >
                    <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)' }}>
                        <Feather name="alert-circle" size={36} color="#DC2626" />
                    </View>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 30, marginTop: 18 }}>
                        {error ?? 'Product not found'}
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
                        This product page could not be assembled. Return to the catalog and choose another handcrafted piece.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 22 }}>
                        <LinearGradient colors={['#8B5E3C', '#5B3522']} style={{ borderRadius: 999, paddingHorizontal: 26, paddingVertical: 14 }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700' }}>
                                Go Back
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: PRODUCT_PAGE_COLORS.page }}>
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={{ paddingHorizontal: isMobile ? 16 : 24, paddingTop: isMobile ? 20 : 28, paddingBottom: 56 }}>
                            <View style={{ maxWidth: 1240, width: '100%', alignSelf: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                                    <TouchableOpacity onPress={() => router.push('/' as any)}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body }}>Home</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" />
                                    <TouchableOpacity onPress={() => router.push('/shop' as any)}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body }}>Shop</Text>
                                    </TouchableOpacity>
                                    {categoryName ? (
                                        <>
                                            <Feather name="chevron-right" size={14} color="#9CA3AF" />
                                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body }}>{categoryName}</Text>
                                        </>
                                    ) : null}
                                    <Feather name="chevron-right" size={14} color="#9CA3AF" />
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
                                        {product.name}
                                    </Text>
                                </View>

                                <View style={{ borderRadius: 36, overflow: 'hidden', marginBottom: 18 }}>
                                    <LinearGradient colors={['#FFF8F2', '#F3E3D3', '#FFFDF9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: isMobile ? 18 : 24 }}>
                                        <View style={{ position: 'absolute', top: -48, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(233,209,187,0.32)' }} />
                                        <View style={{ position: 'absolute', bottom: -70, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(201,154,71,0.10)' }} />
                                        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
                                            <ProductHeroMedia
                                                productName={product.name}
                                                isMobile={isMobile}
                                                mediaTab={mediaTab}
                                                onChangeMediaTab={setMediaTab}
                                                galleryImages={galleryImages}
                                                selectedImage={selectedImage}
                                                onSelectImage={setSelectedImage}
                                                onOpenZoom={() => {
                                                    setZoomScale(1);
                                                    setZoomVisible(true);
                                                }}
                                                videoUrls={videoUrls}
                                                selectedVideoIndex={selectedVideoIndex}
                                                onSelectVideoIndex={setSelectedVideoIndex}
                                                spinFrames={spinFrames}
                                                selectedSpinIndex={selectedSpinIndex}
                                                onSelectSpinIndex={setSelectedSpinIndex}
                                                videoPlayer={videoPlayer}
                                            />

                                            <ProductPurchasePanel
                                                product={product}
                                                isMobile={isMobile}
                                                categoryName={categoryName}
                                                displaySku={displaySku}
                                                selectedVariantLabel={selectedVariantLabel}
                                                currentPrice={currentPrice}
                                                originalPrice={basePrice}
                                                discountPct={discountPct}
                                                currency={displayCurrency}
                                                averageRating={reviewStats.average}
                                                reviewCount={reviewStats.count}
                                                inStock={inStock}
                                                availableStock={availableStock}
                                                etaLabel={etaLabel}
                                                shipsFrom={shipsFrom}
                                                hasVariants={hasVariants}
                                                sizeOptions={sizeOptions}
                                                colorOptions={colorOptions}
                                                styleOptions={styleOptions}
                                                selectedChoice={selectedChoice}
                                                getOptionState={getOptionState}
                                                onSelectVariantOption={handleSelectVariantOption}
                                                quantity={quantity}
                                                onDecreaseQuantity={() => setQuantity((current) => Math.max(1, current - 1))}
                                                onIncreaseQuantity={() => setQuantity((current) => Math.min(availableStock || current + 1, current + 1))}
                                                onAddToCart={handleAddToCart}
                                                addingToCart={addingToCart}
                                                wished={wished}
                                                onToggleWishlist={handleToggleWishlist}
                                            />
                                        </View>
                                    </LinearGradient>
                                </View>

                                <ProductHighlightsStrip
                                    isMobile={isMobile}
                                    categoryName={categoryName}
                                    etaLabel={etaLabel}
                                    shipsFrom={shipsFrom}
                                    inStock={inStock}
                                    availableStock={availableStock}
                                    material={product.material}
                                />

                                <ProductDetailsTabs
                                    activeTab={activeTab}
                                    onChangeTab={setActiveTab}
                                    product={product}
                                    categoryName={categoryName}
                                    displaySku={displaySku}
                                    selectedVariantLabel={selectedVariantLabel}
                                    availableStock={availableStock}
                                    inStock={inStock}
                                    etaLabel={etaLabel}
                                    shipsFrom={shipsFrom}
                                    reviewCount={reviewStats.count}
                                    reviewsContent={(
                                        <ProductReviewsSection
                                            reviewsLoading={reviewsLoading}
                                            reviews={reviews}
                                            userId={user?.id}
                                            userToken={userToken}
                                            averageRating={reviewStats.average}
                                            reviewCount={reviewStats.count}
                                            reviewRating={reviewRating}
                                            onChangeReviewRating={setReviewRating}
                                            reviewComment={reviewComment}
                                            onChangeReviewComment={setReviewComment}
                                            submittingReview={submittingReview}
                                            reviewError={reviewError}
                                            onSubmitReview={handleSubmitReview}
                                            deletingReviewId={deletingReviewId}
                                            onDeleteReview={handleDeleteReview}
                                            onNavigateToLogin={() => router.push('/login' as any)}
                                        />
                                    )}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>

            <ProductImageZoomModal
                visible={zoomVisible}
                image={galleryImages[selectedImage]}
                zoomScale={zoomScale}
                onClose={() => setZoomVisible(false)}
                onDecreaseZoom={() => setZoomScale((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}
                onResetZoom={() => setZoomScale(1)}
                onIncreaseZoom={() => setZoomScale((current) => Math.min(3, Number((current + 0.25).toFixed(2))))}
            />
        </View>
    );
}