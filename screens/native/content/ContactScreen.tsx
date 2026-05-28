import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { createSupportTicket } from '@/services/api';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

export default function ContactScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
    subject: '',
    message: '',
  });

  return (
    <AppScreen title="Contact" subtitle="Public contact remains available from the mobile customer surface." canGoBack showPageIntro={false}>
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
            Contact atelier
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Start a conversation without leaving the storefront experience.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          This mobile contact form still creates support tickets in the same backend flow. The redesign only makes it feel like part of the same premium customer journey.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: 'mail', label: 'Fast replies' },
            { icon: 'shield', label: 'Secure support' },
            { icon: 'message-circle', label: 'Ticket linked' },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 6 }}>
              <Feather name={item.icon as any} size={16} color={nativeTheme.colors.accent} />
              <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionCard title="Send a message" subtitle="The native contact flow creates the same support tickets already used by the existing system.">
        <View style={{ gap: 12 }}>
        <FormField label="Name" value={form.name} onChangeText={(value) => setForm((current) => ({ ...current, name: value }))} placeholder="Your name" icon="user" autoCapitalize="words" />
        <FormField label="Email" value={form.email} onChangeText={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="Email address" icon="mail" keyboardType="email-address" />
        <FormField label="Phone" value={form.phone} onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))} placeholder="Phone number" icon="phone" keyboardType="phone-pad" />
        <FormField label="Subject" value={form.subject} onChangeText={(value) => setForm((current) => ({ ...current, subject: value }))} placeholder="Subject" icon="message-circle" autoCapitalize="sentences" />
        <FormField label="Message" value={form.message} onChangeText={(value) => setForm((current) => ({ ...current, message: value }))} placeholder="How can we help?" icon="edit" multiline autoCapitalize="sentences" />
        <AppButton
          label="Send message"
          icon="send"
          onPress={async () => {
            await createSupportTicket({
              customerName: form.name.trim(),
              customerEmail: form.email.trim(),
              customerPhone: form.phone.trim() || undefined,
              subject: form.subject.trim(),
              message: form.message.trim(),
              category: 'general',
              priority: 'normal',
              source: 'contact_form',
            });
            if (auth.userToken) {
              router.push('/support-tickets' as never);
            }
          }}
        />
        </View>
      </SectionCard>
    </AppScreen>
  );
}