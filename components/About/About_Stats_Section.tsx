import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, View } from "react-native";

export default function About_Stats_Section() {

    const { width: W } = Dimensions.get('window');
    const isMobile = W < 768;
    const px = isMobile ? 20 : 48;

    const stats = [
        { icon: 'heart', value: '10K+', label: 'Happy Customers' },
        { icon: 'tool', value: '500+', label: 'Handcrafted Pieces' },
        { icon: 'scissors', value: '10+', label: 'Years of Expertise' },
        { icon: 'globe', value: '30+', label: 'Countries Shipped' },
    ];

    return (
        <View className="py-32 bg-[#FAF6F2]" style={{ paddingHorizontal: px }}>
            <View className="self-center w-full max-w-6xl">
                <View className={`${isMobile ? 'flex-col' : 'flex-row'} items-center justify-around`}>
                    {stats.map((stat, i) => (
                        <React.Fragment key={i}>
                            <View className="items-center" style={{ marginBottom: isMobile ? 36 : 0 }}>
                                <View className="items-center justify-center w-16 h-16 mb-3 border-2 rounded-full bg-brown-Background border-brown-lightColor">
                                    <Feather name={stat.icon as any} size={28} color="#FFF" />
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
        </View>
    );
}