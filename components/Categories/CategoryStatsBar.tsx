import { BROWN } from "@/constants/brandTheme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import useCategoryLayout from "./useCategoryLayout";

type Stat = {
    icon: React.ComponentProps<typeof Feather>["name"];
    value: string;
    label: string;
};

type Props = {
    stats: Stat[];
};

export default function CategoryStatsBar({ stats }: Props) {
    const { isCompact } = useCategoryLayout();

    return (
        <View className="bg-[#F7F0E8] px-4 py-32">
            <View className="self-center w-full max-w-6xl">
                {/* Header */}
                <View className="items-center mb-6">
                    <Text className="text-center text-[11px] font-black uppercase tracking-[4px] text-[#B87333]">
                        Collection Highlights
                    </Text>
                    <Text className="mt-2 text-center text-[28px] font-black text-[#3A2115]">
                        Crafted With Love & Detail
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap rounded-[34px] bg-[#FFF9F3] p-3">
                    {stats.map((stat, index) => (
                        <View key={stat.label} className={`${isCompact ? "w-full" : "w-1/4"} p-2`} >
                            <View className="relative overflow-hidden rounded-[28px] border border-[#EFE1D4] bg-white p-5">
                                {/* Soft Decorative Circle */}
                                <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F0C9A8]/25" />
                                {/* Icon */}
                                <View className="mb-5 h-[54px] w-[54px] items-center justify-center rounded-[18px] bg-[#F6EADF]">
                                    <Feather name={stat.icon} size={22} color={BROWN.DarkColor} />
                                </View>
                                {/* Value */}
                                <Text className="text-[30px] font-black text-[#3A2115]">
                                    {stat.value}
                                </Text>
                                {/* Label */}
                                <Text className="mt-1 text-[12px] font-semibold uppercase tracking-[1.5px] text-[#8A6A55]">
                                    {stat.label}
                                </Text>
                                {/* Bottom Accent */}
                                <View className="mt-5 h-1 w-14 rounded-full bg-[#F0C9A8]" />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}