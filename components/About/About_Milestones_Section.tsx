import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    Text,
    View,
} from "react-native";

const milestones = [
    {
        year: "2007",
        tag: "Founded",
        isLeft: true,
        isLatest: false,
        title: "The First Workshop",
        desc: "Began as a single craftsman's workshop in Colombo's heritage district, born from a lifelong devotion to the craft.",
        stats: [
            { num: "1", lbl: "Artisan" },
            { num: "LKA", lbl: "Colombo" },
        ],
        icon: "🎨",
        accentColor: "#8B5A3C",
    },
    {
        year: "2012",
        tag: "First Gallery",
        isLeft: false,
        isLatest: false,
        title: "Artisan Showroom Opens",
        desc: "Opened our celebrated artisan showroom, welcoming collectors, connoisseurs, and first-time jewellery buyers.",
        stats: [
            { num: "500+", lbl: "Clients" },
            { num: "3", lbl: "Collections" },
        ],
        icon: "✨",
        accentColor: "#A0744D",
    },
    {
        year: "2018",
        tag: "Global Reach",
        isLeft: true,
        isLatest: false,
        title: "50+ Countries Reached",
        desc: "Achieved shipping to 50+ countries and recognition by the Sri Lanka Export Development Board.",
        stats: [
            { num: "50+", lbl: "Countries" },
            { num: "EDB", lbl: "Recognized" },
        ],
        icon: "🌍",
        accentColor: "#9B6B47",
    },
    {
        year: "2026",
        tag: "Today",
        isLeft: false,
        isLatest: true,
        title: "28,000+ Happy Clients",
        desc: "28,000+ satisfied clients across 80 countries — and still crafting, one extraordinary piece at a time.",
        stats: [
            { num: "28K+", lbl: "Clients" },
            { num: "80", lbl: "Countries" },
            { num: "19+", lbl: "Years" },
        ],
        icon: "👑",
        accentColor: "#FFD700",
    },
];

