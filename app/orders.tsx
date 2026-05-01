import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { cancelMyOrder, getMyOrders } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const FILTERS = ['all', 'awaiting_payment', 'payment_failed', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Feather.glyphMap; label: string }> = {
    awaiting_payment: { color: '#2563EB', icon: 'credit-card', label: 'Awaiting Payment' },
    payment_failed: { color: '#DC2626', icon: 'alert-circle', label: 'Payment Failed' },
    pending: { color: '#D97706', icon: 'clock', label: 'Pending' },
    confirmed: { color: '#2563EB', icon: 'check-circle', label: 'Confirmed' },
    processing: { color: '#7C3AED', icon: 'settings', label: 'Processing' },
    shipped: { color: '#C1622F', icon: 'truck', label: 'Shipped' },
    out_for_delivery: { color: '#EA580C', icon: 'navigation', label: 'Out for Delivery' },
    delivered: { color: '#15803D', icon: 'check', label: 'Delivered' },
    cancelled: { color: '#B91C1C', icon: 'x-circle', label: 'Cancelled' },
    returned: { color: '#6B7280', icon: 'rotate-ccw', label: 'Returned' },
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    awaiting_payment: '#2563EB',
    cod_due: '#D97706',
    paid: '#15803D',
    failed: '#DC2626',
    cancelled: '#B91C1C',
    refunded: '#6B7280',
};

const formatStatus = (value?: string) => String(value || '').replace(/_/g, ' ');

