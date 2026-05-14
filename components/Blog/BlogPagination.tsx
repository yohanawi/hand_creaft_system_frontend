import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function BlogPagination({ currentPage, totalPages, onPageChange, }: Props) {

    if (totalPages <= 1) return null;

    return (
        <View className="flex-row items-center justify-center mt-8">
            <TouchableOpacity onPress={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1} className={`mr-2 h-11 w-11 items-center justify-center rounded-full ${currentPage === 1 ? 'bg-[#E5D8CA]' : 'bg-[#3A2418]'}`}>
                <Feather name="chevron-left" size={20} color={currentPage === 1 ? '#9B8778' : '#fff'} />
            </TouchableOpacity>

            {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const active = currentPage === page;

                return (
                    <TouchableOpacity key={page} onPress={() => onPageChange(page)}
                        className={`mx-1 h-11 w-11 items-center justify-center rounded-full ${active ? 'bg-[#C99A45]' : 'bg-[#F6E8D8]'}`}>
                        <Text className={`font-bold ${active ? 'text-white' : 'text-[#5A321E]'}`}>
                            {page}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages} className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-[#E5D8CA]' : 'bg-[#3A2418]'}`}>
                <Feather name="chevron-right" size={20} color={currentPage === totalPages ? '#9B8778' : '#fff'} />
            </TouchableOpacity>
        </View>
    );
}