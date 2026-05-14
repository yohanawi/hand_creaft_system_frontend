import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { cancelMyOrder, getMyOrders } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';

const FILTERS = [
    'all',
    'awaiting_payment',
    'payment_failed',
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

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

const formatStatus = (value?: string) => String(value || 'all').replace(/_/g, ' ');

const formatCurrency = (value?: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value || 0));

const formatDate = (value?: string) => {
    if (!value) return 'Recently';

    return new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function OrdersScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useProtectedRoute();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchOrders = useCallback(
        async (nextPage = 1, status = filter, append = false) => {
            if (!auth.userToken) return;

            try {
                const params: any = { page: nextPage, limit: 10 };
                if (status !== 'all') params.status = status;

                const { data } = await getMyOrders(params);
                const fetched = data?.orders ?? [];

                setOrders((prev) => (append ? [...prev, ...fetched] : fetched));
                setHasMore(nextPage < Number(data?.totalPages ?? 1));
            } catch (error: any) {
                Alert.alert('Error', error?.response?.data?.message ?? 'Could not load orders.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [auth.userToken, filter],
    );

    useEffect(() => {
        if (!auth.isAuthorized) return;

        setLoading(true);
        setPage(1);
        fetchOrders(1, filter, false);
    }, [auth.isAuthorized, filter, fetchOrders]);

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
        Alert.alert('Cancel Order', `Are you sure you want to cancel order ${orderNumber}?`, [
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

    const summary = useMemo(() => {
        const active = orders.filter((order) =>
            ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status),
        ).length;

        const delivered = orders.filter((order) => order.status === 'delivered').length;
        const unpaid = orders.filter((order) =>
            ['awaiting_payment', 'payment_failed'].includes(order.status),
        ).length;

        return { active, delivered, unpaid };
    }, [orders]);

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
            title="Track your handmade jewellery orders beautifully."
            subtitle="View payments, delivery progress, cancellations, and completed purchases from your customer atelier."
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BROWN.DarkColor} />
            }
            sidebar={<CustomerSidebar />}
            actions={
                <>
                    <Pressable
                        onPress={() => router.push('/shop' as any)}
                        className="px-5 py-3 bg-white rounded-full"
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                        <Text className="text-[14px] font-bold text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.body }}>
                            Browse shop
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onRefresh}
                        className="px-5 py-3 border rounded-full border-white/25 bg-white/10"
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                        <Text className="text-[14px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                            Refresh
                        </Text>
                    </Pressable>
                </>
            }
            heroAside={
                <View className="overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5">
                    <Text className="text-[11px] uppercase tracking-[2.5px] text-[#F1DAC5]" style={{ fontFamily: BRAND_FONTS.body }}>
                        Orders Snapshot
                    </Text>

                    <Text className="mt-3 text-[42px] leading-[48px] text-white" style={{ fontFamily: BRAND_FONTS.heading }}>
                        {orders.length}
                    </Text>

                    <Text className="mt-1 text-[13px] text-white/65" style={{ fontFamily: BRAND_FONTS.body }}>
                        Orders in current view
                    </Text>

                    <View className="gap-3 mt-5">
                        {[
                            { label: 'Active', value: summary.active },
                            { label: 'Delivered', value: summary.delivered },
                            { label: 'Need Payment', value: summary.unpaid },
                        ].map((item) => (
                            <View key={item.label} className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-black/10">
                                <Text className="text-[13px] text-[#F7E7D8]" style={{ fontFamily: BRAND_FONTS.body }}>
                                    {item.label}
                                </Text>
                                <Text className="text-[15px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            }
        >
            <CustomerSectionCard
                title="Filter orders"
                subtitle="Quickly switch between payment, processing, delivery, and completed order states."
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {FILTERS.map((item) => {
                        const active = item === filter;

                        return (
                            <Pressable
                                key={item}
                                onPress={() => setFilter(item)}
                                className="px-4 py-3 border rounded-full"
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.8 : 1,
                                    borderColor: active ? BROWN.DarkColor : '#EAD7C3',
                                    backgroundColor: active ? '#2B1E16' : '#FFFAF5',
                                })}
                            >
                                <Text
                                    className="text-[12px] font-bold capitalize"
                                    style={{
                                        fontFamily: BRAND_FONTS.body,
                                        color: active ? '#FFFFFF' : BROWN.TextSecondary,
                                    }}
                                >
                                    {formatStatus(item)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </CustomerSectionCard>

            <CustomerSectionCard
                title="Order history"
                subtitle="Open an order to track delivery, retry payment, or cancel while it is still eligible."
            >
                {loading ? (
                    <View className="items-center justify-center py-14">
                        <ActivityIndicator color={BROWN.DarkColor} size="large" />
                        <Text className="mt-4 text-[14px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                            Loading your orders...
                        </Text>
                    </View>
                ) : orders.length === 0 ? (
                    <View className="items-center rounded-[28px] bg-[#F8EFE6] px-6 py-12">
                        <View className="items-center justify-center w-20 h-20 bg-white rounded-full">
                            <Feather name="shopping-bag" size={34} color={BROWN.lightColor} />
                        </View>

                        <Text className="mt-5 text-center text-[25px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                            No orders found
                        </Text>

                        <Text className="mt-2 max-w-[320px] text-center text-[14px] leading-6 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                            {filter === 'all'
                                ? 'Start shopping to create your first handcrafted jewellery order.'
                                : `No ${formatStatus(filter)} orders are available right now.`}
                        </Text>

                        <Pressable
                            onPress={() => router.push('/shop' as any)}
                            className="mt-6 rounded-full bg-[#2B1E16] px-7 py-3"
                        >
                            <Text className="text-[13px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                                Shop now
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="gap-4">
                        {orders.map((order) => {
                            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                            const canCancel = ['awaiting_payment', 'payment_failed', 'pending', 'confirmed'].includes(order.status);
                            const canRetryPayment =
                                order.paymentMethod === 'payhere' &&
                                ['awaiting_payment', 'payment_failed'].includes(order.status);

                            return (
                                <View
                                    key={order._id}
                                    className="overflow-hidden rounded-[30px] border border-[#EAD7C3] bg-[#FFFAF5]"
                                >
                                    <Pressable
                                        onPress={() => router.push(`/order-tracking?orderNumber=${order.orderNumber}` as any)}
                                        className="p-5"
                                        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                                    >
                                        <View className="flex-row items-start justify-between gap-4">
                                            <View className="flex-1">
                                                <Text className="text-[11px] uppercase tracking-[2px] text-[#A16D52]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    #{order.orderNumber}
                                                </Text>

                                                <Text className="mt-2 text-[30px] leading-[36px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                                                    {formatCurrency(order.total)}
                                                </Text>

                                                <Text className="mt-1 text-[13px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    Ordered on {formatDate(order.createdAt)}
                                                </Text>
                                            </View>

                                            <View className="items-end gap-2">
                                                <View className="flex-row items-center gap-2 px-3 py-2 rounded-full" style={{ backgroundColor: `${status.color}14` }}>
                                                    <Feather name={status.icon} size={13} color={status.color} />
                                                    <Text className="text-[11px] font-bold" style={{ fontFamily: BRAND_FONTS.body, color: status.color }}>
                                                        {status.label}
                                                    </Text>
                                                </View>

                                                <Text className="text-[11px] text-[#9A7B68]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    Tap to track
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mt-5 gap-2 rounded-[22px] bg-[#F6ECDF] px-4 py-4">
                                            {(order.items || []).slice(0, 3).map((product: any, index: number) => (
                                                <View key={product._id || index} className="flex-row items-center justify-between gap-3">
                                                    <Text className="flex-1 text-[13px] text-[#5D4A3F]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                        {product.name || 'Handmade Jewellery'}
                                                    </Text>

                                                    <Text className="text-[13px] font-bold text-[#714329]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                        x{product.quantity || 1}
                                                    </Text>
                                                </View>
                                            ))}

                                            {order.items?.length > 3 ? (
                                                <Text className="mt-1 text-[12px] text-[#9A7B68]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    +{order.items.length - 3} more item(s)
                                                </Text>
                                            ) : null}
                                        </View>
                                    </Pressable>

                                    <View className="flex-row flex-wrap gap-3 border-t border-[#EAD7C3] px-5 py-4">
                                        <Pressable
                                            onPress={() => router.push(`/order-tracking?orderNumber=${order.orderNumber}` as any)}
                                            className="flex-row items-center gap-2 rounded-full bg-[#2B1E16] px-4 py-3"
                                        >
                                            <Feather name="navigation" size={14} color="#FFFFFF" />
                                            <Text className="text-[12px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                                                Track order
                                            </Text>
                                        </Pressable>

                                        {canRetryPayment ? (
                                            <Pressable
                                                onPress={() => router.push(`/payment-retry?orderNumber=${order.orderNumber}` as any)}
                                                className="flex-row items-center gap-2 rounded-full bg-[#714329] px-4 py-3"
                                            >
                                                <Feather name="credit-card" size={14} color="#FFFFFF" />
                                                <Text className="text-[12px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    Retry payment
                                                </Text>
                                            </Pressable>
                                        ) : null}

                                        {canCancel ? (
                                            <Pressable
                                                onPress={() => handleCancel(order._id, order.orderNumber)}
                                                className="flex-row items-center gap-2 rounded-full border border-[#E7B8B8] bg-[#FFF4F4] px-4 py-3"
                                            >
                                                <Feather name="x-circle" size={14} color="#B91C1C" />
                                                <Text className="text-[12px] font-bold text-[#B91C1C]" style={{ fontFamily: BRAND_FONTS.body }}>
                                                    Cancel
                                                </Text>
                                            </Pressable>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}

                        {hasMore ? (
                            <Pressable
                                onPress={loadMore}
                                className="items-center rounded-full border border-[#D8B99E] bg-[#FFF9F3] px-5 py-4"
                            >
                                <Text className="text-[13px] font-bold text-[#714329]" style={{ fontFamily: BRAND_FONTS.body }}>
                                    Load more orders
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                )}
            </CustomerSectionCard>
        </CustomerPageFrame>
    );
}