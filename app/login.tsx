import AuthField from '@/components/Auth/AuthField';
import AuthStage from '@/components/Auth/AuthStage';
import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { useAuth } from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { API_URL, loginUser, setAuthToken } from '@/services/api';
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
    successBg: 'rgba(255,255,255,0.72)',
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export default function LoginScreen() {
    const router = useRouter();
    const { scrollY, onScroll } = useHeaderScroll();
    const { login, user, userToken, isLoading: authIsLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const btnScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (authIsLoading || !userToken) return;
        router.replace(user?.role === 'admin' ? '/admin' : '/customer-dashboard');
    }, [authIsLoading, router, user?.role, userToken]);

    const handleLogin = async () => {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password) {
            Alert.alert('Missing details', 'Enter your email address and password to continue.');
            return;
        }

        setSubmitting(true);
        Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();

        try {
            const response = await loginUser({ email: normalizedEmail, password });
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
                'Please check your credentials and try again.';
            Alert.alert('Login failed', message);
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
                        badgeIcon="key"
                        badgeLabel="Member Sign In"
                        cardTitle="Return to your collection."
                        cardDescription="Sign in to revisit saved pieces, follow your orders, and keep your curated wishlist close."
                        heroEyebrow="Artisan Account Access"
                        heroTitle="A calm, crafted entrance for returning customers."
                        heroDescription="Your account keeps delivery details, favorite finds, and support history in one place, so the shopping experience feels as considered as the pieces themselves."
                        heroQuote="Every handcrafted order deserves a checkout and support flow that feels personal, not mechanical."
                        heroQuoteAuthor="studio promise"
                        features={[
                            { icon: 'heart', title: 'Saved favorites', body: 'Pick up where you left off with wishlisted jewelry and gift ideas.' },
                            { icon: 'truck', title: 'Order tracking', body: 'Review deliveries, payment status, and customer support updates quickly.' },
                            { icon: 'shield', title: 'Protected sessions', body: 'Use remember me when you want secure persistence on your own device.' },
                        ]}
                        footerPrompt="New here?"
                        footerActionLabel="Create an account"
                        onFooterAction={() => router.push('/register' as any)}
                    >
                        <View style={styles.formGroup}>
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
                                autoComplete="password"
                                textContentType="password"
                                returnKeyType="go"
                                onSubmitEditing={handleLogin}
                                right={
                                    <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.7}>
                                        <Feather name={showPassword ? 'eye' : 'eye-off'} size={16} color={C.muted} />
                                    </TouchableOpacity>
                                }
                            />
                        </View>

                        <View style={styles.metaRow}>
                            <Pressable style={styles.checkRow} onPress={() => setRememberMe((value) => !value)}>
                                <View style={[styles.check, rememberMe && styles.checkActive]}>
                                    {rememberMe && <Feather name="check" size={11} color={C.white} />}
                                </View>
                                <Text style={styles.metaText}>Remember me on this device</Text>
                            </Pressable>

                            <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} activeOpacity={0.75}>
                                <Text style={styles.inlineLink}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>

                        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                            <TouchableOpacity disabled={submitting} activeOpacity={0.88} onPress={handleLogin}>
                                <LinearGradient
                                    colors={[BROWN.DarkColor, BROWN.SecondaryBackground, BROWN.lightColor]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitBtn}
                                >
                                    <Text style={styles.submitText}>{submitting ? 'Signing In...' : 'Sign In'}</Text>
                                    {!submitting && <Feather name="arrow-right" size={16} color={C.white} />}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.notePanel}>
                            <View style={styles.noteHeader}>
                                <Feather name="clock" size={15} color={C.accent} />
                                <Text style={styles.noteTitle}>Need help before checkout?</Text>
                            </View>
                            <Text style={styles.noteBody}>
                                If you cannot access your account, use password recovery or reach out to the support team for order and delivery help.
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/contact' as any)} activeOpacity={0.75}>
                                <Text style={styles.noteLink}>Contact support</Text>
                            </TouchableOpacity>
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
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
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
    },
    checkActive: {
        backgroundColor: C.accent,
        borderColor: C.accent,
    },
    metaText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        color: C.muted,
    },
    inlineLink: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        fontWeight: '700',
        color: C.accentDeep,
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
        backgroundColor: C.successBg,
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
        marginBottom: 10,
    },
    noteLink: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        fontWeight: '700',
        color: C.accent,
    },
});