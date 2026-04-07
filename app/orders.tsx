import AuthContext from '@/context/AuthContext';
import { cancelMyOrder, getMyOrders } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const T = {
    bg: '#1A1209',
    card: '#2C1810',
    border: '#3D2415',
    active: '#C1622F',
    activeBg: 'rgba(193,98,47,0.15)',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    green: '#4CAF50',
    yellow: '#F5A623',
    red: '#E53E3E',
    blue: '#4299E1',
};

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    awaiting_payment: { color: T.blue, icon: 'credit-card', label: 'Awaiting Payment' },
    payment_failed: { color: T.red, icon: 'alert-circle', label: 'Payment Failed' },
    pending: { color: T.yellow, icon: 'clock', label: 'Pending' },
    confirmed: { color: T.blue, icon: 'check', label: 'Confirmed' },
    processing: { color: T.blue, icon: 'settings', label: 'Processing' },
    shipped: { color: T.active, icon: 'truck', label: 'Shipped' },
    out_for_delivery: { color: T.active, icon: 'navigation', label: 'Out for Delivery' },
    delivered: { color: T.green, icon: 'check-circle', label: 'Delivered' },
    cancelled: { color: T.red, icon: 'x-circle', label: 'Cancelled' },
    returned: { color: T.muted, icon: 'rotate-ccw', label: 'Returned' },
};

const FILTERS = ['all', 'awaiting_payment', 'payment_failed', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    awaiting_payment: T.blue,
    cod_due: T.yellow,
    paid: T.green,
    failed: T.red,
    cancelled: T.red,
    refunded: T.muted,
};

