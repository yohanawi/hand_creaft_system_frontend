import { adminTheme as T } from '@/constants/adminTheme';
import { getAdminPaymentOverview } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

function StatCard({ label, value, icon, color, sub }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.iconWrap, { backgroundColor: color + '22' }]}>
                <Feather name={icon} size={18} color={color} />
            </View>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
            {sub ? <Text style={s.statSub}>{sub}</Text> : null}
        </View>
    );
}

export default function AdminPaymentsScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await getAdminPaymentOverview();
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load payment operations.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading payment operations…</Text>
            </View>
        );
    }

    const stats = data?.stats ?? {};
    const paidByMethod = data?.paidByMethod ?? [];
    const recentPaid = data?.recentPaid ?? [];
    const recentIssues = data?.recentIssues ?? [];
    const reconciliation = data?.reconciliation ?? {};

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View>
                <Text style={s.title}>Payment Operations</Text>
                <Text style={s.subtitle}>Track captured, pending, failed, and outstanding payments</Text>
            </View>

            <View style={s.statsGrid}>
                <StatCard label="Paid Orders" value={stats.paidCount ?? 0} icon="check-circle" color={T.green} sub={`$${Number(stats.paidRevenue || 0).toFixed(2)} captured`} />
                <StatCard label="Awaiting Gateway" value={stats.awaitingPaymentCount ?? 0} icon="clock" color={T.blue} sub={`$${Number(stats.pendingGatewayAmount || 0).toFixed(2)} pending`} />
                <StatCard label="COD Outstanding" value={stats.codDueCount ?? 0} icon="truck" color={T.yellow} sub={`$${Number(stats.codOutstandingAmount || 0).toFixed(2)} to collect`} />
                <StatCard label="Failed Payments" value={stats.failedCount ?? 0} icon="alert-circle" color={T.red} />
                <StatCard label="Refunded" value={stats.refundedCount ?? 0} icon="rotate-ccw" color={T.muted} sub={`$${Number(stats.refundedAmount || 0).toFixed(2)} refunded`} />
                <StatCard label="Cancelled Payments" value={stats.cancelledCount ?? 0} icon="x-circle" color={T.red} />
            </View>

            <View style={s.twoCol}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Reconciliation</Text>
                    {[
                        ['Delivered and paid', reconciliation.deliveredAndPaidCount],
                        ['Paid awaiting fulfillment', reconciliation.paidAwaitingFulfillmentCount],
                        ['Delivered COD uncollected', reconciliation.deliveredButUncollectedCodCount],
                        ['Gateway orders pending', reconciliation.pendingGatewayOrderCount],
                    ].map(([label, value]) => (
                        <View key={String(label)} style={s.row}>
                            <Text style={s.rowLabel}>{label}</Text>
                            <Text style={s.rowValue}>{value ?? 0}</Text>
                        </View>
                    ))}
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Paid by Method</Text>
                    {paidByMethod.length === 0 ? <Text style={s.empty}>No paid orders yet.</Text> : paidByMethod.map((item: any) => (
                        <View key={item.paymentMethod} style={s.row}>
                            <Text style={s.rowLabel}>{String(item.paymentMethod).replace(/_/g, ' ')}</Text>
                            <Text style={s.rowValue}>{item.count} orders · ${Number(item.total || 0).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={s.twoCol}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Recent Paid Orders</Text>
                    {recentPaid.length === 0 ? <Text style={s.empty}>No paid orders yet.</Text> : recentPaid.map((order: any) => (
                        <View key={order._id} style={s.listRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowValue}>{order.orderNumber}</Text>
                                <Text style={s.rowLabel}>{order.user?.name ?? 'Customer'} · {String(order.paymentMethod).replace(/_/g, ' ')}</Text>
                            </View>
                            <Text style={[s.rowValue, { color: T.green }]}>${Number(order.total || 0).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Recent Issues</Text>
                    {recentIssues.length === 0 ? <Text style={s.empty}>No payment issues currently.</Text> : recentIssues.map((order: any) => (
                        <View key={order._id} style={s.listRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowValue}>{order.orderNumber}</Text>
                                <Text style={s.rowLabel}>{String(order.paymentStatus).replace(/_/g, ' ')}</Text>
                                {order.paymentFailureReason ? <Text style={s.issueText}>{order.paymentFailureReason}</Text> : null}
                            </View>
                            <Text style={[s.rowValue, { color: T.active }]}>${Number(order.total || 0).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
    muted: { color: T.muted },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 170, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, borderRadius: 14, padding: 16 },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, marginTop: 4, fontSize: 12 },
    statSub: { color: T.muted, marginTop: 6, fontSize: 11 },
    twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    col: { flex: 1, minWidth: 320 },
    panel: { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 16, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    rowLabel: { color: T.muted, fontSize: 13, flex: 1 },
    rowValue: { color: T.text, fontSize: 13, fontWeight: '700' },
    listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    issueText: { color: T.muted, fontSize: 12, marginTop: 4 },
    empty: { color: T.muted, fontSize: 13, paddingVertical: 12 },
});