import AboutBrandSection from '@/components/Home/AboutBrandSection';
import BestSellersSection from '@/components/Home/BestSellersSection';
import CategorySection from '@/components/Home/CategorySection';
import FeatureSection from '@/components/Home/FeatuerSection';
import FlashSaleBanner from '@/components/Home/FlashSaleBanner';
import HeroSection from '@/components/Home/HeroSection';
import InstagramGallerySection from '@/components/Home/InstagramGallerySection';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import PageShell from '@/components/PageShell';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import React from 'react';
import { Animated, View } from 'react-native';

export default function HomeScreen() {
    const { scrollY, onScroll } = useHeaderScroll();

    return (
        <View className="flex-1 bg-white">
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    {/* Hero Swiper */}
                    <HeroSection />
                    {/* Trust Features Bar */}
                    <FeatureSection />

                    {/* Best Sellers Swiper */}
                    <BestSellersSection />

                    {/* About Brand / Artisan Story */}
                    <AboutBrandSection />

                    {/* Flash Sale Banner + Countdown */}
                    <FlashSaleBanner />

                    {/* Browse Categories */}
                    <CategorySection />

                    {/* Instagram / Gallery Grid */}
                    <InstagramGallerySection />

                    {/* Customer Testimonials Swiper */}
                    <TestimonialsSection />
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
