import PageShell from '@/components/PageShell';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PrivacyPolicyScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;

    const sections = [
        {
            id: 1,
            title: '1. Information We Collect',
            content: `We collect various types of information in connection with the services we provide, including:

• Personal Information: Name, email address, phone number, shipping address, billing address, and payment information.
• Account Information: Username, password, and profile information.
• Transaction Information: Details about purchases, order history, and payment methods.
• Technical Information: IP address, browser type, device information, and operating system.
• Usage Data: Information about how you interact with our website and services.
• Communication Data: Your correspondence with us, including emails and customer support interactions.`,
        },
        {
            id: 2,
            title: '2. How We Use Your Information',
            content: `We use the information we collect for various purposes:

• To process and fulfill your orders and transactions.
• To provide customer support and respond to your inquiries.
• To send you order confirmations, shipping notifications, and updates.
• To personalize your shopping experience and recommend products.
• To improve our website, products, and services.
• To send promotional emails and marketing communications (with your consent).
• To prevent fraud and ensure the security of our platform.
• To comply with legal obligations and enforce our terms of service.`,
        },
        {
            id: 3,
            title: '3. Information Sharing and Disclosure',
            content: `We may share your information in the following circumstances:

• Service Providers: We work with third-party companies that help us operate our business (payment processors, shipping companies, email service providers, etc.).
• Business Transfers: In connection with a merger, acquisition, or sale of assets.
• Legal Requirements: When required by law or to protect our rights and safety.
• With Your Consent: When you explicitly agree to share your information.

We do not sell your personal information to third parties for their marketing purposes.`,
        },
        {
            id: 4,
            title: '4. Data Security',
            content: `We implement various security measures to protect your personal information:

• Encryption: We use SSL/TLS encryption to protect data transmission.
• Secure Storage: Your information is stored on secure servers with restricted access.
• Payment Security: We comply with PCI-DSS requirements for payment card data.
• Access Controls: Only authorized personnel have access to personal information.
• Regular Audits: We conduct regular security assessments and updates.

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
        },
        {
            id: 5,
            title: '5. Cookies and Tracking Technologies',
            content: `We use cookies and similar technologies to enhance your experience:

• Essential Cookies: Required for basic website functionality.
• Performance Cookies: Help us understand how visitors use our site.
• Functional Cookies: Remember your preferences and settings.
• Targeting Cookies: Used for personalized advertising and recommendations.

You can control cookies through your browser settings, but disabling them may affect website functionality.`,
        },
        {
            id: 6,
            title: '6. Your Privacy Rights',
            content: `Depending on your location, you may have certain rights regarding your personal information:

• Access: Request a copy of the personal information we hold about you.
• Correction: Update or correct inaccurate information.
• Deletion: Request deletion of your personal information.
• Objection: Object to certain processing of your information.
• Portability: Request a copy of your data in a portable format.
• Opt-Out: Unsubscribe from marketing communications at any time.

To exercise these rights, please contact us using the information provided below.`,
        },
        {
            id: 7,
            title: '7. Children\'s Privacy',
            content: `Our services are not intended for children under the age of 13 (or 16 in some jurisdictions). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will delete such information.`,
        },
        {
            id: 8,
            title: '8. International Data Transfers',
            content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your information, we ensure appropriate safeguards are in place to protect your privacy and comply with applicable laws.`,
        },
        {
            id: 9,
            title: '9. Data Retention',
            content: `We retain your personal information for as long as necessary to:

• Fulfill the purposes outlined in this Privacy Policy.
• Comply with legal, accounting, or reporting requirements.
• Resolve disputes and enforce our agreements.

When information is no longer needed, we securely delete or anonymize it.`,
        },
        {
            id: 10,
            title: '10. Third-Party Links',
            content: `Our website may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.`,
        },
        {
            id: 11,
            title: '11. Changes to This Privacy Policy',
            content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by:

• Posting the updated policy on our website.
• Updating the "Last Updated" date.
• Sending an email notification for material changes (if you have an account).

We encourage you to review this Privacy Policy periodically.`,
        },
        {
            id: 12,
            title: '12. Contact Us',
            content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

Email: privacy@ecommerce.com
Phone: +1 (555) 123-4567
Address: 123 Business Street, Suite 100, New York, NY 10001

Mailing Address for Privacy Inquiries:
Privacy Department
E-Commerce Platform
123 Business Street, Suite 100
New York, NY 10001
United States`,
        },
    ];

    return (
        <View className="flex-1 bg-white">
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Hero Section */}
                        <LinearGradient
                            colors={['#8B4513', '#D2691E', '#DEB887'] as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-16 px-4"
                        >
                            <View className="max-w-4xl mx-auto w-full">
                                <View className="flex-row items-center justify-center mb-6">
                                    <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                                        <Feather name="shield" size={40} color="#8B4513" />
                                    </View>
                                </View>
                                <Text className={`text-white font-bold text-center mb-4 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                                    Privacy Policy
                                </Text>
                                <Text className={`text-white text-center mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                    Your privacy is important to us
                                </Text>
                                <Text className="text-white text-center opacity-90">
                                    Last Updated: March 20, 2024
                                </Text>
                            </View>
                        </LinearGradient>

                        {/* Introduction */}
                        <View className="py-12 px-4 bg-craft-50">
                            <View className="max-w-4xl mx-auto w-full">
                                <View className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                                    <Text className="text-gray-800 text-lg leading-8">
                                        Welcome to our Privacy Policy. At E-Commerce Platform, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                                    </Text>
                                </View>

                                <View className="bg-brown-primary rounded-2xl p-6 mb-8">
                                    <Text className="text-white text-lg leading-8">
                                        By using our services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Policy Content */}
                        <View className="py-8 px-4 bg-white">
                            <View className="max-w-4xl mx-auto w-full">
                                {sections.map((section, index) => (
                                    <View key={section.id} className="mb-8">
                                        <View className="flex-row items-start mb-4">
                                            <View className="w-12 h-12 rounded-full bg-brown-primary items-center justify-center mr-4">
                                                <Text className="text-white font-bold text-lg">{index + 1}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-900 text-2xl font-bold mb-4">
                                                    {section.title}
                                                </Text>
                                                <Text className="text-gray-700 text-base leading-8">
                                                    {section.content}
                                                </Text>
                                            </View>
                                        </View>
                                        {index < sections.length - 1 && (
                                            <View className="border-b border-gray-200 mt-6" />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Quick Links */}
                        <View className="py-12 px-4 bg-craft-50">
                            <View className="max-w-4xl mx-auto w-full">
                                <Text className="text-gray-900 text-2xl font-bold mb-6 text-center">
                                    Related Documents
                                </Text>
                                <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/terms-conditions' as any)}
                                        className="flex-1 bg-white rounded-2xl p-6 shadow-lg"
                                    >
                                        <View className="items-center">
                                            <View className="w-16 h-16 rounded-full bg-brown-primary items-center justify-center mb-4">
                                                <Feather name="file-text" size={28} color="#FFF" />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold mb-2">Terms & Conditions</Text>
                                            <Text className="text-gray-600 text-center">
                                                Read our terms of service
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.push('/contact' as any)}
                                        className="flex-1 bg-white rounded-2xl p-6 shadow-lg"
                                    >
                                        <View className="items-center">
                                            <View className="w-16 h-16 rounded-full bg-brown-primary items-center justify-center mb-4">
                                                <Feather name="message-circle" size={28} color="#FFF" />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold mb-2">Contact Us</Text>
                                            <Text className="text-gray-600 text-center">
                                                Questions? Get in touch
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Key Points Section */}
                        <View className="py-12 px-4 bg-white">
                            <View className="max-w-4xl mx-auto w-full">
                                <Text className="text-gray-900 text-3xl font-bold mb-8 text-center">
                                    Key Points to Remember
                                </Text>
                                <View className="grid gap-6">
                                    <View className="flex-row items-start bg-craft-50 rounded-2xl p-6">
                                        <View className="w-12 h-12 rounded-full bg-brown-primary items-center justify-center mr-4">
                                            <Feather name="lock" size={24} color="#FFF" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg mb-2">Data Security</Text>
                                            <Text className="text-gray-700 leading-6">
                                                We use industry-standard security measures to protect your information.
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-start bg-craft-50 rounded-2xl p-6">
                                        <View className="w-12 h-12 rounded-full bg-brown-primary items-center justify-center mr-4">
                                            <Feather name="users" size={24} color="#FFF" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg mb-2">No Data Selling</Text>
                                            <Text className="text-gray-700 leading-6">
                                                We never sell your personal information to third parties.
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-start bg-craft-50 rounded-2xl p-6">
                                        <View className="w-12 h-12 rounded-full bg-brown-primary items-center justify-center mr-4">
                                            <Feather name="settings" size={24} color="#FFF" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg mb-2">Your Control</Text>
                                            <Text className="text-gray-700 leading-6">
                                                You have control over your data and can request access, correction, or deletion.
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-start bg-craft-50 rounded-2xl p-6">
                                        <View className="w-12 h-12 rounded-full bg-brown-primary items-center justify-center mr-4">
                                            <Feather name="bell" size={24} color="#FFF" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg mb-2">Transparency</Text>
                                            <Text className="text-gray-700 leading-6">
                                                We'll notify you of any significant changes to our privacy practices.
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
