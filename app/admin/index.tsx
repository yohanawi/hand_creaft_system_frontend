import {
    AnalyticsCard,
    ColumnBarChart,
    DonutStatusChart,
    HorizontalComparisonChart,
    LineTrendChart,
} from '@/components/admin/AnalyticsCharts';
import { adminTheme as T } from '@/constants/adminTheme';
import { useAuth } from '@/context/AuthContext';
import { getAdminStats } from '@/services/api';
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

function MiniBar({ label, value, max, color, meta }: any) {
    const widthPercent = max > 0 ? Math.max(8, Math.round((Number(value || 0) / max) * 100)) : 8;
    return (
        <View style={s.miniBarRow}>
            <View style={s.miniBarHead}>
                <Text style={s.miniBarLabel}>{label}</Text>
                <Text style={s.miniBarValue}>{meta ?? value}</Text>
            </View>
            <View style={s.miniBarTrack}>
                <View style={[s.miniBarFill, { width: `${widthPercent}%` as const, backgroundColor: color }]} />
            </View>
        </View>
    );
}

export default function AdminDashboard() {
    const auth = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [rangeMonths, setRangeMonths] = useState(6);

    const load = useCallback(async () => {
        try {
            const res = await getAdminStats({ rangeMonths });
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [rangeMonths]);

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
    const analytics = data?.analytics ?? {};
    const recentProducts = data?.recentProducts ?? [];
    const recentUsers = data?.recentUsers ?? [];
    const recentOrders = data?.recentOrders ?? [];
    const paymentBars = [
        { label: 'Awaiting payment', value: Number(stats.paymentAwaiting ?? 0), color: T.blue },
        { label: 'Paid', value: Number(stats.paymentPaid ?? 0), color: T.green },
        { label: 'Failed', value: Number(stats.paymentFailed ?? 0), color: T.red },
        { label: 'Refunded', value: Number(stats.paymentRefunded ?? 0), color: T.yellow },
    ];
    const queueBars = [
        { label: 'Pending seller approvals', value: Number(stats.pendingSellerApplications ?? 0), color: T.active },
        { label: 'Pending payouts', value: Number(stats.pendingPayoutRequests ?? 0), color: '#8B5CF6' },
        { label: 'Low stock products', value: Number(stats.lowStockProducts ?? 0), color: '#F97316' },
        { label: 'Out of stock products', value: Number(stats.outOfStock ?? 0), color: T.red },
    ];
    const paymentMax = Math.max(...paymentBars.map((item) => item.value), 1);
    const queueMax = Math.max(...queueBars.map((item) => item.value), 1);

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
                <StatCard icon="shopping-bag" label="Total Orders" value={stats.totalOrders} color="#2563EB" sub="All-time order volume" />
                <StatCard icon="dollar-sign" label="Revenue" value={`$${Number(stats.totalRevenue || 0).toFixed(2)}`} color={T.green} sub="Paid orders only" />
                <StatCard icon="briefcase" label="Sellers" value={stats.totalSellers} color="#8B5CF6" sub={`${stats.pendingSellerApplications ?? 0} awaiting review`} />
                <StatCard icon="send" label="Seller Payouts" value={stats.pendingPayoutRequests} color="#0F766E" sub="Pending manual processing" />
                <StatCard icon="tag" label="Categories" value={stats.totalCategories} color={T.green} />
                <StatCard icon="layers" label="Subcategories" value={stats.totalSubcategories} color={T.yellow} />
                <StatCard icon="book-open" label="Blogs" value={stats.totalBlogs} color="#805AD5" />
                <StatCard icon="check-circle" label="Active Products" value={stats.activeProducts} color={T.green} />
                <StatCard icon="star" label="Featured Products" value={stats.featuredProducts} color={T.yellow} />
                <StatCard icon="alert-circle" label="Out of Stock" value={stats.outOfStock} color={T.red} />
                <StatCard icon="alert-triangle" label="Low Stock" value={stats.lowStockProducts} color="#F97316" />
                <StatCard icon="credit-card" label="Payments Pending" value={stats.paymentAwaiting} color={T.blue} />
                <StatCard icon="check-circle" label="Payments Captured" value={stats.paymentPaid} color={T.green} />
                <StatCard icon="x-circle" label="Payments Failed" value={stats.paymentFailed} color={T.red} />
            </View>

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" />
            <View style={s.quickActions}>
                {[
                    { label: 'Add Product', icon: 'plus-circle', path: '/admin/products' },
                    { label: 'Inventory', icon: 'archive', path: '/admin/inventory' },
                    { label: 'Payments', icon: 'credit-card', path: '/admin/payments' },
                    { label: 'Manage Sellers', icon: 'briefcase', path: '/admin/sellers' },
                    { label: 'Review Payouts', icon: 'dollar-sign', path: '/admin/seller-payouts' },
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

            <SectionHeader title="Analytics Window" />
            <View style={s.rangeRow}>
                {[3, 6, 12].map((value) => (
                    <TouchableOpacity
                        key={value}
                        style={[s.rangeChip, rangeMonths === value && s.rangeChipActive]}
                        onPress={() => setRangeMonths(value)}
                    >
                        <Text style={[s.rangeChipText, rangeMonths === value && s.rangeChipTextActive]}>{value} months</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <SectionHeader title="Analytics" />
            <View style={s.chartGrid}>
                <AnalyticsCard title="Revenue Trend" subtitle="Paid revenue across the selected month range.">
                    <LineTrendChart data={analytics.revenueTrend ?? []} color={T.active} />
                </AnalyticsCard>
                <AnalyticsCard title="Order Status Mix" subtitle="Current order distribution by fulfillment status.">
                    <DonutStatusChart data={analytics.orderStatusDistribution ?? []} />
                </AnalyticsCard>
            </View>

            <View style={s.chartGrid}>
                <AnalyticsCard title="Top-Selling Products" subtitle="Units sold with exact revenue shown below each product.">
                    <ColumnBarChart data={analytics.topSellingProducts ?? []} />
                </AnalyticsCard>
                <AnalyticsCard title="Seller Performance" subtitle="Gross sales comparison with order count, item volume, and average order value.">
                    <HorizontalComparisonChart data={analytics.sellerPerformanceComparison ?? []} />
                </AnalyticsCard>
            </View>

            <SectionHeader title="Operations Snapshot" />
            <View style={s.insightGrid}>
                <View style={s.insightCard}>
                    <Text style={s.insightTitle}>Payment Flow</Text>
                    <Text style={s.insightSub}>Track reliability across the current payment lifecycle.</Text>
                    {paymentBars.map((item) => (
                        <MiniBar key={item.label} label={item.label} value={item.value} max={paymentMax} color={item.color} />
                    ))}
                </View>
                <View style={s.insightCard}>
                    <Text style={s.insightTitle}>Operations Queue</Text>
                    <Text style={s.insightSub}>Keep seller approvals, payouts, and stock risk visible.</Text>
                    {queueBars.map((item) => (
                        <MiniBar key={item.label} label={item.label} value={item.value} max={queueMax} color={item.color} />
                    ))}
                </View>
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

            <SectionHeader title="Recent Orders" />
            <View style={s.tableWrap}>
                <View style={[s.tableRow, s.tableHead]}>
                    <Text style={s.th}>Order</Text>
                    <Text style={[s.th, { flex: 2 }]}>Customer</Text>
                    <Text style={s.th}>Status</Text>
                    <Text style={s.th}>Total</Text>
                </View>
                {recentOrders.length === 0 && (
                    <Text style={s.emptyRow}>No orders yet</Text>
                )}
                {recentOrders.map((order: any) => (
                    <View key={order._id} style={s.tableRow}>
                        <Text style={s.td}>{order.orderNumber}</Text>
                        <Text style={[s.td, { flex: 2 }]} numberOfLines={1}>{order.user?.name ?? 'Guest'}</Text>
                        <View style={s.td}>
                            <View style={[s.badge, { backgroundColor: order.status === 'delivered' ? T.green + '33' : T.activeBg }]}>
                                <Text style={[s.badgeText, { color: order.status === 'delivered' ? T.green : T.active }]}>
                                    {String(order.status || '').replace(/_/g, ' ')}
                                </Text>
                            </View>
                        </View>
                        <Text style={s.td}>${Number(order.total || 0).toFixed(2)}</Text>
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

            <SectionHeader title="Recent Stock Movements" />
            <View style={[s.tableWrap, { marginBottom: 40 }]}>
                <View style={[s.tableRow, s.tableHead]}>
                    <Text style={[s.th, { flex: 2 }]}>Product</Text>
                    <Text style={s.th}>Reason</Text>
                    <Text style={s.th}>Change</Text>
                </View>
                {(data?.recentStockMovements ?? []).length === 0 && (
                    <Text style={s.emptyRow}>No stock activity yet</Text>
                )}
                {(data?.recentStockMovements ?? []).map((movement: any) => (
                    <View key={movement._id} style={s.tableRow}>
                        <Text style={[s.td, { flex: 2 }]} numberOfLines={1}>{movement.productName || movement.product?.name}</Text>
                        <Text style={s.td} numberOfLines={1}>{movement.reason}</Text>
                        <Text style={[s.td, { color: movement.quantityChange > 0 ? T.green : T.red }]}>
                            {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                        </Text>
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
    rangeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    rangeChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.cardBorder,
    },
    rangeChipActive: {
        backgroundColor: T.activeBg,
        borderColor: T.active,
    },
    rangeChipText: { color: T.muted, fontWeight: '700', fontSize: 12 },
    rangeChipTextActive: { color: T.active },
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

    chartGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },

    insightGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    insightCard: {
        flex: 1,
        minWidth: 280,
        backgroundColor: T.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.cardBorder,
        padding: 18,
    },
    insightTitle: { color: T.text, fontSize: 16, fontWeight: '700' },
    insightSub: { color: T.muted, fontSize: 12, marginTop: 4, marginBottom: 14 },
    miniBarRow: { marginBottom: 14 },
    miniBarHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 6 },
    miniBarLabel: { color: T.text, fontSize: 12, fontWeight: '600', flex: 1 },
    miniBarValue: { color: T.muted, fontSize: 12 },
    miniBarTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: T.content,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: '100%',
        borderRadius: 999,
    },

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
