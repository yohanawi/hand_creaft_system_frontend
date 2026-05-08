import PageShell from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { API_URL, getApiErrorMessage, registerUser, setAuthToken } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
    type KeyboardTypeOptions,
    type ReturnKeyTypeOptions,
} from 'react-native';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getRoleHomeRoute = (role?: string) => (
    role === 'admin'
        ? '/admin'
        : role === 'seller'
            ? '/seller'
            : '/customer-dashboard'
);

const getPostRegisterRoute = (role?: string, pendingRedirect?: string | null) => {
    if (role === 'user' && pendingRedirect && pendingRedirect.startsWith('/') && !pendingRedirect.startsWith('/admin') && !pendingRedirect.startsWith('/seller')) {
        return pendingRedirect;
    }

    return getRoleHomeRoute(role);
};

type RegisterInputProps = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    focused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'words';
    autoComplete?: 'name' | 'email' | 'new-password';
    textContentType?: 'name' | 'emailAddress' | 'newPassword';
    returnKeyType?: ReturnKeyTypeOptions;
    onSubmitEditing?: () => void;
    right?: ReactNode;
};

function RegisterInput({
    icon,
    label,
    value,
    onChangeText,
    focused,
    onFocus,
    onBlur,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    right,
}: RegisterInputProps) {
    const active = focused || value.length > 0;

    return (
        <View className={`overflow-hidden rounded-[14px] border bg-white ${active ? 'border-[#B9937B]' : 'border-[#E9DDD4]'}`}>
            <View className="flex-row items-center gap-3 px-2 py-1">
                <View className={`h-11 w-11 items-center justify-center rounded-[14px] ${active ? 'bg-[#EBDACD]' : 'bg-[#F6EEE8]'}`}>
                    <Feather name={icon} size={17} color={active ? '#714329' : '#6B6B6B'} />
                </View>

                <View className="flex-1">
                    <TextInput
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                        autoComplete={autoComplete}
                        textContentType={textContentType}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                        autoCapitalize={autoCapitalize ?? 'none'}
                        placeholder={label}
                        placeholderTextColor="#9A8475"
                        className="py-2 font-body text-[15px] leading-5 text-[#1C1C1C]"
                    />
                </View>

                {right ? <View>{right}</View> : null}
            </View>
        </View>
    );
}

function getStrength(password: string): { level: number; label: string; color: string } {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Too short', color: '#B5483D' };
    if (password.length < 10) return { level: 2, label: 'Fair', color: '#C69A52' };

    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasUpper && hasNumber && hasSpecial) return { level: 4, label: 'Very strong', color: '#4A8C5C' };
    if (hasUpper || hasSpecial || hasNumber) return { level: 3, label: 'Strong', color: '#6BAF7A' };
    return { level: 3, label: 'Strong', color: '#6BAF7A' };
}

function StrengthMeter({ password }: { password: string }) {
    const { level, label, color } = getStrength(password);

    if (!password) return null;

    return (
        <View className="flex-row items-center gap-2.5 rounded-[14px] border border-[#E9DDD4] bg-[#FFF7F1] px-3 py-3">
            <View className="flex-1 flex-row gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                    <View
                        key={step}
                        className="h-[5px] flex-1 rounded-full"
                        style={{ backgroundColor: step <= level ? color : 'rgba(185,147,123,0.24)' }}
                    />
                ))}
            </View>
            <Text className="min-w-[76px] text-right font-body text-[11px] font-bold" style={{ color }}>
                {label}
            </Text>
        </View>
    );
}

