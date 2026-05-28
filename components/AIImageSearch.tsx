import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { startTransition, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

import AISearchProductCard from "@/components/AISearch/AISearchProductCard";
import { AI_SEARCH_CARD_SHADOW, AI_SEARCH_COLORS, AI_SEARCH_FONTS, AI_SEARCH_PANEL_SHADOW } from "@/components/AISearch/aiSearchTheme";
import {
    AI_PRICE_OPTIONS,
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
} from "@/components/AISearch/aiSearchUtils";
import { AuthContext } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { createSupportTicket, getAiServiceHealth, getProducts, searchProductsByImage } from "@/services/api";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const INITIAL_FILTERS: AiFilterState = {
    categories: [],
    materials: [],
    colors: [],
    styles: [],
    occasions: [],
    handmadeTypes: [],
    priceRange: "all",
    onlyInStock: true,
    onlyDiscounted: false,
};

const SORT_OPTIONS = [
    { id: "recommended", label: "Recommended" },
    { id: "top-rated", label: "Top rated" },
    { id: "price-low", label: "Price low" },
    { id: "price-high", label: "Price high" },
];

type SelectedUpload = {
    uri: string;
    name: string;
    mimeType: string;
    size?: number | null;
    file?: File | Blob | null;
    source: "gallery" | "camera" | "drop";
};

type AiSearchHealthResponse = {
    healthy: boolean;
    ready: boolean;
    model?: string;
    message?: string;
    error?: string;
    catalog?: {
        total: number;
        indexed: number;
        pending: number;
        productsWithImages: number;
        percentComplete: number;
    };
};

type AiPrediction = {
    category: string;
    confidence: number;
    top_categories?: { name?: string; category?: string; confidence: number }[];
};

function getPredictionCandidateName(item: { name?: string; category?: string }) {
    return item.name || item.category || "unknown";
}

function toggleValue(values: string[], next: string) {
    return values.includes(next) ? values.filter((value) => value !== next) : [...values, next];
}

function formatFileSize(bytes?: number | null) {
    if (!bytes) return "Ready";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

function normalizeProductPayload(payload: any): AiSearchProduct {
    const raw = payload?.product || payload?.data || payload;
    const normalizedRaw = {
        ...raw,
        thumbnailImage: raw?.thumbnailImage || raw?.image,
        category: raw?.category || null,
    };
    return normalizeAiSearchCatalog([normalizedRaw])[0] || normalizedRaw;
}

async function fetchAiSearchHealth() {
    const response = await getAiServiceHealth();
    return response.data as AiSearchHealthResponse;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return (
        <View className="mb-5">
            <Text className="uppercase tracking-[2px]" style={{ color: AI_SEARCH_COLORS.clay, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>
                {eyebrow}
            </Text>
            <Text className="mt-2 text-[28px] leading-[35px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                {title}
            </Text>
            <Text className="mt-2 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                {description}
            </Text>
        </View>
    );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="px-4 py-3 border rounded-full"
            style={{
                borderColor: active ? AI_SEARCH_COLORS.espresso : AI_SEARCH_COLORS.line,
                backgroundColor: active ? AI_SEARCH_COLORS.espresso : "#fffaf6",
            }}
        >
            <Text style={{ color: active ? AI_SEARCH_COLORS.white : AI_SEARCH_COLORS.espresso, fontSize: 13, fontFamily: AI_SEARCH_FONTS.body }}>
                {label}
            </Text>
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
    const cardWidth = isDesktop ? "31.9%" : isTablet ? "48.2%" : "100%";

    const [catalog, setCatalog] = useState<AiSearchProduct[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState<string | null>(null);

    const [aiStatus, setAiStatus] = useState<AiSearchHealthResponse | null>(null);
    const [aiRefreshing, setAiRefreshing] = useState(false);

    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);
    const [filters, setFilters] = useState<AiFilterState>(INITIAL_FILTERS);
    const [sortBy, setSortBy] = useState("recommended");

    const [selectedUpload, setSelectedUpload] = useState<SelectedUpload | null>(null);
    const [visualMatches, setVisualMatches] = useState<AiSearchVisualMatch[]>([]);
    const [visualLoading, setVisualLoading] = useState(false);
    const [visualError, setVisualError] = useState<string | null>(null);
    const [visualSearchTime, setVisualSearchTime] = useState<number | null>(null);
    const [aiPrediction, setAiPrediction] = useState<AiPrediction | null>(null);

    const [customSubmitting, setCustomSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setCatalogLoading(true);
                const response = await getProducts();
                const normalized = normalizeAiSearchCatalog(response.data);
                if (mounted) startTransition(() => setCatalog(normalized));
            } catch (error: any) {
                if (mounted) setCatalogError(error?.response?.data?.message || error?.message || "Unable to load products.");
            } finally {
                if (mounted) setCatalogLoading(false);
            }
        })();

        (async () => {
            try {
                const health = await fetchAiSearchHealth();
                if (mounted) setAiStatus(health);
            } catch (error: any) {
                if (mounted) {
                    setAiStatus({
                        healthy: false,
                        ready: false,
                        message: error?.response?.data?.message || "AI service is offline.",
                        error: error?.message,
                    });
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const categoryOptions = useMemo(
        () => Array.from(new Set(catalog.map((p) => getAiSearchCategoryName(p)).filter(Boolean))).slice(0, 6),
        [catalog],
    );

    const materialOptions = useMemo(
        () => Array.from(new Set(catalog.map((p) => p.material).filter(Boolean))) as string[],
        [catalog],
    );

    const activeIntent = useMemo(() => parseAiSearchIntent(deferredQuery, Boolean(selectedUpload)), [deferredQuery, selectedUpload]);

    const rankedResults = useMemo(() => {
        const filtered = filterAiSearchProducts(catalog, deferredQuery, filters);
        return sortAiSearchResults(filtered, sortBy);
    }, [catalog, deferredQuery, filters, sortBy]);

    const matchingProducts = visualMatches.length ? visualMatches.map((entry) => entry.product) : rankedResults.map((entry) => entry.product);

    const bestMatch = visualMatches[0];
    const aiReady = Boolean(aiStatus?.healthy && aiStatus?.ready);
    const uploadTooLarge = Boolean(selectedUpload?.size && selectedUpload.size > MAX_UPLOAD_BYTES);

    const statusLabel = !aiStatus
        ? "Checking AI"
        : aiReady
            ? "AI Ready"
            : aiStatus.healthy
                ? "Indexing Required"
                : "AI Offline";

    const statusColor = aiReady ? AI_SEARCH_COLORS.sage : aiStatus?.healthy ? AI_SEARCH_COLORS.gold : AI_SEARCH_COLORS.red;

    const applyUpload = (upload: SelectedUpload | null) => {
        setSelectedUpload(upload);
        setVisualMatches([]);
        setVisualError(null);
        setVisualSearchTime(null);
        setAiPrediction(null);
    };

    const openWebPicker = (source: "gallery" | "camera") => {
        if (Platform.OS !== "web" || typeof document === "undefined") return;

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp";
        if (source === "camera") (input as any).capture = "environment";

        input.onchange = (event: any) => {
            const file = event?.target?.files?.[0];
            if (!file) return;

            applyUpload({
                uri: URL.createObjectURL(file),
                name: file.name || "jewelry-reference.jpg",
                mimeType: file.type || "image/jpeg",
                size: file.size,
                file,
                source,
            });
        };

        input.click();
    };

    const handlePickImage = async () => {
        if (Platform.OS === "web") {
            openWebPicker("gallery");
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast("Gallery access is required.", "warning");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.95,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        applyUpload({
            uri: asset.uri,
            name: asset.fileName || "jewelry-reference.jpg",
            mimeType: asset.mimeType || "image/jpeg",
            size: asset.fileSize,
            file: null,
            source: "gallery",
        });
    };

    const handleTakePhoto = async () => {
        if (Platform.OS === "web") {
            openWebPicker("camera");
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showToast("Camera access is required.", "warning");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({ quality: 0.95 });
        if (result.canceled) return;

        const asset = result.assets[0];
        applyUpload({
            uri: asset.uri,
            name: asset.fileName || "camera-jewelry.jpg",
            mimeType: asset.mimeType || "image/jpeg",
            size: asset.fileSize,
            file: null,
            source: "camera",
        });
    };

    const appendUploadToFormData = async (formData: FormData, upload: SelectedUpload) => {
        if (upload.file) {
            formData.append("image", upload.file as any, upload.name);
            return;
        }

        if (Platform.OS === "web") {
            const response = await fetch(upload.uri);
            const blob = await response.blob();
            formData.append("image", blob as any, upload.name);
            return;
        }

        formData.append("image", {
            uri: upload.uri,
            name: upload.name,
            type: upload.mimeType,
        } as any);
    };

    const handleAnalyze = async () => {
        if (!selectedUpload && !query.trim()) {
            showToast("Upload an image or enter a search note.", "info");
            return;
        }

        if (!selectedUpload) {
            showToast("Text search applied.", "info", { subMessage: "Products are filtered using your search note." });
            return;
        }

        if (uploadTooLarge) {
            showToast("Image is too large.", "warning", { subMessage: "Use JPG, PNG, or WEBP under 8 MB." });
            return;
        }

        if (!aiStatus?.healthy || !aiStatus?.ready) {
            showToast("AI visual search is not ready.", "warning", {
                subMessage: aiStatus?.message || "Check your Python AI service and product indexing.",
            });
            return;
        }

        try {
            setVisualLoading(true);
            setVisualError(null);
            const startedAt = Date.now();

            const formData = new FormData();
            await appendUploadToFormData(formData, selectedUpload);

            const response = await searchProductsByImage(formData);
            const prediction = response.data?.prediction;
            const results = Array.isArray(response.data?.results) ? response.data.results : [];
            const productSummaries = Array.isArray(response.data?.products) ? response.data.products : [];

            const normalized = (results.length ? results : productSummaries)
                .map((entry: any) => ({
                    product: normalizeProductPayload(entry.product || entry),
                    score: typeof entry.score === "number"
                        ? entry.score
                        : typeof entry.similarity === "number"
                            ? entry.similarity
                            : 0,
                }))
                .filter((entry: AiSearchVisualMatch) => entry.product?._id);

            setVisualMatches(normalized);
            setAiPrediction(prediction?.category ? prediction : null);
            setVisualSearchTime(Number(((Date.now() - startedAt) / 1000).toFixed(1)));

            showToast(
                normalized.length ? "AI matches found" : "No exact match found",
                normalized.length ? "success" : "info",
                prediction?.category
                    ? { subMessage: `Predicted ${prediction.category} with ${Math.round((prediction.confidence || 0) * 100)}% confidence.` }
                    : undefined,
            );
        } catch (error: any) {
            setVisualError(error?.response?.data?.message || error?.message || "AI image search failed.");
            setVisualMatches([]);
            setAiPrediction(null);
        } finally {
            setVisualLoading(false);
        }
    };

    const handleRefreshAI = async () => {
        try {
            setAiRefreshing(true);
            const health = await fetchAiSearchHealth();
            setAiStatus(health);
            showToast("AI status refreshed", health.ready ? "success" : "info");
        } catch (error: any) {
            setAiStatus({ healthy: false, ready: false, message: error?.message || "AI service is offline." });
            showToast("AI status refresh failed", "warning");
        } finally {
            setAiRefreshing(false);
        }
    };

    const handleAddToCart = async (product: AiSearchProduct) => {
        await addToCart({
            product: product._id,
            name: product.name,
            thumbnailImage: getAiSearchProductImage(product),
            price: product.price,
            salePrice: typeof product.salePrice === "number" ? product.salePrice : null,
            sku: product.sku || "",
            quantity: 1,
        });

        showToast(`${product.name} added to cart`, "success", { subMessage: getAiSearchPrice(product) });
    };

    const handleToggleWishlist = (product: AiSearchProduct) => {
        const wished = isInWishlist(product._id);

        toggleItem(product._id, {
            _id: product._id,
            name: product.name,
            thumbnailImage: getAiSearchProductImage(product),
            price: product.price,
            salePrice: typeof product.salePrice === "number" ? product.salePrice : null,
            sku: product.sku,
            availabilityStatus: product.availabilityStatus,
            quantity: product.quantity,
            material: product.material,
            description: product.description,
            images: product.images,
        });

        showToast(wished ? "Removed from wishlist" : "Saved to wishlist", "wishlist");
    };

    const handleCustomRequest = async () => {
        if (!auth?.user?.email) {
            showToast("Please login before sending a custom request.", "warning");
            return;
        }

        try {
            setCustomSubmitting(true);

            await createSupportTicket({
                customerName: auth.user?.name || "Customer",
                customerEmail: auth.user.email,
                customerPhone: auth.user?.phone || "",
                subject: `Custom jewelry request - ${activeIntent.category || "AI Search"}`,
                message: [
                    "Custom request from AI Search page.",
                    selectedUpload ? `Reference image: ${selectedUpload.name}` : "Reference image: Not uploaded",
                    query.trim() ? `Customer search note: ${query.trim()}` : null,
                    bestMatch ? `Closest product: ${bestMatch.product.name}` : null,
                    bestMatch ? `AI match score: ${Math.round(bestMatch.score * 100)}%` : null,
                ].filter(Boolean).join("\n"),
                category: "product",
                priority: "high",
                source: "contact_form",
            });

            showToast("Custom request sent", "success");
        } catch (error: any) {
            showToast("Custom request failed", "warning", { subMessage: error?.response?.data?.message || error?.message });
        } finally {
            setCustomSubmitting(false);
        }
    };

    return (
        <View className="relative px-4 pt-5 overflow-hidden pb-14" style={{ backgroundColor: AI_SEARCH_COLORS.background }}>
            <View className="absolute left-[-70px] top-20 h-52 w-52 rounded-full" style={{ backgroundColor: "rgba(182,115,77,0.09)" }} />
            <View className="absolute right-[-90px] top-36 h-72 w-72 rounded-full" style={{ backgroundColor: "rgba(112,133,109,0.09)" }} />

            <LinearGradient
                colors={["#2b1b13", "#5a3522", "#9a6a4e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="overflow-hidden rounded-[34px] px-5 py-6"
                style={AI_SEARCH_PANEL_SHADOW}
            >
                <View className="flex-row flex-wrap items-center justify-between gap-6">
                    <View className="min-w-[280px] flex-1">
                        <View className="self-start px-4 py-2 border rounded-full" style={{ borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.10)" }}>
                            <Text className="uppercase tracking-[2px]" style={{ color: "#f7e8dd", fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>
                                AI jewelry finder
                            </Text>
                        </View>

                        <Text className="mt-4 text-[38px] leading-[45px]" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.heading }}>
                            Find matching handmade jewelry from an image or a simple style note.
                        </Text>

                        <Text className="mt-4 max-w-[760px] text-[15px] leading-7" style={{ color: "rgba(255,255,255,0.76)", fontFamily: AI_SEARCH_FONTS.body }}>
                            Upload a reference photo, describe the design you want, and the AI will suggest the closest products from your live handcrafted catalog.
                        </Text>

                        <View className="mt-5 rounded-[24px] border px-4 py-4" style={{ borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.09)" }}>
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Example: pearl bridal earrings, minimal gold ring, woven bead bracelet..."
                                placeholderTextColor="rgba(255,255,255,0.45)"
                                style={{ color: AI_SEARCH_COLORS.white, fontSize: 15, fontFamily: AI_SEARCH_FONTS.body }}
                            />
                        </View>

                        <View className="flex-row flex-wrap gap-3 mt-5">
                            <TouchableOpacity onPress={handlePickImage} className="px-5 py-4 rounded-full" style={{ backgroundColor: AI_SEARCH_COLORS.white }}>
                                <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body }}>Upload image</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleTakePhoto} className="px-5 py-4 border rounded-full" style={{ borderColor: "rgba(255,255,255,0.22)" }}>
                                <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body }}>Use camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAnalyze} disabled={visualLoading} className="px-5 py-4 rounded-full" style={{ backgroundColor: visualLoading ? "#bfa99a" : AI_SEARCH_COLORS.gold }}>
                                <Text style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}>
                                    {visualLoading ? "Analyzing..." : "Search with AI"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="w-full overflow-hidden rounded-[30px] border p-4 md:w-[360px]" style={{ borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.10)" }}>
                        <View className="flex-row items-center justify-between">
                            <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>Live preview</Text>
                            <TouchableOpacity onPress={handleRefreshAI} disabled={aiRefreshing} className="px-3 py-2 rounded-full" style={{ backgroundColor: statusColor }}>
                                <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>
                                    {aiRefreshing ? "Refreshing" : statusLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-4 h-[280px] overflow-hidden rounded-[26px]" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                            {selectedUpload ? (
                                <Image source={{ uri: selectedUpload.uri }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center justify-center flex-1 px-8">
                                    <Feather name="image" size={42} color={AI_SEARCH_COLORS.white} />
                                    <Text className="mt-4 text-center text-[24px] leading-8" style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.heading }}>
                                        Upload your jewelry inspiration.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {selectedUpload ? (
                            <View className="flex-row items-center justify-between gap-3 mt-4">
                                <Text className="flex-1" numberOfLines={1} style={{ color: "rgba(255,255,255,0.78)", fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    {selectedUpload.name} • {formatFileSize(selectedUpload.size)}
                                </Text>
                                <TouchableOpacity onPress={() => applyUpload(null)} className="items-center justify-center w-10 h-10 rounded-full bg-white/15">
                                    <Feather name="x" size={16} color={AI_SEARCH_COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
            </LinearGradient>

            {visualError ? (
                <View className="mt-6 rounded-[22px] border px-5 py-4" style={{ borderColor: "#f2b9ae", backgroundColor: "#fff4f1" }}>
                    <Text style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body }}>{visualError}</Text>
                </View>
            ) : null}

            <View className="mt-7 overflow-hidden rounded-[34px] border" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffdfb" }}>
                <LinearGradient colors={["#fffaf6", "#f6eadf", "#fffdfb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View className="px-5 py-6">
                        <View className="flex-row flex-wrap items-start justify-between gap-4 mb-6">
                            <View className="min-w-[240px] flex-1">
                                <View className="self-start px-4 py-2 rounded-full" style={{ backgroundColor: "#efe0d3" }}>
                                    <Text className="uppercase tracking-[2px]" style={{ color: AI_SEARCH_COLORS.clay, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>
                                        Smart refine
                                    </Text>
                                </View>

                                <Text className="mt-3 text-[30px] leading-[38px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    Shape your perfect handmade match
                                </Text>

                                <Text className="mt-2 max-w-[760px] text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                                    Choose the craft style, material, budget, and availability that match your taste.
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setFilters(INITIAL_FILTERS)}
                                className="flex-row items-center px-4 py-3 border rounded-full"
                                style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#ffffff" }}
                            >
                                <Feather name="refresh-cw" size={14} color={AI_SEARCH_COLORS.espresso} />
                                <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontSize: 13, fontFamily: AI_SEARCH_FONTS.body }}>
                                    Clear all
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                            <View className="rounded-[28px] border px-5 py-5" style={{ width: isDesktop ? "48.5%" : "100%", borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#ffffff" }}>
                                <View className="flex-row items-center gap-3 mb-4">
                                    <View className="items-center justify-center rounded-full h-11 w-11" style={{ backgroundColor: "#f4e7db" }}>
                                        <Feather name="grid" size={18} color={AI_SEARCH_COLORS.espresso} />
                                    </View>
                                    <View>
                                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontSize: 18, fontFamily: AI_SEARCH_FONTS.heading }}>Jewelry type</Text>
                                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Ring, bracelet, earrings, necklace...</Text>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-3">
                                    {categoryOptions.map((value) => (
                                        <Chip
                                            key={value}
                                            label={value}
                                            active={filters.categories.includes(value)}
                                            onPress={() => setFilters((c) => ({ ...c, categories: toggleValue(c.categories, value) }))}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View className="rounded-[28px] border px-5 py-5" style={{ width: isDesktop ? "48.5%" : "100%", borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#ffffff" }}>
                                <View className="flex-row items-center gap-3 mb-4">
                                    <View className="items-center justify-center rounded-full h-11 w-11" style={{ backgroundColor: "#f4e7db" }}>
                                        <Feather name="layers" size={18} color={AI_SEARCH_COLORS.espresso} />
                                    </View>
                                    <View>
                                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontSize: 18, fontFamily: AI_SEARCH_FONTS.heading }}>Material mood</Text>
                                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Gold, silver, pearl, beads, clay...</Text>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-3">
                                    {materialOptions.slice(0, 6).map((value) => (
                                        <Chip
                                            key={value}
                                            label={value}
                                            active={filters.materials.includes(value)}
                                            onPress={() => setFilters((c) => ({ ...c, materials: toggleValue(c.materials, value) }))}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View className="rounded-[28px] border px-5 py-5" style={{ width: isDesktop ? "48.5%" : "100%", borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#ffffff" }}>
                                <View className="flex-row items-center gap-3 mb-4">
                                    <View className="items-center justify-center rounded-full h-11 w-11" style={{ backgroundColor: "#f4e7db" }}>
                                        <Feather name="tag" size={18} color={AI_SEARCH_COLORS.espresso} />
                                    </View>
                                    <View>
                                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontSize: 18, fontFamily: AI_SEARCH_FONTS.heading }}>Budget range</Text>
                                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Find pieces inside your price comfort.</Text>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-3">
                                    {AI_PRICE_OPTIONS.map((option) => (
                                        <Chip
                                            key={option.id}
                                            label={option.label}
                                            active={filters.priceRange === option.id}
                                            onPress={() => setFilters((c) => ({ ...c, priceRange: option.id }))}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View className="rounded-[28px] border px-5 py-5" style={{ width: isDesktop ? "48.5%" : "100%", borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#ffffff" }}>
                                <View className="flex-row items-center gap-3 mb-4">
                                    <View className="items-center justify-center rounded-full h-11 w-11" style={{ backgroundColor: "#f4e7db" }}>
                                        <Feather name="sliders" size={18} color={AI_SEARCH_COLORS.espresso} />
                                    </View>
                                    <View>
                                        <Text style={{ color: AI_SEARCH_COLORS.ink, fontSize: 18, fontFamily: AI_SEARCH_FONTS.heading }}>Result preferences</Text>
                                        <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>Availability, offers, and sorting.</Text>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap gap-3">
                                    <Chip
                                        label="Only in stock"
                                        active={filters.onlyInStock}
                                        onPress={() => setFilters((c) => ({ ...c, onlyInStock: !c.onlyInStock }))}
                                    />

                                    <Chip
                                        label="On sale"
                                        active={filters.onlyDiscounted}
                                        onPress={() => setFilters((c) => ({ ...c, onlyDiscounted: !c.onlyDiscounted }))}
                                    />

                                    <Chip
                                        label={`Sort: ${SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Recommended"}`}
                                        active
                                        onPress={() => {
                                            const index = SORT_OPTIONS.findIndex((o) => o.id === sortBy);
                                            setSortBy(SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].id);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {bestMatch || aiPrediction ? (
                <View className="mt-7 rounded-[30px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffdfb" }}>
                    <SectionTitle
                        eyebrow="AI result"
                        title={bestMatch ? "Best visual match found" : "Category prediction ready"}
                        description={`The uploaded image was compared with indexed catalog products${visualSearchTime ? ` in ${visualSearchTime}s` : ""}.`}
                    />

                    <View className="flex-row flex-wrap gap-3">
                        {[
                            aiPrediction ? ["Predicted type", aiPrediction.category] : null,
                            aiPrediction ? ["Confidence", `${Math.round((aiPrediction.confidence || 0) * 100)}%`] : null,
                            bestMatch ? ["Match", `${Math.round(bestMatch.score * 100)}%`] : null,
                            bestMatch ? ["Quality", getAiVisualMatchLabel(bestMatch.score)] : null,
                            bestMatch ? ["Style", inferAiSearchStyle(bestMatch.product)] : null,
                            bestMatch ? ["Occasion", inferAiSearchOccasion(bestMatch.product)] : null,
                            bestMatch ? ["Craft", inferAiSearchHandmadeType(bestMatch.product)] : null,
                        ].filter((item): item is [string, string] => Boolean(item)).map(([label, value]) => (
                            <View key={label} className="rounded-[20px] border px-4 py-4" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffaf6" }}>
                                <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>{label}</Text>
                                <Text className="mt-1 capitalize" style={{ color: AI_SEARCH_COLORS.espresso, fontSize: 15, fontFamily: AI_SEARCH_FONTS.heading }}>{value}</Text>
                            </View>
                        ))}
                    </View>

                    {aiPrediction?.top_categories?.length ? (
                        <View className="flex-row flex-wrap gap-2 mt-4">
                            {aiPrediction.top_categories.slice(0, 4).map((item) => (
                                <View key={`${getPredictionCandidateName(item)}-${item.confidence}`} className="px-3 py-2 rounded-full" style={{ backgroundColor: "#f4e7db" }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.espresso, fontSize: 12, fontFamily: AI_SEARCH_FONTS.body }}>
                                        {getPredictionCandidateName(item)} {Math.round((item.confidence || 0) * 100)}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </View>
            ) : null}

            <View className="mt-7">
                <SectionTitle
                    eyebrow="Product matches"
                    title={matchingProducts.length ? "Closest handmade products" : "No products found yet"}
                    description={matchingProducts.length ? `${matchingProducts.length} products match your image, text, and filters.` : "Upload an image or enter a search note to start."}
                />

                {catalogLoading ? (
                    <View className="rounded-[24px] border px-5 py-5" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffdfb" }}>
                        <ActivityIndicator color={AI_SEARCH_COLORS.espresso} />
                    </View>
                ) : catalogError ? (
                    <View className="rounded-[24px] border px-5 py-5" style={{ borderColor: "#f2b9ae", backgroundColor: "#fff4f1" }}>
                        <Text style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body }}>{catalogError}</Text>
                    </View>
                ) : matchingProducts.length ? (
                    <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                        {matchingProducts.slice(0, 12).map((product, index) => {
                            const match = visualMatches.find((entry) => entry.product._id === product._id);
                            return (
                                <View key={product._id} style={{ width: cardWidth }}>
                                    <AISearchProductCard
                                        product={product}
                                        onPress={() => router.push({ pathname: "/product-single", params: { id: product._id } } as never)}
                                        onQuickView={() => router.push({ pathname: "/product-single", params: { id: product._id } } as never)}
                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                        onAddToCart={() => void handleAddToCart(product)}
                                        isWishlisted={isInWishlist(product._id)}
                                        accentLabel={index === 0 ? "Best match" : "AI match"}
                                        accentValue={match ? `${Math.round(match.score * 100)}%` : activeIntent.headline}
                                    />
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="rounded-[28px] border px-6 py-6" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffdfb" }}>
                        <Text className="text-[26px] leading-[34px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            No matching jewelry found.
                        </Text>
                        <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            Try another image, remove filters, or send a custom request to the artisan team.
                        </Text>
                    </View>
                )}
            </View>

            <View className="mt-7 rounded-[30px] border px-5 py-5" style={[{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: "#fffdfb" }, AI_SEARCH_CARD_SHADOW]}>
                <View className="flex-row flex-wrap items-center justify-between gap-4">
                    <View className="min-w-[240px] flex-1">
                        <Text className="uppercase tracking-[2px]" style={{ color: AI_SEARCH_COLORS.clay, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>
                            Custom fallback
                        </Text>
                        <Text className="mt-2 text-[28px] leading-[35px]" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                            Could not find the exact design?
                        </Text>
                        <Text className="mt-2 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            Send your image and search note to the jewelry team as a custom product request.
                        </Text>
                    </View>

                    <TouchableOpacity onPress={handleCustomRequest} disabled={customSubmitting} className="px-5 py-4 rounded-full" style={{ backgroundColor: customSubmitting ? "#d5c7bc" : AI_SEARCH_COLORS.espresso }}>
                        <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body }}>
                            {customSubmitting ? "Sending..." : "Request custom design"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
