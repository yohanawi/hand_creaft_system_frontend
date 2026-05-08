import { adminTheme as T } from '@/constants/adminTheme';
import { getAdminSellerById, getAdminSellers, updateAdminSeller } from '@/services/api';
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

const STATUS_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Rejected', value: 'rejected' },
];

function Field({ label, value, onChange, placeholder, multiline, keyboardType }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && s.inputMultiline]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder ?? label}
                placeholderTextColor={T.muted}
                multiline={multiline}
                keyboardType={keyboardType}
                autoCapitalize="none"
            />
        </View>
    );
}

function MetricTile({ label, value, color }: any) {
    return (
        <View style={[s.metricTile, { borderTopColor: color }]}>
            <Text style={s.metricValue}>{value}</Text>
            <Text style={s.metricLabel}>{label}</Text>
        </View>
    );
}

const formatCurrency = (value: any) => `$${Number(value || 0).toFixed(2)}`;

export default function AdminSellersScreen() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [form, setForm] = useState<any>({
        name: '',
        email: '',
        phone: '',
        sellerStatus: 'pending',
        shopName: '',
        bio: '',
        contactEmail: '',
        contactPhone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        processingTimeLabel: '',
        shippingPolicy: '',
        returnPolicy: '',
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        payoutEmail: '',
        adminNotes: '',
        rejectionReason: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(search.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const loadSellers = useCallback(async () => {
        try {
            const { data } = await getAdminSellers({
                page,
                limit: 10,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            });
            setSellers(data?.sellers ?? []);
            setPages(data?.pages ?? 1);
            setTotal(data?.total ?? 0);
            setPendingCount(data?.pendingCount ?? 0);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load sellers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        loadSellers();
    }, [loadSellers]));

    const loadSellerDetail = useCallback(async (id: string) => {
        setDetailLoading(true);
        try {
            const { data } = await getAdminSellerById(id);
            setDetail(data);
            const seller = data?.seller ?? {};
            const profile = seller?.sellerProfile ?? {};
            setForm({
                name: seller.name ?? '',
                email: seller.email ?? '',
                phone: seller.phone ?? '',
                sellerStatus: seller.sellerStatus ?? 'pending',
                shopName: profile.shopName ?? '',
                bio: profile.bio ?? '',
                contactEmail: profile.contactEmail ?? '',
                contactPhone: profile.contactPhone ?? '',
                addressLine1: profile.addressLine1 ?? '',
                addressLine2: profile.addressLine2 ?? '',
                city: profile.city ?? '',
                state: profile.state ?? '',
                postalCode: profile.postalCode ?? '',
                country: profile.country ?? 'US',
                processingTimeLabel: profile.processingTimeLabel ?? '',
                shippingPolicy: profile.shippingPolicy ?? '',
                returnPolicy: profile.returnPolicy ?? '',
                bankName: profile.bankName ?? '',
                accountHolderName: profile.accountHolderName ?? '',
                accountNumber: profile.accountNumber ?? '',
                routingNumber: profile.routingNumber ?? '',
                payoutEmail: profile.payoutEmail ?? '',
                adminNotes: profile.adminNotes ?? '',
                rejectionReason: profile.rejectionReason ?? '',
            });
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load seller details');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const openSeller = async (id: string) => {
        setSelectedId(id);
        setModalVisible(true);
        await loadSellerDetail(id);
    };

    const handleSave = async () => {
        if (!selectedId) {
            return;
        }

        if (!form.shopName.trim()) {
            Alert.alert('Validation', 'Shop name is required.');
            return;
        }

        if (form.sellerStatus === 'rejected' && !form.rejectionReason.trim()) {
            Alert.alert('Validation', 'Rejection reason is required when rejecting a seller.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                sellerStatus: form.sellerStatus,
                shopName: form.shopName.trim(),
                bio: form.bio,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country,
                processingTimeLabel: form.processingTimeLabel,
                shippingPolicy: form.shippingPolicy,
                returnPolicy: form.returnPolicy,
                bankName: form.bankName,
                accountHolderName: form.accountHolderName,
                accountNumber: form.accountNumber,
                routingNumber: form.routingNumber,
                payoutEmail: form.payoutEmail,
                adminNotes: form.adminNotes,
                rejectionReason: form.rejectionReason,
            };
            const { data } = await updateAdminSeller(selectedId, payload);
            const suffix = data?.notification?.skipped ? ' Email delivery was skipped because SMTP is not configured.' : '';
            Alert.alert('Success', `Seller updated successfully.${suffix}`);
            await Promise.all([loadSellers(), loadSellerDetail(selectedId)]);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to update seller');
        } finally {
            setSaving(false);
        }
    };

    const renderSeller = ({ item }: { item: any }) => {
        const metrics = item.metrics ?? {};
        const badgeColor = item.sellerStatus === 'approved'
            ? T.green
            : item.sellerStatus === 'suspended'
                ? T.red
                : item.sellerStatus === 'rejected'
                    ? '#7C2D12'
                    : T.active;

        return (
            <View style={s.card}>
                <View style={s.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.cardTitle}>{item.shopName || item.name}</Text>
                        <Text style={s.cardSub}>{item.name} · {item.email}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: `${badgeColor}22` }]}>
                        <Text style={[s.badgeText, { color: badgeColor }]}>{item.sellerStatus}</Text>
                    </View>
                </View>
                <View style={s.cardStats}>
                    <Text style={s.cardStatText}>Products {metrics.totalProducts ?? 0}</Text>
                    <Text style={s.cardStatText}>Active {metrics.activeProducts ?? 0}</Text>
                    <Text style={s.cardStatText}>Sales {formatCurrency(metrics.grossSales)}</Text>
                    <Text style={s.cardStatText}>Rating {Number(metrics.averageRating || 0).toFixed(1)}</Text>
                </View>
                <View style={s.cardActions}>
                    <TouchableOpacity style={s.manageBtn} onPress={() => openSeller(item._id)}>
                        <Feather name="edit-2" size={15} color={T.white} />
                        <Text style={s.manageBtnText}>Manage Seller</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const detailMetrics = detail?.seller?.metrics ?? {};

    return (
        <View style={s.root}>
            <FlatList
                data={sellers}
                keyExtractor={(item) => item._id}
                renderItem={renderSeller}
                contentContainerStyle={s.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSellers(); }} tintColor={T.active} />}
                ListHeaderComponent={(
                    <View>
                        <View style={s.pageHeader}>
                            <View>
                                <Text style={s.pageTitle}>Seller Management</Text>
                                <Text style={s.pageSub}>{total} sellers tracked · {pendingCount} pending approvals</Text>
                            </View>
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
                                {STATUS_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value || 'all'}
                                        style={[s.filterChip, statusFilter === option.value && s.filterChipActive]}
                                        onPress={() => {
                                            setPage(1);
                                            setStatusFilter(option.value);
                                        }}
                                    >
                                        <Text style={[s.filterChipText, statusFilter === option.value && s.filterChipTextActive]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
                ListEmptyComponent={loading ? (
                    <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
                ) : (
                    <Text style={s.empty}>No sellers matched the current filters.</Text>
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

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={s.overlay}>
                    <View style={s.modalBox}>
                        <View style={s.modalHeader}>
                            <View>
                                <Text style={s.modalTitle}>Seller Profile</Text>
                                <Text style={s.modalSub}>Review application details, update profile data, and control seller visibility.</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>

                        {detailLoading ? (
                            <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
                        ) : (
                            <ScrollView contentContainerStyle={s.modalContent}>
                                <View style={s.metricGrid}>
                                    <MetricTile label="Gross Sales" value={formatCurrency(detailMetrics.grossSales)} color={T.green} />
                                    <MetricTile label="Average Order" value={formatCurrency(detailMetrics.averageOrderValue)} color={T.blue} />
                                    <MetricTile label="Active Products" value={detailMetrics.activeProducts ?? 0} color={T.active} />
                                    <MetricTile label="Rating" value={Number(detailMetrics.averageRating || 0).toFixed(1)} color="#8B5CF6" />
                                </View>

                                <View style={s.statusRow}>
                                    {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[s.statusChip, form.sellerStatus === option.value && s.statusChipActive]}
                                            onPress={() => setForm((current: any) => ({ ...current, sellerStatus: option.value }))}
                                        >
                                            <Text style={[s.statusChipText, form.sellerStatus === option.value && s.statusChipTextActive]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Field label="Seller Name" value={form.name} onChange={(value: string) => setForm((current: any) => ({ ...current, name: value }))} />
                                <Field label="Login Email" value={form.email} onChange={(value: string) => setForm((current: any) => ({ ...current, email: value }))} keyboardType="email-address" />
                                <Field label="Phone" value={form.phone} onChange={(value: string) => setForm((current: any) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
                                <Field label="Shop Name" value={form.shopName} onChange={(value: string) => setForm((current: any) => ({ ...current, shopName: value }))} />
                                <Field label="Contact Email" value={form.contactEmail} onChange={(value: string) => setForm((current: any) => ({ ...current, contactEmail: value }))} keyboardType="email-address" />
                                <Field label="Contact Phone" value={form.contactPhone} onChange={(value: string) => setForm((current: any) => ({ ...current, contactPhone: value }))} keyboardType="phone-pad" />
                                <Field label="Bio" value={form.bio} onChange={(value: string) => setForm((current: any) => ({ ...current, bio: value }))} multiline />
                                <Field label="Address Line 1" value={form.addressLine1} onChange={(value: string) => setForm((current: any) => ({ ...current, addressLine1: value }))} />
                                <Field label="Address Line 2" value={form.addressLine2} onChange={(value: string) => setForm((current: any) => ({ ...current, addressLine2: value }))} />
                                <Field label="City" value={form.city} onChange={(value: string) => setForm((current: any) => ({ ...current, city: value }))} />
                                <Field label="State" value={form.state} onChange={(value: string) => setForm((current: any) => ({ ...current, state: value }))} />
                                <Field label="Postal Code" value={form.postalCode} onChange={(value: string) => setForm((current: any) => ({ ...current, postalCode: value }))} />
                                <Field label="Country" value={form.country} onChange={(value: string) => setForm((current: any) => ({ ...current, country: value }))} />
                                <Field label="Processing Time Label" value={form.processingTimeLabel} onChange={(value: string) => setForm((current: any) => ({ ...current, processingTimeLabel: value }))} />
                                <Field label="Shipping Policy" value={form.shippingPolicy} onChange={(value: string) => setForm((current: any) => ({ ...current, shippingPolicy: value }))} multiline />
                                <Field label="Return Policy" value={form.returnPolicy} onChange={(value: string) => setForm((current: any) => ({ ...current, returnPolicy: value }))} multiline />
                                <Field label="Bank Name" value={form.bankName} onChange={(value: string) => setForm((current: any) => ({ ...current, bankName: value }))} />
                                <Field label="Account Holder" value={form.accountHolderName} onChange={(value: string) => setForm((current: any) => ({ ...current, accountHolderName: value }))} />
                                <Field label="Account Number" value={form.accountNumber} onChange={(value: string) => setForm((current: any) => ({ ...current, accountNumber: value }))} keyboardType="number-pad" />
                                <Field label="Routing Number" value={form.routingNumber} onChange={(value: string) => setForm((current: any) => ({ ...current, routingNumber: value }))} />
                                <Field label="Payout Email" value={form.payoutEmail} onChange={(value: string) => setForm((current: any) => ({ ...current, payoutEmail: value }))} keyboardType="email-address" />
                                <Field label="Admin Notes" value={form.adminNotes} onChange={(value: string) => setForm((current: any) => ({ ...current, adminNotes: value }))} multiline />
                                <Field label="Rejection Reason" value={form.rejectionReason} onChange={(value: string) => setForm((current: any) => ({ ...current, rejectionReason: value }))} multiline />

                                <View style={s.panel}>
                                    <Text style={s.panelTitle}>Recent Orders</Text>
                                    {(detail?.recentOrders ?? []).length === 0 ? (
                                        <Text style={s.panelEmpty}>No recent seller orders.</Text>
                                    ) : (detail?.recentOrders ?? []).map((order: any) => (
                                        <View key={order._id} style={s.infoRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.infoTitle}>{order.orderNumber}</Text>
                                                <Text style={s.infoSub}>{order.customer?.name ?? 'Customer'} · {order.itemCount} items</Text>
                                            </View>
                                            <Text style={s.infoValue}>{formatCurrency(order.total)}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={s.panel}>
                                    <Text style={s.panelTitle}>Recent Payouts</Text>
                                    {(detail?.recentPayouts ?? []).length === 0 ? (
                                        <Text style={s.panelEmpty}>No payout activity yet.</Text>
                                    ) : (detail?.recentPayouts ?? []).map((payout: any) => (
                                        <View key={payout._id} style={s.infoRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.infoTitle}>{formatCurrency(payout.amount)}</Text>
                                                <Text style={s.infoSub}>{String(payout.status).replace(/_/g, ' ')}</Text>
                                            </View>
                                            <Text style={s.infoValue}>{new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}

                        <View style={s.modalFooter}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={s.cancelText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving || detailLoading}>
                                {saving ? <ActivityIndicator color={T.white} size="small" /> : <Text style={s.saveText}>Save Seller</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    listContent: { padding: 20, gap: 12, paddingBottom: 40 },
    pageHeader: { marginBottom: 16 },
    pageTitle: { color: T.text, fontSize: 26, fontWeight: '700' },
    pageSub: { color: T.muted, fontSize: 13, marginTop: 4 },
    filterPanel: {
        backgroundColor: T.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: T.cardBorder,
        padding: 14,
        marginBottom: 14,
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
        gap: 14,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    cardTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    cardSub: { color: T.muted, fontSize: 12, marginTop: 4 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    cardStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cardStatText: {
        color: T.text,
        fontSize: 12,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: T.active,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    manageBtnText: { color: T.white, fontSize: 13, fontWeight: '700' },
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
    overlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.56)', justifyContent: 'flex-end' },
    modalBox: {
        maxHeight: '92%',
        backgroundColor: T.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: T.cardBorder,
        gap: 16,
    },
    modalTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
    modalSub: { color: T.muted, fontSize: 12, marginTop: 4, maxWidth: 320 },
    modalContent: { padding: 20, paddingBottom: 28 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    metricTile: {
        flex: 1,
        minWidth: 150,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.cardBorder,
        borderTopWidth: 3,
        borderRadius: 14,
        padding: 14,
    },
    metricValue: { color: T.text, fontSize: 20, fontWeight: '700' },
    metricLabel: { color: T.muted, fontSize: 11, marginTop: 6 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    statusChip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: T.cardBorder,
        backgroundColor: T.surface,
    },
    statusChipActive: { backgroundColor: T.activeBg, borderColor: T.active },
    statusChipText: { color: T.muted, fontSize: 12, fontWeight: '700' },
    statusChipTextActive: { color: T.active },
    field: { marginBottom: 12 },
    fieldLabel: { color: T.muted, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.6 },
    input: {
        backgroundColor: T.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: T.inputBorder,
        color: T.text,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
    },
    inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
    panel: {
        marginTop: 8,
        backgroundColor: T.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.cardBorder,
        padding: 14,
    },
    panelTitle: { color: T.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
    panelEmpty: { color: T.muted, fontSize: 12 },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: T.cardBorder,
    },
    infoTitle: { color: T.text, fontSize: 13, fontWeight: '700' },
    infoSub: { color: T.muted, fontSize: 11, marginTop: 4 },
    infoValue: { color: T.text, fontSize: 12, fontWeight: '600' },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: T.cardBorder,
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: T.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    cancelText: { color: T.muted, fontSize: 14, fontWeight: '700' },
    saveBtn: {
        flex: 1.4,
        borderRadius: 12,
        backgroundColor: T.active,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    saveText: { color: T.white, fontSize: 14, fontWeight: '700' },
});