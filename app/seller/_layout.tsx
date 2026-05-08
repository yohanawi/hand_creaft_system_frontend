import { sellerTheme as T } from '@/constants/sellerTheme';
import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { router, Stack, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: 'grid', path: '/seller' },
    { label: 'Analytics', icon: 'bar-chart-2', path: '/seller/analytics' },
    { label: 'Products', icon: 'package', path: '/seller/products' },
    { label: 'Inventory', icon: 'archive', path: '/seller/inventory' },
    { label: 'Orders', icon: 'shopping-bag', path: '/seller/orders' },
    { label: 'Payouts', icon: 'credit-card', path: '/seller/payouts' },
    { label: 'Profile', icon: 'user', path: '/seller/profile' },
];

export default function SellerLayout() {
    const auth = useAuth();
    const pathname = usePathname();
    const { width } = useWindowDimensions();
    const isCompact = Platform.OS !== 'web' || width < 960;

    useEffect(() => {
        if (auth.isLoading) return;
        if (!auth.userToken) {
            router.replace('/login');
        } else if (auth.user && auth.user.role !== 'seller') {
            router.replace(auth.user.role === 'admin' ? '/admin' : '/');
        }
    }, [auth.isLoading, auth.user, auth.userToken]);

    const handleLogout = () => {
        auth.logout();
        router.replace('/login');
    };

    const isActive = (path: string) => {
        if (path === '/seller') return pathname === '/seller';
        return pathname.startsWith(path);
    };

    const userName = auth.user?.sellerProfile?.shopName || auth.user?.name || 'Seller';
    const userInitial = userName[0]?.toUpperCase() ?? 'S';

    if (isCompact) {
        return (
            <View style={s.compactRoot}>
                <View style={s.compactHeader}>
                    <View style={s.brandRow}>
                        <View style={s.logoCircle}>
                            <Feather name="briefcase" size={20} color={T.active} />
                        </View>
                        <View>
                            <Text style={s.logoText}>HandCraft</Text>
                            <Text style={s.logoSub}>Seller Studio</Text>
                        </View>
                    </View>
                    <View style={s.compactActions}>
                        <View style={s.compactUser}>
                            <View style={s.avatarCompact}>
                                <Text style={s.avatarText}>{userInitial}</Text>
                            </View>
                            <View>
                                <Text style={s.userName} numberOfLines={1}>{userName}</Text>
                                <Text style={s.userRole}>Seller workspace</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.logoutIconBtn} onPress={handleLogout} activeOpacity={0.8}>
                            <Feather name="log-out" size={16} color={T.danger} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.compactNavScroll}
                    style={s.compactNavRail}
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Pressable
                                key={item.path}
                                style={[s.compactNavItem, active && s.navItemActive]}
                                onPress={() => router.push(item.path as any)}
                            >
                                <Feather name={item.icon as any} size={16} color={active ? T.active : T.muted} />
                                <Text style={[s.compactNavLabel, active && s.navLabelActive]}>{item.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={s.compactContent}>
                    <Stack screenOptions={{ headerShown: false }} />
                </View>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <View style={s.sidebar}>
                <View style={s.logoWrap}>
                    <View style={s.logoCircle}>
                        <Feather name="briefcase" size={22} color={T.active} />
                    </View>
                    <View>
                        <Text style={s.logoText}>HandCraft</Text>
                        <Text style={s.logoSub}>Seller Studio</Text>
                    </View>
                </View>

                <View style={s.userBadge}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{userInitial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.userName} numberOfLines={1}>{userName}</Text>
                        <Text style={s.userRole}>Seller workspace</Text>
                    </View>
                </View>

                <ScrollView style={s.navScroll} showsVerticalScrollIndicator={false}>
                    <Text style={s.navSection}>SELLER MENU</Text>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Pressable
                                key={item.path}
                                style={[s.navItem, active && s.navItemActive]}
                                onPress={() => router.push(item.path as any)}
                            >
                                <Feather name={item.icon as any} size={18} color={active ? T.active : T.muted} />
                                <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
                                {active && <View style={s.activeDot} />}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Feather name="log-out" size={17} color={T.danger} />
                    <Text style={s.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <Stack screenOptions={{ headerShown: false }} />
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: T.bg },
    compactRoot: { flex: 1, backgroundColor: T.bg },
    compactHeader: {
        backgroundColor: T.header,
        borderBottomWidth: 1,
        borderBottomColor: T.headerBorder,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 14,
        gap: 14,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    compactActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    compactUser: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    avatarCompact: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: T.active,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#FCE8E6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F4C7C3',
    },
    compactNavRail: { maxHeight: 68, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
    compactNavScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    compactNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.border,
    },
    compactNavLabel: { color: T.muted, fontSize: 13, fontWeight: '600' },
    compactContent: { flex: 1, backgroundColor: T.content },
    sidebar: {
        width: Platform.OS === 'web' ? 240 : 220,
        backgroundColor: T.sidebar,
        borderRightWidth: 1,
        borderRightColor: T.sidebarBorder,
        paddingBottom: 16,
    },
    logoWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: T.sidebarBorder,
    },
    logoCircle: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: T.activeBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E6C9A8',
    },
    logoText: { color: T.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    logoSub: { color: T.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 1 },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 12,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: T.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: T.border,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: T.active,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: T.white, fontSize: 15, fontWeight: '700' },
    userName: { color: T.text, fontSize: 13, fontWeight: '600' },
    userRole: { color: T.active, fontSize: 10, letterSpacing: 0.8, marginTop: 2 },
    navScroll: { flex: 1, marginTop: 8 },
    navSection: { color: T.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 12,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 12,
        marginBottom: 2,
        position: 'relative',
    },
    navItemActive: { backgroundColor: T.activeBg },
    navLabel: { color: T.muted, fontSize: 14, fontWeight: '500', flex: 1 },
    navLabelActive: { color: T.active, fontWeight: '600' },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.active },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 12,
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        backgroundColor: '#FCE8E6',
        borderWidth: 1,
        borderColor: '#F4C7C3',
    },
    logoutText: { color: T.danger, fontSize: 14, fontWeight: '600' },
    content: { flex: 1, backgroundColor: T.content },
    navLabelActiveCompact: { color: T.active, fontWeight: '600' },
});