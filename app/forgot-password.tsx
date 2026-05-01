import AuthField from '@/components/Auth/AuthField';
import AuthStage from '@/components/Auth/AuthStage';
import PageShell from '@/components/PageShell';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { forgotPassword } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
    screen: BROWN.Background,
    text: BROWN.TextPrimary,
    muted: BROWN.TextSecondary,
    accent: BROWN.DarkColor,
    bronze: BROWN.SecondaryBackground,
    light: BROWN.lightColor,
    line: BROWN.Border,
    white: '#FFFFFF',
    softBg: 'rgba(255,255,255,0.72)',
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { scrollY, onScroll } = useHeaderScroll();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const btnScale = useRef(new Animated.Value(1)).current;

    const handleSubmit = async () => {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) {
            Alert.alert('Required', 'Please enter your email address.');
            return;
        }
        setSubmitting(true);
        Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
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
            Animated.spring(btnScale, { toValue: 1, tension: 180, friction: 7, useNativeDriver: true }).start();
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
            <Animated.ScrollView
                style={styles.root}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <PageShell scrollY={scrollY}>
                    <AuthStage
                        badgeIcon="mail"
                        badgeLabel="Account Recovery"
                        cardTitle="Reset access with your email."
                        cardDescription="Enter the email address attached to your account and we will generate a secure reset link for development or local testing."
                        heroEyebrow="Password Assistance"
                        heroTitle="A recovery flow styled with the same warm storefront language."
                        heroDescription="Use this step when you cannot sign in but still need access to orders, saved jewelry, and support history. The recovery path is simple and intentionally calm."
                        heroQuote="Good recovery flows feel reassuring. They do not make the customer work harder than the original sign-in."
                        heroQuoteAuthor="account support"
                        features={[
                            { icon: 'shield', title: 'Secure reset path', body: 'The backend generates a reset link without exposing password data.' },
                            { icon: 'mail', title: 'Email-led recovery', body: 'Use the same address tied to your saved orders and customer account.' },
                            { icon: 'arrow-left-circle', title: 'Fast return to sign in', body: 'Once the reset flow is complete, you can move straight back into the login page.' },
                        ]}
                        footerPrompt="Remembered it already?"
                        footerActionLabel="Back to sign in"
                        onFooterAction={() => router.push('/login' as any)}
                    >
                        <View style={styles.formGroup}>
                            <AuthField
                                icon="mail"
                                value={email}
                                placeholder="Email address"
                                onChange={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                textContentType="emailAddress"
                                returnKeyType="send"
                                onSubmitEditing={handleSubmit}
                            />
                        </View>

                        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                            <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.88}>
                                <LinearGradient
                                    colors={[BROWN.DarkColor, BROWN.SecondaryBackground, BROWN.lightColor]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitBtn}
                                >
                                    {submitting ? <ActivityIndicator color={C.white} /> : <Text style={styles.submitText}>Generate Reset Link</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.notePanel}>
                            <View style={styles.noteHeader}>
                                <Feather name="info" size={15} color={C.accent} />
                                <Text style={styles.noteTitle}>Development behavior</Text>
                            </View>
                            <Text style={styles.noteBody}>
                                When the API returns a reset URL, it is shown in an alert so you can continue the reset flow locally without email delivery.
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
    submitBtn: {
        minHeight: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
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
