import PageShell from '@/components/PageShell';
import { forgotPassword } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
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

type ForgotInputProps = {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    focused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    keyboardType?: KeyboardTypeOptions;
    autoComplete?: 'email';
    textContentType?: 'emailAddress';
    returnKeyType?: ReturnKeyTypeOptions;
    onSubmitEditing?: () => void;
    right?: ReactNode;
};

function ForgotInput({
    icon,
    label,
    value,
    onChangeText,
    focused,
    onFocus,
    onBlur,
    keyboardType,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    right,
}: ForgotInputProps) {
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();

    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<'email' | null>(null);

    const isTablet = width >= 768;
    const isDesktop = width >= 1180;

    const handleSubmit = async () => {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            Alert.alert('Required', 'Please enter your email address.');
            return;
        }

        setSubmitting(true);

        try {
            const { data } = await forgotPassword({ email: normalizedEmail });
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
        <KeyboardAvoidingView className="flex-1 bg-[#D0B9A7]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <PageShell>
                    <View className="bg-[#D0B9A7] px-3 py-24 sm:px-5 lg:px-6">
                        <View className="mx-auto w-full max-w-6xl overflow-hidden rounded-[34px] border border-white/35 bg-[#F6EEE8] p-3">
                            <View className={isDesktop ? 'grid md:grid-cols-2 items-stretch gap-4' : 'gap-4'}>
                                <View className="relative min-w-0 flex-1 overflow-hidden rounded-[30px] bg-[#5F341C] px-6 py-7">
                                    <View className="self-start px-3 py-2 border rounded-full border-white/20 bg-white/10">
                                        <View className="flex-row items-center gap-2">
                                            <Feather name="key" size={13} color="#FFFFFF" />
                                            <Text className="font-body text-[10px] uppercase tracking-[2px] text-white">Password Reset</Text>
                                        </View>
                                    </View>

                                    <Text className="mt-5 max-w-[620px] font-heading text-[30px] leading-[38px] text-white sm:text-[36px] sm:leading-[44px] lg:text-[42px] lg:leading-[50px]">
                                        Recover access without breaking the rest of the customer flow.
                                    </Text>

                                    <Text className="mt-10 max-w-[560px] font-body text-[15px] leading-[25px] text-white/75">
                                        This reset page follows the same storefront language as sign in, so customers can move from account recovery back into orders, wishlists, and checkout with minimal friction.
                                    </Text>

                                    <View className="mt-12 gap-3 rounded-[24px] border border-[#E9DDD4] bg-[#FFF7F1] p-4">
                                        <View className="flex-row gap-3">
                                            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#F6EEE8]">
                                                <Feather name="mail" size={18} color="#714329" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-heading text-[18px] leading-6 text-[#1C1C1C]">Reset links stay simple in development</Text>
                                                <Text className="mt-1.5 font-body text-[12px] leading-[19px] text-[#6B6B6B]">
                                                    If your API exposes a local reset URL, this screen surfaces it immediately so you can finish testing without waiting on mail delivery.
                                                </Text>
                                            </View>
                                        </View>

                                        <View className={isTablet ? 'flex-row gap-3' : 'gap-3'}>
                                            <View className="flex-1 rounded-[18px] border border-[#E9DDD4] bg-white px-3 py-3">
                                                <Text className="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-[#714329]">Step 01</Text>
                                                <Text className="mt-1 font-body text-[12px] leading-[18px] text-[#6B6B6B]">
                                                    Enter the email attached to the account you want to recover.
                                                </Text>
                                            </View>
                                            <View className="flex-1 rounded-[18px] border border-[#E9DDD4] bg-white px-3 py-3">
                                                <Text className="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-[#714329]">Step 02</Text>
                                                <Text className="mt-1 font-body text-[12px] leading-[18px] text-[#6B6B6B]">
                                                    Open the generated link, reset the password, then return to sign in.
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className={`${isDesktop ? 'shrink-0' : 'w-full'} rounded-[30px] px-5 py-6`}>
                                    <Text className="mt-5 font-heading text-[28px] leading-[34px] text-[#1C1C1C]">
                                        Send yourself a reset link and get back into the account.
                                    </Text>
                                    <Text className="mt-8 font-body text-[14px] leading-[23px] text-[#6B6B6B]">
                                        Use the same email you sign in with. In local development, the recovery URL can be shown directly so the reset flow is easy to test end to end.
                                    </Text>

                                    <View className="gap-3 mt-10">
                                        <ForgotInput
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
                                            returnKeyType="send"
                                            onSubmitEditing={handleSubmit}
                                        />

                                        <View className="my-3 rounded-[24px] border border-[#E9DDD4] bg-[#FFF7F1] p-4">
                                            <View className="flex-row gap-3">
                                                <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#F6EEE8]">
                                                    <Feather name="info" size={16} color="#714329" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="font-body text-[13px] font-semibold leading-[18px] text-[#1C1C1C]">Development behavior</Text>
                                                    <Text className="mt-1.5 font-body text-[12px] leading-[19px] text-[#6B6B6B]">
                                                        If the backend returns a reset URL in development, it will appear in an alert so you can continue testing the recovery path immediately.
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            disabled={submitting}
                                            onPress={handleSubmit}
                                            activeOpacity={0.9}
                                            className={`rounded-[22px] px-5 py-5 ${submitting ? 'bg-[#8A684F]' : 'bg-[#714329]'}`}
                                        >
                                            <View className="flex items-center justify-center gap-4">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="font-body text-[12px] font-extrabold uppercase tracking-[1.8px] text-white">
                                                        {submitting ? 'Generating Reset Link...' : 'Generate Reset Link'}
                                                    </Text>
                                                    <Feather name={submitting ? 'clock' : 'arrow-right'} size={20} color="#FFFFFF" />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="mt-6 flex-row items-center justify-center gap-1.5">
                                        <Text className="font-body text-[13px] leading-5 text-[#6B6B6B]">Remembered your password?</Text>
                                        <TouchableOpacity onPress={() => router.push('/login' as any)} activeOpacity={0.75}>
                                            <Text className="font-body text-[13px] font-bold leading-5 text-[#714329]">Back to sign in</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="mt-4 flex-row items-center justify-center gap-1.5">
                                        <Text className="font-body text-[13px] leading-5 text-[#6B6B6B]">Still blocked?</Text>
                                        <TouchableOpacity onPress={() => router.push('/contact' as any)} activeOpacity={0.75}>
                                            <Text className="font-body text-[13px] font-bold leading-5 text-[#714329]">Contact support</Text>
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