export default function OrdersScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useProtectedRoute();
    const navRouter = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = useCallback(
        async (nextPage = 1, status = filter, append = false) => {
            if (!auth.userToken) {
                return;
            }

            try {
                const params: any = { page: nextPage, limit: 10 };
                if (status !== 'all') params.status = status;
                const { data } = await getMyOrders(params);
                const fetched = data.orders ?? [];
                setOrders((prev) => (append ? [...prev, ...fetched] : fetched));
                setHasMore(nextPage < (data.totalPages ?? 1));
            } catch {
                Alert.alert('Error', 'Could not load orders.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [auth.userToken, filter],
    );

    useEffect(() => {
        if (!auth.isAuthorized) {
            return;
        }

        setLoading(true);
        setPage(1);
        fetchOrders(1, filter, false);
    }, [auth.isAuthorized, fetchOrders, filter]);

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
                        fetchOrders(1, filter, false);
                    } catch (error: any) {
                        Alert.alert('Error', error?.response?.data?.message ?? 'Cannot cancel order.');
                    }
                },
            },
        ]);
    };

    if (auth.shouldBlock) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7EFE7]">
                <ActivityIndicator color={BROWN.DarkColor} size="large" />
            </View>
        );
    }

    return (
        <CustomerPageFrame
            scrollY={scrollY}
            onScroll={onScroll}
            eyebrow="Order Archive"
            title="Every purchase, payment state, and shipment update in one place."
            subtitle="Track orders, continue payment when needed, and review what has already been delivered without leaving the customer workspace."
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BROWN.DarkColor} />}
            actions={
                <>
                    <TouchableOpacity onPress={() => navRouter.push('/shop' as any)} className="rounded-full px-5 py-3" style={{ backgroundColor: '#FFFFFF' }}>
                        <Text className="font-body text-[14px] font-semibold" style={{ color: BROWN.TextPrimary }}>Browse shop</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onRefresh} className="rounded-full border px-5 py-3" style={{ borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[14px] font-semibold text-white">Refresh</Text>
                    </TouchableOpacity>
                </>
            }
            heroAside={
                <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Orders snapshot</Text>
                    <Text className="mt-3 font-heading text-[24px] text-white">{orders.length}</Text>
                    <View className="gap-3 mt-5">
                        <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Current filter</Text>
                            <Text className="font-body text-[13px] font-semibold text-white">{formatStatus(filter) || 'all'}</Text>
                        </View>
                        <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>More pages</Text>
                            <Text className="font-body text-[13px] font-semibold text-white">{hasMore ? 'Available' : 'Complete'}</Text>
                        </View>
                    </View>
                </View>
            }
        >
            <CustomerSectionCard title="Filter by order state" subtitle="Jump between open, fulfilled, payment, and cancelled orders without leaving the page.">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                    {FILTERS.map((item) => {
                        const active = item === filter;
                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => setFilter(item)}
                                className="rounded-full border px-4 py-3"
                                style={{
                                    borderColor: active ? BROWN.DarkColor : '#EAD7C3',
                                    backgroundColor: active ? '#F6ECDF' : '#FFFAF5',
                                }}
                            >
                                <Text className="font-body text-[12px] font-semibold capitalize" style={{ color: active ? BROWN.DarkColor : BROWN.TextSecondary }}>
                                    {formatStatus(item) || 'all'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </CustomerSectionCard>

            <CustomerSectionCard title="Order history" subtitle="Open an order to track delivery, retry payment, or cancel while it is still in the pre-shipment stage.">
                {loading ? (
                    <View className="items-center justify-center py-12 gap-3">
                        <ActivityIndicator color={BROWN.DarkColor} size="large" />
                        <Text style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>Loading your orders...</Text>
                    </View>
                ) : orders.length === 0 ? (
                    <View className="items-center justify-center rounded-[24px] px-6 py-10" style={{ backgroundColor: '#F8EFE6' }}>
                        <Feather name="shopping-bag" size={44} color={BROWN.lightColor} />
                        <Text className="mt-4 text-center font-heading text-[24px]" style={{ color: BROWN.TextPrimary }}>No orders here yet</Text>
                        <Text className="mt-2 text-center font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>
                            {filter !== 'all' ? `No ${formatStatus(filter)} orders were found.` : 'Start browsing to build your order archive.'}
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {orders.map((item) => {
                            const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                            const canCancel = ['awaiting_payment', 'payment_failed', 'pending', 'confirmed'].includes(item.status);
                            const canRetryPayment = item.paymentMethod === 'payhere' && ['awaiting_payment', 'payment_failed'].includes(item.status);

                            return (
                                <View key={item._id} className="rounded-[26px] border p-5" style={{ borderColor: '#F0DFCE', backgroundColor: '#FFFAF5' }}>
                                    <View className="flex-row items-start justify-between gap-4">
                                        <View className="flex-1">
                                            <Text className="font-body text-[12px] uppercase tracking-[1.3px]" style={{ color: '#A16D52' }}>{item.orderNumber}</Text>
                                            <Text className="mt-2 font-heading text-[24px]" style={{ color: BROWN.TextPrimary }}>${Number(item.total || 0).toFixed(2)}</Text>
                                            <Text className="mt-1 font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                        <View className="rounded-full px-3 py-2" style={{ backgroundColor: `${statusConfig.color}15` }}>
                                            <Text className="font-body text-[12px] font-semibold" style={{ color: statusConfig.color }}>{statusConfig.label}</Text>
                                        </View>
                                    </View>

                                    <View className="mt-4 gap-2 rounded-[20px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                        {(item.items || []).slice(0, 2).map((product: any) => (
                                            <Text key={product._id} className="font-body text-[13px] leading-6" style={{ color: '#6F5A4F' }}>
                                                {product.name} x{product.quantity}
                                            </Text>
                                        ))}
                                        {item.items?.length > 2 ? (
                                            <Text className="font-body text-[12px] italic" style={{ color: BROWN.TextSecondary }}>+{item.items.length - 2} more item(s)</Text>
                                        ) : null}
                                    </View>

                                    <View className="mt-4 flex-row flex-wrap items-center justify-between gap-3">
                                        <Text className="font-body text-[12px] capitalize" style={{ color: PAYMENT_STATUS_COLORS[item.paymentStatus] ?? BROWN.TextSecondary }}>
                                            Payment: {formatStatus(item.paymentStatus) || 'unknown'}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            <TouchableOpacity
                                                onPress={() => navRouter.push(`/order-tracking?orderNumber=${item.orderNumber}` as any)}
                                                className="flex-row items-center gap-2 rounded-full px-4 py-3"
                                                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAD7C3' }}
                                            >
                                                <Feather name="map-pin" size={14} color={BROWN.DarkColor} />
                                                <Text className="font-body text-[12px] font-semibold" style={{ color: BROWN.DarkColor }}>Track</Text>
                                            </TouchableOpacity>

                                            {canRetryPayment ? (
                                                <TouchableOpacity
                                                    onPress={() => navRouter.push(`/payment-failure?orderId=${item._id}` as any)}
                                                    className="flex-row items-center gap-2 rounded-full px-4 py-3"
                                                    style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAD7C3' }}
                                                >
                                                    <Feather name="refresh-cw" size={14} color={BROWN.DarkColor} />
                                                    <Text className="font-body text-[12px] font-semibold" style={{ color: BROWN.DarkColor }}>Pay now</Text>
                                                </TouchableOpacity>
                                            ) : null}

                                            {canCancel ? (
                                                <TouchableOpacity
                                                    onPress={() => handleCancel(item._id, item.orderNumber)}
                                                    className="rounded-full px-4 py-3"
                                                    style={{ borderWidth: 1, borderColor: '#DC2626', backgroundColor: '#FFFFFF' }}
                                                >
                                                    <Text className="font-body text-[12px] font-semibold" style={{ color: '#DC2626' }}>Cancel</Text>
                                                </TouchableOpacity>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {hasMore ? (
                            <TouchableOpacity onPress={loadMore} className="self-start rounded-full px-5 py-3" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.DarkColor }}>Load more orders</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}
            </CustomerSectionCard>
        </CustomerPageFrame>
    );
}
