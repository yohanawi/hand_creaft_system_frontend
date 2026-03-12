import { AuthContext } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

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

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header() {

    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const { userToken, logout } = useContext(AuthContext)!;
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();

    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Entry
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideDown, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

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
                <View className="bg-[#714329] py-[7px]" style={{ paddingHorizontal: isMobile ? 16 : 32 }}>
                    <View className="flex-row items-center self-center justify-between w-full max-w-7xl">
                        {/* Left — contact info */}
                        <View className="flex-row items-center gap-4">
                            {/* Phone */}
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-[32px] h-[32px] rounded-md bg-white/10 items-center justify-center border border-white/20">
                                    <Feather name="phone" size={16} color="#fff" />
                                </View>
                                <Text className="ffont-medium text-white cursor-pointer text-md hover:text-[#B9937B]">
                                    +1 (555) 123-4567
                                </Text>
                            </View>

                            {!isMobile && (
                                <>
                                    <View className="w-[1px] h-[12px] bg-white/20" />
                                    {/* Email */}
                                    <View className="flex-row items-center gap-1.5">
                                        <View className="w-[32px] h-[32px] rounded-md bg-white/10 items-center justify-center border border-white/20">
                                            <Feather name="mail" size={16} color="#fff" />
                                        </View>
                                        <Text className="font-medium text-white cursor-pointer text-md hover:text-[#B9937B]">
                                            support@shophub.com
                                        </Text>
                                    </View>
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
                                <SocialBtn name="facebook" />
                                <SocialBtn name="twitter" />
                                <SocialBtn name="instagram" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* ══════════════════════════════════════════
                    ROW 2 — Main nav bar
                ══════════════════════════════════════════ */}
                <View className={`bg-[#573421] py-[14px] ${isMobile ? "px-4" : "px-8"}`}
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.18,
                        shadowRadius: 10,
                        elevation: 8,
                    }}
                >
                    <View className="flex-row items-center justify-between w-full max-w-[1280px] self-center">
                        {/* ── LOGO ── */}
                        <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center gap-[10px]">
                            <View className="w-[42px] h-[42px] rounded-[13px] bg-white items-center justify-center"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 6,
                                    elevation: 4,
                                }}>
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
                                {NAV_LINKS.map((link) => (
                                    <NavLink
                                        key={link.label}
                                        label={link.label}
                                        active={activeNav === link.label} // ✅ this is correct
                                        onPress={() => {
                                            router.push(link.route as any);
                                        }}
                                    />
                                ))}
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
                                    style={{
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.14,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
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
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.12,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
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
            </Animated.View>

            {/* ══════════════════════════════════════════
                MOBILE DRAWER
            ══════════════════════════════════════════ */}
            {(isMobile || isTablet) && (
                <>
                    {/* Backdrop */}
                    <Animated.View pointerEvents={showMenu ? "auto" : "none"}
                        style={{
                            opacity: overlayFade,
                        }} className="absolute inset-0 w-screen h-[1000px] bg-black/55 z-[200]">
                        <Pressable className="flex-1" onPress={() => setShowMenu(false)} />
                    </Animated.View>

                    {/* Drawer panel */}
                    <Animated.View
                        style={{
                            transform: [{ translateX: menuSlide }],
                            shadowColor: "#000",
                            shadowOffset: { width: 4, height: 0 },
                            shadowOpacity: 0.22,
                            shadowRadius: 12,
                            elevation: 16,
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