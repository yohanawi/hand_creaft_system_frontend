import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getMySupportTicketById, getMySupportTickets, replyMySupportTicket } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const FILTERS = ['all', 'open', 'in_progress', 'pending_customer', 'resolved', 'closed'];

const STATUS_COLORS: Record<string, string> = {
    open: '#D97706',
    in_progress: '#2563EB',
    pending_customer: '#C1622F',
    resolved: '#15803D',
    closed: '#6B7280',
};

const formatStatus = (value?: string) => String(value || '').replace(/_/g, ' ');

export default function SupportTicketsScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useProtectedRoute();
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
        if (!auth.userToken) {
            return;
        }

        try {
            const params: any = { page: 1, limit: 20 };
            if (filter !== 'all') params.status = filter;
            const { data } = await getMySupportTickets(params);
            setTickets(data.tickets ?? []);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load support tickets.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [auth.userToken, filter]);

    useFocusEffect(useCallback(() => {
        if (!auth.isAuthorized) {
            return;
        }

        setLoading(true);
        load();
    }, [auth.isAuthorized, load]));

    const openTicket = async (id: string) => {
        setModalVisible(true);
        setDetailLoading(true);
        setSelectedTicket(null);
        setReply('');

        try {
            const { data } = await getMySupportTicketById(id);
            setSelectedTicket(data.ticket);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load ticket details.');
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
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to send reply.');
        } finally {
            setSending(false);
        }
    };

    if (auth.shouldBlock) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7EFE7]">
                <ActivityIndicator color={BROWN.DarkColor} size="large" />
            </View>
        );
    }

    return (
        <>
            <CustomerPageFrame
                scrollY={scrollY}
                onScroll={onScroll}
                eyebrow="Support Center"
                title="Stay close to every customer service conversation."
                subtitle="Review existing tickets, filter by resolution state, and continue the conversation from the same account workspace used for orders and checkout."
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={BROWN.DarkColor} />}
                sidebar={<CustomerSidebar />}
                actions={
                    <TouchableOpacity onPress={() => router.push('/contact' as any)} className="rounded-full px-5 py-3" style={{ backgroundColor: '#FFFFFF' }}>
                        <Text className="font-body text-[14px] font-semibold" style={{ color: BROWN.TextPrimary }}>Create ticket</Text>
                    </TouchableOpacity>
                }
                heroAside={
                    <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Support snapshot</Text>
                        <Text className="mt-3 font-heading text-[24px] text-white">{tickets.length}</Text>
                        <View className="gap-3 mt-5">
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Current filter</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">{formatStatus(filter) || 'all'}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Open tickets</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">{tickets.filter((ticket) => ticket.status !== 'closed' && ticket.status !== 'resolved').length}</Text>
                            </View>
                        </View>
                    </View>
                }
            >
                <CustomerSectionCard title="Filter conversations" subtitle="Switch between active, pending, and resolved support requests.">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                        {FILTERS.map((item) => {
                            const active = item === filter;
                            return (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => setFilter(item)}
                                    className="rounded-full border px-4 py-3"
                                    style={{
                                        borderColor: active ? BROWN.DarkColor : '#EAD7C3',
                                        backgroundColor: active ? '#F6ECDF' : '#FFFAF5',
                                    }}
                                >
                                    <Text className="font-body text-[12px] font-semibold capitalize" style={{ color: active ? BROWN.DarkColor : BROWN.TextSecondary }}>
                                        {formatStatus(item) || 'all'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </CustomerSectionCard>

                <CustomerSectionCard title="Ticket history" subtitle="Open any ticket to read the thread and send a reply from the same workspace.">
                    {loading ? (
                        <View className="items-center justify-center py-12 gap-3">
                            <ActivityIndicator color={BROWN.DarkColor} size="large" />
                            <Text style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>Loading support tickets...</Text>
                        </View>
                    ) : tickets.length === 0 ? (
                        <View className="items-center justify-center rounded-[24px] px-6 py-10" style={{ backgroundColor: '#F8EFE6' }}>
                            <Feather name="message-square" size={44} color={BROWN.lightColor} />
                            <Text className="mt-4 text-center font-heading text-[24px]" style={{ color: BROWN.TextPrimary }}>No tickets yet</Text>
                            <Text className="mt-2 text-center font-body text-[13px] leading-6" style={{ color: BROWN.TextSecondary }}>
                                Open a ticket whenever you need help with sizing, shipping, payments, or returns.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-4">
                            {tickets.map((ticket) => {
                                const color = STATUS_COLORS[ticket.status] ?? BROWN.TextSecondary;

                                return (
                                    <TouchableOpacity
                                        key={ticket._id}
                                        onPress={() => openTicket(ticket._id)}
                                        activeOpacity={0.88}
                                        className="rounded-[24px] border p-5"
                                        style={{ borderColor: '#F0DFCE', backgroundColor: '#FFFAF5' }}
                                    >
                                        <View className="flex-row items-start justify-between gap-4">
                                            <View className="flex-1">
                                                <Text className="font-body text-[12px] uppercase tracking-[1.3px]" style={{ color: '#A16D52' }}>{ticket.ticketNumber}</Text>
                                                <Text className="mt-2 font-heading text-[22px]" style={{ color: BROWN.TextPrimary }}>{ticket.subject}</Text>
                                                <Text className="mt-2 font-body text-[13px] capitalize" style={{ color: BROWN.TextSecondary }}>
                                                    {ticket.category} · {ticket.priority}
                                                </Text>
                                            </View>
                                            <View className="rounded-full px-3 py-2" style={{ backgroundColor: `${color}15` }}>
                                                <Text className="font-body text-[12px] font-semibold capitalize" style={{ color }}>{formatStatus(ticket.status)}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </CustomerSectionCard>
            </CustomerPageFrame>

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/55">
                    <View className="max-h-[92%] rounded-t-[30px] bg-[#FFF9F3] px-5 pb-8 pt-6">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text style={{ fontFamily: BRAND_FONTS.heading, fontSize: 22, color: BROWN.TextPrimary }}>{selectedTicket?.ticketNumber || 'Ticket'}</Text>
                                <Text style={{ fontFamily: BRAND_FONTS.body, fontSize: 12, color: BROWN.TextSecondary }}>Conversation detail</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={22} color={BROWN.TextPrimary} />
                            </TouchableOpacity>
                        </View>

                        {detailLoading ? (
                            <View className="items-center justify-center py-12">
                                <ActivityIndicator color={BROWN.DarkColor} size="large" />
                            </View>
                        ) : selectedTicket ? (
                            <ScrollView contentContainerStyle={{ gap: 12 }}>
                                <View className="rounded-[22px] p-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <Text style={{ fontFamily: BRAND_FONTS.heading, fontSize: 20, color: BROWN.TextPrimary }}>{selectedTicket.subject}</Text>
                                    <Text className="mt-2 text-[12px] capitalize" style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>
                                        {selectedTicket.category} · {selectedTicket.priority} · {formatStatus(selectedTicket.status)}
                                    </Text>
                                </View>

                                {selectedTicket.messages?.map((message: any) => (
                                    <View
                                        key={message._id}
                                        className="rounded-[18px] border px-4 py-4"
                                        style={{
                                            backgroundColor: message.senderType === 'customer' ? '#F6ECDF' : '#FFFFFF',
                                            borderColor: '#EAD7C3',
                                        }}
                                    >
                                        <Text className="mb-2 text-[12px] capitalize" style={{ fontFamily: BRAND_FONTS.body, fontWeight: '700', color: BROWN.DarkColor }}>
                                            {message.senderName || message.senderType}
                                        </Text>
                                        <Text className="text-[13px] leading-6" style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextPrimary }}>{message.message}</Text>
                                    </View>
                                ))}

                                {selectedTicket.status !== 'closed' ? (
                                    <>
                                        <TextInput
                                            value={reply}
                                            onChangeText={setReply}
                                            placeholder="Add a reply"
                                            placeholderTextColor={BROWN.TextSecondary}
                                            multiline
                                            style={{
                                                minHeight: 110,
                                                borderRadius: 20,
                                                borderWidth: 1,
                                                borderColor: '#EAD7C3',
                                                backgroundColor: '#FFFFFF',
                                                padding: 16,
                                                textAlignVertical: 'top',
                                                color: BROWN.TextPrimary,
                                                fontFamily: BRAND_FONTS.body,
                                            }}
                                        />
                                        <TouchableOpacity onPress={sendReply} disabled={sending} className="items-center rounded-full py-4" style={{ backgroundColor: BROWN.DarkColor }}>
                                            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-body text-[13px] font-semibold uppercase tracking-[1.2px] text-white">Send reply</Text>}
                                        </TouchableOpacity>
                                    </>
                                ) : null}
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </>
    );
}