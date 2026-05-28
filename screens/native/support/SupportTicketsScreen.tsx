import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import useProtectedRoute from '@/hooks/useProtectedRoute';
import { createSupportTicket, getMySupportTicketById, getMySupportTickets, replyMySupportTicket } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

export default function SupportTicketsScreen() {
  const auth = useProtectedRoute();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [createForm, setCreateForm] = useState({
    customerName: auth.user?.name || '',
    customerEmail: auth.user?.email || '',
    customerPhone: auth.user?.phone || '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'normal',
  });
  const [reply, setReply] = useState('');

  const loadTickets = useCallback(async () => {
    if (!auth.userToken) {
      return;
    }

    try {
      const response = await getMySupportTickets({ page: 1, limit: 20 });
      setTickets(Array.isArray(response.data?.tickets) ? response.data.tickets : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [auth.userToken]);

  useFocusEffect(
    React.useCallback(() => {
      if (!auth.isAuthorized) {
        return;
      }

      setLoading(true);
      loadTickets();
    }, [auth.isAuthorized, loadTickets]),
  );

  if (auth.shouldBlock || loading) {
    return (
      <AppScreen title="Support" subtitle="Open and track support tickets from the native app." showBottomNav={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={nativeTheme.colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Support" subtitle="Create tickets and keep conversations alive from the APK." showPageIntro={false}>
      <View
        style={{
          borderRadius: 32,
          overflow: 'hidden',
          backgroundColor: nativeTheme.colors.primaryDark,
          padding: 22,
          gap: 18,
          ...nativeTheme.shadows.strong,
        }}
      >
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
            Customer care
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Reach support without breaking the boutique flow.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          Ticket creation, ticket threads, and replies still use the same backend support system. This pass only brings the mobile UI in line with the storefront redesign.
        </Text>
      </View>

      <SectionCard title="Create a ticket" subtitle="This form uses the same support ticket creation endpoint already available today.">
        <View style={{ gap: 12 }}>
          <FormField label="Name" value={createForm.customerName} onChangeText={(value) => setCreateForm((current) => ({ ...current, customerName: value }))} placeholder="Your name" icon="user" autoCapitalize="words" />
          <FormField label="Email" value={createForm.customerEmail} onChangeText={(value) => setCreateForm((current) => ({ ...current, customerEmail: value }))} placeholder="Email address" icon="mail" keyboardType="email-address" />
          <FormField label="Subject" value={createForm.subject} onChangeText={(value) => setCreateForm((current) => ({ ...current, subject: value }))} placeholder="What do you need help with?" icon="message-circle" autoCapitalize="sentences" />
          <FormField label="Message" value={createForm.message} onChangeText={(value) => setCreateForm((current) => ({ ...current, message: value }))} placeholder="Describe the issue" icon="edit" multiline autoCapitalize="sentences" />
          <AppButton
            label="Submit ticket"
            icon="send"
            onPress={async () => {
              await createSupportTicket({ ...createForm, source: 'profile' as const });
              setCreateForm((current) => ({ ...current, subject: '', message: '' }));
              await loadTickets();
            }}
          />
        </View>
      </SectionCard>

      <SectionCard title="My tickets" subtitle="Open a thread and continue the conversation on mobile.">
        <View style={{ gap: 12 }}>
          {tickets.length > 0 ? tickets.map((ticket) => (
            <View key={String(ticket._id)} style={{ borderRadius: nativeTheme.radius.lg, borderWidth: 1, borderColor: selectedTicket?._id === ticket._id ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.08)', backgroundColor: selectedTicket?._id === ticket._id ? 'rgba(113, 67, 41, 0.1)' : 'rgba(255,255,255,0.72)', overflow: 'hidden' }}>
              <AppButton
                label={`${ticket.ticketNumber || 'Ticket'} • ${String(ticket.status || '').replace(/_/g, ' ')}`}
                icon="message-square"
                variant={selectedTicket?._id === ticket._id ? 'primary' : 'secondary'}
                onPress={async () => {
                  const response = await getMySupportTicketById(ticket._id);
                  setSelectedTicket(response.data?.ticket || null);
                }}
              />
            </View>
          )) : <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body }}>No tickets yet.</Text>}
        </View>
      </SectionCard>

      {selectedTicket ? (
        <SectionCard title={selectedTicket.ticketNumber || 'Ticket thread'} subtitle={`${selectedTicket.subject || ''} • ${String(selectedTicket.status || '').replace(/_/g, ' ')}`}>
          <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 10 }}>
            {(selectedTicket.messages || []).map((message: any, index: number) => (
              <View key={`${message?.createdAt || 'msg'}-${index}`} style={{ padding: 12, borderRadius: nativeTheme.radius.lg, backgroundColor: message?.senderRole === 'customer' ? nativeTheme.colors.cardStrong : '#f0f4fb' }}>
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{message?.senderRole || 'support'}</Text>
                <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>{message?.message || ''}</Text>
              </View>
            ))}
          </ScrollView>
          {selectedTicket.status !== 'closed' ? (
            <View style={{ gap: 12 }}>
              <FormField label="Reply" value={reply} onChangeText={setReply} placeholder="Write your reply" icon="send" multiline autoCapitalize="sentences" />
              <AppButton
                label="Send reply"
                icon="send"
                onPress={async () => {
                  if (!reply.trim()) {
                    return;
                  }
                  const response = await replyMySupportTicket(selectedTicket._id, { message: reply.trim() });
                  setSelectedTicket(response.data?.ticket || selectedTicket);
                  setReply('');
                  await loadTickets();
                }}
              />
            </View>
          ) : null}
        </SectionCard>
      ) : null}
    </AppScreen>
  );
}