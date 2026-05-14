import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlogComment, formatBlogDate, getInitials } from './singleBlogTheme';

type Props = {
    comments: BlogComment[];
    commentText: string;
    submitting: boolean;
    error: string;
    onChangeComment: (text: string) => void;
    onSubmit: () => void;
};

const getUserName = (user?: BlogComment['user']) => {
    if (!user) return 'Customer';
    if (typeof user === 'string') return 'Customer';
    return user.name || 'Customer';
};

export default function SingleBlogComments({
    comments,
    commentText,
    submitting,
    error,
    onChangeComment,
    onSubmit,
}: Props) {
    return (
        <View className="rounded-[34px] border border-[#EAD9C5] bg-white p-6 shadow-sm md:p-8">
            <View className="flex-row items-center justify-between mb-7">
                <View>
                    <Text className="text-xs font-bold uppercase tracking-[2.5px] text-[#A67942]">
                        Community Notes
                    </Text>
                    <Text className="mt-1 text-[30px] font-bold text-[#261812]">
                        Comments
                    </Text>
                </View>

                <View className="rounded-full bg-[#F6E8D8] px-4 py-2">
                    <Text className="font-bold text-[#6B3F24]">{comments.length}</Text>
                </View>
            </View>

            <View className="rounded-[28px] bg-[#FFF8EF] p-4">
                <TextInput
                    value={commentText}
                    onChangeText={onChangeComment}
                    placeholder="Share your thoughts about this article..."
                    placeholderTextColor="#9B8778"
                    multiline
                    className="min-h-[120px] rounded-[22px] bg-white px-5 py-4 text-base text-[#261812]"
                    textAlignVertical="top"
                />

                {!!error && (
                    <Text className="mt-3 font-semibold text-red-600">{error}</Text>
                )}

                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={submitting || !commentText.trim()}
                    className={`mt-4 flex-row items-center justify-center rounded-[20px] px-6 py-4 ${submitting || !commentText.trim() ? 'bg-[#D8C6B4]' : 'bg-[#3A2418]'
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Feather name="send" size={17} color="#fff" />
                            <Text className="ml-2 font-bold text-white">Post Comment</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View className="gap-4 mt-8">
                {comments.length === 0 ? (
                    <View className="items-center rounded-[26px] border border-dashed border-[#EAD9C5] p-8">
                        <Feather name="message-circle" size={32} color="#C99A45" />
                        <Text className="mt-3 text-lg font-bold text-[#261812]">
                            No comments yet
                        </Text>
                        <Text className="mt-1 text-center text-[#8A7565]">
                            Be the first to share your thoughts.
                        </Text>
                    </View>
                ) : (
                    comments.map((item) => {
                        const name = getUserName(item.user);

                        return (
                            <View
                                key={item._id}
                                className="rounded-[26px] border border-[#EAD9C5] bg-[#FFF8EF] p-5"
                            >
                                <View className="flex-row items-start">
                                    <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-[#C99A45]">
                                        <Text className="font-bold text-white">
                                            {getInitials(name)}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="font-bold text-[#261812]">{name}</Text>
                                            <Text className="text-xs font-semibold text-[#8A7565]">
                                                {formatBlogDate(item.createdAt)}
                                            </Text>
                                        </View>

                                        <Text className="mt-2 leading-6 text-[#6F5B4E]">
                                            {item.comment}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </View>
    );
}