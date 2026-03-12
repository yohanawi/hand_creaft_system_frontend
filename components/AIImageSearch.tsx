/**
 * AIImageSearch Component
 *
 * Lets the user pick an image (gallery or camera) and displays AI-powered
 * visually similar product results from the backend.
 *
 * Used inside: app/ai-search.tsx
 */

import api from "@/services/api";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Design Tokens (consistent with the rest of the app) ─────────────────────
const C = {
    primary: "#7C4A1E",
    primaryLight: "#A0622A",
    primaryDark: "#4E2D0E",
    accent: "#D4956A",
    accentLight: "#F0C9A8",
    cream: "#FAF6F0",
    parchment: "#F2EBE0",
    ink: "#2C1A0E",
    muted: "#9B7B6A",
    border: "#E0D0C0",
    white: "#FFFFFF",
    green: "#16A085",
    red: "#C0392B",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SimilarProduct = {
    product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        salePrice?: number;
        currency: string;
        thumbnailImage?: string;
        images?: string[];
        category?: { name: string };
        material?: string;
        color?: string;
        availabilityStatus: string;
    };
    score: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getImageUri(product: SimilarProduct["product"]): string {
    if (product.thumbnailImage) return product.thumbnailImage;
    if (product.images && product.images.length > 0) return product.images[0];
    return "https://via.placeholder.com/300x300?text=No+Image";
}

function formatPrice(
    price: number,
    salePrice?: number,
    currency = "USD"
): string {
    const symbol = currency === "USD" ? "$" : currency;
    const display = salePrice && salePrice < price ? salePrice : price;
    return `${symbol}${display.toFixed(2)}`;
}

function similarityLabel(score: number): { label: string; color: string } {
    if (score >= 0.8) return { label: "Excellent match", color: C.green };
    if (score >= 0.6) return { label: "Good match", color: C.primaryLight };
    if (score >= 0.4) return { label: "Possible match", color: C.accent };
    return { label: "Low match", color: C.muted };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIImageSearch() {
    const router = useRouter();
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SimilarProduct[]>([]);
    const [searchDone, setSearchDone] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchTime, setSearchTime] = useState<number | null>(null);

    // ── Image Picker ──────────────────────────────────────────────────────────
    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "Please allow access to your photo library to use this feature."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.85,
            allowsMultipleSelection: false,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            setSelectedImageUri(asset.uri);
            setResults([]);
            setSearchDone(false);
            setErrorMsg(null);
            setSearchTime(null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "Please allow camera access to use this feature."
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.85,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            setSelectedImageUri(asset.uri);
            setResults([]);
            setSearchDone(false);
            setErrorMsg(null);
            setSearchTime(null);
        }
    };

    // ── AI Search ─────────────────────────────────────────────────────────────
    const performSearch = async () => {
        if (!selectedImageUri) {
            Alert.alert("No image", "Please select or take a photo first.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setResults([]);
        setSearchDone(false);
        const startTime = Date.now();

        try {
            // Build multipart/form-data
            const formData = new FormData();

            // Derive filename and mime type from URI
            const uriParts = selectedImageUri.split(".");
            const ext = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
            const mimeType = ext === "png" ? "image/png" : "image/jpeg";

            formData.append("image", {
                uri: selectedImageUri,
                name: `search.${ext}`,
                type: mimeType,
            } as any);

            const response = await api.post("/ai-search/search", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 60000, // allow up to 60 s for slow connections / model cold start
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            setSearchTime(parseFloat(elapsed));
            setResults(response.data.results || []);
            setSearchDone(true);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "An error occurred. Please try again.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: C.cream }}>
            <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

            {/* ── Header ────────────────────────────────────────────────────────── */}
            <View
                style={{
                    backgroundColor: C.primaryDark,
                    paddingTop: 50,
                    paddingBottom: 20,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Feather name="arrow-left" size={20} color={C.white} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: C.white,
                            fontSize: 20,
                            fontWeight: "700",
                            letterSpacing: 0.3,
                        }}
                    >
                        AI Image Search
                    </Text>
                    <Text style={{ color: C.accentLight, fontSize: 12, marginTop: 2 }}>
                        Upload a photo to find visually similar jewelries
                    </Text>
                </View>

                {/* AI badge */}
                <View
                    style={{
                        backgroundColor: C.accent,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: C.white, fontSize: 11, fontWeight: "700" }}>
                        CNN
                    </Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Upload Area ───────────────────────────────────────────────────  */}
                <View
                    style={{
                        backgroundColor: C.white,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: selectedImageUri ? C.accent : C.border,
                        borderStyle: selectedImageUri ? "solid" : "dashed",
                        overflow: "hidden",
                        marginBottom: 16,
                        minHeight: 220,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {selectedImageUri ? (
                        <View style={{ width: "100%" }}>
                            <Image
                                source={{ uri: selectedImageUri }}
                                style={{ width: "100%", height: 260 }}
                                resizeMode="cover"
                            />
                            {/* Change image overlay button */}
                            <TouchableOpacity
                                onPress={pickFromGallery}
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    backgroundColor: "rgba(0,0,0,0.55)",
                                    padding: 8,
                                    borderRadius: 20,
                                }}
                            >
                                <Feather name="edit-2" size={16} color={C.white} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ alignItems: "center", padding: 30 }}>
                            <MaterialCommunityIcons
                                name="camera-plus-outline"
                                size={56}
                                color={C.muted}
                            />
                            <Text
                                style={{
                                    color: C.ink,
                                    fontSize: 16,
                                    fontWeight: "600",
                                    marginTop: 12,
                                }}
                            >
                                Upload a Jewelry Photo
                            </Text>
                            <Text
                                style={{
                                    color: C.muted,
                                    fontSize: 13,
                                    textAlign: "center",
                                    marginTop: 6,
                                    lineHeight: 20,
                                }}
                            >
                                Our CNN model will extract visual features and find the most
                                similar items in the store
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Action Buttons ────────────────────────────────────────────────── */}
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={pickFromGallery}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            backgroundColor: C.parchment,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: C.border,
                            paddingVertical: 12,
                        }}
                    >
                        <Feather name="image" size={18} color={C.primary} />
                        <Text
                            style={{ color: C.primary, fontWeight: "600", fontSize: 14 }}
                        >
                            Gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={takePhoto}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            backgroundColor: C.parchment,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: C.border,
                            paddingVertical: 12,
                        }}
                    >
                        <Feather name="camera" size={18} color={C.primary} />
                        <Text
                            style={{ color: C.primary, fontWeight: "600", fontSize: 14 }}
                        >
                            Camera
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Search Button ─────────────────────────────────────────────────── */}
                <TouchableOpacity
                    onPress={performSearch}
                    disabled={!selectedImageUri || loading}
                    style={{
                        backgroundColor:
                            !selectedImageUri || loading ? C.border : C.primary,
                        borderRadius: 14,
                        paddingVertical: 15,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        marginBottom: 24,
                    }}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator color={C.white} size="small" />
                            <Text
                                style={{ color: C.white, fontWeight: "700", fontSize: 16 }}
                            >
                                Analyzing Image...
                            </Text>
                        </>
                    ) : (
                        <>
                            <MaterialCommunityIcons
                                name="brain"
                                size={20}
                                color={selectedImageUri ? C.white : C.muted}
                            />
                            <Text
                                style={{
                                    color: selectedImageUri ? C.white : C.muted,
                                    fontWeight: "700",
                                    fontSize: 16,
                                }}
                            >
                                Find Similar Products
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* ── Loading State ─────────────────────────────────────────────────── */}
                {loading && (
                    <View
                        style={{
                            backgroundColor: C.white,
                            borderRadius: 14,
                            padding: 24,
                            alignItems: "center",
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <ActivityIndicator size="large" color={C.primary} />
                        <Text
                            style={{
                                color: C.ink,
                                fontWeight: "600",
                                marginTop: 14,
                                fontSize: 15,
                            }}
                        >
                            Extracting visual features...
                        </Text>
                        <Text
                            style={{ color: C.muted, fontSize: 13, marginTop: 6, textAlign: "center" }}
                        >
                            MobileNetV2 CNN is analyzing your image.{"\n"}This may take up to
                            15 seconds.
                        </Text>
                    </View>
                )}

                {/* ── Error State ───────────────────────────────────────────────────── */}
                {errorMsg && !loading && (
                    <View
                        style={{
                            backgroundColor: "#FEF2F2",
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#FCA5A5",
                            marginBottom: 20,
                            flexDirection: "row",
                            gap: 10,
                        }}
                    >
                        <Feather name="alert-circle" size={20} color={C.red} />
                        <Text style={{ color: C.red, flex: 1, fontSize: 14, lineHeight: 20 }}>
                            {errorMsg}
                        </Text>
                    </View>
                )}

                {/* ── Results ───────────────────────────────────────────────────────── */}
                {searchDone && !loading && (
                    <>
                        {/* Results header */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 14,
                            }}
                        >
                            <Text
                                style={{ color: C.ink, fontSize: 17, fontWeight: "700" }}
                            >
                                {results.length > 0
                                    ? `${results.length} Similar Product${results.length !== 1 ? "s" : ""} Found`
                                    : "No Similar Products Found"}
                            </Text>
                            {searchTime !== null && (
                                <Text style={{ color: C.muted, fontSize: 12 }}>
                                    {searchTime}s
                                </Text>
                            )}
                        </View>

                        {results.length === 0 && (
                            <View
                                style={{
                                    backgroundColor: C.white,
                                    borderRadius: 14,
                                    padding: 28,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <Feather name="search" size={44} color={C.muted} />
                                <Text
                                    style={{
                                        color: C.ink,
                                        fontSize: 16,
                                        fontWeight: "600",
                                        marginTop: 14,
                                    }}
                                >
                                    No Close Matches
                                </Text>
                                <Text
                                    style={{
                                        color: C.muted,
                                        fontSize: 13,
                                        textAlign: "center",
                                        marginTop: 6,
                                        lineHeight: 20,
                                    }}
                                >
                                    Try a different image or browse the shop manually.
                                </Text>
                            </View>
                        )}

                        {/* Product Cards */}
                        {results.map(({ product, score }) => {
                            const imgUri = getImageUri(product);
                            const priceStr = formatPrice(
                                product.price,
                                product.salePrice,
                                product.currency
                            );
                            const { label, color } = similarityLabel(score);
                            const pct = Math.round(score * 100);

                            return (
                                <TouchableOpacity
                                    key={product._id}
                                    onPress={() => router.push(`/product-single?slug=${product.slug}`)}
                                    activeOpacity={0.88}
                                    style={{
                                        backgroundColor: C.white,
                                        borderRadius: 14,
                                        marginBottom: 14,
                                        borderWidth: 1,
                                        borderColor: C.border,
                                        overflow: "hidden",
                                        flexDirection: "row",
                                    }}
                                >
                                    {/* Image */}
                                    <Image
                                        source={{ uri: imgUri }}
                                        style={{ width: 100, height: 110 }}
                                        resizeMode="cover"
                                    />

                                    {/* Details */}
                                    <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
                                        <View>
                                            <Text
                                                style={{
                                                    color: C.ink,
                                                    fontSize: 14,
                                                    fontWeight: "700",
                                                    lineHeight: 20,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {product.name}
                                            </Text>

                                            {product.category && (
                                                <Text
                                                    style={{
                                                        color: C.muted,
                                                        fontSize: 12,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {product.category.name}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Price + similarity */}
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "flex-end",
                                                marginTop: 8,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: C.primary,
                                                    fontSize: 16,
                                                    fontWeight: "800",
                                                }}
                                            >
                                                {priceStr}
                                            </Text>

                                            {/* Similarity badge */}
                                            <View
                                                style={{
                                                    backgroundColor: color + "20",
                                                    borderRadius: 8,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 3,
                                                    borderWidth: 1,
                                                    borderColor: color + "50",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color,
                                                        fontSize: 11,
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {pct}% — {label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Similarity bar */}
                                        <View
                                            style={{
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: C.border,
                                                marginTop: 8,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: "100%",
                                                    width: `${pct}%`,
                                                    backgroundColor: color,
                                                    borderRadius: 2,
                                                }}
                                            />
                                        </View>
                                    </View>

                                    {/* Chevron */}
                                    <View
                                        style={{
                                            justifyContent: "center",
                                            paddingRight: 12,
                                        }}
                                    >
                                        <Feather name="chevron-right" size={18} color={C.muted} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </>
                )}

                {/* ── How It Works info card ─────────────────────────────────────── */}
                {!searchDone && !loading && (
                    <View
                        style={{
                            backgroundColor: C.white,
                            borderRadius: 14,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <Text
                            style={{
                                color: C.ink,
                                fontSize: 15,
                                fontWeight: "700",
                                marginBottom: 12,
                            }}
                        >
                            How It Works
                        </Text>

                        {[
                            {
                                icon: "upload",
                                title: "Upload a Photo",
                                desc: "Pick a jewelry image from your gallery or take a photo.",
                            },
                            {
                                icon: "cpu",
                                title: "CNN Feature Extraction",
                                desc: "MobileNetV2 extracts a 1280-dim visual feature vector.",
                            },
                            {
                                icon: "bar-chart-2",
                                title: "Cosine Similarity",
                                desc: "Your image features are compared against every product.",
                            },
                            {
                                icon: "package",
                                title: "Top Matches Returned",
                                desc: "The most visually similar jewellery items are shown.",
                            },
                        ].map((step, i) => (
                            <View
                                key={i}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    gap: 12,
                                    marginBottom: i < 3 ? 14 : 0,
                                }}
                            >
                                <View
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 17,
                                        backgroundColor: C.primaryDark,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Feather name={step.icon as any} size={15} color={C.white} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: C.ink,
                                            fontSize: 13,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {step.title}
                                    </Text>
                                    <Text
                                        style={{ color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 18 }}
                                    >
                                        {step.desc}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