export default function RegisterScreen() {
    const router = useRouter();
    const { login, user, userToken, isLoading: authIsLoading, consumePendingRedirect } = useAuth();
    const { showToast } = useToast();
    const { width } = useWindowDimensions();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | null>(null);

    const isTablet = width >= 768;
    const isDesktop = width >= 1180;
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
    const normalizedEmail = normalizeEmail(email);
    const isEmailValid = /^\S+@\S+\.\S+$/.test(normalizedEmail);
    const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    useEffect(() => {
        if (authIsLoading || !userToken) return;
        const redirectPath = user?.role === 'user' ? consumePendingRedirect() : null;
        router.replace(getPostRegisterRoute(user?.role, redirectPath) as any);
    }, [authIsLoading, consumePendingRedirect, router, user?.role, userToken]);

    const handleRegister = async () => {
        if (!name.trim() || !normalizedEmail || !password) {
            showToast('Missing details', 'warning', {
                subMessage: 'Fill in your name, email address, and password.',
            });
            return;
        }

        if (!isEmailValid) {
            showToast('Invalid email format', 'error');
            return;
        }

        if (!isStrongPassword) {
            showToast('Password is too weak', 'error', {
                subMessage: 'Use at least 8 characters with uppercase, lowercase, and a number.',
            });
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (!acceptTerms) {
            showToast('Accept the terms', 'warning', {
                subMessage: 'You need to accept the terms and privacy policy before creating an account.',
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await registerUser({
                name: name.trim(),
                email: normalizedEmail,
                password,
            });

            const { token, user: userData } = response.data;
            setAuthToken(token);
            login(token, userData, { persist: true });
            router.replace(getPostRegisterRoute(userData.role, userData.role === 'user' ? consumePendingRedirect() : null) as any);
        } catch (error: any) {
            const message =
                error.response?.data?.message ??
                (error.request
                    ? `Unable to reach the backend at ${API_URL}. Make sure the Express server is running.`
                    : error.message) ??
                'Please try again.';
            showToast('Registration failed', 'error', {
                subMessage: getApiErrorMessage(error, message),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-[#D0B9A7]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <PageShell>
                    <View className="bg-[#D0B9A7] px-3 py-24 sm:px-5 lg:px-6">
                        <View className="mx-auto w-full max-w-6xl overflow-hidden rounded-[34px] border border-white/35 bg-[#F6EEE8] p-3">
                            <View className={isDesktop ? 'grid md:grid-cols-2 items-stretch gap-4' : 'gap-4'}>
                                <View className="relative min-w-0 flex-1 overflow-hidden rounded-[30px] bg-[#5F341C] px-6 py-7">
                                    <View className="self-start px-3 py-2 border rounded-full border-white/20 bg-white/10">
                                        <View className="flex-row items-center gap-2">
                                            <Feather name="user-plus" size={13} color="#FFFFFF" />
                                            <Text className="font-body text-[10px] uppercase tracking-[2px] text-white">Create Account</Text>
                                        </View>
                                    </View>

                                    <Text className="mt-5 max-w-[620px] font-heading text-[30px] leading-[38px] text-white sm:text-[36px] sm:leading-[44px] lg:text-[42px] lg:leading-[50px]">
                                        Start an account for faster checkout, saved favorites, and order tracking.
                                    </Text>

                                    <Text className="mt-10 max-w-[560px] font-body text-[15px] leading-[25px] text-white/75">
                                        This follows the same storefront flow as sign in, but opens the customer journey from the start so shoppers can save details, revisit products, and manage future orders in one place.
                                    </Text>

                                    <View className="gap-3 mt-16 rounded-[24px] border border-[#E9DDD4] bg-[#FFF7F1] p-4">
                                        <View className="flex-row gap-3">
                                            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#F6EEE8]">
                                                <Feather name="shopping-bag" size={18} color="#714329" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-heading text-[18px] leading-6 text-[#1C1C1C]">Your account is ready for the full buying flow</Text>
                                                <Text className="mt-1.5 font-body text-[12px] leading-[19px] text-[#6B6B6B]">
                                                    Keep delivery details, track purchases, save shortlisted products, and reach support without starting over.
                                                </Text>
                                            </View>
                                        </View>

                                        <View className={isTablet ? 'flex-row gap-3' : 'gap-3'}>
                                            <View className="flex-1 rounded-[18px] border border-[#E9DDD4] bg-white px-3 py-3">
                                                <Text className="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-[#714329]">Saved Checkout</Text>
                                                <Text className="mt-1 font-body text-[12px] leading-[18px] text-[#6B6B6B]">
                                                    Store your customer details for a faster return purchase.
                                                </Text>
                                            </View>
                                            <View className="flex-1 rounded-[18px] border border-[#E9DDD4] bg-white px-3 py-3">
                                                <Text className="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-[#714329]">Order Visibility</Text>
                                                <Text className="mt-1 font-body text-[12px] leading-[18px] text-[#6B6B6B]">
                                                    Review order history and status updates from one account.
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className={`${isDesktop ? 'shrink-0' : 'w-full'} rounded-[30px] px-5 py-6`}>
                                    <Text className="mt-5 font-heading text-[28px] leading-[34px] text-[#1C1C1C]">
                                        Create your profile and move through checkout with less friction.
                                    </Text>
                                    <Text className="mt-8 font-body text-[14px] leading-[23px] text-[#6B6B6B]">
                                        Set up your account once to recover carts, save products, and keep order support attached to the right customer profile.
                                    </Text>

                                    <View className="gap-3 mt-10">
                                        <RegisterInput
                                            icon="user"
                                            label="Full name"
                                            value={name}
                                            onChangeText={setName}
                                            focused={focusedField === 'name'}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            autoCapitalize="words"
                                            autoComplete="name"
                                            textContentType="name"
                                            returnKeyType="next"
                                        />

                                        <RegisterInput
                                            icon="mail"
                                            label="Email address"
                                            value={email}
                                            onChangeText={setEmail}
                                            focused={focusedField === 'email'}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            keyboardType="email-address"
                                            autoComplete="email"
                                            textContentType="emailAddress"
                                            returnKeyType="next"
                                        />

                                        <RegisterInput
                                            icon="lock"
                                            label="Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            focused={focusedField === 'password'}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            secureTextEntry={!showPassword}
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            returnKeyType="next"
                                            right={
                                                <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.7}>
                                                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={16} color="#6B6B6B" />
                                                </TouchableOpacity>
                                            }
                                        />

                                        <StrengthMeter password={password} />

                                        <RegisterInput
                                            icon="shield"
                                            label="Confirm password"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            focused={focusedField === 'confirmPassword'}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            secureTextEntry={!showConfirmPassword}
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            returnKeyType="go"
                                            onSubmitEditing={handleRegister}
                                            right={
                                                <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)} activeOpacity={0.7}>
                                                    <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={16} color="#6B6B6B" />
                                                </TouchableOpacity>
                                            }
                                        />

                                        {passwordsMatch || passwordMismatch ? (
                                            <View
                                                className={`flex-row items-center gap-2 rounded-[14px] border px-3 py-3 ${passwordsMatch ? 'border-[rgba(74,140,92,0.18)] bg-[rgba(74,140,92,0.08)]' : 'border-[rgba(181,72,61,0.18)] bg-[rgba(181,72,61,0.08)]'}`}
                                            >
                                                <Feather
                                                    name={passwordsMatch ? 'check-circle' : 'x-circle'}
                                                    size={14}
                                                    color={passwordsMatch ? '#4A8C5C' : '#B5483D'}
                                                />
                                                <Text
                                                    className="font-body text-[12px] font-bold"
                                                    style={{ color: passwordsMatch ? '#4A8C5C' : '#B5483D' }}
                                                >
                                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                                </Text>
                                            </View>
                                        ) : null}

                                        <Pressable onPress={() => setAcceptTerms((value) => !value)} className="my-3 flex-row items-start gap-3 rounded-[24px] border border-[#E9DDD4] bg-[#FFF7F1] p-4">
                                            <View className={`h-[22px] w-[22px] items-center justify-center rounded-[7px] border ${acceptTerms ? 'border-[#714329] bg-[#714329]' : 'border-[#D9C8BC] bg-white'}`}>
                                                {acceptTerms ? <Feather name="check" size={11} color="#FFFFFF" /> : null}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-body text-[13px] font-semibold leading-[18px] text-[#1C1C1C]">I agree to the account terms</Text>
                                                <Text className="mt-0.5 font-body text-[11px] leading-4 text-[#6B6B6B]">
                                                    Continue only if you accept the{' '}
                                                    <Text className="font-bold text-[#714329]" onPress={() => router.push('/terms-conditions' as any)}>
                                                        Terms & Conditions
                                                    </Text>
                                                    {' '}and{' '}
                                                    <Text className="font-bold text-[#714329]" onPress={() => router.push('/privacy-policy' as any)}>
                                                        Privacy Policy
                                                    </Text>
                                                    .
                                                </Text>
                                            </View>
                                        </Pressable>

                                        <TouchableOpacity
                                            disabled={submitting}
                                            onPress={handleRegister}
                                            activeOpacity={0.9}
                                            className={`rounded-[22px] px-5 py-5 ${submitting ? 'bg-[#8A684F]' : 'bg-[#714329]'}`}
                                        >
                                            <View className="flex items-center justify-center gap-4">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="font-body text-[12px] font-extrabold uppercase tracking-[1.8px] text-white">
                                                        {submitting ? 'Creating Account...' : 'Create Account'}
                                                    </Text>
                                                    <Feather name={submitting ? 'clock' : 'arrow-right'} size={20} color="#FFFFFF" />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="mt-6 flex-row items-center justify-center gap-1.5">
                                        <Text className="font-body text-[13px] leading-5 text-[#6B6B6B]">Already have an account?</Text>
                                        <TouchableOpacity onPress={() => router.push('/login' as any)} activeOpacity={0.75}>
                                            <Text className="font-body text-[13px] font-bold leading-5 text-[#714329]">Sign in</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </PageShell>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
