import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { API_URL, getApiErrorMessage, loginUser, setAuthToken } from '@/services/api';
import { AuthScreenLayout } from '@/screens/native/auth/AuthScreenLayout';
import { AppButton } from '@/screens/native/shared/Buttons';
import { FormField } from '@/screens/native/shared/FormField';
import { nativeTheme } from '@/screens/native/theme';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, userToken, isLoading, consumePendingRedirect } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading || !userToken) {
      return;
    }

    const fallback = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/customer-dashboard';
    router.replace((consumePendingRedirect() || fallback) as never);
  }, [consumePendingRedirect, isLoading, router, user?.role, userToken]);

  return (
    <AuthScreenLayout title="Welcome back" subtitle="Continue your cart, wishlist, orders, and support history from the native app.">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { icon: 'heart', label: 'Wishlist restored' },
          { icon: 'shopping-bag', label: 'Checkout ready' },
        ].map((item) => (
          <View key={item.label} style={{ flex: 1, minWidth: 0, padding: 14, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong, gap: 8 }}>
            <Feather name={item.icon as any} size={17} color={nativeTheme.colors.primary} />
            <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
          </View>
        ))}
      </View>

      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" icon="mail" keyboardType="email-address" autoComplete="email" />
      <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" icon="lock" secureTextEntry={!showPassword} autoComplete="current-password" />

      <Pressable onPress={() => setShowPassword((value) => !value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
        <Feather name={showPassword ? 'eye-off' : 'eye'} size={15} color={nativeTheme.colors.primary} />
        <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 13, fontWeight: '700' }}>{showPassword ? 'Hide password' : 'Show password'}</Text>
      </Pressable>

      <Pressable onPress={() => setRememberMe((value) => !value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: nativeTheme.radius.lg, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(113, 67, 41, 0.08)' }}>
        <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: rememberMe ? nativeTheme.colors.primary : 'rgba(113, 67, 41, 0.12)', backgroundColor: rememberMe ? nativeTheme.colors.primary : nativeTheme.colors.card, alignItems: 'center', justifyContent: 'center' }}>
          {rememberMe ? <Feather name="check" size={13} color={nativeTheme.colors.white} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: nativeTheme.colors.text, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Keep me signed in</Text>
          <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 12, marginTop: 2 }}>Recommended for your personal phone or tablet.</Text>
        </View>
      </Pressable>

      <AppButton
        label="Sign in"
        icon="arrow-right"
        loading={submitting}
        onPress={async () => {
          const normalizedEmail = email.trim().toLowerCase();
          if (!normalizedEmail || !password) {
            showToast('Missing details', 'warning', { subMessage: 'Enter your email address and password.' });
            return;
          }

          if (!EMAIL_REGEX.test(normalizedEmail)) {
            showToast('Invalid email', 'error');
            return;
          }

          setSubmitting(true);
          try {
            const response = await loginUser({ email: normalizedEmail, password });
            const token = response.data?.token;
            const nextUser = response.data?.user;
            setAuthToken(token);
            login(token, nextUser, { persist: rememberMe });
            router.replace(((nextUser?.role === 'admin' ? '/admin' : nextUser?.role === 'seller' ? '/seller' : consumePendingRedirect() || '/customer-dashboard')) as never);
          } catch (error) {
            showToast('Login failed', 'error', {
              subMessage: getApiErrorMessage(error, `Unable to reach the backend at ${API_URL}. Make sure the Express server is running.`),
            });
          } finally {
            setSubmitting(false);
          }
        }}
      />

      <AppButton label="Forgot password" icon="life-buoy" variant="ghost" onPress={() => router.push('/forgot-password' as never)} />

      <View style={{ gap: 10, padding: 16, borderRadius: nativeTheme.radius.lg, backgroundColor: nativeTheme.colors.cardStrong }}>
        <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 13, lineHeight: 20 }}>
          Need an account to save pieces, continue checkout, and track orders across web and APK?
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        <Text style={{ color: nativeTheme.colors.textMuted, fontFamily: nativeTheme.fonts.body, fontSize: 14 }}>Need an account?</Text>
        <Pressable onPress={() => router.push('/register' as never)}>
          <Text style={{ color: nativeTheme.colors.primary, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>Create one</Text>
        </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}