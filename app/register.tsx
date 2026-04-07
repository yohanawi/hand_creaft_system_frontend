import { registerUser } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

const { width: SW, height: SH } = Dimensions.get('window');

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    forest:     '#1A3D2B',
    pine:       '#2D5A3D',
    fern:       '#4A8C5C',
    moss:       '#6BAF7A',
    sage:       '#95C9A0',
    mist:       '#E8F5EB',
    cream:      '#FAF9F6',
    linen:      '#F2EDE4',
    kraft:      '#C8A96E',
    terra:      '#C1622F',
    bark:       '#5C3317',
    charcoal:   '#2A2A2A',
    muted:      '#7A8C7E',
    white:      '#FFFFFF',
};

// ── Responsive hook ───────────────────────────────────────────────────────────
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

// ── Password strength logic ───────────────────────────────────────────────────
function getStrength(pw: string): { level: number; label: string; color: string } {
    if (pw.length === 0) return { level: 0, label: '', color: 'transparent' };
    if (pw.length < 6)   return { level: 1, label: 'Too short', color: '#E05252' };
    if (pw.length < 10)  return { level: 2, label: 'Medium',    color: T.kraft   };
    const hasUpper   = /[A-Z]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    if (hasUpper && hasSpecial) return { level: 4, label: 'Very strong', color: T.fern };
    if (hasUpper || hasSpecial) return { level: 3, label: 'Strong',      color: T.moss };
    return { level: 3, label: 'Strong', color: T.moss };
}

// ── Floating craft icon ───────────────────────────────────────────────────────
const FLOATERS = [
    { icon: 'gift',         size: 26, x: '82%', y: '8%',  op: 0.18, d: 0   },
    { icon: 'scissors',     size: 20, x: '8%',  y: '18%', op: 0.14, d: 400 },
    { icon: 'award',        size: 22, x: '75%', y: '52%', op: 0.15, d: 200 },
    { icon: 'heart',        size: 18, x: '12%', y: '65%', op: 0.13, d: 600 },
    { icon: 'star',         size: 16, x: '60%', y: '80%', op: 0.12, d: 300 },
    { icon: 'shopping-bag', size: 24, x: '35%', y: '6%',  op: 0.10, d: 500 },
];

function FloaterIcon({ icon, size, opacity, delay }: any) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 3000 + delay * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true, delay }),
                Animated.timing(anim, { toValue: 0, duration: 3000 + delay * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const ty     = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
    const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] });
    return (
        <Animated.View style={{ transform: [{ translateY: ty }, { rotate }], opacity }}>
            <Feather name={icon} size={size} color={T.white} />
        </Animated.View>
    );
}

// ── Animated input field ──────────────────────────────────────────────────────
function InputField({ icon, placeholder, value, onChange, secure, right, keyboard, capitalize }: any) {
    const [focused, setFocused] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
    const focus  = () => { setFocused(true);  Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start(); };
    const blur   = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); };
    const border = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(107,175,122,0.25)', T.fern] });
    const bg     = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(232,245,235,0.6)', T.cream] });
    return (
        <Animated.View style={[s.inputWrap, { borderColor: border, backgroundColor: bg }]}>
            <Feather name={icon} size={18} color={focused ? T.fern : T.muted} style={{ marginRight: 11 }} />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={T.muted}
                value={value}
                onChangeText={onChange}
                onFocus={focus}
                onBlur={blur}
                secureTextEntry={secure}
                keyboardType={keyboard}
                autoCapitalize={capitalize ?? 'none'}
                style={s.input}
            />
            {right}
        </Animated.View>
    );
}

