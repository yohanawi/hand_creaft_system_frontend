import { AuthContext } from '@/context/AuthContext';
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
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  country: 'US',
  isDefault: false,
};

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
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

  const loadProfile = useCallback(async () => {
    if (!auth?.userToken) {
      router.replace('/login' as any);
      return;
    }

    try {
      const [profileRes, addressesRes] = await Promise.all([getMyProfile(), getAddresses()]);
      const user = profileRes.data;
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      setAddresses(addressesRes.data || []);
      auth?.updateUser?.({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        addresses: addressesRes.data || [],
      });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth?.userToken, router]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const defaultAddressId = useMemo(
    () => addresses.find((address) => address.isDefault)?._id ?? null,
    [addresses]
  );

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      Alert.alert('Required', 'Name and email are required.');
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
      auth?.updateUser?.(data.user);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      Alert.alert('Required', 'Current password and new password are required.');
      return;
    }

    setSavingPassword(true);
    try {
      await changeMyPassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.zipCode) {
      Alert.alert('Required', 'Please fill in the required address fields.');
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
      auth?.updateUser?.({ addresses: data.addresses || [] });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to save address.');
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
      country: address.country || 'US',
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
            auth?.updateUser?.({ addresses: data.addresses || [] });
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleDefaultAddress = async (id: string) => {
    try {
      const { data } = await setDefaultAddress(id);
      setAddresses(data.addresses || []);
      auth?.updateUser?.({ addresses: data.addresses || [] });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to set default address.');
    }
  };

  const handleLogout = () => {
    auth?.logout();
    router.replace('/login' as any);
  };

  if (!auth?.userToken) {
    router.replace('/login' as any);
    return null;
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F2EA]">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F8F2EA]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B4513" />}
    >
      <View className="px-4 py-10 gap-6">
        <View className="bg-[#8B4513] rounded-3xl p-6">
          <Text className="text-white text-3xl font-bold">My Profile</Text>
          <Text className="text-white/80 mt-2">Manage your account, password, and saved addresses.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 gap-4">
          <Text className="text-[#2C1810] text-xl font-bold">Profile Details</Text>

          <View>
            <Text className="text-[#6B7280] mb-2">Full Name</Text>
            <TextInput value={profile.name} onChangeText={(value) => setProfile((prev) => ({ ...prev, name: value }))} className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
          </View>
          <View>
            <Text className="text-[#6B7280] mb-2">Email</Text>
            <TextInput value={profile.email} onChangeText={(value) => setProfile((prev) => ({ ...prev, email: value }))} autoCapitalize="none" keyboardType="email-address" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
          </View>
          <View>
            <Text className="text-[#6B7280] mb-2">Phone</Text>
            <TextInput value={profile.phone} onChangeText={(value) => setProfile((prev) => ({ ...prev, phone: value }))} keyboardType="phone-pad" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
          </View>

          <TouchableOpacity onPress={handleSaveProfile} disabled={savingProfile} className="bg-[#8B4513] rounded-xl py-4 items-center">
            {savingProfile ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save Profile</Text>}
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-5 gap-4">
          <Text className="text-[#2C1810] text-xl font-bold">Change Password</Text>

          <TextInput
            value={passwordForm.currentPassword}
            onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
            placeholder="Current password"
            secureTextEntry
            className="bg-[#F8F2EA] rounded-xl px-4 py-3"
          />
          <TextInput
            value={passwordForm.newPassword}
            onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
            placeholder="New password"
            secureTextEntry
            className="bg-[#F8F2EA] rounded-xl px-4 py-3"
          />

          <TouchableOpacity onPress={handleChangePassword} disabled={savingPassword} className="bg-[#2C1810] rounded-xl py-4 items-center">
            {savingPassword ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Update Password</Text>}
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-5 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[#2C1810] text-xl font-bold">Saved Addresses</Text>
            <Text className="text-[#8B4513] font-semibold">Default: {defaultAddressId ? 'Selected' : 'None'}</Text>
          </View>

          {addresses.length === 0 ? (
            <Text className="text-[#6B7280]">No saved addresses yet.</Text>
          ) : (
            addresses.map((address) => (
              <View key={address._id} className="bg-[#F8F2EA] rounded-2xl p-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[#2C1810] font-bold">{address.label || 'Address'}</Text>
                    <Text className="text-[#6B7280]">{address.fullName}</Text>
                  </View>
                  {address.isDefault ? (
                    <View className="bg-[#D6F5DF] rounded-full px-3 py-1">
                      <Text className="text-[#166534] text-xs font-bold">Default</Text>
                    </View>
                  ) : null}
                </View>

                <Text className="text-[#374151]">{address.addressLine1}</Text>
                {address.addressLine2 ? <Text className="text-[#374151]">{address.addressLine2}</Text> : null}
                <Text className="text-[#374151]">{address.city}, {address.state} {address.zipCode}</Text>
                <Text className="text-[#374151]">{address.country}</Text>
                <Text className="text-[#374151]">{address.phone}</Text>

                <View className="flex-row flex-wrap gap-3">
                  <TouchableOpacity onPress={() => handleEditAddress(address)} className="bg-white rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="edit-2" size={16} color="#8B4513" />
                    <Text className="ml-2 text-[#8B4513] font-semibold">Edit</Text>
                  </TouchableOpacity>
                  {!address.isDefault ? (
                    <TouchableOpacity onPress={() => handleDefaultAddress(address._id)} className="bg-white rounded-xl px-4 py-3 flex-row items-center">
                      <Feather name="check-circle" size={16} color="#166534" />
                      <Text className="ml-2 text-[#166534] font-semibold">Set Default</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => handleDeleteAddress(address._id)} className="bg-white rounded-xl px-4 py-3 flex-row items-center">
                    <Feather name="trash-2" size={16} color="#DC2626" />
                    <Text className="ml-2 text-[#DC2626] font-semibold">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View className="border-t border-[#EADCCB] pt-4 gap-3">
            <Text className="text-[#2C1810] text-lg font-bold">{editingAddressId ? 'Edit Address' : 'Add Address'}</Text>
            <TextInput value={addressForm.label} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, label: value }))} placeholder="Label" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.fullName} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, fullName: value }))} placeholder="Full name" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.phone} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, phone: value }))} placeholder="Phone" keyboardType="phone-pad" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.addressLine1} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, addressLine1: value }))} placeholder="Address line 1" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.addressLine2} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, addressLine2: value }))} placeholder="Address line 2" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.city} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, city: value }))} placeholder="City" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.state} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, state: value }))} placeholder="State" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.zipCode} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, zipCode: value }))} placeholder="ZIP code" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />
            <TextInput value={addressForm.country} onChangeText={(value) => setAddressForm((prev) => ({ ...prev, country: value }))} placeholder="Country" className="bg-[#F8F2EA] rounded-xl px-4 py-3" />

            <TouchableOpacity
              onPress={() => setAddressForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
              className="flex-row items-center"
            >
              <Feather name={addressForm.isDefault ? 'check-square' : 'square'} size={18} color="#8B4513" />
              <Text className="ml-2 text-[#8B4513] font-semibold">Set as default address</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleSaveAddress} disabled={savingAddress} className="flex-1 bg-[#8B4513] rounded-xl py-4 items-center">
                {savingAddress ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">{editingAddressId ? 'Update Address' : 'Add Address'}</Text>}
              </TouchableOpacity>
              {editingAddressId ? (
                <TouchableOpacity
                  onPress={() => {
                    setEditingAddressId(null);
                    setAddressForm(EMPTY_ADDRESS);
                  }}
                  className="flex-1 bg-[#EDE4D9] rounded-xl py-4 items-center"
                >
                  <Text className="text-[#2C1810] font-bold">Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} className="bg-[#2C1810] rounded-2xl py-4 items-center mb-8">
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}