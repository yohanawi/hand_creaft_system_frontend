import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import {
    Animated,
    Pressable,
    Text,
    View,
    useWindowDimensions
} from 'react-native';

type CustomerPageFrameProps = {
    scrollY: Animated.Value;
    onScroll: (event: any) => void;
    eyebrow: string;
    title: string;
    subtitle: string;
    actions?: ReactNode;
    heroAside?: ReactNode;
    sidebar?: ReactNode;
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
        <View className="bg-white p-6 rounded-[30px] border border-[#EAD7C3]">
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text style={{ fontFamily: BRAND_FONTS.heading }} className="text-[28px] text-[#2B1E16]">
                        {title}
                    </Text>

                    {subtitle && (
                        <Text style={{ fontFamily: BRAND_FONTS.body }} className="mt-2 text-[13px] leading-6 text-[#6B5A4E]">
                            {subtitle}
                        </Text>
                    )}
                </View>

                {actionLabel && onAction && (
                    <Pressable onPress={onAction} className="px-4 py-2 rounded-full bg-[#F6ECDF]">
                        {({ pressed }) => (
                            <Text style={{ fontFamily: BRAND_FONTS.body }} className={`text-[12px] font-semibold text-[#2B1E16] ${pressed ? 'opacity-80' : 'opacity-100'}`}>
                                {actionLabel}
                            </Text>
                        )}
                    </Pressable>
                )}
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
    sidebar,
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
            >
                <PageShell scrollY={scrollY}>
                    <LinearGradient
                        colors={[
                            BROWN.DarkColor,
                            BROWN.SecondaryBackground,
                            BROWN.lightColor,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View className="relative px-4 pb-10 overflow-hidden pt-14">
                            {/* decorative blobs */}
                            <View className="absolute rounded-full -left-12 top-10 h-44 w-44 bg-white/10" />
                            <View className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#F0D6BB]/20" />

                            <View className="mx-auto w-full max-w-[1240px]">
                                <View className={`gap-6 ${stacked ? '' : 'flex-row items-end justify-between'}`}>
                                    <View className="flex-1 max-w-[760px]">
                                        {/* eyebrow */}
                                        <View className="self-start px-4 py-2 border rounded-full border-white/20 bg-white/10">
                                            <Text style={{ fontFamily: BRAND_FONTS.body, color: '#FFF' }} className="text-[11px] uppercase tracking-[2px]">
                                                {eyebrow}
                                            </Text>
                                        </View>

                                        {/* title */}
                                        <Text style={{ fontFamily: BRAND_FONTS.heading, fontSize: 40 }} className="mt-4 text-white leading-[46px]">
                                            {title}
                                        </Text>

                                        {/* subtitle */}
                                        <Text style={{ fontFamily: BRAND_FONTS.body, fontSize: 15, color: '#FFF' }} className="mt-4 max-w-[660px] leading-7">
                                            {subtitle}
                                        </Text>

                                        {actions && (
                                            <View className="flex-row flex-wrap gap-3 mt-6">
                                                {actions}
                                            </View>
                                        )}
                                    </View>

                                    {heroAside && (
                                        <View className={stacked ? 'w-full' : 'max-w-[360px]'}>
                                            {heroAside}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* body */}
                    <View className="px-4 pt-6 pb-28">
                        <View className="mx-auto w-full max-w-[1240px]">
                            <View className={`gap-6 ${sidebar && !stacked ? 'flex-row items-start' : ''}`}>
                                {sidebar && (
                                    <View className={stacked ? 'mb-6' : 'w-[290px] shrink-0'}>
                                        {sidebar}
                                    </View>
                                )}

                                <View className="flex-1 min-w-0 gap-6">
                                    {children}
                                </View>
                            </View>
                        </View>
                    </View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}