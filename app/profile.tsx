import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { useToast } from '@/context/ToastContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import {
  addAddress,
  changeMyPassword,
  deleteAddress,
  getAddresses,
  getApiErrorMessage,
  getMyProfile,
  setDefaultAddress,
  updateAddress,
  updateMyProfile,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

type AddressForm = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY_ADDRESS: AddressForm = {
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

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[+]?[0-9()\-\s]{7,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
}) {
  return (
    <View className="gap-2">
      <Text
        className="text-[12px] uppercase tracking-[1.8px] text-[#8A6A56]"
        style={{ fontFamily: BRAND_FONTS.body }}
      >
        {label}
      </Text>

      <View className="flex-row items-center gap-3 rounded-2xl border border-[#EAD7C3] bg-[#FFFAF5] px-4 py-1">
        <Feather name={icon} size={16} color={BROWN.DarkColor} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A58B78"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          className="min-h-[48px] flex-1 text-[14px] text-[#2B1E16] outline-none"
          style={{ fontFamily: BRAND_FONTS.body }}
        />
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  loading,
  variant = 'dark',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'dark' | 'light' | 'danger';
}) {
  const bg =
    variant === 'danger' ? '#FFF4F4' : variant === 'light' ? '#F6ECDF' : '#2B1E16';
  const color =
    variant === 'danger' ? '#B91C1C' : variant === 'light' ? BROWN.DarkColor : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="items-center rounded-full px-5 py-3.5"
      style={({ pressed }) => ({
        backgroundColor: bg,
        opacity: pressed || loading ? 0.78 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text className="text-[13px] font-bold" style={{ color, fontFamily: BRAND_FONTS.body }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { scrollY, onScroll } = useHeaderScroll();
  const auth = useProtectedRoute();
  const { logout, updateUser, userToken } = auth;
  const { showToast } = useToast();

  const isWide = width >= 1050;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState<AddressForm>(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0],
    [addresses],
  );

  const loadProfile = useCallback(async () => {
    if (!userToken) return;

    try {
      const [profileRes, addressesRes] = await Promise.all([getMyProfile(), getAddresses()]);
      const user = profileRes.data;
      const nextAddresses = addressesRes.data || [];

      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });

      setAddresses(nextAddresses);

      updateUser({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        addresses: nextAddresses,
      });
    } catch (error) {
      showToast('Profile load failed', 'error', {
        subMessage: getApiErrorMessage(error, 'Failed to load profile.'),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast, updateUser, userToken]);

  useFocusEffect(
    useCallback(() => {
      if (!auth.isAuthorized) return;

      setLoading(true);
      loadProfile();
    }, [auth.isAuthorized, loadProfile]),
  );

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      showToast('Profile details are incomplete', 'warning', {
        subMessage: 'Name and email are required.',
      });
      return;
    }

    if (!EMAIL_REGEX.test(profile.email.trim())) {
      showToast('Invalid email format', 'error');
      return;
    }

    if (profile.phone.trim() && !PHONE_REGEX.test(profile.phone.trim())) {
      showToast('Invalid phone format', 'error');
      return;
    }

    setSavingProfile(true);

    try {
      const { data } = await updateMyProfile(profile);

      setProfile({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
      });

      updateUser(data.user);

      showToast('Profile updated', 'success', {
        subMessage: 'Your account details were saved successfully.',
      });
    } catch (error) {
      showToast('Profile update failed', 'error', {
        subMessage: getApiErrorMessage(error, 'Failed to update profile.'),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      showToast('Password details are incomplete', 'warning', {
        subMessage: 'Current password and new password are required.',
      });
      return;
    }

    if (!PASSWORD_REGEX.test(passwordForm.newPassword.trim())) {
      showToast('Password is too weak', 'error', {
        subMessage: 'Use at least 8 characters with uppercase, lowercase, and a number.',
      });
      return;
    }

    setSavingPassword(true);

    try {
      await changeMyPassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      showToast('Password changed', 'success');
    } catch (error) {
      showToast('Password change failed', 'error', {
        subMessage: getApiErrorMessage(error, 'Failed to change password.'),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveAddress = async () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.addressLine1 ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.zipCode ||
      !addressForm.country
    ) {
      showToast('Address details are incomplete', 'warning', {
        subMessage: 'Street, city, state, postal code, country, and phone are required.',
      });
      return;
    }

    if (!PHONE_REGEX.test(addressForm.phone.trim())) {
      showToast('Invalid phone format', 'error');
      return;
    }

    setSavingAddress(true);

    try {
      const request = editingAddressId
        ? updateAddress(editingAddressId, addressForm)
        : addAddress(addressForm);

      const { data } = await request;

      setAddresses(data.addresses || []);
      setAddressForm(EMPTY_ADDRESS);
      setEditingAddressId(null);
      updateUser({ addresses: data.addresses || [] });

      showToast(editingAddressId ? 'Address updated' : 'Address added', 'success');
    } catch (error) {
      showToast('Address save failed', 'error', {
        subMessage: getApiErrorMessage(error, 'Failed to save address.'),
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || 'Address',
      fullName: address.fullName || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'Sri Lanka',
      isDefault: !!address.isDefault,
    });
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data } = await deleteAddress(id);
            setAddresses(data.addresses || []);
            updateUser({ addresses: data.addresses || [] });
            showToast('Address deleted', 'success');
          } catch (error) {
            showToast('Address delete failed', 'error', {
              subMessage: getApiErrorMessage(error, 'Failed to delete address.'),
            });
          }
        },
      },
    ]);
  };

  const handleDefaultAddress = async (id: string) => {
    try {
      const { data } = await setDefaultAddress(id);
      setAddresses(data.addresses || []);
      updateUser({ addresses: data.addresses || [] });
      showToast('Default address updated', 'success');
    } catch (error) {
      showToast('Default address update failed', 'error', {
        subMessage: getApiErrorMessage(error, 'Failed to set default address.'),
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login' as any);
  };

  if (auth.shouldBlock || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7EFE7]">
        <ActivityIndicator size="large" color={BROWN.DarkColor} />
        <Text className="mt-4 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <CustomerPageFrame
      scrollY={scrollY}
      onScroll={onScroll}
      eyebrow="Customer Profile"
      title="Your personal atelier profile."
      subtitle="Manage account details, delivery addresses, password security, and support access for your handmade jewellery purchases."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadProfile();
          }}
          tintColor={BROWN.DarkColor}
        />
      }
      sidebar={<CustomerSidebar />}
      actions={
        <>
          <Pressable
            onPress={() => router.push('/support-tickets' as any)}
            className="px-5 py-3 bg-white rounded-full"
          >
            <Text className="text-[14px] font-bold text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.body }}>
              My Tickets
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            className="px-5 py-3 border rounded-full border-white/25 bg-white/10"
          >
            <Text className="text-[14px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
              Logout
            </Text>
          </Pressable>
        </>
      }
      heroAside={
        <View className="overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5">
          <View className="absolute rounded-full -right-8 -top-8 h-28 w-28 bg-white/10" />

          <Text className="text-[11px] uppercase tracking-[2.4px] text-[#F1DAC5]" style={{ fontFamily: BRAND_FONTS.body }}>
            Account Snapshot
          </Text>

          <Text className="mt-3 text-[27px] leading-[34px] text-white" style={{ fontFamily: BRAND_FONTS.heading }}>
            {profile.name || 'Customer'}
          </Text>

          <Text className="mt-1 text-[13px] text-white/65" style={{ fontFamily: BRAND_FONTS.body }}>
            {profile.email}
          </Text>

          <View className="gap-3 mt-6">
            {[
              { label: 'Saved Addresses', value: String(addresses.length), icon: 'map-pin' as const },
              { label: 'Default Address', value: defaultAddress ? 'Ready' : 'None', icon: 'check-circle' as const },
              { label: 'Phone', value: profile.phone ? 'Added' : 'Missing', icon: 'phone' as const },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-black/10">
                <View className="flex-row items-center gap-3">
                  <Feather name={item.icon} size={15} color="#F1DAC5" />
                  <Text className="text-[13px] text-[#F7E7D8]" style={{ fontFamily: BRAND_FONTS.body }}>
                    {item.label}
                  </Text>
                </View>

                <Text className="text-[13px] font-bold text-white" style={{ fontFamily: BRAND_FONTS.body }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      }
    >
      <View className={isWide ? 'flex-row items-start gap-6' : 'gap-6'}>
        <View className="flex-1 gap-6">
          <CustomerSectionCard
            title="Profile details"
            subtitle="Keep your account details updated for checkout, delivery updates, and order support."
          >
            <View className="gap-4">
              <Field
                label="Full Name"
                icon="user"
                value={profile.name}
                onChangeText={(value) => setProfile((prev) => ({ ...prev, name: value }))}
                placeholder="Your full name"
              />

              <Field
                label="Email"
                icon="mail"
                value={profile.email}
                onChangeText={(value) => setProfile((prev) => ({ ...prev, email: value }))}
                placeholder="your@email.com"
                keyboardType="email-address"
              />

              <Field
                label="Phone"
                icon="phone"
                value={profile.phone}
                onChangeText={(value) => setProfile((prev) => ({ ...prev, phone: value }))}
                placeholder="+94..."
                keyboardType="phone-pad"
              />

              <PrimaryButton label="Save Profile" onPress={handleSaveProfile} loading={savingProfile} />
            </View>
          </CustomerSectionCard>

          <CustomerSectionCard
            title={editingAddressId ? 'Edit delivery address' : 'Add delivery address'}
            subtitle="Save a delivery location to make your jewellery checkout faster and smoother."
          >
            <View className="gap-4">
              <View className={isWide ? 'flex-row gap-4' : 'gap-4'}>
                <View className="flex-1">
                  <Field
                    label="Label"
                    icon="tag"
                    value={addressForm.label}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, label: value }))}
                    placeholder="Home, Office"
                  />
                </View>

                <View className="flex-1">
                  <Field
                    label="Receiver Name"
                    icon="user"
                    value={addressForm.fullName}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, fullName: value }))}
                    placeholder="Receiver full name"
                  />
                </View>
              </View>

              <Field
                label="Phone"
                icon="phone"
                value={addressForm.phone}
                onChangeText={(value) => setAddressForm((prev) => ({ ...prev, phone: value }))}
                placeholder="Delivery phone number"
                keyboardType="phone-pad"
              />

              <Field
                label="Address Line 1"
                icon="home"
                value={addressForm.addressLine1}
                onChangeText={(value) => setAddressForm((prev) => ({ ...prev, addressLine1: value }))}
                placeholder="Street address"
              />

              <Field
                label="Address Line 2"
                icon="map"
                value={addressForm.addressLine2}
                onChangeText={(value) => setAddressForm((prev) => ({ ...prev, addressLine2: value }))}
                placeholder="Apartment, suite, landmark"
              />

              <View className={isWide ? 'flex-row gap-4' : 'gap-4'}>
                <View className="flex-1">
                  <Field
                    label="City"
                    icon="map-pin"
                    value={addressForm.city}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, city: value }))}
                    placeholder="City"
                  />
                </View>

                <View className="flex-1">
                  <Field
                    label="State / Province"
                    icon="navigation"
                    value={addressForm.state}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, state: value }))}
                    placeholder="State"
                  />
                </View>
              </View>

              <View className={isWide ? 'flex-row gap-4' : 'gap-4'}>
                <View className="flex-1">
                  <Field
                    label="Postal Code"
                    icon="hash"
                    value={addressForm.zipCode}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, zipCode: value }))}
                    placeholder="Postal code"
                  />
                </View>

                <View className="flex-1">
                  <Field
                    label="Country"
                    icon="globe"
                    value={addressForm.country}
                    onChangeText={(value) => setAddressForm((prev) => ({ ...prev, country: value }))}
                    placeholder="Country"
                  />
                </View>
              </View>

              <Pressable
                onPress={() => setAddressForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                className="flex-row items-center gap-3 rounded-2xl bg-[#F6ECDF] px-4 py-4"
              >
                <Feather
                  name={addressForm.isDefault ? 'check-square' : 'square'}
                  size={18}
                  color={BROWN.DarkColor}
                />
                <Text className="text-[13px] font-bold text-[#714329]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Set as default delivery address
                </Text>
              </Pressable>

              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1">
                  <PrimaryButton
                    label={editingAddressId ? 'Update Address' : 'Add Address'}
                    onPress={handleSaveAddress}
                    loading={savingAddress}
                  />
                </View>

                {editingAddressId ? (
                  <View className="flex-1">
                    <PrimaryButton
                      label="Cancel Edit"
                      variant="light"
                      onPress={() => {
                        setEditingAddressId(null);
                        setAddressForm(EMPTY_ADDRESS);
                      }}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </CustomerSectionCard>
        </View>

        <View className={`${isWide ? 'w-[390px]' : 'w-full'} gap-6`}>
          <CustomerSectionCard
            title="Password security"
            subtitle="Use a strong password with uppercase, lowercase, and a number."
          >
            <View className="gap-4">
              <Field
                label="Current Password"
                icon="lock"
                value={passwordForm.currentPassword}
                onChangeText={(value) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: value }))
                }
                placeholder="Current password"
                secureTextEntry
              />

              <Field
                label="New Password"
                icon="shield"
                value={passwordForm.newPassword}
                onChangeText={(value) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: value }))
                }
                placeholder="New password"
                secureTextEntry
              />

              <PrimaryButton
                label="Update Password"
                onPress={handleChangePassword}
                loading={savingPassword}
              />
            </View>
          </CustomerSectionCard>

          <CustomerSectionCard
            title="Saved addresses"
            subtitle="Choose, edit, or remove your delivery destinations."
          >
            {addresses.length === 0 ? (
              <View className="items-center rounded-[28px] bg-[#F8EFE6] px-6 py-10">
                <View className="items-center justify-center w-16 h-16 bg-white rounded-full">
                  <Feather name="map-pin" size={26} color={BROWN.lightColor} />
                </View>

                <Text className="mt-4 text-center text-[22px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                  No address saved
                </Text>

                <Text className="mt-2 text-center text-[13px] leading-6 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                  Add your first delivery address for faster jewellery checkout.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {addresses.map((address) => (
                  <View key={address._id} className="rounded-[26px] border border-[#EAD7C3] bg-[#FFFAF5] p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-[20px] text-[#2B1E16]" style={{ fontFamily: BRAND_FONTS.heading }}>
                          {address.label || 'Address'}
                        </Text>

                        <Text className="mt-1 text-[13px] font-bold text-[#714329]" style={{ fontFamily: BRAND_FONTS.body }}>
                          {address.fullName}
                        </Text>

                        <Text className="mt-2 text-[13px] leading-6 text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          {'\n'}
                          {[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}
                          {'\n'}
                          {address.country}
                        </Text>

                        <Text className="mt-2 text-[13px] text-[#765F50]" style={{ fontFamily: BRAND_FONTS.body }}>
                          {address.phone}
                        </Text>
                      </View>

                      {address.isDefault ? (
                        <View className="rounded-full bg-[#E9F8EE] px-3 py-1.5">
                          <Text className="text-[10px] font-bold text-[#15803D]" style={{ fontFamily: BRAND_FONTS.body }}>
                            DEFAULT
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View className="flex-row flex-wrap gap-2 mt-4">
                      <Pressable
                        onPress={() => handleEditAddress(address)}
                        className="flex-row items-center gap-2 rounded-full bg-[#F6ECDF] px-4 py-2.5"
                      >
                        <Feather name="edit-2" size={14} color={BROWN.DarkColor} />
                        <Text className="text-[12px] font-bold text-[#714329]" style={{ fontFamily: BRAND_FONTS.body }}>
                          Edit
                        </Text>
                      </Pressable>

                      {!address.isDefault ? (
                        <Pressable
                          onPress={() => handleDefaultAddress(address._id)}
                          className="flex-row items-center gap-2 rounded-full bg-[#E9F8EE] px-4 py-2.5"
                        >
                          <Feather name="check-circle" size={14} color="#15803D" />
                          <Text className="text-[12px] font-bold text-[#15803D]" style={{ fontFamily: BRAND_FONTS.body }}>
                            Default
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        onPress={() => handleDeleteAddress(address._id)}
                        className="flex-row items-center gap-2 rounded-full bg-[#FFF4F4] px-4 py-2.5"
                      >
                        <Feather name="trash-2" size={14} color="#B91C1C" />
                        <Text className="text-[12px] font-bold text-[#B91C1C]" style={{ fontFamily: BRAND_FONTS.body }}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CustomerSectionCard>
        </View>
      </View>
    </CustomerPageFrame>
  );
}