import { sellerTheme as T } from '@/constants/sellerTheme';
import { useAuth } from '@/context/AuthContext';
import { getSellerOverview } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

function StatCard({ icon, label, value, color, sub }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.statIcon, { backgroundColor: color + '22' }]}>
                <Feather name={icon} size={20} color={color} />
            </View>
            <Text style={s.statValue}>{value ?? '0'}</Text>
            <Text style={s.statLabel}>{label}</Text>
            {sub ? <Text style={s.statSub}>{sub}</Text> : null}
        </View>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <Text style={s.sectionTitle}>{title}</Text>;
}

export default function SellerDashboardScreen() {
    const auth = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await getSellerOverview();
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to load seller dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading seller studio…</Text>
            </View>
        );
    }

    const stats = data?.stats ?? {};
    const recentProducts = data?.recentProducts ?? [];
    const recentOrders = data?.recentOrders ?? [];

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.active} />}
        >
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>Seller Dashboard</Text>
                    <Text style={s.headerSub}>Welcome back, {auth.user?.sellerProfile?.shopName || auth.user?.name || 'Seller'}</Text>
                </View>
                <TouchableOpacity style={s.refreshBtn} onPress={onRefresh}>
                    <Feather name="refresh-cw" size={16} color={T.active} />
                </TouchableOpacity>
            </View>

            <View style={s.statsGrid}>
                <StatCard icon="package" label="Listings" value={stats.totalProducts} color={T.active} sub={`${stats.activeProducts ?? 0} active`} />
                <StatCard icon="alert-triangle" label="Low Stock" value={stats.lowStockProducts} color={T.yellow} sub="Products that need replenishment" />
                <StatCard icon="shopping-bag" label="Open Orders" value={stats.pendingOrders} color={T.blue} sub="Pending seller action" />
                <StatCard icon="dollar-sign" label="Gross Sales" value={`$${Number(stats.grossSales || 0).toFixed(2)}`} color={T.green} sub="All recorded seller sales" />
                <StatCard icon="credit-card" label="Available Balance" value={`$${Number(stats.availableBalance || 0).toFixed(2)}`} color={T.teal} sub="Ready for payout request" />
                <StatCard icon="clock" label="Requested" value={`$${Number(stats.requestedBalance || 0).toFixed(2)}`} color={T.muted} sub="Awaiting manual settlement" />
            </View>

            <SectionHeader title="Quick Actions" />
            <View style={s.quickActions}>
                {[
                    { label: 'Analytics', icon: 'bar-chart-2', path: '/seller/analytics' },
                    { label: 'Add Product', icon: 'plus-circle', path: '/seller/products' },
                    { label: 'Manage Orders', icon: 'shopping-bag', path: '/seller/orders' },
                    { label: 'Inventory', icon: 'archive', path: '/seller/inventory' },
                    { label: 'Payouts', icon: 'credit-card', path: '/seller/payouts' },
                    { label: 'Shop Profile', icon: 'user', path: '/seller/profile' },
                ].map((action) => (
                    <TouchableOpacity key={action.path} style={s.quickBtn} onPress={() => router.push(action.path as any)} activeOpacity={0.85}>
                        <Feather name={action.icon as any} size={18} color={T.active} />
                        <Text style={s.quickLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <SectionHeader title="Recent Products" />
            <View style={s.tableWrap}>
                {recentProducts.length === 0 ? <Text style={s.emptyRow}>No seller products yet</Text> : recentProducts.map((product: any) => (
                    <View key={product._id} style={s.tableRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowMain}>{product.name}</Text>
                            <Text style={s.rowSub}>SKU: {product.sku} · Qty: {product.quantity}</Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: product.status === 'active' ? T.green + '22' : T.red + '22' }]}>
                            <Text style={[s.badgeText, { color: product.status === 'active' ? T.green : T.red }]}>{product.status}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <SectionHeader title="Recent Orders" />
            <View style={[s.tableWrap, { marginBottom: 40 }]}>
                {recentOrders.length === 0 ? <Text style={s.emptyRow}>No seller orders yet</Text> : recentOrders.map((order: any) => (
                    <View key={order._id} style={s.tableRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowMain}>{order.orderNumber}</Text>
                            <Text style={s.rowSub}>{order.user?.name ?? 'Customer'} · {order.summary?.itemCount ?? 0} items</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.rowMain}>${Number(order.summary?.netAmount || 0).toFixed(2)}</Text>
                            <Text style={s.rowSub}>{String(order.sellerStatus || 'pending').replace(/_/g, ' ')}</Text>
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
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
    muted: { color: T.muted, fontSize: 13 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    headerTitle: { color: T.text, fontSize: 26, fontWeight: '700' },
    headerSub: { color: T.muted, fontSize: 13, marginTop: 3 },
    refreshBtn: { backgroundColor: T.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: T.cardBorder },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
    statCard: { backgroundColor: T.card, borderRadius: 14, padding: 16, minWidth: 160, flex: 1, borderTopWidth: 3, borderWidth: 1, borderColor: T.cardBorder },
    statIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, fontSize: 12, fontWeight: '600', marginTop: 4 },
    statSub: { color: T.muted, fontSize: 11, marginTop: 5 },
    sectionTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
    quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: T.cardBorder },
    quickLabel: { color: T.text, fontSize: 13, fontWeight: '600' },
    tableWrap: { backgroundColor: T.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.cardBorder, marginBottom: 24 },
    tableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    rowMain: { color: T.text, fontSize: 14, fontWeight: '700' },
    rowSub: { color: T.muted, fontSize: 12, marginTop: 3 },
    emptyRow: { color: T.muted, textAlign: 'center', padding: 20, fontSize: 13 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});