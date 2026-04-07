import { getAdminWishlistInsights } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const T = {
    bg: '#1E150C',
    card: '#2C1810',
    cardBorder: '#3D2415',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    active: '#C1622F',
    green: '#38A169',
    yellow: '#D69E2E',
    blue: '#3182CE',
};

export default function AdminWishlistInsightsScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await getAdminWishlistInsights();
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load wishlist insights.');
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
        return <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>;
    }

    const summary = data?.summary ?? {};
    const topWishlistedProducts = data?.topWishlistedProducts ?? [];
    const topConvertedProducts = data?.topConvertedProducts ?? [];

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}>
            <View>
                <Text style={s.title}>Wishlist Conversion Insights</Text>
                <Text style={s.subtitle}>See how wishlisted products convert into actual orders</Text>
            </View>

            <View style={s.statsGrid}>
                {[
                    ['Users With Wishlist', summary.usersWithWishlist, T.blue],
                    ['Wishlist Items', summary.totalWishlistItems, T.active],
                    ['Converted Items', summary.convertedWishlistItems, T.green],
                    ['Users Converted', summary.usersWithConvertedWishlist, T.yellow],
                    ['User Conversion %', `${summary.userConversionRate ?? 0}%`, T.green],
                    ['Item Conversion %', `${summary.itemConversionRate ?? 0}%`, T.green],
                ].map(([label, value, color]) => (
                    <View key={String(label)} style={[s.statCard, { borderTopColor: String(color) }]}>
                        <Text style={s.statValue}>{value ?? 0}</Text>
                        <Text style={s.statLabel}>{label}</Text>
                    </View>
                ))}
            </View>

            <View style={s.twoCol}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Top Wishlisted Products</Text>
                    {topWishlistedProducts.length === 0 ? <Text style={s.empty}>No wishlist data yet.</Text> : topWishlistedProducts.map((entry: any) => (
                        <View key={entry.product?._id || entry.product?.name} style={s.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.productName}>{entry.product?.name}</Text>
                                <Text style={s.productMeta}>SKU: {entry.product?.sku || '—'}</Text>
                            </View>
                            <Text style={s.productMetric}>{entry.wishlistedUsers} wishlists</Text>
                        </View>
                    ))}
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Top Converted Products</Text>
                    {topConvertedProducts.length === 0 ? <Text style={s.empty}>No conversion data yet.</Text> : topConvertedProducts.map((entry: any) => (
                        <View key={entry.product?._id || entry.product?.name} style={s.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.productName}>{entry.product?.name}</Text>
                                <Text style={s.productMeta}>SKU: {entry.product?.sku || '—'}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={s.productMetric}>{entry.convertedUsers} converted</Text>
                                <Text style={s.productMeta}>{entry.conversionRate}% rate</Text>
                            </View>
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
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 150, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, borderRadius: 14, padding: 16 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, fontSize: 12, marginTop: 4 },
    twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    col: { flex: 1, minWidth: 320 },
    panel: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    productName: { color: T.text, fontSize: 14, fontWeight: '700' },
    productMeta: { color: T.muted, fontSize: 12, marginTop: 4 },
    productMetric: { color: T.active, fontSize: 13, fontWeight: '700' },
    empty: { color: T.muted, fontSize: 13, paddingVertical: 10 },
});