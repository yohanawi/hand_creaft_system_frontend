import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage, registerUser, setAuthToken } from '@/services/api';
import { AuthScreenLayout } from '@/screens/native/auth/AuthScreenLayout';
import { AppButton } from '@/screens/native/shared/Buttons';
import { FormField } from '@/screens/native/shared/FormField';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthScreenLayout title="Create your account" subtitle="Open the customer journey in the APK with the same auth backend used by web.">
      <FormField label="Full name" value={name} onChangeText={setName} placeholder="Your name" icon="user" autoCapitalize="words" />
      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" icon="mail" keyboardType="email-address" autoComplete="email" />
      <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="Optional phone number" icon="phone" keyboardType="phone-pad" />
      <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Create a strong password" icon="lock" secureTextEntry autoComplete="new-password" />

      <AppButton
        label="Register"
        loading={submitting}
        onPress={async () => {
          if (!name.trim() || !email.trim() || !password.trim()) {
            showToast('Missing details', 'warning', { subMessage: 'Name, email, and password are required.' });
            return;
          }

          if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
            showToast('Invalid email', 'error');
            return;
          }

          setSubmitting(true);
          try {
            const response = await registerUser({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined });
            const token = response.data?.token;
            const user = response.data?.user;
            setAuthToken(token);
            login(token, user);
            router.replace('/customer-dashboard' as never);
          } catch (error) {
            showToast('Registration failed', 'error', { subMessage: getApiErrorMessage(error, 'Unable to register right now.') });
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </AuthScreenLayout>
  );
}