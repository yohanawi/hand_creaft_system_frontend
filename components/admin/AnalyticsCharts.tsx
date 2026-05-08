import { adminTheme as T } from '@/constants/adminTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

const CHART_COLORS = ['#B46A2B', '#2B6CB0', '#2F855A', '#C53030', '#805AD5', '#B7791F', '#0F766E'];

export function AnalyticsCard({ title, subtitle, children }: any) {
    return (
        <View style={s.card}>
            <Text style={s.cardTitle}>{title}</Text>
            {subtitle ? <Text style={s.cardSubtitle}>{subtitle}</Text> : null}
            {children}
        </View>
    );
}

export function LineTrendChart({ data = [], color = T.active }: any) {
    const width = 320;
    const height = 170;
    const paddingX = 16;
    const paddingY = 18;
    const maxValue = Math.max(...data.map((item: any) => Number(item.revenue || 0)), 1);
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    const points = data.map((item: any, index: number) => {
        const x = paddingX + index * stepX;
        const y = paddingY + chartHeight - (Number(item.revenue || 0) / maxValue) * chartHeight;
        return { ...item, x, y };
    });

    return (
        <View>
            <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                <Polyline
                    points={points.map((point: any) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                {points.map((point: any) => (
                    <Circle key={point.label} cx={point.x} cy={point.y} r="5" fill={color} />
                ))}
            </Svg>
            <View style={s.axisRow}>
                {data.map((item: any) => (
                    <View key={item.label} style={s.axisItem}>
                        <Text style={s.axisLabel}>{item.label}</Text>
                        <Text style={s.axisMeta}>${Number(item.revenue || 0).toFixed(0)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export function DonutStatusChart({ data = [] }: any) {
    const radius = 70;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    const total = Math.max(data.reduce((sum: number, item: any) => sum + Number(item.count || 0), 0), 1);
    let offset = 0;

    return (
        <View style={s.donutWrap}>
            <View style={s.donutChart}>
                <Svg width={190} height={190} viewBox="0 0 190 190">
                    <Circle cx="95" cy="95" r={radius} stroke={T.cardBorder} strokeWidth={strokeWidth} fill="none" />
                    {data.map((item: any, index: number) => {
                        const value = Number(item.count || 0);
                        const segment = (value / total) * circumference;
                        const circle = (
                            <Circle
                                key={item.status}
                                cx="95"
                                cy="95"
                                r={radius}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${segment} ${circumference}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="butt"
                                rotation="-90"
                                origin="95,95"
                            />
                        );
                        offset += segment;
                        return circle;
                    })}
                </Svg>
                <View style={s.donutCenter}>
                    <Text style={s.donutTotal}>{total}</Text>
                    <Text style={s.donutLabel}>orders</Text>
                </View>
            </View>
            <View style={s.legendList}>
                {data.map((item: any, index: number) => (
                    <View key={item.status} style={s.legendRow}>
                        <View style={[s.legendDot, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                        <Text style={s.legendText}>{String(item.status || '').replace(/_/g, ' ')}</Text>
                        <Text style={s.legendValue}>{item.count}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export function ColumnBarChart({ data = [] }: any) {
    const maxValue = Math.max(...data.map((item: any) => Number(item.quantity || 0)), 1);

    return (
        <View style={s.columnsWrap}>
            {data.map((item: any, index: number) => {
                const heightPercent = Math.max(12, Math.round((Number(item.quantity || 0) / maxValue) * 100));
                return (
                    <View key={item._id || item.name || index} style={s.columnItem}>
                        <Text style={s.columnValue}>{item.quantity}</Text>
                        <View style={s.columnTrack}>
                            <View style={[s.columnBar, { height: `${heightPercent}%` as const, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                        </View>
                        <Text style={s.columnLabel} numberOfLines={2}>{item.name}</Text>
                        <Text style={s.columnMeta}>${Number(item.revenue || 0).toFixed(0)}</Text>
                    </View>
                );
            })}
        </View>
    );
}

export function HorizontalComparisonChart({ data = [] }: any) {
    const maxValue = Math.max(...data.map((item: any) => Number(item.grossSales || 0)), 1);

    return (
        <View style={s.horizontalList}>
            {data.map((item: any, index: number) => {
                const widthPercent = Math.max(10, Math.round((Number(item.grossSales || 0) / maxValue) * 100));
                return (
                    <View key={item._id || item.shopName || index} style={s.horizontalRow}>
                        <View style={s.horizontalHead}>
                            <Text style={s.horizontalLabel}>{item.shopName || item.sellerName || 'Seller'}</Text>
                            <Text style={s.horizontalValue}>${Number(item.grossSales || 0).toFixed(0)}</Text>
                        </View>
                        <View style={s.horizontalTrack}>
                            <View style={[s.horizontalFill, { width: `${widthPercent}%` as const, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
                        </View>
                        <Text style={s.horizontalMeta}>{item.orderCount} orders · {item.itemsSold} items · AOV ${Number(item.averageOrderValue || 0).toFixed(0)}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, padding: 16, flex: 1, minWidth: 300, gap: 12 },
    cardTitle: { color: T.text, fontSize: 16, fontWeight: '700' },
    cardSubtitle: { color: T.muted, fontSize: 12, lineHeight: 18 },
    axisRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 6 },
    axisItem: { flex: 1, alignItems: 'center' },
    axisLabel: { color: T.muted, fontSize: 11, fontWeight: '700' },
    axisMeta: { color: T.text, fontSize: 11, marginTop: 4 },
    donutWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
    donutChart: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
    donutCenter: { position: 'absolute', alignItems: 'center' },
    donutTotal: { color: T.text, fontSize: 26, fontWeight: '700' },
    donutLabel: { color: T.muted, fontSize: 12 },
    legendList: { flex: 1, gap: 10, minWidth: 180 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { flex: 1, color: T.text, fontSize: 13, textTransform: 'capitalize' },
    legendValue: { color: T.muted, fontWeight: '700' },
    columnsWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, minHeight: 190 },
    columnItem: { flex: 1, alignItems: 'center', gap: 8 },
    columnValue: { color: T.text, fontWeight: '700', fontSize: 12 },
    columnTrack: { width: '100%', maxWidth: 54, height: 120, borderRadius: 16, backgroundColor: T.input, justifyContent: 'flex-end', overflow: 'hidden' },
    columnBar: { width: '100%', borderRadius: 16 },
    columnLabel: { color: T.text, fontSize: 11, textAlign: 'center', minHeight: 32 },
    columnMeta: { color: T.muted, fontSize: 11 },
    horizontalList: { gap: 12 },
    horizontalRow: { gap: 6 },
    horizontalHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    horizontalLabel: { flex: 1, color: T.text, fontWeight: '700', fontSize: 13 },
    horizontalValue: { color: T.text, fontWeight: '700', fontSize: 12 },
    horizontalTrack: { height: 12, borderRadius: 999, backgroundColor: T.input, overflow: 'hidden' },
    horizontalFill: { height: '100%', borderRadius: 999 },
    horizontalMeta: { color: T.muted, fontSize: 11 },
});