import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import useProtectedRoute from '@/hooks/useProtectedRoute';
import {
  addAddress,
  changeMyPassword,
  deleteAddress,
  getAddresses,
  getMyProfile,
  setDefaultAddress,
  updateAddress,
  updateMyProfile,
} from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useFocusEffect } from 'expo-router';
import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { FormField } from '@/screens/native/shared/FormField';
import { SectionCard } from '@/screens/native/shared/SectionCard';
import { nativeTheme } from '@/screens/native/theme';

function ProfileStat({ label, value, icon }: { label: string; value: string | number; icon: keyof typeof Feather.glyphMap }) {
  return (
    <View style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', gap: 6 }}>
      <Feather name={icon} size={16} color={nativeTheme.colors.accent} />
      <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 24 }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.72)', fontFamily: nativeTheme.fonts.body, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const EMPTY_ADDRESS = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Sri Lanka',
  isDefault: false,
};

export default function ProfileScreen() {
  const auth = useProtectedRoute();
  const { updateUser, logout } = auth;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!auth.userToken) {
      return;
    }

    try {
      const [profileRes, addressesRes] = await Promise.all([getMyProfile(), getAddresses()]);
      const user = profileRes.data;
      const nextAddresses = Array.isArray(addressesRes.data) ? addressesRes.data : [];

      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      setAddresses(nextAddresses);
      updateUser(user);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [auth.userToken, updateUser]);

  useFocusEffect(
    React.useCallback(() => {
      if (!auth.isAuthorized) {
        return;
      }

      setLoading(true);
      loadProfile();
    }, [auth.isAuthorized, loadProfile]),
  );

  const defaultAddress = useMemo(() => addresses.find((item) => item.isDefault) || addresses[0], [addresses]);

  if (auth.shouldBlock || loading) {
    return (
      <AppScreen title="Profile" subtitle="Manage customer details, password, and addresses from the APK." showBottomNav={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={nativeTheme.colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Profile" subtitle="Use the same profile, password, and address endpoints already available to the web app." showPageIntro={false} scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
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
            Client profile
          </Text>
        </View>
        <Text style={{ color: nativeTheme.colors.white, fontFamily: nativeTheme.fonts.heading, fontSize: 34, lineHeight: 40 }}>
          Keep your account, address book, and security details beautifully organized.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.78)', fontFamily: nativeTheme.fonts.body, fontSize: 14, lineHeight: 22 }}>
          This screen still updates the same customer profile and address endpoints. The redesign only makes the mobile account area feel consistent with the storefront.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ProfileStat label="Addresses" value={addresses.length} icon="map-pin" />
          <ProfileStat label="Default set" value={defaultAddress ? 'Yes' : 'No'} icon="home" />
          <ProfileStat label="Account" value="Live" icon="shield" />
        </View>
      </View>

      <SectionCard title="Account details" subtitle="Update your name, email, and phone number.">
        <View style={{ gap: 12 }}>
          <FormField label="Name" value={profile.name} onChangeText={(value) => setProfile((current) => ({ ...current, name: value }))} placeholder="Your full name" icon="user" autoCapitalize="words" />
          <FormField label="Email" value={profile.email} onChangeText={(value) => setProfile((current) => ({ ...current, email: value }))} placeholder="name@example.com" icon="mail" keyboardType="email-address" />
          <FormField label="Phone" value={profile.phone} onChangeText={(value) => setProfile((current) => ({ ...current, phone: value }))} placeholder="Phone number" icon="phone" keyboardType="phone-pad" />
          <AppButton
            label="Save profile"
            icon="save"
            loading={saving}
            onPress={async () => {
              setSaving(true);
              try {
                const response = await updateMyProfile(profile);
                updateUser(response.data?.user || profile);
                showToast('Profile updated', 'success');
              } catch {
                showToast('Profile update failed', 'error');
              } finally {
                setSaving(false);
              }
            }}
          />
        </View>
      </SectionCard>

      <SectionCard title="Change password" subtitle="Use the existing password update endpoint without leaving the native surface.">
        <View style={{ gap: 12 }}>
          <FormField label="Current password" value={passwords.currentPassword} onChangeText={(value) => setPasswords((current) => ({ ...current, currentPassword: value }))} placeholder="Current password" icon="lock" secureTextEntry />
          <FormField label="New password" value={passwords.newPassword} onChangeText={(value) => setPasswords((current) => ({ ...current, newPassword: value }))} placeholder="New password" icon="shield" secureTextEntry />
          <AppButton
            label="Update password"
            icon="key"
            variant="secondary"
            onPress={async () => {
              try {
                await changeMyPassword(passwords);
                setPasswords({ currentPassword: '', newPassword: '' });
                showToast('Password updated', 'success');
              } catch {
                showToast('Password update failed', 'error');
              }
            }}
          />
        </View>
      </SectionCard>

      <SectionCard title="Address book" subtitle="Edit the same customer addresses used by checkout.">
        <View style={{ gap: 12 }}>
          {defaultAddress ? (
            <View style={{ padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong }}>
              <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{defaultAddress.fullName}</Text>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{defaultAddress.addressLine1}, {defaultAddress.city}</Text>
            </View>
          ) : null}

          <FormField label="Address label" value={addressForm.label} onChangeText={(value) => setAddressForm((current) => ({ ...current, label: value }))} placeholder="Home, Office, etc." icon="map-pin" autoCapitalize="words" />
          <FormField label="Full name" value={addressForm.fullName} onChangeText={(value) => setAddressForm((current) => ({ ...current, fullName: value }))} placeholder="Recipient name" icon="user" autoCapitalize="words" />
          <FormField label="Phone" value={addressForm.phone} onChangeText={(value) => setAddressForm((current) => ({ ...current, phone: value }))} placeholder="Phone number" icon="phone" keyboardType="phone-pad" />
          <FormField label="Address line 1" value={addressForm.addressLine1} onChangeText={(value) => setAddressForm((current) => ({ ...current, addressLine1: value }))} placeholder="Street address" icon="home" autoCapitalize="words" />
          <FormField label="City" value={addressForm.city} onChangeText={(value) => setAddressForm((current) => ({ ...current, city: value }))} placeholder="City" icon="map" autoCapitalize="words" />
          <FormField label="State" value={addressForm.state} onChangeText={(value) => setAddressForm((current) => ({ ...current, state: value }))} placeholder="State or province" icon="navigation" autoCapitalize="words" />
          <FormField label="ZIP code" value={addressForm.zipCode} onChangeText={(value) => setAddressForm((current) => ({ ...current, zipCode: value }))} placeholder="Postal code" icon="hash" />

          <AppButton
            label={editingAddressId ? 'Update address' : 'Save address'}
            icon="save"
            onPress={async () => {
              try {
                if (editingAddressId) {
                  await updateAddress(editingAddressId, addressForm);
                } else {
                  await addAddress(addressForm);
                }
                setAddressForm(EMPTY_ADDRESS);
                setEditingAddressId(null);
                await loadProfile();
                showToast('Address saved', 'success');
              } catch {
                showToast('Address save failed', 'error');
              }
            }}
          />

          {addresses.map((address) => (
            <View key={String(address._id)} style={{ padding: 14, borderRadius: nativeTheme.radius.lg, borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)', backgroundColor: 'rgba(255,255,255,0.72)', gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>{address.label || 'Address'}</Text>
                {address.isDefault ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: nativeTheme.radius.pill, backgroundColor: 'rgba(40,116,90,0.14)' }}>
                    <Text style={{ color: nativeTheme.colors.success, fontFamily: nativeTheme.fonts.body, fontSize: 11, fontWeight: '700' }}>Default</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13 }}>{address.addressLine1}, {address.city}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <AppButton label="Edit" icon="edit-3" variant="secondary" onPress={() => { setEditingAddressId(String(address._id)); setAddressForm({ ...EMPTY_ADDRESS, ...address }); }} style={{ flex: 1 }} />
                <AppButton label="Default" icon="check-circle" variant="ghost" onPress={async () => { await setDefaultAddress(address._id); await loadProfile(); }} style={{ flex: 1 }} />
                <AppButton label="Delete" icon="trash-2" variant="danger" onPress={async () => { await deleteAddress(address._id); await loadProfile(); }} style={{ flex: 1 }} />
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      <AppButton label="Log out" icon="log-out" variant="danger" onPress={() => { logout(); showToast('Logged out', 'info'); }} />
      </ScrollView>
    </AppScreen>
  );
}