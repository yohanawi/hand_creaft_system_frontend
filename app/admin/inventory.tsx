import { adminTheme as T } from '@/constants/adminTheme';
import {
    adjustAdminProductStock,
    getAdminInventoryOverview,
    getProducts,
    restockAdminProduct,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function StatCard({ label, value, color, icon }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.statIcon, { backgroundColor: color + '22' }]}>
                <Feather name={icon} size={18} color={color} />
            </View>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
}

export default function AdminInventoryScreen() {
    const [overview, setOverview] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'restock' | 'adjust' | null>(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        try {
            const [overviewRes, productsRes] = await Promise.all([
                getAdminInventoryOverview(),
                getProducts(),
            ]);
            setOverview(overviewRes.data);
            setProducts(productsRes.data?.products ?? productsRes.data ?? []);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load inventory data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const filteredProducts = useMemo(() => products.filter((product) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return String(product.name || '').toLowerCase().includes(query)
            || String(product.sku || '').toLowerCase().includes(query);
    }), [products, search]);

    const openModal = (product: any, mode: 'restock' | 'adjust') => {
        setSelected(product);
        setModalMode(mode);
        setQuantity('');
        setReason(mode === 'adjust' ? 'Manual stock correction' : '');
        setNote('');
    };

    const closeModal = () => {
        setSelected(null);
        setModalMode(null);
        setQuantity('');
        setReason('');
        setNote('');
    };

    const submit = async () => {
        if (!selected || !modalMode) return;
        const parsed = Number(quantity);

        if (!Number.isFinite(parsed) || parsed === 0) {
            Alert.alert('Validation', modalMode === 'restock' ? 'Enter a positive restock quantity.' : 'Enter a non-zero stock adjustment.');
            return;
        }

        if (modalMode === 'restock' && parsed <= 0) {
            Alert.alert('Validation', 'Restock quantity must be greater than zero.');
            return;
        }

        setSubmitting(true);
        try {
            if (modalMode === 'restock') {
                await restockAdminProduct(selected._id, { quantity: parsed, note: note.trim() || undefined });
            } else {
                await adjustAdminProductStock(selected._id, {
                    quantityDelta: parsed,
                    reason: reason.trim() || 'Manual stock adjustment',
                    note: note.trim() || undefined,
                });
            }
            closeModal();
            setRefreshing(true);
            await load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Inventory update failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading inventory…</Text>
            </View>
        );
    }

    const stats = overview?.stats ?? {};
    const lowStockAlerts = overview?.lowStockAlerts ?? [];
    const recentMovements = overview?.recentMovements ?? [];

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Inventory Operations</Text>
                    <Text style={s.subtitle}>Restock, adjust, and monitor stock movements</Text>
                </View>
            </View>

            <View style={s.statsGrid}>
                <StatCard label="Products" value={stats.totalProducts ?? 0} color={T.blue} icon="package" />
                <StatCard label="Units In Stock" value={stats.totalUnits ?? 0} color={T.green} icon="archive" />
                <StatCard label="Low Stock Alerts" value={stats.lowStockCount ?? 0} color={T.yellow} icon="alert-triangle" />
                <StatCard label="Out of Stock" value={stats.outOfStockCount ?? 0} color={T.red} icon="alert-circle" />
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Search Products</Text>
                <View style={s.searchWrap}>
                    <Feather name="search" size={16} color={T.muted} />
                    <TextInput
                        style={s.searchInput}
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Find a product by name or SKU"
                        placeholderTextColor={T.muted}
                    />
                </View>
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={s.separator} />}
                    renderItem={({ item }) => (
                        <View style={s.productRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.productName}>{item.name}</Text>
                                <Text style={s.productMeta}>SKU: {item.sku} · Qty: {item.quantity} · Threshold: {item.lowStockThreshold ?? 5}</Text>
                            </View>
                            <View style={s.rowActions}>
                                <TouchableOpacity style={s.actionBtn} onPress={() => openModal(item, 'restock')}>
                                    <Feather name="plus-circle" size={15} color={T.green} />
                                    <Text style={s.actionText}>Restock</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.actionBtn} onPress={() => openModal(item, 'adjust')}>
                                    <Feather name="sliders" size={15} color={T.active} />
                                    <Text style={s.actionText}>Adjust</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <View style={s.twoCol}>
                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Low-Stock Alerts</Text>
                    {lowStockAlerts.length === 0 ? <Text style={s.empty}>No low-stock alerts.</Text> : lowStockAlerts.map((item: any) => (
                        <View key={item._id} style={s.alertRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.productName}>{item.name}</Text>
                                <Text style={s.productMeta}>SKU: {item.sku} · Qty: {item.quantity} / Threshold: {item.lowStockThreshold}</Text>
                            </View>
                            <View style={[s.severityBadge, item.severity === 'critical' ? s.severityCritical : item.severity === 'high' ? s.severityHigh : s.severityMedium]}>
                                <Text style={s.severityText}>{item.severity}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[s.panel, s.col]}>
                    <Text style={s.panelTitle}>Recent Stock Movements</Text>
                    {recentMovements.length === 0 ? <Text style={s.empty}>No stock movements yet.</Text> : recentMovements.map((movement: any) => (
                        <View key={movement._id} style={s.movementRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.productName}>{movement.productName || movement.product?.name}</Text>
                                <Text style={s.productMeta}>{movement.reason}</Text>
                                <Text style={s.productMeta}>{new Date(movement.createdAt).toLocaleString()}</Text>
                            </View>
                            <Text style={[s.changeText, { color: movement.quantityChange > 0 ? T.green : T.red }]}>
                                {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <Modal visible={!!modalMode} transparent animationType="fade" onRequestClose={closeModal}>
                <View style={s.overlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{modalMode === 'restock' ? 'Restock Product' : 'Adjust Stock'}</Text>
                            <TouchableOpacity onPress={closeModal}><Feather name="x" size={20} color={T.muted} /></TouchableOpacity>
                        </View>
                        <Text style={s.modalLabel}>{selected?.name}</Text>
                        <TextInput
                            style={s.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder={modalMode === 'restock' ? 'Quantity to add' : 'Adjustment, eg: -2 or 5'}
                            placeholderTextColor={T.muted}
                            keyboardType="numeric"
                        />
                        {modalMode === 'adjust' ? (
                            <TextInput
                                style={s.input}
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Reason for adjustment"
                                placeholderTextColor={T.muted}
                            />
                        ) : null}
                        <TextInput
                            style={[s.input, { height: 90, textAlignVertical: 'top' }]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Internal note"
                            placeholderTextColor={T.muted}
                            multiline
                        />
                        <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={submitting}>
                            {submitting ? <ActivityIndicator color={T.white} /> : <Text style={s.submitText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
    muted: { color: T.muted },
    header: { marginBottom: 8 },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 150, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, borderRadius: 14, padding: 16 },
    statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, marginTop: 4, fontSize: 12 },
    panel: { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 16, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
    searchInput: { flex: 1, color: T.text },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    productName: { color: T.text, fontWeight: '700', fontSize: 14 },
    productMeta: { color: T.muted, fontSize: 12, marginTop: 3 },
    rowActions: { flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
    actionText: { color: T.text, fontSize: 12, fontWeight: '600' },
    separator: { height: 1, backgroundColor: T.cardBorder },
    twoCol: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' },
    col: { flex: 1, minWidth: 320 },
    alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    severityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    severityCritical: { backgroundColor: T.red + '22' },
    severityHigh: { backgroundColor: T.yellow + '22' },
    severityMedium: { backgroundColor: T.blue + '22' },
    severityText: { color: T.text, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    movementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    changeText: { fontWeight: '700', fontSize: 16 },
    empty: { color: T.muted, fontSize: 13, paddingVertical: 12 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalCard: { width: '100%', maxWidth: 460, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 18, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalLabel: { color: T.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
    input: { backgroundColor: T.input, borderWidth: 1, borderColor: T.cardBorder, color: T.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
    submitBtn: { backgroundColor: T.active, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    submitText: { color: T.white, fontWeight: '700' },
});