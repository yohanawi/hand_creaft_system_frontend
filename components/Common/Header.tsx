import { FREE_SHIPPING_THRESHOLD } from '@/components/Cart/cartTheme';
import HeaderCurrencyDropdown from '@/components/HeaderCurrencyDropdown';
import { AuthContext } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import api, { getApiErrorMessage, getAssetUrl } from '@/services/api';
import { formatConvertedPrice } from '@/utils/currency';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Linking, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
const TOP_BAR_HEIGHT = 46;
const MAIN_HEADER_OFFSET = 116;

const getShadowStyle = (webBoxShadow: string, nativeStyle: Record<string, unknown>) => (
    Platform.OS === 'web'
        ? ({ boxShadow: webBoxShadow } as any)
        : nativeStyle
);

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
    { label: 'Home', route: '/' },
    { label: 'Shop', route: '/shop' },
    { label: 'Categories', route: '/categories' },
    { label: 'Deals', route: '/deals' },
    { label: 'About', route: '/about' },
];

type MenuSubcategory = {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string | null;
    isFeatured?: boolean;
};

type MenuCategory = {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string | null;
    isFeatured?: boolean;
    subcategoryCount?: number;
    subcategories: MenuSubcategory[];
};

type VisualMenuSubcategory = MenuSubcategory & {
    icon: keyof typeof Feather.glyphMap;
    imageUri?: string | null;
};

type VisualMenuCategory = MenuCategory & {
    icon: keyof typeof Feather.glyphMap;
    color: string;
    imageUri?: string | null;
    subcategories: VisualMenuSubcategory[];
};

const CATEGORY_COLORS = ['#8B4513', '#CD853F', '#B76E3A', '#A45C2A', '#9C6644', '#6F4E37'];
const FALLBACK_CATEGORY_ICONS: (keyof typeof Feather.glyphMap)[] = ['shopping-bag', 'star', 'gift', 'heart', 'bookmark', 'award'];
const FALLBACK_SUBCATEGORY_ICONS: (keyof typeof Feather.glyphMap)[] = ['tag', 'star', 'gift', 'bookmark', 'award', 'package'];

const CATEGORY_ICON_RULES: { keywords: string[]; icon: keyof typeof Feather.glyphMap }[] = [
    { keywords: ['necklace', 'pendant', 'chain'], icon: 'disc' },
    { keywords: ['earring', 'stud', 'drop', 'hoop'], icon: 'circle' },
    { keywords: ['bracelet', 'bangle', 'cuff', 'watch'], icon: 'watch' },
    { keywords: ['ring', 'gemstone'], icon: 'award' },
    { keywords: ['anklet'], icon: 'sun' },
    { keywords: ['brooch', 'pin'], icon: 'star' },
    { keywords: ['hair'], icon: 'feather' },
    { keywords: ['bridal', 'wedding'], icon: 'heart' },
    { keywords: ['men', 'mens'], icon: 'user' },
    { keywords: ['personalized', 'initial', 'birthstone', 'custom'], icon: 'tag' },
];

const SUBCATEGORY_ICON_RULES: { keywords: string[]; icon: keyof typeof Feather.glyphMap }[] = [
    { keywords: ['pendant', 'layered', 'chain'], icon: 'disc' },
    { keywords: ['stud', 'drop', 'hoop'], icon: 'circle' },
    { keywords: ['charm', 'cuff', 'bracelet'], icon: 'watch' },
    { keywords: ['gemstone', 'stackable', 'ring'], icon: 'award' },
    { keywords: ['beaded'], icon: 'sun' },
    { keywords: ['floral'], icon: 'feather' },
    { keywords: ['bridal', 'bridesmaid'], icon: 'heart' },
    { keywords: ['clip', 'vine'], icon: 'bookmark' },
    { keywords: ['initial', 'birthstone'], icon: 'tag' },
    { keywords: ['men'], icon: 'user' },
];

const getKeywordIcon = (
    value: string,
    rules: { keywords: string[]; icon: keyof typeof Feather.glyphMap }[],
    fallbacks: (keyof typeof Feather.glyphMap)[],
    index: number,
) => {
    const normalizedValue = value.toLowerCase();
    const matched = rules.find((rule) => rule.keywords.some((keyword) => normalizedValue.includes(keyword)));
    return matched?.icon ?? fallbacks[index % fallbacks.length];
};

const resolveCategoryVisual = (value: string, index: number) => ({
    icon: getKeywordIcon(value, CATEGORY_ICON_RULES, FALLBACK_CATEGORY_ICONS, index),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
});

