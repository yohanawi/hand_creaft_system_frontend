import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

const materials = [
    {
        icon: "star" as const,
        title: "Precious Gems",
        desc: "Hand-selected diamonds, sapphires & rubies graded for brilliance",
    },
    {
        icon: "circle" as const,
        title: "Pure Gold",
        desc: "18k & 22k certified gold sourced from ethical suppliers worldwide",
    },
    {
        icon: "shield" as const,
        title: "Hallmarked",
        desc: "Every piece certified & hallmarked to international purity standards",
    },
    {
        icon: "heart" as const,
        title: "Crafted with Love",
        desc: "Master artisans with 20+ years of goldsmithing heritage",
    },
];

const certifications = [
    { icon: "check-circle" as const, label: "Quality\nAssured" },
    { icon: "home" as const, label: "In-house\nWorkshop" },
    { icon: "award" as const, label: "Lifetime\nWarranty" },
    { icon: "map-pin" as const, label: "Ethical\nSourcing" },
];

export default function Materials_Quality_Section() {
    return (

        <View className="py-32 overflow-hidden bg-gray-100" style={{ paddingHorizontal: 20 }}>
            <View style={{ alignItems: "center", marginBottom: 28 }}>
                <View className="flex-row items-center justify-center gap-3 mx-auto mb-4">
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                    <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                        Our Promise
                    </span>
                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                </View>
                <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer">
                    Materials & <em className="italic text-[#714329]">Quality</em>
                </h1>
            </View>

            {/* Material Cards Grid */}
            <View className="grid max-w-6xl grid-cols-1 gap-4 mx-auto mb-12 md:grid-cols-2 lg:grid-cols-4">
                {materials.map((item, i) => (
                    <View key={i} className="relative flex-col items-center gap-2 p-6 text-center bg-white rounded-lg">
                        {/* Top accent line */}
                        <View className="absolute top-0 left-0 right-0 h-0.5 bg-[#B08463] rounded-t-lg" />

                        <LinearGradient colors={["#B08463", "#714329"]} className="flex items-center justify-center w-10 h-10 mb-2 rounded-full">
                            <Feather name={item.icon} size={18} color="#FFFFFF" />
                        </LinearGradient>

                        <Text className="text-lg font-semibold text-[#714329] font-heading">
                            {item.title}
                        </Text>
                        <Text className="text-sm text-[#6B6B6B] leading-relaxed text-center">
                            {item.desc}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Promise Quote Card */}
            <View className="p-6 mx-auto mb-12 bg-white rounded-lg" style={{ maxWidth: 600 }}>
                <Text className="text-sm italic text-[#1C1C1C] mb-4 text-center">
                    "Every gemstone we set, every gram of gold we shape, carries the
                    weight of a promise - to last a lifetime and beyond."
                </Text>
                <Text className="text-xs font-bold uppercase text-[#714329] tracking-[0.2em] text-center">
                    ✦ The Craftsman's Pledge
                </Text>
            </View>

            {/* Certifications Row */}
            <View className="flex-row items-center justify-center gap-8">
                {certifications.map((cert, i) => (
                    <View key={i} className="flex-col items-center gap-1.5">
                        <View className="w-12 h-12 rounded-full border border-[#7143295A] flex items-center justify-center bg-white">
                            <Feather name={cert.icon} size={20} color="#714329" />
                        </View>
                        <Text className="font-semibold uppercase text-[#6B6B6B] text-center text-sm ">
                            {cert.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View >
    );
}
