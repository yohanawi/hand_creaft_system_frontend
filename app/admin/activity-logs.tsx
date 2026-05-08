import { adminTheme as T } from '@/constants/adminTheme';
import { exportAdminActivityLogs, getAdminActivityLogs, getAdminUsers } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ACTION_OPTIONS = [
    { label: 'All Actions', value: '' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Approve', value: 'approve' },
    { label: 'Reject', value: 'reject' },
    { label: 'Suspend', value: 'suspend' },
    { label: 'Reactivate', value: 'reactivate' },
];

const RESOURCE_OPTIONS = [
    { label: 'All Resources', value: '' },
    { label: 'Users', value: 'user' },
    { label: 'Products', value: 'product' },
    { label: 'Orders', value: 'order' },
    { label: 'Categories', value: 'category' },
    { label: 'Subcategories', value: 'subcategory' },
    { label: 'Coupons', value: 'coupon' },
    { label: 'Blogs', value: 'blog' },
    { label: 'Support', value: 'support_ticket' },
    { label: 'Seller Applications', value: 'seller_application' },
    { label: 'Seller Payouts', value: 'seller_payout' },
    { label: 'Inventory', value: 'inventory' },
];

const prettyLabel = (value: string) => String(value || '').replace(/_/g, ' ');

const formatDateTime = (value: string) => {
    if (!value) return 'Unknown';
    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const previewJson = (value: any) => {
    if (!value) return 'None';
    const json = JSON.stringify(value, null, 2);
    return json.length > 220 ? `${json.slice(0, 220)}...` : json;
};

export default function AdminActivityLogsScreen() {
    const [logs, setLogs] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [action, setAction] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const queryParams = useMemo(() => ({
        page,
        limit: 20,
        search: search || undefined,
        action: action || undefined,
        resourceType: resourceType || undefined,
        userId: userId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    }), [action, endDate, page, resourceType, search, startDate, userId]);

    const load = useCallback(async () => {
        try {
            const [logsRes, adminsRes] = await Promise.all([
                getAdminActivityLogs(queryParams),
                getAdminUsers({ role: 'admin', limit: 100 }),
            ]);

            setLogs(logsRes.data?.logs ?? []);
            setTotal(logsRes.data?.total ?? 0);
            setPages(logsRes.data?.pages ?? 1);
            setAdmins(adminsRes.data?.users ?? []);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load activity logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [queryParams]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const applySearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const clearFilters = () => {
        setPage(1);
        setSearch('');
        setSearchInput('');
        setAction('');
        setResourceType('');
        setUserId('');
        setStartDate('');
        setEndDate('');
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await exportAdminActivityLogs({
                search: search || undefined,
                action: action || undefined,
                resourceType: resourceType || undefined,
                userId: userId || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });

            const csv = String(response.data || '');
            if (!csv.trim()) {
                Alert.alert('Export', 'No log data matched the current filters.');
                return;
            }

            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return;
            }

            await Clipboard.setStringAsync(csv);
            Alert.alert('Export ready', 'CSV data was copied to the clipboard.');
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to export activity logs');
        } finally {
            setExporting(false);
        }
    };

    const renderChipGroup = (
        options: Array<{ label: string; value: string }>,
        value: string,
        onChange: (nextValue: string) => void,
    ) => (
        <FlatList
            horizontal
            data={options}
            keyExtractor={(item) => item.value || item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[s.chip, value === item.value && s.chipActive]}
                    onPress={() => { setPage(1); onChange(item.value); }}
                >
                    <Text style={[s.chipText, value === item.value && s.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
            )}
        />
    );

    const activeFilterCount = [search, action, resourceType, userId, startDate, endDate].filter(Boolean).length;

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View style={s.headerRow}>
                <View>
                    <Text style={s.title}>Activity Logs</Text>
                    <Text style={s.subtitle}>Track every admin create, update, approve, and delete action</Text>
                </View>
                <TouchableOpacity style={s.exportBtn} onPress={handleExport} disabled={exporting}>
                    {exporting ? <ActivityIndicator color="#fff" /> : <><Feather name="download" size={16} color="#fff" /><Text style={s.exportText}>Export CSV</Text></>}
                </TouchableOpacity>
            </View>

            <View style={s.statsCard}>
                <Text style={s.statsValue}>{total}</Text>
                <Text style={s.statsLabel}>matching log entries</Text>
                <Text style={s.statsMeta}>{activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}</Text>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput
                    style={s.searchInput}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    onSubmitEditing={applySearch}
                    placeholder="Search admin name, resource, or type"
                    placeholderTextColor={T.muted}
                    returnKeyType="search"
                />
                <TouchableOpacity onPress={applySearch}>
                    <Feather name="arrow-right" size={16} color={T.active} />
                </TouchableOpacity>
            </View>

            <View style={s.filterCard}>
                <Text style={s.sectionTitle}>Action</Text>
                {renderChipGroup(ACTION_OPTIONS, action, setAction)}

                <Text style={s.sectionTitle}>Resource</Text>
                {renderChipGroup(RESOURCE_OPTIONS, resourceType, setResourceType)}

                <Text style={s.sectionTitle}>Admin User</Text>
                <FlatList
                    horizontal
                    data={[{ _id: '', name: 'All Admins' }, ...admins]}
                    keyExtractor={(item) => item._id || item.name}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.chipRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[s.chip, userId === item._id && s.chipActive]}
                            onPress={() => { setPage(1); setUserId(item._id); }}
                        >
                            <Text style={[s.chipText, userId === item._id && s.chipTextActive]}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />

                <View style={s.dateRow}>
                    <View style={s.dateField}>
                        <Text style={s.fieldLabel}>Start Date</Text>
                        <TextInput
                            style={s.input}
                            value={startDate}
                            onChangeText={(value) => { setPage(1); setStartDate(value); }}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={T.muted}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={s.dateField}>
                        <Text style={s.fieldLabel}>End Date</Text>
                        <TextInput
                            style={s.input}
                            value={endDate}
                            onChangeText={(value) => { setPage(1); setEndDate(value); }}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={T.muted}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <TouchableOpacity style={s.clearBtn} onPress={clearFilters}>
                    <Feather name="rotate-ccw" size={14} color={T.muted} />
                    <Text style={s.clearText}>Clear Filters</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={s.centered}><ActivityIndicator color={T.active} size="large" /></View>
            ) : logs.length === 0 ? (
                <View style={s.emptyCard}>
                    <Feather name="inbox" size={48} color={T.muted} />
                    <Text style={s.emptyTitle}>No activity logs found</Text>
                    <Text style={s.emptyText}>Try a broader filter range or clear the current filters.</Text>
                </View>
            ) : (
                <View style={s.logList}>
                    {logs.map((log) => (
                        <View key={log._id} style={s.logCard}>
                            <View style={s.logHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.logTitle}>{log.resourceName || prettyLabel(log.resourceType)}</Text>
                                    <Text style={s.logMeta}>{formatDateTime(log.timestamp)}</Text>
                                </View>
                                <View style={s.badgeStack}>
                                    <View style={s.badge}>
                                        <Text style={s.badgeText}>{prettyLabel(log.action)}</Text>
                                    </View>
                                    <View style={[s.badge, s.badgeSecondary]}>
                                        <Text style={s.badgeTextSecondary}>{prettyLabel(log.resourceType)}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={s.metaRow}>
                                <Text style={s.metaLabel}>Admin</Text>
                                <Text style={s.metaValue}>{log.userName}</Text>
                            </View>
                            <View style={s.metaRow}>
                                <Text style={s.metaLabel}>IP</Text>
                                <Text style={s.metaValue}>{log.ipAddress || 'Unknown'}</Text>
                            </View>

                            <View style={s.changeGrid}>
                                <View style={s.changeCard}>
                                    <Text style={s.changeTitle}>Before</Text>
                                    <Text style={s.changeText}>{previewJson(log.changes?.before)}</Text>
                                </View>
                                <View style={s.changeCard}>
                                    <Text style={s.changeTitle}>After</Text>
                                    <Text style={s.changeText}>{previewJson(log.changes?.after)}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={s.paginationRow}>
                <TouchableOpacity style={[s.pageBtn, page <= 1 && s.pageBtnDisabled]} disabled={page <= 1} onPress={() => setPage((value) => Math.max(1, value - 1))}>
                    <Feather name="chevron-left" size={16} color={page <= 1 ? T.muted : T.active} />
                </TouchableOpacity>
                <Text style={s.pageText}>Page {page} of {pages}</Text>
                <TouchableOpacity style={[s.pageBtn, page >= pages && s.pageBtnDisabled]} disabled={page >= pages} onPress={() => setPage((value) => Math.min(pages, value + 1))}>
                    <Feather name="chevron-right" size={16} color={page >= pages ? T.muted : T.active} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    title: { color: T.text, fontSize: 28, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4, maxWidth: 680 },
    exportBtn: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, backgroundColor: T.active, flexDirection: 'row', alignItems: 'center', gap: 8 },
    exportText: { color: '#fff', fontWeight: '700' },
    statsCard: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, padding: 18 },
    statsValue: { color: T.text, fontSize: 32, fontWeight: '700' },
    statsLabel: { color: T.muted, marginTop: 6 },
    statsMeta: { color: T.active, marginTop: 6, fontWeight: '600' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.input, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 12 },
    searchInput: { flex: 1, color: T.text },
    filterCard: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, padding: 16, gap: 8 },
    sectionTitle: { color: T.text, fontSize: 13, fontWeight: '700', marginTop: 4 },
    chipRow: { gap: 8, paddingVertical: 4 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.input },
    chipActive: { borderColor: T.active, backgroundColor: T.activeBg },
    chipText: { color: T.muted, fontSize: 12, fontWeight: '600' },
    chipTextActive: { color: T.active },
    dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
    dateField: { flex: 1, minWidth: 180 },
    fieldLabel: { color: T.muted, fontSize: 12, marginBottom: 6 },
    input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.input, color: T.text, paddingHorizontal: 12 },
    clearBtn: { alignSelf: 'flex-start', marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
    clearText: { color: T.muted, fontWeight: '600' },
    centered: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyCard: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, padding: 28, alignItems: 'center', gap: 8 },
    emptyTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    emptyText: { color: T.muted, textAlign: 'center', maxWidth: 420 },
    logList: { gap: 14 },
    logCard: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.cardBorder, padding: 16, gap: 12 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    logTitle: { color: T.text, fontSize: 17, fontWeight: '700' },
    logMeta: { color: T.muted, fontSize: 12, marginTop: 4 },
    badgeStack: { alignItems: 'flex-end', gap: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: T.activeBg },
    badgeSecondary: { backgroundColor: T.input, borderWidth: 1, borderColor: T.cardBorder },
    badgeText: { color: T.active, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    badgeTextSecondary: { color: T.muted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    metaRow: { flexDirection: 'row', gap: 12 },
    metaLabel: { width: 64, color: T.muted, fontSize: 12, fontWeight: '700' },
    metaValue: { flex: 1, color: T.text, fontSize: 13 },
    changeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    changeCard: { flex: 1, minWidth: 240, backgroundColor: T.input, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, padding: 12 },
    changeTitle: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    changeText: { color: T.muted, fontSize: 12, lineHeight: 18, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }) },
    paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 12 },
    pageBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
    pageBtnDisabled: { opacity: 0.55 },
    pageText: { color: T.text, fontWeight: '700' },
});