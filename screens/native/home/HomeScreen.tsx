import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getAssetUrl, getCategories, getProducts } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { EmptyState } from '@/screens/native/shared/EmptyState';
import { ProductCard } from '@/screens/native/shared/ProductCard';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

const HERO_SLIDES = [
  {
    id: 'aurora',
    eyebrow: 'Ethically sourced',
    title: 'The Aurora hand-cut series',
    description: 'AI-curated jewellery, warm editorial photography, and a boutique flow adapted from the website for mobile shoppers.',
    imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=85',
    accent: '#d4af37',
    route: '/shop',
  },
  {
    id: 'artisan',
    eyebrow: 'Artisan spotlight',
    title: 'Sterling silver and turquoise',
    description: 'Layered storytelling, handcrafted collections, and quick purchase actions built for one-handed navigation.',
    imageUri: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1400&q=85',
    accent: '#8fd0c8',
    route: '/best-sellers',
  },
];

const BENEFITS = [
  {
    icon: 'truck',
    title: 'Artisanal delivery',
    subtitle: 'Carefully packaged orders with a premium unboxing feel.',
  },
  {
    icon: 'shield',
    title: 'Authenticity assured',
    subtitle: 'Certificates and trusted checkout flows stay visible on mobile.',
  },
  {
    icon: 'refresh-ccw',
    title: 'Easy recovery',
    subtitle: 'Cart, payment, and order paths are optimized for quick return visits.',
  },
];

const STORY_STATS = [
  { value: '2024', label: 'Founded' },
  { value: '50K+', label: 'Happy customers' },
  { value: '200+', label: 'Artisan products' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Interior Designer',
    text: 'Absolutely in love with the craftsmanship. The mobile experience now feels like the same premium brand as the website.',
  },
  {
    name: 'James O\'Brien',
    role: 'Collector',
    text: 'The product storytelling and quick actions feel polished and easy to browse on phone.',
  },
  {
    name: 'Priya Sharma',
    role: 'Gift Shopper',
    text: 'It finally feels like a boutique app instead of a generic storefront shell.',
  },
];

function HeroBanner({
  slide,
  activeIndex,
  onSelectSlide,
}: {
  slide: typeof HERO_SLIDES[number];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
}) {
  return (
    <View
      style={{
        minHeight: 440,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: nativeTheme.colors.primaryDark,
        ...nativeTheme.shadows.strong,
      }}
    >
      <Image source={{ uri: slide.imageUri }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} contentFit="cover" />
      <LinearGradient
        colors={['rgba(28, 20, 15, 0.18)', 'rgba(28, 20, 15, 0.58)', 'rgba(28, 20, 15, 0.94)']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View style={{ flex: 1, justifyContent: 'space-between', padding: 24 }}>
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255, 255, 255, 0.18)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {slide.eyebrow}
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ gap: 12 }}>
            <View style={{ width: 48, height: 3, borderRadius: 999, backgroundColor: slide.accent }} />
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 38, lineHeight: 44 }}>
              {slide.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.82)', fontFamily: nativeTheme.fonts.body, fontSize: 15, lineHeight: 24 }}>
              {slide.description}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <AppButton label="Explore collection" icon="arrow-right" variant="secondary" onPress={() => router.push(slide.route as never)} style={{ backgroundColor: nativeTheme.colors.white, borderColor: nativeTheme.colors.white }} />
            <AppButton label="Search by photo" icon="camera" variant="secondary" onPress={() => router.push('/ai-search' as never)} style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.22)' }} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {HERO_SLIDES.map((heroSlide, index) => {
              const active = index === activeIndex;

              return (
                <Pressable
                  key={heroSlide.id}
                  onPress={() => onSelectSlide(index)}
                  style={{
                    width: active ? 26 : 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: active ? nativeTheme.colors.white : 'rgba(255,255,255,0.34)',
                  }}
                />
              );
            })}
          </View>

          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>
              Boutique mobile experience
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function BenefitCard({ item }: { item: typeof BENEFITS[number] }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        gap: 10,
        padding: 18,
        borderRadius: nativeTheme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(113, 67, 41, 0.08)',
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
      }}
    >
      <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: nativeTheme.colors.cardStrong, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={item.icon as any} size={20} color={nativeTheme.colors.primary} />
      </View>
      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.heading, fontSize: 20, lineHeight: 24 }}>{item.title}</Text>
      <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{item.subtitle}</Text>
    </View>
  );
}

