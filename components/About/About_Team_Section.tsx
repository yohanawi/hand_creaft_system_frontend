import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Text, View } from "react-native";

export default function About_Team_Section() {
    const { width: W } = Dimensions.get('window');
    const Ring = ({ size, top, right, bottom, left, alpha = 0.15 }: {
        size: number; top?: number; right?: number; bottom?: number; left?: number; alpha?: number;
    }) => (
        <View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 1.5, borderColor: `rgba(113,67,41,${alpha})`,
            top, right, bottom, left,
        }} />
    );
    const SectionLabel = ({ text, light = false }: { text: string; light?: boolean }) => (
        <Text
            className={`mb-2 text-xs font-bold tracking-widest uppercase ${light ? 'text-brown-lightColor' : 'text-brown-DarkColor'}`}
            style={{ letterSpacing: 2.5 }}
        >
            {text}
        </Text>
    );
    const SectionTitle = ({ title, center = false, light = false, isMobile }: {
        title: string; center?: boolean; light?: boolean; isMobile: boolean;
    }) => (
        <Text
            className={`font-extrabold${center ? ' text-center' : ''} ${light ? 'text-brown-Background' : 'text-brown-TextPrimary'}`}
            style={{ fontSize: isMobile ? 28 : 40, lineHeight: isMobile ? 38 : 52 }}
        >
            {title}
        </Text>
    );
    const GoldDivider = () => (
        <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-brown-Border" />
            <View className="w-2 h-2 mx-2 rounded-full bg-brown-DarkColor" />
            <View className="w-1.5 h-1.5 rounded-full mx-1 bg-brown-lightColor" />
            <View className="w-2 h-2 mx-2 rounded-full bg-brown-DarkColor" />
            <View className="flex-1 h-px bg-brown-Border" />
        </View>
    );
    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1024;
    const px = isMobile ? 20 : 48;
    const team = [
        { name: 'Amara Silva', role: 'Master Goldsmith', bio: '18 years shaping gold with ancestral precision and an eye for timeless form.', icon: 'scissors' },
        { name: 'Priya Nair', role: 'Gemologist & Designer', bio: 'GIA-certified gemologist with a designer\'s sensibility and a collector\'s discernment.', icon: 'star' },
        { name: 'David Craft', role: 'Head of Bespoke', bio: 'Transforms every client\'s personal story into a wearable, enduring work of art.', icon: 'pen-tool' },
        { name: 'Lena Voss', role: 'Client Experience', bio: 'Ensures every step of your journey with us is as memorable as the jewellery itself.', icon: 'heart' },
    ];
    return (
        <View className="bg-brown-SecondaryBackground" style={{ paddingVertical: 72, paddingHorizontal: px }}>
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className="items-center">
                    <SectionLabel text="✦ The Artisans" />
                    <SectionTitle title="Meet the Makers" center isMobile={isMobile} />
                    <GoldDivider />
                </View>
                <View className="flex-row flex-wrap" style={{ justifyContent: 'space-between', gap: 16 }}>
                    {team.map((member, i) => (
                        <View
                            key={i}
                            className="border bg-brown-Background border-brown-Border rounded-3xl"
                            style={{
                                width: isMobile ? '100%' : isTablet ? '48%' : '23%',
                                overflow: 'hidden',
                                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
                            }}
                        >
                            {/* Card header */}
                            <LinearGradient
                                colors={["#714329", "#B5A192"]}
                                style={{ height: 96, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Feather name={member.icon as any} size={40} color="#B08463" />
                            </LinearGradient>
                            <View className="items-center p-5">
                                <Text className="mb-1 text-base font-bold text-center text-brown-TextPrimary">{member.name}</Text>
                                <Text className="mb-3 text-xs font-bold text-center uppercase text-brown-DarkColor" style={{ letterSpacing: 1 }}>
                                    {member.role}
                                </Text>
                                <View className="w-8 h-0.5 rounded-full mb-3 bg-brown-lightColor" />
                                <Text className="text-sm leading-relaxed text-center text-brown-TextSecondary">{member.bio}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}