// ── Single milestone row ──────────────────────────────────────────────────────
function MilestoneRow({
    m,
    index,
}: {
    m: (typeof milestones)[0];
    index: number;
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(m.isLeft ? -30 : 30)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const [expanded, setExpanded] = useState(false);
    const expandAnim = useRef(new Animated.Value(0)).current;
    const [hovered, setHovered] = useState(false);
    const hoverAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 650,
                delay: 150 + index * 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 650,
                delay: 150 + index * 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 650,
                delay: 150 + index * 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        Animated.timing(hoverAnim, {
            toValue: hovered ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [hovered]);

    const toggleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        Animated.timing(expandAnim, {
            toValue: next ? 1 : 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const detailH = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80],
    });
    const shadowOpacity = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.12, 0.25],
    });
    const translateY = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    });

    // Card component (reused for both sides)
    const Card = () => (
        <Pressable
            onPress={toggleExpand}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
        >
            <Animated.View
                style={{
                    transform: [{ translateY }],
                    opacity: fadeAnim,
                }}
            >
                <View
                    style={{
                        backgroundColor: m.isLatest ? "#fffbf5" : "#fff",
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: m.isLatest
                            ? "rgba(255,215,0,0.35)"
                            : "rgba(113,67,41,0.15)",
                        padding: 16,
                        overflow: "hidden",
                        shadowColor: m.isLatest ? "#FFD700" : "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: shadowOpacity,
                        shadowRadius: 16,
                        elevation: 6,
                    }}
                >
                    {/* Accent bar — right side for left cards, left side for right cards */}
                    <LinearGradient
                        colors={
                            m.isLatest
                                ? ["#FFD700", "#FFA500", "#714329"]
                                : ["#B08463", "#714329", "#5C3D2E"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            ...(m.isLeft ? { right: 0 } : { left: 0 }),
                            width: m.isLatest ? 5 : 4,
                            borderRadius: m.isLeft ? undefined : undefined,
                            borderTopLeftRadius: m.isLeft ? 0 : 16,
                            borderBottomLeftRadius: m.isLeft ? 0 : 16,
                            borderTopRightRadius: m.isLeft ? 16 : 0,
                            borderBottomRightRadius: m.isLeft ? 16 : 0,
                        }}
                    />

                    {/* Icon and Tag */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                        <View
                            style={{
                                backgroundColor: m.isLatest
                                    ? "rgba(255,215,0,0.12)"
                                    : "rgba(113,67,41,0.08)",
                                borderWidth: 1,
                                borderColor: m.isLatest
                                    ? "rgba(255,215,0,0.25)"
                                    : "rgba(113,67,41,0.18)",
                                borderRadius: 999,
                                alignSelf: "flex-start",
                                paddingVertical: 3,
                                paddingHorizontal: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 7.5,
                                    fontWeight: "800",
                                    letterSpacing: 1.8,
                                    textTransform: "uppercase",
                                    color: m.isLatest ? "#D4A500" : "#714329",
                                }}
                            >
                                {m.tag}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={{
                            fontFamily: "PlayfairDisplay",
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#1C1C1C",
                            marginBottom: 6,
                            lineHeight: 22,
                        }}
                    >
                        {m.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#5A5A5A",
                            lineHeight: 18,
                            fontWeight: "400",
                        }}
                    >
                        {m.desc}
                    </Text>

                    {/* Expandable stats */}
                    <Animated.View style={{ height: detailH, overflow: "hidden" }}>
                        <View
                            style={{
                                marginTop: 10,
                                paddingTop: 10,
                                borderTopWidth: 1,
                                borderTopColor: m.isLatest
                                    ? "rgba(255,215,0,0.15)"
                                    : "rgba(113,67,41,0.1)",
                                flexDirection: "row",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            {m.stats.map((s, si) => (
                                <View key={si} style={{ marginBottom: 6 }}>
                                    <Text
                                        style={{
                                            fontFamily: "PlayfairDisplay",
                                            fontSize: 16,
                                            fontWeight: "900",
                                            color: m.isLatest ? "#FFD700" : "#714329",
                                        }}
                                    >
                                        {s.num}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 7.5,
                                            fontWeight: "700",
                                            letterSpacing: 1.2,
                                            textTransform: "uppercase",
                                            color: m.isLatest ? "#B08463" : "#A0744D",
                                        }}
                                    >
                                        {s.lbl}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </Animated.View>
        </Pressable>
    );

    // Center bubble - perfectly centered on vertical line
    const Bubble = () => (
        <View
            style={{
                width: 64,
                height: 72,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                position: "relative",
            }}
        >
            {/* Outer glow ring */}
            <Animated.View
                style={{
                    position: "absolute",
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    opacity: hoverAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 0.8],
                    }),
                    backgroundColor: m.isLatest
                        ? "rgba(255,215,0,0.15)"
                        : "rgba(176,132,99,0.1)",
                }}
            />

            {/* Middle ring */}
            <View
                style={{
                    position: "absolute",
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    borderWidth: 2,
                    borderColor: m.isLatest
                        ? "rgba(255,215,0,0.25)"
                        : "rgba(176,132,99,0.3)",
                }}
            />

            {/* Main bubble */}
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                    zIndex: 4,
                }}
            >
                <LinearGradient
                    colors={
                        m.isLatest
                            ? ["#FFD700", "#FFA500", "#714329"]
                            : ["#714329", "#8B5A3C", "#A0744D"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: m.isLatest ? "#FFD700" : "#000",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "PlayfairDisplay",
                            fontSize: 11,
                            fontWeight: "900",
                            color: m.isLatest ? "#fff" : "#FFF8DC",
                            letterSpacing: 0.5,
                        }}
                    >
                        {m.year}
                    </Text>
                    <View
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: m.isLatest ? "#fff" : "#FFD700",
                            marginTop: 4,
                            opacity: 0.8,
                        }}
                    />
                </LinearGradient>
            </Animated.View>
        </View>
    );

    // Arrow connector tip
    const Arrow = ({ side }: { side: "left" | "right" }) => (
        <View
            style={{
                position: "absolute",
                top: 22,
                ...(side === "right" ? { left: -10 } : { right: -10 }),
                width: 0,
                height: 0,
                borderTopWidth: 8,
                borderBottomWidth: 8,
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                ...(side === "right"
                    ? {
                        borderRightWidth: 11,
                        borderRightColor: m.isLatest ? "#fffbf5" : "#fff",
                    }
                    : {
                        borderLeftWidth: 11,
                        borderLeftColor: m.isLatest ? "#fffbf5" : "#fff",
                    }),
            }}
        />
    );

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: index < milestones.length - 1 ? 36 : 0,
                }}
            >
                {m.isLeft ? (
                    <>
                        {/* Card LEFT */}
                        <View style={{ flex: 1, paddingRight: 10, position: "relative" }}>
                            <Card />
                            <Arrow side="left" />
                        </View>
                        {/* Bubble CENTER */}
                        <Bubble />
                        {/* Empty RIGHT */}
                        <View style={{ flex: 1 }} />
                    </>
                ) : (
                    <>
                        {/* Empty LEFT */}
                        <View style={{ flex: 1 }} />
                        {/* Bubble CENTER */}
                        <Bubble />
                        {/* Card RIGHT */}
                        <View style={{ flex: 1, paddingLeft: 10, position: "relative" }}>
                            <Arrow side="right" />
                            <Card />
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    );
}

