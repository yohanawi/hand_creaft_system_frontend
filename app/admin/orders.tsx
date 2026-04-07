import { adminGetOrderById, adminGetOrders, adminUpdateOrderStatus } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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

const T = {
    bg: '#1A1209',
    card: '#2C1810',
    card2: '#241610',
    input: '#1E150C',
    border: '#3D2415',
    active: '#C1622F',
    activeBg: 'rgba(193,98,47,0.15)',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    green: '#4CAF50',
    yellow: '#F5A623',
    red: '#E53E3E',
    blue: '#4299E1',
    white: '#FFFFFF',
};

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    awaiting_payment: { color: T.blue, icon: 'credit-card', label: 'Awaiting Payment' },
    payment_failed: { color: T.red, icon: 'alert-circle', label: 'Payment Failed' },
    pending: { color: T.yellow, icon: 'clock', label: 'Pending' },
    confirmed: { color: T.blue, icon: 'check', label: 'Confirmed' },
    processing: { color: T.blue, icon: 'settings', label: 'Processing' },
    shipped: { color: T.active, icon: 'truck', label: 'Shipped' },
    out_for_delivery: { color: T.active, icon: 'navigation', label: 'Out for Delivery' },
    delivered: { color: T.green, icon: 'check-circle', label: 'Delivered' },
    cancelled: { color: T.red, icon: 'x-circle', label: 'Cancelled' },
    returned: { color: T.muted, icon: 'rotate-ccw', label: 'Returned' },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);
const FILTERS = ['all', ...ALL_STATUSES];
const EDITABLE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUSES = ['awaiting_payment', 'cod_due', 'paid', 'failed', 'cancelled', 'refunded'];

