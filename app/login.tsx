import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import AuthContext from '@/context/AuthContext';
import { loginUser, setAuthToken } from '@/services/api';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
    bark: '#2C1810',
    espresso: '#4A2515',
    clay: '#8B4513',
    terra: '#C1622F',
    kraft: '#D4A96A',
    sand: '#EDD9B8',
    cream: '#FAF6F0',
    linen: '#F5EDE0',
    sage: '#6B7C5E',
    muted: '#8C7B6E',
    charcoal: '#2D2926',
    white: '#FFFFFF',
};

// ── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: 'shield', title: 'Secure Payments', sub: 'End-to-end encrypted transactions' },
    { icon: 'users', title: '10K+ Artisans', sub: 'Verified creators worldwide' },
    { icon: 'globe', title: '150+ Countries', sub: 'International shipping' },
    { icon: 'award', title: 'Quality Guarantee', sub: 'Every item handpicked' },
];

// ── Floating icon spec ────────────────────────────────────────────────────────
const FLOATERS = [
    { icon: 'scissors', size: 28, x: '80%', y: '12%', opacity: 0.18 },
    { icon: 'package', size: 22, x: '10%', y: '25%', opacity: 0.13 },
    { icon: 'heart', size: 20, x: '75%', y: '58%', opacity: 0.16 },
    { icon: 'star', size: 18, x: '15%', y: '72%', opacity: 0.14 },
    { icon: 'feather', size: 24, x: '60%', y: '82%', opacity: 0.12 },
    { icon: 'sun', size: 16, x: '35%', y: '10%', opacity: 0.10 },
];

// ── Hook: responsive breakpoint ──────────────────────────────────────────────
function useDims() {
    const [dims, setDims] = useState({ w: SW, h: SH });
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) =>
            setDims({ w: window.width, h: window.height })
        );
        return () => sub?.remove();
    }, []);
    return { ...dims, isMobile: dims.w < 768, isTablet: dims.w >= 768 && dims.w < 1024 };
}

// ── FloaterIcon ──────────────────────────────────────────────────────────────
function FloaterIcon({ icon, size, opacity, delay }: any) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 3200 + delay * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, delay }),
                Animated.timing(anim, { toValue: 0, duration: 3200 + delay * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
    const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '12deg'] });
    return (
        <Animated.View style={{ transform: [{ translateY }, { rotate }], opacity }}>
            <Feather name={icon} size={size} color={T.white} />
        </Animated.View>
    );
}

// ── SocialBtn ────────────────────────────────────────────────────────────────
function SocialBtn({ children, onPress }: any) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
            <Pressable
                onPressIn={() => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(scale, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }).start()}
                onPress={onPress}
                style={s.socialBtn}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

