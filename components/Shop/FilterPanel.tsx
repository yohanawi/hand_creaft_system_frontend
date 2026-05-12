import type { CategoryOption } from '@/types/shop';
import { Search, X } from "lucide-react-native";
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, } from 'react-native';

type Props = {
    categories: CategoryOption[];
    selectedCategorySlug: string;
    setSelectedCategorySlug: (slug: string) => void;
    materials: string[];
    selectedMaterials: string[];
    toggleMaterial: (m: string) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    onClear: () => void;
};

export default function FilterPanel({
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    materials,
    selectedMaterials,
    toggleMaterial,
    searchQuery,
    setSearchQuery,
    onClear,
}: Props) {

    const hasActiveFilters = selectedCategorySlug !== 'all' || selectedMaterials.length > 0 || searchQuery.length > 0;
    const [showAllCategories, setShowAllCategories] = useState(false);
    const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const visibleMaterials = showAllMaterials ? materials : materials.slice(0, 10);

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 36, }}>
            {/* Search Box */}
            <View className="flex-row items-center bg-[#FAF7F3] border border-[#E8DDD2] rounded-2xl px-4 mb-5">
                <Text className="text-[18px] text-[#8A7668] mr-2">
                    <Search size={18} color="#8A7668" />
                </Text>

                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search products…"
                    placeholderTextColor="#B6A79A"
                    className="flex-1 py-4 text-[14px] text-[#2D1810] outline-none"
                    underlineColorAndroid="transparent"
                />

                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        hitSlop={{
                            top: 8,
                            bottom: 8,
                            left: 8,
                            right: 8,
                        }}
                    >
                        <View className="pl-2">
                            <X size={14} color="#B6A79A" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {/* Categories */}
            <View className="flex-row items-center mb-3">
                <View className="w-1 h-4 rounded bg-[#B5743F] mr-2" />
                <Text className="text-[11px] font-extrabold uppercase tracking-widest text-[#5C4638]">
                    Categories
                </Text>
            </View>

            <View className="gap-2">
                {visibleCategories.map((cat) => {
                    const active = selectedCategorySlug === cat.slug;

                    return (
                        <TouchableOpacity key={cat.slug} onPress={() => setSelectedCategorySlug(cat.slug)}
                            className={`flex-row items-center px-4 py-3 rounded-2xl border ${active
                                ? 'bg-[#FDF2E8] border-[#B5743F]'
                                : 'bg-[#FAF7F3] border-[#E8DDD2]'
                                }`}>
                            <View className={`w-[9px] h-[9px] rounded-full mr-3 ${active ? 'bg-[#B5743F]' : 'bg-[#E8DDD2]'}`} />

                            <Text className={`flex-1 text-[14px] ${active ? 'font-bold text-[#5B3213]' : 'font-medium text-[#8A7668]'}`}>
                                {cat.label}
                            </Text>

                            {active && (
                                <Text className="text-[10px] text-[#B5743F]">
                                    ●
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
                {categories.length > 6 && (
                    <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)} className="mt-3 py-3 rounded-2xl items-center bg-[#FAF7F3] border border-[#E8DDD2]">
                        <Text className="text-[13px] font-semibold text-[#6B4226]">
                            {showAllCategories ? 'Show Less' : 'Load More'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Materials */}
            <View className="flex-row items-center mt-6 mb-3">
                <View className="w-1 h-4 rounded bg-[#B5743F] mr-2" />
                <Text className="text-[11px] font-extrabold uppercase tracking-widest text-[#5C4638]">
                    Materials
                </Text>
            </View>

            {materials.length === 0 ? (
                <Text className="text-[13px] italic text-[#B6A79A]">
                    No materials available yet
                </Text>
            ) : (
                <View className="flex-row flex-wrap gap-2">
                    {visibleMaterials.map((m) => {
                        const active = selectedMaterials.includes(m);

                        return (
                            <TouchableOpacity key={m} onPress={() => toggleMaterial(m)}
                                className={`px-4 py-2 rounded-full border ${active
                                    ? 'bg-[#5B3213] border-[#5B3213]'
                                    : 'bg-[#FAF7F3] border-[#E5D9CD]'
                                    }`} >
                                <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-[#8A7668]'}`}>
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
            
            {materials.length > 20 && (
                <TouchableOpacity onPress={() => setShowAllMaterials(!showAllMaterials)} className="mt-3 py-3 rounded-2xl items-center bg-[#FAF7F3] border border-[#E5D9CD]">
                    <Text className="text-[13px] font-semibold text-[#6B4226]">
                        {showAllMaterials ? 'Show Less' : 'Load More'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Reset Button */}
            <TouchableOpacity onPress={onClear} className="mt-6 py-4 rounded-2xl border border-[#E5D9CD] items-center bg-[#FAF7F3]">
                <Text className="text-[13px] font-bold tracking-wide text-[#6B4226]">
                    {hasActiveFilters ? 'Reset Filters' : 'No Active Filters'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}