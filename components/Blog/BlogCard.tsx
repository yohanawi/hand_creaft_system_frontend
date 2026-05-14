import { getAssetUrl } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Blog, BLOG_COLORS, formatBlogDate, getInitials } from './blogTheme';

type Props = {
    blog: Blog;
    widthClass: string;
    onPress: () => void;
};

const blogImageUri = (img?: string) => getAssetUrl(img) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900';

export default function BlogCard({ blog, widthClass, onPress }: Props) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className={`mb-6 overflow-hidden rounded-md bg-white ${widthClass}`}
        >
            <View>
                <Image source={{ uri: blogImageUri(blog.image) }} className="w-full h-60" resizeMode="cover" />

                {blog.is_popular && (
                    <View className="absolute left-4 top-4 rounded-full bg-[#C99A45] px-3 py-1.5">
                        <Text className="text-xs font-bold text-white uppercase">
                            Popular
                        </Text>
                    </View>
                )}
            </View>

            <View className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="rounded-full bg-[#F6E8D8] px-3 py-1.5">
                        <Text className="text-xs font-bold text-[#5A321E]">
                            {blog.category || 'Jewelry'}
                        </Text>
                    </View>

                    <Text className="text-xs font-semibold text-[#8A7565]">
                        {formatBlogDate(blog.createdAt || blog.published_date)}
                    </Text>
                </View>

                <Text className="text-[21px] font-bold leading-7 text-[#261812]" numberOfLines={2}>
                    {blog.title}
                </Text>

                <View className="mt-5 flex-row items-center justify-between border-t border-[#EFE1D2] pt-4">
                    <View className="flex-row items-center">
                        <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-[#3A2418]">
                            <Text className="text-xs font-bold text-white">
                                {getInitials(blog.author?.name)}
                            </Text>
                        </View>

                        <Text className="max-w-[110px] text-sm font-bold text-[#261812]" numberOfLines={1}>
                            {blog.author?.name || 'Hand Craft'}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Feather name="clock" size={14} color={BLOG_COLORS.gold} />
                        <Text className="ml-1 text-xs font-semibold text-[#8A7565]">
                            {blog.readingTimeText || '5 min'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}