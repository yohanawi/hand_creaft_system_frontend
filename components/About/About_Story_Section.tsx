import { ResizeMode, Video } from "expo-av";
import { ArrowRight } from "lucide-react-native";
import React, { useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

export default function About_Story_Section() {
    const { width: W } = Dimensions.get("window");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 55,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 55,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isMobile = W < 768;
    const px = isMobile ? 20 : 48;

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="bg-[#FAF6F2]" style={{ paddingVertical: 72, paddingHorizontal: px }}>
                <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                    <View className={isMobile ? "flex-col" : "flex-row items-center"}>
                        {/* Text column */}
                        <View style={{ flex: 1, marginRight: isMobile ? 0 : 56, marginBottom: isMobile ? 40 : 0, }}>
                            <View style={{ alignItems: "flex-start", marginBottom: 28 }}>
                                <View className="flex-row items-center justify-start gap-3 mb-4">
                                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                                    <span className="text-[#714329] uppercase tracking-[0.3em] text-xs font-bold">
                                        Our Story
                                    </span>
                                    <div className="h-px w-8 bg-[rgba(113,67,41,0.35)]" />
                                </View>
                                <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4 leading-tight animate-shimmer text-start">
                                    Craftsmanship Born <br /><em className="italic text-[#714329]">From Passion</em>
                                </h1>
                            </View>

                            <Text className="mb-4 text-base leading-7 text-brown-TextSecondary">
                                Founded in 2007 in a small Colombo workshop, ArtisanGems was
                                born from a single master jeweller's lifelong devotion to the
                                craft. What started with a hammer, an anvil, and a burning
                                passion for perfection has grown into Sri Lanka's most
                                celebrated artisan jewellery house.
                            </Text>
                            <Text className="mb-4 text-base leading-7 text-brown-TextSecondary">
                                Our founder believed jewellery should outlive its wearer - not
                                just physically, but emotionally. Every ring, pendant, and
                                bracelet is imbued with intent: to mark milestones, celebrate
                                love, and carry forward the stories of those who wear them.
                            </Text>
                            <Text className="mb-8 text-base leading-7 text-brown-TextSecondary">
                                We never mass-produce. Each piece is hand-finished by our
                                artisans, individually inspected, and only released when it
                                meets our exacting standards - a promise kept since the very
                                first piece we made.
                            </Text>
                            <button className="flex items-center w-[17rem] gap-3 px-8 py-4 font-bold text-white transition-all duration-300 rounded-full shadow-xl group bg-stone-900 hover:bg-amber-950 hover:shadow-amber-900/20 active:scale-95">
                                Explore Our Collections
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </View>

                        {/* Visual column */}
                        <View style={{ flex: isMobile ? undefined : 1 }}>
                            <View style={{ height: isMobile ? 260 : 320, }} className="relative overflow-hidden rounded-2xl">
                                <Video source={{ uri: "https://www.pexels.com/download/video/6263485/", }}
                                    style={{
                                        position: "absolute",
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay
                                    isLooping
                                    isMuted
                                />
                            </View>
                            {/* Mini stat cards */}
                            <View className="flex-row mt-4" style={{ gap: 10 }}>
                                {[
                                    { v: "18+", l: "Years" },
                                    { v: "5K+", l: "Pieces" },
                                    { v: "28K+", l: "Clients" },
                                ].map((s, i) => (
                                    <View key={i} className="items-center flex-1 py-4 border rounded-2xl bg-brown-Background border-brown-Border">
                                        <Text className="text-xl font-extrabold text-brown-DarkColor">
                                            {s.v}
                                        </Text>
                                        <Text className="text-xs font-medium mt-0.5 text-brown-TextSecondary uppercase">
                                            {s.l}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}
