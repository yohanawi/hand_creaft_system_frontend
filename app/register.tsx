import AuthField from '@/components/Auth/AuthField';
import AuthStage from '@/components/Auth/AuthStage';
import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { useAuth } from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { API_URL, registerUser, setAuthToken } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const C = {
    screen: BROWN.Background,
    text: BROWN.TextPrimary,
    muted: BROWN.TextSecondary,
    accent: BROWN.DarkColor,
    accentDeep: BROWN.DarkColor,
    bronze: BROWN.SecondaryBackground,
    line: BROWN.Border,
    card: '#FFFFFF',
    white: '#FFFFFF',
    success: '#4A8C5C',
    warning: '#C69A52',
    error: '#B5483D',
    softBg: 'rgba(255,255,255,0.72)',
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

function getStrength(password: string): { level: number; label: string; color: string } {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Too short', color: C.error };
    if (password.length < 10) return { level: 2, label: 'Fair', color: C.warning };

    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasUpper && hasNumber && hasSpecial) return { level: 4, label: 'Very strong', color: C.success };
    if (hasUpper || hasSpecial || hasNumber) return { level: 3, label: 'Strong', color: '#6BAF7A' };
    return { level: 3, label: 'Strong', color: '#6BAF7A' };
}

function StrengthMeter({ password }: { password: string }) {
    const { level, label, color } = getStrength(password);
    if (!password) return null;

    return (
        <View style={styles.strengthWrap}>
            <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((step) => (
                    <View
                        key={step}
                        style={[styles.strengthBar, { backgroundColor: step <= level ? color : 'rgba(185,147,123,0.24)' }]}
                    />
                ))}
            </View>
            <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
        </View>
    );
}

