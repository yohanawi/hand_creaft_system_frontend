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
    if (pathname.startsWith('/orders') || pathname.startsWith('/order-tracking') || pathname.startsWith('/payment-')) {
        return '/orders';
    }

    if (pathname.startsWith('/support-tickets')) {
        return '/support-tickets';
    }

    if (pathname.startsWith('/profile')) {
        return '/profile';
    }

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
                { opacity: pressed ? 0.7 : 1 },
                active ? { backgroundColor: 'rgba(255,255,255,0.08)' } : null,
            ]}
        >
            <View className="flex-row items-center gap-3.5">
                <Feather name={icon} size={18} color={active ? '#FFFFFF' : '#78716C'} />
                <Text
                    className="font-body text-[15px]"
                    style={{ color: active ? '#FFFFFF' : '#A8A29E', fontWeight: active ? '700' : '400' }}
                >
                    {label}
                </Text>
            </View>

            {badge ? (
                <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <Text className="font-body text-[11px] font-bold text-stone-400">{badge}</Text>
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
                    if (!active) {
                        return;
                    }

                    setOverviewCounts({
                        orderCount: Number(data?.summary?.orderCount || 0),
                        openTicketCount: Number(data?.summary?.openTicketCount || 0),
                        wishlistCount: Number(data?.summary?.wishlistCount || 0),
                    });
                } catch {
                    if (!active) {
                        return;
                    }

                    setOverviewCounts((current) => current.orderCount === undefined && current.openTicketCount === undefined
                        ? { orderCount: 0, openTicketCount: 0, wishlistCount: current.wishlistCount }
                        : current);
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

    const menuItems = useMemo<MenuItem[]>(() => [
        { icon: 'layout', label: 'Overview', href: '/customer-dashboard' },
        { icon: 'shopping-bag', label: 'My Orders', href: '/orders', badge: resolvedCounts.orderCount > 0 ? `${resolvedCounts.orderCount}` : undefined },
        { icon: 'map-pin', label: 'Addresses', href: '/profile' },
        { icon: 'message-square', label: 'Support', href: '/support-tickets', badge: resolvedCounts.openTicketCount > 0 ? `${resolvedCounts.openTicketCount} open` : undefined },
        { icon: 'settings', label: 'Settings', href: '/profile' },
    ], [resolvedCounts.openTicketCount, resolvedCounts.orderCount, resolvedCounts.wishlistCount]);

    const handleLogout = useCallback(() => {
        auth.logout();
        router.replace('/login' as any);
    }, [auth, router]);

    return (
        <View style={{ backgroundColor: '#0C0A09', borderRadius: 36 }}>
            <View className="p-4">
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

            <View className="p-4 pt-0 pb-6">
                <View className="w-full h-px mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                <Pressable
                    onPress={handleLogout}
                    className="flex-row items-center gap-3 px-4 py-3 rounded-2xl"
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                    <Feather name="log-out" size={17} color="#EF4444" />
                    <Text className="font-body text-[14px] font-bold text-red-500">Sign out</Text>
                </Pressable>
            </View>
        </View>
    );
}