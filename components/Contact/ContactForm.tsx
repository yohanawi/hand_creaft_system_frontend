import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export const INQUIRY_TYPES = [
    { label: 'General', value: 'general' },
    { label: 'Orders', value: 'order' },
    { label: 'Shipping', value: 'shipping' },
    { label: 'Product care', value: 'product' },
    { label: 'Account', value: 'account' },
] as const;

export type InquiryTypeValue = (typeof INQUIRY_TYPES)[number]['value'];

interface InputShellProps {
    field: string;
    icon: keyof typeof Feather.glyphMap;
    children: React.ReactNode;
    multiline?: boolean;
    focusedField: string;
}

function InputShell({ field, icon, children, multiline = false, focusedField }: InputShellProps) {
    const isFocused = focusedField === field;

    return (
        <View
            className={`rounded-[22px] border bg-white ${multiline ? 'p-4' : 'flex-row items-center px-4 py-4'}`}
            style={{
                borderColor: isFocused ? BROWN.DarkColor : '#E8D7C8',
                backgroundColor: isFocused ? '#FFFCF8' : '#FFFFFF',
                shadowColor: isFocused ? BROWN.DarkColor : 'transparent',
                shadowOpacity: isFocused ? 0.08 : 0,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 10 },
                elevation: isFocused ? 4 : 0,
            }}
        >
            {!multiline ? <Feather name={icon} size={18} color={BROWN.lightColor} /> : null}

            {multiline ? (
                <View className="flex-row items-center mb-3">
                    <Feather name={icon} size={18} color={BROWN.lightColor} />
                    <Text
                        className="ml-2 font-body text-[12px] uppercase tracking-[1.6px]"
                        style={{ color: '#A06F54' }}
                    >
                        Your note
                    </Text>
                </View>
            ) : null}

            {children}
        </View>
    );
}

interface ContactFormProps {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    category: InquiryTypeValue;
    focusedField: string;
    submitting: boolean;
    setName: (v: string) => void;
    setEmail: (v: string) => void;
    setPhone: (v: string) => void;
    setSubject: (v: string) => void;
    setMessage: (v: string) => void;
    setCategory: (v: InquiryTypeValue) => void;
    setFocusedField: (v: string) => void;
    isDesktop: boolean;
    isTablet: boolean;
    isCompact: boolean;
    userToken: string | null | undefined;
    onSubmit: () => void;
}

