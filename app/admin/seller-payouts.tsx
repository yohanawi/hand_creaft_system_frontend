import { adminTheme as T } from '@/constants/adminTheme';
import { getAdminSellerPayouts, updateAdminSellerPayout } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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

const FILTERS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Rejected', value: 'rejected' },
];

const formatCurrency = (value: any) => `$${Number(value || 0).toFixed(2)}`;

export default function AdminSellerPayoutsScreen() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [overview, setOverview] = useState<any>({});
    const [selected, setSelected] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionStatus, setActionStatus] = useState<'paid' | 'rejected'>('paid');
    const [note, setNote] = useState('');
    const [bankReference, setBankReference] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(search.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const loadData = useCallback(async () => {
        try {
            const { data } = await getAdminSellerPayouts({
                page,
                limit: 10,
                status: statusFilter || undefined,
                search: debouncedSearch || undefined,
            });
            setPayouts(data?.payouts ?? []);
            setPages(data?.pages ?? 1);
            setOverview(data?.overview ?? {});
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load seller payouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        loadData();
    }, [loadData]));

    const openProcessModal = (payout: any) => {
        setSelected(payout);
        setActionStatus('paid');
        setNote(payout.note ?? '');
        setBankReference(payout.bankReference ?? '');
        setModalVisible(true);
    };

    const submitUpdate = async () => {
        if (!selected?._id) {
            return;
        }

        if (actionStatus === 'rejected' && !note.trim()) {
            Alert.alert('Validation', 'Please provide a rejection reason.');
            return;
        }

        setSubmitting(true);
        try {
            await updateAdminSellerPayout(selected._id, {
                status: actionStatus,
                note: note.trim() || undefined,
                bankReference: bankReference.trim() || undefined,
            });
            Alert.alert('Success', `Payout request marked as ${actionStatus}.`);
            setModalVisible(false);
            setSelected(null);
            await loadData();
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to update payout request');
        } finally {
            setSubmitting(false);
        }
    };

    const statCards = [
        { label: 'Pending', count: overview.pending?.count ?? 0, amount: overview.pending?.amount ?? 0, color: T.active },
        { label: 'Paid', count: overview.paid?.count ?? 0, amount: overview.paid?.amount ?? 0, color: T.green },
        { label: 'Rejected', count: overview.rejected?.count ?? 0, amount: overview.rejected?.amount ?? 0, color: T.red },
    ];

    return (
        <View style={s.root}>
            <FlatList
                data={payouts}
                keyExtractor={(item) => item._id}
                contentContainerStyle={s.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={T.active} />}
                ListHeaderComponent={(
                    <View>
                        <View style={s.pageHeader}>
                            <Text style={s.pageTitle}>Seller Payouts</Text>
                            <Text style={s.pageSub}>Process withdrawal requests with seller bank details and allocation visibility.</Text>
                        </View>

                        <View style={s.statsGrid}>
                            {statCards.map((card) => (
                                <View key={card.label} style={[s.statCard, { borderTopColor: card.color }]}>
                                    <Text style={s.statValue}>{card.count}</Text>
                                    <Text style={s.statLabel}>{card.label}</Text>
                                    <Text style={s.statSub}>{formatCurrency(card.amount)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={s.filterPanel}>
                            <View style={s.searchWrap}>
                                <Feather name="search" size={16} color={T.muted} />
                                <TextInput
                                    style={s.searchInput}
                                    placeholder="Search by seller, shop, or email"
                                    placeholderTextColor={T.muted}
                                    value={search}
                                    onChangeText={setSearch}
                                />
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
                                {FILTERS.map((filter) => (
                                    <TouchableOpacity
                                        key={filter.value || 'all'}
                                        style={[s.filterChip, statusFilter === filter.value && s.filterChipActive]}
                                        onPress={() => {
                                            setPage(1);
                                            setStatusFilter(filter.value);
                                        }}
                                    >
                                        <Text style={[s.filterChipText, statusFilter === filter.value && s.filterChipTextActive]}>{filter.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => {
                    const badgeColor = item.status === 'paid' ? T.green : item.status === 'rejected' ? T.red : T.active;
                    return (
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.cardTitle}>{formatCurrency(item.amount)}</Text>
                                    <Text style={s.cardSub}>{item.seller?.sellerProfile?.shopName || item.seller?.name}</Text>
                                    <Text style={s.cardSub}>{item.seller?.email}</Text>
                                </View>
                                <View style={[s.badge, { backgroundColor: `${badgeColor}22` }]}>
                                    <Text style={[s.badgeText, { color: badgeColor }]}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={s.metaRow}>
                                <Text style={s.metaText}>Requested {new Date(item.requestedAt || item.createdAt).toLocaleDateString()}</Text>
                                <Text style={s.metaText}>Available balance {formatCurrency(item.sellerAvailableBalance)}</Text>
                            </View>
                            <View style={s.metaRow}>
                                <Text style={s.metaText}>Payout email {item.seller?.sellerProfile?.payoutEmail || 'Not set'}</Text>
                                <Text style={s.metaText}>Bank {item.seller?.sellerProfile?.bankName || 'Not set'}</Text>
                            </View>
                            {item.note ? <Text style={s.noteText}>{item.note}</Text> : null}

                            {item.status === 'pending' ? (
                                <View style={s.cardActions}>
                                    <TouchableOpacity style={s.processBtn} onPress={() => openProcessModal(item)}>
                                        <Feather name="check-circle" size={15} color={T.white} />
                                        <Text style={s.processBtnText}>Process Request</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    );
                }}
                ListEmptyComponent={loading ? (
                    <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
                ) : (
                    <Text style={s.empty}>No payout requests matched the current filters.</Text>
                )}
                ListFooterComponent={pages > 1 ? (
                    <View style={s.paginationRow}>
                        <TouchableOpacity style={[s.pageBtn, page === 1 && s.pageBtnDisabled]} disabled={page === 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>
                            <Text style={s.pageBtnText}>Previous</Text>
                        </TouchableOpacity>
                        <Text style={s.pageText}>Page {page} of {pages}</Text>
                        <TouchableOpacity style={[s.pageBtn, page === pages && s.pageBtnDisabled]} disabled={page === pages} onPress={() => setPage((current) => Math.min(pages, current + 1))}>
                            <Text style={s.pageBtnText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            />

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={s.overlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <View>
                                <Text style={s.modalTitle}>Process Payout</Text>
                                <Text style={s.modalSub}>{selected?.seller?.sellerProfile?.shopName || selected?.seller?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={20} color={T.muted} />
                            </TouchableOpacity>
                        </View>

                        <View style={s.selectionRow}>
                            {['paid', 'rejected'].map((value) => (
                                <TouchableOpacity
                                    key={value}
                                    style={[s.actionChip, actionStatus === value && s.actionChipActive]}
                                    onPress={() => setActionStatus(value as 'paid' | 'rejected')}
                                >
                                    <Text style={[s.actionChipText, actionStatus === value && s.actionChipTextActive]}>{value}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.modalIntro}>Amount {formatCurrency(selected?.amount)} · Allocations {(selected?.allocations ?? []).length}</Text>
                        <Text style={s.helperText}>Seller bank: {selected?.seller?.sellerProfile?.bankName || 'Not set'} · {selected?.seller?.sellerProfile?.accountHolderName || 'No account holder'}</Text>
                        <Text style={s.helperText}>Payout email: {selected?.seller?.sellerProfile?.payoutEmail || 'Not set'}</Text>

                        <TextInput
                            style={s.input}
                            value={bankReference}
                            onChangeText={setBankReference}
                            placeholder="Bank reference or transfer id"
                            placeholderTextColor={T.muted}
                        />
                        <TextInput
                            style={[s.input, s.inputMultiline]}
                            value={note}
                            onChangeText={setNote}
                            placeholder={actionStatus === 'rejected' ? 'Reason for rejection' : 'Optional note'}
                            placeholderTextColor={T.muted}
                            multiline
                        />

                        <TouchableOpacity style={s.submitBtn} onPress={submitUpdate} disabled={submitting}>
                            {submitting ? <ActivityIndicator color={T.white} /> : <Text style={s.submitText}>Save Decision</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    listContent: { padding: 20, gap: 12, paddingBottom: 40 },
    pageHeader: { marginBottom: 14 },
    pageTitle: { color: T.text, fontSize: 26, fontWeight: '700' },
    pageSub: { color: T.muted, fontSize: 13, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    statCard: {
        flex: 1,
        minWidth: 160,
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderTopWidth: 3,
        borderRadius: 16,
        padding: 16,
    },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, fontSize: 12, marginTop: 4 },
    statSub: { color: T.text, fontSize: 12, marginTop: 6, fontWeight: '600' },
    filterPanel: {
        backgroundColor: T.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: T.cardBorder,
        padding: 14,
        marginBottom: 12,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: T.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: T.inputBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    searchInput: { flex: 1, color: T.text, fontSize: 14 },
    filterRow: { gap: 8, paddingTop: 12 },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: T.cardBorder,
        backgroundColor: T.surface,
    },
    filterChipActive: { backgroundColor: T.activeBg, borderColor: T.active },
    filterChipText: { color: T.muted, fontSize: 12, fontWeight: '600' },
    filterChipTextActive: { color: T.active },
    card: {
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderRadius: 18,
        padding: 16,
        gap: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    cardTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    cardSub: { color: T.muted, fontSize: 12, marginTop: 4 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
    metaText: { color: T.text, fontSize: 12 },
    noteText: { color: T.muted, fontSize: 12, fontStyle: 'italic' },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    processBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: T.active,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    processBtnText: { color: T.white, fontSize: 13, fontWeight: '700' },
    center: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
    empty: { color: T.muted, textAlign: 'center', paddingVertical: 28 },
    paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    pageBtn: {
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    pageBtnDisabled: { opacity: 0.45 },
    pageBtnText: { color: T.text, fontSize: 12, fontWeight: '700' },
    pageText: { color: T.muted, fontSize: 12 },
    overlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.56)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalCard: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: T.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: T.cardBorder,
        padding: 20,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalSub: { color: T.muted, fontSize: 12, marginTop: 4 },
    selectionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    actionChip: {
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: T.cardBorder,
        backgroundColor: T.surface,
    },
    actionChipActive: { backgroundColor: T.activeBg, borderColor: T.active },
    actionChipText: { color: T.muted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    actionChipTextActive: { color: T.active },
    modalIntro: { color: T.text, fontSize: 13, fontWeight: '600', marginBottom: 6 },
    helperText: { color: T.muted, fontSize: 12, marginBottom: 4 },
    input: {
        backgroundColor: T.input,
        borderWidth: 1,
        borderColor: T.inputBorder,
        color: T.text,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 12,
    },
    inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
    submitBtn: {
        backgroundColor: T.active,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    submitText: { color: T.white, fontSize: 14, fontWeight: '700' },
});