export default function AdminOrdersScreen() {
    // ── List State ─────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // ── Detail Modal State ─────────────────────────────────────────────────────
    const [selected, setSelected] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── Update State ───────────────────────────────────────────────────────────
    const [newStatus, setNewStatus] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [location, setLocation] = useState('');
    const [trackingNum, setTrackingNum] = useState('');
    const [courier, setCourier] = useState('');
    const [estDelivery, setEstDelivery] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [paymentState, setPaymentState] = useState('');
    const [showPaymentPicker, setShowPaymentPicker] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(
        async (p = 1, status = filter, q = search, append = false) => {
            try {
                const params: any = { page: p, limit: 15 };
                if (status !== 'all') params.status = status;
                if (q.trim()) params.search = q.trim();
                const { data } = await adminGetOrders(params);
                const fetched = data.orders ?? [];
                setOrders(prev => (append ? [...prev, ...fetched] : fetched));
                setHasMore(p < (data.totalPages ?? 1));
            } catch {
                Alert.alert('Error', 'Could not load orders.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [filter, search],
    );

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchOrders(1, filter, search);
    }, [fetchOrders, filter, search]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchOrders(1, filter, search, false);
    };

    const loadMore = () => {
        if (!hasMore || loading) return;
        const np = page + 1;
        setPage(np);
        fetchOrders(np, filter, search, true);
    };

    // ── Open detail ────────────────────────────────────────────────────────────
    const openDetail = async (id: string) => {
        setDetailLoading(true);
        setModalVisible(true);
        setSelected(null);
        setNewStatus('');
        setStatusMsg('');
        setLocation('');
        setTrackingNum('');
        setCourier('');
        setEstDelivery('');
        setShowStatusPicker(false);
        setShowPaymentPicker(false);
        try {
            const { data } = await adminGetOrderById(id);
            setSelected(data.order);
            setNewStatus(data.order.status);
            setPaymentState(data.order.paymentStatus);
            setTrackingNum(data.order.trackingNumber ?? '');
            setCourier(data.order.courier ?? '');
        } catch {
            Alert.alert('Error', 'Could not load order details.');
            setModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    // ── Update status ──────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!selected) return;
        setUpdating(true);
        try {
            const payload: any = { status: newStatus };
            if (paymentState) payload.paymentStatus = paymentState;
            if (statusMsg.trim()) payload.message = statusMsg.trim();
            if (location.trim()) payload.location = location.trim();
            if (trackingNum.trim()) payload.trackingNumber = trackingNum.trim();
            if (courier.trim()) payload.courier = courier.trim();
            if (estDelivery.trim()) payload.estimatedDelivery = estDelivery.trim();
            await adminUpdateOrderStatus(selected._id, payload);
            Alert.alert('Success', 'Order updated successfully.');
            setModalVisible(false);
            setPage(1);
            fetchOrders(1, filter, search);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Update failed.');
        } finally {
            setUpdating(false);
        }
    };

    // ── Row ────────────────────────────────────────────────────────────────────
    const renderRow = ({ item }: { item: any }) => {
        const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
        return (
            <TouchableOpacity style={s.row} onPress={() => openDetail(item._id)} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                    <Text style={s.rowOrderNum}>{item.orderNumber}</Text>
                    <Text style={s.rowUser} numberOfLines={1}>
                        {item.user?.name ?? 'Unknown'} · {item.user?.email ?? ''}
                    </Text>
                    <Text style={s.rowDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric',
                        })}
                    </Text>
                </View>
                <View style={s.rowRight}>
                    <Text style={[s.rowTotal, { color: T.active }]}>${item.total?.toFixed(2)}</Text>
                    <View style={[s.badge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
                        <Feather name={cfg.icon as any} size={10} color={cfg.color} />
                        <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={s.paymentBadge}>{String(item.paymentStatus || '').replace(/_/g, ' ')}</Text>
                    <Feather name="chevron-right" size={16} color={T.muted} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={s.root}>
            {/* Search */}
            <View style={s.searchWrap}>
                <View style={s.searchBox}>
                    <Feather name="search" size={16} color={T.muted} />
                    <TextInput
                        style={s.searchInput}
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onSubmitEditing={() => setSearch(searchInput)}
                        placeholder="Search by order number…"
                        placeholderTextColor={T.muted}
                        returnKeyType="search"
                    />
                    {searchInput.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchInput(''); setSearch(''); }}>
                            <Feather name="x" size={15} color={T.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter tabs */}
            <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={f => f}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterWrap}
                renderItem={({ item: f }) => (
                    <TouchableOpacity
                        style={[s.filterTab, filter === f && s.filterTabActive]}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                            {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* List */}
            {loading ? (
                <View style={s.centered}>
                    <ActivityIndicator color={T.active} size="large" />
                </View>
            ) : orders.length === 0 ? (
                <View style={s.centered}>
                    <Feather name="inbox" size={56} color={T.muted} />
                    <Text style={s.emptyText}>No orders found</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={o => o._id}
                    renderItem={renderRow}
                    contentContainerStyle={s.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.active} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        hasMore ? <ActivityIndicator color={T.active} style={{ marginVertical: 16 }} /> : null
                    }
                    ItemSeparatorComponent={() => <View style={s.separator} />}
                />
            )}

            {/* ── Detail / Update Modal ─────────────────────────────────────── */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalSheet}>
                        {/* Modal Header */}
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>
                                {selected ? selected.orderNumber : 'Loading…'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={s.closeBtn}>
                                <Feather name="x" size={22} color={T.text} />
                            </TouchableOpacity>
                        </View>

                        {detailLoading ? (
                            <View style={[s.centered, { marginVertical: 40 }]}>
                                <ActivityIndicator color={T.active} size="large" />
                            </View>
                        ) : selected ? (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalScroll}>
                                {/* Customer */}
                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Customer</Text>
                                    <Text style={s.sectionVal}>{selected.user?.name}</Text>
                                    <Text style={s.sectionMuted}>{selected.user?.email}</Text>
                                    <Text style={s.sectionMuted}>Payment: {String(selected.paymentStatus || '').replace(/_/g, ' ')}</Text>
                                    <Text style={s.sectionMuted}>Method: {String(selected.paymentMethod || '').replace(/_/g, ' ')}</Text>
                                    {selected.paymentReference ? <Text style={s.sectionMuted}>Reference: {selected.paymentReference}</Text> : null}
                                </View>

                                {/* Shipping */}
                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Ship To</Text>
                                    <Text style={s.sectionVal}>{selected.shippingAddress?.fullName}</Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.address}</Text>
                                    <Text style={s.sectionMuted}>
                                        {selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.zipCode}
                                    </Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.phone}</Text>
                                </View>

                                {/* Items */}
                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Items ({selected.items.length})</Text>
                                    {selected.items.map((it: any) => (
                                        <View key={it._id} style={s.itemRow}>
                                            <View style={{ flex: 1.8, paddingRight: 8 }}>
                                                <Text style={s.itemName} numberOfLines={1}>{it.name}</Text>
                                                {it.selectedVariant?.label ? <Text style={s.sectionMuted}>{it.selectedVariant.label}</Text> : null}
                                            </View>
                                            <Text style={s.itemQty}>×{it.quantity}</Text>
                                            <Text style={s.itemPrice}>
                                                ${((it.salePrice ?? it.price) * it.quantity).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                    <View style={s.itemRow}>
                                        <Text style={[s.itemName, { flex: 2, color: T.text, fontWeight: '700' }]}>Total</Text>
                                        <Text style={[s.itemPrice, { color: T.active, fontWeight: '800', fontSize: 16 }]}>
                                            ${selected.total?.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Update Status */}
                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Update Status</Text>

                                    {/* Status selector */}
                                    <TouchableOpacity
                                        style={s.statusSelector}
                                        onPress={() => setShowStatusPicker(v => !v)}
                                        activeOpacity={0.85}
                                    >
                                        {(() => {
                                            const sc = STATUS_CONFIG[newStatus] ?? STATUS_CONFIG.pending;
                                            return (
                                                <>
                                                    <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                                                    <Text style={[s.statusSelectorText, { color: sc.color }]}>
                                                        {sc.label}
                                                    </Text>
                                                    <Feather name={showStatusPicker ? 'chevron-up' : 'chevron-down'} size={16} color={T.muted} />
                                                </>
                                            );
                                        })()}
                                    </TouchableOpacity>

                                    {showStatusPicker && (
                                        <View style={s.pickerDropdown}>
                                            {EDITABLE_STATUSES.map(st => {
                                                const sc = STATUS_CONFIG[st];
                                                return (
                                                    <TouchableOpacity
                                                        key={st}
                                                        style={[s.pickerOption, newStatus === st && s.pickerOptionActive]}
                                                        onPress={() => { setNewStatus(st); setShowStatusPicker(false); }}
                                                        activeOpacity={0.8}
                                                    >
                                                        <View style={[s.statusDot, { backgroundColor: sc.color }]} />
                                                        <Text style={[s.pickerOptionText, { color: sc.color }]}>{sc.label}</Text>
                                                        {newStatus === st && <Feather name="check" size={14} color={sc.color} />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={s.statusSelector}
                                        onPress={() => setShowPaymentPicker(v => !v)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={[s.statusDot, { backgroundColor: T.active }]} />
                                        <Text style={s.statusSelectorText}>Payment: {paymentState.replace(/_/g, ' ')}</Text>
                                        <Feather name={showPaymentPicker ? 'chevron-up' : 'chevron-down'} size={16} color={T.muted} />
                                    </TouchableOpacity>

                                    {showPaymentPicker && (
                                        <View style={s.pickerDropdown}>
                                            {PAYMENT_STATUSES.map(st => (
                                                <TouchableOpacity
                                                    key={st}
                                                    style={[s.pickerOption, paymentState === st && s.pickerOptionActive]}
                                                    onPress={() => { setPaymentState(st); setShowPaymentPicker(false); }}
                                                    activeOpacity={0.8}
                                                >
                                                    <View style={[s.statusDot, { backgroundColor: st === 'paid' ? T.green : st === 'failed' || st === 'cancelled' ? T.red : st === 'cod_due' ? T.yellow : T.active }]} />
                                                    <Text style={s.pickerOptionText}>{st.replace(/_/g, ' ')}</Text>
                                                    {paymentState === st && <Feather name="check" size={14} color={T.active} />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    <TextInput
                                        style={s.textField}
                                        value={statusMsg}
                                        onChangeText={setStatusMsg}
                                        placeholder="Status message (optional)"
                                        placeholderTextColor={T.muted}
                                    />
                                    <TextInput
                                        style={s.textField}
                                        value={location}
                                        onChangeText={setLocation}
                                        placeholder="Location (e.g. Sorting Facility, Chicago)"
                                        placeholderTextColor={T.muted}
                                    />
                                    <TextInput
                                        style={s.textField}
                                        value={trackingNum}
                                        onChangeText={setTrackingNum}
                                        placeholder="Tracking Number"
                                        placeholderTextColor={T.muted}
                                    />
                                    <TextInput
                                        style={s.textField}
                                        value={courier}
                                        onChangeText={setCourier}
                                        placeholder="Courier (e.g. FedEx, DHL)"
                                        placeholderTextColor={T.muted}
                                    />
                                    <TextInput
                                        style={s.textField}
                                        value={estDelivery}
                                        onChangeText={setEstDelivery}
                                        placeholder="Est. Delivery (YYYY-MM-DD)"
                                        placeholderTextColor={T.muted}
                                    />

                                    <TouchableOpacity
                                        style={[s.updateBtn, updating && { opacity: 0.6 }]}
                                        onPress={handleUpdate}
                                        disabled={updating}
                                        activeOpacity={0.85}
                                    >
                                        {updating ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Feather name="check" size={16} color="#fff" />
                                                <Text style={s.updateBtnText}>Save Update</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Tracking Timeline */}
                                {selected.trackingEvents?.length > 0 && (
                                    <View style={s.section}>
                                        <Text style={s.sectionTitle}>Tracking History</Text>
                                        {[...selected.trackingEvents].reverse().map((ev: any, idx: number) => {
                                            const ec = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.pending;
                                            return (
                                                <View key={ev._id ?? idx} style={s.evRow}>
                                                    <View style={[s.evDot, { backgroundColor: idx === 0 ? ec.color : T.border }]} />
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <Text style={[s.evStatus, idx === 0 && { color: ec.color }]}>{ec.label}</Text>
                                                            <Text style={s.evTime}>
                                                                {new Date(ev.timestamp).toLocaleString('en-US', {
                                                                    day: 'numeric', month: 'short',
                                                                    hour: '2-digit', minute: '2-digit',
                                                                })}
                                                            </Text>
                                                        </View>
                                                        <Text style={s.evMsg}>{ev.message}</Text>
                                                        {ev.location && (
                                                            <Text style={s.evLoc}>📍 {ev.location}</Text>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 16, color: T.muted },
    searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: T.input, borderRadius: 12,
        borderWidth: 1, borderColor: T.border, paddingHorizontal: 14, paddingVertical: 10,
    },
    searchInput: { flex: 1, color: T.text, fontSize: 14 },
    filterWrap: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    filterTab: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18,
        backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
    },
    filterTabActive: { backgroundColor: T.activeBg, borderColor: T.active },
    filterText: { color: T.muted, fontSize: 12, fontWeight: '500' },
    filterTextActive: { color: T.active, fontWeight: '700' },
    list: { paddingHorizontal: 16, paddingVertical: 8 },
    row: {
        backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border,
        flexDirection: 'row', alignItems: 'center', padding: 14, marginVertical: 4,
    },
    rowLeft: { flex: 1 },
    rowOrderNum: { fontSize: 14, fontWeight: '700', color: T.text },
    rowUser: { fontSize: 12, color: T.muted, marginTop: 2 },
    rowDate: { fontSize: 11, color: T.muted, marginTop: 2 },
    rowRight: { alignItems: 'flex-end', gap: 6 },
    rowTotal: { fontSize: 15, fontWeight: '700' },
    paymentBadge: { color: T.muted, fontSize: 11, textTransform: 'capitalize' },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14, borderWidth: 1,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
    separator: { height: 2, backgroundColor: T.border },

    // modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: T.border,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', color: T.text },
    closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    modalScroll: { padding: 20, gap: 16, paddingBottom: 40 },

    section: {
        backgroundColor: T.card2, borderRadius: 14,
        borderWidth: 1, borderColor: T.border, padding: 14, gap: 6,
    },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    sectionVal: { fontSize: 14, fontWeight: '600', color: T.text },
    sectionMuted: { fontSize: 13, color: T.muted },

    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    itemName: { flex: 3, fontSize: 13, color: T.muted },
    itemQty: { flex: 1, fontSize: 13, color: T.muted, textAlign: 'center' },
    itemPrice: { flex: 1, fontSize: 13, color: T.text, textAlign: 'right', fontWeight: '600' },

    statusSelector: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: T.input, borderRadius: 10,
        borderWidth: 1, borderColor: T.border, padding: 12,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusSelectorText: { flex: 1, fontSize: 14, fontWeight: '600' },
    pickerDropdown: {
        backgroundColor: T.input, borderRadius: 10,
        borderWidth: 1, borderColor: T.border, overflow: 'hidden', marginTop: 4,
    },
    pickerOption: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 11,
        borderBottomWidth: 1, borderBottomColor: T.border,
    },
    pickerOptionActive: { backgroundColor: T.activeBg },
    pickerOptionText: { flex: 1, fontSize: 14, fontWeight: '500' },
    textField: {
        backgroundColor: T.input, borderRadius: 10,
        borderWidth: 1, borderColor: T.border,
        color: T.text, fontSize: 14, paddingHorizontal: 12, paddingVertical: 10,
    },
    updateBtn: {
        backgroundColor: T.active, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 13, marginTop: 4,
    },
    updateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    evRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    evDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    evStatus: { fontSize: 13, fontWeight: '700', color: T.text },
    evTime: { fontSize: 11, color: T.muted },
    evMsg: { fontSize: 12, color: T.muted, marginTop: 2 },
    evLoc: { fontSize: 11, color: T.muted, marginTop: 2 },
});
