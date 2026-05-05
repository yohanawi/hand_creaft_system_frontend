import PageShell from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import { API_URL, loginUser, setAuthToken } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
    Alert,
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

type LoginInputProps = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    focused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoComplete?: 'email' | 'current-password';
    textContentType?: 'emailAddress' | 'password';
    returnKeyType?: ReturnKeyTypeOptions;
    onSubmitEditing?: () => void;
    right?: ReactNode;
};

function LoginInput({
    icon,
    label,
    value,
    onChangeText,
    focused,
    onFocus,
    onBlur,
    secureTextEntry,
    keyboardType,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    right,
}: LoginInputProps) {
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
                        autoCapitalize="none"
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

export default function LoginScreen() {

    const router = useRouter();
    const { login, user, userToken, isLoading: authIsLoading } = useAuth();
    const { width } = useWindowDimensions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

    const isTablet = width >= 768;
    const isDesktop = width >= 1180;

    useEffect(() => {
        if (authIsLoading || !userToken) return;
        router.replace(user?.role === 'admin' ? '/admin' : '/customer-dashboard');
    }, [authIsLoading, router, user?.role, userToken]);

    const handleLogin = async () => {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password) {
            Alert.alert('Missing details', 'Enter your email address and password.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await loginUser({
                email: normalizedEmail,
                password,
            });

            const { token, user: userData } = response.data;
            setAuthToken(token);
            login(token, userData, { persist: rememberMe });
            router.replace(userData.role === 'admin' ? '/admin' : '/customer-dashboard');
        } catch (error: any) {
            const message =
                error.response?.data?.message ??
                (error.request
                    ? `Unable to reach the backend at ${API_URL}. Make sure the Express server is running.`
                    : error.message) ??
                'Check your credentials and try again.';
            Alert.alert('Login failed', message);
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
                                            <Feather name="log-in" size={13} color="#FFFFFF" />
                                            <Text className="font-body text-[10px] uppercase tracking-[2px] text-white">Welcome Back</Text>
                                        </View>
                                    </View>

                                    <Text className="mt-5 max-w-[620px] font-heading text-[30px] leading-[38px] text-white sm:text-[36px] sm:leading-[44px] lg:text-[42px] lg:leading-[50px]">
                                        Return to your cart, orders, and shortlisted products.
                                    </Text>

                                    <Text className="mt-10 max-w-[560px] font-body text-[15px] leading-[25px] text-white/75">
                                        This login is wired to the real storefront flow, so customers can recover wishlists, continue checkout, track orders, and reach support without losing context.
                                    </Text>

                                    <View className="mt-12 flex-row gap-3 rounded-[24px] border border-[#E9DDD4] bg-[#FFF7F1] p-4">
                                        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#F6EEE8]">
                                            <Feather name="life-buoy" size={18} color="#714329" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-heading text-[18px] leading-6 text-[#1C1C1C]">Need help accessing your account?</Text>
                                            <Text className="mt-1.5 font-body text-[12px] leading-[19px] text-[#6B6B6B]">
                                                Reset your password, contact support, or review delivery and payment help before checkout.
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => router.push('/contact' as any)}
                                                activeOpacity={0.75}
                                                className="mt-3 flex-row items-center gap-1.5 self-start"
                                            >
                                                <Text className="font-body text-[12px] font-bold leading-[18px] text-[#714329]">Contact support</Text>
                                                <Feather name="arrow-up-right" size={13} color="#714329" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View className={`${isDesktop ? 'shrink-0' : 'w-full'} rounded-[30px] px-5 py-6`}>
                                    <Text className="mt-5 font-heading text-[28px] leading-[34px] text-[#1C1C1C]">
                                        Sign in and continue where you left off.
                                    </Text>
                                    <Text className="mt-8 font-body text-[14px] leading-[23px] text-[#6B6B6B]">
                                        Use your account to recover carts, revisit wishlists, manage orders, and move through checkout without losing momentum.
                                    </Text>

                                    <View className="gap-3 mt-10">
                                        <LoginInput
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

                                        <LoginInput
                                            icon="lock"
                                            label="Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            focused={focusedField === 'password'}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            secureTextEntry={!showPassword}
                                            autoComplete="current-password"
                                            textContentType="password"
                                            returnKeyType="go"
                                            onSubmitEditing={handleLogin}
                                            right={
                                                <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.7}>
                                                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={16} color="#6B6B6B" />
                                                </TouchableOpacity>
                                            }
                                        />

                                        <View className={isTablet ? 'flex-row items-center justify-between my-6 gap-3' : 'gap-3'}>
                                            <Pressable onPress={() => setRememberMe((value) => !value)} className="flex-row items-center flex-1 gap-3">
                                                <View className={`h-[22px] w-[22px] items-center justify-center rounded-[7px] border ${rememberMe ? 'border-[#714329] bg-[#714329]' : 'border-[#D9C8BC] bg-white'}`}>
                                                    {rememberMe ? <Feather name="check" size={11} color="#FFFFFF" /> : null}
                                                </View>
                                                <View>
                                                    <Text className="font-body text-[13px] font-semibold leading-[18px] text-[#1C1C1C]">Keep me signed in</Text>
                                                    <Text className="mt-0.5 font-body text-[11px] leading-4 text-[#6B6B6B]">Useful on your personal device.</Text>
                                                </View>
                                            </Pressable>

                                            <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} activeOpacity={0.75}>
                                                <Text className="font-body text-[12px] font-bold leading-[18px] text-[#714329]">Forgot password?</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            disabled={submitting}
                                            onPress={handleLogin}
                                            activeOpacity={0.9}
                                            className={`rounded-[22px] px-5 py-5 ${submitting ? 'bg-[#8A684F]' : 'bg-[#714329]'}`}
                                        >
                                            <View className="flex items-center justify-center gap-4">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="font-body text-[12px] font-extrabold uppercase tracking-[1.8px] text-white">
                                                        {submitting ? 'Signing In...' : 'Sign In'}
                                                    </Text>
                                                    <Feather name={submitting ? 'clock' : 'arrow-right'} size={20} color="#FFFFFF" />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View className="mt-6 flex-row items-center justify-center gap-1.5">
                                        <Text className="font-body text-[13px] leading-5 text-[#6B6B6B]">Need a new account?</Text>
                                        <TouchableOpacity onPress={() => router.push('/register' as any)} activeOpacity={0.75}>
                                            <Text className="font-body text-[13px] font-bold leading-5 text-[#714329]">Create one</Text>
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