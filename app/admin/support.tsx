import { adminTheme as T } from '@/constants/adminTheme';
import {
    getAdminSupportTicketById,
    getAdminSupportTicketStats,
    getAdminSupportTickets,
    replyAdminSupportTicket,
    updateAdminSupportTicket,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

const FILTERS = ['all', 'open', 'in_progress', 'pending_customer', 'resolved', 'closed'];

export default function AdminSupportScreen() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reply, setReply] = useState('');
    const [status, setStatus] = useState('pending_customer');
    const [updating, setUpdating] = useState(false);

    const load = useCallback(async () => {
        try {
            const params: any = { page: 1, limit: 30 };
            if (filter !== 'all') params.status = filter;
            if (search.trim()) params.search = search.trim();
            const [ticketsRes, statsRes] = await Promise.all([
                getAdminSupportTickets(params),
                getAdminSupportTicketStats(),
            ]);
            setTickets(ticketsRes.data.tickets ?? []);
            setStats(statsRes.data.stats ?? {});
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load support tickets.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, search]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const openTicket = async (id: string) => {
        setModalVisible(true);
        setDetailLoading(true);
        setSelected(null);
        setReply('');
        try {
            const { data } = await getAdminSupportTicketById(id);
            setSelected(data.ticket);
            setStatus(data.ticket.status);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load ticket details.');
            setModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const saveTicket = async () => {
        if (!selected?._id) return;
        setUpdating(true);
        try {
            if (reply.trim()) {
                const { data } = await replyAdminSupportTicket(selected._id, { message: reply.trim(), status });
                setSelected(data.ticket);
                setReply('');
            } else {
                const { data } = await updateAdminSupportTicket(selected._id, { status });
                setSelected(data.ticket);
            }
            await load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update ticket.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View>
                <Text style={s.title}>Support Queue</Text>
                <Text style={s.subtitle}>Manage customer tickets and responses</Text>
            </View>

            <View style={s.statsRow}>
                {[
                    ['Total', stats.total, T.blue],
                    ['Open', stats.open, T.yellow],
                    ['In Progress', stats.inProgress, T.active],
                    ['Pending Customer', stats.pendingCustomer, T.active],
                    ['Resolved', stats.resolved, T.green],
                    ['Urgent', stats.urgent, T.red],
                ].map(([label, value, color]) => (
                    <View key={String(label)} style={[s.statCard, { borderTopColor: String(color) }]}>
                        <Text style={s.statValue}>{value ?? 0}</Text>
                        <Text style={s.statLabel}>{label}</Text>
                    </View>
                ))}
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search tickets" placeholderTextColor={T.muted} onSubmitEditing={load} />
            </View>

            <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterWrap}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[s.filterTab, filter === item && s.filterTabActive]} onPress={() => setFilter(item)}>
                        <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item.replace(/_/g, ' ')}</Text>
                    </TouchableOpacity>
                )}
            />

            {loading ? (
                <View style={s.centered}><ActivityIndicator color={T.active} size="large" /></View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.ticketCard} onPress={() => openTicket(item._id)} activeOpacity={0.85}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.ticketNumber}>{item.ticketNumber}</Text>
                                    <Text style={s.ticketSubject}>{item.subject}</Text>
                                    <Text style={s.ticketMeta}>{item.customerName} · {item.category} · {item.priority}</Text>
                                </View>
                                <Text style={s.ticketMeta}>{String(item.status).replace(/_/g, ' ')}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={s.overlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{selected?.ticketNumber || 'Ticket'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="x" size={20} color={T.text} /></TouchableOpacity>
                        </View>
                        {detailLoading ? (
                            <View style={s.centered}><ActivityIndicator color={T.active} size="large" /></View>
                        ) : selected ? (
                            <ScrollView contentContainerStyle={{ gap: 12 }}>
                                <View style={s.detailCard}>
                                    <Text style={s.ticketSubject}>{selected.subject}</Text>
                                    <Text style={s.ticketMeta}>{selected.customerName} · {selected.customerEmail}</Text>
                                </View>
                                {selected.messages?.map((message: any) => (
                                    <View key={message._id} style={s.messageBubble}>
                                        <Text style={s.ticketMeta}>{message.senderName || message.senderType}</Text>
                                        <Text style={s.messageText}>{message.message}</Text>
                                    </View>
                                ))}
                                <View style={s.statusWrap}>
                                    {FILTERS.filter((item) => item !== 'all').map((item) => (
                                        <TouchableOpacity key={item} style={[s.filterTab, status === item && s.filterTabActive]} onPress={() => setStatus(item)}>
                                            <Text style={[s.filterText, status === item && s.filterTextActive]}>{item.replace(/_/g, ' ')}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput style={s.replyInput} value={reply} onChangeText={setReply} placeholder="Reply to customer (optional if only changing status)" placeholderTextColor={T.muted} multiline />
                                <TouchableOpacity style={s.saveBtn} onPress={saveTicket} disabled={updating}>
                                    {updating ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>Save</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4 },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 130, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, padding: 14 },
    statValue: { color: T.text, fontSize: 22, fontWeight: '700' },
    statLabel: { color: T.muted, fontSize: 12, marginTop: 4 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.input, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, paddingHorizontal: 14, paddingVertical: 10 },
    searchInput: { flex: 1, color: T.text },
    filterWrap: { gap: 8 },
    filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder },
    filterTabActive: { borderColor: T.active, backgroundColor: T.active + '22' },
    filterText: { color: T.muted, fontSize: 12, textTransform: 'capitalize' },
    filterTextActive: { color: T.active, fontWeight: '700' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    ticketCard: { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 16, padding: 16 },
    ticketNumber: { color: T.active, fontSize: 12, fontWeight: '700' },
    ticketSubject: { color: T.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
    ticketMeta: { color: T.muted, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalCard: { width: '100%', maxWidth: 760, maxHeight: '90%', backgroundColor: T.card, borderRadius: 20, borderWidth: 1, borderColor: T.cardBorder, padding: 20 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    detailCard: { backgroundColor: T.input, borderRadius: 12, padding: 14 },
    messageBubble: { backgroundColor: T.input, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, padding: 12 },
    messageText: { color: T.text, marginTop: 6, lineHeight: 20 },
    statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    replyInput: { minHeight: 100, backgroundColor: T.input, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 12, color: T.text, padding: 12, textAlignVertical: 'top' },
    saveBtn: { backgroundColor: T.active, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '700' },
});