import { BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import useCategoryLayout from './useCategoryLayout';

type Stat = {
    icon: React.ComponentProps<typeof Feather>['name'];
    value: string;
    label: string;
};

type Props = {
    stats: Stat[];
};

export default function CategoryStatsBar({ stats }: Props) {

    const { isCompact } = useCategoryLayout();

    return (
        <View className="my-10 bg-[#F7F0E8] px-4">

            {/* MAIN WRAPPER */}
            <View className="w-full max-w-6xl self-center rounded-[30px] bg-[#FFF9F3] p-3 md:p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">

                {stats.map((stat) => (
                    <View key={stat.label} className={`p-2 ${isCompact ? 'w-full' : 'w-1/4'}`}>
                        <View className="flex-row items-center gap-4 rounded-[22px] bg-white p-4">
                            {/* ICON */}
                            <View className="h-[48px] w-[48px] items-center justify-center rounded-[16px] mb-[14px] p-4" style={{ backgroundColor: '#F6EADF' }}>
                                <Feather name={stat.icon} size={20} color={BROWN.DarkColor} />
                            </View>
                            {/* TEXT */}
                            <View className="flex-1">
                                <Text className="text-[24px] font-extrabold text-[#4A2A1A]">
                                    {stat.value}
                                </Text>
                                <Text className="mt-[2px] text-[12px] text-[#8A6A55]">
                                    {stat.label}
                                </Text>
                            </View>

                        </View>
                    </View>
                ))}

            </View>

        </View>
    );
}