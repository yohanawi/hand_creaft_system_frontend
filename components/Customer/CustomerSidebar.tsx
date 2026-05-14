import { BRAND_FONTS } from '@/constants/brandTheme';
import { useWishlist } from '@/context/WishlistContext';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getCustomerOverview } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type CustomerSidebarCounts = {
    orderCount?: number;
    openTicketCount?: number;
    wishlistCount?: number;
};

type CustomerSidebarProps = {
    counts?: CustomerSidebarCounts;
};

type MenuItem = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    href: string;
    badge?: string;
};

function resolveActiveHref(pathname: string) {
    if (
        pathname.startsWith('/orders') ||
        pathname.startsWith('/order-tracking') ||
        pathname.startsWith('/payment-')
    ) {
        return '/orders';
    }

    if (pathname.startsWith('/support-tickets')) return '/support-tickets';
    if (pathname.startsWith('/profile')) return '/profile';

    return '/customer-dashboard';
}

function SidebarMenuItem({
    icon,
    label,
    badge,
    active,
    onPress,
}: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    badge?: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            className="mb-1 flex-row items-center justify-between rounded-2xl px-4 py-3.5"
            style={({ pressed }) => [
                { opacity: pressed ? 0.76 : 1 },
                active ? { backgroundColor: 'rgba(255,255,255,0.12)' } : null,
            ]}
        >
            <View className="flex-row items-center gap-3.5">
                <View
                    className="items-center justify-center h-9 w-9 rounded-xl"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)' }}
                >
                    <Feather name={icon} size={17} color={active ? '#FFFFFF' : '#BFA38E'} />
                </View>

                <Text
                    className="text-[14px]"
                    style={{
                        fontFamily: BRAND_FONTS.body,
                        color: active ? '#FFFFFF' : '#D9C7B8',
                        fontWeight: active ? '700' : '500',
                    }}
                >
                    {label}
                </Text>
            </View>

            {badge ? (
                <View className="rounded-full bg-white/10 px-2.5 py-1">
                    <Text className="text-[10px] font-bold text-[#F5E6D8]" style={{ fontFamily: BRAND_FONTS.body }}>
                        {badge}
                    </Text>
                </View>
            ) : null}
        </Pressable>
    );
}

export default function CustomerSidebar({ counts }: CustomerSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const auth = useProtectedRoute();
    const { wishlistCount } = useWishlist();
    const [overviewCounts, setOverviewCounts] = useState<CustomerSidebarCounts>({});

    useFocusEffect(
        useCallback(() => {
            if (!auth.userToken || counts?.orderCount !== undefined || counts?.openTicketCount !== undefined) {
                return;
            }

            let active = true;

            (async () => {
                try {
                    const { data } = await getCustomerOverview();

                    if (!active) return;

                    setOverviewCounts({
                        orderCount: Number(data?.summary?.orderCount || 0),
                        openTicketCount: Number(data?.summary?.openTicketCount || 0),
                        wishlistCount: Number(data?.summary?.wishlistCount || 0),
                    });
                } catch {
                    if (!active) return;
                    setOverviewCounts({ orderCount: 0, openTicketCount: 0 });
                }
            })();

            return () => {
                active = false;
            };
        }, [auth.userToken, counts?.openTicketCount, counts?.orderCount]),
    );

    const activeHref = resolveActiveHref(pathname || '');

    const resolvedCounts = {
        orderCount: counts?.orderCount ?? overviewCounts.orderCount ?? 0,
        openTicketCount: counts?.openTicketCount ?? overviewCounts.openTicketCount ?? 0,
        wishlistCount: counts?.wishlistCount ?? wishlistCount ?? overviewCounts.wishlistCount ?? 0,
    };

    const menuItems = useMemo<MenuItem[]>(
        () => [
            { icon: 'layout', label: 'Overview', href: '/customer-dashboard' },
            {
                icon: 'shopping-bag',
                label: 'My Orders',
                href: '/orders',
                badge: resolvedCounts.orderCount > 0 ? `${resolvedCounts.orderCount}` : undefined,
            },
            {
                icon: 'heart',
                label: 'Wishlist',
                href: '/wishlist',
                badge: resolvedCounts.wishlistCount > 0 ? `${resolvedCounts.wishlistCount}` : undefined,
            },
            { icon: 'map-pin', label: 'Addresses', href: '/profile' },
            {
                icon: 'message-square',
                label: 'Support',
                href: '/support-tickets',
                badge: resolvedCounts.openTicketCount > 0 ? `${resolvedCounts.openTicketCount}` : undefined,
            },
            { icon: 'settings', label: 'Settings', href: '/profile' },
        ],
        [resolvedCounts.openTicketCount, resolvedCounts.orderCount, resolvedCounts.wishlistCount],
    );

    const handleLogout = useCallback(() => {
        auth.logout();
        router.replace('/login' as any);
    }, [auth, router]);

    return (
        <View className="overflow-hidden rounded-[36px]" style={{ backgroundColor: '#24160F' }}>
            <View className="p-5 border-b border-white/10">
                <View className="flex-row items-center gap-3 mb-5">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F5E6D8]">
                        <Feather name="user" size={20} color="#714329" />
                    </View>

                    <View className="flex-1">
                        <Text className="text-[11px] uppercase tracking-[2px] text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                            Customer Space
                        </Text>
                        <Text className="text-[19px] text-white" style={{ fontFamily: BRAND_FONTS.heading }}>
                            My Atelier
                        </Text>
                    </View>
                </View>

                {menuItems.map((item) => (
                    <SidebarMenuItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        badge={item.badge}
                        active={activeHref === item.href}
                        onPress={() => router.push(item.href as any)}
                    />
                ))}
            </View>

            <View className="p-5">
                <View className="p-4 mb-4 rounded-3xl bg-white/10">
                    <Text className="text-[12px] uppercase tracking-[2px] text-[#BFA38E]" style={{ fontFamily: BRAND_FONTS.body }}>
                        Need help?
                    </Text>
                    <Text className="mt-1 text-[18px] leading-6 text-white" style={{ fontFamily: BRAND_FONTS.heading }}>
                        Our makers support your order.
                    </Text>
                </View>

                <Pressable
                    onPress={handleLogout}
                    className="flex-row items-center gap-3 px-4 py-3 rounded-2xl"
                    style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                >
                    <Feather name="log-out" size={17} color="#FF8A8A" />
                    <Text className="text-[14px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                        Sign out
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}