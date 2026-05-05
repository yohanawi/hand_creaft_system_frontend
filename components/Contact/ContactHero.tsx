import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, Text, View } from 'react-native';

interface ContactHeroProps {
    isDesktop: boolean;
    isTablet: boolean;
    isCompact: boolean;
}

export default function ContactHero({
    isDesktop,
    isTablet,
    isCompact,
}: ContactHeroProps) {

    const fadeAnim = useState(new Animated.Value(0))[0];
    const liftAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(liftAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: liftAnim }] }}>

            <ImageBackground className='mx-24'
                source={{ uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop' }}
                resizeMode="cover"
                style={{ borderRadius: 36, overflow: 'hidden' }}
            >
                {/* Overlay Gradient */}
                <LinearGradient colors={['rgba(40,25,15,0.85)', 'rgba(60,35,20,0.75)', 'rgba(20,10,5,0.9)']}
                    className="rounded-[36px] h-[78vh] d-flex items-center justify-center">
                    <View className={`self-center w-full p-20 ${isDesktop ? 'flex-row items-center' : 'flex-col'}`} >
                        {/* LEFT CONTENT */}
                        <View className={isDesktop ? 'w-[60%]' : 'w-full'}>
                            <Text className="uppercase tracking-[2px] text-white/75 text-[12px]">
                                Get in Touch
                            </Text>
                            <Text className="mt-4 text-white font-heading " style={{ fontSize: isCompact ? 32 : isTablet ? 46 : 54, }}>
                                Let’s craft something meaningful together.
                            </Text>
                            {/* Divider */}
                            <View style={{ width: 60, height: 2, backgroundColor: '#EAD8C7', marginTop: 18, marginBottom: 18 }} />
                            <Text className="max-w-xl font-body text-white/60 text-[16px] leading-[26px]">
                                From custom designs to order support - our atelier team is here to help you at every step.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>

        </Animated.View>
    );
}