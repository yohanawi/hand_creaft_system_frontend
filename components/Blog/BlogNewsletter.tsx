import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
    isMobile: boolean;
};

export default function BlogNewsletter({ isMobile }: Props) {
    return (
        <View className="px-4 pb-16">
            <LinearGradient
                colors={['#3A2418', '#6B3F24', '#C99A45'] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] px-6 py-12">
                <View className="absolute rounded-full -right-12 -top-12 h-44 w-44 bg-white/10" />

                <Text className="text-center text-xs font-bold uppercase tracking-[3px] text-[#F8D99A]">
                    Join Our Atelier Notes
                </Text>

                <Text className={`${isMobile ? 'text-[30px]' : 'text-[42px]'} mt-3 text-center font-bold text-white`}>
                    Get Jewelry Care Tips & New Craft Stories
                </Text>

                <Text className="max-w-xl mx-auto mt-3 text-base leading-7 text-center text-white/80">
                    Receive styling inspiration, handmade collection updates,
                    and gemstone guides directly to your inbox.
                </Text>

                <View className={`${isMobile ? 'flex-col' : 'flex-row'} mx-auto mt-8 w-full max-w-lg gap-3 rounded-full bg-white/95`}>
                    <TextInput
                        placeholder="Enter your email address"
                        className="flex-1 px-4 text-base text-[#261812] outline-none"
                        placeholderTextColor="#9B8778"
                    />

                    <TouchableOpacity className="items-center justify-center rounded-full bg-[#3A2418] px-7 py-4">
                        <Text className="font-bold text-white">Subscribe</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}