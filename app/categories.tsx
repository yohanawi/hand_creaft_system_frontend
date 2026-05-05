import CategoryCard, { CategoryCardData } from '@/components/Categories/CategoryCard';
import CategoryHero from '@/components/Categories/CategoryHero';
import CategorySkeleton from '@/components/Categories/CategorySkeleton';
import CategoryStatePanel from '@/components/Categories/CategoryStatePanel';
import CategoryStatsBar from '@/components/Categories/CategoryStatsBar';
import CTACategory from '@/components/Categories/CTA_Category';
import useCategoryLayout from '@/components/Categories/useCategoryLayout';
import PageShell from '@/components/PageShell';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import api from '@/services/api';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

const STATS = [
    { icon: 'package' as const, value: '18,500+', label: 'Products' },
    { icon: 'grid' as const, value: '—', label: 'Categories' },
    { icon: 'star' as const, value: '4.9★', label: 'Avg. Rating' },
    { icon: 'truck' as const, value: 'Free', label: 'Shipping $50+' },
];

export default function CategoriesScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const { horizontalPadding, isCompact, maxContentWidth } = useCategoryLayout();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CategoryCardData[]>([]);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [catsRes, subsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/subcategories'),
            ]);
            const apiCategories = Array.isArray(catsRes.data) ? catsRes.data : [];
            const apiSubcategories = Array.isArray(subsRes.data) ? subsRes.data : [];
            const topLevel = apiCategories
                .filter((c: any) => !c.parent)
                .filter((c: any) => c.status !== 'inactive');

            const cards: CategoryCardData[] = topLevel.map((cat: any) => {
                const subs = apiSubcategories
                    .filter((s: any) => (s?.category?._id ?? s?.category) === cat._id)
                    .filter((s: any) => s.status !== 'inactive')
                    .map((s: any) => s.name)
                    .filter(Boolean);
                return {
                    id: cat._id,
                    name: cat.name,
                    description: cat.description || 'Discover handpicked artisan pieces in this collection.',
                    image: cat.image || undefined,
                    subcategories: subs,
                    itemCount: String(subs.length),
                    slug: cat.slug,
                };
            });
            setCategories(cards);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const statsWithCount = STATS.map((s) =>
        s.label === 'Categories' ? { ...s, value: String(categories.length || '—') } : s,
    );
    const subcategoryCount = categories.reduce((total, category) => total + category.subcategories.length, 0);
    const featuredNames = categories.map((category) => category.name);

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F0E8' }}>
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>
                    <CategoryHero categoryCount={categories.length} featuredNames={featuredNames} />
                    <CategoryStatsBar stats={statsWithCount} />

                    <View className='py-20' style={{ paddingHorizontal: horizontalPadding, paddingBottom: 44, backgroundColor: '#F7F0E8' }}>
                        <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                            {loading ? (
                                <CategorySkeleton />
                            ) : error ? (
                                <CategoryStatePanel variant="error" message={error} actionLabel="Try Again" onAction={loadCategories} />
                            ) : categories.length === 0 ? (
                                <CategoryStatePanel variant="empty" message="Categories will appear here as soon as they are published and marked active in the system." />
                            ) : (
                                <View style={{
                                    flexDirection: isCompact ? 'column' : 'row',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                }}>
                                    {categories.map((cat, index) => (
                                        <CategoryCard key={cat.id} category={cat} index={index} />
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View className='mt-16 mb-32' style={{ backgroundColor: '#F7F0E8' }}>
                        <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                            <CTACategory featuredNames={featuredNames} />
                        </View>
                    </View>

                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
