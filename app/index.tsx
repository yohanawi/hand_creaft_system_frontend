import CategorySection from '@/components/Home/CategorySection';
import FlashSaleBanner from '@/components/Home/FlashSaleBanner';
import AboutBrandSection from '@/components/Home/AboutBrandSection';
import BestSellersSection from '@/components/Home/BestSellersSection';
import BlogSection from '@/components/Home/BlogSection';
import FeatureSection from '@/components/Home/FeatuerSection';
import HeroSection from '@/components/Home/HeroSection';
import InstagramGallerySection from '@/components/Home/InstagramGallerySection';
import PopularProducts from '@/components/Home/PopularProducts';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import PageShell from '@/components/PageShell';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <PageShell>
                    {/* Hero Swiper */}
                    <HeroSection />

                    {/* Trust Features Bar */}
                    <FeatureSection />

                    {/* ⚡ Flash Sale Banner + Countdown */}
                    <FlashSaleBanner />

                    {/* Browse Categories */}
                    <CategorySection />

                    {/* 🛒 Popular / Featured Products */}
                    <PopularProducts />

                    {/* ❤️ Best Sellers Swiper */}
                    <BestSellersSection /> 

                    {/* 🌟 Customer Testimonials Swiper */}
                    <TestimonialsSection />

                    {/* 🏡 About Brand / Artisan Story */}
                    <AboutBrandSection />

                    {/* 📰 Blog Section */}
                    <View className="my-8">
                        <BlogSection />
                    </View>

                    {/* 📸 Instagram / Gallery Grid */}
                    <InstagramGallerySection />
                </PageShell>
            </ScrollView>
        </View>
    );
}