export default function OrdersScreen() {
    const auth = useContext(AuthContext);
    const navRouter = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = useCallback(
        async (p = 1, status = filter, append = false) => {
            if (!auth?.userToken) {
                navRouter.replace('/login' as any);
                return;
            }
            try {
                const params: any = { page: p, limit: 10 };
                if (status !== 'all') params.status = status;
                const { data } = await getMyOrders(params);
                const fetched = data.orders ?? [];
                setOrders(prev => (append ? [...prev, ...fetched] : fetched));
                setHasMore(p < (data.totalPages ?? 1));
            } catch {
                Alert.alert('Error', 'Could not load orders.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [auth?.userToken, filter],
    );

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchOrders(1, filter);
    }, [filter]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchOrders(1, filter, false);
    };

    const loadMore = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage, filter, true);
    };

    const handleCancel = (id: string, orderNumber: string) => {
        Alert.alert('Cancel Order', `Cancel order ${orderNumber}?`, [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await cancelMyOrder(id);
                        fetchOrders(1, filter);
                    } catch (err: any) {
                        Alert.alert('Error', err?.response?.data?.message ?? 'Cannot cancel order.');
                    }
                },
            },
        ]);
    };

    const renderOrder = ({ item }: { item: any }) => {
        const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
        const canCancel = ['awaiting_payment', 'payment_failed', 'pending', 'confirmed'].includes(item.status);
        const canRetryPayment = item.paymentMethod === 'payhere' && ['awaiting_payment', 'payment_failed'].includes(item.status);
        return (
            <View style={s.card}>
                {/* Header */}
                <View style={s.cardHeader}>
                    <View>
                        <Text style={s.orderNum}>{item.orderNumber}</Text>
                        <Text style={s.orderDate}>
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
                        </Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
                        <Feather name={cfg.icon as any} size={12} color={cfg.color} />
                        <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>

                {/* Items preview */}
                <View style={s.divider} />
                <View style={s.itemsList}>
                    {item.items.slice(0, 2).map((it: any) => (
                        <Text key={it._id} style={s.itemRow} numberOfLines={1}>
                            · {it.name} × {it.quantity}
                        </Text>
                    ))}
                    {item.items.length > 2 && (
                        <Text style={s.itemRowMuted}>+{item.items.length - 2} more item(s)</Text>
                    )}
                </View>

                {/* Footer */}
                <View style={s.divider} />
                <View style={s.cardFooter}>
                    <View>
                        <Text style={s.totalLabel}>
                            Total: <Text style={s.totalValue}>${item.total?.toFixed(2)}</Text>
                        </Text>
                        <Text style={[s.paymentText, { color: PAYMENT_STATUS_COLORS[item.paymentStatus] ?? T.muted }]}>
                            Payment: {String(item.paymentStatus || 'unknown').replace(/_/g, ' ')}
                        </Text>
                    </View>
                    <View style={s.actionRow}>
                        <TouchableOpacity
                            style={s.btnTrack}
                            onPress={() =>
                                navRouter.push(
                                    `/order-tracking?orderNumber=${item.orderNumber}` as any,
                                )
                            }
                            activeOpacity={0.8}
                        >
                            <Feather name="map-pin" size={14} color={T.active} />
                            <Text style={s.btnTrackText}>Track</Text>
                        </TouchableOpacity>
                        {canRetryPayment && (
                            <TouchableOpacity
                                style={s.btnTrack}
                                onPress={() => navRouter.push(`/payment-failure?orderId=${item._id}` as any)}
                                activeOpacity={0.8}
                            >
                                <Feather name="refresh-cw" size={14} color={T.active} />
                                <Text style={s.btnTrackText}>Pay Now</Text>
                            </TouchableOpacity>
                        )}
                        {canCancel && (
                            <TouchableOpacity
                                style={s.btnCancel}
                                onPress={() => handleCancel(item._id, item.orderNumber)}
                                activeOpacity={0.8}
                            >
                                <Text style={s.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={T.bg} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navRouter.back()} style={s.backBtn}>
                    <Feather name="arrow-left" size={22} color={T.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter tabs */}
            <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={f => f}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterWrap}
                renderItem={({ item: f }) => (
                    <TouchableOpacity
                        style={[s.filterTab, filter === f && s.filterTabActive]}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Content */}
            {loading ? (
                <View style={s.centered}>
                    <ActivityIndicator color={T.active} size="large" />
                </View>
            ) : orders.length === 0 ? (
                <View style={s.centered}>
                    <Feather name="shopping-bag" size={64} color={T.muted} />
                    <Text style={s.emptyTitle}>No orders yet</Text>
                    <Text style={s.emptySub}>
                        {filter !== 'all' ? `No ${filter} orders found.` : 'Start shopping to see orders here.'}
                    </Text>
                    {filter === 'all' && (
                        <TouchableOpacity style={s.shopBtn} onPress={() => navRouter.push('/shop' as any)}>
                            <Text style={s.shopBtnText}>Browse Shop</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={o => o._id}
                    renderItem={renderOrder}
                    contentContainerStyle={s.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={T.active}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        hasMore ? (
                            <ActivityIndicator color={T.active} style={{ marginVertical: 16 }} />
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: T.text },
    filterWrap: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterTab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
    },
    filterTabActive: { backgroundColor: T.activeBg, borderColor: T.active },
    filterText: { color: T.muted, fontSize: 13, fontWeight: '500' },
    filterTextActive: { color: T.active, fontWeight: '700' },
    list: { padding: 16, gap: 12 },
    card: {
        backgroundColor: T.card, borderRadius: 16,
        borderWidth: 1, borderColor: T.border, overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: 16,
    },
    orderNum: { fontSize: 15, fontWeight: '700', color: T.text },
    orderDate: { fontSize: 12, color: T.muted, marginTop: 2 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
    },
    badgeText: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: T.border },
    itemsList: { paddingHorizontal: 16, paddingVertical: 10, gap: 4 },
    itemRow: { fontSize: 13, color: T.text },
    itemRowMuted: { fontSize: 12, color: T.muted, fontStyle: 'italic' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 14,
    },
    totalLabel: { fontSize: 14, color: T.muted },
    totalValue: { color: T.active, fontWeight: '700', fontSize: 15 },
    paymentText: { fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
    actionRow: { flexDirection: 'row', gap: 8 },
    btnTrack: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
        backgroundColor: T.activeBg, borderWidth: 1, borderColor: T.active,
    },
    btnTrackText: { color: T.active, fontSize: 13, fontWeight: '600' },
    btnCancel: {
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
        borderWidth: 1, borderColor: T.red,
    },
    btnCancelText: { color: T.red, fontSize: 13, fontWeight: '600' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: T.text },
    emptySub: { fontSize: 14, color: T.muted, textAlign: 'center', paddingHorizontal: 32 },
    shopBtn: {
        marginTop: 8, backgroundColor: T.active,
        paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24,
    },
    shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
