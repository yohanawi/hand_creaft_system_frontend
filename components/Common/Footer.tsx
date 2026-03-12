import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Clock, Mail, MapPin, Phone } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

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
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.20)',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Feather name={name} size={20} color="#ffffff" />
            </Animated.View>
        </TouchableOpacity>
    );
}

const Footer = () => {

    const [email, setEmail] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const footerLinks = {
        shop: [
            { name: 'All Products', href: '#' },
            { name: 'Categories', href: '#' },
            { name: 'New Arrivals', href: '#' },
            { name: 'Best Sellers', href: '#' },
            { name: 'Sale', href: '#' },
        ],
        customer: [
            { name: 'My Account', href: '#' },
            { name: 'Order Tracking', href: '#' },
            { name: 'Wishlist', href: '#' },
            { name: 'Help & FAQs', href: '#' },
            { name: 'Returns', href: '#' },
        ],
        company: [
            { name: 'About Us', href: '#' },
            { name: 'Contact Us', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Press', href: '#' },
            { name: 'Blog', href: '#' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '#' },
            { name: 'Terms of Service', href: '#' },
            { name: 'Cookie Policy', href: '#' },
            { name: 'Shipping Policy', href: '#' },
        ],
    };

    return (
        <footer className={`w-full bg-stone-950 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="px-6 pt-16 pb-8 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                        <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center gap-[10px] pb-8">
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
                        <Text className="max-w-sm text-base leading-relaxed text-stone-400 font-body">
                            Curating the world's finest products with a focus on quality, sustainability, and exceptional customer service.
                        </Text>
                        <View className="flex-row items-center gap-1.5 pt-8">
                            <a href="#" className="p-1 transition-colors rounded-lg hover:bg-stone-500">
                                <SocialBtn name="facebook" />
                            </a>
                            <a href="#" className="p-1 transition-colors rounded-lg hover:bg-stone-500">
                                <SocialBtn name="twitter" />
                            </a>
                            <a href="#" className="p-1 transition-colors rounded-lg hover:bg-stone-500">
                                <SocialBtn name="instagram" />
                            </a>
                            <a href="#" className="p-1 transition-colors rounded-lg hover:bg-stone-500">
                                <SocialBtn name="youtube" />
                            </a>
                            <a href="#" className="p-1 transition-colors rounded-lg hover:bg-stone-500">
                                <SocialBtn name="linkedin" />
                            </a>
                        </View>
                    </div>

                    {/* Links - Shop */}
                    <div className="lg:col-span-2">
                        <h4 className="mb-6 text-lg font-bold tracking-wider text-white uppercase font-heading">Shop</h4>
                        <ul className="space-y-4">
                            {footerLinks.shop.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm transition-colors text-stone-400 hover:text-white">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links - Support */}
                    <div className="lg:col-span-2">
                        <h4 className="mb-6 text-lg font-bold tracking-wider text-white uppercase font-heading">Support</h4>
                        <ul className="space-y-4">
                            {footerLinks.customer.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm transition-colors text-stone-400 hover:text-white">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links - Company */}
                    <div className="lg:col-span-2">
                        <h4 className="mb-6 text-lg font-bold tracking-wider text-white uppercase font-heading">Company</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm transition-colors text-stone-400 hover:text-white">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3">
                        <h4 className="mb-6 text-lg font-bold tracking-wider text-white uppercase font-heading">Contact Us</h4>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-stone-900">
                                    <MapPin className="text-white" size={18} />
                                </div>
                                <address className="text-sm not-italic leading-5 text-stone-400">
                                    123 Commerce Way, Suite 100<br />
                                    San Francisco, CA 94103
                                </address>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-stone-900">
                                    <Phone className="text-white" size={18} />
                                </div>
                                <a href="tel:+18005550199" className="text-sm transition-colors text-stone-400 hover:text-white">+1 (800) 555-0199</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-stone-900">
                                    <Mail className="text-white" size={18} />
                                </div>
                                <a href="mailto:hello@shophub.com" className="text-sm transition-colors text-stone-400 hover:text-white">hello@shophub.com</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-stone-900">
                                    <Clock className="text-white" size={18} />
                                </div>
                                <span className="text-sm text-stone-400">Mon-Sat: 10am - 8pm EST</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-6 pt-8 mt-16 border-t border-stone-900 md:flex-row">
                    <p className="text-sm text-stone-500">
                        © 2026 ShopHub Inc. All rights reserved.
                    </p>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {footerLinks.legal.map((link, idx) => (
                            <a key={idx} href={link.href} className="text-stone-500 text-[11px] uppercase tracking-widest font-medium hover:text-stone-300 transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;