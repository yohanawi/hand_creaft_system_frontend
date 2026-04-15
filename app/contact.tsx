import PageShell from '@/components/PageShell';
import AuthContext from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { createSupportTicket } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ContactUsScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useContext(AuthContext);
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [focusedField, setFocusedField] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideLeftAnim = useState(new Animated.Value(-50))[0];
    const slideRightAnim = useState(new Animated.Value(50))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideLeftAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideRightAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (auth?.user) {
            setName((prev) => prev || auth.user?.name || '');
            setEmail((prev) => prev || auth.user?.email || '');
            setPhone((prev) => prev || auth.user?.phone || '');
        }
    }, [auth?.user]);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const contactMethods = [
        {
            icon: 'phone',
            title: 'Call Us',
            info1: '+1 (555) 123-4567',
            info2: 'Mon-Fri, 9AM-6PM EST',
            gradient: ['#667eea', '#764ba2'],
        },
        {
            icon: 'mail',
            title: 'Email Us',
            info1: 'support@shophub.com',
            info2: 'Response within 24hrs',
            gradient: ['#f093fb', '#f5576c'],
        },
        {
            icon: 'map-pin',
            title: 'Visit Us',
            info1: '123 Shopping Street',
            info2: 'New York, NY 10001',
            gradient: ['#4facfe', '#00f2fe'],
        },
        {
            icon: 'message-circle',
            title: 'Live Chat',
            info1: 'Available 24/7',
            info2: 'Instant Support',
            gradient: ['#43e97b', '#38f9d7'],
        },
    ];

    const faqs = [
        {
            question: 'What is your return policy?',
            answer: '30-day money-back guarantee on all items',
        },
        {
            question: 'How long does shipping take?',
            answer: '3-7 business days for standard shipping',
        },
        {
            question: 'Do you ship internationally?',
            answer: 'Yes, we ship to over 150 countries worldwide',
        },
    ];

    const handleSubmit = async () => {
        if (!name || !email || !subject || !message) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await createSupportTicket({
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                subject,
                message,
                category: 'general',
                priority: 'normal',
                source: 'contact_form',
            });
            alert('Support ticket created successfully.');
            setSubject('');
            setMessage('');
            if (!auth?.userToken) {
                setName('');
                setEmail('');
                setPhone('');
            } else {
                router.push('/support-tickets' as any);
            }
        } catch (error: any) {
            alert(error?.response?.data?.message ?? 'Failed to create support ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <PageShell scrollY={scrollY}>

                    {/* Hero Section */}
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <LinearGradient
                            colors={['#8B4513', '#A0522D', '#CD853F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="px-4 py-20"
                        >
                            <View className="max-w-7xl mx-auto w-full">
                                <Text className={`text-white font-bold text-center mb-4 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
                                    Get in Touch
                                </Text>
                                <Text className="text-white text-lg text-center max-w-2xl mx-auto leading-8 opacity-90">
                                    Have questions? We're here to help. Reach out to us through any of the channels below.
                                </Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Contact Methods */}
                    <View className="py-16 px-4 bg-craft-50">
                        <View className="max-w-7xl mx-auto w-full">
                            <View className={`${isMobile ? 'flex-col' : 'flex-row flex-wrap justify-between'}`}>
                                {contactMethods.map((method, index) => (
                                    <Animated.View
                                        key={index}
                                        style={{ opacity: fadeAnim }}
                                        className={`${isMobile ? 'mb-6' : isTablet ? 'w-[48%] mb-6' : 'w-[23%]'}`}
                                    >
                                        <TouchableOpacity activeOpacity={0.9}>
                                            <LinearGradient
                                                colors={method.gradient as any}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                className="rounded-2xl p-6 h-48 justify-center items-center"
                                            >
                                                <View className="bg-white bg-opacity-30 rounded-full p-4 mb-4">
                                                    <Feather name={method.icon as any} size={32} color="#FFF" />
                                                </View>
                                                <Text className="text-white text-xl font-bold mb-2 text-center">
                                                    {method.title}
                                                </Text>
                                                <Text className="text-white text-sm text-center opacity-90">
                                                    {method.info1}
                                                </Text>
                                                <Text className="text-white text-xs text-center opacity-80 mt-1">
                                                    {method.info2}
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Contact Form & Map */}
                    <View className="py-16 px-4 bg-white">
                        <View className="max-w-7xl mx-auto w-full">
                            <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
                                {/* Form */}
                                <Animated.View
                                    style={{ transform: [{ translateX: slideLeftAnim }] }}
                                    className={`${isMobile ? 'w-full mb-8' : 'w-3/5'}`}
                                >
                                    <Text className={`text-brown-primary font-bold mb-6 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                        Send us a Message
                                    </Text>

                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-semibold mb-2">Full Name *</Text>
                                        <View className={`flex-row items-center bg-craft-50 rounded-xl px-4 py-3 ${focusedField === 'name' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                            }`}>
                                            <Feather name="user" size={20} color="#8B4513" />
                                            <TextInput
                                                placeholder="John Doe"
                                                value={name}
                                                onChangeText={setName}
                                                onFocus={() => setFocusedField('name')}
                                                onBlur={() => setFocusedField('')}
                                                className="flex-1 ml-3 text-base"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-semibold mb-2">Email Address *</Text>
                                        <View className={`flex-row items-center bg-craft-50 rounded-xl px-4 py-3 ${focusedField === 'email' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                            }`}>
                                            <Feather name="mail" size={20} color="#8B4513" />
                                            <TextInput
                                                placeholder="john@example.com"
                                                value={email}
                                                onChangeText={setEmail}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField('')}
                                                keyboardType="email-address"
                                                className="flex-1 ml-3 text-base"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
                                        <View className={`flex-row items-center bg-craft-50 rounded-xl px-4 py-3 ${focusedField === 'phone' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                            }`}>
                                            <Feather name="phone" size={20} color="#8B4513" />
                                            <TextInput
                                                placeholder="+1 (555) 123-4567"
                                                value={phone}
                                                onChangeText={setPhone}
                                                onFocus={() => setFocusedField('phone')}
                                                onBlur={() => setFocusedField('')}
                                                keyboardType="phone-pad"
                                                className="flex-1 ml-3 text-base"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-semibold mb-2">Subject *</Text>
                                        <View className={`flex-row items-center bg-craft-50 rounded-xl px-4 py-3 ${focusedField === 'subject' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                            }`}>
                                            <Feather name="tag" size={20} color="#8B4513" />
                                            <TextInput
                                                placeholder="How can we help?"
                                                value={subject}
                                                onChangeText={setSubject}
                                                onFocus={() => setFocusedField('subject')}
                                                onBlur={() => setFocusedField('')}
                                                className="flex-1 ml-3 text-base"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-6">
                                        <Text className="text-gray-700 font-semibold mb-2">Message *</Text>
                                        <View className={`bg-craft-50 rounded-xl p-4 ${focusedField === 'message' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                            }`}>
                                            <TextInput
                                                placeholder="Tell us more..."
                                                value={message}
                                                onChangeText={setMessage}
                                                onFocus={() => setFocusedField('message')}
                                                onBlur={() => setFocusedField('')}
                                                multiline
                                                numberOfLines={6}
                                                textAlignVertical="top"
                                                className="text-base"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        disabled={submitting}
                                        className="bg-brown-primary rounded-xl py-4 flex-row items-center justify-center"
                                    >
                                        <Feather name="send" size={20} color="#FFF" />
                                        <Text className="text-white font-bold text-base ml-2">{submitting ? 'Submitting...' : 'Send Message'}</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Info Sidebar */}
                                <Animated.View
                                    style={{ transform: [{ translateX: slideRightAnim }] }}
                                    className={`${isMobile ? 'w-full' : 'w-2/5'}`}
                                >
                                    {/* Map */}
                                    <View className="bg-craft-100 rounded-2xl h-64 items-center justify-center mb-6">
                                        <Feather name="map" size={64} color="#8B4513" />
                                        <Text className="text-brown-primary text-lg font-bold mt-4">
                                            Find Us Here
                                        </Text>
                                    </View>

                                    {/* Office Hours */}
                                    <View className="bg-craft-50 rounded-2xl p-6 mb-6">
                                        <View className="flex-row items-center mb-4">
                                            <Feather name="clock" size={24} color="#8B4513" />
                                            <Text className="text-brown-primary text-xl font-bold ml-3">
                                                Office Hours
                                            </Text>
                                        </View>
                                        <View className="space-y-2">
                                            <View className="flex-row justify-between py-2 border-b border-gray-200">
                                                <Text className="text-gray-600">Monday - Friday</Text>
                                                <Text className="text-gray-900 font-semibold">9AM - 6PM</Text>
                                            </View>
                                            <View className="flex-row justify-between py-2 border-b border-gray-200">
                                                <Text className="text-gray-600">Saturday</Text>
                                                <Text className="text-gray-900 font-semibold">10AM - 4PM</Text>
                                            </View>
                                            <View className="flex-row justify-between py-2">
                                                <Text className="text-gray-600">Sunday</Text>
                                                <Text className="text-gray-900 font-semibold">Closed</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Quick FAQs */}
                                    <View className="bg-craft-50 rounded-2xl p-6">
                                        <Text className="text-brown-primary text-xl font-bold mb-4">
                                            Quick FAQs
                                        </Text>
                                        {faqs.map((faq, index) => (
                                            <View key={index} className="mb-4">
                                                <Text className="text-gray-900 font-semibold mb-1">
                                                    {faq.question}
                                                </Text>
                                                <Text className="text-gray-600 text-sm">
                                                    {faq.answer}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </Animated.View>
                            </View>
                        </View>
                    </View>

                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
