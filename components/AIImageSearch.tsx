import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

import AISearchAssistantPanel from '@/components/AISearch/AISearchAssistantPanel';
import AISearchFilterPanel from '@/components/AISearch/AISearchFilterPanel';
import AISearchHero from '@/components/AISearch/AISearchHero';
import AISearchIntentPanel from '@/components/AISearch/AISearchIntentPanel';
import AISearchProductCard from '@/components/AISearch/AISearchProductCard';
import AISearchQuickActionsBar from '@/components/AISearch/AISearchQuickActionsBar';
import AISearchQuickViewModal from '@/components/AISearch/AISearchQuickViewModal';
import AISearchSectionHeader from '@/components/AISearch/AISearchSectionHeader';
import AISearchSocialProof from '@/components/AISearch/AISearchSocialProof';
import AISearchSuggestionStrip from '@/components/AISearch/AISearchSuggestionStrip';
import { AI_SEARCH_COLORS } from '@/components/AISearch/aiSearchTheme';
import {
    AI_CHAT_PROMPTS,
    AI_SOCIAL_PROOF,
    buildAiAssistantReply,
    buildAiSearchRecommendations,
    buildAiSearchStyleCollections,
    buildAiSearchSuggestions,
    buildAiSearchTrending,
    filterAiSearchProducts,
    getAiSearchPrice,
    getAiSearchProductImage,
    getAiVisualMatchLabel,
    normalizeAiSearchCatalog,
    parseAiSearchIntent,
    sortAiSearchResults,
    type AiFilterState,
    type AiSearchProduct,
    type AiSearchVisualMatch,
    type AiSuggestion,
} from '@/components/AISearch/aiSearchUtils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { getAiServiceHealth, getProductById, getProducts, searchProductsByImage } from '@/services/api';

const INITIAL_FILTERS: AiFilterState = {
    materials: [],
    styles: [],
    occasions: [],
    priceRange: 'all',
    onlyInStock: true,
    onlyDiscounted: false,
};

const SORT_OPTIONS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'top-rated', label: 'Top rated' },
    { id: 'price-low', label: 'Price low' },
    { id: 'price-high', label: 'Price high' },
];

function toggleValue(values: string[], next: string) {
    return values.includes(next) ? values.filter((value) => value !== next) : [...values, next];
}

function getPriceRangeFromBudget(budget?: string) {
    if (!budget) return 'all';
    const amount = Number(budget.replace(/[^0-9]/g, ''));
    if (!amount) return 'all';
    if (amount <= 100) return 'under-100';
    if (amount <= 250) return '100-250';
    if (amount <= 500) return '250-500';
    return '500-plus';
}

function normalizeProductPayload(payload: any): AiSearchProduct {
    const raw = payload?.product || payload?.data || payload;
    return normalizeAiSearchCatalog([raw])[0] || raw;
}

type AiSearchHealthResponse = {
    healthy: boolean;
    ready: boolean;
    serviceUrl?: string;
    model?: string;
    message?: string;
    error?: string;
    feature_vector_size?: number;
    catalog?: {
        total: number;
        indexed: number;
        pending: number;
        productsWithImages: number;
        productsMissingImages: number;
        percentComplete: number;
        ready: boolean;
    };
};

async function fetchAiSearchHealth() {
    const response = await getAiServiceHealth();
    return response.data as AiSearchHealthResponse;
}

