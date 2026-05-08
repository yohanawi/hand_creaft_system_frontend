import { sellerTheme as T } from '@/constants/sellerTheme';
import { getSellerOrderById, getSellerOrders, updateSellerOrderStatus } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

const FILTERS = ['all', ...Object.keys(STATUS_CONFIG)];
const EDITABLE_STATUSES = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
const PAYOUT_FILTERS = ['all', 'available', 'requested', 'paid', 'reversed', 'unpaid'];

export default function SellerOrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [payoutFilter, setPayoutFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('confirmed');
    const [statusMsg, setStatusMsg] = useState('');
    const [location, setLocation] = useState('');
    const [trackingNum, setTrackingNum] = useState('');
    const [courier, setCourier] = useState('');
    const [estDelivery, setEstDelivery] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    const fetchOrders = useCallback(async (
        nextPage = 1,
        nextStatus = filter,
        nextSearch = search,
        append = false,
        nextPayoutStatus = payoutFilter,
        nextStartDate = startDate,
        nextEndDate = endDate,
    ) => {
        try {
            const params: any = { page: nextPage, limit: 15 };
            if (nextStatus !== 'all') params.status = nextStatus;
            if (nextSearch.trim()) params.search = nextSearch.trim();
            if (nextPayoutStatus !== 'all') params.payoutStatus = nextPayoutStatus;
            if (nextStartDate.trim()) params.startDate = nextStartDate.trim();
            if (nextEndDate.trim()) params.endDate = nextEndDate.trim();
            const { data } = await getSellerOrders(params);
            const fetched = data.orders ?? [];
            setOrders((previous) => (append ? [...previous, ...fetched] : fetched));
            setHasMore(nextPage < (data.totalPages ?? 1));
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Could not load seller orders.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [endDate, filter, payoutFilter, search, startDate]);

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchOrders(1, filter, search, false, payoutFilter, startDate, endDate);
    }, [endDate, fetchOrders, filter, payoutFilter, search, startDate]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchOrders(1, filter, search, false, payoutFilter, startDate, endDate);
    };

    const loadMore = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage, filter, search, true, payoutFilter, startDate, endDate);
    };

    const openDetail = async (id: string) => {
        setDetailLoading(true);
        setModalVisible(true);
        setSelected(null);
        setStatusMsg('');
        setLocation('');
        setTrackingNum('');
        setCourier('');
        setEstDelivery('');
        setShowStatusPicker(false);
        try {
            const { data } = await getSellerOrderById(id);
            setSelected(data.order);
            setNewStatus(data.order.sellerStatus || 'confirmed');
            setTrackingNum(data.order.sellerTrackingNumber || '');
            setCourier(data.order.sellerCourier || '');
            setEstDelivery(data.order.sellerEstimatedDelivery ? new Date(data.order.sellerEstimatedDelivery).toISOString().slice(0, 10) : '');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Could not load order details.');
            setModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        if (newStatus === 'shipped' && (!trackingNum.trim() || !courier.trim())) {
            return Alert.alert('Validation', 'Tracking number and courier are required when marking an order as shipped.');
        }
        setUpdating(true);
        try {
            await updateSellerOrderStatus(selected._id, {
                status: newStatus,
                message: statusMsg.trim() || undefined,
                location: location.trim() || undefined,
                trackingNumber: trackingNum.trim() || undefined,
                courier: courier.trim() || undefined,
                estimatedDelivery: estDelivery.trim() || undefined,
            });
            Alert.alert('Success', 'Seller order status updated successfully.');
            setModalVisible(false);
            setPage(1);
            fetchOrders(1, filter, search, false, payoutFilter, startDate, endDate);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Order update failed.');
        } finally {
            setUpdating(false);
        }
    };

    const contactCustomer = async () => {
        if (!selected?.shippingAddress?.email) return;
        const subject = encodeURIComponent(`Regarding your order ${selected.orderNumber}`);
        const url = `mailto:${selected.shippingAddress.email}?subject=${subject}`;
        await Linking.openURL(url);
    };

    const copyShippingAddress = async () => {
        const address = selected?.shippingAddress;
        if (!address) return;
        const payload = [
            address.fullName,
            address.address,
            `${address.city}, ${address.state} ${address.zipCode}`.trim(),
            address.country,
            address.phone,
        ].filter(Boolean).join('\n');
        await Clipboard.setStringAsync(payload);
        Alert.alert('Copied', 'Shipping address copied to clipboard.');
    };

    const renderRow = ({ item }: { item: any }) => {
        const cfg = STATUS_CONFIG[item.sellerStatus] ?? STATUS_CONFIG.pending;
        return (
            <TouchableOpacity style={s.row} onPress={() => openDetail(item._id)} activeOpacity={0.85}>
                <View style={s.rowLeft}>
                    <Text style={s.rowOrderNum}>{item.orderNumber}</Text>
                    <Text style={s.rowUser} numberOfLines={1}>{item.user?.name ?? 'Customer'} · {item.user?.email ?? ''}</Text>
                    <Text style={s.rowDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={s.rowRight}>
                    <Text style={[s.rowTotal, { color: T.active }]}>${Number(item.summary?.netAmount || 0).toFixed(2)}</Text>
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
            <View style={s.searchWrap}>
                <View style={s.searchBox}>
                    <Feather name="search" size={16} color={T.muted} />
                    <TextInput style={s.searchInput} value={searchInput} onChangeText={setSearchInput} onSubmitEditing={() => setSearch(searchInput)} placeholder="Search by order number or customer" placeholderTextColor={T.muted} returnKeyType="search" />
                    {searchInput.length > 0 ? <TouchableOpacity onPress={() => { setSearchInput(''); setSearch(''); }}><Feather name="x" size={15} color={T.muted} /></TouchableOpacity> : null}
                </View>
            </View>

            <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterWrap}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[s.filterTab, filter === item && s.filterTabActive]} onPress={() => setFilter(item)}>
                        <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item === 'all' ? 'All' : STATUS_CONFIG[item].label}</Text>
                    </TouchableOpacity>
                )}
            />

            <FlatList
                horizontal
                data={PAYOUT_FILTERS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterWrap}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[s.filterTab, payoutFilter === item && s.filterTabActive]} onPress={() => setPayoutFilter(item)}>
                        <Text style={[s.filterText, payoutFilter === item && s.filterTextActive]}>{item === 'all' ? 'All payouts' : item}</Text>
                    </TouchableOpacity>
                )}
            />

            <View style={s.dateFilterRow}>
                <TextInput style={s.dateField} value={startDate} onChangeText={setStartDate} placeholder="Start date YYYY-MM-DD" placeholderTextColor={T.muted} />
                <TextInput style={s.dateField} value={endDate} onChangeText={setEndDate} placeholder="End date YYYY-MM-DD" placeholderTextColor={T.muted} />
            </View>

            {loading ? (
                <View style={s.centered}><ActivityIndicator color={T.active} size="large" /></View>
            ) : orders.length === 0 ? (
                <View style={s.centered}>
                    <Feather name="inbox" size={56} color={T.muted} />
                    <Text style={s.emptyText}>No orders found</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRow}
                    contentContainerStyle={s.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.active} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={hasMore ? <ActivityIndicator color={T.active} style={{ marginVertical: 16 }} /> : null}
                    ItemSeparatorComponent={() => <View style={s.separator} />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalSheet}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{selected ? selected.orderNumber : 'Loading…'}</Text>
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
                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Customer</Text>
                                    <Text style={s.sectionVal}>{selected.user?.name}</Text>
                                    <Text style={s.sectionMuted}>{selected.user?.email}</Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.phone}</Text>
                                    <Text style={s.sectionMuted}>Payment: {String(selected.paymentStatus || '').replace(/_/g, ' ')}</Text>
                                    <Text style={s.sectionMuted}>Payout: {String(selected.payoutStatus || 'unpaid').replace(/_/g, ' ')}</Text>
                                    <View style={s.inlineActions}>
                                        <TouchableOpacity style={s.inlineActionBtn} onPress={contactCustomer}>
                                            <Feather name="mail" size={14} color={T.active} />
                                            <Text style={s.inlineActionText}>Contact Customer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Ship To</Text>
                                    <Text style={s.sectionVal}>{selected.shippingAddress?.fullName}</Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.address}</Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.zipCode}</Text>
                                    <Text style={s.sectionMuted}>{selected.shippingAddress?.phone}</Text>
                                    <View style={s.inlineActions}>
                                        <TouchableOpacity style={s.inlineActionBtn} onPress={copyShippingAddress}>
                                            <Feather name="copy" size={14} color={T.active} />
                                            <Text style={s.inlineActionText}>Copy Address</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {selected.customerNote ? (
                                    <View style={s.section}>
                                        <Text style={s.sectionTitle}>Customer Note</Text>
                                        <Text style={s.sectionMuted}>{selected.customerNote}</Text>
                                    </View>
                                ) : null}

                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Your Items ({selected.items.length})</Text>
                                    {selected.items.map((item: any) => (
                                        <View key={`${item._id || item.product?._id}-${item.sku}`} style={s.itemRow}>
                                            <View style={{ flex: 1.8, paddingRight: 8 }}>
                                                <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                                                {item.selectedVariant?.label ? <Text style={s.sectionMuted}>{item.selectedVariant.label}</Text> : null}
                                            </View>
                                            <Text style={s.itemQty}>×{item.quantity}</Text>
                                            <Text style={s.itemPrice}>${Number(item.sellerFulfillment?.sellerNetAmount || 0).toFixed(2)}</Text>
                                        </View>
                                    ))}
                                    <View style={s.itemRow}>
                                        <Text style={[s.itemName, { flex: 2, color: T.text, fontWeight: '700' }]}>Your net total</Text>
                                        <Text style={[s.itemPrice, { color: T.active, fontWeight: '800', fontSize: 16 }]}>${Number(selected.summary?.netAmount || 0).toFixed(2)}</Text>
                                    </View>
                                </View>

                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Update Fulfillment</Text>
                                    <TouchableOpacity style={s.statusSelector} onPress={() => setShowStatusPicker((current) => !current)} activeOpacity={0.85}>
                                        {(() => {
                                            const cfg = STATUS_CONFIG[newStatus] ?? STATUS_CONFIG.pending;
                                            return (
                                                <>
                                                    <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
                                                    <Text style={[s.statusSelectorText, { color: cfg.color }]}>{cfg.label}</Text>
                                                    <Feather name={showStatusPicker ? 'chevron-up' : 'chevron-down'} size={16} color={T.muted} />
                                                </>
                                            );
                                        })()}
                                    </TouchableOpacity>

                                    {showStatusPicker ? (
                                        <View style={s.pickerDropdown}>
                                            {EDITABLE_STATUSES.map((status) => {
                                                const cfg = STATUS_CONFIG[status];
                                                return (
                                                    <TouchableOpacity key={status} style={[s.pickerOption, newStatus === status && s.pickerOptionActive]} onPress={() => { setNewStatus(status); setShowStatusPicker(false); }}>
                                                        <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
                                                        <Text style={[s.pickerOptionText, { color: cfg.color }]}>{cfg.label}</Text>
                                                        {newStatus === status ? <Feather name="check" size={14} color={cfg.color} /> : null}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ) : null}

                                    <TextInput style={s.textField} value={statusMsg} onChangeText={setStatusMsg} placeholder="Status message (optional)" placeholderTextColor={T.muted} />
                                    <TextInput style={s.textField} value={location} onChangeText={setLocation} placeholder="Location (optional)" placeholderTextColor={T.muted} />
                                    <TextInput style={s.textField} value={trackingNum} onChangeText={setTrackingNum} placeholder="Tracking number" placeholderTextColor={T.muted} />
                                    <TextInput style={s.textField} value={courier} onChangeText={setCourier} placeholder="Courier" placeholderTextColor={T.muted} />
                                    <TextInput style={s.textField} value={estDelivery} onChangeText={setEstDelivery} placeholder="Estimated delivery date (YYYY-MM-DD)" placeholderTextColor={T.muted} />
                                    <TouchableOpacity style={s.updateBtn} onPress={handleUpdate} disabled={updating}>
                                        {updating ? <ActivityIndicator color={T.white} /> : <Text style={s.updateBtnText}>Save Update</Text>}
                                    </TouchableOpacity>
                                </View>

                                <View style={s.section}>
                                    <Text style={s.sectionTitle}>Timeline</Text>
                                    {(selected.trackingEvents || []).length === 0 ? (
                                        <Text style={s.sectionMuted}>No timeline updates yet.</Text>
                                    ) : (selected.trackingEvents || []).map((event: any, index: number) => (
                                        <View key={`${event.timestamp}-${index}`} style={s.timelineRow}>
                                            <View style={s.timelineDot} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.rowMain}>{String(event.status || '').replace(/_/g, ' ')}</Text>
                                                <Text style={s.sectionMuted}>{event.message}</Text>
                                                <Text style={s.sectionMuted}>{new Date(event.timestamp).toLocaleString()} · {event.performedByName || 'System'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
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
    searchWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 12 },
    searchInput: { flex: 1, color: T.text },
    filterWrap: { paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
    filterTab: { backgroundColor: T.card, borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 8 },
    filterTabActive: { backgroundColor: T.activeBg, borderColor: T.active },
    filterText: { color: T.muted, fontWeight: '600' },
    filterTextActive: { color: T.active },
    dateFilterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
    dateField: { flex: 1, color: T.text, backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 12 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { color: T.muted, fontSize: 14, fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    separator: { height: 12 },
    row: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowLeft: { flex: 1 },
    rowRight: { alignItems: 'flex-end', gap: 6 },
    rowOrderNum: { color: T.text, fontSize: 15, fontWeight: '700' },
    rowUser: { color: T.muted, fontSize: 12, marginTop: 4 },
    rowDate: { color: T.muted, fontSize: 12, marginTop: 3 },
    rowTotal: { fontSize: 16, fontWeight: '800' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    paymentBadge: { color: T.muted, fontSize: 11, textTransform: 'capitalize' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.65)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingBottom: 22 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    closeBtn: { padding: 4 },
    modalScroll: { paddingHorizontal: 20, paddingBottom: 12 },
    section: { paddingTop: 18, gap: 6 },
    sectionTitle: { color: T.text, fontSize: 15, fontWeight: '700' },
    sectionVal: { color: T.text, fontSize: 14, fontWeight: '600' },
    sectionMuted: { color: T.muted, fontSize: 12, lineHeight: 18 },
    inlineActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
    inlineActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 999, backgroundColor: T.surface, paddingHorizontal: 10, paddingVertical: 8 },
    inlineActionText: { color: T.active, fontSize: 12, fontWeight: '700' },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    itemName: { color: T.text, fontSize: 13, fontWeight: '600' },
    itemQty: { color: T.muted, width: 36, textAlign: 'center' },
    itemPrice: { color: T.text, fontSize: 13, fontWeight: '700' },
    timelineRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.active, marginTop: 6 },
    statusSelector: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: T.surface },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusSelectorText: { flex: 1, fontSize: 14, fontWeight: '700' },
    pickerDropdown: { marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, overflow: 'hidden', backgroundColor: T.surface },
    pickerOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    pickerOptionActive: { backgroundColor: T.activeBg },
    pickerOptionText: { flex: 1, fontSize: 13, fontWeight: '700' },
    textField: { marginTop: 10, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 12, backgroundColor: T.surface, color: T.text, paddingHorizontal: 14, paddingVertical: 12 },
    updateBtn: { marginTop: 14, backgroundColor: T.active, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    updateBtnText: { color: T.white, fontSize: 14, fontWeight: '700' },
});