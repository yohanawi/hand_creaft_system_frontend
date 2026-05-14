import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import {
    Animated,
    Pressable,
    RefreshControlProps,
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
    sidebar?: ReactNode;
    refreshControl?: React.ReactElement<RefreshControlProps>;
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
        <View className="overflow-hidden rounded-[32px] border border-[#E9D9C9] bg-[#FFF9F3] p-5 md:p-6">
            <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#EED8C4]" />

            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text className="text-[24px] leading-[31px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                        {title}
                    </Text>

                    {subtitle ? (
                        <Text className="mt-2 text-[13px] leading-6 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>

                {actionLabel && onAction ? (
                    <Pressable onPress={onAction} className="rounded-full bg-[#2B1E16] px-4 py-2" style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
                        <Text className="text-[12px] font-semibold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                            {actionLabel}
                        </Text>
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
    sidebar,
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
                refreshControl={refreshControl}
            >
                <PageShell scrollY={scrollY}>
                    <LinearGradient colors={['#2B1E16', BROWN.DarkColor, BROWN.SecondaryBackground]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <View className="relative px-4 pb-10 overflow-hidden pt-14">
                            <View className="absolute rounded-full -left-16 top-8 h-52 w-52 bg-white/10" />
                            <View className="absolute -right-20 -top-16 h-72 w-72 rounded-full bg-[#E8C7A8]/20" />
                            <View className="absolute bottom-0 rounded-full right-10 h-28 w-28 bg-black/10" />

                            <View className="w-full mx-auto max-w-[90rem]">
                                <View className={`gap-6 ${stacked ? '' : 'flex-row items-end justify-between'}`}>
                                    <View className="flex-1">
                                        <View className="self-start px-4 py-2 border rounded-full border-white/20 bg-white/10">
                                            <Text className="text-[11px] uppercase tracking-[2.4px] text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                                                {eyebrow}
                                            </Text>
                                        </View>

                                        <Text className="mt-4 max-w-[760px] text-[38px] leading-[46px] text-white md:text-[46px] md:leading-[54px]" style={{ fontFamily: BRAND_FONTS.heading }}>
                                            {title}
                                        </Text>

                                        <Text className="mt-4 max-w-[680px] text-[15px] leading-7 text-white/80" style={{ fontFamily: BRAND_FONTS.body }}>
                                            {subtitle}
                                        </Text>

                                        {actions ? <View className="flex-row flex-wrap gap-3 mt-6">{actions}</View> : null}
                                    </View>

                                    {heroAside ? (
                                        <View className={stacked ? 'w-full' : 'w-[360px]'}>
                                            {heroAside}
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    <View className="px-4 pt-6 pb-28">
                        <View className="mx-auto w-full max-w-[90rem]">
                            <View className={`gap-6 ${sidebar && !stacked ? 'flex-row items-start' : ''}`}>
                                {sidebar ? (
                                    <View className={stacked ? 'w-full' : 'w-[290px]'}>
                                        {sidebar}
                                    </View>
                                ) : null}

                                <View className="flex-1 min-w-0 gap-6">{children}</View>
                            </View>
                        </View>
                    </View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}