import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Animated,
    ImageBackground,
    Pressable,
    Text,
    View,
} from "react-native";

export default function HeroSection({
    heroStats,
    heroOpacity,
    heroSlide,
    heroBadgeScale,
}: any) {

    const router = useRouter();

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            }}
            resizeMode="cover" className="h-[600px] w-full overflow-hidden pt-20">
            {/* Luxury Overlay */}
            <LinearGradient colors={["rgba(15,8,5,0.92)", "rgba(35,20,12,0.60)", "rgba(0,0,0,0.82)",]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0" />

            {/* Glow Effects */}
            <View className="absolute -left-20 top-32 h-56 w-56 rounded-full bg-[#F0C9A8]/15" />
            <View className="absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-[#B87333]/20" />

            {/* Main Container */}
            <Animated.View
                style={{
                    opacity: heroOpacity,
                    transform: [{ translateY: heroSlide }],
                }} className="flex-1 px-6 pt-40">
                {/* CENTER CONTENT */}
                <View className="items-center justify-center flex-1">
                    {/* Badge */}
                    <Animated.View
                        style={{
                            transform: [{ scale: heroBadgeScale }],
                        }} className="mb-5 rounded-full border border-[#F0C9A8]/30 bg-white/10 px-5 py-2">
                        <Text className="text-[11px] font-black uppercase tracking-[4px] text-[#F0C9A8]">
                            Handcrafted Luxury Jewelry
                        </Text>
                    </Animated.View>

                    {/* Title */}
                    <Text className="text-center text-[58px] font-black leading-[62px] text-white font-heading">
                        Discover{"\n"}
                        <Text className="text-[#F0C9A8]">
                            Timeless Beauty
                        </Text>
                    </Text>

                    {/* Subtitle */}
                    <Text className="mt-5 max-w-[650px] text-center text-[15px] leading-7 text-white/70">
                        Explore handmade rings, necklaces, bracelets,
                        and artisan pieces crafted with elegance,
                        premium detail, and timeless craftsmanship.
                    </Text>

                    {/* CTA Buttons */}
                    <View className="flex-row gap-4 mt-8">
                        <Pressable onPress={() => router.push("/shop")} className="rounded-full bg-[#F0C9A8] px-8 py-4">
                            <Text className="text-[13px] font-black uppercase tracking-[2px] text-[#2B160B]">
                                Shop Now
                            </Text>
                        </Pressable>

                        <Pressable onPress={() => router.push("/categories")} className="px-8 py-4 border rounded-full border-white/20 bg-white/10 backdrop-blur-xl">
                            <Text className="text-[13px] font-bold uppercase tracking-[2px] text-white">
                                Explore
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* BOTTOM CENTER STATS */}
                <View className="items-center py-12">
                    <View className="w-full max-w-[850px] flex-row overflow-hidden rounded-[34px] border border-white/15 bg-white/10 backdrop-blur-xl">
                        {heroStats.map((stat: any, index: number) => (
                            <View key={stat.label} className={`flex-1 items-center py-6 ${index !== heroStats.length - 1 ? "border-r border-white/10" : ""}`}>
                                {/* Value */}
                                <Text className="text-[28px] font-black text-white">
                                    {stat.value}
                                </Text>
                                {/* Label */}
                                <Text className="mt-1 text-[10px] font-bold uppercase tracking-[3px] text-white/55">
                                    {stat.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </ImageBackground>
    );
}