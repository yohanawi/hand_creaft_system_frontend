import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import BlogCard from './BlogCard';
import { Blog } from './blogTheme';

type Props = {
    blogs: Blog[];
    isMobile: boolean;
    isTablet: boolean;
    onBlogPress: (blog: Blog) => void;
};

export default function BlogGrid({ blogs, isMobile, isTablet, onBlogPress }: Props) {

    const widthClass = isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[31.8%]';

    if (blogs.length === 0) {
        return (
            <View className="items-center rounded-[30px] border border-[#EAD9C5] bg-white p-10">
                <Feather name="file-text" size={38} color="#C99A45" />
                <Text className="mt-4 text-2xl font-bold text-[#261812]">
                    No stories found
                </Text>
                <Text className="mt-2 text-center text-[#8A7565]">
                    Try another keyword or category.
                </Text>
            </View>
        );
    }

    return (
        <View className={`flex-row flex-wrap ${isMobile ? '' : 'gap-6'}`}>
            {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} widthClass={widthClass} onPress={() => onBlogPress(blog)} />
            ))}
        </View>
    );
}