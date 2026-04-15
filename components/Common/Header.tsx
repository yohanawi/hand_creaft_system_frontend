import { AuthContext } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Feather } from '@expo/vector-icons';
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

const CATEGORIES = [
    { name: 'Electronics', icon: 'smartphone' as const },
    { name: 'Fashion', icon: 'shopping-bag' as const },
    { name: 'Home', icon: 'home' as const },
    { name: 'Books', icon: 'book' as const },
    { name: 'Sports', icon: 'activity' as const },
    { name: 'Beauty', icon: 'heart' as const },
];

// ─── Mega menu data ───────────────────────────────────────────────────────────
const MEGA_CATEGORIES = [
    {
        name: 'Electronics', icon: 'smartphone' as const, color: '#3B82F6',
        subcategories: [
            { name: 'Smartphones', icon: 'smartphone' as const },
            { name: 'Laptops', icon: 'monitor' as const },
            { name: 'Cameras', icon: 'camera' as const },
            { name: 'Headphones', icon: 'headphones' as const },
            { name: 'Smart Watches', icon: 'watch' as const },
            { name: 'TV & Audio', icon: 'tv' as const },
            { name: 'Accessories', icon: 'cpu' as const },
            { name: 'WiFi & Network', icon: 'wifi' as const },
        ],
    },
    {
        name: 'Fashion', icon: 'shopping-bag' as const, color: '#EC4899',
        subcategories: [
            { name: "Men's Wear", icon: 'user' as const },
            { name: "Women's Wear", icon: 'user' as const },
            { name: 'Footwear', icon: 'package' as const },
            { name: 'Bags & Purses', icon: 'shopping-bag' as const },
            { name: 'Jewelry', icon: 'star' as const },
            { name: 'Sunglasses', icon: 'sun' as const },
            { name: 'Watches', icon: 'watch' as const },
            { name: 'Kids Wear', icon: 'gift' as const },
        ],
    },
    {
        name: 'Home & Living', icon: 'home' as const, color: '#10B981',
        subcategories: [
            { name: 'Furniture', icon: 'grid' as const },
            { name: 'Bedding', icon: 'layers' as const },
            { name: 'Kitchen', icon: 'coffee' as const },
            { name: 'Lighting', icon: 'sun' as const },
            { name: 'Garden', icon: 'feather' as const },
            { name: 'Storage', icon: 'box' as const },
            { name: 'Decor', icon: 'bookmark' as const },
            { name: 'Tools', icon: 'tool' as const },
        ],
    },
    {
        name: 'Books', icon: 'book' as const, color: '#F59E0B',
        subcategories: [
            { name: 'Fiction', icon: 'book' as const },
            { name: 'Non-Fiction', icon: 'file-text' as const },
            { name: 'Science', icon: 'cpu' as const },
            { name: 'History', icon: 'globe' as const },
            { name: 'Self Help', icon: 'trending-up' as const },
            { name: "Children's", icon: 'smile' as const },
            { name: 'Comics', icon: 'image' as const },
            { name: 'Textbooks', icon: 'archive' as const },
        ],
    },
    {
        name: 'Sports', icon: 'activity' as const, color: '#EF4444',
        subcategories: [
            { name: 'Fitness', icon: 'activity' as const },
            { name: 'Outdoor', icon: 'compass' as const },
            { name: 'Team Sports', icon: 'users' as const },
            { name: 'Cycling', icon: 'navigation' as const },
            { name: 'Running', icon: 'wind' as const },
            { name: 'Yoga', icon: 'anchor' as const },
            { name: 'Water Sports', icon: 'droplet' as const },
            { name: 'Equipment', icon: 'tool' as const },
        ],
    },
    {
        name: 'Beauty', icon: 'heart' as const, color: '#8B5CF6',
        subcategories: [
            { name: 'Skincare', icon: 'droplet' as const },
            { name: 'Makeup', icon: 'eye' as const },
            { name: 'Hair Care', icon: 'scissors' as const },
            { name: 'Perfumes', icon: 'star' as const },
            { name: 'Nail Care', icon: 'pen-tool' as const },
            { name: "Men's Grooming", icon: 'user' as const },
            { name: 'Bath & Body', icon: 'sun' as const },
            { name: 'Beauty Tools', icon: 'zap' as const },
        ],
    },
];

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
    const { wishlistCount } = useWishlist();

    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [activeMegaCat, setActiveMegaCat] = useState(0);
    const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const internalScrollY = useRef(new Animated.Value(0)).current;
    const resolvedScrollY = scrollY ?? internalScrollY;
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollOffsetRef = useRef(0);
    const hideOffsetRef = useRef(0);
    const topBarVisibleRef = useRef(true);
    const topBarAnimatingRef = useRef(false);

    const openMegaMenu = () => {
        if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
        setShowMegaMenu(true);
    };
    const closeMegaMenu = () => {
        megaCloseTimer.current = setTimeout(() => setShowMegaMenu(false), 150);
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
                        overflow: 'hidden',
                    }}
                >
                    <View className="bg-[#714329] py-[7px]" style={{ paddingHorizontal: isMobile ? 16 : 32 }}>
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
                                        Free shipping on orders over LKR 50
                                    </Text>
                                )}
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
                                            <View
                                                key="Categories"
                                                {...{ onMouseEnter: openMegaMenu, onMouseLeave: closeMegaMenu } as any}
                                            >
                                                <NavLink
                                                    label="Categories"
                                                    active={activeNav === 'Categories' || showMegaMenu}
                                                    onPress={() => router.push('/categories' as any)}
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
                                <TouchableOpacity onPress={() => router.push("/profile" as any)} className="flex-row items-center gap-[7px]">
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
                {showMegaMenu && !isMobile && !isTablet && Platform.OS === 'web' && (
                    <Animated.View
                        {...{ onMouseEnter: openMegaMenu, onMouseLeave: closeMegaMenu } as any}
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
                            ...getShadowStyle('0 12px 24px rgba(0, 0, 0, 0.15)', {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.15,
                                shadowRadius: 24,
                                elevation: 20,
                            }),
                            borderTopWidth: 3,
                            borderTopColor: '#8B4513',
                            maxWidth: 1280,
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

                                    {MEGA_CATEGORIES.map((cat, i) => (
                                        <Pressable
                                            key={cat.name}
                                            onHoverIn={() => setActiveMegaCat(i)}
                                            onPress={() => { router.push('/categories' as any); setShowMegaMenu(false); }}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center',
                                                paddingVertical: 9, paddingHorizontal: 10,
                                                borderRadius: 10, marginBottom: 2,
                                                backgroundColor: activeMegaCat === i ? '#fff' : 'transparent',
                                            }}
                                        >
                                            <View style={{
                                                width: 30, height: 30, borderRadius: 8,
                                                backgroundColor: activeMegaCat === i ? cat.color + '22' : '#EDD5C0',
                                                alignItems: 'center', justifyContent: 'center',
                                                marginRight: 10,
                                            }}>
                                                <Feather
                                                    name={cat.icon}
                                                    size={14}
                                                    color={activeMegaCat === i ? cat.color : '#8B6B4A'}
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
                                                backgroundColor: MEGA_CATEGORIES[activeMegaCat].color + '18',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Feather
                                                    name={MEGA_CATEGORIES[activeMegaCat].icon}
                                                    size={18}
                                                    color={MEGA_CATEGORIES[activeMegaCat].color}
                                                />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#2D1B0E' }}>
                                                    {MEGA_CATEGORIES[activeMegaCat].name}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: '#9E7A5C' }}>
                                                    Browse {MEGA_CATEGORIES[activeMegaCat].subcategories.length} subcategories
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => { router.push('/shop' as any); setShowMegaMenu(false); }}
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
                                        {MEGA_CATEGORIES[activeMegaCat].subcategories.map((sub) => (
                                            <Pressable
                                                key={sub.name}
                                                onPress={() => { router.push('/shop' as any); setShowMegaMenu(false); }}
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
                                                    backgroundColor: MEGA_CATEGORIES[activeMegaCat].color + '15',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Feather
                                                        name={sub.icon}
                                                        size={13}
                                                        color={MEGA_CATEGORIES[activeMegaCat].color}
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
                                    {CATEGORIES.map((cat, i) => (
                                        <TouchableOpacity key={i} className="flex-row items-center gap-1.5 bg-[#FDF0E8] px-3 py-2 rounded-[10px] border border-[#EDD5C0]">
                                            <Feather name={cat.icon} size={13} color="#8B4513" />
                                            <Text className="text-[#8B4513] text-[12px] font-semibold">
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
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