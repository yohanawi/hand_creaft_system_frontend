import AuthContext from '@/context/AuthContext';
import { getAdminStats } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const T = {
    bg: '#1E150C',
    card: '#2C1810',
    cardBorder: '#3D2415',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    active: '#C1622F',
    green: '#38A169',
    yellow: '#D69E2E',
    red: '#E53E3E',
    blue: '#3182CE',
    white: '#FFFFFF',
};

function StatCard({ icon, label, value, color, sub }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.statIcon, { backgroundColor: color + '22' }]}>
                <Feather name={icon} size={22} color={color} />
            </View>
            <Text style={s.statValue}>{value ?? '—'}</Text>
            <Text style={s.statLabel}>{label}</Text>
            {sub ? <Text style={s.statSub}>{sub}</Text> : null}
        </View>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <Text style={s.sectionTitle}>{title}</Text>;
}

export default function AdminDashboard() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await getAdminStats();
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

    const onRefresh = () => { setRefreshing(true); load(); };

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={[s.muted, { marginTop: 12 }]}>Loading dashboard…</Text>
            </View>
        );
    }

    const stats = data?.stats ?? {};
    const recentProducts = data?.recentProducts ?? [];
    const recentUsers = data?.recentUsers ?? [];

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.active} />}
        >
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>Dashboard</Text>
                    <Text style={s.headerSub}>Welcome back, {auth?.user?.name ?? 'Admin'}</Text>
                </View>
                <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
                    <Feather name="refresh-cw" size={16} color={T.active} />
                </TouchableOpacity>
            </View>

            {/* Primary Stats */}
            <View style={s.statsGrid}>
                <StatCard icon="users" label="Total Users" value={stats.totalUsers} color={T.blue} sub={`+${stats.newUsersThisWeek ?? 0} this week`} />
                <StatCard icon="package" label="Total Products" value={stats.totalProducts} color={T.active} sub={`+${stats.newProductsThisWeek ?? 0} this week`} />
                <StatCard icon="tag" label="Categories" value={stats.totalCategories} color={T.green} />
                <StatCard icon="layers" label="Subcategories" value={stats.totalSubcategories} color={T.yellow} />
                <StatCard icon="book-open" label="Blogs" value={stats.totalBlogs} color="#805AD5" />
                <StatCard icon="check-circle" label="Active Products" value={stats.activeProducts} color={T.green} />
                <StatCard icon="star" label="Featured Products" value={stats.featuredProducts} color={T.yellow} />
                <StatCard icon="alert-circle" label="Out of Stock" value={stats.outOfStock} color={T.red} />
                <StatCard icon="alert-triangle" label="Low Stock" value={stats.lowStockProducts} color="#F97316" />
            </View>

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" />
            <View style={s.quickActions}>
                {[
                    { label: 'Add Product', icon: 'plus-circle', path: '/admin/products' },
                    { label: 'Manage Coupons', icon: 'percent', path: '/admin/coupons' },
                    { label: 'Add Category', icon: 'tag', path: '/admin/categories' },
                    { label: 'Add Blog', icon: 'edit-3', path: '/admin/blogs' },
                    { label: 'Manage Users', icon: 'users', path: '/admin/users' },
                ].map((action) => (
                    <TouchableOpacity
                        key={action.path}
                        style={s.quickBtn}
                        onPress={() => router.push(action.path as any)}
                        activeOpacity={0.8}
                    >
                        <Feather name={action.icon as any} size={18} color={T.active} />
                        <Text style={s.quickLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recent Products */}
            <SectionHeader title="Recent Products" />
            <View style={s.tableWrap}>
                <View style={[s.tableRow, s.tableHead]}>
                    <Text style={[s.th, { flex: 2 }]}>Name</Text>
                    <Text style={s.th}>Price</Text>
                    <Text style={s.th}>Status</Text>
                </View>
                {recentProducts.length === 0 && (
                    <Text style={s.emptyRow}>No products yet</Text>
                )}
                {recentProducts.map((p: any) => (
                    <View key={p._id} style={s.tableRow}>
                        <Text style={[s.td, { flex: 2 }]} numberOfLines={1}>{p.name}</Text>
                        <Text style={s.td}>${p.price}</Text>
                        <View style={s.td}>
                            <View style={[s.badge, { backgroundColor: p.status === 'active' ? T.green + '33' : T.red + '33' }]}>
                                <Text style={[s.badgeText, { color: p.status === 'active' ? T.green : T.red }]}>
                                    {p.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Recent Users */}
            <SectionHeader title="Recent Users" />
            <View style={[s.tableWrap, { marginBottom: 40 }]}>
                <View style={[s.tableRow, s.tableHead]}>
                    <Text style={[s.th, { flex: 2 }]}>Name</Text>
                    <Text style={[s.th, { flex: 2 }]}>Email</Text>
                    <Text style={s.th}>Role</Text>
                </View>
                {recentUsers.length === 0 && (
                    <Text style={s.emptyRow}>No users yet</Text>
                )}
                {recentUsers.map((u: any) => (
                    <View key={u._id} style={s.tableRow}>
                        <Text style={[s.td, { flex: 2 }]} numberOfLines={1}>{u.name}</Text>
                        <Text style={[s.td, { flex: 2 }]} numberOfLines={1}>{u.email}</Text>
                        <View style={s.td}>
                            <View style={[s.badge, { backgroundColor: u.role === 'admin' ? T.active + '33' : T.blue + '22' }]}>
                                <Text style={[s.badgeText, { color: u.role === 'admin' ? T.active : T.blue }]}>
                                    {u.role}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24 },
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },
    muted: { color: T.muted, fontSize: 13 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerTitle: { color: T.text, fontSize: 26, fontWeight: '700' },
    headerSub: { color: T.muted, fontSize: 13, marginTop: 3 },
    refreshBtn: {
        backgroundColor: T.card,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: T.cardBorder,
    },

    // Stats grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        backgroundColor: T.card,
        borderRadius: 14,
        padding: 16,
        minWidth: 150,
        flex: 1,
        borderTopWidth: 3,
        borderWidth: 1,
        borderColor: T.cardBorder,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: { color: T.text, fontSize: 28, fontWeight: '700', marginBottom: 4 },
    statLabel: { color: T.muted, fontSize: 12, fontWeight: '500' },
    statSub: { color: '#38A16966', fontSize: 11, marginTop: 4 },

    // Section header
    sectionTitle: {
        color: T.text,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 4,
    },

    // Quick actions
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    quickBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: T.card,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: T.cardBorder,
    },
    quickLabel: { color: T.text, fontSize: 13, fontWeight: '600' },

    // Table
    tableWrap: {
        backgroundColor: T.card,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: T.cardBorder,
        marginBottom: 28,
    },
    tableHead: { backgroundColor: 'rgba(0,0,0,0.25)' },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: T.cardBorder,
    },
    th: { flex: 1, color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
    td: { flex: 1, color: T.text, fontSize: 13 },
    emptyRow: { color: T.muted, textAlign: 'center', padding: 20, fontSize: 13 },

    badge: {
        alignSelf: 'flex-start',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
});