const Ring = ({
    size,
    top,
    right,
    bottom,
    left,
    delay = 0,
}: {
    size: number;
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    delay?: number;
}) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1200,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "rgba(113,67,41,0.04)",
                top,
                right,
                bottom,
                left,
                transform: [{ scale: scaleAnim }],
                opacity: 0.6,
            }}
        />
    );
};

export default function About_Milestones_Section() {
    const { width: W } = Dimensions.get("window");
    const px = W < 768 ? 20 : 48;

    const lineAnim = useRef(new Animated.Value(0)).current;
    const headerFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(lineAnim, {
                toValue: 1,
                duration: 2000,
                delay: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(headerFadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const lineH = lineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <View
            className="py-32 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
            style={{ paddingHorizontal: px }}
        >
            {/* Background decorative circles */}
            <Ring size={380} top={-140} right={-120} delay={200} />
            <Ring size={240} bottom={-90} left={-80} delay={400} />

            {/* Header */}
            <Animated.View
                style={{
                    alignItems: "center",
                    marginBottom: 36,
                    opacity: headerFadeAnim,
                }}
            >
                <View className="flex-row items-center justify-center gap-3 mx-auto mb-5">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(113,67,41,0.4)]" />
                    <span className="text-[#714329] uppercase tracking-[0.4em] text-xs font-bold">
                        Our Journey
                    </span>
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(113,67,41,0.4)]" />
                </View>
                <h1 className="text-5xl md:text-6xl font-serif text-[#1C1C1C] mb-3 leading-tight tracking-tight">
                    Milestones of{" "}
                    <em className="italic text-[#714329] font-serif">Mastery</em>
                </h1>
                <p className="text-[#6B6B6B] text-base md:text-lg max-w-2xl text-center leading-relaxed">
                    Two decades of craftsmanship, growth, and cherished connections with
                    our global community.
                </p>
            </Animated.View>

            {/* Timeline */}
            <View style={{ position: "relative" }}>
                {/* Center vertical line with glow */}
                <View
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: 20,
                        backgroundColor: "transparent",
                        transform: [{ translateX: -10 }],
                    }}
                >
                    {/* Glow effect */}
                    <View
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: 0,
                            bottom: 0,
                            width: 40,
                            backgroundColor: "rgba(176,132,99,0.08)",
                            borderRadius: 20,
                            transform: [{ translateX: -20 }],
                        }}
                    />

                    {/* Base line */}
                    <View
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: 20,
                            bottom: 20,
                            width: 3.5,
                            backgroundColor: "rgba(176,132,99,0.15)",
                            borderRadius: 3,
                            transform: [{ translateX: -1.75 }],
                            overflow: "hidden",
                        }}
                    >
                        {/* Animated gradient line */}
                        <Animated.View
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: lineH,
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            <LinearGradient
                                colors={["#B08463", "#714329", "#6B1A2F", "#8B4513"]}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    </View>
                </View>

                {milestones.map((m, i) => (
                    <MilestoneRow key={i} m={m} index={i} />
                ))}
            </View>
        </View>
    );
}
