import AuthContext from '@/context/AuthContext';
import { trackOrder } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const T = {
    bg: '#1A1209',
    card: '#2C1810',
    card2: '#241610',
    border: '#3D2415',
    active: '#C1622F',
    activeBg: 'rgba(193,98,47,0.15)',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    green: '#4CAF50',
    greenBg: 'rgba(76,175,80,0.12)',
    yellow: '#F5A623',
    red: '#E53E3E',
    blue: '#4299E1',
    blueBg: 'rgba(66,153,225,0.12)',
};

type TrackingEvent = {
    _id: string;
    status: string;
    message: string;
    location?: string;
    timestamp: string;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    pending: { color: T.yellow, bg: 'rgba(245,166,35,0.12)', icon: 'clock', label: 'Order Placed' },
    confirmed: { color: T.blue, bg: T.blueBg, icon: 'check', label: 'Confirmed' },
    processing: { color: T.blue, bg: T.blueBg, icon: 'settings', label: 'Processing' },
    shipped: { color: T.active, bg: T.activeBg, icon: 'truck', label: 'Shipped' },
    out_for_delivery: { color: T.active, bg: T.activeBg, icon: 'navigation', label: 'Out for Delivery' },
    delivered: { color: T.green, bg: T.greenBg, icon: 'check-circle', label: 'Delivered' },
    cancelled: { color: T.red, bg: 'rgba(229,62,62,0.12)', icon: 'x-circle', label: 'Cancelled' },
    returned: { color: T.muted, bg: 'rgba(140,123,110,0.12)', icon: 'rotate-ccw', label: 'Returned' },
};

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTrackingScreen() {
    const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
    const router = useRouter();
    const auth = useContext(AuthContext);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchOrder = async () => {
        if (!orderNumber) { setLoading(false); return; }
        try {
            const { data } = await trackOrder(orderNumber);
            setOrder(data.order);
            setError('');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Order not found.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!auth?.userToken) { router.replace('/login' as any); return; }
        fetchOrder();
    }, [orderNumber]);

    const onRefresh = () => { setRefreshing(true); fetchOrder(); };

    const currentStepIdx = order ? ORDER_STEPS.indexOf(order.status) : -1;
    const isCancelled = order?.status === 'cancelled' || order?.status === 'returned';
    const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending) : null;

    if (loading) {
        return (
            <View style={[s.root, s.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={T.bg} />
                <ActivityIndicator color={T.active} size="large" />
                <Text style={s.muted}>Fetching order details…</Text>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={[s.root, s.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={T.bg} />
                <Feather name="alert-circle" size={56} color={T.red} />
                <Text style={s.title}>{error || 'Order not found'}</Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/orders' as any)}>
                    <Text style={s.primaryBtnText}>My Orders</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={T.bg} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Feather name="arrow-left" size={22} color={T.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.headerTitle}>Order Tracking</Text>
                    <Text style={s.headerSub}>{order.orderNumber}</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={s.backBtn}>
                    <Feather name="refresh-cw" size={18} color={T.muted} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={s.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.active} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Hero */}
                <View style={[s.heroCard, { borderColor: cfg!.color }]}>
                    <View style={[s.heroIcon, { backgroundColor: cfg!.bg }]}>
                        <Feather name={cfg!.icon as any} size={36} color={cfg!.color} />
                    </View>
                    <Text style={[s.heroStatus, { color: cfg!.color }]}>{cfg!.label}</Text>
                    <Text style={s.heroSub}>
                        {isCancelled
                            ? 'This order has been ' + order.status + '.'
                            : order.status === 'delivered'
                                ? 'Your order has been delivered successfully!'
                                : 'Your order is on its way. Stay updated below.'}
                    </Text>
                </View>

                {/* Progress Bar (only for non-cancelled) */}
                {!isCancelled && (
                    <View style={s.progressCard}>
                        <Text style={s.sectionTitle}>Progress</Text>
                        <View style={s.stepsRow}>
                            {ORDER_STEPS.map((step, idx) => {
                                const done = idx <= currentStepIdx;
                                const stepCfg = STATUS_CONFIG[step];
                                return (
                                    <React.Fragment key={step}>
                                        <View style={s.stepCol}>
                                            <View style={[s.stepDot, done && s.stepDotDone, { borderColor: done ? stepCfg.color : T.border }]}>
                                                <Feather
                                                    name={stepCfg.icon as any}
                                                    size={13}
                                                    color={done ? stepCfg.color : T.muted}
                                                />
                                            </View>
                                            <Text style={[s.stepLabel, done && { color: stepCfg.color }]} numberOfLines={2}>
                                                {stepCfg.label}
                                            </Text>
                                        </View>
                                        {idx < ORDER_STEPS.length - 1 && (
                                            <View style={[s.stepLine, idx < currentStepIdx && { backgroundColor: T.active }]} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Courier & Tracking Info */}
                {(order.courier || order.trackingNumber || order.estimatedDelivery) && (
                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Shipment Info</Text>
                        {order.courier && (
                            <View style={s.infoRow}>
                                <Feather name="truck" size={16} color={T.muted} />
                                <Text style={s.infoLabel}>Courier</Text>
                                <Text style={s.infoValue}>{order.courier}</Text>
                            </View>
                        )}
                        {order.trackingNumber && (
                            <View style={s.infoRow}>
                                <Feather name="hash" size={16} color={T.muted} />
                                <Text style={s.infoLabel}>Tracking #</Text>
                                <Text style={[s.infoValue, { color: T.active }]}>{order.trackingNumber}</Text>
                            </View>
                        )}
                        {order.estimatedDelivery && (
                            <View style={s.infoRow}>
                                <Feather name="calendar" size={16} color={T.muted} />
                                <Text style={s.infoLabel}>Est. Delivery</Text>
                                <Text style={s.infoValue}>
                                    {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                        weekday: 'short', day: 'numeric', month: 'long',
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Tracking Timeline */}
                {order.trackingEvents?.length > 0 && (
                    <View style={s.timelineCard}>
                        <Text style={s.sectionTitle}>Tracking History</Text>
                        {[...order.trackingEvents].reverse().map((ev: TrackingEvent, idx: number) => {
                            const evCfg = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.pending;
                            const isFirst = idx === 0;
                            return (
                                <View key={ev._id ?? idx} style={s.timelineRow}>
                                    {/* Vertical line + dot */}
                                    <View style={s.timelineLine}>
                                        <View style={[s.timelineDot, isFirst && { backgroundColor: evCfg.color }]}>
                                            <Feather
                                                name={evCfg.icon as any}
                                                size={11}
                                                color={isFirst ? '#fff' : T.muted}
                                            />
                                        </View>
                                        {idx < order.trackingEvents.length - 1 && (
                                            <View style={s.timelineConnector} />
                                        )}
                                    </View>
                                    {/* Content */}
                                    <View style={[s.timelineContent, isFirst && { borderColor: evCfg.color }]}>
                                        <View style={s.timelineHeader}>
                                            <Text style={[s.timelineStatus, isFirst && { color: evCfg.color }]}>
                                                {evCfg.label}
                                            </Text>
                                            <Text style={s.timelineTime}>
                                                {new Date(ev.timestamp).toLocaleString('en-US', {
                                                    day: 'numeric', month: 'short',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </Text>
                                        </View>
                                        <Text style={s.timelineMsg}>{ev.message}</Text>
                                        {ev.location && (
                                            <View style={s.timelineLoc}>
                                                <Feather name="map-pin" size={11} color={T.muted} />
                                                <Text style={s.timelineLocText}>{ev.location}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (
                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Deliver To</Text>
                        <Text style={s.addrName}>{order.shippingAddress.fullName}</Text>
                        <Text style={s.addrLine}>{order.shippingAddress.address}</Text>
                        <Text style={s.addrLine}>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </Text>
                        <Text style={s.addrLine}>{order.shippingAddress.country}</Text>
                        <Text style={[s.addrLine, { marginTop: 4 }]}>{order.shippingAddress.phone}</Text>
                    </View>
                )}

                {/* Items */}
                <View style={s.infoCard}>
                    <Text style={s.sectionTitle}>
                        Items ({order.items.length})
                    </Text>
                    {order.items.map((it: any) => (
                        <View key={it._id} style={s.orderItemRow}>
                            <View style={s.orderItemInfo}>
                                <Text style={s.orderItemName} numberOfLines={1}>{it.name}</Text>
                                <Text style={s.orderItemSku}>SKU: {it.sku} · Qty: {it.quantity}</Text>
                            </View>
                            <Text style={s.orderItemPrice}>
                                ${((it.salePrice ?? it.price) * it.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    <View style={s.pricingWrap}>
                        <View style={s.pricingRow}>
                            <Text style={s.pricingLabel}>Subtotal</Text>
                            <Text style={s.pricingVal}>${order.subtotal?.toFixed(2)}</Text>
                        </View>
                        <View style={s.pricingRow}>
                            <Text style={s.pricingLabel}>Shipping</Text>
                            <Text style={s.pricingVal}>
                                {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}
                            </Text>
                        </View>
                        <View style={s.pricingRow}>
                            <Text style={s.pricingLabel}>Tax</Text>
                            <Text style={s.pricingVal}>${order.tax?.toFixed(2)}</Text>
                        </View>
                        <View style={[s.pricingRow, s.pricingTotal]}>
                            <Text style={s.pricingTotalLabel}>Total</Text>
                            <Text style={s.pricingTotalVal}>${order.total?.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Back to orders */}
                <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={() => router.push('/orders' as any)}
                    activeOpacity={0.85}
                >
                    <Feather name="list" size={16} color="#fff" />
                    <Text style={s.primaryBtnText}> All Orders</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: T.text },
    headerSub: { fontSize: 12, color: T.active, marginTop: 2, fontWeight: '600' },
    scrollContent: { padding: 16, gap: 12 },

    heroCard: {
        backgroundColor: T.card, borderRadius: 20,
        borderWidth: 1, alignItems: 'center', padding: 28, gap: 10,
    },
    heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    heroStatus: { fontSize: 22, fontWeight: '800' },
    heroSub: { fontSize: 14, color: T.muted, textAlign: 'center' },

    progressCard: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    stepsRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepCol: { alignItems: 'center', flex: 1, gap: 6 },
    stepDot: {
        width: 30, height: 30, borderRadius: 15, borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: T.border,
    },
    stepDotDone: { backgroundColor: 'transparent' },
    stepLabel: { fontSize: 9, color: T.muted, textAlign: 'center', lineHeight: 12 },
    stepLine: { flex: 1, height: 2, backgroundColor: T.border, marginTop: 14, marginHorizontal: -4 },

    infoCard: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    infoLabel: { color: T.muted, fontSize: 13, flex: 1 },
    infoValue: { color: T.text, fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },

    addrName: { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 4 },
    addrLine: { fontSize: 13, color: T.muted, lineHeight: 20 },

    timelineCard: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16 },
    timelineRow: { flexDirection: 'row', marginBottom: 4 },
    timelineLine: { width: 32, alignItems: 'center' },
    timelineDot: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: T.border, alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
    },
    timelineConnector: { width: 2, flex: 1, backgroundColor: T.border, marginTop: 2, marginBottom: 2 },
    timelineContent: {
        flex: 1, marginLeft: 10, backgroundColor: T.card2,
        borderRadius: 12, borderWidth: 1, borderColor: T.border,
        padding: 12, marginBottom: 8,
    },
    timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    timelineStatus: { fontSize: 13, fontWeight: '700', color: T.text },
    timelineTime: { fontSize: 11, color: T.muted },
    timelineMsg: { fontSize: 13, color: T.muted, lineHeight: 18 },
    timelineLoc: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    timelineLocText: { fontSize: 11, color: T.muted },

    orderItemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border,
    },
    orderItemInfo: { flex: 1 },
    orderItemName: { fontSize: 13, color: T.text, fontWeight: '600' },
    orderItemSku: { fontSize: 11, color: T.muted, marginTop: 2 },
    orderItemPrice: { fontSize: 14, color: T.active, fontWeight: '700', marginLeft: 8 },

    pricingWrap: { marginTop: 12, gap: 6 },
    pricingRow: { flexDirection: 'row', justifyContent: 'space-between' },
    pricingLabel: { fontSize: 13, color: T.muted },
    pricingVal: { fontSize: 13, color: T.text, fontWeight: '600' },
    pricingTotal: { borderTopWidth: 1, borderTopColor: T.border, paddingTop: 8, marginTop: 4 },
    pricingTotalLabel: { fontSize: 15, color: T.text, fontWeight: '700' },
    pricingTotalVal: { fontSize: 18, color: T.active, fontWeight: '800' },

    primaryBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: T.active, borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 24, gap: 6, marginTop: 4,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    title: { fontSize: 18, fontWeight: '700', color: T.text, textAlign: 'center' },
    muted: { color: T.muted, fontSize: 14 },
});
