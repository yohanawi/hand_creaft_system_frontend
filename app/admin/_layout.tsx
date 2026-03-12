import AuthContext from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { router, Stack, usePathname } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const T = {
    bg: '#1A1209',
    sidebar: '#2C1810',
    sidebarBorder: '#3D2415',
    active: '#C1622F',
    activeBg: 'rgba(193,98,47,0.18)',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    header: '#241610',
    headerBorder: '#3D2415',
    white: '#FFFFFF',
    danger: '#E53E3E',
};

const NAV_ITEMS = [
    { label: 'Dashboard', icon: 'grid', path: '/admin' },
    { label: 'Orders', icon: 'shopping-bag', path: '/admin/orders' },
    { label: 'Products', icon: 'package', path: '/admin/products' },
    { label: 'Coupons', icon: 'percent', path: '/admin/coupons' },
    { label: 'Categories', icon: 'tag', path: '/admin/categories' },
    { label: 'Subcategories', icon: 'layers', path: '/admin/subcategories' },
    { label: 'Blogs', icon: 'book-open', path: '/admin/blogs' },
    { label: 'Users', icon: 'users', path: '/admin/users' },
];

export default function AdminLayout() {
    const auth = useContext(AuthContext);
    const pathname = usePathname();

    // Guard: redirect non-admins
    useEffect(() => {
        if (!auth?.userToken) {
            router.replace('/login');
        } else if (auth?.user && auth.user.role !== 'admin') {
            router.replace('/');
        }
    }, [auth?.userToken, auth?.user]);

    const handleLogout = () => {
        auth?.logout();
        router.replace('/login');
    };

    const isActive = (path: string) => {
        if (path === '/admin') return pathname === '/admin';
        return pathname.startsWith(path);
    };

    return (
        <View style={s.root}>
            {/* Sidebar */}
            <View style={s.sidebar}>
                {/* Logo */}
                <View style={s.logoWrap}>
                    <View style={s.logoCircle}>
                        <Feather name="settings" size={22} color={T.active} />
                    </View>
                    <View>
                        <Text style={s.logoText}>HandCraft</Text>
                        <Text style={s.logoSub}>Admin Panel</Text>
                    </View>
                </View>

                {/* User badge */}
                <View style={s.userBadge}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{auth?.user?.name?.[0]?.toUpperCase() ?? 'A'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.userName} numberOfLines={1}>{auth?.user?.name ?? 'Admin'}</Text>
                        <Text style={s.userRole}>Administrator</Text>
                    </View>
                </View>

                {/* Nav items */}
                <ScrollView style={s.navScroll} showsVerticalScrollIndicator={false}>
                    <Text style={s.navSection}>MAIN MENU</Text>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Pressable
                                key={item.path}
                                style={[s.navItem, active && s.navItemActive]}
                                onPress={() => router.push(item.path as any)}
                            >
                                <Feather
                                    name={item.icon as any}
                                    size={18}
                                    color={active ? T.active : T.muted}
                                />
                                <Text style={[s.navLabel, active && s.navLabelActive]}>
                                    {item.label}
                                </Text>
                                {active && <View style={s.activeDot} />}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Feather name="log-out" size={17} color={T.danger} />
                    <Text style={s.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Main content */}
            <View style={s.content}>
                <Stack screenOptions={{ headerShown: false }} />
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: T.bg },

    // Sidebar
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
        backgroundColor: 'rgba(193,98,47,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(193,98,47,0.3)',
    },
    logoText: { color: T.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    logoSub: { color: T.muted, fontSize: 10, letterSpacing: 1.5, marginTop: 1 },

    // User badge
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 12,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
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

    // Nav
    navScroll: { flex: 1, marginTop: 8 },
    navSection: {
        color: T.muted,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1.5,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
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
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: T.active,
    },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 12,
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        backgroundColor: 'rgba(229,62,62,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(229,62,62,0.15)',
    },
    logoutText: { color: T.danger, fontSize: 14, fontWeight: '600' },

    // Content
    content: { flex: 1, backgroundColor: '#1E150C' },
});
