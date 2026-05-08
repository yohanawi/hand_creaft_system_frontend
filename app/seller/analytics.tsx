import { sellerTheme as T } from '@/constants/sellerTheme';
import { getSellerAnalytics } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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

const RANGES: (7 | 30 | 90)[] = [7, 30, 90];

const formatMoney = (value: number) => `$${Number(value || 0).toFixed(2)}`;

function StatCard({ icon, label, value, sub, color }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.iconWrap, { backgroundColor: `${color}22` }]}>
                <Feather name={icon} size={18} color={color} />
            </View>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
            {sub ? <Text style={s.statSub}>{sub}</Text> : null}
        </View>
    );
}

function HorizontalBars({ data, formatter = (value: number) => String(value), color = T.active }: any) {
    const maxValue = Math.max(...data.map((row: any) => Number(row.value || 0)), 1);

    return data.map((row: any) => (
        <View key={row.label} style={s.barRow}>
            <View style={s.barHead}>
                <Text style={s.barLabel}>{row.label}</Text>
                <Text style={s.barValue}>{formatter(row.value)}</Text>
            </View>
            <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${(Number(row.value || 0) / maxValue) * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    ));
}

export default function SellerAnalyticsScreen() {
    const [range, setRange] = useState<7 | 30 | 90>(30);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (nextRange = range) => {
        try {
            const { data: response } = await getSellerAnalytics({ range: nextRange });
            setData(response);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load seller analytics.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [range]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load(range);
    }, [load, range]));

    const revenueTrend = useMemo(() => data?.revenueTrend ?? [], [data]);
    const topByQuantity = data?.topProductsByQuantity ?? [];
    const topByRevenue = data?.topProductsByRevenue ?? [];
    const zeroSales = data?.zeroSalesProductsLast30Days ?? [];
    const summary = data?.summary ?? {};
    const distribution = data?.statusDistribution ?? {};

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading analytics…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(range); }} tintColor={T.active} />}
        >
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Analytics</Text>
                    <Text style={s.subtitle}>Track revenue, product momentum, and fulfillment performance for your handmade catalog.</Text>
                </View>
                <View style={s.rangeRow}>
                    {RANGES.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[s.rangeChip, range === option && s.rangeChipActive]}
                            onPress={() => {
                                setRange(option);
                                setLoading(true);
                                load(option);
                            }}
                        >
                            <Text style={[s.rangeText, range === option && s.rangeTextActive]}>{option}d</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={s.statsGrid}>
                <StatCard icon="dollar-sign" label="Revenue" value={formatMoney(summary.totalRevenue || 0)} color={T.green} sub="Delivered seller items" />
                <StatCard icon="shopping-bag" label="Completed Orders" value={summary.completedOrders || 0} color={T.blue} sub={`${summary.totalOrders || 0} total seller orders`} />
                <StatCard icon="bar-chart-2" label="Avg Order Value" value={formatMoney(summary.averageOrderValue || 0)} color={T.active} sub="Delivered orders only" />
                <StatCard icon="target" label="Conversion Rate" value={`${Number(summary.conversionRate || 0).toFixed(2)}%`} color={T.teal} sub="Completed divided by total" />
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Revenue Trend</Text>
                {revenueTrend.length === 0 ? (
                    <Text style={s.empty}>No revenue trend data for this range yet.</Text>
                ) : (
                    <HorizontalBars
                        data={revenueTrend.map((row: any) => ({ label: row.date.slice(5), value: row.revenue }))}
                        formatter={formatMoney}
                        color={T.active}
                    />
                )}
            </View>

            <View style={s.dualRow}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Order Status Distribution</Text>
                    <HorizontalBars
                        data={Object.entries(distribution).map(([label, value]) => ({ label: label.replace(/_/g, ' '), value }))}
                        formatter={(value: number) => String(value)}
                        color={T.blue}
                    />
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Products With No Sales In 30 Days</Text>
                    {zeroSales.length === 0 ? (
                        <Text style={s.empty}>Every active product has recent sales.</Text>
                    ) : zeroSales.slice(0, 6).map((product: any) => (
                        <View key={product.productId} style={s.listRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowTitle}>{product.productName}</Text>
                                <Text style={s.rowSub}>Current quantity: {product.currentQuantity}</Text>
                            </View>
                            <Feather name="moon" size={16} color={T.yellow} />
                        </View>
                    ))}
                </View>
            </View>

            <View style={s.dualRow}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Best Sellers By Quantity</Text>
                    {topByQuantity.length === 0 ? (
                        <Text style={s.empty}>No delivered sales yet.</Text>
                    ) : topByQuantity.map((product: any) => (
                        <View key={product.productId} style={s.listRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowTitle}>{product.productName}</Text>
                                <Text style={s.rowSub}>{product.quantitySold} units sold</Text>
                            </View>
                            <Text style={s.rowMetric}>{formatMoney(product.revenue || 0)}</Text>
                        </View>
                    ))}
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Top Revenue Products</Text>
                    {topByRevenue.length === 0 ? (
                        <Text style={s.empty}>No delivered sales yet.</Text>
                    ) : topByRevenue.map((product: any) => (
                        <View key={product.productId} style={s.listRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowTitle}>{product.productName}</Text>
                                <Text style={s.rowSub}>Turnover {Number(product.inventoryTurnoverRate || 0).toFixed(2)}x</Text>
                            </View>
                            <Text style={s.rowMetric}>{formatMoney(product.revenue || 0)}</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4, maxWidth: 580 },
    rangeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    rangeChip: { borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: T.card },
    rangeChipActive: { backgroundColor: T.activeBg, borderColor: T.active },
    rangeText: { color: T.muted, fontWeight: '700' },
    rangeTextActive: { color: T.active },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 160, backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, padding: 16 },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, marginTop: 4, fontSize: 12, fontWeight: '600' },
    statSub: { color: T.muted, marginTop: 6, fontSize: 11 },
    panel: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
    dualRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
    col: { flex: 1, minWidth: 320 },
    empty: { color: T.muted, fontSize: 13, paddingVertical: 8 },
    barRow: { marginBottom: 12 },
    barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
    barLabel: { color: T.text, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    barValue: { color: T.muted, fontSize: 12, fontWeight: '700' },
    barTrack: { height: 10, borderRadius: 999, backgroundColor: T.activeBg, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 999 },
    listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    rowTitle: { color: T.text, fontSize: 14, fontWeight: '700' },
    rowSub: { color: T.muted, marginTop: 4, fontSize: 12 },
    rowMetric: { color: T.active, fontWeight: '800', fontSize: 13 },
});