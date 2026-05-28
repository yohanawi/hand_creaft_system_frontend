import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';

import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage, resetPassword } from '@/services/api';
import { AuthScreenLayout } from '@/screens/native/auth/AuthScreenLayout';
import { AppButton } from '@/screens/native/shared/Buttons';
import { FormField } from '@/screens/native/shared/FormField';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthScreenLayout title="Create a new password" subtitle="The native reset screen reuses the existing token-based backend endpoint.">
      <FormField label="Reset token" value={String(token || '')} onChangeText={() => {}} placeholder="Token from your reset link" icon="key" editable={false} />
      <FormField label="New password" value={password} onChangeText={setPassword} placeholder="Enter a strong new password" icon="lock" secureTextEntry autoComplete="new-password" />
      <AppButton
        label="Update password"
        loading={submitting}
        onPress={async () => {
          if (!token || !password.trim()) {
            showToast('Missing details', 'warning', { subMessage: 'A reset token and new password are required.' });
            return;
          }

          setSubmitting(true);
          try {
            await resetPassword({ token: String(token), newPassword: password });
            showToast('Password updated', 'success', { subMessage: 'You can sign in with your new password now.' });
            router.replace('/login' as never);
          } catch (error) {
            showToast('Reset failed', 'error', { subMessage: getApiErrorMessage(error, 'Unable to reset the password.') });
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </AuthScreenLayout>
  );
}