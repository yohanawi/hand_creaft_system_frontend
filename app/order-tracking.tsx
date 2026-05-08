import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { trackOrder } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type TrackingEvent = {
    _id: string;
    status: string;
    message: string;
    location?: string;
    timestamp: string;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: keyof typeof Feather.glyphMap; label: string }> = {
    awaiting_payment: { color: '#2563EB', bg: 'rgba(66,153,225,0.12)', icon: 'credit-card', label: 'Awaiting Payment' },
    payment_failed: { color: '#E53E3E', bg: 'rgba(229,62,62,0.12)', icon: 'alert-circle', label: 'Payment Failed' },
    pending: { color: '#D97706', bg: 'rgba(245,166,35,0.12)', icon: 'clock', label: 'Order Placed' },
    confirmed: { color: '#2563EB', bg: 'rgba(66,153,225,0.12)', icon: 'check', label: 'Confirmed' },
    processing: { color: '#2563EB', bg: 'rgba(66,153,225,0.12)', icon: 'settings', label: 'Processing' },
    shipped: { color: '#C1622F', bg: 'rgba(193,98,47,0.15)', icon: 'truck', label: 'Shipped' },
    out_for_delivery: { color: '#C1622F', bg: 'rgba(193,98,47,0.15)', icon: 'navigation', label: 'Out for Delivery' },
    delivered: { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)', icon: 'check-circle', label: 'Delivered' },
    cancelled: { color: '#E53E3E', bg: 'rgba(229,62,62,0.12)', icon: 'x-circle', label: 'Cancelled' },
    returned: { color: '#8C7B6E', bg: 'rgba(140,123,110,0.12)', icon: 'rotate-ccw', label: 'Returned' },
};

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const PAYHERE_ORDER_STEPS = ['awaiting_payment', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTrackingScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
    const router = useRouter();
    const auth = useProtectedRoute();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [orderInput, setOrderInput] = useState('');
    const [activeOrderNumber, setActiveOrderNumber] = useState('');

    const fetchOrder = useCallback(async (targetOrderNumber?: string) => {
        const nextOrderNumber = String(targetOrderNumber || orderInput || orderNumber || '').trim().toUpperCase();

        if (!nextOrderNumber) {
            setError('Choose an order from your dashboard or orders page to start tracking.');
            setOrder(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const { data } = await trackOrder(nextOrderNumber);
            setOrder(data.order);
            setError('');
            setActiveOrderNumber(nextOrderNumber);
        } catch (err: any) {
            setOrder(null);
            setActiveOrderNumber(nextOrderNumber);
            setError(err?.response?.data?.message ?? 'Order not found');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderInput, orderNumber]);

    useEffect(() => {
        const nextOrderNumber = String(orderNumber || '').trim().toUpperCase();
        if (nextOrderNumber) {
            setOrderInput(nextOrderNumber);
        }
    }, [orderNumber]);

    useEffect(() => {
        if (!auth.isAuthorized) {
            return;
        }

        if (!orderNumber) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchOrder(String(orderNumber).trim().toUpperCase());
    }, [auth.isAuthorized, fetchOrder, orderNumber]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrder(activeOrderNumber || orderInput || String(orderNumber || '').trim().toUpperCase());
    }, [activeOrderNumber, fetchOrder, orderInput, orderNumber]);

    const activeSteps = order?.paymentMethod === 'payhere' ? PAYHERE_ORDER_STEPS : ORDER_STEPS;
    const currentStepIdx = order ? activeSteps.indexOf(order.status) : -1;
    const isCancelled = order?.status === 'cancelled' || order?.status === 'returned';
    const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending) : null;

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
            eyebrow="Order Tracking"
            title={order ? `Tracking ${order.orderNumber}` : 'Tracking your order'}
            subtitle={
                loading
                    ? 'Fetching the latest fulfilment information for this order.'
                    : error || !order
                        ? 'The order could not be found for this account.'
                        : 'Live status, payment state, shipment details, and full order contents in one customer view.'
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BROWN.DarkColor} />}
            sidebar={<CustomerSidebar />}
            actions={
                <>
                    <TouchableOpacity onPress={() => router.replace('/orders' as any)} className="rounded-full px-5 py-3" style={{ backgroundColor: '#FFFFFF' }}>
                        <Text className="font-body text-[14px] font-semibold" style={{ color: BROWN.TextPrimary }}>All orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onRefresh} className="rounded-full border px-5 py-3" style={{ borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[14px] font-semibold text-white">Refresh</Text>
                    </TouchableOpacity>
                </>
            }
            heroAside={
                order ? (
                    <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Current state</Text>
                        <Text className="mt-3 font-heading text-[24px] text-white">{cfg?.label}</Text>
                        <View className="gap-3 mt-5">
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Payment</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">{String(order.paymentStatus || '').replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Total</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">${Number(order.total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                ) : undefined
            }
        >
            <CustomerSectionCard title="Track an order" subtitle="Enter an order number to view the latest fulfilment and payment updates.">
                <View className="gap-3 md:flex-row md:items-center">
                    <TextInput
                        value={orderInput}
                        onChangeText={(value) => setOrderInput(value.toUpperCase())}
                        placeholder="Enter order number"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        className="flex-1 rounded-[18px] border px-4 py-4 text-[14px]"
                        style={{ borderColor: '#EAD7C3', backgroundColor: '#FFFAF5', color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                        placeholderTextColor={BROWN.TextSecondary}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            setLoading(true);
                            fetchOrder(orderInput);
                        }}
                        className="items-center rounded-full px-5 py-4"
                        style={{ backgroundColor: BROWN.DarkColor, opacity: loading ? 0.8 : 1 }}
                        disabled={loading}
                    >
                        <Text className="font-body text-[13px] font-semibold text-white">Track order</Text>
                    </TouchableOpacity>
                </View>
                <Text className="font-body text-[12px]" style={{ color: BROWN.TextSecondary }}>
                    {activeOrderNumber ? `Showing results for ${activeOrderNumber}.` : 'You can paste an order number from your confirmation email or orders page.'}
                </Text>
            </CustomerSectionCard>

            {loading ? (
                <CustomerSectionCard title="Loading order" subtitle="Checking the current order state.">
                    <View className="items-center justify-center py-12 gap-3">
                        <ActivityIndicator color={BROWN.DarkColor} size="large" />
                        <Text style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>Fetching order details...</Text>
                    </View>
                </CustomerSectionCard>
            ) : error || !order ? (
                <CustomerSectionCard title="Order unavailable" subtitle="This order could not be loaded for the current session.">
                    <View className="items-center justify-center rounded-[24px] px-6 py-10" style={{ backgroundColor: '#F8EFE6' }}>
                        <Feather name="alert-circle" size={44} color="#E53E3E" />
                        <Text className="mt-4 text-center font-heading text-[24px]" style={{ color: BROWN.TextPrimary }}>{error || 'Order not found'}</Text>
                        <TouchableOpacity onPress={() => router.replace('/orders' as any)} className="mt-5 rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor }}>
                            <Text className="font-body text-[13px] font-semibold text-white">Back to orders</Text>
                        </TouchableOpacity>
                    </View>
                </CustomerSectionCard>
            ) : (
                <>
                    <CustomerSectionCard title="Current status" subtitle="The latest order state and what it means for this delivery.">
                        <View className="items-center rounded-[24px] border px-6 py-8" style={{ borderColor: `${cfg!.color}40`, backgroundColor: '#FFFAF5' }}>
                            <View className="h-[72px] w-[72px] items-center justify-center rounded-full" style={{ backgroundColor: cfg!.bg }}>
                                <Feather name={cfg!.icon} size={36} color={cfg!.color} />
                            </View>
                            <Text className="mt-5 font-heading text-[28px] text-center" style={{ color: cfg!.color }}>{cfg!.label}</Text>
                            <Text className="mt-3 text-center font-body text-[14px] leading-7" style={{ color: BROWN.TextSecondary }}>
                                {isCancelled
                                    ? 'This order has been ' + order.status + '.'
                                    : order.status === 'awaiting_payment'
                                        ? 'Your order is created. The system is waiting for PayHere to confirm payment securely.'
                                        : order.status === 'payment_failed'
                                            ? 'Payment did not complete. Retry payment from your payment failure page or orders list.'
                                            : order.status === 'delivered'
                                                ? 'Your order has been delivered successfully!'
                                                : 'Your order is on its way. Stay updated below.'}
                            </Text>
                        </View>
                    </CustomerSectionCard>

                    {!isCancelled ? (
                        <CustomerSectionCard title="Progress" subtitle="Each fulfilment milestone from order placement through delivery.">
                            <View className="gap-5">
                                {activeSteps.map((step, idx) => {
                                    const done = idx <= currentStepIdx;
                                    const stepCfg = STATUS_CONFIG[step];
                                    return (
                                        <View key={step} className="flex-row items-center gap-4">
                                            <View className="h-[34px] w-[34px] items-center justify-center rounded-full border-2" style={{ borderColor: done ? stepCfg.color : '#E3D0BF', backgroundColor: done ? `${stepCfg.color}12` : '#FFF9F3' }}>
                                                <Feather name={stepCfg.icon} size={14} color={done ? stepCfg.color : '#8C7B6E'} />
                                            </View>
                                            <View className="flex-1 rounded-[18px] px-4 py-4" style={{ backgroundColor: done ? '#F6ECDF' : '#FFFAF5' }}>
                                                <Text className="font-body text-[13px] font-semibold" style={{ color: done ? stepCfg.color : BROWN.TextPrimary }}>{stepCfg.label}</Text>
                                                <Text className="mt-1 font-body text-[12px]" style={{ color: BROWN.TextSecondary }}>
                                                    {idx < currentStepIdx ? 'Completed' : idx === currentStepIdx ? 'Current stage' : 'Upcoming'}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </CustomerSectionCard>
                    ) : null}

                    <CustomerSectionCard title="Payment info" subtitle="Payment method, state, and reference details for this order.">
                        <View className="gap-3">
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Method</Text>
                                <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.paymentMethod || '').replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Payment status</Text>
                                <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.paymentStatus || '').replace(/_/g, ' ')}</Text>
                            </View>
                            {order.paymentReference ? (
                                <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Reference</Text>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.paymentReference}</Text>
                                </View>
                            ) : null}
                            {order.paymentMethod === 'payhere' && ['awaiting_payment', 'failed'].includes(order.paymentStatus) ? (
                                <TouchableOpacity onPress={() => router.push(`/payment-failure?orderId=${order._id}` as any)} className="self-start rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor }}>
                                    <Text className="font-body text-[13px] font-semibold text-white">Complete payment</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </CustomerSectionCard>

                    {(order.courier || order.trackingNumber || order.estimatedDelivery) ? (
                        <CustomerSectionCard title="Shipment info" subtitle="Courier, tracking number, and estimated delivery details.">
                            <View className="gap-3">
                                {order.courier ? (
                                    <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                        <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Courier</Text>
                                        <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.courier}</Text>
                                    </View>
                                ) : null}
                                {order.trackingNumber ? (
                                    <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                        <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Tracking #</Text>
                                        <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.DarkColor }}>{order.trackingNumber}</Text>
                                    </View>
                                ) : null}
                                {order.estimatedDelivery ? (
                                    <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                        <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Est. delivery</Text>
                                        <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>
                                            {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                                weekday: 'short', day: 'numeric', month: 'long',
                                            })}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </CustomerSectionCard>
                    ) : null}

                    {order.trackingEvents?.length > 0 ? (
                        <CustomerSectionCard title="Tracking history" subtitle="Detailed movement and fulfilment updates from the courier and order system.">
                            <View className="gap-4">
                                {[...order.trackingEvents].reverse().map((ev: TrackingEvent, idx: number) => {
                                    const evCfg = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.pending;
                                    const isFirst = idx === 0;
                                    return (
                                        <View key={ev._id ?? idx} className="flex-row gap-4">
                                            <View className="items-center">
                                                <View className="h-[28px] w-[28px] items-center justify-center rounded-full" style={{ backgroundColor: isFirst ? evCfg.color : '#EAD7C3' }}>
                                                    <Feather name={evCfg.icon} size={11} color={isFirst ? '#FFFFFF' : '#8C7B6E'} />
                                                </View>
                                                {idx < order.trackingEvents.length - 1 ? <View className="mt-1 h-full w-[2px]" style={{ backgroundColor: '#EAD7C3' }} /> : null}
                                            </View>
                                            <View className="flex-1 rounded-[18px] border px-4 py-4" style={{ borderColor: isFirst ? `${evCfg.color}50` : '#EAD7C3', backgroundColor: '#FFFAF5' }}>
                                                <View className="flex-row items-center justify-between gap-3">
                                                    <Text className="font-body text-[13px] font-semibold" style={{ color: isFirst ? evCfg.color : BROWN.TextPrimary }}>
                                                        {evCfg.label}
                                                    </Text>
                                                    <Text className="font-body text-[11px]" style={{ color: BROWN.TextSecondary }}>
                                                        {new Date(ev.timestamp).toLocaleString('en-US', {
                                                            day: 'numeric', month: 'short',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </Text>
                                                </View>
                                                <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>{ev.message}</Text>
                                                {ev.location ? (
                                                    <View className="mt-3 flex-row items-center gap-2">
                                                        <Feather name="map-pin" size={11} color={BROWN.TextSecondary} />
                                                        <Text className="font-body text-[11px]" style={{ color: BROWN.TextSecondary }}>{ev.location}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </CustomerSectionCard>
                    ) : null}

                    {order.shippingAddress ? (
                        <CustomerSectionCard title="Deliver to" subtitle="Shipping address currently attached to this order.">
                            <Text className="font-body text-[15px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.shippingAddress.fullName}</Text>
                            <Text className="mt-2 font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>{order.shippingAddress.address}</Text>
                            <Text className="font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</Text>
                            <Text className="font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>{order.shippingAddress.country}</Text>
                            <Text className="mt-2 font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>{order.shippingAddress.phone}</Text>
                        </CustomerSectionCard>
                    ) : null}

                    <CustomerSectionCard title={`Items (${order.items.length})`} subtitle="Products, variants, quantities, and final pricing for this order.">
                        <View className="gap-4">
                            {order.items.map((it: any) => (
                                <View key={it._id} className="flex-row items-center justify-between gap-4 rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <View className="flex-1">
                                        <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }} numberOfLines={1}>{it.name}</Text>
                                        {it.selectedVariant?.label ? (
                                            <Text className="mt-1 font-body text-[11px]" style={{ color: BROWN.DarkColor }}>{it.selectedVariant.label}</Text>
                                        ) : null}
                                        <Text className="mt-1 font-body text-[11px]" style={{ color: BROWN.TextSecondary }}>SKU: {it.sku} · Qty: {it.quantity}</Text>
                                    </View>
                                    <Text className="font-body text-[14px] font-semibold" style={{ color: BROWN.DarkColor }}>
                                        ${((it.salePrice ?? it.price) * it.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                            <View className="gap-3 rounded-[18px] px-4 py-4" style={{ backgroundColor: '#FFFAF5' }}>
                                <View className="flex-row items-center justify-between">
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Subtotal</Text>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>${order.subtotal?.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Shipping</Text>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Tax</Text>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>${order.tax?.toFixed(2)}</Text>
                                </View>
                                <View className="mt-2 flex-row items-center justify-between border-t pt-3" style={{ borderColor: '#EAD7C3' }}>
                                    <Text className="font-body text-[15px] font-semibold" style={{ color: BROWN.TextPrimary }}>Total</Text>
                                    <Text className="font-heading text-[22px]" style={{ color: BROWN.DarkColor }}>${order.total?.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </CustomerSectionCard>
                </>
            )}
        </CustomerPageFrame>
    );
}