export default function AIImageSearch() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { isInWishlist, toggleItem } = useWishlist();

    const isTablet = width >= 768;
    const isDesktop = width >= 1100;
    const cardWidth = isDesktop ? '48.4%' : isTablet ? '48.4%' : '100%';
    const railCardWidth = isDesktop ? 280 : 250;

    const [catalog, setCatalog] = useState<AiSearchProduct[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const [aiStatus, setAiStatus] = useState<AiSearchHealthResponse | null>(null);
    const [aiStatusLoading, setAiStatusLoading] = useState(true);
    const [aiStatusRefreshing, setAiStatusRefreshing] = useState(false);

    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [filters, setFilters] = useState<AiFilterState>(INITIAL_FILTERS);
    const [sortBy, setSortBy] = useState('recommended');
    const [hasEngaged, setHasEngaged] = useState(false);

    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [visualMatches, setVisualMatches] = useState<AiSearchVisualMatch[]>([]);
    const [visualLoading, setVisualLoading] = useState(false);
    const [visualError, setVisualError] = useState<string | null>(null);
    const [visualSearchTime, setVisualSearchTime] = useState<number | null>(null);

    const [assistantPrompt, setAssistantPrompt] = useState('');
    const [assistantReply, setAssistantReply] = useState('Tell me the style, material, or moment you are shopping for and I will tighten the edit.');

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<AiSearchProduct | null>(null);
    const [quickViewVisible, setQuickViewVisible] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setCatalogLoading(true);
                setCatalogError(null);
                const response = await getProducts();
                const normalized = normalizeAiSearchCatalog(response.data);
                if (!mounted) return;
                startTransition(() => setCatalog(normalized));
            } catch (error: any) {
                if (!mounted) return;
                setCatalogError(error?.response?.data?.message || error?.message || 'Unable to load catalog for AI search.');
            } finally {
                if (mounted) setCatalogLoading(false);
            }
        })();

        (async () => {
            try {
                setAiStatusLoading(true);
                const health = await fetchAiSearchHealth();
                if (!mounted) return;
                setAiStatus(health);
            } catch (error: any) {
                if (!mounted) return;
                setAiStatus({
                    healthy: false,
                    ready: false,
                    message: error?.response?.data?.message || 'Unable to reach the AI feature extraction service.',
                    error: error?.response?.data?.error || error?.message,
                    serviceUrl: error?.response?.data?.serviceUrl,
                    catalog: error?.response?.data?.catalog,
                });
            } finally {
                if (mounted) setAiStatusLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const suggestions = useMemo(() => buildAiSearchSuggestions(deferredQuery, catalog), [catalog, deferredQuery]);
    const materialOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => product.material).filter((value): value is string => Boolean(value)))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );
    const activeIntent = useMemo(() => parseAiSearchIntent(deferredQuery, Boolean(selectedImageUri)), [deferredQuery, selectedImageUri]);

    const rankedResults = useMemo(() => {
        const filtered = filterAiSearchProducts(catalog, deferredQuery, filters);
        return sortAiSearchResults(filtered, sortBy);
    }, [catalog, deferredQuery, filters, sortBy]);

    const primaryResults = useMemo(() => {
        const active = Boolean(deferredQuery.trim()) || filters.materials.length || filters.styles.length || filters.occasions.length || filters.priceRange !== 'all' || filters.onlyDiscounted;
        if (!active) {
            return buildAiSearchTrending(catalog);
        }
        return rankedResults.map((entry) => entry.product);
    }, [catalog, deferredQuery, filters.materials.length, filters.occasions.length, filters.onlyDiscounted, filters.priceRange, filters.styles.length, rankedResults]);

    const recommendations = useMemo(() => buildAiSearchRecommendations(catalog, primaryResults, activeIntent), [activeIntent, catalog, primaryResults]);
    const styleCollections = useMemo(() => buildAiSearchStyleCollections(catalog), [catalog]);
    const trendingProducts = useMemo(() => buildAiSearchTrending(catalog), [catalog]);
    const activeFilterCount = filters.materials.length
        + filters.styles.length
        + filters.occasions.length
        + (filters.priceRange !== 'all' ? 1 : 0)
        + (filters.onlyDiscounted ? 1 : 0);

    const visualSearchReady = Boolean(aiStatus?.healthy && aiStatus?.ready);
    const indexedCount = aiStatus?.catalog?.indexed ?? 0;
    const indexedCoverage = aiStatus?.catalog?.percentComplete ?? 0;
    const indexedTotal = aiStatus?.catalog?.total ?? catalog.length;
    const pendingCount = aiStatus?.catalog?.pending ?? Math.max(indexedTotal - indexedCount, 0);
    const imagesReadyCount = aiStatus?.catalog?.productsWithImages ?? 0;
    const aiSystemPalette = aiStatusLoading
        ? { background: '#f8efe7', border: AI_SEARCH_COLORS.line, accent: AI_SEARCH_COLORS.espresso }
        : !aiStatus?.healthy
            ? { background: '#fff4f1', border: '#f2b9ae', accent: AI_SEARCH_COLORS.red }
            : visualSearchReady
                ? { background: '#eef5ee', border: '#bfd0bc', accent: AI_SEARCH_COLORS.sage }
                : { background: '#fff8ec', border: '#ecd4a7', accent: AI_SEARCH_COLORS.gold };
    const aiStatusLabel = aiStatusLoading
        ? 'Checking AI vision system'
        : !aiStatus?.healthy
            ? 'Python AI service offline'
            : visualSearchReady
                ? 'Visual search ready'
                : 'Catalog indexing still required';
    const aiStatusMessage = aiStatusLoading
        ? 'Connecting to the Python image-embedding service and checking how many products are ready for similarity ranking.'
        : !aiStatus?.healthy
            ? aiStatus?.message || 'The Python AI service is not responding. Refresh the status after restarting it.'
            : visualSearchReady
                ? `${indexedCount} products are indexed and ready for similarity matching with ${aiStatus?.model || 'MobileNetV2'}.`
                : imagesReadyCount > 0
                    ? `The model is online, but only ${indexedCount} of ${indexedTotal} products have embeddings. Run indexing before relying on visual search.`
                    : 'The model is online, but the catalog still needs product images before embeddings can be generated.';

    const noResults = hasEngaged && primaryResults.length === 0 && visualMatches.length === 0 && !visualLoading;

    const handleRefreshAiStatus = async (showFeedback = true) => {
        try {
            setAiStatusRefreshing(true);
            const health = await fetchAiSearchHealth();
            setAiStatus(health);

            if (showFeedback) {
                showToast('AI status refreshed', health.ready ? 'success' : 'info', {
                    subMessage: health.ready
                        ? `${health.catalog?.indexed || 0} products are ready for visual search.`
                        : 'The model is online, but indexing is still needed for image matching.',
                });
            }
        } catch (error: any) {
            const nextStatus: AiSearchHealthResponse = {
                healthy: false,
                ready: false,
                message: error?.response?.data?.message || 'Unable to reach the AI feature extraction service.',
                error: error?.response?.data?.error || error?.message,
                serviceUrl: error?.response?.data?.serviceUrl,
                catalog: error?.response?.data?.catalog,
            };

            setAiStatus(nextStatus);

            if (showFeedback) {
                showToast('AI status refresh failed', 'warning', {
                    subMessage: nextStatus.message || nextStatus.error || 'Check whether the Python service is running on port 5001.',
                });
            }
        } finally {
            setAiStatusRefreshing(false);
        }
    };

    const handleSubmitSearch = async () => {
        if (!query.trim() && !selectedImageUri) {
            showToast('Describe a style or upload an image to begin.', 'info', { icon: 'search' });
            return;
        }

        setHasEngaged(true);
        setVisualError(null);

        if (!selectedImageUri) return;

        if (!aiStatus?.healthy) {
            showToast('Visual search is offline', 'warning', {
                subMessage: aiStatus?.message || 'The Python AI service is unavailable. Refresh the AI status after starting it.',
            });
            return;
        }

        if (!aiStatus.ready) {
            showToast('Catalog indexing required', 'info', {
                subMessage: 'The model is online, but products still need image embeddings before visual search can rank matches.',
            });
            return;
        }

        const startedAt = Date.now();

        try {
            setVisualLoading(true);
            setVisualMatches([]);
            setVisualSearchTime(null);
            const formData = new FormData();
            const extension = selectedImageUri.split('.').pop() || 'jpg';
            formData.append('image', {
                uri: selectedImageUri,
                name: `ai-search.${extension}`,
                type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
            } as any);

            const response = await searchProductsByImage(formData);
            const results = Array.isArray(response.data?.results) ? response.data.results : [];
            const normalized = results
                .map((entry: any) => ({
                    product: normalizeProductPayload(entry.product),
                    score: typeof entry.score === 'number' ? entry.score : 0,
                }))
                .filter((entry: AiSearchVisualMatch) => entry.product?._id);

            setVisualMatches(normalized);
            setVisualSearchTime(Number(((Date.now() - startedAt) / 1000).toFixed(1)));
            showToast(
                normalized.length > 0 ? 'Visual search updated' : 'No visual matches found',
                normalized.length > 0 ? 'success' : 'info',
                {
                    subMessage: normalized.length > 0
                        ? `${normalized.length} close matches ranked by similarity.`
                        : response.data?.message || 'Try a different image or widen the catalog filters.',
                },
            );
        } catch (error: any) {
            setVisualMatches([]);
            setVisualSearchTime(null);
            setVisualError(error?.response?.data?.message || error?.message || 'Visual search failed.');
            void handleRefreshAiStatus(false);
        } finally {
            setVisualLoading(false);
        }
    };

    const handlePickFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast('Gallery access is required to upload inspiration.', 'warning', { icon: 'image' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        });

        if (result.canceled) return;
        setSelectedImageUri(result.assets[0]?.uri || null);
        setVisualMatches([]);
        setVisualError(null);
        setVisualSearchTime(null);
        setHasEngaged(true);
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showToast('Camera access is required to capture inspiration.', 'warning', { icon: 'camera' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.9,
        });

        if (result.canceled) return;
        setSelectedImageUri(result.assets[0]?.uri || null);
        setVisualMatches([]);
        setVisualError(null);
        setVisualSearchTime(null);
        setHasEngaged(true);
    };

    const handleSelectSuggestion = (suggestion: AiSuggestion) => {
        setQuery(suggestion.query);
        setAssistantPrompt(suggestion.query);
        setHasEngaged(true);
    };

    const handleApplyAssistantPrompt = () => {
        if (!assistantPrompt.trim()) {
            showToast('Write a prompt for the assistant first.', 'info', { icon: 'message-circle' });
            return;
        }

        const intent = parseAiSearchIntent(assistantPrompt, Boolean(selectedImageUri));
        setQuery(assistantPrompt);
        setAssistantReply(buildAiAssistantReply(assistantPrompt, intent));
        setFilters((current) => ({
            ...current,
            materials: intent.material && materialOptions.includes(intent.material) ? [intent.material] : current.materials,
            styles: intent.style ? [intent.style] : current.styles,
            occasions: intent.occasion ? [intent.occasion] : current.occasions,
            priceRange: intent.budget ? getPriceRangeFromBudget(intent.budget) : current.priceRange,
        }));
        setHasEngaged(true);
    };

    const handleAddToCart = async (product: AiSearchProduct) => {
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: getAiSearchProductImage(product),
            price: product.price,
            salePrice: typeof product.salePrice === 'number' ? product.salePrice : null,
            sku: product.sku || '',
            quantity: 1,
        });
        showToast(`${product.name} added to cart`, 'success', { subMessage: getAiSearchPrice(product) });
    };

    const handleToggleWishlist = (product: AiSearchProduct) => {
        const wished = isInWishlist(product._id);
        toggleItem(product._id, {
            _id: product._id,
            name: product.name,
            thumbnailImage: getAiSearchProductImage(product),
            price: product.price,
            salePrice: typeof product.salePrice === 'number' ? product.salePrice : null,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: product.quantity,
            material: product.material,
            description: product.description,
            images: product.images,
        });
        showToast(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'wishlist', { subMessage: product.name });
    };

    const openQuickView = async (product: AiSearchProduct) => {
        try {
            const response = await getProductById(product._id);
            const normalized = normalizeProductPayload(response.data);
            setQuickViewProduct(normalized || product);
        } catch {
            setQuickViewProduct(product);
        } finally {
            setQuickViewVisible(true);
        }
    };

    const handleCycleSort = () => {
        const index = SORT_OPTIONS.findIndex((option) => option.id === sortBy);
        const next = SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length];
        setSortBy(next.id);
    };

    return (
        <View className="relative px-4 pt-5 pb-12 overflow-hidden" style={{ backgroundColor: AI_SEARCH_COLORS.background }}>
            <View className="absolute left-[-58px] top-8 h-44 w-44 rounded-full" style={{ backgroundColor: 'rgba(182, 115, 77, 0.08)' }} />
            <View className="absolute right-[-70px] top-32 h-56 w-56 rounded-full" style={{ backgroundColor: 'rgba(112, 133, 109, 0.08)' }} />

            <AISearchHero
                query={query}
                onChangeQuery={setQuery}
                onSubmitSearch={handleSubmitSearch}
                onPickFromGallery={handlePickFromGallery}
                onTakePhoto={handleTakePhoto}
                selectedImageUri={selectedImageUri}
                onClearImage={() => {
                    setSelectedImageUri(null);
                    setVisualMatches([]);
                    setVisualError(null);
                    setVisualSearchTime(null);
                }}
                loading={visualLoading}
                totalProducts={catalog.length}
                styleCount={styleCollections.length}
                materialCount={materialOptions.length}
                isWide={isDesktop}
                aiStatusLabel={aiStatusLabel}
                aiStatusMessage={aiStatusMessage}
                aiAccentColor={aiSystemPalette.accent}
                aiModelLabel={aiStatus?.model || 'MobileNetV2'}
                indexedCount={indexedCount}
                indexedCoverage={indexedCoverage}
                onRefreshStatus={() => void handleRefreshAiStatus(true)}
                refreshingStatus={aiStatusRefreshing}
            />

            <View className="mt-5 rounded-[28px] border px-5 py-5" style={{ borderColor: aiSystemPalette.border, backgroundColor: aiSystemPalette.background }}>
                <View className="flex-row flex-wrap items-start justify-between gap-4">
                    <View className="min-w-[220px] flex-1">
                        <Text style={{ color: aiSystemPalette.accent, fontSize: 12 }}>AI system briefing</Text>
                        <Text className="mt-2 text-[28px] leading-[34px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'PlayfairDisplay' }}>
                            {aiStatusLabel}
                        </Text>
                        <Text className="mt-3 max-w-[720px] text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted }}>
                            {aiStatusMessage}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => void handleRefreshAiStatus(true)}
                        disabled={aiStatusLoading || aiStatusRefreshing}
                        className="px-4 py-3 rounded-full"
                        style={{ backgroundColor: AI_SEARCH_COLORS.ink }}
                    >
                        <Text style={{ color: AI_SEARCH_COLORS.white }}>
                            {aiStatusRefreshing ? 'Refreshing...' : 'Refresh AI status'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-3 mt-5">
                    {[
                        { label: 'Vision model', value: aiStatus?.model || 'MobileNetV2' },
                        { label: 'Embeddings', value: aiStatus?.feature_vector_size ? `${aiStatus.feature_vector_size} dimensions` : '1280 dimensions' },
                        { label: 'Catalog total', value: `${indexedTotal || 0}` },
                        { label: 'Indexed products', value: `${indexedCount}/${indexedTotal || 0}` },
                        { label: 'Pending index', value: `${pendingCount}` },
                        { label: 'Coverage', value: `${indexedCoverage}% ready` },
                        { label: 'Products with images', value: `${imagesReadyCount}` },
                    ].map((metric) => (
                        <View key={metric.label} className="min-w-[132px] rounded-[20px] border px-4 py-4" style={{ borderColor: aiSystemPalette.border, backgroundColor: 'rgba(255,255,255,0.55)' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 11 }}>{metric.label}</Text>
                            <Text className="mt-1 text-[16px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'Inter' }}>{metric.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <AISearchSuggestionStrip suggestions={suggestions} onSelect={handleSelectSuggestion} />

            {hasEngaged || query.trim() || selectedImageUri ? (
                <View className="mt-6">
                    <AISearchIntentPanel intent={activeIntent} imageUsed={Boolean(selectedImageUri)} />
                </View>
            ) : null}

            <View className="mt-6">
                <AISearchQuickActionsBar
                    resultCount={primaryResults.length}
                    visualCount={visualMatches.length}
                    sortLabel={SORT_OPTIONS.find((option) => option.id === sortBy)?.label || 'Recommended'}
                    activeFilterCount={activeFilterCount}
                    aiStatusLabel={aiStatusLabel}
                    indexedCount={indexedCount}
                    onRefreshStatus={() => void handleRefreshAiStatus(true)}
                    refreshingStatus={aiStatusRefreshing}
                    onOpenFilters={() => setShowFilterModal(true)}
                    onCycleSort={handleCycleSort}
                />
            </View>

            {(catalogLoading || catalogError) && (
                <View className="mt-6 rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                    {catalogLoading ? (
                        <View className="flex-row items-center gap-3">
                            <ActivityIndicator color={AI_SEARCH_COLORS.espresso} />
                            <Text style={{ color: AI_SEARCH_COLORS.ink }}>Loading AI-ready catalog...</Text>
                        </View>
                    ) : (
                        <View className="flex-row items-start gap-3">
                            <Feather name="alert-circle" size={18} color={AI_SEARCH_COLORS.red} />
                            <Text className="flex-1 leading-6" style={{ color: AI_SEARCH_COLORS.red }}>{catalogError}</Text>
                        </View>
                    )}
                </View>
            )}

            <View className="mt-6" style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 20 }}>
                <View style={{ flex: 1 }}>
                    {visualLoading ? (
                        <View className="mb-6 rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                            <View className="flex-row items-center gap-3">
                                <ActivityIndicator color={AI_SEARCH_COLORS.espresso} />
                                <Text style={{ color: AI_SEARCH_COLORS.ink }}>Analyzing the uploaded image and ranking close matches...</Text>
                            </View>
                        </View>
                    ) : null}

                    {visualError ? (
                        <View className="mb-6 rounded-[24px] border bg-[#fff4f1] p-5" style={{ borderColor: '#f2b9ae' }}>
                            <View className="flex-row items-start gap-3">
                                <Feather name="alert-circle" size={18} color={AI_SEARCH_COLORS.red} />
                                <Text className="flex-1 leading-6" style={{ color: AI_SEARCH_COLORS.red }}>{visualError}</Text>
                            </View>
                        </View>
                    ) : null}

                    {visualMatches.length > 0 ? (
                        <View className="mb-8">
                            <AISearchSectionHeader
                                eyebrow="Visual search"
                                title="Visual matches"
                                description={`AI found ${visualMatches.length} similar silhouettes${visualSearchTime ? ` in ${visualSearchTime}s` : ''}.`}
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-4 pr-4">
                                    {visualMatches.map((match) => (
                                        <View key={`${match.product._id}-visual`} style={{ width: railCardWidth }}>
                                            <AISearchProductCard
                                                product={match.product}
                                                onPress={() => router.push({ pathname: '/product-single', params: { id: match.product._id } } as never)}
                                                onQuickView={() => openQuickView(match.product)}
                                                onToggleWishlist={() => handleToggleWishlist(match.product)}
                                                onAddToCart={() => handleAddToCart(match.product)}
                                                isWishlisted={isInWishlist(match.product._id)}
                                                accentLabel="AI match"
                                                accentValue={`${Math.round(match.score * 100)}% · ${getAiVisualMatchLabel(match.score)}`}
                                                compact
                                            />
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    ) : null}

                    <View>
                        <AISearchSectionHeader
                            eyebrow={primaryResults.length ? 'Search results grid' : 'Discovery'}
                            title={primaryResults.length ? (hasEngaged ? 'Pieces matched to your search' : 'Trending now with AI signals') : 'No direct search matches yet'}
                            description={primaryResults.length ? 'Sorted using search cues, product metadata, reviews, discounts, and live filters.' : 'Try another phrase or use a visual upload to widen the search.'}
                        />

                        {noResults ? (
                            <View className="rounded-[28px] border bg-[#fffdfb] p-6" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                <Text className="text-[28px] leading-[36px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'PlayfairDisplay' }}>
                                    No exact matches yet.
                                </Text>
                                <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted }}>
                                    The AI could not find a precise fit for your current brief. Try loosening one filter, changing the material, or starting with an inspiration photo.
                                </Text>

                                <View className="flex-row flex-wrap gap-3 mt-5">
                                    {suggestions.slice(0, 3).map((suggestion) => (
                                        <TouchableOpacity key={suggestion.id} onPress={() => handleSelectSuggestion(suggestion)} className="px-4 py-3 border rounded-full" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}>
                                            <Text style={{ color: AI_SEARCH_COLORS.espresso }}>{suggestion.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                                {primaryResults.map((product) => (
                                    <View key={product._id} style={{ width: cardWidth }}>
                                        <AISearchProductCard
                                            product={product}
                                            onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                            onQuickView={() => openQuickView(product)}
                                            onToggleWishlist={() => handleToggleWishlist(product)}
                                            onAddToCart={() => handleAddToCart(product)}
                                            isWishlisted={isInWishlist(product._id)}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {recommendations.length > 0 ? (
                        <View className="mt-8">
                            <AISearchSectionHeader
                                eyebrow="AI recommended results"
                                title="You may also like"
                                description="Products that share the same style story, material direction, or gifting context as your current search."
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-4 pr-4">
                                    {recommendations.map((product) => (
                                        <View key={`${product._id}-recommendation`} style={{ width: railCardWidth }}>
                                            <AISearchProductCard
                                                product={product}
                                                onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                                onQuickView={() => openQuickView(product)}
                                                onToggleWishlist={() => handleToggleWishlist(product)}
                                                onAddToCart={() => handleAddToCart(product)}
                                                isWishlisted={isInWishlist(product._id)}
                                                accentLabel="Why"
                                                accentValue="Similar taste profile"
                                                compact
                                            />
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    ) : null}

                    {styleCollections.length > 0 ? (
                        <View className="mt-8">
                            <AISearchSectionHeader
                                eyebrow="Style-based search"
                                title="Browse by aesthetic"
                                description="Switch between distinct style lanes without rewriting the whole brief."
                            />

                            <View className="gap-6">
                                {styleCollections.map((collection) => (
                                    <View key={collection.id} className="rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                        <View className="flex-row items-end justify-between gap-3 mb-4">
                                            <View className="flex-1">
                                                <Text className="text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'PlayfairDisplay' }}>
                                                    {collection.title}
                                                </Text>
                                                <Text className="mt-2 leading-6" style={{ color: AI_SEARCH_COLORS.muted }}>
                                                    {collection.description}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setQuery(collection.title.toLowerCase());
                                                    setFilters((current) => ({ ...current, styles: [collection.id === 'minimal' ? 'Minimal' : collection.id === 'statement' ? 'Statement' : 'Bridal'] }));
                                                    setHasEngaged(true);
                                                }}
                                                className="px-4 py-3 border rounded-full"
                                                style={{ borderColor: AI_SEARCH_COLORS.line }}
                                            >
                                                <Text style={{ color: AI_SEARCH_COLORS.espresso }}>Explore</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-4 pr-4">
                                                {collection.products.map((product) => (
                                                    <View key={`${collection.id}-${product._id}`} style={{ width: railCardWidth }}>
                                                        <AISearchProductCard
                                                            product={product}
                                                            onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                                            onQuickView={() => openQuickView(product)}
                                                            onToggleWishlist={() => handleToggleWishlist(product)}
                                                            onAddToCart={() => handleAddToCart(product)}
                                                            isWishlisted={isInWishlist(product._id)}
                                                            compact
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}
                </View>

                <View style={{ width: isDesktop ? 340 : '100%' }}>
                    {isDesktop ? (
                        <AISearchFilterPanel
                            filters={filters}
                            materialOptions={materialOptions}
                            onToggleMaterial={(value) => setFilters((current) => ({ ...current, materials: toggleValue(current.materials, value) }))}
                            onToggleStyle={(value) => setFilters((current) => ({ ...current, styles: toggleValue(current.styles, value) }))}
                            onToggleOccasion={(value) => setFilters((current) => ({ ...current, occasions: toggleValue(current.occasions, value) }))}
                            onSetPriceRange={(value) => setFilters((current) => ({ ...current, priceRange: value }))}
                            onToggleInStock={() => setFilters((current) => ({ ...current, onlyInStock: !current.onlyInStock }))}
                            onToggleDiscounted={() => setFilters((current) => ({ ...current, onlyDiscounted: !current.onlyDiscounted }))}
                            onReset={() => setFilters(INITIAL_FILTERS)}
                        />
                    ) : null}

                    <View className={isDesktop ? 'mt-5' : 'mt-8'}>
                        <AISearchAssistantPanel
                            prompt={assistantPrompt}
                            onChangePrompt={setAssistantPrompt}
                            onSend={handleApplyAssistantPrompt}
                            response={assistantReply}
                            promptChips={AI_CHAT_PROMPTS}
                            onSelectPrompt={(value) => {
                                setAssistantPrompt(value);
                                setQuery(value);
                            }}
                        />
                    </View>

                    <View className="mt-5">
                        <AISearchSocialProof metrics={AI_SOCIAL_PROOF} />
                    </View>

                    <View className="mt-5 rounded-[24px] border bg-[#fffdfb] p-5" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                        <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12 }}>Top searched products</Text>
                        <Text className="mt-1 text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'PlayfairDisplay' }}>
                            Community favorites
                        </Text>

                        <View className="gap-3 mt-4">
                            {trendingProducts.slice(0, 3).map((product, index) => (
                                <TouchableOpacity
                                    key={`${product._id}-trend`}
                                    onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                    className="rounded-[20px] border px-4 py-4"
                                    style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}
                                >
                                    <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 11 }}>{`0${index + 1}`}</Text>
                                    <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.ink, fontSize: 15, fontFamily: 'Inter' }}>{product.name}</Text>
                                    <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.espresso, fontSize: 13 }}>{getAiSearchPrice(product)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            <Modal visible={showFilterModal && !isDesktop} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
                <View className="justify-end flex-1 bg-black/30">
                    <View className="max-h-[88%] rounded-t-[30px] border bg-[#fffaf6] px-4 pb-8 pt-4" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                        <View className="items-center mb-4">
                            <View className="h-1.5 w-14 rounded-full bg-[#d4c1b1]" />
                        </View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-[24px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: 'PlayfairDisplay' }}>
                                Refine your edit
                            </Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)} className="h-10 w-10 items-center justify-center rounded-full bg-[#f4e7db]">
                                <Feather name="x" size={16} color={AI_SEARCH_COLORS.ink} />
                            </TouchableOpacity>
                        </View>

                        <AISearchFilterPanel
                            filters={filters}
                            materialOptions={materialOptions}
                            onToggleMaterial={(value) => setFilters((current) => ({ ...current, materials: toggleValue(current.materials, value) }))}
                            onToggleStyle={(value) => setFilters((current) => ({ ...current, styles: toggleValue(current.styles, value) }))}
                            onToggleOccasion={(value) => setFilters((current) => ({ ...current, occasions: toggleValue(current.occasions, value) }))}
                            onSetPriceRange={(value) => setFilters((current) => ({ ...current, priceRange: value }))}
                            onToggleInStock={() => setFilters((current) => ({ ...current, onlyInStock: !current.onlyInStock }))}
                            onToggleDiscounted={() => setFilters((current) => ({ ...current, onlyDiscounted: !current.onlyDiscounted }))}
                            onReset={() => setFilters(INITIAL_FILTERS)}
                        />
                    </View>
                </View>
            </Modal>

            <AISearchQuickViewModal
                visible={quickViewVisible}
                product={quickViewProduct}
                onClose={() => setQuickViewVisible(false)}
                onAddToCart={() => {
                    if (!quickViewProduct) return;
                    handleAddToCart(quickViewProduct);
                }}
                onOpenProduct={() => {
                    if (!quickViewProduct) return;
                    setQuickViewVisible(false);
                    router.push({ pathname: '/product-single', params: { id: quickViewProduct._id } } as never);
                }}
            />
        </View>
    );
}