import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView } from 'expo-video';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS, PRODUCT_PAGE_SHADOW, PRODUCT_PAGE_SOFT_SHADOW } from '@/components/Single-Product/theme';
import { MediaTab } from '@/components/Single-Product/types';

type Props = {
    productName: string;
    isMobile: boolean;
    mediaTab: MediaTab;
    onChangeMediaTab: (tab: MediaTab) => void;
    galleryImages: string[];
    selectedImage: number;
    onSelectImage: (index: number) => void;
    onOpenZoom: () => void;
    videoUrls: string[];
    selectedVideoIndex: number;
    onSelectVideoIndex: (index: number) => void;
    spinFrames: string[];
    selectedSpinIndex: number;
    onSelectSpinIndex: (index: number) => void;
    videoPlayer: React.ComponentProps<typeof VideoView>['player'];
};

const mediaTabs: { key: MediaTab; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
    { key: 'gallery', label: 'Gallery', icon: 'image' },
    { key: 'video', label: 'Video', icon: 'play-circle' },
    { key: 'spin', label: '360 View', icon: 'refresh-cw' },
];

export default function ProductHeroMedia({
    productName,
    isMobile,
    mediaTab,
    onChangeMediaTab,
    galleryImages,
    selectedImage,
    onSelectImage,
    onOpenZoom,
    videoUrls,
    selectedVideoIndex,
    onSelectVideoIndex,
    spinFrames,
    selectedSpinIndex,
    onSelectSpinIndex,
    videoPlayer,
}: Props) {
    const selectedVideoUrl = videoUrls[selectedVideoIndex] || null;
    const activeGalleryImage = galleryImages[selectedImage];

    return (
        <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                {mediaTabs.filter((item) => {
                    if (item.key === 'gallery') return galleryImages.length > 0;
                    if (item.key === 'video') return videoUrls.length > 0;
                    return spinFrames.length > 0;
                }).map((item) => {
                    const active = item.key === mediaTab;
                    return (
                        <TouchableOpacity key={item.key} onPress={() => onChangeMediaTab(item.key)} activeOpacity={0.88}>
                            <LinearGradient
                                colors={active ? ['#8B5E3C', '#5E3925'] : ['#FFF8F1', '#F4E5D5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 999,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <Feather name={item.icon} size={15} color={active ? PRODUCT_PAGE_COLORS.white : PRODUCT_PAGE_COLORS.accentDeep} />
                                <Text style={{ color: active ? PRODUCT_PAGE_COLORS.white : PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 13 }}>
                                    {item.label}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={{ borderRadius: 28, overflow: 'hidden', backgroundColor: PRODUCT_PAGE_COLORS.surface, ...PRODUCT_PAGE_SHADOW }}>
                <LinearGradient
                    colors={['#FFF8F1', '#F3E2CF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 18 }}
                >
                    <View style={{
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: '#F3E7D9',
                        minHeight: isMobile ? 360 : 520,
                        justifyContent: 'center',
                    }}>
                        {mediaTab === 'gallery' && activeGalleryImage ? (
                            <View style={{ flex: 1 }}>
                                <Image source={{ uri: activeGalleryImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                <View style={{ position: 'absolute', left: 18, top: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(255,250,245,0.92)' }}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                            Studio-grade imagery
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={onOpenZoom}
                                        style={{
                                            backgroundColor: PRODUCT_PAGE_COLORS.overlay,
                                            borderRadius: 999,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <Feather name="maximize-2" size={14} color={PRODUCT_PAGE_COLORS.white} />
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 12 }}>
                                            Full View
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <LinearGradient
                                    colors={['transparent', 'rgba(30,20,13,0.72)']}
                                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20 }}
                                >
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 24 }}>
                                        {productName}
                                    </Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.84)', fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 4 }}>
                                        Crafted details visible from every angle.
                                    </Text>
                                </LinearGradient>
                            </View>
                        ) : null}

                        {mediaTab === 'gallery' && !activeGalleryImage ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                                <Feather name="package" size={84} color={PRODUCT_PAGE_COLORS.accent} />
                                <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 28, marginTop: 14 }}>
                                    Visuals coming soon
                                </Text>
                            </View>
                        ) : null}

                        {mediaTab === 'video' && selectedVideoUrl ? (
                            <View style={{ padding: 14, flex: 1 }}>
                                <VideoView
                                    player={videoPlayer}
                                    nativeControls
                                    contentFit="contain"
                                    style={{ width: '100%', height: isMobile ? 320 : 490, borderRadius: 20, backgroundColor: '#111827' }}
                                />
                            </View>
                        ) : null}

                        {mediaTab === 'spin' && spinFrames.length > 0 ? (
                            <View style={{ padding: 14, flex: 1 }}>
                                <Image
                                    source={{ uri: spinFrames[selectedSpinIndex] }}
                                    style={{ width: '100%', height: isMobile ? 320 : 490, borderRadius: 20 }}
                                    contentFit="cover"
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                                    <TouchableOpacity
                                        onPress={() => onSelectSpinIndex(selectedSpinIndex === 0 ? spinFrames.length - 1 : selectedSpinIndex - 1)}
                                        style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Feather name="chevron-left" size={18} color={PRODUCT_PAGE_COLORS.accentDeep} />
                                    </TouchableOpacity>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 14 }}>
                                            Interactive spin sequence
                                        </Text>
                                        <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 12, marginTop: 2 }}>
                                            Frame {selectedSpinIndex + 1} of {spinFrames.length}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => onSelectSpinIndex((selectedSpinIndex + 1) % spinFrames.length)}
                                        style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Feather name="chevron-right" size={18} color={PRODUCT_PAGE_COLORS.accentDeep} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 16 }}>
                        <View style={{ flex: 1, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', padding: 14, ...PRODUCT_PAGE_SOFT_SHADOW }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                Media Library
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 24, marginTop: 4 }}>
                                {galleryImages.length + videoUrls.length + spinFrames.length}
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13 }}>
                                Curated visuals and rich product media.
                            </Text>
                        </View>
                        <View style={{ flex: 1, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', padding: 14, ...PRODUCT_PAGE_SOFT_SHADOW }}>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                Presentation
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 24, marginTop: 4 }}>
                                High fidelity
                            </Text>
                            <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13 }}>
                                Designed for desktop polish and mobile clarity.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {mediaTab === 'gallery' && galleryImages.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 4 }}>
                    {galleryImages.map((asset, index) => {
                        const active = index === selectedImage;
                        return (
                            <TouchableOpacity
                                key={`${asset}-${index}`}
                                onPress={() => onSelectImage(index)}
                                style={{
                                    width: 92,
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    borderWidth: 2,
                                    borderColor: active ? PRODUCT_PAGE_COLORS.accent : PRODUCT_PAGE_COLORS.line,
                                    backgroundColor: PRODUCT_PAGE_COLORS.white,
                                }}
                            >
                                <Image source={{ uri: asset }} style={{ width: '100%', height: 90 }} contentFit="cover" />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : null}

            {mediaTab === 'video' && videoUrls.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 4 }}>
                    {videoUrls.map((asset, index) => {
                        const active = index === selectedVideoIndex;
                        return (
                            <TouchableOpacity
                                key={`${asset}-${index}`}
                                onPress={() => onSelectVideoIndex(index)}
                                style={{
                                    minWidth: 172,
                                    borderRadius: 18,
                                    paddingHorizontal: 14,
                                    paddingVertical: 14,
                                    backgroundColor: active ? PRODUCT_PAGE_COLORS.accentDeep : PRODUCT_PAGE_COLORS.surface,
                                    borderWidth: 1,
                                    borderColor: active ? PRODUCT_PAGE_COLORS.accentDeep : PRODUCT_PAGE_COLORS.line,
                                }}
                            >
                                <Text style={{ color: active ? PRODUCT_PAGE_COLORS.white : PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700' }}>
                                    Video {index + 1}
                                </Text>
                                <Text style={{ color: active ? 'rgba(255,255,255,0.78)' : PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 12, marginTop: 6 }} numberOfLines={1}>
                                    {asset}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : null}

            {mediaTab === 'spin' && spinFrames.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 4 }}>
                    {spinFrames.map((asset, index) => {
                        const active = index === selectedSpinIndex;
                        return (
                            <TouchableOpacity
                                key={`${asset}-${index}`}
                                onPress={() => onSelectSpinIndex(index)}
                                style={{
                                    width: 92,
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    borderWidth: 2,
                                    borderColor: active ? PRODUCT_PAGE_COLORS.accent : PRODUCT_PAGE_COLORS.line,
                                    backgroundColor: PRODUCT_PAGE_COLORS.white,
                                }}
                            >
                                <Image source={{ uri: asset }} style={{ width: '100%', height: 90 }} contentFit="cover" />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : null}
        </View>
    );
}