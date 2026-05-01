import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

type StageFeature = {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    body: string;
};

type AuthStageProps = {
    badgeIcon: keyof typeof Feather.glyphMap;
    badgeLabel: string;
    cardTitle: string;
    cardDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    heroQuote: string;
    heroQuoteAuthor: string;
    features: StageFeature[];
    children: ReactNode;
    footerPrompt: string;
    footerActionLabel: string;
    onFooterAction: () => void;
};

const C = {
    canvas: BROWN.Background,
    card: '#FFFFFF',
    accent: BROWN.DarkColor,
    accentDeep: BROWN.DarkColor,
    bronze: BROWN.SecondaryBackground,
    sand: BROWN.lightBackground,
    text: BROWN.TextPrimary,
    muted: BROWN.TextSecondary,
    line: BROWN.Border,
    white: '#FFFFFF',
};

export default function AuthStage({
    badgeIcon,
    badgeLabel,
    cardTitle,
    cardDescription,
    heroEyebrow,
    heroTitle,
    heroDescription,
    heroQuote,
    heroQuoteAuthor,
    features,
    children,
    footerPrompt,
    footerActionLabel,
    onFooterAction,
}: AuthStageProps) {
    const { width } = useWindowDimensions();
    const wide = width >= 980;
    const compact = width < 640;

    return (
        <View style={styles.page}>
            <View style={styles.backdropOrbA} />
            <View style={styles.backdropOrbB} />

            <View style={[styles.shell, compact && styles.shellCompact]}>
                <LinearGradient
                    colors={[BROWN.DarkColor, BROWN.SecondaryBackground, BROWN.lightColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.hero, !wide && styles.heroStacked]}
                >
                    <View style={styles.heroGlow} />

                    <View style={[styles.storyCol, !wide && styles.storyColWide]}>
                        <View style={styles.eyebrowRow}>
                            <View style={styles.eyebrowDot} />
                            <Text style={styles.eyebrow}>{heroEyebrow}</Text>
                        </View>

                        <Text style={styles.heroTitle}>{heroTitle}</Text>
                        <Text style={styles.heroDescription}>{heroDescription}</Text>

                        <View style={styles.quoteCard}>
                            <Feather name="feather" size={16} color={C.white} />
                            <Text style={styles.quoteText}>{heroQuote}</Text>
                            <Text style={styles.quoteAuthor}>{heroQuoteAuthor}</Text>
                        </View>

                        <View style={styles.featureList}>
                            {features.map((feature) => (
                                <Pressable key={feature.title} style={styles.featureItem}>
                                    <View style={styles.featureIconWrap}>
                                        <Feather name={feature.icon} size={16} color={C.white} />
                                    </View>
                                    <View style={styles.featureCopy}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureBody}>{feature.body}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.formCol, wide && styles.formColWide]}>
                        <View style={styles.formCard}>
                            <View style={styles.badge}>
                                <Feather name={badgeIcon} size={13} color={C.accent} />
                                <Text style={styles.badgeText}>{badgeLabel}</Text>
                            </View>

                            <Text style={styles.cardTitle}>{cardTitle}</Text>
                            <Text style={styles.cardDescription}>{cardDescription}</Text>

                            <View style={styles.formBody}>{children}</View>

                            <View style={styles.footerRow}>
                                <Text style={styles.footerPrompt}>{footerPrompt}</Text>
                                <TouchableOpacity onPress={onFooterAction} activeOpacity={0.75}>
                                    <Text style={styles.footerAction}>{footerActionLabel}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: C.canvas,
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 14,
        overflow: 'hidden',
    },
    shell: {
        width: '100%',
        maxWidth: 1280,
        alignSelf: 'center',
    },
    shellCompact: {
        paddingHorizontal: 0,
    },
    backdropOrbA: {
        position: 'absolute',
        top: 40,
        right: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(185,147,123,0.16)',
    },
    backdropOrbB: {
        position: 'absolute',
        bottom: 80,
        left: -100,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(113,67,41,0.10)',
    },
    hero: {
        borderRadius: 34,
        padding: 24,
        flexDirection: 'row',
        gap: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: Platform.OS === 'web' ? 0 : 0.14,
        shadowRadius: 24,
        elevation: 6,
    },
    heroStacked: {
        flexDirection: 'column',
    },
    heroGlow: {
        position: 'absolute',
        top: -40,
        right: -20,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    storyCol: {
        flex: 1.05,
        paddingVertical: 8,
    },
    storyColWide: {
        width: '100%',
    },
    eyebrowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    eyebrowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.card,
    },
    eyebrow: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 10,
        color: 'rgba(255,255,255,0.78)',
        textTransform: 'uppercase',
        letterSpacing: 2.2,
    },
    heroTitle: {
        fontFamily: BRAND_FONTS.heading,
        fontSize: 42,
        lineHeight: 48,
        color: C.white,
        marginBottom: 14,
        maxWidth: 520,
    },
    heroDescription: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 15,
        lineHeight: 26,
        color: 'rgba(255,255,255,0.78)',
        maxWidth: 560,
        marginBottom: 24,
    },
    quoteCard: {
        borderRadius: 20,
        padding: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        marginBottom: 22,
        maxWidth: 520,
    },
    quoteText: {
        fontFamily: BRAND_FONTS.heading,
        fontSize: 21,
        lineHeight: 30,
        color: C.white,
        marginTop: 10,
        marginBottom: 12,
    },
    quoteAuthor: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 12,
        color: 'rgba(255,255,255,0.74)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    featureList: {
        gap: 14,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    featureIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    featureCopy: {
        flex: 1,
    },
    featureTitle: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 14,
        color: C.white,
        marginBottom: 4,
    },
    featureBody: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.66)',
    },
    formCol: {
        flex: 0.92,
    },
    formColWide: {
        maxWidth: 470,
    },
    formCard: {
        borderRadius: 30,
        padding: 24,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.line,
    },
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.canvas,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 16,
    },
    badgeText: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 11,
        fontWeight: '700',
        color: C.accent,
        letterSpacing: 0.4,
    },
    cardTitle: {
        fontFamily: BRAND_FONTS.heading,
        fontSize: 30,
        lineHeight: 38,
        color: C.text,
        marginBottom: 8,
    },
    cardDescription: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        lineHeight: 22,
        color: C.muted,
        marginBottom: 18,
    },
    formBody: {
        gap: 14,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 20,
    },
    footerPrompt: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        color: C.muted,
    },
    footerAction: {
        fontFamily: BRAND_FONTS.body,
        fontSize: 13,
        fontWeight: '700',
        color: C.accentDeep,
    },
});