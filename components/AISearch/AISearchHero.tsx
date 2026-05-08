import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AI_SEARCH_COLORS, AI_SEARCH_FONTS, AI_SEARCH_PANEL_SHADOW } from '@/components/AISearch/aiSearchTheme';

type Props = {
    query: string;
    onChangeQuery: (value: string) => void;
    onSubmitSearch: () => void;
    onPickFromGallery: () => void;
    onTakePhoto: () => void;
    selectedImageUri: string | null;
    onClearImage: () => void;
    loading: boolean;
    totalProducts: number;
    styleCount: number;
    materialCount: number;
    isWide: boolean;
    aiStatusLabel: string;
    aiStatusMessage: string;
    aiAccentColor: string;
    aiModelLabel: string;
    indexedCount: number;
    indexedCoverage: number;
    onRefreshStatus: () => void;
    refreshingStatus: boolean;
};

export default function AISearchHero({
    query,
    onChangeQuery,
    onSubmitSearch,
    onPickFromGallery,
    onTakePhoto,
    selectedImageUri,
    onClearImage,
    loading,
    totalProducts,
    styleCount,
    materialCount,
    isWide,
    aiStatusLabel,
    aiStatusMessage,
    aiAccentColor,
    aiModelLabel,
    indexedCount,
    indexedCoverage,
    onRefreshStatus,
    refreshingStatus,
}: Props) {
    return (
        <LinearGradient
            colors={['#fff7ee', '#f3dfcc', '#e7d3c4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-[32px] border px-5 py-6"
            style={[{ borderColor: AI_SEARCH_COLORS.line }, AI_SEARCH_PANEL_SHADOW]}
        >
            <View className="absolute right-[-28px] top-[-28px] h-44 w-44 rounded-full bg-white/25" />
            <View className="absolute bottom-[-56px] left-[-32px] h-36 w-36 rounded-full bg-[#b6734d]/10" />
            <View className="absolute bottom-10 right-28 h-20 w-20 rounded-full bg-[#70856d]/10" />

            <View className="flex-row flex-wrap items-start justify-between gap-6">
                <View className="min-w-[260px] flex-1">
                    <View className="mb-3 self-start rounded-full border border-white/50 bg-white/50 px-4 py-2">
                        <Text
                            className="uppercase tracking-[2px]"
                            style={{ color: AI_SEARCH_COLORS.espresso, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}
                        >
                            AI visual studio
                        </Text>
                    </View>

                    <Text
                        className="text-[36px] leading-[44px]"
                        style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}
                    >
                        Search with a photo, a mood, or a styling brief.
                    </Text>

                    <Text
                        className="mt-3 max-w-[620px] text-[15px] leading-7"
                        style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}
                    >
                        The page now blends text intent, live catalog filters, and the Python vision service so you can move from inspiration image to shoppable matches without leaving the screen.
                    </Text>

                    <View className="mt-5 flex-row flex-wrap gap-3">
                        {[
                            { icon: 'image' as const, label: 'Upload reference' },
                            { icon: 'cpu' as const, label: aiModelLabel },
                            { icon: 'layers' as const, label: `${indexedCoverage}% indexed` },
                        ].map((item) => (
                            <View key={item.label} className="flex-row items-center rounded-full border px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                                <Feather name={item.icon} size={14} color={AI_SEARCH_COLORS.espresso} />
                                <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body }}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View className="mt-6 rounded-[28px] border border-white/70 bg-white/80 p-3">
                        <View className="flex-row items-center gap-3 rounded-[22px] border bg-[#fffaf6] px-4 py-3" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                            <Feather name="search" size={18} color={AI_SEARCH_COLORS.muted} />
                            <TextInput
                                value={query}
                                onChangeText={onChangeQuery}
                                placeholder="Search by finish, category, material, or occasion"
                                placeholderTextColor="#9d8a7e"
                                onSubmitEditing={onSubmitSearch}
                                returnKeyType="search"
                                className="flex-1 text-[15px]"
                                style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}
                            />
                            <TouchableOpacity
                                onPress={onSubmitSearch}
                                disabled={loading}
                                className="rounded-full px-5 py-3"
                                style={{ backgroundColor: AI_SEARCH_COLORS.espresso }}
                            >
                                <Text style={{ color: AI_SEARCH_COLORS.white, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>
                                    {loading ? 'Searching...' : 'Search'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-3 flex-row flex-wrap gap-3">
                            <TouchableOpacity
                                onPress={onPickFromGallery}
                                className="flex-row items-center rounded-full border px-4 py-3"
                                style={{ backgroundColor: AI_SEARCH_COLORS.card, borderColor: AI_SEARCH_COLORS.line }}
                            >
                                <Feather name="image" size={16} color={AI_SEARCH_COLORS.espresso} />
                                <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body }}>
                                    Upload inspiration
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onTakePhoto}
                                className="flex-row items-center rounded-full border px-4 py-3"
                                style={{ backgroundColor: '#f6ede6', borderColor: AI_SEARCH_COLORS.line }}
                            >
                                <Feather name="camera" size={16} color={AI_SEARCH_COLORS.espresso} />
                                <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body }}>
                                    Use camera
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-4 flex-row flex-wrap gap-3">
                            {[
                                'Upload a reference image',
                                'Refine with AI filters',
                                'Open a product or quick view',
                            ].map((step, index) => (
                                <View key={step} className="flex-row items-center rounded-full bg-[#f6ede6] px-4 py-2.5">
                                    <Text style={{ color: AI_SEARCH_COLORS.clay, fontFamily: AI_SEARCH_FONTS.body }}>{`0${index + 1}`}</Text>
                                    <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body }}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="mt-6 flex-row flex-wrap gap-3">
                        {[
                            { label: 'Catalog live', value: `${totalProducts}+` },
                            { label: 'Visual-ready', value: `${indexedCount}` },
                            { label: 'Style lanes', value: `${styleCount}` },
                            { label: 'Material cues', value: `${materialCount}` },
                        ].map((metric) => (
                            <View key={metric.label} className="min-w-[120px] rounded-[20px] border bg-white/70 px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
                                <Text style={{ color: AI_SEARCH_COLORS.muted, fontSize: 11, fontFamily: AI_SEARCH_FONTS.body }}>{metric.label}</Text>
                                <Text className="mt-1 text-xl" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>{metric.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="w-full min-w-[260px] max-w-[340px] gap-4" style={{ alignSelf: isWide ? 'stretch' : 'auto' }}>
                    <View className="rounded-[28px] border bg-[#fffaf6] p-4" style={{ borderColor: 'rgba(255,255,255,0.7)' }}>
                        <View className="flex-row items-center justify-between gap-3">
                            <View>
                                <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    Visual search preview
                                </Text>
                                <Text className="mt-2 text-[22px] leading-8" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    Frame the detail you want the model to match.
                                </Text>
                            </View>

                            <View className="rounded-full px-3 py-2" style={{ backgroundColor: '#f6ede6' }}>
                                <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    {selectedImageUri ? 'Image loaded' : 'Awaiting upload'}
                                </Text>
                            </View>
                        </View>

                        <View className="mt-4 h-[256px] overflow-hidden rounded-[24px] border bg-[#f2e4d8]" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                            {selectedImageUri ? (
                                <Image source={{ uri: selectedImageUri }} className="h-full w-full" resizeMode="cover" />
                            ) : (
                                <View className="flex-1 items-center justify-center px-6">
                                    <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-white/70">
                                        <Feather name="aperture" size={22} color={AI_SEARCH_COLORS.espresso} />
                                    </View>
                                    <Text className="text-center text-base leading-7" style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.heading }}>
                                        AI will map silhouette, finish, and texture from the image you upload.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {selectedImageUri ? (
                            <TouchableOpacity onPress={onClearImage} className="mt-4 flex-row items-center self-start rounded-full border px-4 py-2" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                <Feather name="x" size={14} color={AI_SEARCH_COLORS.red} />
                                <Text className="ml-2" style={{ color: AI_SEARCH_COLORS.red, fontFamily: AI_SEARCH_FONTS.body }}>
                                    Remove image
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View className="rounded-[28px] border bg-[#fffdfb] p-4" style={{ borderColor: 'rgba(255,255,255,0.7)' }}>
                        <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                                <Text style={{ color: aiAccentColor, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    AI readiness monitor
                                </Text>
                                <Text className="mt-2 text-[22px] leading-8" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.heading }}>
                                    {aiStatusLabel}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={onRefreshStatus} className="rounded-full border px-3 py-2" style={{ borderColor: AI_SEARCH_COLORS.line }}>
                                <Text style={{ color: AI_SEARCH_COLORS.espresso, fontFamily: AI_SEARCH_FONTS.body, fontSize: 12 }}>
                                    {refreshingStatus ? 'Refreshing...' : 'Refresh'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="mt-3 text-[14px] leading-7" style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body }}>
                            {aiStatusMessage}
                        </Text>

                        <View className="mt-4 flex-row flex-wrap gap-3">
                            {[
                                { label: 'Model', value: aiModelLabel },
                                { label: 'Ready products', value: `${indexedCount}` },
                                { label: 'Coverage', value: `${indexedCoverage}%` },
                            ].map((metric) => (
                                <View key={metric.label} className="min-w-[92px] rounded-[18px] border px-3 py-3" style={{ borderColor: AI_SEARCH_COLORS.line, backgroundColor: '#f8efe7' }}>
                                    <Text style={{ color: AI_SEARCH_COLORS.muted, fontFamily: AI_SEARCH_FONTS.body, fontSize: 11 }}>{metric.label}</Text>
                                    <Text className="mt-1" style={{ color: AI_SEARCH_COLORS.ink, fontFamily: AI_SEARCH_FONTS.body, fontSize: 13 }}>{metric.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}