import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { BlogPost, blogImageUri, formatBlogDate, getInitials } from './singleBlogTheme';

type Props = {
    blogs: BlogPost[];
    isMobile: boolean;
    onPress: (blog: BlogPost) => void;
};

export default function SingleBlogRelated({ blogs, isMobile, onPress }: Props) {
    if (blogs.length === 0) return null;

    return (
        <View className="bg-[#FFF8EF] px-4 pb-16">
            <View className="w-full mx-auto max-w-7xl">
                <View className="mb-7">
                    <Text className="text-xs font-bold uppercase tracking-[2.8px] text-[#A67942]">
                        Continue Reading
                    </Text>
                    <Text className="mt-2 text-[34px] font-bold text-[#261812]">
                        Related Stories
                    </Text>
                </View>

                <View className={`flex-row flex-wrap ${isMobile ? '' : 'gap-6'}`}>
                    {blogs.map((blog) => (
                        <TouchableOpacity
                            key={blog._id}
                            activeOpacity={0.9}
                            onPress={() => onPress(blog)}
                            className={`mb-6 overflow-hidden rounded-[30px] border border-[#EAD9C5] bg-white shadow-sm ${isMobile ? 'w-full' : 'w-[31.8%]'
                                }`}
                        >
                            <Image
                                source={{ uri: blogImageUri(blog.image) }}
                                resizeMode="cover"
                                className="w-full h-56"
                            />

                            <View className="p-5">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="rounded-full bg-[#F6E8D8] px-3 py-1.5">
                                        <Text className="text-xs font-bold text-[#6B3F24]">
                                            {blog.category || 'Jewelry'}
                                        </Text>
                                    </View>

                                    <Text className="text-xs font-semibold text-[#8A7565]">
                                        {formatBlogDate(blog.createdAt || blog.published_date)}
                                    </Text>
                                </View>

                                <Text
                                    className="text-[21px] font-bold leading-7 text-[#261812]"
                                    numberOfLines={2}
                                >
                                    {blog.title}
                                </Text>

                                <View className="mt-5 flex-row items-center justify-between border-t border-[#EAD9C5] pt-4">
                                    <View className="flex-row items-center">
                                        <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-[#3A2418]">
                                            <Text className="text-xs font-bold text-white">
                                                {getInitials(blog.author?.name)}
                                            </Text>
                                        </View>

                                        <Text className="font-bold text-[#261812]" numberOfLines={1}>
                                            {blog.author?.name || 'Hand Craft'}
                                        </Text>
                                    </View>

                                    <Feather name="arrow-up-right" size={19} color="#6B3F24" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}