import { BRAND_FONTS } from "@/constants/brandTheme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    ImageBackground,
    Pressable,
    Text,
    View,
} from "react-native";

import useCategoryLayout from "./useCategoryLayout";

type Props = {
    categoryCount: number;
    featuredNames: string[];
};

export default function CategoryHero({ categoryCount, featuredNames }: Props) {
    const router = useRouter();
    const { horizontalPadding, isCompact, maxContentWidth } = useCategoryLayout();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(26)).current;
    const badgeScale = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(translateAnim, {
                toValue: 0,
                tension: 58,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.spring(badgeScale, {
                toValue: 1,
                tension: 70,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const curated = featuredNames.slice(0, 3);

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1974&auto=format&fit=crop",
            }}
            resizeMode="cover" className="h-[540px] w-full overflow-hidden pt-28">
            <LinearGradient colors={["rgba(18,8,4,0.94)", "rgba(55,28,14,0.62)", "rgba(0,0,0,0.85)",]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0" />

            <View className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#F0C9A8]/15" />
            <View className="absolute -right-28 bottom-20 h-80 w-80 rounded-full bg-[#B87333]/20" />

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }], }} className="self-center w-full h-full px-6 py-10">
                {/* Center Content */}
                <View className="items-center justify-center flex-1">
                    <Animated.View style={{ transform: [{ scale: badgeScale }] }} className="mb-5 rounded-full border border-[#F0C9A8]/30 bg-white/10 px-5 py-2">
                        <Text style={{ fontFamily: BRAND_FONTS.body }} className="text-[11px] font-black uppercase tracking-[4px] text-[#F0C9A8]">
                            Category Discovery
                        </Text>
                    </Animated.View>

                    <Text style={{ fontFamily: BRAND_FONTS.heading }} className={`text-center font-black text-white 
                        ${isCompact ? "text-[44px] leading-[50px]" : "text-[62px] leading-[68px]"}`}>
                        Explore Our{"\n"}
                        <Text className="text-[#F0C9A8]">Jewelry Collections</Text>
                    </Text>

                    <Text style={{ fontFamily: BRAND_FONTS.body }} className="mt-5 max-w-[680px] text-center text-[15px] leading-7 text-white/70">
                        Browse handcrafted rings, necklaces, bracelets, earrings,
                        and premium artisan collections made with timeless beauty.
                    </Text>

                    <View className="flex-row flex-wrap justify-center gap-4 mt-8">
                        <Pressable onPress={() => router.push("/shop" as any)} className="flex-row items-center gap-2 rounded-full bg-[#F0C9A8] px-8 py-4">
                            <Text className="text-[13px] font-black uppercase tracking-[2px] text-[#2B160B]">
                                Shop Now
                            </Text>
                            <Feather name="arrow-right" size={16} color="#2B160B" />
                        </Pressable>

                        <Pressable onPress={() => router.push("/categories" as any)} className="flex-row items-center gap-2 px-8 py-4 border rounded-full border-white/20 bg-white/10">
                            <Text className="text-[13px] font-bold uppercase tracking-[2px] text-white">
                                View Categories
                            </Text>
                            <Feather name="grid" size={15} color="#FFFFFF" />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        </ImageBackground>
    );
}