import { getAssetUrl } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Blog, BLOG_COLORS, formatBlogDate, getInitials } from './blogTheme';

type Props = {
    blog: Blog;
    isMobile: boolean;
    onPress: () => void;
};

const { width } = Dimensions.get('window');


const blogImageUri = (img?: string) =>
    getAssetUrl(img) ||
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600';

export default function BlogFeaturedCard({
    blog,
    isMobile,
    onPress,
}: Props) {

    const descriptionHtml = blog.excerpt || blog.description || '';

    return (
        <View className="px-4 py-14">
            <View className="w-full mx-auto max-w-7xl">
                {/* Header */}
                <View className="flex-row items-end justify-between mb-7">
                    <View>
                        <Text className="mb-2 text-xs font-bold uppercase tracking-[3px] text-[#A67942]">
                            Featured Story
                        </Text>

                        <Text
                            className={`font-bold text-[#261812] ${isMobile ? 'text-[32px]' : 'text-[42px]'
                                }`}
                        >
                            Editor’s Luxury Pick
                        </Text>
                    </View>

                    {!isMobile && (
                        <View className="rounded-full border border-[#E7D5C3] bg-[#FFF9F3] px-5 py-3">
                            <Text className="font-semibold text-[#6B3F24]">
                                Handmade Craft Journal
                            </Text>
                        </View>
                    )}
                </View>

                {/* Main Card */}
                <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={onPress}
                    className="overflow-hidden rounded-[38px]"
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowRadius: 24,
                        shadowOffset: { width: 0, height: 12 },
                        elevation: 10,
                    }}
                >
                    <ImageBackground
                        source={{ uri: blogImageUri(blog.image) }}
                        resizeMode="cover"
                        style={{
                            minHeight: isMobile ? 620 : 560,
                            justifyContent: 'flex-end',
                        }}
                    >
                        {/* Overlay */}
                        <LinearGradient
                            colors={[
                                'rgba(0,0,0,0.08)',
                                'rgba(20,12,8,0.45)',
                                'rgba(24,16,12,0.95)',
                            ] as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            className="justify-end flex-1 px-5 py-5 md:px-10 md:py-10"
                        >
                            {/* Floating Top Badge */}
                            <View className="absolute flex-row items-center gap-3 left-5 top-5 md:left-8 md:top-8">
                                <View className="rounded-full bg-[#C99A45] px-4 py-2">
                                    <Text className="text-xs font-bold uppercase tracking-[1.8px] text-white">
                                        {blog.category || 'Jewelry'}
                                    </Text>
                                </View>

                                <View className="px-4 py-2 border rounded-full border-white/20 bg-black/25">
                                    <Text className="text-xs font-semibold text-white">
                                        {formatBlogDate(
                                            blog.createdAt ||
                                            blog.published_date
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {/* Decorative Blur Blocks */}
                            <View className="absolute -right-12 top-20 h-44 w-44 rounded-full bg-[#C99A45]/20" />
                            <View className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5" />

                            {/* Content Card */}
                            <View
                                className="rounded-[34px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl md:p-8"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.10)',
                                }}
                            >
                                {/* Mini label */}
                                <View className="self-start px-4 py-2 mb-4 border rounded-full border-white/20 bg-white/10">
                                    <Text className="text-xs font-bold uppercase tracking-[2px] text-[#F8D99A]">
                                        Luxury Editorial
                                    </Text>
                                </View>

                                {/* Title */}
                                <Text
                                    numberOfLines={3}
                                    className={`font-bold text-white ${isMobile
                                        ? 'text-[30px] leading-[38px]'
                                        : 'text-[48px] leading-[56px]'
                                        }`}
                                >
                                    {blog.title}
                                </Text>

                                {/* Description */}
                                <View className="mt-5">
                                    <RenderHTML
                                        contentWidth={width}
                                        source={{ html: descriptionHtml }}
                                        baseStyle={{
                                            color: 'rgba(255,255,255,0.82)',
                                            fontSize: isMobile ? 15 : 18,
                                            lineHeight: isMobile ? 28 : 32,
                                        }}
                                        tagsStyles={{
                                            p: {
                                                marginTop: 0,
                                                marginBottom: 0,
                                            },
                                            strong: {
                                                color: '#F8D99A',
                                                fontWeight: '700',
                                            },
                                            b: {
                                                color: '#F8D99A',
                                                fontWeight: '700',
                                            },
                                            a: {
                                                color: '#F8D99A',
                                                textDecorationLine: 'none',
                                            },
                                        }}
                                    />
                                </View>

                                {/* Bottom Row */}
                                <View className="flex-row items-center justify-between pt-5 border-t mt-7 border-white/10">
                                    {/* Author */}
                                    <View className="flex-row items-center">
                                        <View className="mr-4 h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#C99A45]">
                                            <Text className="text-lg font-bold text-white">
                                                {getInitials(
                                                    blog.author?.name
                                                )}
                                            </Text>
                                        </View>

                                        <View>
                                            <Text className="text-base font-bold text-white">
                                                {blog.author?.name ||
                                                    'Hand Craft Studio'}
                                            </Text>

                                            <View className="flex-row items-center mt-1">
                                                <Feather
                                                    name="clock"
                                                    size={14}
                                                    color="#F8D99A"
                                                />

                                                <Text className="ml-2 text-sm font-medium text-white/70">
                                                    {blog.readingTimeText ||
                                                        '5 min read'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* CTA */}
                                    <View className="flex-row items-center">
                                        {!isMobile && (
                                            <Text className="mr-4 text-sm font-semibold uppercase tracking-[1.8px] text-white/70">
                                                Read Story
                                            </Text>
                                        )}

                                        <View className="items-center justify-center bg-white rounded-full h-14 w-14">
                                            <Feather
                                                name="arrow-up-right"
                                                size={24}
                                                color={BLOG_COLORS.brown}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </View>
    );
}