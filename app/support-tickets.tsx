import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import {
  createSupportTicket,
  getMySupportTicketById,
  getMySupportTickets,
  replyMySupportTicket,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const FILTERS = ['all', 'open', 'in_progress', 'pending_customer', 'resolved', 'closed'];

const CATEGORIES = [
  'general',
  'order',
  'payment',
  'shipping',
  'product',
  'technical',
  'account',
];

const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const STATUS_COLORS: Record<string, string> = {
  open: '#D97706',
  in_progress: '#2563EB',
  pending_customer: '#C1622F',
  resolved: '#15803D',
  closed: '#6B7280',
};

const STATUS_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  open: 'message-circle',
  in_progress: 'tool',
  pending_customer: 'clock',
  resolved: 'check-circle',
  closed: 'lock',
};

const formatLabel = (value?: string) =>
  String(value || 'general').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value?: string) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function LuxuryInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View className="gap-2">
      <Text
        className="text-[11px] uppercase tracking-[2px] text-[#8A6A56]"
        style={{ fontFamily: BRAND_FONTS.body }}
      >
        {label}
      </Text>

      <View className="flex-row items-start gap-3 rounded-[22px] border border-[#EAD7C3] bg-[#FFFAF5] px-4 py-3">
        <Feather name={icon} size={16} color={BROWN.DarkColor} style={{ marginTop: multiline ? 5 : 13 }} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A58B78"
          multiline={multiline}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            minHeight: multiline ? 110 : 44,
            textAlignVertical: multiline ? 'top' : 'center',
            color: BROWN.TextPrimary,
            fontFamily: BRAND_FONTS.body,
            fontSize: 14,
            outlineStyle: 'none' as any,
          }}
        />
      </View>
    </View>
  );
}

