import React, { useState } from 'react';

import { useToast } from '@/context/ToastContext';
import { forgotPassword, getApiErrorMessage } from '@/services/api';
import { AuthScreenLayout } from '@/screens/native/auth/AuthScreenLayout';
import { AppButton } from '@/screens/native/shared/Buttons';
import { FormField } from '@/screens/native/shared/FormField';

export default function ForgotPasswordScreen() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthScreenLayout title="Reset your password" subtitle="Use the existing backend recovery flow from the native customer app.">
      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" icon="mail" keyboardType="email-address" autoComplete="email" />
      <AppButton
        label="Send reset link"
        loading={submitting}
        onPress={async () => {
          if (!email.trim()) {
            showToast('Email required', 'warning');
            return;
          }

          setSubmitting(true);
          try {
            const response = await forgotPassword({ email: email.trim().toLowerCase() });
            showToast('Password reset started', 'success', { subMessage: response.data?.message || 'Check your inbox for the next step.' });
          } catch (error) {
            showToast('Reset failed', 'error', { subMessage: getApiErrorMessage(error, 'Unable to start password reset.') });
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </AuthScreenLayout>
  );
}