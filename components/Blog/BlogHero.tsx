import { BLOG_COLORS } from '@/components/Blog/blogTheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, Text, TextInput, View } from 'react-native';

type Props = {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    isMobile: boolean;
};

export default function BlogHero({ searchQuery, onSearchChange, isMobile }: Props) {
    return (
        <ImageBackground
            source={{
                uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600',
            }}
            resizeMode="cover"
            className="overflow-hidden"
        >
            <LinearGradient
                colors={[
                    'rgba(38,24,18,0.92)',
                    'rgba(58,36,24,0.82)',
                    'rgba(201,154,69,0.45)',
                ] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="min-h-[620px] items-center justify-center px-4 py-20"
            >
                {/* Decorative glow */}
                <View className="absolute -top-20 h-64 w-64 rounded-full bg-[#C99A45]/25" />
                <View className="absolute rounded-full -bottom-24 -right-16 h-72 w-72 bg-white/10" />
                <View className="absolute w-32 h-32 border rounded-full bottom-12 left-8 border-white/20" />

                <View className="items-center w-full max-w-4xl">
                    <View className="px-5 py-2 mb-5 border rounded-full border-white/25 bg-white/10">
                        <Text className="text-center text-[11px] font-bold uppercase tracking-[3px] text-white">
                            Artisan Stories
                        </Text>
                    </View>

                    <Text className={`text-center font-bold text-white font-heading
                        ${isMobile
                            ? 'text-[44px] leading-[50px]'
                            : 'text-[62px] leading-[80px]'
                        }`}>
                        Handmade Jewelry Journals
                    </Text>

                    <Text className="max-w-[680px] text-center text-[15px] leading-7 text-white/70 mt-5">
                        Discover gemstone stories, handmade craft guides, jewelry care
                        tips, and styling inspiration from our artisan collection.
                    </Text>

                    <View className="mt-9 w-full max-w-2xl rounded-[30px] border border-white/25 bg-white/95 p-3">
                        <View className="flex-row items-center rounded-[24px] bg-[#FFF8EF] px-4">
                            <View className="mr-3 h-5 w-6 items-center justify-center rounded-full bg-[#F1DEC5]">
                                <Feather name="search" size={16} color={BLOG_COLORS.brown} />
                            </View>

                            <TextInput
                                placeholder="Search stories, gemstones, care tips..."
                                value={searchQuery}
                                onChangeText={onSearchChange}
                                className="flex-1 text-base text-[#2A1710] outline-none"
                                underlineColorAndroid="transparent"
                                placeholderTextColor="#9B8778"
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </ImageBackground>
    );
}