export default function SupportTicketsScreen() {
  const { scrollY, onScroll } = useHeaderScroll();
  const auth = useProtectedRoute();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: auth.user?.name || '',
    customerEmail: auth.user?.email || '',
    customerPhone: auth.user?.phone || '',
    subject: '',
    category: 'general',
    priority: 'normal',
    message: '',
  });

  const [threadVisible, setThreadVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const resetCreateForm = useCallback(() => {
    setCreateForm({
      customerName: auth.user?.name || '',
      customerEmail: auth.user?.email || '',
      customerPhone: auth.user?.phone || '',
      subject: '',
      category: 'general',
      priority: 'normal',
      message: '',
    });
  }, [auth.user?.email, auth.user?.name, auth.user?.phone]);

  const loadTickets = useCallback(async () => {
    if (!auth.userToken) return;

    try {
      const params: any = { page: 1, limit: 20 };
      if (filter !== 'all') params.status = filter;

      const { data } = await getMySupportTickets(params);
      setTickets(data?.tickets ?? []);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load support tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth.userToken, filter]);

  useFocusEffect(
    useCallback(() => {
      if (!auth.isAuthorized) return;
      setLoading(true);
      loadTickets();
    }, [auth.isAuthorized, loadTickets]),
  );

  const summary = useMemo(() => {
    const active = tickets.filter((t) => ['open', 'in_progress', 'pending_customer'].includes(t.status)).length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { active, resolved, closed };
  }, [tickets]);

  const openCreateModal = () => {
    resetCreateForm();
    setCreateVisible(true);
  };

  const handleCreateTicket = async () => {
    const payload = {
      customerName: createForm.customerName.trim(),
      customerEmail: createForm.customerEmail.trim(),
      customerPhone: createForm.customerPhone.trim(),
      subject: createForm.subject.trim(),
      category: createForm.category,
      priority: createForm.priority,
      message: createForm.message.trim(),
      source: 'profile',
    };

    if (!payload.customerName || !payload.customerEmail || !payload.subject || !payload.message) {
      Alert.alert('Missing details', 'Please complete name, email, subject, and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setCreating(true);

    try {
      const { data } = await createSupportTicket(payload as any);

      setCreateVisible(false);
      resetCreateForm();
      await loadTickets();

      if (data?.ticket?._id) {
        await openTicket(data.ticket._id);
      } else {
        Alert.alert('Success', 'Support ticket created successfully.');
      }
    } catch (error: any) {
      Alert.alert('Submission failed', error?.response?.data?.message ?? 'Failed to create support ticket.');
    } finally {
      setCreating(false);
    }
  };

  const openTicket = async (id: string) => {
    setThreadVisible(true);
    setDetailLoading(true);
    setSelectedTicket(null);
    setReply('');

    try {
      const { data } = await getMySupportTicketById(id);
      setSelectedTicket(data?.ticket);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load ticket details.');
      setThreadVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket?._id || !reply.trim()) return;

    setSending(true);

    try {
      const { data } = await replyMySupportTicket(selectedTicket._id, {
        message: reply.trim(),
      });

      setSelectedTicket(data?.ticket);
      setReply('');
      await loadTickets();
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
        title="Your jewellery care conversations."
        subtitle="Create tickets, track support replies, and get help with handmade orders, delivery, payments, sizing, and custom jewellery."
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTickets();
            }}
            tintColor={BROWN.DarkColor}
          />
        }
        sidebar={<CustomerSidebar />}
        actions={
          <>
            <Pressable
              onPress={openCreateModal}
              className="px-5 py-3 bg-white rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text className="text-[14px] font-bold text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.body }}>
                Create Ticket
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setRefreshing(true);
                loadTickets();
              }}
              className="px-5 py-3 border rounded-full border-white/25 bg-white/10"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text className="text-[14px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                Refresh
              </Text>
            </Pressable>
          </>
        }
        heroAside={
          <View className="overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5">
            <View className="absolute rounded-full -right-8 -top-8 h-28 w-28 bg-white/10" />

            <Text className="text-[11px] uppercase tracking-[2.4px] text-[#F1DAC5]" style={{ fontFamily: BRAND_FONTS.body }}>
              Support Snapshot
            </Text>

            <Text className="mt-3 text-[42px] leading-[48px] text-white" style={{ fontFamily: BRAND_FONTS.heading }}>
              {tickets.length}
            </Text>

            <Text className="mt-1 text-[13px] text-white/65" style={{ fontFamily: BRAND_FONTS.body }}>
              Tickets in current view
            </Text>

            <View className="gap-3 mt-5">
              {[
                { label: 'Active', value: summary.active, icon: 'activity' as const },
                { label: 'Resolved', value: summary.resolved, icon: 'check-circle' as const },
                { label: 'Closed', value: summary.closed, icon: 'lock' as const },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-black/10">
                  <View className="flex-row items-center gap-3">
                    <Feather name={item.icon} size={15} color="#F1DAC5" />
                    <Text className="text-[13px] text-[#F7E7D8]" style={{ fontFamily: BRAND_FONTS.body }}>
                      {item.label}
                    </Text>
                  </View>

                  <Text className="text-[15px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        }
      >
        <CustomerSectionCard title="Filter conversations" subtitle="Switch between active, pending, resolved, and closed tickets.">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
            {FILTERS.map((item) => {
              const active = item === filter;
              const color = STATUS_COLORS[item] ?? BROWN.DarkColor;

              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  className="flex-row items-center gap-2 px-4 py-3 border rounded-full"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.82 : 1,
                    borderColor: active ? color : '#EAD7C3',
                    backgroundColor: active ? '#2B1E16' : '#FFFAF5',
                  })}
                >
                  <Feather name={item === 'all' ? 'layers' : STATUS_ICONS[item]} size={13} color={active ? '#FFFFFF' : color} />

                  <Text
                    className="text-[12px] font-bold capitalize"
                    style={{
                      fontFamily: BRAND_FONTS.body,
                      color: active ? '#FFFFFF' : BROWN.TextSecondary,
                    }}
                  >
                    {formatLabel(item)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </CustomerSectionCard>

        <CustomerSectionCard title="Ticket history" subtitle="Open a ticket to read the conversation and send a reply.">
          {loading ? (
            <View className="items-center justify-center py-14">
              <ActivityIndicator color={BROWN.DarkColor} size="large" />
              <Text className="mt-4 text-[14px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                Loading support tickets...
              </Text>
            </View>
          ) : tickets.length === 0 ? (
            <View className="items-center rounded-[28px] bg-[#F8EFE6] px-6 py-12">
              <View className="items-center justify-center w-20 h-20 bg-white rounded-full">
                <Feather name="message-square" size={34} color={BROWN.lightColor} />
              </View>

              <Text className="mt-5 text-center text-[25px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                No tickets found
              </Text>

              <Text className="mt-2 max-w-[340px] text-center text-[14px] leading-6 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                Open a support ticket whenever you need help with sizing, shipping, payments, or custom jewellery.
              </Text>

              <Pressable onPress={openCreateModal} className="mt-6 rounded-full bg-[#2B1E16] px-7 py-3">
                <Text className="text-[13px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                  Create Ticket
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              {tickets.map((ticket) => {
                const color = STATUS_COLORS[ticket.status] ?? BROWN.TextSecondary;
                const icon = STATUS_ICONS[ticket.status] ?? 'message-circle';

                return (
                  <Pressable
                    key={ticket._id}
                    onPress={() => openTicket(ticket._id)}
                    className="overflow-hidden rounded-[30px] border border-[#EAD7C3] bg-[#FFFAF5] p-5"
                    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                  >
                    <View className="absolute w-24 h-24 rounded-full -right-8 -top-8" style={{ backgroundColor: `${color}10` }} />

                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="text-[11px] uppercase tracking-[2px] text-[#A16D52]" style={{ fontFamily: BRAND_FONTS.body }}>
                          {ticket.ticketNumber}
                        </Text>

                        <Text className="mt-2 text-[24px] leading-[31px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                          {ticket.subject}
                        </Text>

                        <Text className="mt-2 text-[13px] capitalize text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                          {formatLabel(ticket.category)} · {formatLabel(ticket.priority || 'normal')} priority
                        </Text>

                        <Text className="mt-1 text-[12px] text-[#9A7B68]" style={{ fontFamily: BRAND_FONTS.body }}>
                          Last update {formatDate(ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt)}
                        </Text>
                      </View>

                      <View className="items-end gap-2">
                        <View className="flex-row items-center gap-2 px-3 py-2 rounded-full" style={{ backgroundColor: `${color}15` }}>
                          <Feather name={icon} size={13} color={color} />
                          <Text className="text-[11px] font-bold capitalize" style={{ fontFamily: BRAND_FONTS.body, color }}>
                            {formatLabel(ticket.status)}
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <Text className="text-[11px] text-[#9A7B68]" style={{ fontFamily: BRAND_FONTS.body }}>
                            Open thread
                          </Text>
                          <Feather name="chevron-right" size={13} color="#9A7B68" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </CustomerSectionCard>
      </CustomerPageFrame>

      {/* CREATE TICKET MODAL */}
      <Modal visible={createVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setCreateVisible(false)}>
        <View className="justify-end flex-1 bg-black/60">
          <View className="max-h-[94%] rounded-t-[38px] bg-[#FFF9F3] px-5 pb-8 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1">
                <Text className="text-[27px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                  Create Support Ticket
                </Text>
                <Text className="mt-1 text-[13px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Tell us how we can help with your handmade jewellery order.
                </Text>
              </View>

              <Pressable onPress={() => setCreateVisible(false)} className="h-11 w-11 items-center justify-center rounded-full bg-[#F6ECDF]">
                <Feather name="x" size={21} color={BROWN.TextPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
              <LuxuryInput
                label="Full Name"
                icon="user"
                value={createForm.customerName}
                onChangeText={(v) => setCreateForm((p) => ({ ...p, customerName: v }))}
                placeholder="Your full name"
              />

              <LuxuryInput
                label="Email"
                icon="mail"
                value={createForm.customerEmail}
                onChangeText={(v) => setCreateForm((p) => ({ ...p, customerEmail: v }))}
                placeholder="your@email.com"
                keyboardType="email-address"
              />

              <LuxuryInput
                label="Phone Optional"
                icon="phone"
                value={createForm.customerPhone}
                onChangeText={(v) => setCreateForm((p) => ({ ...p, customerPhone: v }))}
                placeholder="+94..."
                keyboardType="phone-pad"
              />

              <LuxuryInput
                label="Subject"
                icon="edit-3"
                value={createForm.subject}
                onChangeText={(v) => setCreateForm((p) => ({ ...p, subject: v }))}
                placeholder="Example: Issue with my bracelet order"
              />

              <View className="gap-2">
                <Text className="text-[11px] uppercase tracking-[2px] text-[#8A6A56]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Category
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((item) => {
                    const active = createForm.category === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => setCreateForm((p) => ({ ...p, category: item }))}
                        className="rounded-full border px-4 py-2.5"
                        style={{
                          borderColor: active ? BROWN.DarkColor : '#EAD7C3',
                          backgroundColor: active ? '#2B1E16' : '#FFFAF5',
                        }}
                      >
                        <Text
                          className="text-[12px] font-bold"
                          style={{
                            fontFamily: BRAND_FONTS.body,
                            color: active ? '#FFFFFF' : '#765F50',
                          }}
                        >
                          {formatLabel(item)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-[11px] uppercase tracking-[2px] text-[#8A6A56]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Priority
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {PRIORITIES.map((item) => {
                    const active = createForm.priority === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => setCreateForm((p) => ({ ...p, priority: item }))}
                        className="rounded-full border px-4 py-2.5"
                        style={{
                          borderColor: active ? '#C1622F' : '#EAD7C3',
                          backgroundColor: active ? '#F6ECDF' : '#FFFAF5',
                        }}
                      >
                        <Text className="text-[12px] font-bold" style={{ fontFamily: BRAND_FONTS.body, color: active ? '#714329' : '#765F50' }}>
                          {formatLabel(item)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <LuxuryInput
                label="Message"
                icon="message-square"
                value={createForm.message}
                onChangeText={(v) => setCreateForm((p) => ({ ...p, message: v }))}
                placeholder="Write your issue clearly..."
                multiline
              />

              <Pressable
                onPress={handleCreateTicket}
                disabled={creating}
                className="items-center py-4 rounded-full"
                style={({ pressed }) => ({
                  backgroundColor: '#2B1E16',
                  opacity: pressed || creating ? 0.75 : 1,
                })}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                    Submit Ticket
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* THREAD MODAL */}
      <Modal visible={threadVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setThreadVisible(false)}>
        <View className="justify-end flex-1 bg-black/60">
          <View className="max-h-[92%] rounded-t-[38px] bg-[#FFF9F3] px-5 pb-8 pt-6">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1">
                <Text className="text-[25px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                  {selectedTicket?.ticketNumber || 'Ticket Thread'}
                </Text>
                <Text className="mt-1 text-[12px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Conversation details
                </Text>
              </View>

              <Pressable onPress={() => setThreadVisible(false)} className="h-11 w-11 items-center justify-center rounded-full bg-[#F6ECDF]">
                <Feather name="x" size={21} color={BROWN.TextPrimary} />
              </Pressable>
            </View>

            {detailLoading ? (
              <View className="items-center justify-center py-14">
                <ActivityIndicator color={BROWN.DarkColor} size="large" />
              </View>
            ) : selectedTicket ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
                <View className="rounded-[26px] bg-[#F6ECDF] p-5">
                  <Text className="text-[22px] leading-[29px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                    {selectedTicket.subject}
                  </Text>
                  <Text className="mt-2 text-[12px] capitalize text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                    {formatLabel(selectedTicket.category)} · {formatLabel(selectedTicket.priority)} · {formatLabel(selectedTicket.status)}
                  </Text>
                </View>

                {selectedTicket.messages?.map((message: any) => {
                  const isCustomer = message.senderType === 'customer';

                  return (
                    <View
                      key={message._id}
                      className={`max-w-[86%] rounded-[22px] border px-4 py-4 ${isCustomer ? 'self-end' : 'self-start'}`}
                      style={{
                        backgroundColor: isCustomer ? '#2B1E16' : '#FFFFFF',
                        borderColor: isCustomer ? '#2B1E16' : '#EAD7C3',
                      }}
                    >
                      <Text
                        className="mb-2 text-[12px] font-bold capitalize"
                        style={{
                          fontFamily: BRAND_FONTS.body,
                          color: isCustomer ? '#F1DAC5' : BROWN.DarkColor,
                        }}
                      >
                        {message.senderName || message.senderType}
                      </Text>

                      <Text
                        className="text-[13px] leading-6"
                        style={{
                          fontFamily: BRAND_FONTS.body,
                          color: isCustomer ? '#FFFFFF' : BROWN.TextPrimary,
                        }}
                      >
                        {message.message}
                      </Text>
                    </View>
                  );
                })}

                {selectedTicket.status !== 'closed' ? (
                  <View className="mt-2 gap-3 rounded-[26px] border border-[#EAD7C3] bg-white p-4">
                    <Text className="text-[12px] uppercase tracking-[2px] text-[#8A6A56]" style={{ fontFamily: BRAND_FONTS.body }}>
                      Add Reply
                    </Text>

                    <TextInput
                      value={reply}
                      onChangeText={setReply}
                      placeholder="Write your reply here..."
                      placeholderTextColor="#A58B78"
                      multiline
                      style={{
                        minHeight: 110,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#EAD7C3',
                        backgroundColor: '#FFFAF5',
                        padding: 16,
                        textAlignVertical: 'top',
                        color: BROWN.TextPrimary,
                        fontFamily: BRAND_FONTS.body,
                      }}
                    />

                    <Pressable
                      onPress={sendReply}
                      disabled={sending || !reply.trim()}
                      className="items-center py-4 rounded-full"
                      style={({ pressed }) => ({
                        backgroundColor: '#2B1E16',
                        opacity: pressed || sending || !reply.trim() ? 0.72 : 1,
                      })}
                    >
                      {sending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                          Send Reply
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ) : (
                  <View className="rounded-[22px] bg-[#F6ECDF] px-4 py-4">
                    <Text className="text-center text-[13px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                      This ticket is closed. Please create a new ticket if you need more help.
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}