const resolveSubcategoryIcon = (value: string, index: number) => (
    getKeywordIcon(value, SUBCATEGORY_ICON_RULES, FALLBACK_SUBCATEGORY_ICONS, index)
);

const buildShopRoute = ({
    categorySlug,
    subcategorySlug,
}: {
    categorySlug?: string;
    subcategorySlug?: string;
}) => {
    const params: string[] = [];

    if (categorySlug) {
        params.push(`category=${encodeURIComponent(categorySlug)}`);
    }

    if (subcategorySlug) {
        params.push(`subcategory=${encodeURIComponent(subcategorySlug)}`);
    }

    return params.length > 0 ? `/shop?${params.join('&')}` : '/shop';
};

// ─── Social icon button ───────────────────────────────────────────────────────
function SocialBtn({ name }: { name: keyof typeof Feather.glyphMap }) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <TouchableOpacity
            onPressIn={() => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, tension: 60, friction: 4, useNativeDriver: true }).start()}
        >
            <Animated.View style={{
                transform: [{ scale }],
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.20)',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Feather name={name} size={16} color="#ffffff" />
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Nav link with animated underline ────────────────────────────────────────
function NavLink({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
    const underline = useRef(new Animated.Value(active ? 1 : 0)).current;

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={() => Animated.timing(underline, { toValue: 1, duration: 180, useNativeDriver: false }).start()}
            onPressOut={() => !active && Animated.timing(underline, { toValue: 0, duration: 220, useNativeDriver: false }).start()}
        >
            <View style={{ alignItems: 'center', paddingHorizontal: 4 }}>
                <Text style={{
                    color: active ? '#fff' : 'rgba(255,255,255,0.80)',
                    fontSize: 14,
                    fontWeight: active ? '700' : '500',
                }}>
                    {label}
                </Text>
                <Animated.View style={{
                    height: 2,
                    borderRadius: 2,
                    backgroundColor: '#B08463',
                    width: underline.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }} />
            </View>
        </TouchableOpacity>
    );
}

function MenuThumb({
    imageUri,
    icon,
    size,
    tintColor,
    fallbackBackgroundColor,
    borderRadius,
}: {
    imageUri?: string | null;
    icon: keyof typeof Feather.glyphMap;
    size: number;
    tintColor: string;
    fallbackBackgroundColor: string;
    borderRadius: number;
}) {
    if (imageUri) {
        return (
            <Image
                source={{ uri: imageUri }}
                style={{ width: size, height: size, borderRadius }}
                contentFit="cover"
                transition={150}
            />
        );
    }

    return (
        <View style={{
            width: size,
            height: size,
            borderRadius,
            backgroundColor: fallbackBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Feather name={icon} size={Math.max(12, Math.round(size * 0.46))} color={tintColor} />
        </View>
    );
}

// ─── Icon action button with badge ───────────────────────────────────────────
function IconBtn({
    icon,
    badge,
    onPress,
    light = false,
}: {
    icon: keyof typeof Feather.glyphMap;
    badge?: number;
    onPress?: () => void;
    light?: boolean;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={() => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, tension: 60, friction: 4, useNativeDriver: true }).start()}
        >
            <Animated.View style={{ transform: [{ scale }], position: 'relative' }}>
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: light ? '#fff' : 'rgba(255,255,255,0.13)',
                    borderWidth: 1,
                    borderColor: light ? 'transparent' : 'rgba(255,255,255,0.20)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Feather name={icon} size={19} color={light ? '#8B4513' : '#fff'} />
                </View>
                {!!badge && (
                    <View style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: '#EF4444',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1.5,
                        borderColor: '#8B4513',
                    }}>
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{badge}</Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

type HeaderProps = {
    scrollY?: Animated.Value;
};

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header({ scrollY }: HeaderProps) {

    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const { userToken, logout } = useContext(AuthContext)!;
    const { cartCount } = useCart();
    const { currency } = useCurrency();
    const { wishlistCount } = useWishlist();

    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [activeMegaCat, setActiveMegaCat] = useState(0);
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
    const [menuError, setMenuError] = useState<string | null>(null);
    const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const internalScrollY = useRef(new Animated.Value(0)).current;
    const resolvedScrollY = scrollY ?? internalScrollY;
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollOffsetRef = useRef(0);
    const hideOffsetRef = useRef(0);
    const topBarVisibleRef = useRef(true);
    const topBarAnimatingRef = useRef(false);

    const visualMenuCategories = React.useMemo<VisualMenuCategory[]>(() => (
        menuCategories.map((category, index): VisualMenuCategory => ({
            ...category,
            ...resolveCategoryVisual(`${category.slug} ${category.name}`, index),
            imageUri: getAssetUrl(category.image),
            subcategories: Array.isArray(category.subcategories)
                ? category.subcategories.map((subcategory, subIndex) => ({
                    ...subcategory,
                    icon: resolveSubcategoryIcon(`${subcategory.slug} ${subcategory.name}`, subIndex),
                    imageUri: getAssetUrl(subcategory.image),
                }))
                : [],
        }))
    ), [menuCategories]);

    const activeMegaCategory = visualMenuCategories[activeMegaCat] ?? null;



    const navigateToCategory = (categorySlug?: string) => {
        router.push(buildShopRoute({ categorySlug }) as any);
        setShowMegaMenu(false);
        setShowMenu(false);
    };

    const navigateToSubcategory = (categorySlug?: string, subcategorySlug?: string) => {
        router.push(buildShopRoute({ categorySlug, subcategorySlug }) as any);
        setShowMegaMenu(false);
        setShowMenu(false);
    };

    const activeNav = React.useMemo(() => {
        const raw = pathname.split('?')[0].split('#')[0];
        const normalized = raw !== '/' ? raw.replace(/\/+$/, '') : '/';

        const match = NAV_LINKS.find((link) => {
            if (link.route === '/') return normalized === '/';
            return normalized === link.route || normalized.startsWith(`${link.route}/`);
        });

        return match?.label ?? '';
    }, [pathname]);

    const slideDown = useRef(new Animated.Value(-120)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;
    const menuSlide = useRef(new Animated.Value(-320)).current;
    const searchH = useRef(new Animated.Value(0)).current;
    const overlayFade = useRef(new Animated.Value(0)).current;
    const topBarHeight = useRef(new Animated.Value(1)).current;

    // Entry
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideDown, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadMenuTree = async () => {
            try {
                setMenuError(null);
                const response = await api.get('/categories/menu-tree');
                if (!isMounted) return;

                const categories = Array.isArray(response.data) ? response.data : [];
                setMenuCategories(categories);
            } catch (error) {
                if (!isMounted) return;
                setMenuCategories([]);
                setMenuError(getApiErrorMessage(error, 'Unable to load categories right now.'));
            }
        };

        loadMenuTree();

        return () => {
            isMounted = false;
            if (megaCloseTimer.current) {
                clearTimeout(megaCloseTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (activeMegaCat < visualMenuCategories.length) {
            return;
        }

        setActiveMegaCat(0);
    }, [activeMegaCat, visualMenuCategories.length]);

    useEffect(() => {
        if (visualMenuCategories.length > 0) {
            return;
        }

        setShowMegaMenu(false);
    }, [visualMenuCategories.length]);

    useEffect(() => {
        if (scrollY || Platform.OS !== 'web') return;

        const handleScroll = () => {
            internalScrollY.setValue(window.scrollY);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [internalScrollY, scrollY]);

    useEffect(() => {
        const listener = resolvedScrollY.addListener(({ value }) => {
            const currentOffset = Math.max(0, value);
            const delta = currentOffset - lastScrollOffsetRef.current;
            const isScrollingDown = delta > 2;
            const isScrollingUp = delta < -2;

            if (topBarAnimatingRef.current) {
                lastScrollOffsetRef.current = currentOffset;
                return;
            }

            if (currentOffset <= 8) {
                if (!topBarVisibleRef.current) {
                    topBarVisibleRef.current = true;
                    hideOffsetRef.current = 0;
                    setShowTopBar(true);
                }
                lastScrollOffsetRef.current = currentOffset;
                return;
            }

            if (topBarVisibleRef.current) {
                if (isScrollingDown && currentOffset > 56) {
                    topBarVisibleRef.current = false;
                    hideOffsetRef.current = currentOffset;
                    setShowTopBar(false);
                }
            } else {
                const scrolledUpDistance = hideOffsetRef.current - currentOffset;

                if (isScrollingUp && scrolledUpDistance > 72) {
                    topBarVisibleRef.current = true;
                    setShowTopBar(true);
                }
            }

            lastScrollOffsetRef.current = currentOffset;
        });

        return () => {
            resolvedScrollY.removeListener(listener);
        };
    }, [resolvedScrollY]);

    useEffect(() => {
        topBarAnimatingRef.current = true;
        Animated.timing(topBarHeight, {
            toValue: showTopBar ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            topBarAnimatingRef.current = false;
        });
    }, [showTopBar, topBarHeight]);

    // Drawer
    useEffect(() => {
        Animated.spring(menuSlide, {
            toValue: showMenu ? 0 : -320,
            tension: 55, friction: 9,
            useNativeDriver: true,
        }).start();
        Animated.timing(overlayFade, {
            toValue: showMenu ? 1 : 0,
            duration: 280,
            useNativeDriver: true,
        }).start();
    }, [showMenu]);

    // Search bar
    useEffect(() => {
        Animated.spring(searchH, {
            toValue: showSearch ? 1 : 0,
            tension: 55, friction: 9,
            useNativeDriver: false,
        }).start();
    }, [showSearch]);

    const searchMaxH = searchH.interpolate({ inputRange: [0, 1], outputRange: [0, 64] });
    const searchOp = searchH.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const animatedTopBarHeight = topBarHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, TOP_BAR_HEIGHT],
    });
    const animatedOpacity = topBarHeight;
    const animatedMegaMenuTop = topBarHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [MAIN_HEADER_OFFSET - TOP_BAR_HEIGHT, MAIN_HEADER_OFFSET],
    });

    return (
        <>
            <Animated.View
                style={{
                    opacity: fadeIn,
                    transform: [{ translateY: slideDown }],
                    zIndex: 100,
                    ...(Platform.OS === 'web' ? { position: 'sticky' as any, top: 0 } : {}),
                }}>

                {/* ══════════════════════════════════════════
                    ROW 1 — Top bar
                ══════════════════════════════════════════ */}
                <Animated.View
                    style={{
                        height: animatedTopBarHeight,
                        opacity: animatedOpacity,
                        overflow: showTopBar ? 'visible' : 'hidden',
                        position: 'relative',
                        zIndex: 40,
                    }}
                >
                    <View className="bg-[#714329] py-[7px]" style={{ paddingHorizontal: isMobile ? 16 : 32, position: 'relative', zIndex: 40 }}>
                        <View className="flex-row items-center self-center justify-between w-full max-w-7xl">
                            {/* Left — contact info */}
                            <View className="flex-row items-center gap-4">
                                {/* Phone (group hover, tel link) */}
                                <Pressable
                                    className="flex-row items-center gap-1.5 group"
                                    onPress={() => {
                                        if (Platform.OS === 'web') {
                                            window.location.href = 'tel:+15551234567';
                                        }
                                    }}
                                    accessibilityRole="link"
                                    accessibilityLabel="Call +1 (555) 123-4567"
                                    style={({ hovered }) => [
                                        hovered && { opacity: 0.8 },
                                    ]}
                                >
                                    <View className="w-[32px] h-[32px] rounded-md bg-white/10 items-center justify-center border border-white/20 group-hover:bg-[#B9937B] group-hover:border-[#B9937B]">
                                        <Feather name="phone" size={16} color="#fff" />
                                    </View>
                                    {/* Use an anchor for web, Text for native */}
                                    {Platform.OS === 'web' ? (
                                        <a
                                            href="tel:+15551234567"
                                            className="font-medium text-white cursor-pointer text-md hover:text-[#B9937B]"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            +1 (555) 123-4567
                                        </a>
                                    ) : (
                                        <Text
                                            className="font-medium text-white cursor-pointer text-md"
                                            onPress={() => {
                                                // For mobile, open dialer
                                                Linking.openURL('tel:+15551234567');
                                            }}
                                        >
                                            +1 (555) 123-4567
                                        </Text>
                                    )}
                                </Pressable>

                                {!isMobile && (
                                    <>
                                        <View className="w-[1px] h-[12px] bg-white/20" />
                                        {/* Email (group hover, mailto link) */}
                                        <Pressable
                                            className="flex-row items-center gap-1.5 group"
                                            onPress={() => {
                                                if (Platform.OS === 'web') {
                                                    window.location.href = 'mailto:support@shophub.com';
                                                }
                                            }}
                                            accessibilityRole="link"
                                            accessibilityLabel="Email support@shophub.com"
                                            style={({ hovered }) => [
                                                hovered && { opacity: 0.8 },
                                            ]}
                                        >
                                            <View className="w-[32px] h-[32px] rounded-md bg-white/10 items-center justify-center border border-white/20 group-hover:bg-[#B9937B] group-hover:border-[#B9937B]">
                                                <Feather name="mail" size={16} color="#fff" />
                                            </View>
                                            {Platform.OS === 'web' ? (
                                                <a
                                                    href="mailto:support@shophub.com"
                                                    className="font-medium text-white cursor-pointer text-md hover:text-[#B9937B]"
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    support@shophub.com
                                                </a>
                                            ) : (
                                                <Text
                                                    className="font-medium text-white cursor-pointer text-md"
                                                    onPress={() => {
                                                        Linking.openURL('mailto:support@shophub.com');
                                                    }}
                                                >
                                                    support@shophub.com
                                                </Text>
                                            )}
                                        </Pressable>
                                    </>
                                )}
                            </View>

                            {/* Right — promo + socials */}
                            <View className="flex-row items-center gap-3.5">
                                {!isMobile && (
                                    <Text className="text-white text-sm tracking-[0.5px] gap-3 flex-row items-center hidden md:flex">
                                        <Feather name="truck" size={16} color="#fff" />
                                        Free shipping on orders over {formatConvertedPrice(FREE_SHIPPING_THRESHOLD, currency)}
                                    </Text>
                                )}
                                <HeaderCurrencyDropdown />
                                <View className="w-[1px] h-[12px] bg-white/20" />
                                <View className="flex-row items-center gap-1.5">
                                    {/* Social links: use <a> for web, Pressable for native */}
                                    {Platform.OS === 'web' ? (
                                        <>
                                            <a
                                                href="https://facebook.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Facebook"
                                                style={{ display: 'inline-block' }}
                                            >
                                                <SocialBtn name="facebook" />
                                            </a>
                                            <a
                                                href="https://twitter.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Twitter"
                                                style={{ display: 'inline-block' }}
                                            >
                                                <SocialBtn name="twitter" />
                                            </a>
                                            <a
                                                href="https://instagram.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Instagram"
                                                style={{ display: 'inline-block' }}
                                            >
                                                <SocialBtn name="instagram" />
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <Pressable
                                                onPress={() => Linking.openURL('https://facebook.com/')}
                                                accessibilityRole="link"
                                                accessibilityLabel="Facebook"
                                            >
                                                <SocialBtn name="facebook" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => Linking.openURL('https://twitter.com/')}
                                                accessibilityRole="link"
                                                accessibilityLabel="Twitter"
                                            >
                                                <SocialBtn name="twitter" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => Linking.openURL('https://instagram.com/')}
                                                accessibilityRole="link"
                                                accessibilityLabel="Instagram"
                                            >
                                                <SocialBtn name="instagram" />
                                            </Pressable>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* ══════════════════════════════════════════
                    ROW 2 — Main nav bar
                ══════════════════════════════════════════ */}
                <View className={`bg-[#573421] py-[14px] ${isMobile ? "px-4" : "px-8"}`}
                    style={getShadowStyle('0 4px 10px rgba(0, 0, 0, 0.18)', {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.18,
                        shadowRadius: 10,
                        elevation: 8,
                    })}
                    
                >
                    <View className="flex-row items-center justify-between w-full max-w-[1280px] self-center">
                        {/* ── LOGO ── */}
                        <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center gap-[10px]">
                            <View className="w-[42px] h-[42px] rounded-[13px] bg-white items-center justify-center"
                                style={getShadowStyle('0 3px 6px rgba(0, 0, 0, 0.18)', {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 6,
                                    elevation: 4,
                                })}>
                                <Feather name="shopping-bag" size={22} color="#8B4513" />
                            </View>
                            <View>
                                <Text className="text-white text-[20px] font-black tracking-[-0.5px]">
                                    Shop<Text className="text-[#CD853F]"> Hub</Text>
                                </Text>
                                <Text className="text-white/55 text-[9px] font-semibold tracking-[1.5px] uppercase">
                                    Premium Store
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* ── DESKTOP NAV LINKS ── */}
                        {!isMobile && !isTablet && (
                            <View className="flex-row items-center gap-[28px] flex-1 justify-center">
                                {NAV_LINKS.map((link) => {
                                    if (link.label === 'Categories') {
                                        return (
                                            <View key="Categories"  >
                                                <NavLink
                                                    label="Categories"
                                                    active={activeNav === 'Categories' || showMegaMenu}
                                                    onPress={() => setShowMegaMenu((prev) => !prev)}
                                                />
                                            </View>
                                        );
                                    }
                                    return (
                                        <NavLink
                                            key={link.label}
                                            label={link.label}
                                            active={activeNav === link.label}
                                            onPress={() => router.push(link.route as any)}
                                        />
                                    );
                                })}
                            </View>
                        )}

                        {/* ── RIGHT ACTIONS ── */}
                        <View className="flex-row items-center gap-2">
                            <IconBtn icon="search" onPress={() => setShowSearch(!showSearch)} />
                            <IconBtn icon="camera" onPress={() => router.push("/ai-search" as any)} />
                            <IconBtn icon="heart" badge={wishlistCount} onPress={() => router.push("/wishlist" as any)} />
                            <IconBtn icon="shopping-cart" badge={cartCount} onPress={() => router.push("/cart" as any)} />

                            {userToken ? (
                                <TouchableOpacity onPress={() => router.push("/customer-dashboard" as any)} className="flex-row items-center gap-[7px]">
                                    <View className="w-[40px] h-[40px] rounded-[12px] bg-[#CD853F] items-center justify-center">
                                        <Feather name="user" size={19} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => router.push("/login" as any)} className="flex-row items-center gap-[6px] bg-white px-4 py-[9px] rounded-[12px]"
                                    style={getShadowStyle('0 2px 4px rgba(0, 0, 0, 0.14)', {
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.14,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    })}
                                >
                                    <Feather name="log-in" size={14} color="#8B4513" />
                                    <Text className="text-[#8B4513] font-extrabold text-[13px] tracking-[0.2px]">
                                        Login
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Hamburger */}
                            {(isMobile || isTablet) && (
                                <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="w-[40px] h-[40px] rounded-[12px] bg-white/15 border border-white/20 items-center justify-center ml-1">
                                    <Feather name={showMenu ? "x" : "menu"} size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* ── Animated search bar ── */}
                    <Animated.View
                        style={{
                            maxHeight: searchMaxH,
                            opacity: searchOp,
                            marginTop: showSearch ? 12 : 0,
                        }}
                        className="overflow-hidden w-full max-w-[1280px] self-center">
                        <View className="flex-row items-center bg-white rounded-[14px] px-4 py-[10px]"
                            style={getShadowStyle('0 4px 8px rgba(0, 0, 0, 0.12)', {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.12,
                                shadowRadius: 8,
                                elevation: 4,
                            })}
                        >
                            <Feather name="search" size={18} color="#8B4513" />
                            <TextInput placeholder="Search products, categories..." className="flex-1 ml-[10px] text-[14px] text-gray-800 font-medium"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9CA3AF"
                                autoFocus={showSearch}
                                returnKeyType="search"
                                onSubmitEditing={() => {
                                    if (searchQuery.trim()) {
                                        setShowSearch(false);
                                        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}` as any);
                                    }
                                }}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Feather name="x-circle" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                            {searchQuery.length > 0 && (
                                <TouchableOpacity className="ml-[10px] bg-[#8B4513] px-[14px] py-[4px] rounded-[8px]"
                                    onPress={() => {
                                        if (searchQuery.trim()) {
                                            setShowSearch(false);
                                            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}` as any);
                                        }
                                    }}>
                                    <Text className="text-sm font-bold text-white">Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>

                {/* ══════════════════════════════════════════
                    MEGA MENU DROPDOWN
                ══════════════════════════════════════════ */}
                {showMegaMenu && activeMegaCategory && !isMobile && !isTablet && Platform.OS === 'web' && (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: animatedMegaMenuTop,
                            left: 0,
                            right: 0,
                            zIndex: 200,
                            paddingHorizontal: 32,
                        }}
                    >
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            overflow: 'hidden',
                            borderTopWidth: 3,
                            borderTopColor: '#8B4513',
                            maxWidth: 800,
                            alignSelf: 'center',
                            width: '100%',
                        }}>
                            <View style={{ flexDirection: 'row' }}>

                                {/* ── LEFT COLUMN: category list (flex 1) ── */}
                                <View style={{
                                    flex: 1,
                                    backgroundColor: '#FDF8F5',
                                    paddingVertical: 20,
                                    paddingHorizontal: 12,
                                    borderRightWidth: 1,
                                    borderRightColor: '#F0E0D0',
                                }}>
                                    <Text style={{
                                        fontSize: 10, fontWeight: '700',
                                        color: '#B08463', letterSpacing: 1.5,
                                        textTransform: 'uppercase',
                                        marginBottom: 12, marginLeft: 4,
                                    }}>All Categories</Text>

                                    {visualMenuCategories.slice(0, 5).map((cat, i) => (
                                        <Pressable
                                            key={cat._id}
                                            onHoverIn={() => setActiveMegaCat(i)}
                                            onPress={() => navigateToCategory(cat.slug)}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center',
                                                paddingVertical: 9, paddingHorizontal: 10,
                                                borderRadius: 10, marginBottom: 2,
                                                backgroundColor: activeMegaCat === i ? '#fff' : 'transparent',
                                            }}
                                        >
                                            <View style={{
                                                width: 30, height: 30, borderRadius: 8,
                                                alignItems: 'center', justifyContent: 'center',
                                                marginRight: 10,
                                                overflow: 'hidden',
                                            }}>
                                                <MenuThumb
                                                    imageUri={cat.imageUri}
                                                    icon={cat.icon}
                                                    size={30}
                                                    borderRadius={8}
                                                    tintColor={activeMegaCat === i ? cat.color : '#8B6B4A'}
                                                    fallbackBackgroundColor={activeMegaCat === i ? cat.color + '22' : '#EDD5C0'}
                                                />
                                            </View>
                                            <Text style={{
                                                fontSize: 13,
                                                fontWeight: activeMegaCat === i ? '700' : '500',
                                                color: activeMegaCat === i ? '#5C2E0A' : '#6B4D35',
                                                flex: 1,
                                            }}>{cat.name}</Text>
                                            <Feather
                                                name="chevron-right"
                                                size={13}
                                                color={activeMegaCat === i ? '#8B4513' : '#D4B9A0'}
                                            />
                                        </Pressable>
                                    ))}

                                    {/* View All Button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            router.push('/categories' as any);
                                            setShowMegaMenu(false);
                                        }}
                                        activeOpacity={0.9}
                                        style={{
                                            marginTop: 14,
                                            borderRadius: 14,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Pressable
                                            onPress={() => {
                                                setShowMegaMenu(false);
                                                router.push('/categories' as any);
                                            }}
                                            style={({ hovered, pressed }) => ({
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,

                                                marginTop: 14,
                                                paddingVertical: 13,
                                                borderRadius: 14,

                                                backgroundColor: pressed
                                                    ? '#6F3417'
                                                    : hovered
                                                        ? '#9C5A38'
                                                        : '#8B4513',

                                                borderWidth: 1,
                                                borderColor: hovered ? '#CD853F' : '#8B4513',

                                                transform: [
                                                    {
                                                        scale: pressed ? 0.98 : hovered ? 1.02 : 1,
                                                    },
                                                ],
                                            })}
                                        >
                                            <Text
                                                style={{
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: '700',
                                                    letterSpacing: 0.3,
                                                }}
                                            >
                                                View All Categories
                                            </Text>

                                            <Feather name="arrow-right" size={15} color="#fff" />
                                        </Pressable>
                                    </TouchableOpacity>
                                </View>

                                {/* ── RIGHT COLUMNS: subcategories (flex 2) ── */}
                                <View style={{ flex: 2, padding: 24 }}>
                                    {/* Header row */}
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center',
                                        justifyContent: 'space-between', marginBottom: 14,
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}>
                                                <MenuThumb
                                                    imageUri={activeMegaCategory.imageUri}
                                                    icon={activeMegaCategory.icon}
                                                    size={36}
                                                    borderRadius={10}
                                                    tintColor={activeMegaCategory.color}
                                                    fallbackBackgroundColor={activeMegaCategory.color + '18'}
                                                />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#2D1B0E' }}>
                                                    {activeMegaCategory.name}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: '#9E7A5C' }}>
                                                    Browse {activeMegaCategory.subcategories.length} subcategories
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigateToCategory(activeMegaCategory.slug)}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', gap: 4,
                                                paddingHorizontal: 12, paddingVertical: 6,
                                                borderRadius: 8, borderWidth: 1, borderColor: '#CD853F',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, color: '#8B4513', fontWeight: '600' }}>View All</Text>
                                            <Feather name="arrow-right" size={12} color="#8B4513" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Divider */}
                                    <View style={{ height: 1, backgroundColor: '#F0E0D0', marginBottom: 18 }} />

                                    {/* Subcategories 2-column grid */}
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {activeMegaCategory.subcategories.map((sub: VisualMenuSubcategory) => (
                                            <Pressable
                                                key={sub._id}
                                                onPress={() => navigateToSubcategory(activeMegaCategory.slug, sub.slug)}
                                                style={({ hovered }) => ([{
                                                    flexDirection: 'row' as const,
                                                    alignItems: 'center' as const,
                                                    gap: 8, paddingHorizontal: 12, paddingVertical: 10,
                                                    borderRadius: 10, borderWidth: 1,
                                                    width: '48%',
                                                    borderColor: hovered ? '#CD853F' : '#EDD5C0',
                                                    backgroundColor: hovered ? '#FDF0E8' : '#FAFAFA',
                                                }])}
                                            >
                                                <View style={{
                                                    width: 28, height: 28, borderRadius: 7,
                                                    alignItems: 'center', justifyContent: 'center',
                                                    overflow: 'hidden',
                                                }}>
                                                    <MenuThumb
                                                        imageUri={sub.imageUri}
                                                        icon={sub.icon}
                                                        size={28}
                                                        borderRadius={7}
                                                        tintColor={activeMegaCategory.color}
                                                        fallbackBackgroundColor={activeMegaCategory.color + '15'}
                                                    />
                                                </View>
                                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B3621' }}>
                                                    {sub.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </Animated.View>

            {/* ══════════════════════════════════════════
                MOBILE DRAWER
            ══════════════════════════════════════════ */}
            {(isMobile || isTablet) && (
                <>
                    {/* Backdrop */}
                    <Animated.View
                        style={{
                            opacity: overlayFade,
                            pointerEvents: showMenu ? 'auto' : 'none',
                        }} className="absolute inset-0 w-screen h-[1000px] bg-black/55 z-[200]">
                        <Pressable className="flex-1" onPress={() => setShowMenu(false)} />
                    </Animated.View>

                    {/* Drawer panel */}
                    <Animated.View
                        style={{
                            transform: [{ translateX: menuSlide }],
                            ...getShadowStyle('4px 0 12px rgba(0, 0, 0, 0.22)', {
                                shadowColor: '#000',
                                shadowOffset: { width: 4, height: 0 },
                                shadowOpacity: 0.22,
                                shadowRadius: 12,
                                elevation: 16,
                            }),
                        }} className="absolute top-0 left-0 w-[300px] h-[1000px] bg-white z-[300]">
                        {/* Drawer header */}
                        <View className="bg-[#8B4513] px-[22px] pt-[52px] pb-[22px]">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-[10px]">
                                    <View className="w-[38px] h-[38px] rounded-[11px] bg-white items-center justify-center">
                                        <Feather name="shopping-bag" size={20} color="#8B4513" />
                                    </View>
                                    <Text className="text-white text-[18px] font-black">
                                        Shop<Text className="text-[#CD853F]">Hub</Text>
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowMenu(false)}>
                                    <View className="w-[32px] h-[32px] rounded-[10px] bg-white/15 items-center justify-center">
                                        <Feather name="x" size={17} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Drawer content */}
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Nav links */}
                            <View className="px-5 pt-5">
                                <Text className="text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase mb-2.5">
                                    Navigation
                                </Text>
                                {NAV_LINKS.map((link, i) => (
                                    <TouchableOpacity key={i} onPress={() => { router.push(link.route as any); setShowMenu(false); }} className="flex-row items-center justify-between py-[13px] border-b border-gray-200">
                                        <Text className="text-[15px] font-semibold text-gray-800">
                                            {link.label}
                                        </Text>
                                        <Feather name="chevron-right" size={16} color="#D1D5DB" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {/* Categories */}
                            <View className="px-5 pt-6">
                                <Text className="text-[10px] font-bold text-gray-400 tracking-[1.5px] uppercase mb-2.5">
                                    Categories
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {visualMenuCategories.length > 0 ? visualMenuCategories.map((cat) => (
                                        <TouchableOpacity key={cat._id} onPress={() => navigateToCategory(cat.slug)} className="flex-row items-center gap-1.5 bg-[#FDF0E8] px-3 py-2 rounded-[10px] border border-[#EDD5C0]">
                                            <View style={{ overflow: 'hidden', borderRadius: 6 }}>
                                                <MenuThumb
                                                    imageUri={cat.imageUri}
                                                    icon={cat.icon}
                                                    size={18}
                                                    borderRadius={6}
                                                    tintColor="#8B4513"
                                                    fallbackBackgroundColor="#EDD5C0"
                                                />
                                            </View>
                                            <Text className="text-[#8B4513] text-[12px] font-semibold">
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )) : (
                                        <Text className="text-[12px] font-medium text-gray-500">
                                            {menuError ?? 'Loading categories...'}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Contact info */}
                            <View className="mx-5 mt-6 bg-[#F9F5F1] rounded-[14px] p-4">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Feather name="phone" size={14} color="#8B4513" />
                                    <Text className="text-gray-700 text-[13px] font-medium">+1 (555) 123-4567</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Feather name="mail" size={14} color="#8B4513" />
                                    <Text className="text-gray-700 text-[13px] font-medium">support@shophub.com</Text>
                                </View>
                            </View>

                            {/* Auth CTA */}
                            <View className="px-5 pt-5 pb-10">
                                {userToken ? (
                                    <TouchableOpacity onPress={() => { logout(); setShowMenu(false); router.replace('/'); }} className="flex-row items-center justify-center gap-2 bg-red-500 py-[13px] rounded-[12px]">
                                        <Feather name="log-out" size={16} color="#fff" />
                                        <Text className="text-white text-[14px] font-bold">Logout</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => { router.push('/login' as any); setShowMenu(false); }} className="flex-row items-center justify-center gap-2 bg-[#8B4513] py-[13px] rounded-[12px]">
                                        <Feather name="log-in" size={16} color="#fff" />
                                        <Text className="text-white text-[14px] font-bold">Login / Register</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    </Animated.View>
                </>
            )}
        </>
    );
}