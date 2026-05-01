import type { InquiryTypeValue } from '@/components/Contact';
import {
    ContactForm,
    ContactHero,
    ContactMethods,
    ContactSidebar,
} from '@/components/Contact';
import PageShell from '@/components/PageShell';
import { AuthContext } from '@/context/AuthContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import { createSupportTicket } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Linking,
    View,
    useWindowDimensions,
} from 'react-native';

export default function ContactUsScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { width } = useWindowDimensions();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<InquiryTypeValue>('general');
    const [focusedField, setFocusedField] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (auth?.user) {
            setName((prev) => prev || auth.user?.name || '');
            setEmail((prev) => prev || auth.user?.email || '');
            setPhone((prev) => prev || auth.user?.phone || '');
        }
    }, [auth?.user]);

    const isDesktop = width >= 1100;
    const isTablet = width >= 768;
    const isCompact = width < 640;
    const containerHorizontalPadding = isCompact ? 16 : 24;

    const openExternalTarget = async (target: string) => {
        try {
            await Linking.openURL(target);
        } catch {
            Alert.alert('Unavailable', 'This action is not available on your device right now.');
        }
    };

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedSubject = subject.trim();
        const trimmedMessage = message.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
            Alert.alert('Missing details', 'Please complete your name, email, subject, and message.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            Alert.alert('Invalid email', 'Please enter a valid email address so we can reply.');
            return;
        }

        setSubmitting(true);

        try {
            await createSupportTicket({
                customerName: trimmedName,
                customerEmail: trimmedEmail,
                customerPhone: trimmedPhone,
                subject: trimmedSubject,
                message: trimmedMessage,
                category,
                priority: 'normal',
                source: 'contact_form',
            });

            Alert.alert(
                'Message received',
                auth?.userToken
                    ? 'Your note has been saved as a support ticket. You can continue the conversation from your ticket list.'
                    : 'Your note has been saved. Our team will reply to the email address you provided.'
            );

            setSubject('');
            setMessage('');
            setCategory('general');

            if (!auth?.userToken) {
                setName('');
                setEmail('');
                setPhone('');
                return;
            }

            router.push('/support-tickets' as any);
        } catch (error: any) {
            Alert.alert('Submission failed', error?.response?.data?.message ?? 'Failed to create support ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: '#FFF8F2' }}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                <PageShell scrollY={scrollY}>
                    <View style={{ paddingHorizontal: containerHorizontalPadding, paddingTop: isCompact ? 18 : 24 }}>
                        {/* Hero banner */}
                        <ContactHero
                            isDesktop={isDesktop}
                            isTablet={isTablet}
                            isCompact={isCompact}
                            userToken={auth?.userToken}
                            onEmailPress={() => openExternalTarget('mailto:support@shophub.com')}
                            onViewTicketsPress={() => router.push('/support-tickets' as any)}
                        />

                        {/* Contact method cards */}
                        <View className="self-center w-full" style={{ maxWidth: 1160, marginTop: 26 }}>
                            <ContactMethods
                                isDesktop={isDesktop}
                                isTablet={isTablet}
                                onMethodPress={openExternalTarget}
                            />
                        </View>

                        {/* Form + sidebar */}
                        <View className="self-center w-full" style={{ maxWidth: 1160, marginTop: 26 }}>
                            <View className={`w-full ${isDesktop ? 'flex-row items-start' : 'flex-col'} gap-6`}>
                                <ContactForm
                                    name={name}
                                    email={email}
                                    phone={phone}
                                    subject={subject}
                                    message={message}
                                    category={category}
                                    focusedField={focusedField}
                                    submitting={submitting}
                                    setName={setName}
                                    setEmail={setEmail}
                                    setPhone={setPhone}
                                    setSubject={setSubject}
                                    setMessage={setMessage}
                                    setCategory={setCategory}
                                    setFocusedField={setFocusedField}
                                    isDesktop={isDesktop}
                                    isTablet={isTablet}
                                    isCompact={isCompact}
                                    userToken={auth?.userToken}
                                    onSubmit={handleSubmit}
                                />

                                <ContactSidebar
                                    isDesktop={isDesktop}
                                    isCompact={isCompact}
                                    onDirectionsPress={() =>
                                        openExternalTarget(
                                            'https://maps.google.com/?q=123+Shopping+Street+New+York+NY+10001'
                                        )
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
