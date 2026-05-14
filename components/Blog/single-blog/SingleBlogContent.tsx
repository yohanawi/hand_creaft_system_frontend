import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import SingleBlogComments from './SingleBlogComments';
import {
    BlogComment,
    BlogPost,
    blogImageUri,
    formatBlogDate,
    getInitials,
} from './singleBlogTheme';

type Props = {
    blog: BlogPost;
    relatedBlogs: BlogPost[];
    comments: BlogComment[];
    commentText: string;
    submitting: boolean;
    error: string;
    isMobile: boolean;
    onChangeComment: (text: string) => void;
    onSubmitComment: () => void;
    onRelatedPress: (blog: BlogPost) => void;
    onViewAllBlogs: () => void;
};

export default function SingleBlogContent({
    blog,
    relatedBlogs,
    comments,
    commentText,
    submitting,
    error,
    isMobile,
    onChangeComment,
    onSubmitComment,
    onRelatedPress,
    onViewAllBlogs,
}: Props) {
    const { width } = useWindowDimensions();
    const html = blog.description || blog.excerpt || '';

    return (
        <View className="bg-[#FFF8EF] px-4 py-14">
            <View className={`${isMobile ? '' : 'flex-row'} mx-auto w-full max-w-7xl gap-8`}>
                <View className="flex-1">
                    <View className="overflow-hidden rounded-[36px] border border-[#EAD9C5] bg-white shadow-sm">
                        <Image
                            source={{ uri: blogImageUri(blog.image) }}
                            resizeMode="cover"
                            className={isMobile ? 'h-80 w-full' : 'h-[520px] w-full'}
                        />

                        <View className="p-6 md:p-10">
                            <RenderHTML
                                contentWidth={isMobile ? width - 56 : width - 480}
                                source={{ html }}
                                baseStyle={{
                                    color: '#4F3A2E',
                                    fontSize: isMobile ? 16 : 18,
                                    lineHeight: isMobile ? 29 : 34,
                                }}
                                tagsStyles={{
                                    h1: { color: '#261812', fontSize: 36, fontWeight: '800' },
                                    h2: { color: '#261812', fontSize: 30, fontWeight: '800', marginTop: 22 },
                                    h3: { color: '#3A2418', fontSize: 24, fontWeight: '800', marginTop: 18 },
                                    p: { marginBottom: 16 },
                                    strong: { color: '#3A2418', fontWeight: '800' },
                                    b: { color: '#3A2418', fontWeight: '800' },
                                    a: { color: '#A67942', fontWeight: '700', textDecorationLine: 'none' },
                                    blockquote: {
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#C99A45',
                                        paddingLeft: 18,
                                        color: '#6B3F24',
                                        fontStyle: 'italic',
                                    },
                                }}
                            />

                            <View className="mt-8 rounded-[30px] bg-[#FFF8EF] p-5">
                                <View className={`${isMobile ? '' : 'flex-row items-center justify-between'}`}>
                                    <View className="flex-row items-center">
                                        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#C99A45]">
                                            <Text className="text-xl font-bold text-white">
                                                {getInitials(blog.author?.name)}
                                            </Text>
                                        </View>

                                        <View className="ml-4">
                                            <Text className="text-lg font-bold text-[#261812]">
                                                {blog.author?.name || 'Hand Craft Studio'}
                                            </Text>
                                            <Text className="mt-1 text-sm font-semibold text-[#8A7565]">
                                                Jewelry Story Writer
                                            </Text>
                                        </View>
                                    </View>

                                    <View className={`${isMobile ? 'mt-5' : ''} flex-row flex-wrap gap-4`}>
                                        <View className="flex-row items-center">
                                            <Feather name="calendar" size={16} color="#C99A45" />
                                            <Text className="ml-2 font-semibold text-[#6B3F24]">
                                                {formatBlogDate(blog.createdAt || blog.published_date)}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Feather name="clock" size={16} color="#C99A45" />
                                            <Text className="ml-2 font-semibold text-[#6B3F24]">
                                                {blog.readingTimeText || '5 min read'}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Feather name="eye" size={16} color="#C99A45" />
                                            <Text className="ml-2 font-semibold text-[#6B3F24]">
                                                {blog.views || 0} views
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {!!blog.tags?.length && (
                                <View className="flex-row flex-wrap gap-3 mt-6">
                                    {blog.tags.map((tag) => (
                                        <View
                                            key={tag}
                                            className="rounded-full border border-[#EAD9C5] bg-[#FFF8EF] px-4 py-2"
                                        >
                                            <Text className="font-bold text-[#6B3F24]">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="mt-8">
                        <SingleBlogComments
                            comments={comments}
                            commentText={commentText}
                            submitting={submitting}
                            error={error}
                            onChangeComment={onChangeComment}
                            onSubmit={onSubmitComment}
                        />
                    </View>
                </View>

                <View className={`${isMobile ? 'mt-8 w-full' : 'w-[360px]'}`}>
                    <View className="rounded-[34px] border border-[#EAD9C5] bg-white p-5 shadow-sm">
                        <Text className="text-xs font-bold uppercase tracking-[2.6px] text-[#A67942]">
                            Continue Reading
                        </Text>

                        <Text className="mt-2 text-[28px] font-bold text-[#261812]">
                            Related Blogs
                        </Text>

                        <View className="gap-4 mt-5">
                            {relatedBlogs.slice(0, 5).map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    onPress={() => onRelatedPress(item)}
                                    activeOpacity={0.85}
                                    className="flex-row rounded-[22px] bg-[#FFF8EF] p-3"
                                >
                                    <Image
                                        source={{ uri: blogImageUri(item.image) }}
                                        resizeMode="cover"
                                        className="h-20 w-20 rounded-[18px]"
                                    />

                                    <View className="flex-1 ml-3">
                                        <Text className="text-xs font-bold uppercase text-[#A67942]">
                                            {item.category || 'Jewelry'}
                                        </Text>

                                        <Text numberOfLines={2} className="mt-1 font-bold leading-5 text-[#261812]">
                                            {item.title}
                                        </Text>

                                        <Text className="mt-1 text-xs font-semibold text-[#8A7565]">
                                            {item.readingTimeText || '5 min read'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={onViewAllBlogs}
                            activeOpacity={0.85}
                            className="mt-6 flex-row items-center justify-center rounded-full bg-[#3A2418] px-6 py-4"
                        >
                            <Text className="mr-2 font-bold text-white">View All Blogs</Text>
                            <Feather name="arrow-right" size={17} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}