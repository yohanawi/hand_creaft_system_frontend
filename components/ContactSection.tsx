import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ContactSection() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideLeftAnim = useState(new Animated.Value(-50))[0];
    const slideRightAnim = useState(new Animated.Value(50))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];

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
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isMobile = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

    const handleSubmit = () => {
        if (name && email && subject && message) {
            alert('Thank you for contacting us! We\'ll get back to you soon.');
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } else {
            alert('Please fill in all fields');
        }
    };

    const contactInfo = [
        {
            icon: 'map-pin',
            title: 'Visit Us',
            content: '123 Shopping Street\nNew York, NY 10001',
            gradient: ['#667eea', '#764ba2'],
        },
        {
            icon: 'phone',
            title: 'Call Us',
            content: '+1 (555) 123-4567\nMon-Fri, 9AM-6PM',
            gradient: ['#f093fb', '#f5576c'],
        },
        {
            icon: 'mail',
            title: 'Email Us',
            content: 'support@shophub.com\ninfo@shophub.com',
            gradient: ['#4facfe', '#00f2fe'],
        },
        {
            icon: 'clock',
            title: 'Working Hours',
            content: 'Mon-Fri: 9AM-6PM\nSat-Sun: 10AM-4PM',
            gradient: ['#43e97b', '#38f9d7'],
        },
    ];

    const ContactInfoCard = ({ info, index }: any) => {
        const cardScale = useState(new Animated.Value(1))[0];
        const cardOpacity = useState(new Animated.Value(0))[0];

        useEffect(() => {
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 800,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(cardScale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(cardScale, {
                toValue: 1,
                tension: 50,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={{
                    transform: [{ scale: cardScale }],
                    opacity: cardOpacity,
                }}
                className={`mb-6 ${isMobile ? 'w-full' : isTablet ? 'w-[48%]' : 'w-[23%]'}`}
            >
                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={info.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-2xl p-6"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            elevation: 5,
                        }}
                    >
                        <View className="bg-white bg-opacity-30 rounded-full p-4 w-16 h-16 items-center justify-center mb-4">
                            <Feather name={info.icon as any} size={28} color="#FFF" />
                        </View>
                        <Text className="text-white text-lg font-bold mb-2">{info.title}</Text>
                        <Text className="text-white text-sm leading-6 opacity-90">
                            {info.content}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Animated.View
            style={{ opacity: fadeAnim }}
            className="bg-white py-16 px-4"
        >
            <View className="max-w-7xl mx-auto w-full">
                {/* Section Header */}
                <View className="mb-12">
                    <View className="flex-row items-center justify-center mb-3">
                        <View className="h-1 w-12 bg-brown-primary rounded mr-3" />
                        <Feather name="message-circle" size={24} color="#8B4513" />
                        <View className="h-1 w-12 bg-brown-primary rounded ml-3" />
                    </View>
                    <Text className={`text-brown-primary text-center font-bold mb-2 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                        Get in Touch
                    </Text>
                    <Text className="text-gray-600 text-center text-base max-w-2xl mx-auto">
                        Have a question or feedback? We'd love to hear from you!
                    </Text>
                </View>

                {/* Contact Info Cards */}
                <View className={`${isMobile ? 'flex-col' : 'flex-row flex-wrap justify-between'} mb-12`}>
                    {contactInfo.map((info, index) => (
                        <ContactInfoCard key={index} info={info} index={index} />
                    ))}
                </View>

                {/* Contact Form & Map */}
                <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
                    {/* Contact Form */}
                    <Animated.View
                        style={{
                            transform: [{ translateX: slideLeftAnim }],
                        }}
                        className={`${isMobile ? 'w-full mb-8' : 'w-1/2'}`}
                    >
                        <View className="bg-craft-50 rounded-3xl p-8 shadow-lg"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 5,
                            }}>
                            <View className="flex-row items-center mb-6">
                                <View className="bg-brown-primary rounded-full p-3 mr-3">
                                    <Feather name="send" size={20} color="#FFF" />
                                </View>
                                <Text className="text-brown-primary text-2xl font-bold">
                                    Send us a Message
                                </Text>
                            </View>

                            {/* Name Input */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-semibold mb-2">Your Name</Text>
                                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${focusedField === 'name' ? 'border-2 border-brown-primary' : 'border border-gray-300'
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

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
                                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${focusedField === 'email' ? 'border-2 border-brown-primary' : 'border border-gray-300'
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

                            {/* Subject Input */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-semibold mb-2">Subject</Text>
                                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${focusedField === 'subject' ? 'border-2 border-brown-primary' : 'border border-gray-300'
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

                            {/* Message Input */}
                            <View className="mb-6">
                                <Text className="text-gray-700 font-semibold mb-2">Message</Text>
                                <View className={`bg-white rounded-xl p-4 ${focusedField === 'message' ? 'border-2 border-brown-primary' : 'border border-gray-300'
                                    }`}>
                                    <TextInput
                                        placeholder="Tell us more about your inquiry..."
                                        value={message}
                                        onChangeText={setMessage}
                                        onFocus={() => setFocusedField('message')}
                                        onBlur={() => setFocusedField('')}
                                        multiline
                                        numberOfLines={5}
                                        textAlignVertical="top"
                                        className="text-base"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-brown-primary rounded-xl py-4 flex-row items-center justify-center"
                                style={{
                                    shadowColor: '#8B4513',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                    elevation: 5,
                                }}
                            >
                                <Feather name="send" size={20} color="#FFF" />
                                <Text className="text-white font-bold text-base ml-2">
                                    Send Message
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Map & Additional Info */}
                    <Animated.View
                        style={{
                            transform: [{ translateX: slideRightAnim }, { scale: scaleAnim }],
                        }}
                        className={`${isMobile ? 'w-full' : 'w-1/2'}`}
                    >
                        {/* Map Placeholder */}
                        <View className="bg-craft-100 rounded-3xl overflow-hidden shadow-lg mb-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 5,
                            }}>
                            <View className="h-80 bg-craft-200 items-center justify-center">
                                <Feather name="map" size={64} color="#8B4513" />
                                <Text className="text-brown-primary text-lg font-bold mt-4">
                                    Interactive Map
                                </Text>
                                <Text className="text-gray-600 text-sm mt-2">
                                    123 Shopping Street, NY
                                </Text>
                            </View>
                        </View>

                        {/* FAQ Prompt */}
                        <View className="bg-gradient-to-br from-brown-primary to-brown-secondary rounded-3xl p-6 shadow-lg">
                            <LinearGradient
                                colors={['#8B4513', '#A0522D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-3xl p-6"
                            >
                                <View className="flex-row items-start mb-4">
                                    <View className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                                        <Feather name="help-circle" size={28} color="#FFF" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-xl font-bold mb-2">
                                            Need Quick Answers?
                                        </Text>
                                        <Text className="text-white opacity-90 text-sm leading-6">
                                            Check out our FAQ section for instant answers to common questions
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    className="bg-white rounded-full py-3 items-center mt-4"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        elevation: 3,
                                    }}
                                >
                                    <Text className="text-brown-primary font-bold">
                                        Visit FAQ
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Animated.View>
    );
}
