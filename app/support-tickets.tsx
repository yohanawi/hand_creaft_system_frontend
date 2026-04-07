import AuthContext from '@/context/AuthContext';
import { getMySupportTicketById, getMySupportTickets, replyMySupportTicket } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
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
    border: '#3D2415',
    active: '#C1622F',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    green: '#4CAF50',
    yellow: '#F5A623',
    red: '#E53E3E',
    blue: '#4299E1',
};

const STATUS_COLORS: Record<string, string> = {
    open: T.yellow,
    in_progress: T.blue,
    pending_customer: T.active,
    resolved: T.green,
    closed: T.muted,
};

const FILTERS = ['all', 'open', 'in_progress', 'pending_customer', 'resolved', 'closed'];

export default function SupportTicketsScreen() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        if (!auth?.userToken) {
            router.replace('/login' as any);
            return;
        }
        try {
            const params: any = { page: 1, limit: 20 };
            if (filter !== 'all') params.status = filter;
            const { data } = await getMySupportTickets(params);
            setTickets(data.tickets ?? []);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load support tickets.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [auth?.userToken, filter]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const openTicket = async (id: string) => {
        setModalVisible(true);
        setDetailLoading(true);
        setSelectedTicket(null);
        setReply('');
        try {
            const { data } = await getMySupportTicketById(id);
            setSelectedTicket(data.ticket);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load ticket details.');
            setModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const sendReply = async () => {
        if (!selectedTicket?._id || !reply.trim()) return;
        setSending(true);
        try {
            const { data } = await replyMySupportTicket(selectedTicket._id, { message: reply.trim() });
            setSelectedTicket(data.ticket);
            setReply('');
            await load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to send reply.');
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={s.root}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
                    <Feather name="arrow-left" size={20} color={T.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={s.headerTitle}>Support Tickets</Text>
                    <Text style={s.headerSub}>Track your conversations with support</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/contact' as any)} style={s.iconBtn}>
                    <Feather name="plus" size={20} color={T.active} />
                </TouchableOpacity>
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
            ) : tickets.length === 0 ? (
                <View style={s.centered}>
                    <Feather name="message-square" size={64} color={T.muted} />
                    <Text style={s.emptyTitle}>No support tickets yet</Text>
                    <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/contact' as any)}>
                        <Text style={s.primaryBtnText}>Create Ticket</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    renderItem={({ item }) => {
                        const color = STATUS_COLORS[item.status] ?? T.muted;
                        return (
                            <TouchableOpacity style={s.ticketCard} onPress={() => openTicket(item._id)} activeOpacity={0.85}>
                                <View style={s.ticketRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.ticketNumber}>{item.ticketNumber}</Text>
                                        <Text style={s.ticketSubject}>{item.subject}</Text>
                                        <Text style={s.ticketMeta}>{item.category} · {item.priority}</Text>
                                    </View>
                                    <View style={[s.statusBadge, { borderColor: color, backgroundColor: color + '22' }]}>
                                        <Text style={[s.statusText, { color }]}>{String(item.status).replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={s.overlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{selectedTicket?.ticketNumber || 'Ticket'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Feather name="x" size={20} color={T.text} /></TouchableOpacity>
                        </View>
                        {detailLoading ? (
                            <View style={s.centered}><ActivityIndicator color={T.active} size="large" /></View>
                        ) : selectedTicket ? (
                            <ScrollView contentContainerStyle={{ gap: 12 }}>
                                <View style={s.detailCard}>
                                    <Text style={s.ticketSubject}>{selectedTicket.subject}</Text>
                                    <Text style={s.ticketMeta}>{selectedTicket.category} · {selectedTicket.priority} · {selectedTicket.status.replace(/_/g, ' ')}</Text>
                                </View>
                                {selectedTicket.messages?.map((message: any) => (
                                    <View key={message._id} style={[s.messageBubble, message.senderType === 'customer' ? s.messageCustomer : s.messageAdmin]}>
                                        <Text style={s.messageAuthor}>{message.senderName || message.senderType}</Text>
                                        <Text style={s.messageText}>{message.message}</Text>
                                    </View>
                                ))}
                                {selectedTicket.status !== 'closed' && (
                                    <>
                                        <TextInput
                                            style={s.replyInput}
                                            value={reply}
                                            onChangeText={setReply}
                                            placeholder="Add a reply"
                                            placeholderTextColor={T.muted}
                                            multiline
                                        />
                                        <TouchableOpacity style={s.primaryBtn} onPress={sendReply} disabled={sending}>
                                            {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Send Reply</Text>}
                                        </TouchableOpacity>
                                    </>
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
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
    headerSub: { color: T.muted, fontSize: 12, marginTop: 2 },
    filterWrap: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
    filterTabActive: { borderColor: T.active, backgroundColor: T.active + '22' },
    filterText: { color: T.muted, fontSize: 12, textTransform: 'capitalize' },
    filterTextActive: { color: T.active, fontWeight: '700' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    emptyTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
    primaryBtn: { backgroundColor: T.active, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: '700' },
    ticketCard: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 16, padding: 16 },
    ticketRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    ticketNumber: { color: T.active, fontSize: 12, fontWeight: '700' },
    ticketSubject: { color: T.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
    ticketMeta: { color: T.muted, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
    statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    detailCard: { backgroundColor: '#241610', borderRadius: 12, padding: 14 },
    messageBubble: { borderRadius: 14, padding: 12, borderWidth: 1 },
    messageCustomer: { backgroundColor: T.active + '22', borderColor: T.active + '44' },
    messageAdmin: { backgroundColor: '#241610', borderColor: T.border },
    messageAuthor: { color: T.active, fontWeight: '700', marginBottom: 6, textTransform: 'capitalize' },
    messageText: { color: T.text, lineHeight: 20 },
    replyInput: { minHeight: 90, backgroundColor: '#241610', borderWidth: 1, borderColor: T.border, borderRadius: 12, color: T.text, padding: 12, textAlignVertical: 'top' },
});