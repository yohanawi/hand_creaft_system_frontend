import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

export type FeatherIconName = keyof typeof Feather.glyphMap;

export type InfoPageStat = {
    label: string;
    value: string;
};

export type InfoPageSection = {
    id: string;
    title: string;
    body: string[];
    bullets?: string[];
    note?: string;
};

export type InfoPageHighlight = {
    icon: FeatherIconName;
    title: string;
    description: string;
};

export type InfoPageLink = {
    title: string;
    description: string;
    route: string;
    icon: FeatherIconName;
};

export type InfoPageFaq = {
    question: string;
    answer: string;
};

export type InfoPageContent = {
    eyebrow: string;
    title: string;
    subtitle: string;
    lastUpdated: string;
    icon: FeatherIconName;
    gradient: [string, string, string];
    stats: InfoPageStat[];
    intro: string[];
    calloutTitle: string;
    calloutText: string;
    sections: InfoPageSection[];
    highlights?: InfoPageHighlight[];
    faqs?: InfoPageFaq[];
    links: InfoPageLink[];
    footerTitle: string;
    footerText: string;
};

type Props = {
    content: InfoPageContent;
};

function StatCard({ stat }: { stat: InfoPageStat }) {
    return (
        <View
            style={{
                minWidth: 140,
                flex: 1,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.16)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 16,
                paddingVertical: 14,
            }}
        >
            <Text
                style={{
                    color: '#F6DDC8',
                    fontFamily: BRAND_FONTS.body,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                }}
            >
                {stat.label}
            </Text>
            <Text
                style={{
                    marginTop: 8,
                    color: '#FFF9F2',
                    fontFamily: BRAND_FONTS.heading,
                    fontSize: 28,
                }}
            >
                {stat.value}
            </Text>
        </View>
    );
}