// ── Social button ─────────────────────────────────────────────────────────────
function SocialBtn({ children }: any) {
    const sc = useRef(new Animated.Value(1)).current;
    return (
        <Animated.View style={{ transform: [{ scale: sc }], flex: 1 }}>
            <Pressable
                onPressIn={() => Animated.spring(sc, { toValue: 0.92, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(sc, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }).start()}
                style={s.socialBtn}
            >{children}</Pressable>
        </Animated.View>
    );
}

// ── Strength meter ────────────────────────────────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
    const { level, label, color } = getStrength(password);
    if (!password) return null;
    return (
        <View style={s.strengthWrap}>
            <View style={s.strengthBars}>
                {[1, 2, 3, 4].map(i => (
                    <View
                        key={i}
                        style={[s.strengthBar, { backgroundColor: i <= level ? color : 'rgba(107,175,122,0.15)' }]}
                    />
                ))}
            </View>
            <Text style={[s.strengthLabel, { color }]}>{label}</Text>
        </View>
    );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
    return (
        <View style={s.stepDots}>
            {Array.from({ length: total }).map((_, i) => (
                <View key={i} style={[s.stepDot, i < current && s.stepDotActive, i === current - 1 && s.stepDotCurrent]} />
            ))}
        </View>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RegisterScreen() {
    const { isMobile, isTablet } = useDims();
    const router = useRouter();

    const [name,            setName]            = useState('');
    const [email,           setEmail]           = useState('');
    const [password,        setPassword]        = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw,          setShowPw]          = useState(false);
    const [showCPw,         setShowCPw]         = useState(false);
    const [acceptTerms,     setAcceptTerms]     = useState(false);
    const [isLoading,       setIsLoading]       = useState(false);

    const fadeAnim   = useRef(new Animated.Value(0)).current;
    const slideLeft  = useRef(new Animated.Value(-40)).current;
    const slideRight = useRef(new Animated.Value(40)).current;
    const logoScale  = useRef(new Animated.Value(0.7)).current;
    const logoPulse  = useRef(new Animated.Value(1)).current;
    const spinAnim   = useRef(new Animated.Value(0)).current;
    const btnScale   = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.spring(slideLeft, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
            Animated.spring(slideRight,{ toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, delay: 200, useNativeDriver: true }),
        ]).start();

        Animated.loop(Animated.sequence([
            Animated.timing(logoPulse, { toValue: 1.07, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(logoPulse, { toValue: 1,    duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();

        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, []);

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    const handleRegister = async () => {
        if (!name || !email || !password) { Alert.alert('Required Fields', 'Please fill in all fields'); return; }
        if (password !== confirmPassword)  { Alert.alert('Mismatch', 'Passwords do not match'); return; }
        if (password.length < 6)           { Alert.alert('Weak Password', 'Password must be at least 6 characters'); return; }
        if (!acceptTerms)                  { Alert.alert('Terms', 'Please accept the Terms & Conditions'); return; }

        setIsLoading(true);
        Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
        try {
            await registerUser({ name, email, password });
            Alert.alert('Welcome to HandCraft! 🎉', 'Your account has been created', [
                { text: 'Sign In', onPress: () => router.push('/login') },
            ]);
        } catch (err: any) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again');
        } finally {
            setIsLoading(false);
            Animated.spring(btnScale, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }).start();
        }
    };

    // ── Brand panel ───────────────────────────────────────────────────────────
    const BrandPanel = () => (
        <LinearGradient
            colors={[T.forest, T.pine, T.fern, T.moss]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.brand}
        >
            {/* Rotating dashed ring */}
            <Animated.View style={[s.spinRing, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[s.spinRingInner, { transform: [{ rotate: spin }] }]} />

            {/* Floating icons */}
            {FLOATERS.map((f, i) => (
                <Animated.View key={i} style={[s.floater, { left: f.x as any, top: f.y as any }]}>
                    <FloaterIcon icon={f.icon} size={f.size} opacity={f.op} delay={f.d} />
                </Animated.View>
            ))}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.brandScroll}>
                {/* Logo */}
                <Animated.View style={{ transform: [{ scale: logoScale }], alignItems: 'center', marginBottom: 24 }}>
                    <Animated.View style={[s.logoRing, { transform: [{ scale: logoPulse }] }]}>
                        <View style={s.logoInner}>
                            <Feather name="user-plus" size={48} color={T.white} />
                        </View>
                    </Animated.View>
                </Animated.View>

                <Text style={s.brandName}>HandCraft</Text>

                {/* Decorative dots */}
                <View style={s.dotLine}>
                    {['◆', '·', '◆', '·', '◆'].map((d, i) => (
                        <Text key={i} style={s.dotChar}>{d}</Text>
                    ))}
                </View>

                <Text style={s.brandTagline}>JOIN THE ARTISAN COMMUNITY</Text>
                <Text style={s.brandDesc}>
                    Turn your passion into a thriving craft business.{'\n'}
                    Connect with buyers who value the handmade.
                </Text>

                {/* Stats card */}
                <View style={s.statsCard}>
                    {[
                        { num: '10K+', lbl: 'Artisans' },
                        { num: '50K+', lbl: 'Products' },
                        { num: '150+', lbl: 'Countries' },
                    ].map((stat, i, arr) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={s.statCell}>
                                <Text style={s.statNum}>{stat.num}</Text>
                                <Text style={s.statLbl}>{stat.lbl}</Text>
                            </View>
                            {i < arr.length - 1 && <View style={s.statSep} />}
                        </View>
                    ))}
                </View>

                {/* Benefits */}
                {[
                    { icon: 'trending-up', title: 'Grow Your Business',   sub: 'Reach global buyers instantly'      },
                    { icon: 'shield',      title: 'Secure Transactions',  sub: 'End-to-end payment protection'      },
                    { icon: 'award',       title: 'Artisan Verified',     sub: 'Build trust with a verified badge'  },
                    { icon: 'users',       title: 'Community Support',    sub: 'Learn from fellow craftspeople'     },
                ].map((b, i) => (
                    <Animated.View
                        key={i}
                        style={[s.benefit, {
                            opacity: fadeAnim,
                            transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                        }]}
                    >
                        <View style={s.benefitIcon}>
                            <Feather name={b.icon as any} size={18} color={T.fern} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.benefitTitle}>{b.title}</Text>
                            <Text style={s.benefitSub}>{b.sub}</Text>
                        </View>
                    </Animated.View>
                ))}

                {/* Already member */}
                <TouchableOpacity style={s.alreadyBtn} onPress={() => router.push('/login')} activeOpacity={0.85}>
                    <Text style={s.alreadyBtnText}>Already a member? Sign In</Text>
                    <Feather name="arrow-right" size={15} color={T.fern} />
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );

    // ── Form panel ────────────────────────────────────────────────────────────
    const FormPanel = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[s.formScroll, isMobile && s.formScrollMobile]}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[s.formInner, isMobile && s.formInnerMobile]}>

                {/* Mobile logo row */}
                {isMobile && (
                    <View style={s.mobileLogo}>
                        <Animated.View style={[s.mobileLogoIcon, { transform: [{ scale: logoPulse }] }]}>
                            <Feather name="user-plus" size={28} color={T.white} />
                        </Animated.View>
                        <View>
                            <Text style={s.mobileLogoName}>HandCraft</Text>
                            <Text style={s.mobileLogoSub}>ARTISAN COMMUNITY</Text>
                        </View>
                    </View>
                )}

                {/* Back button */}
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                    <View style={s.backBtnIcon}>
                        <Feather name="arrow-left" size={16} color={T.fern} />
                    </View>
                    <Text style={s.backBtnText}>Back</Text>
                </TouchableOpacity>

                {/* Progress */}
                <View style={s.progressRow}>
                    <StepDots current={1} total={1} />
                    <Text style={s.progressLabel}>Account Setup</Text>
                </View>

                {/* Headline */}
                <View style={s.formHeader}>
                    <Text style={s.formEyebrow}>NEW ACCOUNT</Text>
                    <Text style={[s.formTitle, isMobile && s.formTitleMobile]}>
                        Start Your{'\n'}
                        <Text style={s.formTitleAccent}>Journey.</Text>
                    </Text>
                    <Text style={s.formSubtitle}>Join thousands of artisans worldwide</Text>
                </View>

                {/* Fields */}
                <View style={s.fields}>
                    <InputField
                        icon="user"
                        placeholder="Full name"
                        value={name}
                        onChange={setName}
                        capitalize="words"
                    />
                    <InputField
                        icon="mail"
                        placeholder="Email address"
                        value={email}
                        onChange={setEmail}
                        keyboard="email-address"
                    />
                    <InputField
                        icon="lock"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={setPassword}
                        secure={!showPw}
                        right={
                            <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Feather name={showPw ? 'eye' : 'eye-off'} size={18} color={T.muted} />
                            </TouchableOpacity>
                        }
                    />

                    <StrengthMeter password={password} />

                    <InputField
                        icon="lock"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        secure={!showCPw}
                        right={
                            <TouchableOpacity onPress={() => setShowCPw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Feather name={showCPw ? 'eye' : 'eye-off'} size={18} color={T.muted} />
                            </TouchableOpacity>
                        }
                    />

                    {/* Password match indicator */}
                    {confirmPassword.length > 0 && (
                        <View style={s.matchRow}>
                            <Feather
                                name={password === confirmPassword ? 'check-circle' : 'x-circle'}
                                size={14}
                                color={password === confirmPassword ? T.fern : '#E05252'}
                            />
                            <Text style={[s.matchText, { color: password === confirmPassword ? T.fern : '#E05252' }]}>
                                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Terms */}
                <TouchableOpacity style={s.termsRow} onPress={() => setAcceptTerms(v => !v)} activeOpacity={0.7}>
                    <View style={[s.checkbox, acceptTerms && s.checkboxActive]}>
                        {acceptTerms && <Feather name="check" size={11} color={T.white} />}
                    </View>
                    <Text style={s.termsText}>
                        I agree to the{' '}
                        <Text style={s.termsLink}>Terms & Conditions</Text>
                        {' '}and{' '}
                        <Text style={s.termsLink}>Privacy Policy</Text>
                    </Text>
                </TouchableOpacity>

                {/* Submit */}
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity onPress={handleRegister} disabled={isLoading} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[T.forest, T.pine, T.fern]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.submitBtn}
                        >
                            <Text style={s.submitBtnText}>
                                {isLoading ? 'Creating Account…' : 'Create Account'}
                            </Text>
                            {!isLoading && <Feather name="arrow-right" size={19} color={T.white} style={{ marginLeft: 8 }} />}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={s.divider}>
                    <View style={s.divLine} />
                    <Text style={s.divText}>OR SIGN UP WITH</Text>
                    <View style={s.divLine} />
                </View>

                {/* Social */}
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

                {/* Sign in link */}
                <View style={s.signInRow}>
                    <Text style={s.signInPrompt}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                        <Text style={s.signInLink}>Sign In →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.root}
        >
            <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
                {isMobile ? (
                    <LinearGradient
                        colors={[T.forest, T.pine, T.fern, T.cream]}
                        locations={[0, 0.18, 0.35, 0.35]}
                        style={s.flex}
                    >
                        {FLOATERS.slice(0, 3).map((f, i) => (
                            <Animated.View key={i} style={[s.floater, { left: f.x as any, top: i === 0 ? '3%' : i === 1 ? '9%' : '20%', zIndex: 0 }]}>
                                <FloaterIcon icon={f.icon} size={f.size} opacity={f.op} delay={f.d} />
                            </Animated.View>
                        ))}
                        <Animated.View style={[s.mobileCard, { transform: [{ translateY: slideRight }] }]}>
                            <FormPanel />
                        </Animated.View>
                    </LinearGradient>
                ) : (
                    <View style={s.split}>
                        {/* Brand left */}
                        <Animated.View style={[s.brandCol, isTablet ? { width: '42%' } : { width: '44%' }, { transform: [{ translateX: slideLeft }] }]}>
                            <BrandPanel />
                        </Animated.View>
                        {/* Form right */}
                        <Animated.View style={[s.formCol, { transform: [{ translateX: slideRight }] }]}>
                            <View style={s.formColBg}>
                                <View style={s.formColAccent1} />
                                <View style={s.formColAccent2} />
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
    root: { flex: 1, backgroundColor: T.forest },
    flex: { flex: 1 },

    // Layout
    split:    { flex: 1, flexDirection: 'row' },
    brandCol: { flexShrink: 0 },
    formCol:  { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: T.cream },
    formColBg:     { ...StyleSheet.absoluteFillObject, backgroundColor: T.cream },
    formColAccent1:{ position: 'absolute', top: -100, right: -100, width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(107,175,122,0.06)' },
    formColAccent2:{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(200,169,110,0.05)' },

    // Brand
    brand:     { flex: 1, overflow: 'hidden', position: 'relative' },
    spinRing:  { position: 'absolute', top: '50%', left: '50%', marginTop: -220, marginLeft: -220, width: 440, height: 440, borderRadius: 220, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' },
    spinRingInner: { position: 'absolute', top: '50%', left: '50%', marginTop: -140, marginLeft: -140, width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' },
    floater:   { position: 'absolute', zIndex: 1 },
    brandScroll:{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 52, paddingHorizontal: 40, zIndex: 2 },

    // Logo
    logoRing:  { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
    logoInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

    brandName:   { color: T.white, fontSize: 38, fontWeight: '800', letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginBottom: 14 },
    dotLine:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    dotChar:     { color: T.kraft, fontSize: 10, fontWeight: '700' },
    brandTagline:{ color: T.kraft, fontSize: 10, fontWeight: '700', letterSpacing: 3, textAlign: 'center', marginBottom: 16 },
    brandDesc:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 21, textAlign: 'center', marginBottom: 24 },

    // Stats
    statsCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', width: '100%' },
    statCell:   { alignItems: 'center', flex: 1 },
    statNum:    { color: T.white, fontSize: 24, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    statLbl:    { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
    statSep:    { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

    // Benefits
    benefit:     { flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 13, marginBottom: 9, borderLeftWidth: 3, borderLeftColor: T.moss, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    benefitIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.white, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    benefitTitle:{ color: T.white, fontSize: 13, fontWeight: '700', marginBottom: 1 },
    benefitSub:  { color: 'rgba(255,255,255,0.58)', fontSize: 11 },

    alreadyBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, borderRadius: 100, paddingVertical: 12, paddingHorizontal: 24, marginTop: 20, gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
    alreadyBtnText: { color: T.fern, fontSize: 14, fontWeight: '700' },

    // Mobile
    mobileCard:  { flex: 1, marginTop: 170, backgroundColor: T.cream, borderTopLeftRadius: 36, borderTopRightRadius: 36, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: -6 }, elevation: 20, overflow: 'hidden' },
    mobileLogo:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    mobileLogoIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: T.fern, alignItems: 'center', justifyContent: 'center', shadowColor: T.fern, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
    mobileLogoName: { color: T.forest, fontSize: 20, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    mobileLogoSub:  { color: T.muted, fontSize: 10, fontWeight: '600', letterSpacing: 2 },

    // Form
    formScroll:       { flexGrow: 1 },
    formScrollMobile: {},
    formInner:        { flex: 1, justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 44, maxWidth: 480, alignSelf: 'center', width: '100%' },
    formInnerMobile:  { paddingHorizontal: 26, paddingVertical: 28 },

    backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, alignSelf: 'flex-start' },
    backBtnIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(107,175,122,0.12)', alignItems: 'center', justifyContent: 'center' },
    backBtnText: { color: T.fern, fontSize: 14, fontWeight: '600' },

    progressRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    stepDots:      { flexDirection: 'row', gap: 5 },
    stepDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(107,175,122,0.2)' },
    stepDotActive: { backgroundColor: T.moss },
    stepDotCurrent:{ width: 22, backgroundColor: T.fern },
    progressLabel: { color: T.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1 },

    formHeader:      { marginBottom: 28 },
    formEyebrow:     { color: T.fern, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
    formTitle:       { color: T.forest, fontSize: 44, fontWeight: '800', lineHeight: 50, marginBottom: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    formTitleMobile: { fontSize: 34, lineHeight: 40 },
    formTitleAccent: { color: T.fern },
    formSubtitle:    { color: T.muted, fontSize: 14 },

    fields:   { gap: 12, marginBottom: 16 },
    inputWrap:{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 15, height: 54, shadowColor: T.fern, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    input:    { flex: 1, fontSize: 15, color: T.charcoal, height: '100%' },
 
    // Strength
    strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -4, marginBottom: 4 },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar:  { flex: 1, height: 3.5, borderRadius: 2 },
    strengthLabel:{ fontSize: 12, fontWeight: '600', minWidth: 70, textAlign: 'right' },

    matchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
    matchText:{ fontSize: 12, fontWeight: '600' },

    // Terms
    termsRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 22 },
    checkbox:     { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(107,175,122,0.4)', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
    checkboxActive:{ backgroundColor: T.fern, borderColor: T.fern },
    termsText:    { flex: 1, color: T.muted, fontSize: 13, lineHeight: 20 },
    termsLink:    { color: T.fern, fontWeight: '700' },

    // Submit
    submitBtn:    { height: 54, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 26, shadowColor: T.fern, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 7 },
    submitBtnText:{ color: T.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
    divLine: { flex: 1, height: 1, backgroundColor: 'rgba(74,140,92,0.15)' },
    divText: { color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

    // Social
    socialRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    socialBtn: { flex: 1, height: 48, borderRadius: 13, backgroundColor: T.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(107,175,122,0.25)', gap: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    googleLetter: { fontSize: 17, fontWeight: '800', color: '#DB4437' },
    socialLabel:  { fontSize: 10, color: T.muted, fontWeight: '600' },

    // Footer
    signInRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    signInPrompt: { color: T.muted, fontSize: 14 },
    signInLink:   { color: T.fern, fontSize: 14, fontWeight: '700' },
});