export default function RegisterScreen() {
    const router = useRouter();
    const { scrollY, onScroll } = useHeaderScroll();
    const { login, user, userToken, isLoading: authIsLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const btnScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (authIsLoading || !userToken) return;
        router.replace(user?.role === 'admin' ? '/admin' : '/customer-dashboard');
    }, [authIsLoading, router, user?.role, userToken]);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    const handleRegister = async () => {
        const normalizedEmail = normalizeEmail(email);

        if (!name.trim() || !normalizedEmail || !password) {
            Alert.alert('Missing details', 'Fill in your name, email address, and password.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Password too short', 'Choose a password with at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match', 'Re-enter the same password in both fields.');
            return;
        }

        if (!acceptTerms) {
            Alert.alert('Accept the terms', 'You need to accept the terms and privacy policy before creating an account.');
            return;
        }

        setSubmitting(true);
        Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();

        try {
            const response = await registerUser({
                name: name.trim(),
                email: normalizedEmail,
                password,
            });

            const { token, user: userData } = response.data;
            setAuthToken(token);
            login(token, userData, { persist: true });
            router.replace(userData.role === 'admin' ? '/admin' : '/customer-dashboard');
        } catch (error: any) {
            const message =
                error.response?.data?.message ??
                (error.request
                    ? `Unable to reach the backend at ${API_URL}. Make sure the Express server is running.`
                    : error.message) ??
                'Please try again.';
            Alert.alert('Registration failed', message);
        } finally {
            setSubmitting(false);
            Animated.spring(btnScale, { toValue: 1, tension: 180, friction: 7, useNativeDriver: true }).start();
        }
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.ScrollView
                style={styles.root}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <AuthStage
                        badgeIcon="user-plus"
                        badgeLabel="Create Account"
                        cardTitle="Open your studio-side account."
                        cardDescription="Create an account to save pieces, track orders, and move through checkout without re-entering every detail."
                        heroEyebrow="Join The Atelier"
                        heroTitle="Designed for gift givers, collectors, and customers who return with intention."
                        heroDescription="The account experience mirrors the product story: warm materials, clear details, and a checkout path that feels thoughtful rather than rushed."
                        heroQuote="From discovery to delivery, every touchpoint should feel as carefully composed as the piece in the box."
                        heroQuoteAuthor="craft-led commerce"
                        features={[
                            { icon: 'bookmark', title: 'Personal wishlists', body: 'Keep favorite finds ready for later gifting, styling, or repeat purchase.' },
                            { icon: 'map-pin', title: 'Faster checkout', body: 'Store delivery details so handcrafted orders move through checkout smoothly.' },
                            { icon: 'message-circle', title: 'Better support', body: 'Reach support with your order context already attached to your account history.' },
                        ]}
                        footerPrompt="Already registered?"
                        footerActionLabel="Sign in"
                        onFooterAction={() => router.push('/login' as any)}
                    >
                        <View style={styles.formGroup}>
                            <AuthField
                                icon="user"
                                value={name}
                                placeholder="Full name"
                                onChange={setName}
                                autoCapitalize="words"
                                autoComplete="name"
                                textContentType="name"
                                returnKeyType="next"
                            />
                            <AuthField
                                icon="mail"
                                value={email}
                                placeholder="Email address"
                                onChange={setEmail}
                                keyboardType="email-address"
                                autoComplete="email"
                                textContentType="emailAddress"
                                returnKeyType="next"
                            />
                            <AuthField
                                icon="lock"
                                value={password}
                                placeholder="Password"
                                onChange={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                                textContentType="newPassword"
                                returnKeyType="next"
                                right={
                                    <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.7}>
                                        <Feather name={showPassword ? 'eye' : 'eye-off'} size={16} color={C.muted} />
                                    </TouchableOpacity>
                                }
                            />

                            <StrengthMeter password={password} />

                            <AuthField
                                icon="shield"
                                value={confirmPassword}
                                placeholder="Confirm password"
                                onChange={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoComplete="new-password"
                                textContentType="newPassword"
                                returnKeyType="go"
                                onSubmitEditing={handleRegister}
                                right={
                                    <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)} activeOpacity={0.7}>
                                        <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={16} color={C.muted} />
                                    </TouchableOpacity>
                                }
                            />
                        </View>

                        {(passwordsMatch || passwordMismatch) && (
                            <View style={styles.matchRow}>
                                <Feather
                                    name={passwordsMatch ? 'check-circle' : 'x-circle'}
                                    size={14}
                                    color={passwordsMatch ? C.success : C.error}
                                />
                                <Text style={[styles.matchText, { color: passwordsMatch ? C.success : C.error }]}>
                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </Text>
                            </View>
                        )}

                        <Pressable style={styles.termsRow} onPress={() => setAcceptTerms((value) => !value)}>
                            <View style={[styles.check, acceptTerms && styles.checkActive]}>
                                {acceptTerms && <Feather name="check" size={11} color={C.white} />}
                            </View>
                            <View style={styles.termsCopy}>
                                <Text style={styles.termsText}>
                                    I agree to the{' '}
                                    <Text style={styles.inlineLink} onPress={() => router.push('/terms-conditions' as any)}>
                                        Terms & Conditions
                                    </Text>
                                    {' '}and{' '}
                                    <Text style={styles.inlineLink} onPress={() => router.push('/privacy-policy' as any)}>
                                        Privacy Policy
                                    </Text>
                                    .
                                </Text>
                            </View>
                        </Pressable>

                        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                            <TouchableOpacity disabled={submitting} activeOpacity={0.88} onPress={handleRegister}>
                                <LinearGradient
                                    colors={[BROWN.DarkColor, BROWN.SecondaryBackground, BROWN.lightColor]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitBtn}
                                >
                                    <Text style={styles.submitText}>{submitting ? 'Creating Account...' : 'Create Account'}</Text>
                                    {!submitting && <Feather name="arrow-right" size={16} color={C.white} />}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.notePanel}>
                            <View style={styles.noteHeader}>
                                <Feather name="gift" size={15} color={C.accent} />
                                <Text style={styles.noteTitle}>What your account unlocks</Text>
                            </View>
                            <Text style={styles.noteBody}>
                                Saved delivery details, order history, curated favorites, and a faster path back to the pieces you loved.
                            </Text>
                        </View>
                    </AuthStage>
                </PageShell>
            </Animated.ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.screen,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formGroup: {
        gap: 12,
    },
    strengthWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    strengthBars: {
        flex: 1,
        flexDirection: 'row',
        gap: 5,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 999,
    },
    strengthLabel: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 11,
        fontWeight: '700',
        minWidth: 72,
        textAlign: 'right',
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    matchText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        fontWeight: '700',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    check: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: C.bronze,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.card,
        marginTop: 2,
    },
    checkActive: {
        backgroundColor: C.accent,
        borderColor: C.accent,
    },
    termsCopy: {
        flex: 1,
    },
    termsText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        lineHeight: 20,
        color: C.muted,
    },
    inlineLink: {
        color: C.accentDeep,
        fontWeight: '700',
    },
    submitBtn: {
        minHeight: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: BROWN.DarkColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 4,
    },
    submitText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        fontWeight: '700',
        color: C.white,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    notePanel: {
        borderRadius: 18,
        padding: 16,
        backgroundColor: C.softBg,
        borderWidth: 1,
        borderColor: C.line,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    noteTitle: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        fontWeight: '700',
        color: C.text,
    },
    noteBody: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        lineHeight: 20,
        color: C.muted,
    },
});