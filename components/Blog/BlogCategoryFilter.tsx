import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    categories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
};

export default function BlogCategoryFilter({
    categories,
    selectedCategory,
    onSelect,
}: Props) {
    const items = ['', ...categories];

    return (
        <View className="bg-[#FFF8EF] px-4 py-8">
            <View className="mx-auto w-full max-w-7xl overflow-hidden rounded-[34px] p-4 bg-[#FBF7F3]">
                <View className="flex-row items-center justify-between mb-5">
                    <View>
                        <Text className="text-xs font-bold uppercase tracking-[2.8px] text-[#A67942]">
                            Explore Journal
                        </Text>
                        <Text className="mt-1 text-[24px] font-bold text-[#261812]">
                            Browse by Collection
                        </Text>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-3">
                        {items.map((cat) => {
                            const active = selectedCategory === cat;
                            const label = cat || 'All Stories';

                            return (
                                <TouchableOpacity
                                    key={label}
                                    activeOpacity={0.86}
                                    onPress={() => onSelect(cat)}
                                    className={`flex-row items-center rounded-full border px-5 py-3 ${active
                                        ? 'border-[#3A2418] bg-[#3A2418]'
                                        : 'border-[#EAD9C5] bg-[#FFF8EF]'
                                        }`}>
                                    <View className={`mr-2 items-center justify-center rounded-full`}>
                                        <Feather name={cat ? 'tag' : 'grid'} size={15} color={active ? '#fff' : '#6B3F24'} />
                                    </View>

                                    <Text className={`font-bold ${active ? 'text-white' : 'text-[#5A321E]'}`}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}