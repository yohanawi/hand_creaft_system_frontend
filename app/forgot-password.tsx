import { forgotPassword } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await forgotPassword({ email: email.trim() });
      Alert.alert(
        'Reset Link Generated',
        data?.resetUrl
          ? `Use this reset link in development:\n\n${data.resetUrl}`
          : 'If that email exists, a reset link has been generated.'
      );
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to generate reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F2EA] px-6 justify-center">
      <TouchableOpacity onPress={() => router.back()} className="mb-8 flex-row items-center">
        <Feather name="arrow-left" size={18} color="#8B4513" />
        <Text className="ml-2 text-[#8B4513] font-semibold">Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-[#2C1810] mb-3">Forgot password</Text>
      <Text className="text-[#6B7280] text-base mb-8">
        Enter your account email and generate a reset link.
      </Text>

      <Text className="text-[#374151] font-semibold mb-2">Email address</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-white border border-[#E5D4BF] rounded-xl px-4 py-4 mb-6"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-[#8B4513] rounded-xl py-4 items-center"
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Generate Reset Link</Text>}
      </TouchableOpacity>
    </View>
  );
}