function SectionCard({ section, index }: { section: InfoPageSection; index: number }) {
    return (
        <View
            style={{
                borderRadius: 28,
                borderWidth: 1,
                borderColor: '#EADBCB',
                backgroundColor: '#FFFDF9',
                padding: 22,
                marginBottom: 16,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: '#F5E6D8',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: BROWN.DarkColor,
                            fontFamily: BRAND_FONTS.body,
                            fontSize: 14,
                            fontWeight: '800',
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: BROWN.TextPrimary,
                            fontFamily: BRAND_FONTS.heading,
                            fontSize: 26,
                            lineHeight: 32,
                        }}
                    >
                        {section.title}
                    </Text>

                    {section.body.map((paragraph) => (
                        <Text
                            key={paragraph}
                            style={{
                                marginTop: 12,
                                color: BROWN.TextSecondary,
                                fontFamily: BRAND_FONTS.body,
                                fontSize: 14,
                                lineHeight: 24,
                            }}
                        >
                            {paragraph}
                        </Text>
                    ))}

                    {section.bullets?.length ? (
                        <View style={{ marginTop: 14, gap: 10 }}>
                            {section.bullets.map((bullet) => (
                                <View key={bullet} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#B88258',
                                            marginTop: 8,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            flex: 1,
                                            color: BROWN.TextSecondary,
                                            fontFamily: BRAND_FONTS.body,
                                            fontSize: 14,
                                            lineHeight: 24,
                                        }}
                                    >
                                        {bullet}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {section.note ? (
                        <View
                            style={{
                                marginTop: 16,
                                borderRadius: 18,
                                backgroundColor: '#FAF1E8',
                                borderWidth: 1,
                                borderColor: '#E9D8C9',
                                padding: 14,
                            }}
                        >
                            <Text
                                style={{
                                    color: BROWN.DarkColor,
                                    fontFamily: BRAND_FONTS.body,
                                    fontSize: 13,
                                    lineHeight: 22,
                                    fontWeight: '600',
                                }}
                            >
                                {section.note}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

function HighlightCard({ item }: { item: InfoPageHighlight }) {
    return (
        <View
            style={{
                flex: 1,
                minWidth: 220,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#E7D7C8',
                backgroundColor: '#FFF8F1',
                padding: 18,
            }}
        >
            <View
                style={{
                    width: 46,
                    height: 46,
                    borderRadius: 18,
                    backgroundColor: '#4A2E24',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Feather name={item.icon} size={18} color="#F4E3D0" />
            </View>
            <Text
                style={{
                    marginTop: 14,
                    color: BROWN.TextPrimary,
                    fontFamily: BRAND_FONTS.heading,
                    fontSize: 22,
                    lineHeight: 28,
                }}
            >
                {item.title}
            </Text>
            <Text
                style={{
                    marginTop: 8,
                    color: BROWN.TextSecondary,
                    fontFamily: BRAND_FONTS.body,
                    fontSize: 14,
                    lineHeight: 23,
                }}
            >
                {item.description}
            </Text>
        </View>
    );
}

function LinkCard({ item, onPress }: { item: InfoPageLink; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={{
                flex: 1,
                minWidth: 220,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#E7D8C9',
                backgroundColor: '#FFFDF9',
                padding: 18,
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 18,
                    backgroundColor: '#F4E5D6',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Feather name={item.icon} size={18} color={BROWN.DarkColor} />
            </View>

            <Text
                style={{
                    marginTop: 14,
                    color: BROWN.TextPrimary,
                    fontFamily: BRAND_FONTS.heading,
                    fontSize: 24,
                    lineHeight: 30,
                }}
            >
                {item.title}
            </Text>
            <Text
                style={{
                    marginTop: 8,
                    color: BROWN.TextSecondary,
                    fontFamily: BRAND_FONTS.body,
                    fontSize: 14,
                    lineHeight: 23,
                }}
            >
                {item.description}
            </Text>

            <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                    style={{
                        color: BROWN.DarkColor,
                        fontFamily: BRAND_FONTS.body,
                        fontSize: 13,
                        fontWeight: '700',
                    }}
                >
                    Open page
                </Text>
                <Feather name="arrow-right" size={15} color={BROWN.DarkColor} />
            </View>
        </TouchableOpacity>
    );
}

function FaqAccordion({ faqs }: { faqs: InfoPageFaq[] }) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <View style={{ gap: 12 }}>
            {faqs.map((faq, index) => {
                const isOpen = index === openIndex;
                return (
                    <Pressable
                        key={faq.question}
                        onPress={() => setOpenIndex((current) => (current === index ? -1 : index))}
                        style={{
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: '#E8D9CB',
                            backgroundColor: '#FFFDF9',
                            padding: 18,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                            <Text
                                style={{
                                    flex: 1,
                                    color: BROWN.TextPrimary,
                                    fontFamily: BRAND_FONTS.heading,
                                    fontSize: 22,
                                    lineHeight: 28,
                                }}
                            >
                                {faq.question}
                            </Text>
                            <View
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 12,
                                    backgroundColor: '#F5E6D8',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Feather name={isOpen ? 'minus' : 'plus'} size={16} color={BROWN.DarkColor} />
                            </View>
                        </View>
                        {isOpen ? (
                            <Text
                                style={{
                                    marginTop: 12,
                                    color: BROWN.TextSecondary,
                                    fontFamily: BRAND_FONTS.body,
                                    fontSize: 14,
                                    lineHeight: 24,
                                }}
                            >
                                {faq.answer}
                            </Text>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function InfoPageTemplate({ content }: Props) {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const isCompact = width < 768;
    const horizontalPadding = width < 420 ? 14 : isCompact ? 16 : width < 1180 ? 24 : 32;
    const maxContentWidth = 1180;

    const introCards = useMemo(() => content.intro.slice(0, 2), [content.intro]);

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F1EB' }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <LinearGradient
                            colors={content.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ paddingHorizontal: horizontalPadding, paddingTop: isCompact ? 70 : 92, paddingBottom: isCompact ? 44 : 60 }}
                        >
                            <View style={{ position: 'absolute', top: -110, right: -70, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                            <View style={{ position: 'absolute', bottom: -100, left: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)' }} />

                            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                <View style={{ flexDirection: width < 1024 ? 'column' : 'row', gap: 24, justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, maxWidth: width < 1024 ? undefined : 700 }}>
                                        <View style={{ alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8 }}>
                                            <Text style={{ color: '#F6DDC8', fontFamily: BRAND_FONTS.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                                                {content.eyebrow}
                                            </Text>
                                        </View>

                                        <Text style={{ marginTop: 18, color: '#FFF9F2', fontFamily: BRAND_FONTS.heading, fontSize: isCompact ? 40 : 60, lineHeight: isCompact ? 46 : 66 }}>
                                            {content.title}
                                        </Text>
                                        <Text style={{ marginTop: 12, maxWidth: 620, color: 'rgba(255,249,242,0.78)', fontFamily: BRAND_FONTS.body, fontSize: 16, lineHeight: 27 }}>
                                            {content.subtitle}
                                        </Text>

                                        <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Feather name="clock" size={15} color="#F4D9C2" />
                                            <Text style={{ color: '#F4D9C2', fontFamily: BRAND_FONTS.body, fontSize: 13, fontWeight: '600' }}>
                                                Last updated: {content.lastUpdated}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ width: width < 1024 ? '100%' : 340, gap: 16 }}>
                                        <View style={{ borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.08)', padding: 20 }}>
                                            <View style={{ width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                                                <Feather name={content.icon} size={24} color="#FFF8F0" />
                                            </View>
                                            <Text style={{ marginTop: 14, color: '#FFF9F2', fontFamily: BRAND_FONTS.heading, fontSize: 28, lineHeight: 34 }}>
                                                Readable on every screen.
                                            </Text>
                                            <Text style={{ marginTop: 8, color: 'rgba(255,249,242,0.74)', fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 23 }}>
                                                The layout adapts across phones, tablets, and larger displays without relying on fixed one-time width checks.
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                    {content.stats.map((stat) => (
                                        <StatCard key={stat.label} stat={stat} />
                                    ))}
                                </View>
                            </View>
                        </LinearGradient>

                        <View style={{ paddingHorizontal: horizontalPadding, marginTop: -22 }}>
                            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                <View style={{ flexDirection: width < 980 ? 'column' : 'row', gap: 16 }}>
                                    <View style={{ flex: 1.25, gap: 16 }}>
                                        {introCards.map((paragraph) => (
                                            <View
                                                key={paragraph}
                                                style={{
                                                    borderRadius: 26,
                                                    borderWidth: 1,
                                                    borderColor: '#E9D9CB',
                                                    backgroundColor: '#FFFDF9',
                                                    padding: 20,
                                                }}
                                            >
                                                <Text style={{ color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 15, lineHeight: 26 }}>
                                                    {paragraph}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                borderRadius: 26,
                                                borderWidth: 1,
                                                borderColor: '#E9D9CB',
                                                backgroundColor: '#4A2E24',
                                                padding: 20,
                                            }}
                                        >
                                            <Text style={{ color: '#F3D8C0', fontFamily: BRAND_FONTS.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                                                KEY POINT
                                            </Text>
                                            <Text style={{ marginTop: 10, color: '#FFF9F2', fontFamily: BRAND_FONTS.heading, fontSize: 28, lineHeight: 34 }}>
                                                {content.calloutTitle}
                                            </Text>
                                            <Text style={{ marginTop: 10, color: 'rgba(255,249,242,0.78)', fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 24 }}>
                                                {content.calloutText}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 28 }}>
                            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                {content.sections.map((section, index) => (
                                    <SectionCard key={section.id} section={section} index={index} />
                                ))}
                            </View>
                        </View>

                        {content.highlights?.length ? (
                            <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 12 }}>
                                <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                    <Text style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.heading, fontSize: 32, lineHeight: 38 }}>
                                        Key Highlights
                                    </Text>
                                    <Text style={{ marginTop: 8, color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 24 }}>
                                        Quick reminders designed for faster scanning on smaller screens and broader reading on larger ones.
                                    </Text>

                                    <View style={{ marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                                        {content.highlights.map((item) => (
                                            <HighlightCard key={item.title} item={item} />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {content.faqs?.length ? (
                            <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 28 }}>
                                <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                    <Text style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.heading, fontSize: 32, lineHeight: 38 }}>
                                        Help & FAQ
                                    </Text>
                                    <Text style={{ marginTop: 8, color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 24 }}>
                                        Answers to the most common support, order, delivery, and account questions.
                                    </Text>
                                    <View style={{ marginTop: 18 }}>
                                        <FaqAccordion faqs={content.faqs} />
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 28 }}>
                            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
                                <Text style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.heading, fontSize: 32, lineHeight: 38 }}>
                                    Related Pages
                                </Text>
                                <Text style={{ marginTop: 8, color: BROWN.TextSecondary, fontFamily: BRAND_FONTS.body, fontSize: 14, lineHeight: 24 }}>
                                    Cross-linking the support and legal pages makes these routes easier to discover from anywhere in the storefront.
                                </Text>

                                <View style={{ marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                                    {content.links.map((item) => (
                                        <LinkCard key={item.route} item={item} onPress={() => router.push(item.route as any)} />
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 28 }}>
                            <View
                                style={{
                                    width: '100%',
                                    maxWidth: maxContentWidth,
                                    alignSelf: 'center',
                                    borderRadius: 30,
                                    backgroundColor: '#4A2E24',
                                    paddingHorizontal: isCompact ? 20 : 28,
                                    paddingVertical: isCompact ? 24 : 30,
                                }}
                            >
                                <View style={{ width: 54, height: 54, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                                    <Feather name={content.icon} size={22} color="#FFF8F0" />
                                </View>
                                <Text style={{ marginTop: 16, color: '#FFF9F2', fontFamily: BRAND_FONTS.heading, fontSize: 30, lineHeight: 36 }}>
                                    {content.footerTitle}
                                </Text>
                                <Text style={{ marginTop: 10, maxWidth: 760, color: 'rgba(255,249,242,0.78)', fontFamily: BRAND_FONTS.body, fontSize: 15, lineHeight: 26 }}>
                                    {content.footerText}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}