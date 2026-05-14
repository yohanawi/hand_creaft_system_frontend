import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    type?: 'loading' | 'not-found';
    onBack?: () => void;
};

export default function SingleBlogLoading({ type = 'loading', onBack }: Props) {
    if (type === 'not-found') {
        return (
            <View className="flex-1 items-center justify-center bg-[#FFF8EF] px-6">
                <View className="items-center rounded-[34px] border border-[#EAD9C5] bg-white p-10 shadow-sm">
                    <Feather name="book-open" size={46} color="#C99A45" />

                    <Text className="mt-5 text-3xl font-bold text-[#261812]">
                        Article not found
                    </Text>

                    <Text className="mt-2 text-center text-[#8A7565]">
                        This journal story may have been removed or unpublished.
                    </Text>

                    <TouchableOpacity
                        onPress={onBack}
                        className="mt-7 rounded-full bg-[#3A2418] px-7 py-4"
                    >
                        <Text className="font-bold text-white">
                            Back to Journal
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
            <ActivityIndicator size="large" color="#6B3F24" />
            <Text className="mt-4 font-semibold text-[#8A7565]">
                Opening the journal...
            </Text>
        </View>
    );
}