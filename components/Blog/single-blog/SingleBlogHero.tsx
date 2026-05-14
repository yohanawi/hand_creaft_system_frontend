import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BlogPost } from './singleBlogTheme';

type Props = {
    blog: BlogPost;
    isMobile: boolean;
    onBackHome: () => void;
    onBackBlogs: () => void;
    onScrollToContent: () => void;
};

export default function SingleBlogHero({
    blog,
    isMobile,
    onBackHome,
    onBackBlogs,
    onScrollToContent,
}: Props) {
    return (
        <LinearGradient
            colors={['#261812', '#4B2C1D', '#8B5A2B'] as any}
            className="min-h-[620px] items-center justify-center px-4 py-20"
        >
            <View className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#C99A45]/20" />
            <View className="absolute bottom-0 rounded-full -left-20 h-72 w-72 bg-white/10" />

            <View className="items-center w-full max-w-5xl">
                <View className="flex-row flex-wrap items-center justify-center mb-8">
                    <TouchableOpacity onPress={onBackHome}>
                        <Text className="text-sm font-semibold text-white/70">Home</Text>
                    </TouchableOpacity>

                    <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.5)" style={{ marginHorizontal: 10 }} />

                    <TouchableOpacity onPress={onBackBlogs}>
                        <Text className="text-sm font-semibold text-white/70">Blog</Text>
                    </TouchableOpacity>

                    <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.5)" style={{ marginHorizontal: 10 }} />

                    <Text className="text-sm font-bold text-[#F8D99A]" numberOfLines={1}>
                        {blog.category || 'Jewelry'}
                    </Text>
                </View>

                <View className="px-6 py-3 mb-6 border rounded-full border-white/20 bg-white/10">
                    <Text className="text-xs font-bold uppercase tracking-[3px] text-[#F8D99A]">
                        {blog.category || 'Handmade Jewelry'}
                    </Text>
                </View>

                <Text
                    className={`max-w-4xl text-center font-bold text-white ${isMobile ? 'text-[38px] leading-[48px]' : 'text-[72px] leading-[82px]'
                        }`}
                >
                    {blog.title}
                </Text>

                <TouchableOpacity
                    onPress={onScrollToContent}
                    activeOpacity={0.85}
                    className="flex-row items-center px-6 py-4 mt-10 bg-white rounded-full"
                >
                    <Text className="mr-3 font-bold text-[#3A2418]">Read Article</Text>
                    <Feather name="arrow-down" size={18} color="#3A2418" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}