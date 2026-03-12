import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { BLOGS } from '../../Data/blog-data';
import { BlogCard } from '../ui/blog_card';

export default function BlogSection() {

    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const TOTAL = BLOGS.length;
    const EXTENDED = [...BLOGS, ...BLOGS, ...BLOGS];
    const AUTO_PLAY_INTERVAL = 3200;
    const sectionFade = useRef(new Animated.Value(0)).current;
    const sectionSlide = useRef(new Animated.Value(40)).current;

    const isMobile = SCREEN_WIDTH < 768;
    const CARD_WIDTH = isMobile
        ? SCREEN_WIDTH - 64
        : (SCREEN_WIDTH - 160) / 3;
    const CARD_MARGIN = 20;
    const CARD_STEP = CARD_WIDTH + CARD_MARGIN;
    const SIDE_SPACE = (SCREEN_WIDTH - CARD_WIDTH) / 2;
    const scrollRef = useRef<ScrollView>(null);
    const currentIndexRef = useRef(TOTAL); // start at second copy
    const [activeIndex, setActiveIndex] = useState(0);
    const isScrollingRef = useRef(false);

    // Progress bar for auto-play
    const progressAnim = useRef(new Animated.Value(0)).current;
    const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);

    // Dot scale animations
    const dotScales = useRef(BLOGS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(sectionFade, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.spring(sectionSlide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();

        // Initial scroll to second copy without animation
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: TOTAL * CARD_STEP, animated: false });
        }, 50);
    }, []);

    const animateDots = useCallback((nextActive: number) => {
        BLOGS.forEach((_, i) => {
            Animated.spring(dotScales[i], {
                toValue: i === nextActive ? 1 : 0,
                tension: 80,
                friction: 6,
                useNativeDriver: true,
            }).start();
        });
    }, [dotScales]);

    const startProgress = useCallback(() => {
        progressAnimRef.current?.stop();
        progressAnim.setValue(0);
        progressAnimRef.current = Animated.timing(progressAnim, {
            toValue: 1,
            duration: AUTO_PLAY_INTERVAL,
            useNativeDriver: false,
        });
        progressAnimRef.current.start();
    }, [progressAnim]);

    const scrollToIndex = useCallback((index: number, animated = true) => {
        scrollRef.current?.scrollTo({ x: index * CARD_STEP, animated });
        currentIndexRef.current = index;
        const active = index % TOTAL;
        setActiveIndex(active);
        animateDots(active);
        startProgress();
    }, [CARD_STEP, animateDots, startProgress]);

    // Auto-play
    useEffect(() => {
        startProgress();
        const timer = setInterval(() => {
            if (!isScrollingRef.current) {
                const next = currentIndexRef.current + 1;
                scrollToIndex(next, true);

                // Silently jump back to middle copy when entering third copy
                if (next >= TOTAL * 2) {
                    setTimeout(() => {
                        const resetTo = next - TOTAL;
                        scrollRef.current?.scrollTo({ x: resetTo * CARD_STEP, animated: false });
                        currentIndexRef.current = resetTo;
                    }, 350);
                }
            }
        }, AUTO_PLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [scrollToIndex, startProgress]);

    const handleScrollEnd = (e: any) => {
        isScrollingRef.current = false;
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / CARD_STEP);
        currentIndexRef.current = index;
        const active = index % TOTAL;
        setActiveIndex(active);
        animateDots(active);
        startProgress();

        // Silently reposition if in first or third copy
        if (index < TOTAL) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ x: (index + TOTAL) * CARD_STEP, animated: false });
                currentIndexRef.current = index + TOTAL;
            }, 0);
        } else if (index >= TOTAL * 2) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ x: (index - TOTAL) * CARD_STEP, animated: false });
                currentIndexRef.current = index - TOTAL;
            }, 0);
        }
    };

    const handleManualDot = (i: number) => {
        const base = Math.floor(currentIndexRef.current / TOTAL) * TOTAL;
        scrollToIndex(base + i, true);
    };

    const goNext = () => {
        const next = currentIndexRef.current + 1;
        scrollToIndex(next, true);
    };

    const goPrev = () => {
        const prev = currentIndexRef.current - 1;
        scrollToIndex(prev, true);
    };

    const ctaRowMxClass = isMobile ? 'mx-6' : 'mx-40';

    return (

        <Animated.View style={{ opacity: sectionFade, transform: [{ translateY: sectionSlide }] }} className="overflow-hidden bg-brown-Background">
            <View className="absolute -top-[60px] -right-[60px] w-[220px] h-[220px] rounded-full bg-brown-DarkColor opacity-5" />
            <View className="absolute bottom-10 -left-20 w-[300px] h-[300px] rounded-full bg-indigo-400 opacity-5" />

            {/* Section Header */}
            <View className="px-6 pt-20 mb-8">
                <Text className={`${isMobile ? 'text-3xl' : 'text-4xl'} text-brown-DarkColor text-center font-extrabold mb-2`}>
                    Latest from Our Blog
                </Text>
                <View className="flex-row items-center justify-center mb-3">
                    <View className="w-9 h-0.5 bg-brown-DarkColor rounded-full mr-2.5" />
                    <Feather name="book-open" size={22} color="#714329" />
                    <View className="w-9 h-0.5 bg-brown-DarkColor rounded-full ml-2.5" />
                </View>
                <Text className="text-gray-500 text-center text-[15px] leading-[22px]">
                    Stay updated with the latest trends, tips, and insights
                </Text>
            </View>

            {/* Swiper */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={CARD_STEP}
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: SIDE_SPACE,
                }}
                onScrollBeginDrag={() => { isScrollingRef.current = true; }}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                className="py-10"
            >
                {EXTENDED.map((blog, i) => {
                    const centerIndex = currentIndexRef.current;
                    const isActive = i === centerIndex;

                    return (
                        <BlogCard
                            key={`${blog.id}-${i}`}
                            blog={blog}
                            cardWidth={CARD_WIDTH}
                            cardMargin={CARD_MARGIN}
                            isActive={isActive}
                        />
                    );
                })}
            </ScrollView>

            {/* Dot Indicators + Progress */}
            <View className="items-center mt-7">
                {/* Dots */}
                <View className="flex-row items-center gap-2">
                    {BLOGS.map((blog, i) => {
                        const isActiveDot = i === activeIndex;
                        return (
                            <TouchableOpacity
                                key={blog.id}
                                onPress={() => handleManualDot(i)}
                                activeOpacity={0.7}
                            >
                                <Animated.View
                                    className={`h-2 rounded-full ${isActiveDot ? 'bg-brown-DarkColor' : 'bg-brown-lightBackground'}`}
                                    style={{
                                        width: dotScales[i].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [8, 28],
                                        }),
                                        transform: [{
                                            scaleY: dotScales[i].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.8, 1],
                                            }),
                                        }],
                                    }}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* View All Button */}
            <View className={`flex-row items-center justify-between gap-5 ${ctaRowMxClass} mt-5 pb-20`}>
                {/* Prev Button */}
                <TouchableOpacity
                    onPress={goPrev}
                    activeOpacity={0.8}
                    className="w-[90px] h-[50px] rounded-full bg-white flex-row items-center justify-center px-[10px] shadow-lg"
                >
                    <Feather name="chevron-left" size={22} color="#714329" />
                    <Text className="text-brown-DarkColor font-bold ml-1.5">
                        Next
                    </Text>
                </TouchableOpacity>

                {/* Center CTA */}
                <View className="items-center px-6">
                    <TouchableOpacity
                        activeOpacity={0.85}
                        className="flex-row items-center px-8 py-[14px] bg-brown-DarkColor rounded-full shadow-xl"
                    >
                        <Text className="text-white font-bold text-[15px] mr-2">
                            View All Articles
                        </Text>
                        <Feather name="arrow-right" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    onPress={goNext}
                    activeOpacity={0.8}
                    className="w-[90px] h-[50px] rounded-full bg-white flex-row items-center justify-center px-[10px] shadow-lg"
                >
                    <Text className="text-brown-DarkColor font-bold mr-1.5">
                        Prev
                    </Text>
                    <Feather name="chevron-right" size={22} color="#714329" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}