// ── InputField ───────────────────────────────────────────────────────────────
function InputField({ icon, placeholder, value, onChange, secureEntry, right, keyboardType }: any) {
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const onFocus = () => { setFocused(true); Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start(); };
    const onBlur = () => { setFocused(false); Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(); };
    const borderColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(212,169,106,0.3)', T.terra] });
    const bgColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(245,237,224,0.8)', 'rgba(250,246,240,1)'] });

    return (
        <Animated.View style={[s.inputWrap, { borderColor, backgroundColor: bgColor }]}>
            <Feather name={icon} size={19} color={focused ? T.terra : T.muted} style={{ marginRight: 12 }} />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={T.muted}
                value={value}
                onChangeText={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                secureTextEntry={secureEntry}
                keyboardType={keyboardType}
                autoCapitalize="none"
                style={s.input}
            />
            {right}
        </Animated.View>
    );
}

// ── FeatureCard ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, sub, index }: any) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 500, delay: 400 + index * 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, []);
    return (
        <Animated.View style={[s.featureCard, { opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
            <View style={s.featureIconWrap}>
                <Feather name={icon} size={20} color={T.clay} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{title}</Text>
                <Text style={s.featureSub}>{sub}</Text>
            </View>
        </Animated.View>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
    const { isMobile, isTablet } = useDims();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideLeft = useRef(new Animated.Value(-40)).current;
    const slideRight = useRef(new Animated.Value(40)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoPulse = useRef(new Animated.Value(1)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    const authContext = useContext(AuthContext);
    const router = useRouter();
    if (!authContext) throw new Error('AuthContext must be used within AuthProvider');
    const { login } = authContext;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.spring(slideLeft, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
            Animated.spring(slideRight, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, delay: 200, useNativeDriver: true }),
        ]).start();

        Animated.loop(Animated.sequence([
            Animated.timing(logoPulse, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(logoPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) { Alert.alert('Required', 'Please enter email and password'); return; }
        setIsLoading(true);
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
        try {
            const res = await loginUser({ email, password });
            const { token, user } = res.data;
            setAuthToken(token);
            login(token, { id: user.id, name: user.name, email: user.email, role: user.role });
            if (user.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/');
            }
        } catch (err: any) {
            Alert.alert('Login Failed', err.response?.data?.message || 'Please check your credentials');
        } finally {
            setIsLoading(false);
            Animated.spring(btnScale, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }).start();
        }
    };

    // ── Shared: form panel ────────────────────────────────────────────────────
    const FormPanel = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[s.formScroll, isMobile && s.formScrollMobile]}
            keyboardShouldPersistTaps="handled"
        > 
            <View style={[s.formInner, isMobile && s.formInnerMobile]}>

                {/* Mobile-only logo strip */}
                {isMobile && (
                    <View style={s.mobileLogo}>
                        <Animated.View style={[s.mobileLogoIcon, { transform: [{ scale: logoPulse }] }]}>
                            <Feather name="scissors" size={30} color={T.white} />
                        </Animated.View>
                        <View>
                            <Text style={s.mobileLogoName}>HandCraft</Text>
                            <Text style={s.mobileLogoTagline}>ARTISAN MARKETPLACE</Text>
                        </View>
                    </View>
                )}

                {/* Headline */}
                <View style={s.formHeader}>
                    <Text style={s.formEyebrow}>SIGN IN</Text>
                    <Text style={[s.formTitle, isMobile && s.formTitleMobile]}>Welcome{'\n'}Back.</Text>
                    <Text style={s.formSubtitle}>Continue your artisan journey</Text>
                </View>

                {/* Inputs */}
                <View style={s.fields}>
                    <InputField
                        icon="mail"
                        placeholder="Email address"
                        value={email}
                        onChange={setEmail}
                        keyboardType="email-address"
                    />
                    <InputField
                        icon="lock"
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                        secureEntry={!showPassword}
                        right={
                            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Feather name={showPassword ? 'eye' : 'eye-off'} size={19} color={T.muted} />
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* Options row */}
                <View style={s.optionsRow}>
                    <TouchableOpacity style={s.rememberRow} onPress={() => setRememberMe(v => !v)} activeOpacity={0.7}>
                        <View style={[s.checkbox, rememberMe && s.checkboxActive]}>
                            {rememberMe && <Feather name="check" size={11} color={T.white} />}
                        </View>
                        <Text style={s.rememberText}>Remember me</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/forgot-password' as any)}>
                        <Text style={s.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit */}
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[T.espresso, T.clay, T.terra]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.submitBtn}
                        >
                            {isLoading ? (
                                <Text style={s.submitBtnText}>Signing In…</Text>
                            ) : (
                                <>
                                    <Text style={s.submitBtnText}>Sign In</Text>
                                    <Feather name="arrow-right" size={20} color={T.white} style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={s.divider}>
                    <View style={s.dividerLine} />
                    <Text style={s.dividerText}>OR CONTINUE WITH</Text>
                    <View style={s.dividerLine} />
                </View>

                {/* Social row */}
                <View style={s.socialRow}>
                    <SocialBtn>
                        <Text style={s.googleLetter}>G</Text>
                        <Text style={s.socialLabel}>Google</Text>
                    </SocialBtn>
                    <SocialBtn>
                        <Feather name="facebook" size={20} color="#1877F2" />
                        <Text style={s.socialLabel}>Facebook</Text>
                    </SocialBtn>
                    <SocialBtn>
                        <Feather name="github" size={20} color={T.charcoal} />
                        <Text style={s.socialLabel}>GitHub</Text>
                    </SocialBtn>
                </View>

                {/* Register link */}
                <View style={s.registerRow}>
                    <Text style={s.registerPrompt}>New to HandCraft? </Text>
                    <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                        <Text style={s.registerLink}>Create Account →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    // ── Brand panel (desktop/tablet left side) ────────────────────────────────
    const BrandPanel = () => (
        <LinearGradient
            colors={[T.bark, T.espresso, T.clay]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.brand}
        >
            {/* Floating icons */}
            {FLOATERS.map((f, i) => (
                <Animated.View
                    key={i}
                    style={[s.floater, { left: f.x as any, top: f.y as any }]}
                >
                    <FloaterIcon icon={f.icon} size={f.size} opacity={f.opacity} delay={i * 200} />
                </Animated.View>
            ))}

            {/* Big decorative ring */}
            <View style={s.brandRing1} />
            <View style={s.brandRing2} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.brandScroll}
            >
                {/* Logo lockup */}
                <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }] }]}>
                    <Animated.View style={[s.logoCircle, { transform: [{ scale: logoPulse }] }]}>
                        <Feather name="scissors" size={52} color={T.white} />
                    </Animated.View>
                </Animated.View>

                <Text style={s.brandName}>HandCraft</Text>

                <View style={s.brandDivider}>
                    <View style={s.brandDividerDot} />
                    <View style={s.brandDividerLine} />
                    <View style={s.brandDividerDot} />
                </View>

                <Text style={s.brandTagline}>ARTISAN MARKETPLACE</Text>

                <Text style={s.brandDesc}>
                    Discover extraordinary handcrafted{'\n'}pieces from independent creators.{'\n'}
                    Where every item tells a story.
                </Text>

                {/* Features */}
                <View style={s.featureList}>
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={i} {...f} index={i} />
                    ))}
                </View>

                {/* Explore CTA */}
                <TouchableOpacity
                    style={s.exploreCta}
                    onPress={() => router.push('/')}
                    activeOpacity={0.85}
                >
                    <Text style={s.exploreCtaText}>Explore Marketplace</Text>
                    <Feather name="arrow-right" size={17} color={T.clay} />
                </TouchableOpacity>

                {/* Testimonial */}
                <View style={s.testimonial}>
                    <Text style={s.testimonialText}>
                        "HandCraft helped me reach customers I never could have found on my own."
                    </Text>
                    <Text style={s.testimonialAuthor}>— Priya, ceramic artist</Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.root}
        >
            <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
                {isMobile ? (
                    /* ── Mobile: form-only, brand info collapsed into header strip ── */
                    <LinearGradient
                        colors={[T.bark, T.espresso, T.clay, T.cream]}
                        locations={[0, 0.2, 0.38, 0.38]}
                        style={s.flex}
                    >
                        {/* Floating icons behind header */}
                        {FLOATERS.slice(0, 3).map((f, i) => (
                            <Animated.View key={i} style={[s.floater, { left: f.x as any, top: i === 0 ? '4%' : i === 1 ? '10%' : '22%', zIndex: 0 }]}>
                                <FloaterIcon icon={f.icon} size={f.size} opacity={f.opacity} delay={i * 300} />
                            </Animated.View>
                        ))}

                        <Animated.View style={[s.mobileCard, { transform: [{ translateY: slideRight }] }]}>
                            <FormPanel />
                        </Animated.View>
                    </LinearGradient>
                ) : (
                    /* ── Tablet / Desktop: split screen ── */
                    <View style={s.splitScreen}>
                        <Animated.View
                            style={[
                                s.brandCol,
                                isTablet ? { width: '42%' } : { width: '45%' },
                                { transform: [{ translateX: slideLeft }] },
                            ]}
                        >
                            <BrandPanel />
                        </Animated.View>

                        <Animated.View
                            style={[s.formCol, { transform: [{ translateX: slideRight }] }]}
                        >
                            {/* Subtle craft paper texture bg */}
                            <View style={s.formBg}>
                                <View style={s.formBgAccent} />
                            </View>
                            <FormPanel />
                        </Animated.View>
                    </View>
                )}
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bark },
    flex: { flex: 1 },

    // Split screen
    splitScreen: { flex: 1, flexDirection: 'row' },
    brandCol: { flexShrink: 0 },
    formCol: { flex: 1, backgroundColor: T.cream, position: 'relative', overflow: 'hidden' },
    formBg: { position: 'absolute', inset: 0, backgroundColor: T.cream },
    formBgAccent: { position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(212,169,106,0.07)' },

    // Brand panel
    brand: { flex: 1, overflow: 'hidden', position: 'relative' },
    brandRing1: { position: 'absolute', right: -100, bottom: -100, width: 400, height: 400, borderRadius: 200, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    brandRing2: { position: 'absolute', right: -60, bottom: -60, width: 260, height: 260, borderRadius: 130, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    brandScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 56, paddingHorizontal: 40, zIndex: 2 },
    floater: { position: 'absolute', zIndex: 1 },

    // Logo
    logoWrap: { marginBottom: 24 },
    logoCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10,
    },
    brandName: { color: T.white, fontSize: 40, fontWeight: '800', letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginBottom: 16 },
    brandDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    brandDividerLine: { width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
    brandDividerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.kraft },
    brandTagline: { color: T.kraft, fontSize: 11, fontWeight: '700', letterSpacing: 3.5, textAlign: 'center', marginBottom: 20 },
    brandDesc: { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 32 },

    // Feature cards
    featureList: { width: '100%', gap: 10, marginBottom: 32 },
    featureCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderRadius: 16, padding: 14,
        borderLeftWidth: 3, borderLeftColor: T.kraft,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    featureIconWrap: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: T.white,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    featureTitle: { color: T.white, fontSize: 14, fontWeight: '700', marginBottom: 2 },
    featureSub: { color: 'rgba(255,255,255,0.62)', fontSize: 12 },

    // Explore CTA
    exploreCta: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: T.white, borderRadius: 100,
        paddingVertical: 13, paddingHorizontal: 28,
        marginBottom: 28,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    exploreCtaText: { color: T.clay, fontSize: 15, fontWeight: '700' },

    // Testimonial
    testimonial: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        width: '100%',
    },
    testimonialText: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 20, fontStyle: 'italic', marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    testimonialAuthor: { color: T.kraft, fontSize: 12, fontWeight: '600' },

    // Mobile
    mobileCard: {
        flex: 1,
        marginTop: 180,
        backgroundColor: T.cream,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: -8 }, elevation: 20,
        overflow: 'hidden',
    },
    mobileLogo: {
        flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28,
        paddingTop: 8,
    },
    mobileLogoIcon: {
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: T.clay,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: T.clay, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    mobileLogoName: { color: T.bark, fontSize: 22, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    mobileLogoTagline: { color: T.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2 },

    // Form
    formScroll: { flexGrow: 1 },
    formScrollMobile: {},
    formInner: { flex: 1, justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 48, maxWidth: 480, alignSelf: 'center', width: '100%' },
    formInnerMobile: { paddingHorizontal: 28, paddingVertical: 32 },
    formHeader: { marginBottom: 32 },
    formEyebrow: { color: T.terra, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
    formTitle: { color: T.bark, fontSize: 48, fontWeight: '800', lineHeight: 52, marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    formTitleMobile: { fontSize: 36, lineHeight: 40 },
    formSubtitle: { color: T.muted, fontSize: 14 },

    // Fields
    fields: { gap: 14, marginBottom: 18 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderRadius: 16,
        paddingHorizontal: 16, height: 56,
        shadowColor: T.clay, shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    },
    input: { flex: 1, fontSize: 15, color: T.charcoal, height: '100%' },

    // Options
    optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: T.kraft, alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: T.clay, borderColor: T.clay },
    rememberText: { fontSize: 13, color: T.muted },
    forgotText: { fontSize: 13, fontWeight: '600', color: T.terra },

    // Submit
    submitBtn: {
        height: 56, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: T.clay, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
        marginBottom: 28,
    },
    submitBtnText: { color: T.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(139,69,19,0.15)' },
    dividerText: { color: T.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },

    // Social
    socialRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    socialBtn: {
        flex: 1, height: 50, borderRadius: 14,
        backgroundColor: T.white,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: 'rgba(212,169,106,0.3)',
        gap: 4,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    googleLetter: { fontSize: 18, fontWeight: '800', color: '#DB4437' },
    socialLabel: { fontSize: 11, color: T.muted, fontWeight: '600' },

    // Register
    registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    registerPrompt: { color: T.muted, fontSize: 14 },
    registerLink: { color: T.terra, fontSize: 14, fontWeight: '700' },
});