export default function ContactForm({
    name,
    email,
    phone,
    subject,
    message,
    category,
    focusedField,
    submitting,
    setName,
    setEmail,
    setPhone,
    setSubject,
    setMessage,
    setCategory,
    setFocusedField,
    isDesktop,
    isTablet,
    isCompact,
    userToken,
    onSubmit,
}: ContactFormProps) {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const formSlideAnim = useState(new Animated.Value(-32))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
            Animated.timing(formSlideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, formSlideAnim]);

    const formFieldWidth = isDesktop ? '48.4%' : '100%';

    return (
        <Animated.View
            style={{
                flex: isDesktop ? 1.74 : undefined,
                width: isDesktop ? undefined : '100%',
                minWidth: 0,
                opacity: fadeAnim,
                transform: [{ translateX: formSlideAnim }],
            }}
        >
            <View
                className="rounded-[34px] border px-5 py-6"
                style={{ borderColor: '#ECD9CA', backgroundColor: '#FFFCF8' }}
            >
                {/* Header */}
                <Text
                    className="font-body text-[12px] uppercase tracking-[2px]"
                    style={{ color: '#A16D52' }}
                >
                    Send a message
                </Text>

                <Text
                    className="mt-3 font-heading text-[34px]"
                    style={{ color: BROWN.TextPrimary, lineHeight: 42 }}
                >
                    Tell us what you need, and we will route it to the right craft and care team.
                </Text>

                <Text
                    className="mt-4 font-body text-[14px] leading-7"
                    style={{ color: BROWN.TextSecondary }}
                >
                    Every submission creates a support ticket in the same system used by the customer
                    dashboard, so follow-up stays organized from first contact to resolution.
                </Text>

                {/* Inquiry type selector */}
                <View className="mt-7">
                    <Text
                        className="font-body text-[13px] font-semibold"
                        style={{ color: BROWN.TextPrimary }}
                    >
                        Inquiry type
                    </Text>

                    <View className="flex-row flex-wrap gap-3 mt-3">
                        {INQUIRY_TYPES.map((item) => {
                            const active = item.value === category;

                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => setCategory(item.value)}
                                    activeOpacity={0.9}
                                    className="px-4 py-3 border rounded-full"
                                    style={{
                                        borderColor: active ? BROWN.DarkColor : '#E7D6C8',
                                        backgroundColor: active ? '#F6ECDF' : '#FFFFFF',
                                    }}
                                >
                                    <Text
                                        className="font-body text-[13px] font-semibold"
                                        style={{ color: active ? BROWN.DarkColor : BROWN.TextSecondary }}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Two-column fields */}
                <View className="flex-row flex-wrap justify-between mt-7 gap-y-4">
                    {/* Full name */}
                    <View style={{ width: formFieldWidth }}>
                        <Text
                            className="mb-2 font-body text-[13px] font-semibold"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            Full name
                        </Text>
                        <InputShell field="name" icon="user" focusedField={focusedField}>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField('')}
                                placeholder="Your name"
                                placeholderTextColor="#9B8A7C"
                                className="ml-3 flex-1 font-body text-[15px]"
                                style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                            />
                        </InputShell>
                    </View>

                    {/* Email */}
                    <View style={{ width: formFieldWidth }}>
                        <Text
                            className="mb-2 font-body text-[13px] font-semibold"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            Email address
                        </Text>
                        <InputShell field="email" icon="mail" focusedField={focusedField}>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField('')}
                                placeholder="you@example.com"
                                placeholderTextColor="#9B8A7C"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="ml-3 flex-1 font-body text-[15px]"
                                style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                            />
                        </InputShell>
                    </View>

                    {/* Phone */}
                    <View style={{ width: formFieldWidth }}>
                        <Text
                            className="mb-2 font-body text-[13px] font-semibold"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            Phone number
                        </Text>
                        <InputShell field="phone" icon="phone" focusedField={focusedField}>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField('')}
                                placeholder="Optional"
                                placeholderTextColor="#9B8A7C"
                                keyboardType="phone-pad"
                                className="ml-3 flex-1 font-body text-[15px]"
                                style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                            />
                        </InputShell>
                    </View>

                    {/* Subject */}
                    <View style={{ width: formFieldWidth }}>
                        <Text
                            className="mb-2 font-body text-[13px] font-semibold"
                            style={{ color: BROWN.TextPrimary }}
                        >
                            Subject
                        </Text>
                        <InputShell field="subject" icon="tag" focusedField={focusedField}>
                            <TextInput
                                value={subject}
                                onChangeText={setSubject}
                                onFocus={() => setFocusedField('subject')}
                                onBlur={() => setFocusedField('')}
                                placeholder="What can we help with?"
                                placeholderTextColor="#9B8A7C"
                                className="ml-3 flex-1 font-body text-[15px]"
                                style={{ color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                            />
                        </InputShell>
                    </View>
                </View>

                {/* Message */}
                <View className="mt-4">
                    <Text
                        className="mb-2 font-body text-[13px] font-semibold"
                        style={{ color: BROWN.TextPrimary }}
                    >
                        Message
                    </Text>
                    <InputShell field="message" icon="edit-3" multiline focusedField={focusedField}>
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField('')}
                            placeholder="Share your order number, sizing question, gifting deadline, or anything else we should know."
                            placeholderTextColor="#9B8A7C"
                            multiline
                            numberOfLines={7}
                            textAlignVertical="top"
                            className="font-body text-[15px]"
                            style={{ minHeight: 160, color: BROWN.TextPrimary, fontFamily: BRAND_FONTS.body }}
                        />
                    </InputShell>
                </View>

                {/* Footer – notice + submit */}
                <View
                    className={`mt-6 ${isTablet ? 'flex-row items-center justify-between' : 'flex-col'} gap-4`}
                >
                    <View className={isTablet ? 'flex-1 pr-4' : 'w-full'}>
                        <Text
                            className="font-body text-[12px] leading-6"
                            style={{ color: BROWN.TextSecondary }}
                        >
                            {userToken
                                ? 'Signed-in messages are stored under your account as support tickets.'
                                : 'Guest messages are still saved in the support database with the email you provide.'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={submitting}
                        activeOpacity={0.92}
                        className="px-6 py-4 rounded-full"
                        style={{
                            backgroundColor: submitting ? BROWN.lightBackground : BROWN.DarkColor,
                            minWidth: isTablet ? 220 : undefined,
                        }}
                    >
                        <View className="flex-row items-center justify-center">
                            <Feather
                                name={submitting ? 'loader' : 'send'}
                                size={18}
                                color="#FFFFFF"
                            />
                            <Text className="ml-2 font-body text-[14px] font-semibold text-white">
                                {submitting ? 'Saving ticket...' : 'Send to support'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}
