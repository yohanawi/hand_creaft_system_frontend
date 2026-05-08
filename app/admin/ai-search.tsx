import { adminTheme as T } from '@/constants/adminTheme';
import {
    getAiIndexStatus,
    getAiServiceHealth,
    getProducts,
    indexAiProduct,
    indexAllAiProducts,
} from '@/services/api';
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

export default function AdminAiSearchScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [indexingAll, setIndexingAll] = useState(false);
    const [indexingId, setIndexingId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [health, setHealth] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [lastRun, setLastRun] = useState<any>(null);

    const load = useCallback(async () => {
        try {
            const [statusRes, healthRes, productsRes] = await Promise.all([
                getAiIndexStatus(),
                getAiServiceHealth().catch((error) => error?.response),
                getProducts(),
            ]);
            setStatus(statusRes.data);
            setHealth(healthRes?.data ?? healthRes ?? null);
            setProducts(productsRes.data?.products ?? productsRes.data ?? []);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load AI search status.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const handleIndexAll = async () => {
        setIndexingAll(true);
        try {
            const { data } = await indexAllAiProducts();
            setLastRun(data);
            await load();
            Alert.alert('AI Indexing Complete', `${data.indexed} indexed, ${data.failed} failed, ${data.skipped} skipped.`);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Bulk indexing failed.');
        } finally {
            setIndexingAll(false);
        }
    };

    const handleIndexOne = async (id: string) => {
        setIndexingId(id);
        try {
            const { data } = await indexAiProduct(id);
            Alert.alert('Indexed', data.message || 'Product indexed successfully.');
            await load();
        } catch (error: any) {
            Alert.alert('Index Failed', error?.response?.data?.error || error?.response?.data?.message || 'Failed to index product.');
        } finally {
            setIndexingId(null);
        }
    };

    const serviceHealthy = health?.healthy ?? status?.aiService?.healthy;
    const featureSize = health?.feature_vector_size || status?.aiService?.feature_vector_size || '—';

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View style={s.header}>
                <View>
                    <Text style={s.title}>AI Search Operations</Text>
                    <Text style={s.subtitle}>Monitor the Python AI service and manage product indexing</Text>
                </View>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => router.push('/admin/products' as any)}>
                    <Feather name="package" size={16} color={T.active} />
                    <Text style={s.secondaryBtnText}>Manage Products</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={s.center}><ActivityIndicator size="large" color={T.active} /></View>
            ) : (
                <>
                    <View style={s.statsGrid}>
                        <View style={[s.statCard, { borderTopColor: serviceHealthy ? T.green : T.red }]}>
                            <Text style={s.statValue}>{serviceHealthy ? 'Healthy' : 'Offline'}</Text>
                            <Text style={s.statLabel}>AI Service</Text>
                            <Text style={s.statSub}>{status?.aiService?.serviceUrl || 'http://localhost:5001'}</Text>
                        </View>
                        <View style={[s.statCard, { borderTopColor: T.active }]}>
                            <Text style={s.statValue}>{status?.indexed ?? 0}/{status?.total ?? 0}</Text>
                            <Text style={s.statLabel}>Indexed Products</Text>
                            <Text style={s.statSub}>{status?.percentComplete ?? 0}% complete</Text>
                        </View>
                        <View style={[s.statCard, { borderTopColor: T.yellow }]}>
                            <Text style={s.statValue}>{status?.pending ?? 0}</Text>
                            <Text style={s.statLabel}>Pending Indexing</Text>
                            <Text style={s.statSub}>{status?.ready ? 'Visual search ready' : 'Index at least one product'}</Text>
                        </View>
                        <View style={[s.statCard, { borderTopColor: T.yellow }]}>
                            <Text style={s.statValue}>{status?.productsWithImages ?? 0}</Text>
                            <Text style={s.statLabel}>Products With Images</Text>
                            <Text style={s.statSub}>{status?.productsMissingImages ?? 0} missing images</Text>
                        </View>
                        <View style={[s.statCard, { borderTopColor: T.blue }]}>
                            <Text style={s.statValue}>{featureSize}</Text>
                            <Text style={s.statLabel}>Feature Vector Size</Text>
                            <Text style={s.statSub}>{health?.model || status?.aiService?.model || 'MobileNetV2'}</Text>
                        </View>
                    </View>

                    {!serviceHealthy && (
                        <View style={s.warningCard}>
                            <Feather name="alert-triangle" size={18} color={T.red} />
                            <Text style={s.warningText}>{health?.message || status?.aiService?.error || 'AI service is not reachable.'}</Text>
                        </View>
                    )}

                    <View style={s.actionRow}>
                        <TouchableOpacity style={s.primaryBtn} onPress={handleIndexAll} disabled={indexingAll || !serviceHealthy}>
                            {indexingAll ? <ActivityIndicator color={T.white} size="small" /> : <Feather name="cpu" size={16} color={T.white} />}
                            <Text style={s.primaryBtnText}>{indexingAll ? 'Indexing...' : 'Run Bulk Indexing'}</Text>
                        </TouchableOpacity>
                    </View>

                    {lastRun ? (
                        <View style={s.panel}>
                            <Text style={s.panelTitle}>Last Bulk Run</Text>
                            <Text style={s.panelText}>Indexed: {lastRun.indexed} · Failed: {lastRun.failed} · Skipped: {lastRun.skipped}</Text>
                            {(lastRun.errors ?? []).map((entry: any, index: number) => (
                                <Text key={`${entry.productId}-${index}`} style={s.errorText}>{entry.name}: {entry.error}</Text>
                            ))}
                        </View>
                    ) : null}

                    <View style={s.panel}>
                        <Text style={s.panelTitle}>Products Ready for AI</Text>
                        <Text style={s.panelSub}>Products need a valid thumbnail or image path before they can be indexed.</Text>
                        {products.length === 0 ? <Text style={s.panelText}>No products found.</Text> : products.map((product) => {
                            const imageSource = product.thumbnailImage || product.images?.[0] || '';
                            const hasImage = Boolean(imageSource);
                            const indexed = Boolean(product.featuresIndexed);
                            return (
                                <View key={product._id} style={s.productRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.productName}>{product.name}</Text>
                                        <Text style={s.productMeta}>SKU: {product.sku || '—'}</Text>
                                        <Text style={s.productMeta} numberOfLines={2}>{hasImage ? imageSource : 'No image configured'}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                                        <View style={[s.badge, { backgroundColor: indexed ? T.green + '22' : T.yellow + '22' }]}>
                                            <Text style={[s.badgeText, { color: indexed ? T.green : T.yellow }]}>{indexed ? 'Indexed' : 'Pending'}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[s.smallBtn, (!hasImage || indexingId === product._id || !serviceHealthy) && s.smallBtnDisabled]}
                                            onPress={() => handleIndexOne(product._id)}
                                            disabled={!hasImage || indexingId === product._id || !serviceHealthy}
                                        >
                                            {indexingId === product._id ? <ActivityIndicator size="small" color={T.white} /> : <Text style={s.smallBtnText}>Index</Text>}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {(status?.samplePending ?? []).length > 0 ? (
                        <View style={s.panel}>
                            <Text style={s.panelTitle}>Pending Sample</Text>
                            {(status.samplePending ?? []).map((product: any) => (
                                <Text key={product._id} style={s.panelText}>{product.name} · {product.sku || '—'}</Text>
                            ))}
                        </View>
                    ) : null}
                </>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 160, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, padding: 16 },
    statValue: { color: T.text, fontSize: 22, fontWeight: '700' },
    statLabel: { color: T.muted, fontSize: 12, marginTop: 4 },
    statSub: { color: T.muted, fontSize: 11, marginTop: 6 },
    warningCard: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#3A1715', borderColor: '#6B1D1B', borderWidth: 1, borderRadius: 12, padding: 14 },
    warningText: { color: '#FECACA', flex: 1 },
    actionRow: { flexDirection: 'row', gap: 12 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.active, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, alignSelf: 'flex-start' },
    primaryBtnText: { color: T.white, fontWeight: '700' },
    secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card },
    secondaryBtnText: { color: T.active, fontWeight: '700' },
    panel: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700' },
    panelSub: { color: T.muted, marginTop: 4, marginBottom: 10 },
    panelText: { color: T.muted, marginTop: 8 },
    errorText: { color: '#FCA5A5', marginTop: 8 },
    productRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    productName: { color: T.text, fontWeight: '700' },
    productMeta: { color: T.muted, fontSize: 12, marginTop: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    smallBtn: { backgroundColor: T.active, borderRadius: 10, minWidth: 72, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
    smallBtnDisabled: { opacity: 0.45 },
    smallBtnText: { color: T.white, fontWeight: '700' },
});