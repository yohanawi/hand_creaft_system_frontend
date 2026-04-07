import { forgotPassword } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const J = {
    gold: '#C9A84C', goldLight: '#E8CA7A',
    garnet: '#6B1A2F', garnetLight: '#A0344F',
    cream: '#FAF6F0', parchment: '#F2EBE0',
    ivory: '#FFFAF5', ink: '#2C1A0E',
    wood: '#8B4513', woodDark: '#5C3317',
    muted: '#9B7B6A', border: '#E8D9C8', white: '#FFFFFF',
};

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Required', 'Please enter your email address.');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await forgotPassword({ email: email.trim() });
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
        <LinearGradient colors={[J.woodDark, J.garnet, J.garnetLight]} style={styles.root}>
            <View style={styles.ring1} />
            <View style={styles.ring2} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={18} color={J.goldLight} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.card}>
                        {/* Brand mark */}
                        <View style={styles.brandMark}>
                            <LinearGradient colors={[J.garnetLight, J.garnet]} style={styles.brandCircle}>
                                <Feather name="mail" size={24} color={J.gold} />
                            </LinearGradient>
                        </View>
                        <Text style={styles.eyebrow}>✦ ACCOUNT RECOVERY ✦</Text>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>Enter your registered email and we'll generate a secure reset link for you.</Text>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Feather name="star" size={12} color={J.gold} style={{ marginHorizontal: 10 }} />
                            <View style={styles.dividerLine} />
                        </View>

                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrap}>
                            <Feather name="mail" size={16} color={J.muted} style={{ marginRight: 10 }} />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor={J.muted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={submitting}
                            style={[styles.submitWrap, submitting && { opacity: 0.7 }]}
                        >
                            <LinearGradient colors={[J.garnetLight, J.garnet]} style={styles.submitBtn}>
                                {submitting
                                    ? <ActivityIndicator color={J.white} />
                                    : <Text style={styles.submitText}>Generate Reset Link</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.loginLink}>
                            <Text style={styles.loginLinkText}>Remember your password? </Text>
                            <Text style={[styles.loginLinkText, { color: J.garnet, fontWeight: '700' }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    ring1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: J.gold + '25', top: -80, right: -80 },
    ring2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: J.goldLight + '20', bottom: 60, left: -60 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
    backText: { color: J.goldLight, fontWeight: '600' },
    card: { backgroundColor: J.ivory, borderRadius: 24, padding: 28, shadowColor: J.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: J.border },
    brandMark: { alignItems: 'center', marginBottom: 18 },
    brandCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: J.gold },
    eyebrow: { textAlign: 'center', color: J.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
    title: { textAlign: 'center', color: J.ink, fontSize: 26, fontWeight: '800', marginBottom: 8 },
    subtitle: { textAlign: 'center', color: J.muted, fontSize: 14, lineHeight: 22, marginBottom: 4 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: J.border },
    label: { color: J.ink, fontWeight: '700', fontSize: 13, marginBottom: 8 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: J.white, borderWidth: 1.5, borderColor: J.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 20 },
    input: { flex: 1, fontSize: 15, color: J.ink },
    submitWrap: { borderRadius: 14, overflow: 'hidden', marginBottom: 18 },
    submitBtn: { paddingVertical: 15, alignItems: 'center', borderRadius: 14 },
    submitText: { color: J.white, fontWeight: '800', fontSize: 16 },
    loginLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginLinkText: { color: J.muted, fontSize: 14 },
});
