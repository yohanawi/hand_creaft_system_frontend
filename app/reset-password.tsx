import { resetPassword } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token: routeToken } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(routeToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('Required', 'Token and new password are required.');
      return;
    }

    setSubmitting(true); 
    try {
      await resetPassword({ token: token.trim(), newPassword: newPassword.trim() });
      Alert.alert('Success', 'Password reset successfully.', [
        { text: 'Go to Login', onPress: () => router.replace('/login' as any) },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F2EA] px-6 justify-center">
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-8">
        <Feather name="arrow-left" size={18} color="#8B4513" />
        <Text className="ml-2 text-[#8B4513] font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-[#2C1810] mb-3">Reset password</Text>
      <Text className="text-[#6B7280] text-base mb-8">
        Paste the token from the reset link and choose a new password.
      </Text>

      <Text className="text-[#374151] font-semibold mb-2">Reset token</Text>
      <TextInput
        value={token}
        onChangeText={setToken}
        placeholder="Paste reset token"
        autoCapitalize="none"
        className="bg-white border border-[#E5D4BF] rounded-xl px-4 py-4 mb-4"
      />

      <Text className="text-[#374151] font-semibold mb-2">New password</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
        className="bg-white border border-[#E5D4BF] rounded-xl px-4 py-4 mb-6"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-[#8B4513] rounded-xl py-4 items-center"
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text className="font-bold text-white">Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}