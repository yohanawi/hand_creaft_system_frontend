import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Text, View } from "react-native";

export default function About_Stats_Section() {
    const { width: W } = Dimensions.get('window');
    const isMobile = W < 768;
    const isTablet = W >= 768 && W < 1024;
    const px = isMobile ? 20 : 48;
    const stats = [
        { icon: 'users', value: '28K+', label: 'Happy Clients' },
        { icon: 'award', value: '5K+', label: 'Pieces Crafted' },
        { icon: 'scissors', value: '18+', label: 'Years of Craft' },
        { icon: 'globe', value: '80+', label: 'Countries Reached' },
    ];
    return (
        <LinearGradient
            colors={["#714329", "#B5A192", "#B9937B"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 60, paddingHorizontal: px }}
        >
            <View className="self-center w-full" style={{ maxWidth: 1200 }}>
                <View className={`${isMobile ? 'flex-col' : 'flex-row'} items-center justify-around`}>
                    {stats.map((stat, i) => (
                        <React.Fragment key={i}>
                            <View className="items-center" style={{ marginBottom: isMobile ? 36 : 0 }}>
                                <View
                                    className="items-center justify-center w-16 h-16 mb-3 border-2 rounded-full bg-brown-Background border-brown-lightColor"
                                >
                                    <Feather name={stat.icon as any} size={28} color="#B08463" />
                                </View>
                                <Text className="mb-1 font-extrabold text-brown-lightColor" style={{ fontSize: 42 }}>{stat.value}</Text>
                                <Text className="text-sm font-medium text-brown-TextSecondary" style={{ letterSpacing: 0.5 }}>{stat.label}</Text>
                            </View>
                            {!isMobile && i < stats.length - 1 && (
                                <View className="bg-brown-lightColor" style={{ width: 1, height: 72, opacity: 0.28 }} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}