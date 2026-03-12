import PageShell from '@/components/PageShell';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TermsConditionsScreen() {
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
            title: '1. Acceptance of Terms',
            content: `By accessing and using our e-commerce platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.

These terms apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and contributors of content.

Please read these Terms and Conditions carefully before accessing or using our website. Your continued use of the site following the posting of any changes to these terms constitutes acceptance of those changes.`,
        },
        {
            id: 2,
            title: '2. Account Registration',
            content: `To access certain features of our platform, you may be required to create an account:

• You must be at least 18 years old to create an account.
• You must provide accurate, complete, and current information.
• You are responsible for maintaining the confidentiality of your account credentials.
• You are responsible for all activities that occur under your account.
• You must notify us immediately of any unauthorized use of your account.
• We reserve the right to suspend or terminate accounts that violate our terms.

You may not use another person's account without permission or provide false information to create an account.`,
        },
        {
            id: 3,
            title: '3. Products and Services',
            content: `General Terms:

• Product descriptions, images, and prices are subject to change without notice.
• We strive for accuracy but do not warrant that product information is complete or error-free.
• Product colors may appear differently on different screens.
• All product prices are in USD unless otherwise stated.
• We reserve the right to limit quantities of products available for purchase.
• We do not guarantee product availability and may discontinue products at any time.

Product Accuracy:
We make every effort to display our products as accurately as possible, but we cannot guarantee that your device's display of colors or product details will be accurate.`,
        },
        {
            id: 4,
            title: '4. Pricing and Payment',
            content: `Pricing Policy:

• All prices are subject to change without notice.
• Promotional prices are valid for the duration specified in the promotion.
• We reserve the right to correct pricing errors.
• Prices do not include shipping, handling, or applicable taxes unless stated.

Payment Terms:

• Payment is required at the time of purchase.
• We accept major credit cards, debit cards, and other payment methods as listed.
• Your payment information is processed securely through third-party payment processors.
• By providing payment information, you represent that you are authorized to use that payment method.
• You agree to pay all charges at the prices in effect when incurred.`,
        },
        {
            id: 5,
            title: '5. Shipping and Delivery',
            content: `Shipping Policy:

• Shipping costs and estimated delivery times are provided at checkout.
• We ship to addresses within the countries/regions specified on our site.
• Delivery times are estimates and not guaranteed.
• Risk of loss and title pass to you upon delivery to the carrier.
• We are not responsible for delays caused by shipping carriers or customs.

International Shipping:

• International customers are responsible for all customs, duties, and taxes.
• International orders may take longer to deliver.
• We are not responsible for items held by customs.`,
        },
        {
            id: 6,
            title: '6. Returns and Refunds',
            content: `Return Policy:

• Most items can be returned within 30 days of delivery.
• Items must be in original condition with tags and packaging.
• Return shipping costs are the customer's responsibility unless the item is defective.
• Some items may be non-returnable (clearance, personalized, intimate items).
• Refunds will be issued to the original payment method.

Refund Processing:

• Refunds are processed within 5-10 business days after receiving the returned item.
• Original shipping charges are non-refundable.
• We reserve the right to refuse returns that don't meet our policy.

Defective or Damaged Items:
If you receive a defective or damaged item, contact us immediately for a replacement or refund.`,
        },
        {
            id: 7,
            title: '7. User Conduct',
            content: `You agree not to:

• Use the site for any unlawful purpose or in violation of these terms.
• Attempt to gain unauthorized access to our systems or other users' accounts.
• Interfere with or disrupt the site or servers.
• Use automated systems (bots, scrapers) to access the site.
• Post or transmit harmful content (viruses, malware).
• Impersonate another person or entity.
• Harass, abuse, or harm others.
• Engage in fraudulent activities.
• Collect or harvest user information.
• Use the site to compete with us or create similar services.

Violation of these terms may result in account termination and legal action.`,
        },
        {
            id: 8,
            title: '8. Intellectual Property',
            content: `Our Content:

• All content on our site (text, graphics, logos, images, software) is our property or our licensors' property.
• Content is protected by copyright, trademark, and other intellectual property laws.
• You may not copy, reproduce, distribute, or create derivative works without permission.
• Our trademarks may not be used without express written consent.

User-Generated Content:

• By submitting content (reviews, comments, photos), you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display that content.
• You represent that you own or have rights to the content you submit.
• We may remove any content that violates our policies.`,
        },
        {
            id: 9,
            title: '9. Limitation of Liability',
            content: `To the maximum extent permitted by law:

• We are not liable for any indirect, incidental, special, consequential, or punitive damages.
• Our total liability shall not exceed the amount you paid for the product or service.
• We do not warrant that the site will be uninterrupted, secure, or error-free.
• We are not responsible for third-party websites linked from our site.
• We are not liable for losses resulting from unauthorized account access.

Product Liability:

• Products are provided "as is" without warranties of any kind.
• We do not warrant that products will meet your requirements.
• Any warranties provided by manufacturers are separate from these terms.`,
        },
        {
            id: 10,
            title: '10. Indemnification',
            content: `You agree to indemnify, defend, and hold harmless our company, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from:

• Your use of our services.
• Your violation of these terms.
• Your violation of any rights of another party.
• Your violation of any laws or regulations.

This indemnification obligation will survive the termination of these terms and your use of our services.`,
        },
        {
            id: 11,
            title: '11. Termination',
            content: `We reserve the right to:

• Terminate or suspend your account immediately without notice for conduct that violates these terms.
• Refuse service to anyone for any reason.
• Remove or edit content at our discretion.

Upon termination:

• Your right to use the site will immediately cease.
• We may delete your account and content.
• Provisions of these terms that should survive termination will remain in effect.

You may terminate your account at any time by contacting customer support.`,
        },
        {
            id: 12,
            title: '12. Governing Law',
            content: `These Terms and Conditions are governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.

You agree to submit to the personal and exclusive jurisdiction of the courts located in New York, NY for the resolution of any disputes.

If any provision of these terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.`,
        },
        {
            id: 13,
            title: '13. Dispute Resolution',
            content: `Informal Resolution:

Before filing a claim, you agree to try to resolve the dispute informally by contacting us. We'll try to resolve the dispute informally by contacting you via email.

Arbitration:

If we can't resolve the dispute informally, either party may initiate binding arbitration. Arbitration will be conducted by a neutral arbitrator in accordance with applicable arbitration rules.

Class Action Waiver:

You agree to resolve disputes on an individual basis and waive the right to participate in class actions or class-wide arbitration.`,
        },
        {
            id: 14,
            title: '14. Changes to Terms',
            content: `We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting to the site.

We will indicate the date of the latest revision at the top of this page. Your continued use of the site after changes are posted constitutes acceptance of the revised terms.

Material changes may be communicated via email to registered users. We encourage you to review these terms periodically.`,
        },
        {
            id: 15,
            title: '15. Contact Information',
            content: `If you have any questions about these Terms and Conditions, please contact us:

E-Commerce Platform
123 Business Street, Suite 100
New York, NY 10001
United States

Email: legal@ecommerce.com
Customer Support: support@ecommerce.com
Phone: +1 (555) 123-4567

Business Hours:
Monday - Friday: 9:00 AM - 6:00 PM EST
Saturday: 10:00 AM - 4:00 PM EST
Sunday: Closed`,
        },
    ];

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <PageShell>

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
                                        <Feather name="file-text" size={40} color="#8B4513" />
                                    </View>
                                </View>
                                <Text className={`text-white font-bold text-center mb-4 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                                    Terms & Conditions
                                </Text>
                                <Text className={`text-white text-center mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                    Please read these terms carefully before using our services
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
                                        Welcome to E-Commerce Platform. These Terms and Conditions outline the rules and regulations for the use of our website and services. By accessing and using our platform, you accept and agree to be bound by these terms.
                                    </Text>
                                </View>

                                <View className="bg-brown-primary rounded-2xl p-6 mb-8">
                                    <View className="flex-row items-start">
                                        <Feather name="alert-circle" size={24} color="#FFF" style={{ marginRight: 12, marginTop: 2 }} />
                                        <Text className="text-white text-lg leading-8 flex-1">
                                            Important: By using our services, you agree to these terms. If you disagree with any part of these terms, you must discontinue use of our platform immediately.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Terms Content */}
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

                        {/* Key Highlights */}
                        <View className="py-12 px-4 bg-craft-50">
                            <View className="max-w-4xl mx-auto w-full">
                                <Text className="text-gray-900 text-3xl font-bold mb-8 text-center">
                                    Key Highlights
                                </Text>
                                <View className={`${isMobile ? 'flex-col' : 'flex-row flex-wrap'} gap-6`}>
                                    <View className={`bg-white rounded-2xl p-6 shadow-lg ${isMobile ? 'w-full' : 'w-[48%]'}`}>
                                        <View className="w-14 h-14 rounded-full bg-brown-primary items-center justify-center mb-4">
                                            <Feather name="user-check" size={28} color="#FFF" />
                                        </View>
                                        <Text className="text-gray-900 font-bold text-xl mb-2">Account Responsibility</Text>
                                        <Text className="text-gray-700 leading-6">
                                            You are responsible for maintaining the security of your account and all activities under it.
                                        </Text>
                                    </View>

                                    <View className={`bg-white rounded-2xl p-6 shadow-lg ${isMobile ? 'w-full' : 'w-[48%]'}`}>
                                        <View className="w-14 h-14 rounded-full bg-brown-primary items-center justify-center mb-4">
                                            <Feather name="credit-card" size={28} color="#FFF" />
                                        </View>
                                        <Text className="text-gray-900 font-bold text-xl mb-2">Payment Terms</Text>
                                        <Text className="text-gray-700 leading-6">
                                            All payments must be made at purchase. Prices are subject to change without notice.
                                        </Text>
                                    </View>

                                    <View className={`bg-white rounded-2xl p-6 shadow-lg ${isMobile ? 'w-full' : 'w-[48%]'}`}>
                                        <View className="w-14 h-14 rounded-full bg-brown-primary items-center justify-center mb-4">
                                            <Feather name="rotate-ccw" size={28} color="#FFF" />
                                        </View>
                                        <Text className="text-gray-900 font-bold text-xl mb-2">Returns Policy</Text>
                                        <Text className="text-gray-700 leading-6">
                                            Most items can be returned within 30 days in original condition. See our full return policy.
                                        </Text>
                                    </View>

                                    <View className={`bg-white rounded-2xl p-6 shadow-lg ${isMobile ? 'w-full' : 'w-[48%]'}`}>
                                        <View className="w-14 h-14 rounded-full bg-brown-primary items-center justify-center mb-4">
                                            <Feather name="shield-off" size={28} color="#FFF" />
                                        </View>
                                        <Text className="text-gray-900 font-bold text-xl mb-2">Liability Limits</Text>
                                        <Text className="text-gray-700 leading-6">
                                            Our liability is limited as described in these terms. Products are provided "as is".
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Related Links */}
                        <View className="py-12 px-4 bg-white">
                            <View className="max-w-4xl mx-auto w-full">
                                <Text className="text-gray-900 text-2xl font-bold mb-6 text-center">
                                    Related Documents
                                </Text>
                                <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/privacy-policy' as any)}
                                        className="flex-1 bg-craft-50 rounded-2xl p-6 shadow-lg"
                                    >
                                        <View className="items-center">
                                            <View className="w-16 h-16 rounded-full bg-brown-primary items-center justify-center mb-4">
                                                <Feather name="shield" size={28} color="#FFF" />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold mb-2">Privacy Policy</Text>
                                            <Text className="text-gray-600 text-center">
                                                Learn how we protect your data
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.push('/contact' as any)}
                                        className="flex-1 bg-craft-50 rounded-2xl p-6 shadow-lg"
                                    >
                                        <View className="items-center">
                                            <View className="w-16 h-16 rounded-full bg-brown-primary items-center justify-center mb-4">
                                                <Feather name="message-circle" size={28} color="#FFF" />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold mb-2">Contact Support</Text>
                                            <Text className="text-gray-600 text-center">
                                                Questions? We're here to help
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Agreement Notice */}
                        <View className="py-12 px-4 bg-brown-primary">
                            <View className="max-w-4xl mx-auto w-full">
                                <View className="flex-row items-center justify-center mb-6">
                                    <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                                        <Feather name="check-circle" size={32} color="#8B4513" />
                                    </View>
                                </View>
                                <Text className={`text-white font-bold text-center mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                                    By Using Our Services
                                </Text>
                                <Text className="text-white text-center text-lg leading-8 opacity-90">
                                    You acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. This agreement constitutes a legally binding contract between you and E-Commerce Platform.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                </PageShell>
            </ScrollView>
        </View>
    );
}
