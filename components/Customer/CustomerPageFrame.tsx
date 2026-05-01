import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import {
    Animated,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

type CustomerPageFrameProps = {
    scrollY: Animated.Value;
    onScroll: (event: any) => void;
    eyebrow: string;
    title: string;
    subtitle: string;
    actions?: ReactNode;
    heroAside?: ReactNode;
    refreshControl?: ReactNode;
    children: ReactNode;
};

type CustomerSectionCardProps = {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    children: ReactNode;
};

export function CustomerSectionCard({
    title,
    subtitle,
    actionLabel,
    onAction,
    children,
}: CustomerSectionCardProps) {
    return (
        <View className="rounded-[30px] border bg-white p-6" style={styles.card}>
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {subtitle ? <Text className="mt-2 text-[13px] leading-6" style={styles.sectionSubtitle}>{subtitle}</Text> : null}
                </View>
                {actionLabel && onAction ? (
                    <Pressable onPress={onAction} className="rounded-full px-4 py-2" style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }, styles.actionPill]}>
                        <Text style={styles.actionText}>{actionLabel}</Text>
                    </Pressable>
                ) : null}
            </View>
            <View className="mt-5">{children}</View>
        </View>
    );
}

export default function CustomerPageFrame({
    scrollY,
    onScroll,
    eyebrow,
    title,
    subtitle,
    actions,
    heroAside,
    refreshControl,
    children,
}: CustomerPageFrameProps) {
    const { width } = useWindowDimensions();
    const stacked = width < 980;

    return (
        <View className="flex-1" style={{ backgroundColor: BROWN.Background }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                refreshControl={refreshControl as RefreshControl | undefined}
                contentContainerStyle={{ paddingBottom: 44 }}
            >
                <PageShell scrollY={scrollY}>
                    <LinearGradient colors={[BROWN.DarkColor, BROWN.SecondaryBackground, BROWN.lightColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <View className="overflow-hidden px-4 pb-10 pt-14">
                            <View className="absolute rounded-full -left-12 top-10 h-44 w-44 bg-white/10" />
                            <View className="absolute top-0 right-0 w-56 h-56 rounded-full" style={{ backgroundColor: 'rgba(240,214,187,0.15)' }} />
                            <View className="mx-auto w-full max-w-[1240px]">
                                <View className={stacked ? 'gap-6' : 'flex-row items-end justify-between gap-8'}>
                                    <View className="max-w-[760px] flex-1">
                                        <View className="self-start rounded-full border px-4 py-2" style={styles.eyebrowPill}>
                                            <Text style={styles.eyebrow}>{eyebrow}</Text>
                                        </View>
                                        <Text className="mt-4 text-white" style={styles.heroTitle}>{title}</Text>
                                        <Text className="mt-4 max-w-[660px] text-[15px] leading-7" style={styles.heroSubtitle}>{subtitle}</Text>
                                        {actions ? <View className="mt-6 flex-row flex-wrap gap-3">{actions}</View> : null}
                                    </View>
                                    {heroAside ? <View className={stacked ? 'w-full' : 'max-w-[360px]'}>{heroAside}</View> : null}
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    <View className="px-4 pt-6">
                        <View className="mx-auto w-full max-w-[1240px] gap-6">{children}</View>
                    </View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    eyebrowPill: {
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    eyebrow: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 11,
        color: '#F7EBDE',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    heroTitle: {
        fontFamily: BRAND_FONTS.heading,
        fontSize: 40,
        lineHeight: 46,
    },
    heroSubtitle: {
        fontFamily: BRAND_FONTS.body,
        color: '#F8ECDF',
    },
    card: {
        borderColor: '#EAD7C3',
    },
    sectionTitle: {
        fontFamily: BRAND_FONTS.heading,
        fontSize: 28,
        color: BROWN.TextPrimary,
    },
    sectionSubtitle: {
        fontFamily: BRAND_FONTS.body,
        color: BROWN.TextSecondary,
    },
    actionPill: {
        backgroundColor: '#F6ECDF',
    },
    actionText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        fontWeight: '600',
        color: BROWN.DarkColor,
    },
});