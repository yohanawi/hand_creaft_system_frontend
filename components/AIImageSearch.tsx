import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { startTransition, useContext, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
    type DimensionValue,
} from 'react-native';

import AISearchProductCard from '@/components/AISearch/AISearchProductCard';
import { AI_SEARCH_CARD_SHADOW, AI_SEARCH_COLORS, AI_SEARCH_FONTS, AI_SEARCH_PANEL_SHADOW } from '@/components/AISearch/aiSearchTheme';
import {
    AI_PRICE_OPTIONS,
    buildAiSearchRecommendations,
    buildAiSearchTrending,
    filterAiSearchProducts,
    getAiSearchCategoryName,
    getAiSearchPrice,
    getAiSearchProductImage,
    getAiVisualMatchLabel,
    inferAiSearchHandmadeType,
    inferAiSearchOccasion,
    inferAiSearchStyle,
    normalizeAiSearchCatalog,
    parseAiSearchIntent,
    sortAiSearchResults,
    type AiFilterState,
    type AiSearchProduct,
    type AiSearchVisualMatch,
} from '@/components/AISearch/aiSearchUtils';
import { AuthContext } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { createSupportTicket, getAiServiceHealth, getProducts, searchProductsByImage } from '@/services/api';

const RECENT_SCANS_KEY = 'ai-identify-recent-scans';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const INITIAL_FILTERS: AiFilterState = {
    categories: [],
    materials: [],
    colors: [],
    styles: [],
    occasions: [],
    handmadeTypes: [],
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

const ANALYSIS_STEPS = [
    'Detecting item',
    'Reading design',
    'Matching products',
    'Preparing results',
];

const AI_TIPS = [
    { icon: 'sun', title: 'Use bright lighting', description: 'Natural light helps the model separate metal finish, stones, and surface texture.' },
    { icon: 'target', title: 'Keep the jewelry centered', description: 'Place the piece in the middle of the frame so the silhouette is clear.' },
    { icon: 'aperture', title: 'Avoid blurry photos', description: 'Sharper edges improve similarity ranking and category detection.' },
    { icon: 'square', title: 'Choose a plain background', description: 'Simple backdrops reduce visual noise and improve product matching.' },
    { icon: 'layers', title: 'Upload one item at a time', description: 'Single-piece uploads produce cleaner material and style predictions.' },
];

const FAQ_ITEMS = [
    {
        id: 'accuracy',
        question: 'Is the AI result 100% accurate?',
        answer: 'No. The AI identifies likely jewelry type, material, finish, and related catalog matches based on visual similarity. It is meant to speed discovery, not replace manual verification.',
    },
    {
        id: 'not-found',
        question: 'What happens if the product is not found?',
        answer: 'The page falls back to similar handmade pieces, lets you request a custom order, and provides a notify-me action so the support team can follow up when a closer piece becomes available.',
    },
    {
        id: 'custom-order',
        question: 'Can I request a custom jewelry order?',
        answer: 'Yes. The custom request section packages your image brief, quantity, budget, delivery target, and notes into a support ticket for the jewelry team.',
    },
    {
        id: 'storage',
        question: 'Are uploaded images stored or saved?',
        answer: 'The AI search upload is processed for matching and recent-scan convenience. Current support tickets store the request details, while the raw reference image is only retained locally unless your device or browser can rehydrate it later.',
    },
];

type SelectedUpload = {
    uri: string;
    name: string;
    mimeType: string;
    size?: number | null;
    width?: number;
    height?: number;
    file?: File | Blob | null;
    source: 'gallery' | 'camera' | 'drop' | 'edited';
};

type RecentScanRecord = {
    id: string;
    createdAt: string;
    imageUri: string | null;
    imageLabel: string;
    detectedCategory: string;
    matchCount: number;
    query: string;
    filters: AiFilterState;
    topProductId?: string;
    topProductName?: string;
    fallbackImage?: string;
};

type CustomRequestState = {
    name: string;
    email: string;
    phone: string;
    quantity: string;
    material: string;
    budget: string;
    deliveryDate: string;
    notes: string;
};

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

type DetectionSummary = {
    productType: string;
    material: string;
    color: string;
    style: string;
    handmadeType: string;
    confidence: string;
};

function toggleValue(values: string[], next: string) {
    return values.includes(next) ? values.filter((value) => value !== next) : [...values, next];
}

function normalizeProductPayload(payload: any): AiSearchProduct {
    const raw = payload?.product || payload?.data || payload;
    return normalizeAiSearchCatalog([raw])[0] || raw;
}

async function fetchAiSearchHealth() {
    const response = await getAiServiceHealth();
    return response.data as AiSearchHealthResponse;
}

function formatFileSize(bytes?: number | null) {
    if (!bytes) return 'Up to 8 MB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

function singularize(value: string) {
    if (!value) return 'Jewelry';
    if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
    if (value.endsWith('s')) return value.slice(0, -1);
    return value;
}

function normalizeEntityName(entity?: AiSearchProduct['category'] | AiSearchProduct['subcategory']) {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return entity.name || '';
}

function pickMostFrequentLabel(values: (string | undefined)[], fallback: string) {
    const counts = values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .reduce<Record<string, number>>((accumulator, value) => {
            accumulator[value] = (accumulator[value] || 0) + 1;
            return accumulator;
        }, {});

    const [winner] = Object.entries(counts).sort((left, right) => right[1] - left[1]);
    return winner?.[0] || fallback;
}

function inferDetectedProductType(product?: AiSearchProduct, fallback?: string) {
    const haystack = [
        product?.name,
        normalizeEntityName(product?.subcategory),
        normalizeEntityName(product?.category),
        fallback,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    if (/ring/.test(haystack)) return 'Ring';
    if (/necklace|pendant/.test(haystack)) return 'Necklace';
    if (/bracelet|bangle/.test(haystack)) return 'Bracelet';
    if (/earring/.test(haystack)) return 'Earrings';

    const seeded = normalizeEntityName(product?.subcategory) || normalizeEntityName(product?.category) || fallback || 'Jewelry';
    return singularize(seeded);
}

function buildDetectionSummary(matches: AiSearchVisualMatch[], query: string): DetectionSummary {
    const topProducts = matches.map((entry) => entry.product);
    const topProduct = topProducts[0];
    const intent = parseAiSearchIntent(query, true);

    return {
        productType: inferDetectedProductType(topProduct, intent.category),
        material: intent.material || pickMostFrequentLabel(topProducts.map((product) => product.material), 'Mixed materials'),
        color: pickMostFrequentLabel(topProducts.map((product) => product.color), 'Mixed tones'),
        style: intent.style || pickMostFrequentLabel(topProducts.map((product) => inferAiSearchStyle(product)), 'Artisan'),
        handmadeType: pickMostFrequentLabel(topProducts.map((product) => inferAiSearchHandmadeType(product)), 'Metalwork'),
        confidence: matches[0] ? `${Math.round(matches[0].score * 100)}% Match` : 'Awaiting match',
    };
}

function toUploadFromAsset(asset: any, source: SelectedUpload['source']): SelectedUpload | null {
    if (!asset?.uri) return null;
    const uri = String(asset.uri);
    const explicitExtension = String(asset?.fileName || uri).split('.').pop()?.toLowerCase();
    const extension = explicitExtension === 'jpg' ? 'jpeg' : explicitExtension || 'jpeg';
    const mimeType = asset?.mimeType || `image/${extension}`;

    return {
        uri,
        name: asset?.fileName || `ai-identify.${extension === 'jpeg' ? 'jpg' : extension}`,
        mimeType,
        size: typeof asset?.fileSize === 'number' ? asset.fileSize : null,
        width: typeof asset?.width === 'number' ? asset.width : undefined,
        height: typeof asset?.height === 'number' ? asset.height : undefined,
        file: asset?.file || null,
        source,
    };
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
    return (
        <View className="mb-5 flex-row flex-wrap items-end justify-between gap-4">
            <View className="min-w-[220px] flex-1">
                <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>{eyebrow}</Text>
                <Text className="mt-2 text-[30px] leading-[36px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                    {title}
                </Text>
                <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                    {description}
                </Text>
            </View>

            {action ? <View>{action}</View> : null}
        </View>
    );
}

function InfoMetric({ label, value, accent = AI_SEARCH_COLORS.espresso }: { label: string; value: string; accent?: string }) {
    return (
        <View className="min-w-[132px] rounded-[20px] border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: 'rgba(255,255,255,0.72)' }}>
            <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>{label}</Text>
            <Text className="mt-1 text-[16px]" style={{ color: accent, fontFamily: AI_SEARCH_FONTS.heading }}>{value}</Text>
        </View>
    );
}

function FilterChip({
    label,
    active,
    onPress,
    icon,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    icon?: keyof typeof Feather.glyphMap;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center rounded-full border px-4 py-3"
            style={{
                borderColor: active ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line,
                backgroundColor: active ? AI_SEARCH_COLORS.espresso : '#fffaf6',
            }}
        >
            {icon ? <Feather name={icon} size={14} color={active ? AI_SEARCH_COLORS.white : AI_SEARCH_COLORS.espresso} /> : null}
            <Text className={icon ? 'ml-2' : ''} style={{ color: active ? AI_SEARCH_COLORS.white : AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function FieldCard({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    focused,
    onFocus,
    onBlur,
    multiline = false,
    keyboardType = 'default',
    width = '100%',
}: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    focused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    width?: DimensionValue;
}) {
    return (
        <View style={{ width }}>
            <Text className="mb-2 text-[13px] font-semibold" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}>
                {label}
            </Text>
            <View
                className={`rounded-[22px] border bg-white ${multiline ? 'px-4 py-4' : 'flex-row items-center px-4 py-4'}`}
                style={{
                    borderColor: focused ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line,
                    backgroundColor: focused ? '#fffdfb' : '#ffffff',
                }}
            >
                {!multiline ? <Feather name={icon} size={16} color={AI_SEARCH_COLORS.clay} /> : null}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    placeholderTextColor="#9b8a7c"
                    keyboardType={keyboardType}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
                    multiline={multiline}
                    className={multiline ? '' : 'ml-3 flex-1'}
                    style={{
                        minHeight: multiline ? 120 : undefined,
                        textAlignVertical: multiline ? 'top' : 'center',
                        color: AI_SEARCH_COLORS.ink,
                        fontFamily: AI_SEARCH_FONTS.body,
                        fontSize: 15,
                    }}
                />
            </View>
        </View>
    );
}

function FAQCard({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setOpen((current) => !current)}
            className="rounded-[24px] border px-5 py-5"
            style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}
        >
            <View className="flex-row items-center justify-between gap-4">
                <Text className="flex-1 text-[17px] leading-7" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                    {question}
                </Text>
                <Feather name={open ? 'minus' : 'plus'} size={18} color={AI_SEARCH_COLORS.espresso} />
            </View>
            {open ? (
                <Text className="mt-4 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                    {answer}
                </Text>
            ) : null}
        </TouchableOpacity>
    );
}

export default function AIImageSearch() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { isInWishlist, toggleItem } = useWishlist();

    const isTablet = width >= 768;
    const isDesktop = width >= 1100;
    const cardWidth = isDesktop ? '31.9%' : isTablet ? '48.2%' : '100%';

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

    const [selectedUpload, setSelectedUpload] = useState<SelectedUpload | null>(null);
    const selectedImageUri = selectedUpload?.uri || null;
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [editingImage, setEditingImage] = useState(false);

    const [visualMatches, setVisualMatches] = useState<AiSearchVisualMatch[]>([]);
    const [visualLoading, setVisualLoading] = useState(false);
    const [visualError, setVisualError] = useState<string | null>(null);
    const [visualSearchTime, setVisualSearchTime] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

    const [recentScans, setRecentScans] = useState<RecentScanRecord[]>([]);
    const [notifyRequested, setNotifyRequested] = useState(false);
    const [highlightCustomRequest, setHighlightCustomRequest] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [customSubmitting, setCustomSubmitting] = useState(false);
    const [customRequest, setCustomRequest] = useState<CustomRequestState>({
        name: '',
        email: '',
        phone: '',
        quantity: '1',
        material: '',
        budget: '',
        deliveryDate: '',
        notes: '',
    });

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
                setCatalogError(error?.response?.data?.message || error?.message || 'Unable to load the jewelry catalog.');
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

        (async () => {
            try {
                const stored = await AsyncStorage.getItem(RECENT_SCANS_KEY);
                if (!mounted || !stored) return;
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentScans(parsed as RecentScanRecord[]);
                }
            } catch {
                // Ignore cache hydration failures.
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!auth?.user) return;

        setCustomRequest((current) => ({
            ...current,
            name: current.name || auth.user?.name || '',
            email: current.email || auth.user?.email || '',
            phone: current.phone || auth.user?.phone || '',
        }));
    }, [auth?.user]);

    useEffect(() => {
        if (!visualLoading) {
            setAnalysisStepIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setAnalysisStepIndex((current) => Math.min(current + 1, ANALYSIS_STEPS.length - 1));
        }, 900);

        return () => clearInterval(interval);
    }, [visualLoading]);

    useEffect(() => {
        if (!highlightCustomRequest) return;

        const timeout = setTimeout(() => setHighlightCustomRequest(false), 2600);
        return () => clearTimeout(timeout);
    }, [highlightCustomRequest]);

    useEffect(() => {
        const currentUri = selectedUpload?.uri;

        return () => {
            if (Platform.OS === 'web' && currentUri?.startsWith('blob:')) {
                URL.revokeObjectURL(currentUri);
            }
        };
    }, [selectedUpload?.uri]);

    const activeIntent = useMemo(() => parseAiSearchIntent(deferredQuery, Boolean(selectedImageUri)), [deferredQuery, selectedImageUri]);
    const trendingProducts = useMemo(() => buildAiSearchTrending(catalog), [catalog]);
    const categoryOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => getAiSearchCategoryName(product)).filter(Boolean))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );
    const materialOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => product.material).filter((value): value is string => Boolean(value)))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );
    const colorOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => product.color).filter((value): value is string => Boolean(value)))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );
    const occasionOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => inferAiSearchOccasion(product)).filter(Boolean))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );
    const handmadeOptions = useMemo(
        () => Array.from(new Set(catalog.map((product) => inferAiSearchHandmadeType(product)).filter(Boolean))).sort((left, right) => left.localeCompare(right)),
        [catalog],
    );

    const rankedResults = useMemo(() => {
        const filtered = filterAiSearchProducts(catalog, deferredQuery, filters);
        return sortAiSearchResults(filtered, sortBy);
    }, [catalog, deferredQuery, filters, sortBy]);

    const activeFilterCount = filters.categories.length
        + filters.materials.length
        + filters.colors.length
        + filters.occasions.length
        + filters.handmadeTypes.length
        + (filters.priceRange !== 'all' ? 1 : 0)
        + (filters.onlyDiscounted ? 1 : 0);

    const hasSearchContext = Boolean(deferredQuery.trim()) || Boolean(selectedImageUri) || activeFilterCount > 0;

    const matchingProducts = useMemo(() => {
        if (visualMatches.length) {
            return visualMatches.map((entry) => entry.product);
        }
        if (hasSearchContext) {
            return rankedResults.map((entry) => entry.product);
        }
        return trendingProducts;
    }, [hasSearchContext, rankedResults, trendingProducts, visualMatches]);

    const detectionSummary = useMemo(() => buildDetectionSummary(visualMatches, deferredQuery), [deferredQuery, visualMatches]);
    const recommendations = useMemo(() => buildAiSearchRecommendations(catalog, matchingProducts, activeIntent), [activeIntent, catalog, matchingProducts]);

    const visualSearchReady = Boolean(aiStatus?.healthy && aiStatus?.ready);
    const indexedCount = aiStatus?.catalog?.indexed ?? 0;
    const indexedCoverage = aiStatus?.catalog?.percentComplete ?? 0;
    const indexedTotal = aiStatus?.catalog?.total ?? catalog.length;
    const pendingCount = aiStatus?.catalog?.pending ?? Math.max(indexedTotal - indexedCount, 0);
    const imagesReadyCount = aiStatus?.catalog?.productsWithImages ?? 0;
    const aiStatusLabel = aiStatusLoading
        ? 'Checking AI vision system'
        : !aiStatus?.healthy
            ? 'Python AI service offline'
            : visualSearchReady
                ? 'Visual search ready'
                : 'Catalog indexing still required';
    const aiStatusMessage = aiStatusLoading
        ? 'Connecting to the Python image-embedding service and checking live catalog readiness.'
        : !aiStatus?.healthy
            ? aiStatus?.message || 'The Python AI service is not responding. Refresh status after restarting it.'
            : visualSearchReady
                ? `${indexedCount} products are indexed and ready for similarity matching with ${aiStatus?.model || 'MobileNetV2'}.`
                : imagesReadyCount > 0
                    ? `The model is online, but only ${indexedCount} of ${indexedTotal} products have embeddings. Run indexing before relying on visual search.`
                    : 'The model is online, but products still need usable catalog imagery before embeddings can be generated.';

    const noResults = hasEngaged && Boolean(selectedImageUri) && !visualLoading && visualMatches.length === 0;
    const previewTooLarge = Boolean(selectedUpload?.size && selectedUpload.size > MAX_UPLOAD_BYTES);

    const applyUpload = (next: SelectedUpload | null) => {
        setSelectedUpload(next);
        setVisualMatches([]);
        setVisualError(null);
        setVisualSearchTime(null);
        setUploadProgress(next ? 100 : 0);
        setNotifyRequested(false);
        setHasEngaged(Boolean(next) || Boolean(query.trim()));
    };

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

    const openWebFilePicker = (source: 'gallery' | 'camera') => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') {
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        if (source === 'camera') {
            (input as any).capture = 'environment';
        }
        input.onchange = (event: any) => {
            const file = event?.target?.files?.[0];
            if (!file) return;

            const objectUrl = URL.createObjectURL(file);
            applyUpload({
                uri: objectUrl,
                name: file.name || 'ai-identify.jpg',
                mimeType: file.type || 'image/jpeg',
                size: typeof file.size === 'number' ? file.size : null,
                file,
                source,
            });
        };
        input.click();
    };

    const handlePickFromGallery = async () => {
        if (Platform.OS === 'web') {
            openWebFilePicker('gallery');
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast('Gallery access is required to upload inspiration.', 'warning', { icon: 'image' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.95,
        });

        if (result.canceled) return;
        const next = toUploadFromAsset(result.assets[0], 'gallery');
        if (!next) return;
        applyUpload(next);
    };

    const handleTakePhoto = async () => {
        if (Platform.OS === 'web') {
            openWebFilePicker('camera');
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showToast('Camera access is required to capture inspiration.', 'warning', { icon: 'camera' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.95,
        });

        if (result.canceled) return;
        const next = toUploadFromAsset(result.assets[0], 'camera');
        if (!next) return;
        applyUpload(next);
    };

    const handleDroppedFile = (file: any) => {
        if (!file || Platform.OS !== 'web') return;

        const objectUrl = URL.createObjectURL(file);
        applyUpload({
            uri: objectUrl,
            name: file.name || 'ai-identify.jpg',
            mimeType: file.type || 'image/jpeg',
            size: typeof file.size === 'number' ? file.size : null,
            file,
            source: 'drop',
        });
    };

    const webDropZoneProps = Platform.OS === 'web'
        ? ({
            onDragEnter: (event: any) => {
                event.preventDefault();
                setIsDraggingFile(true);
            },
            onDragLeave: (event: any) => {
                event.preventDefault();
                setIsDraggingFile(false);
            },
            onDragOver: (event: any) => {
                event.preventDefault();
            },
            onDrop: (event: any) => {
                event.preventDefault();
                setIsDraggingFile(false);
                handleDroppedFile(event?.dataTransfer?.files?.[0]);
            },
        } as any)
        : ({} as any);

    const transformSelectedImage = async (actions: any[], successMessage: string) => {
        if (!selectedUpload) {
            showToast('Upload an image before editing it.', 'info', { icon: 'image' });
            return;
        }

        try {
            setEditingImage(true);
            const result = await ImageManipulator.manipulateAsync(selectedUpload.uri, actions, {
                compress: 0.92,
                format: ImageManipulator.SaveFormat.JPEG,
            });

            applyUpload({
                ...selectedUpload,
                uri: result.uri,
                name: selectedUpload.name.replace(/\.[^.]+$/, '') + '.jpg',
                mimeType: 'image/jpeg',
                size: null,
                width: result.width,
                height: result.height,
                file: null,
                source: 'edited',
            });
            showToast(successMessage, 'success', { subMessage: 'The preview has been updated for the next analysis run.' });
        } catch (error: any) {
            showToast('Image edit failed', 'warning', { subMessage: error?.message || 'Try a different upload.' });
        } finally {
            setEditingImage(false);
        }
    };

    const handleCropImage = async () => {
        if (!selectedUpload?.width || !selectedUpload?.height) {
            showToast('This image cannot be cropped yet.', 'info', { subMessage: 'Try re-uploading the file from your gallery or camera.' });
            return;
        }

        const size = Math.min(selectedUpload.width, selectedUpload.height);
        const originX = Math.max(0, Math.round((selectedUpload.width - size) / 2));
        const originY = Math.max(0, Math.round((selectedUpload.height - size) / 2));
        await transformSelectedImage([{ crop: { originX, originY, width: size, height: size } }], 'Image cropped');
    };

    const handleRotateImage = async () => {
        await transformSelectedImage([{ rotate: 90 }], 'Image rotated');
    };

    const appendUploadToFormData = async (formData: FormData, upload: SelectedUpload) => {
        if (upload.file) {
            formData.append('image', upload.file as any, upload.name);
            return;
        }

        if (Platform.OS === 'web') {
            const response = await fetch(upload.uri);
            const blob = await response.blob();
            formData.append('image', blob as any, upload.name);
            return;
        }

        formData.append('image', {
            uri: upload.uri,
            name: upload.name,
            type: upload.mimeType,
        } as any);
    };

    const handleSubmitSearch = async () => {
        if (!selectedUpload) {
            showToast('Upload a jewelry image to begin.', 'info', { icon: 'image' });
            return;
        }

        if (previewTooLarge) {
            showToast('Image is too large', 'warning', { subMessage: 'Choose a JPG, PNG, or WEBP image under 8 MB.' });
            return;
        }

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
            setHasEngaged(true);
            setVisualLoading(true);
            setVisualMatches([]);
            setVisualError(null);
            setVisualSearchTime(null);
            setUploadProgress(8);

            const formData = new FormData();
            await appendUploadToFormData(formData, selectedUpload);

            const response = await searchProductsByImage(formData, {
                onUploadProgress: (event: any) => {
                    if (event?.total) {
                        setUploadProgress(Math.max(10, Math.min(94, Math.round((event.loaded / event.total) * 100))));
                        return;
                    }

                    if (event?.loaded) {
                        setUploadProgress((current) => Math.max(current, 42));
                    }
                },
            });

            const results = Array.isArray(response.data?.results) ? response.data.results : [];
            const normalized = results
                .map((entry: any) => ({
                    product: normalizeProductPayload(entry.product),
                    score: typeof entry.score === 'number' ? entry.score : 0,
                }))
                .filter((entry: AiSearchVisualMatch) => entry.product?._id);

            setUploadProgress(100);
            setVisualMatches(normalized);
            setVisualSearchTime(Number(((Date.now() - startedAt) / 1000).toFixed(1)));

            const summary = buildDetectionSummary(normalized, deferredQuery);
            const record: RecentScanRecord = {
                id: `${Date.now()}`,
                createdAt: new Date().toISOString(),
                imageUri: Platform.OS === 'web' ? null : selectedUpload.uri,
                imageLabel: selectedUpload.name,
                detectedCategory: summary.productType,
                matchCount: normalized.length,
                query,
                filters,
                topProductId: normalized[0]?.product._id,
                topProductName: normalized[0]?.product.name,
                fallbackImage: normalized[0]?.product ? getAiSearchProductImage(normalized[0].product) : undefined,
            };

            setRecentScans((current) => {
                const next = [record, ...current].slice(0, 6);
                AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(next)).catch(() => { });
                return next;
            });

            showToast(
                normalized.length > 0 ? 'Visual search updated' : 'No exact visual matches found',
                normalized.length > 0 ? 'success' : 'info',
                {
                    subMessage: normalized.length > 0
                        ? `${normalized.length} close matches ranked by similarity.`
                        : response.data?.message || 'Try a clearer image or broaden your filters.',
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

    const handleCycleSort = () => {
        const index = SORT_OPTIONS.findIndex((option) => option.id === sortBy);
        const next = SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length];
        setSortBy(next.id);
    };

    const handleRestoreScan = (scan: RecentScanRecord) => {
        setQuery(scan.query);
        setFilters(scan.filters || INITIAL_FILTERS);
        setHasEngaged(true);

        if (scan.imageUri) {
            applyUpload({
                uri: scan.imageUri,
                name: scan.imageLabel || 'recent-scan.jpg',
                mimeType: 'image/jpeg',
                source: 'gallery',
            });
            showToast('Previous scan restored', 'info', { subMessage: 'Tap Analyze product to run the same visual brief again.' });
            return;
        }

        showToast('Scan brief restored', 'info', { subMessage: 'Upload the reference image again to rerun the visual match.' });
    };

    const handlePrepareCustomRequest = () => {
        setHighlightCustomRequest(true);
        setCustomRequest((current) => ({
            ...current,
            notes: current.notes || `Please create a custom ${detectionSummary.productType.toLowerCase()} inspired by the uploaded image and the AI matches.`,
        }));
        showToast('Custom request form prepared', 'info', { subMessage: 'Complete the fields below to send the jewelry team your brief.' });
    };

    const handleNotifyMe = () => {
        setNotifyRequested(true);
        showToast('We will keep an eye out', 'info', { subMessage: 'Use the custom request or contact flow if you want the team to source a closer match.' });
    };

    const handleSubmitCustomRequest = async () => {
        if (!selectedUpload) {
            showToast('Upload a reference image first', 'info', { subMessage: 'The custom request is designed around the visual brief you uploaded.' });
            return;
        }

        if (!customRequest.name.trim() || !customRequest.email.trim()) {
            showToast('Contact details are required', 'warning', { subMessage: 'Please add your name and email so the jewelry team can reply.' });
            return;
        }

        if (!customRequest.quantity.trim()) {
            showToast('Quantity is required', 'warning', { subMessage: 'Tell us how many pieces you need for this request.' });
            return;
        }

        if (!customRequest.notes.trim()) {
            showToast('Add a design note', 'warning', { subMessage: 'Explain the finish, stones, or customization details you want.' });
            return;
        }

        try {
            setCustomSubmitting(true);

            const summaryLines = [
                'Custom jewelry request submitted from AI Product Identify.',
                `Reference image: ${selectedUpload.name}`,
                `Image source: ${selectedUpload.source}`,
                `Detected type: ${detectionSummary.productType}`,
                `Material cue: ${detectionSummary.material}`,
                `Color cue: ${detectionSummary.color}`,
                `Style cue: ${detectionSummary.style}`,
                `Handmade type: ${detectionSummary.handmadeType}`,
                `AI confidence: ${detectionSummary.confidence}`,
                `Requested quantity: ${customRequest.quantity}`,
                `Preferred material: ${customRequest.material || 'Open to suggestions'}`,
                `Budget: ${customRequest.budget || 'Flexible'}`,
                `Delivery date: ${customRequest.deliveryDate || 'Flexible'}`,
                deferredQuery.trim() ? `Customer search note: ${deferredQuery.trim()}` : null,
                `Additional notes: ${customRequest.notes.trim()}`,
            ].filter(Boolean).join('\n');

            await createSupportTicket({
                customerName: customRequest.name.trim(),
                customerEmail: customRequest.email.trim(),
                customerPhone: customRequest.phone.trim(),
                subject: `Custom jewelry request - ${detectionSummary.productType}`,
                message: summaryLines,
                category: 'product',
                priority: 'high',
                source: 'contact_form',
            });

            showToast('Custom request sent', 'success', { subMessage: 'The jewelry team now has your brief and will follow up through support.' });
            setCustomRequest((current) => ({
                ...current,
                quantity: '1',
                material: '',
                budget: '',
                deliveryDate: '',
                notes: '',
            }));
        } catch (error: any) {
            showToast('Custom request failed', 'warning', { subMessage: error?.response?.data?.message || error?.message || 'Please try again.' });
        } finally {
            setCustomSubmitting(false);
        }
    };

    const filterPanelWidth = isDesktop ? '48.6%' : '100%';

    return (
        <View className="relative overflow-hidden px-4 pb-14 pt-5" style={{ backgroundColor: AI_SEARCH_COLORS.background }}>
            <View className="absolute left-[-52px] top-12 h-44 w-44 rounded-full" style={{ backgroundColor: 'rgba(182,115,77,0.08)' }} />
            <View className="absolute right-[-86px] top-24 h-64 w-64 rounded-full" style={{ backgroundColor: 'rgba(112,133,109,0.08)' }} />

            <View className="overflow-hidden rounded-[34px]" style={AI_SEARCH_PANEL_SHADOW}>
                <LinearGradient colors={['#2b1b13', '#5a3522', '#8f6149']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View className="px-5 py-6" style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 20 }}>
                        <View style={{ flex: isDesktop ? 1.2 : undefined }}>
                            <View className="self-start rounded-full border px-4 py-2" style={{ borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.09)' }}>
                                <Text style={{ color: '#f7e8dd', fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>AI Product Identify</Text>
                            </View>

                            <Text className="mt-4 text-[38px] leading-[44px]" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.heading }}>
                                Upload a jewelry image and find matching handmade products instantly.
                            </Text>

                            <Text className="mt-4 max-w-[760px] text-[15px] leading-7" style={{ color: 'rgba(255,255,255,0.78)', fontFamily: AI_SEARCH_FONTS.body }}>
                                This page reviews your image, extracts visual cues from the Python AI service, and maps them to live handcrafted products already available in the store.
                            </Text>

                            <View className="mt-5 flex-row flex-wrap gap-3">
                                <TouchableOpacity onPress={() => void handlePickFromGallery()} className="rounded-full px-5 py-4" style={{ backgroundColor: AI_SEARCH_COLORS.white }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Upload image</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => void handleTakePhoto()} className="rounded-full border px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.22)' }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Capture with camera</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mt-5 flex-row flex-wrap gap-3">
                                <InfoMetric label="Formats" value="JPG, PNG, WEBP" accent={AI_SEARCH_COLORS.white} />
                                <InfoMetric label="Image limit" value="8 MB max" accent={AI_SEARCH_COLORS.white} />
                                <InfoMetric label="AI status" value={aiStatusLabel} accent={AI_SEARCH_COLORS.white} />
                            </View>

                            <View className="mt-5 rounded-[24px] border px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Optional search note</Text>
                                <TextInput
                                    value={query}
                                    onChangeText={(value) => {
                                        setQuery(value);
                                        setHasEngaged(Boolean(value.trim()) || Boolean(selectedImageUri));
                                    }}
                                    placeholder="Example: minimal gold ring with a hammered finish"
                                    placeholderTextColor="rgba(255,255,255,0.42)"
                                    className="mt-3"
                                    style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 15 }}
                                />
                            </View>
                        </View>

                        <View style={{ width: isDesktop ? 360 : '100%' }}>
                            <View className="overflow-hidden rounded-[30px] border p-4" style={{ borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.09)' }}>
                                <View className="flex-row items-center justify-between">
                                    <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>Live AI preview</Text>
                                    <View className="rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                                        <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>{aiStatus?.model || 'MobileNetV2'}</Text>
                                    </View>
                                </View>

                                <View className="mt-4 overflow-hidden rounded-[26px]" style={{ height: 280, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                                    {selectedImageUri ? (
                                        <Image source={{ uri: selectedImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    ) : (
                                        <View className="flex-1 items-center justify-center px-8">
                                            <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                                                <Feather name="cpu" size={34} color={AI_SEARCH_COLORS.white} />
                                            </View>
                                            <Text className="mt-5 text-center text-[22px] leading-8" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.heading }}>
                                                Your upload preview appears here.
                                            </Text>
                                            <Text className="mt-3 text-center text-[14px] leading-7" style={{ color: 'rgba(255,255,255,0.72)', fontFamily: AI_SEARCH_FONTS.body }}>
                                                Use a clear close-up with good lighting so the model can focus on silhouette, finish, and handmade texture.
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View className="mt-4 flex-row flex-wrap gap-3">
                                    <InfoMetric label="Indexed" value={`${indexedCount}/${indexedTotal || 0}`} accent={AI_SEARCH_COLORS.white} />
                                    <InfoMetric label="Coverage" value={`${indexedCoverage}% ready`} accent={AI_SEARCH_COLORS.white} />
                                    <InfoMetric label="Pending" value={`${pendingCount}`} accent={AI_SEARCH_COLORS.white} />
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.panel }}>
                <SectionHeader
                    eyebrow="Image upload"
                    title="Upload, drop, or capture your jewelry reference"
                    description="The AI is optimized for a single jewelry item with a clean frame. Upload from your device, drag and drop on web, or take a fresh photo."
                />

                <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 20 }}>
                    <View style={{ flex: 1.2 }}>
                        <View
                            {...webDropZoneProps}
                            className="items-center rounded-[28px] border border-dashed px-6 py-10"
                            style={{
                                borderColor: isDraggingFile ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line,
                                backgroundColor: isDraggingFile ? '#f8efe7' : '#fffdfb',
                            }}
                        >
                            <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#f4e7db' }}>
                                <Feather name="upload-cloud" size={28} color={AI_SEARCH_COLORS.espresso} />
                            </View>
                            <Text className="mt-4 text-center text-[26px] leading-[32px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                {Platform.OS === 'web' ? 'Drag and drop your image here' : 'Tap to choose an image from your gallery'}
                            </Text>
                            <Text className="mt-3 max-w-[520px] text-center text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                Supported formats: JPG, PNG, WEBP. Maximum file size: 8 MB. Tip: use a clear image with good lighting.
                            </Text>

                            <View className="mt-5 flex-row flex-wrap justify-center gap-3">
                                <TouchableOpacity onPress={() => void handlePickFromGallery()} className="rounded-full px-5 py-4" style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Browse gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => void handleTakePhoto()} className="rounded-full border px-5 py-4" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Use camera</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mt-6 w-full rounded-full" style={{ height: 10, backgroundColor: '#ecdfd1' }}>
                                <View style={{ width: `${Math.min(uploadProgress, 100)}%`, height: '100%', borderRadius: 999, backgroundColor: previewTooLarge ? AI_SEARCH_COLORS.red : AI_SEARCH_COLORS.sage }} />
                            </View>
                            <Text className="mt-3 text-[12px]" style={{ color: previewTooLarge ? AI_SEARCH_COLORS.red : AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                {selectedUpload
                                    ? `${selectedUpload.name} ready • ${formatFileSize(selectedUpload.size)}`
                                    : 'Upload progress will appear here while the file is processed.'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ width: isDesktop ? 330 : '100%', gap: 16 }}>
                        <View className="rounded-[26px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Upload tip</Text>
                            <Text className="mt-2 text-[24px] leading-[30px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                Use a clear image with good lighting.
                            </Text>
                            <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                Strong frontal lighting and a plain background make the AI more confident about type, material, and finish.
                            </Text>
                        </View>

                        <View className="rounded-[26px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Example images</Text>
                            <View className="mt-4 flex-row gap-3">
                                {trendingProducts.slice(0, 3).map((product) => (
                                    <View key={`${product._id}-example`} className="flex-1 overflow-hidden rounded-[18px]" style={{ height: 104 }}>
                                        <Image source={{ uri: getAiSearchProductImage(product) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    </View>
                                ))}
                            </View>
                            <Text className="mt-3 text-[12px] leading-6" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                Close-up, centered shots work best. Avoid group photos or lifestyle scenes when you want an exact product match.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {selectedUpload ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                    <SectionHeader
                        eyebrow="Preview and edit"
                        title="Review the uploaded image before analysis"
                        description="Crop the jewelry into focus, rotate the frame if needed, remove it, or send it to the AI for identification."
                    />

                    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 20 }}>
                        <View className="overflow-hidden rounded-[28px]" style={{ flex: 1, minHeight: 320, backgroundColor: '#f4e7db' }}>
                            <Image source={{ uri: selectedUpload.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>

                        <View style={{ width: isDesktop ? 340 : '100%' }}>
                            <View className="rounded-[24px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                                <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Image details</Text>
                                <Text className="mt-2 text-[26px] leading-[32px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    {selectedUpload.name}
                                </Text>
                                <Text className="mt-2 text-[13px] leading-6" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                    {selectedUpload.mimeType.toUpperCase()} • {formatFileSize(selectedUpload.size)} • Source: {selectedUpload.source}
                                </Text>

                                {previewTooLarge ? (
                                    <View className="mt-4 rounded-[18px] border px-4 py-4" style={{ borderColor: '#f2b9ae', backgroundColor: '#fff4f1' }}>
                                        <Text style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                                            This file is larger than 8 MB. Please choose a smaller image before analysis.
                                        </Text>
                                    </View>
                                ) : null}

                                <View className="mt-5 flex-row flex-wrap gap-3">
                                    <FilterChip label="Crop" icon="crop" active={false} onPress={() => void handleCropImage()} />
                                    <FilterChip label="Rotate" icon="rotate-cw" active={false} onPress={() => void handleRotateImage()} />
                                    <FilterChip label="Remove" icon="trash-2" active={false} onPress={() => applyUpload(null)} />
                                </View>

                                <TouchableOpacity
                                    onPress={() => void handleSubmitSearch()}
                                    disabled={visualLoading || editingImage || previewTooLarge}
                                    className="mt-5 rounded-full px-5 py-4"
                                    style={{ backgroundColor: visualLoading || editingImage || previewTooLarge ? '#d5c7bc' : AI_SEARCH_COLORS.espresso }}
                                >
                                    <Text className="text-center" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>
                                        {visualLoading ? 'Analyzing...' : editingImage ? 'Updating preview...' : 'Analyze product'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            ) : null}

            {visualLoading ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                    <SectionHeader
                        eyebrow="AI analyzing"
                        title="Identifying jewelry type, material, color, and design..."
                        description="The uploaded image is being embedded, compared to indexed products, and organized into a cleaner result set."
                    />

                    <View className="rounded-[26px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                        <View className="flex-row items-center gap-3">
                            <ActivityIndicator color={AI_SEARCH_COLORS.espresso} size="large" />
                            <View className="flex-1">
                                <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading, fontSize: 24 }}>AI analysis in progress</Text>
                                <Text className="mt-2 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                    {ANALYSIS_STEPS[Math.min(analysisStepIndex, ANALYSIS_STEPS.length - 1)]}
                                </Text>
                            </View>
                        </View>

                        <View className="mt-5 rounded-full" style={{ height: 10, backgroundColor: '#ecdfd1' }}>
                            <View style={{ width: `${((analysisStepIndex + 1) / ANALYSIS_STEPS.length) * 100}%`, height: '100%', borderRadius: 999, backgroundColor: AI_SEARCH_COLORS.gold }} />
                        </View>

                        <View className="mt-5 gap-3">
                            {ANALYSIS_STEPS.map((step, index) => {
                                const complete = analysisStepIndex > index;
                                const active = analysisStepIndex === index;

                                return (
                                    <View key={step} className="flex-row items-center justify-between rounded-[18px] border px-4 py-4" style={{ borderColor: active ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line, backgroundColor: active ? '#f8efe7' : '#fffdfb' }}>
                                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>{step}</Text>
                                        <Feather name={complete ? 'check-circle' : active ? 'loader' : 'circle'} size={16} color={complete ? AI_SEARCH_COLORS.sage : active ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.muted} />
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            ) : null}

            {visualError ? (
                <View className="mt-7 rounded-[24px] border px-5 py-5" style={{ borderColor: '#f2b9ae', backgroundColor: '#fff4f1' }}>
                    <View className="flex-row items-start gap-3">
                        <Feather name="alert-circle" size={18} color={AI_SEARCH_COLORS.red} />
                        <Text className="flex-1 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body }}>{visualError}</Text>
                    </View>
                </View>
            ) : null}

            {(visualMatches.length > 0 || (hasEngaged && selectedImageUri)) ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                    <SectionHeader
                        eyebrow="Detection summary"
                        title="What the AI sees in your upload"
                        description="The summary below is built from the strongest visual matches and the material, color, and style cues found in the indexed product catalog."
                    />

                    <View className="flex-row flex-wrap gap-4">
                        <InfoMetric label="Product type" value={detectionSummary.productType} />
                        <InfoMetric label="Material" value={detectionSummary.material} />
                        <InfoMetric label="Color" value={detectionSummary.color} />
                        <InfoMetric label="Style" value={detectionSummary.style} />
                        <InfoMetric label="Confidence" value={detectionSummary.confidence} accent={AI_SEARCH_COLORS.sage} />
                        <InfoMetric label="Handmade type" value={detectionSummary.handmadeType} />
                    </View>
                </View>
            ) : null}

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.panel }}>
                <SectionHeader
                    eyebrow="Refine results"
                    title="Tune the matching catalog by product and craft details"
                    description="Refine the result set by category, price, material, color, occasion, handmade type, and availability."
                    action={
                        <TouchableOpacity onPress={() => setFilters(INITIAL_FILTERS)} className="rounded-full border px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Reset filters</Text>
                        </TouchableOpacity>
                    }
                />

                <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16, flexWrap: 'wrap' }}>
                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Category</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {categoryOptions.slice(0, 6).map((value) => (
                                <FilterChip key={value} label={value} active={filters.categories.includes(value)} onPress={() => setFilters((current) => ({ ...current, categories: toggleValue(current.categories, value) }))} />
                            ))}
                        </View>
                    </View>

                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Price range</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {AI_PRICE_OPTIONS.map((option) => (
                                <FilterChip key={option.id} label={option.label} active={filters.priceRange === option.id} onPress={() => setFilters((current) => ({ ...current, priceRange: option.id }))} />
                            ))}
                        </View>
                    </View>

                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Material</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {materialOptions.slice(0, 6).map((value) => (
                                <FilterChip key={value} label={value} active={filters.materials.includes(value)} onPress={() => setFilters((current) => ({ ...current, materials: toggleValue(current.materials, value) }))} />
                            ))}
                        </View>
                    </View>

                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Color</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {colorOptions.slice(0, 6).map((value) => (
                                <FilterChip key={value} label={value} active={filters.colors.includes(value)} onPress={() => setFilters((current) => ({ ...current, colors: toggleValue(current.colors, value) }))} />
                            ))}
                        </View>
                    </View>

                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Occasion</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {occasionOptions.slice(0, 6).map((value) => (
                                <FilterChip key={value} label={value} active={filters.occasions.includes(value)} onPress={() => setFilters((current) => ({ ...current, occasions: toggleValue(current.occasions, value) }))} />
                            ))}
                        </View>
                    </View>

                    <View style={{ width: filterPanelWidth }}>
                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Handmade type</Text>
                        <View className="mt-3 flex-row flex-wrap gap-3">
                            {handmadeOptions.slice(0, 6).map((value) => (
                                <FilterChip key={value} label={value} active={filters.handmadeTypes.includes(value)} onPress={() => setFilters((current) => ({ ...current, handmadeTypes: toggleValue(current.handmadeTypes, value) }))} />
                            ))}
                        </View>
                    </View>
                </View>

                <View className="mt-5 flex-row flex-wrap gap-3">
                    <FilterChip label="Only in stock" icon="package" active={filters.onlyInStock} onPress={() => setFilters((current) => ({ ...current, onlyInStock: !current.onlyInStock }))} />
                    <FilterChip label="On sale" icon="tag" active={filters.onlyDiscounted} onPress={() => setFilters((current) => ({ ...current, onlyDiscounted: !current.onlyDiscounted }))} />
                    <FilterChip label={`Sort: ${SORT_OPTIONS.find((option) => option.id === sortBy)?.label || 'Recommended'}`} icon="sliders" active onPress={handleCycleSort} />
                </View>
            </View>

            <View className="mt-7">
                <SectionHeader
                    eyebrow="Matching products"
                    title={matchingProducts.length ? 'Closest handmade matches' : 'Awaiting visual matches'}
                    description={matchingProducts.length
                        ? `Showing ${matchingProducts.length} products shaped by your uploaded image, active filters, and live catalog availability${visualSearchTime ? ` in ${visualSearchTime}s` : ''}.`
                        : 'Upload and analyze a jewelry image to populate this result grid.'}
                />

                {(catalogLoading || catalogError) ? (
                    <View className="rounded-[24px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                        {catalogLoading ? (
                            <View className="flex-row items-center gap-3">
                                <ActivityIndicator color={AI_SEARCH_COLORS.espresso} />
                                <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}>Loading AI-ready catalog...</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-start gap-3">
                                <Feather name="alert-circle" size={18} color={AI_SEARCH_COLORS.red} />
                                <Text className="flex-1 leading-6" style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body }}>{catalogError}</Text>
                            </View>
                        )}
                    </View>
                ) : matchingProducts.length ? (
                    <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                        {matchingProducts.map((product, index) => {
                            const visualMatch = visualMatches.find((entry) => entry.product._id === product._id);
                            const accentValue = visualMatch
                                ? `${Math.round(visualMatch.score * 100)}% · ${getAiVisualMatchLabel(visualMatch.score)}`
                                : index === 0
                                    ? 'Best match in current set'
                                    : 'Refined by current filters';

                            return (
                                <View key={product._id} style={{ width: cardWidth }}>
                                    <AISearchProductCard
                                        product={product}
                                        onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                        onQuickView={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                        onAddToCart={() => void handleAddToCart(product)}
                                        isWishlisted={isInWishlist(product._id)}
                                        accentLabel={index === 0 ? 'Best match' : 'AI match'}
                                        accentValue={accentValue}
                                    />
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="rounded-[28px] border px-6 py-6" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                        <Text className="text-[28px] leading-[36px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            Start with an upload to see product matches.
                        </Text>
                        <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            The catalog is ready to respond once you upload a jewelry image and run analysis.
                        </Text>
                    </View>
                )}
            </View>

            {noResults ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                    <SectionHeader
                        eyebrow="Not found?"
                        title="We could not find an exact match."
                        description="Use the fallback actions below to keep momentum: review similar products, send a custom brief, or contact the jewelry team."
                    />

                    <View className="flex-row flex-wrap gap-3">
                        <TouchableOpacity onPress={handlePrepareCustomRequest} className="rounded-full px-5 py-4" style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}>
                            <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Custom order request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/contact')} className="rounded-full border px-5 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                            <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>Contact seller team</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNotifyMe} className="rounded-full border px-5 py-4" style={{ borderColor: notifyRequested ? AI_SEARCH_COLORS.sage : AI_SEARCH_COLORS.line, backgroundColor: notifyRequested ? '#eef5ee' : '#fffaf6' }}>
                            <Text style={{ color: notifyRequested ? AI_SEARCH_COLORS.sage : AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>
                                {notifyRequested ? 'Notify me requested' : 'Notify me when available'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {recommendations.length ? (
                        <View className="mt-6 flex-row flex-wrap" style={{ gap: 16 }}>
                            {recommendations.slice(0, 3).map((product) => (
                                <View key={`${product._id}-fallback`} style={{ width: cardWidth }}>
                                    <AISearchProductCard
                                        product={product}
                                        onPress={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                        onQuickView={() => router.push({ pathname: '/product-single', params: { id: product._id } } as never)}
                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                        onAddToCart={() => void handleAddToCart(product)}
                                        isWishlisted={isInWishlist(product._id)}
                                        accentLabel="Similar"
                                        accentValue="Closest handcrafted alternative"
                                    />
                                </View>
                            ))}
                        </View>
                    ) : null}
                </View>
            ) : null}

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: highlightCustomRequest ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                <SectionHeader
                    eyebrow="Custom jewelry request"
                    title="Send the artisans a richer design brief"
                    description="Your uploaded image and AI summary frame the request. Add quantity, preferred material, budget, delivery target, and any finishing notes before submitting."
                />

                <View className="rounded-[24px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                    <View className="flex-row flex-wrap gap-4">
                        <InfoMetric label="Reference image" value={selectedUpload?.name || 'Waiting for upload'} accent={selectedUpload ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.muted} />
                        <InfoMetric label="Detected type" value={detectionSummary.productType} />
                        <InfoMetric label="AI confidence" value={detectionSummary.confidence} accent={AI_SEARCH_COLORS.sage} />
                    </View>

                    <View className="mt-6 flex-row flex-wrap justify-between gap-y-4">
                        <FieldCard
                            label="Full name"
                            icon="user"
                            value={customRequest.name}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, name: value }))}
                            placeholder="Your name"
                            focused={focusedField === 'name'}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField('')}
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Email address"
                            icon="mail"
                            value={customRequest.email}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, email: value }))}
                            placeholder="you@example.com"
                            focused={focusedField === 'email'}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            keyboardType="email-address"
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Phone number"
                            icon="phone"
                            value={customRequest.phone}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, phone: value }))}
                            placeholder="Optional"
                            focused={focusedField === 'phone'}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField('')}
                            keyboardType="phone-pad"
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Required quantity"
                            icon="hash"
                            value={customRequest.quantity}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, quantity: value }))}
                            placeholder="1"
                            focused={focusedField === 'quantity'}
                            onFocus={() => setFocusedField('quantity')}
                            onBlur={() => setFocusedField('')}
                            keyboardType="numeric"
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Preferred material"
                            icon="layers"
                            value={customRequest.material}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, material: value }))}
                            placeholder="Gold plated, silver, beads, clay..."
                            focused={focusedField === 'material'}
                            onFocus={() => setFocusedField('material')}
                            onBlur={() => setFocusedField('')}
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Budget"
                            icon="dollar-sign"
                            value={customRequest.budget}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, budget: value }))}
                            placeholder="Example: Under $250"
                            focused={focusedField === 'budget'}
                            onFocus={() => setFocusedField('budget')}
                            onBlur={() => setFocusedField('')}
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Delivery date"
                            icon="calendar"
                            value={customRequest.deliveryDate}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, deliveryDate: value }))}
                            placeholder="YYYY-MM-DD"
                            focused={focusedField === 'deliveryDate'}
                            onFocus={() => setFocusedField('deliveryDate')}
                            onBlur={() => setFocusedField('')}
                            width={isDesktop ? '48.5%' : '100%'}
                        />
                        <FieldCard
                            label="Additional notes"
                            icon="edit-3"
                            value={customRequest.notes}
                            onChangeText={(value) => setCustomRequest((current) => ({ ...current, notes: value }))}
                            placeholder="Describe gemstones, clasp preference, engravings, finish, sizing, or delivery constraints."
                            focused={focusedField === 'notes'}
                            onFocus={() => setFocusedField('notes')}
                            onBlur={() => setFocusedField('')}
                            multiline
                            width="100%"
                        />
                    </View>

                    <TouchableOpacity onPress={() => void handleSubmitCustomRequest()} disabled={customSubmitting} className="mt-6 rounded-full px-5 py-4" style={{ backgroundColor: customSubmitting ? '#d5c7bc' : AI_SEARCH_COLORS.espresso }}>
                        <Text className="text-center" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 14 }}>
                            {customSubmitting ? 'Submitting custom request...' : 'Submit custom request'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {recentScans.length ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.panel }}>
                    <SectionHeader
                        eyebrow="Recently scanned"
                        title="Previous AI identify sessions"
                        description="Jump back into your recent jewelry scans, review the detected category, and rerun a matching flow when the source image is still available on this device."
                    />

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-4 pr-4">
                            {recentScans.map((scan) => (
                                <View key={scan.id} className="w-[280px] overflow-hidden rounded-[24px] border" style={[{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }, AI_SEARCH_CARD_SHADOW]}>
                                    <View className="h-[170px] overflow-hidden" style={{ backgroundColor: '#f4e7db' }}>
                                        {scan.imageUri || scan.fallbackImage ? (
                                            <Image source={{ uri: scan.imageUri || scan.fallbackImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Feather name="image" size={28} color={AI_SEARCH_COLORS.muted} />
                                            </View>
                                        )}
                                    </View>

                                    <View className="p-4">
                                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>{new Date(scan.createdAt).toLocaleDateString()}</Text>
                                        <Text className="mt-2 text-[22px] leading-[28px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                            {scan.detectedCategory}
                                        </Text>
                                        <Text className="mt-2 text-[13px] leading-6" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                            {scan.matchCount} matched products • {scan.topProductName || 'No lead product saved'}
                                        </Text>

                                        <TouchableOpacity onPress={() => handleRestoreScan(scan)} className="mt-4 rounded-full border px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                                            <Text className="text-center" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>Re-analyze</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            ) : null}

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                <SectionHeader
                    eyebrow="AI tips"
                    title="How to get cleaner visual matches"
                    description="A few capture habits make a noticeable difference in category detection, material confidence, and the quality of product recommendations."
                />

                <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                    {AI_TIPS.map((tip) => (
                        <View key={tip.title} className="rounded-[24px] border px-5 py-5" style={{ width: isDesktop ? '31.9%' : isTablet ? '48.2%' : '100%', borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffaf6' }}>
                            <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#f4e7db' }}>
                                <Feather name={tip.icon as keyof typeof Feather.glyphMap} size={20} color={AI_SEARCH_COLORS.espresso} />
                            </View>
                            <Text className="mt-4 text-[24px] leading-[30px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                {tip.title}
                            </Text>
                            <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                {tip.description}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: AI_SEARCH_COLORS.panel }}>
                <SectionHeader
                    eyebrow="FAQ"
                    title="Questions customers usually ask before uploading"
                    description="These answers explain what the AI is doing, where the results come from, and what to do if the exact product is not available."
                />

                <View className="gap-4">
                    {FAQ_ITEMS.map((item) => (
                        <FAQCard key={item.id} question={item.question} answer={item.answer} />
                    ))}
                </View>
            </View>

            <View className="mt-7 rounded-[24px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#fffdfb' }}>
                <View className="flex-row flex-wrap items-start justify-between gap-4">
                    <View className="min-w-[220px] flex-1">
                        <Text style={{ color: AI_SEARCH_COLORS.clay, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>AI system briefing</Text>
                        <Text className="mt-2 text-[28px] leading-[34px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            {aiStatusLabel}
                        </Text>
                        <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            {aiStatusMessage}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => void handleRefreshAiStatus(true)} disabled={aiStatusLoading || aiStatusRefreshing} className="rounded-full px-4 py-3" style={{ backgroundColor: AI_SEARCH_COLORS.ink }}>
                        <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                            {aiStatusRefreshing ? 'Refreshing...' : 'Refresh AI status'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-5 flex-row flex-wrap gap-3">
                    <InfoMetric label="Vision model" value={aiStatus?.model || 'MobileNetV2'} />
                    <InfoMetric label="Embeddings" value={aiStatus?.feature_vector_size ? `${aiStatus.feature_vector_size} dimensions` : '1280 dimensions'} />
                    <InfoMetric label="Catalog total" value={`${indexedTotal || 0}`} />
                    <InfoMetric label="Indexed products" value={`${indexedCount}/${indexedTotal || 0}`} />
                    <InfoMetric label="Pending index" value={`${pendingCount}`} />
                    <InfoMetric label="Products with images" value={`${imagesReadyCount}`} />
                </View>
            </View>
        </View>
    );
}