function CategoryHighlight({ category }: { category: any }) {
  const imageUri = getAssetUrl(category?.image);

  return (
    <Pressable
      onPress={() => router.push(`/shop?category=${encodeURIComponent(String(category?.slug || category?._id || ''))}` as never)}
      style={{ width: 220, marginRight: 14 }}
    >
      <View style={{ height: 280, borderRadius: nativeTheme.radius.xl, overflow: 'hidden', backgroundColor: nativeTheme.colors.primaryDark, ...nativeTheme.shadows.soft }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} contentFit="cover" />
        ) : null}
        <LinearGradient
          colors={imageUri ? ['rgba(20,10,2,0.08)', 'rgba(20,10,2,0.22)', 'rgba(12,7,3,0.88)'] : ['#8B4513', '#5b311d', '#2a160c']}
          locations={[0, 0.45, 1]}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View style={{ flex: 1, justifyContent: 'space-between', padding: 18 }}>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.92)' }}>
            <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Explore collection
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 28, lineHeight: 32 }} numberOfLines={2}>
              {String(category?.name || 'Collection')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>
                Curated for mobile browsing
              </Text>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="arrow-up-right" size={16} color={nativeTheme.colors.white} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function StoryPanel() {
  return (
    <SectionCard title="Crafted by local artisans" subtitle="The web storefront leans heavily on editorial storytelling, so the mobile home now keeps that same boutique tone instead of a generic dashboard.">
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {STORY_STATS.map((item) => (
            <View key={item.label} style={{ flex: 1, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.06)' }}>
              <Text style={{ color: nativeTheme.colors.primaryDark, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{item.value}</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, marginTop: 4 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 23 }}>
            Born from the same warm, editorial website experience, the APK now uses stronger hierarchy, softer surfaces, and mobile-sized actions that are easier to scan and tap.
          </Text>
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 23 }}>
            Customers can move from discovery to product details, cart, AI search, and account flows without leaving the branded boutique feel.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <AppButton label="Browse all products" icon="arrow-right" onPress={() => router.push('/shop' as never)} />
          <AppButton label="Open dashboard" icon="user" variant="secondary" onPress={() => router.push('/customer-dashboard' as never)} />
        </View>
      </View>
    </SectionCard>
  );
}

function TestimonialCard({ item }: { item: typeof TESTIMONIALS[number] }) {
  return (
    <View style={{ gap: 14, padding: 18, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.06)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(113, 67, 41, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.heading, fontSize: 28, lineHeight: 28 }}>“</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather key={star} name="star" size={13} color={nativeTheme.colors.accent} />
          ))}
        </View>
      </View>

      <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 23 }}>
        {item.text}
      </Text>

      <View>
        <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '800' }}>{item.name}</Text>
        <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, marginTop: 2 }}>{item.role}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()]);
        if (!mounted) {
          return;
        }

        const nextProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
        const nextCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

        const featuredProducts = nextProducts.filter((product) => Boolean(product?.isFeatured));

        setProducts((featuredProducts.length > 0 ? featuredProducts : nextProducts).slice(0, 4));
        setCategories(nextCategories.filter((category) => !category?.parent).slice(0, 6));
      } catch {
        if (!mounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeSlide = HERO_SLIDES[activeHeroIndex];

  return (
    <AppScreen title="HandCraft mobile boutique" subtitle="A storefront-inspired customer experience tuned for APK delivery." showPageIntro={false}>
      <HeroBanner slide={activeSlide} activeIndex={activeHeroIndex} onSelectSlide={setActiveHeroIndex} />

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 2, borderRadius: 999, backgroundColor: nativeTheme.colors.primary }} />
          <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
            Why it feels premium
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          {BENEFITS.map((item) => (
            <BenefitCard key={item.title} item={item} />
          ))}
        </View>
      </View>

      <SectionCard title="Shop by collection" subtitle="These category cards mirror the web storefront’s editorial tiles, resized for thumb-friendly browsing.">
        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 6 }}>
            {categories.map((category) => (
              <CategoryHighlight key={String(category?._id || category?.slug || category?.name)} category={category} />
            ))}
          </ScrollView>
        ) : (
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
            Categories will appear here when the storefront API responds.
          </Text>
        )}
      </SectionCard>

      {products.length === 0 ? (
        <EmptyState
          title="Featured pieces are loading"
          message="The redesigned mobile home is already wired to the existing product APIs. Once the backend responds, this section fills with the same premium merchandise emphasis as the web storefront."
          actionLabel="Open catalog"
          onAction={() => router.push('/shop' as never)}
        />
      ) : (
        <SectionCard title="Best sellers" subtitle="Styled to match the website’s warm product storytelling, but stacked and paced for small screens.">
          <View style={{ gap: 14 }}>
            {products.map((product) => (
              <ProductCard
                key={String(product?._id)}
                product={product}
                onPress={() => router.push(`/product-single?id=${product._id}` as never)}
              />
            ))}
            <AppButton label="See full catalog" icon="arrow-right" variant="ghost" onPress={() => router.push('/shop' as never)} />
          </View>
        </SectionCard>
      )}

      <StoryPanel />

      <SectionCard title="Loved by customers" subtitle="Social proof remains a visible design cue from the website, but each review is compressed into mobile-friendly cards.">
        <View style={{ gap: 12 }}>
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.name} item={item} />
          ))}
        </View>
      </SectionCard>
    </AppScreen>
  );
}