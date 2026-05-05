import { Feather } from '@expo/vector-icons';
import React from "react";
import { Dimensions, Text, View } from "react-native";

export default function About_CTA() {

    const { width: W } = Dimensions.get('window');
    const isMobile = W < 768;
    const px = isMobile ? 20 : 48;

    const Ring = ({ size, top, right, bottom, left, alpha = 0.15 }: {
        size: number; top?: number; right?: number; bottom?: number; left?: number; alpha?: number;
    }) => (
        <View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 1, borderColor: `rgba(176,132,99,${alpha})`,
            top, right, bottom, left,
        }} />
    );

    const CornerOrnament = ({ flip }: { flip?: boolean }) => (
        <View style={{
            position: 'absolute',
            top: flip ? undefined : 20,
            bottom: flip ? 20 : undefined,
            left: flip ? undefined : 24,
            right: flip ? 28 : undefined,
            opacity: 0.18,
            transform: flip ? [{ rotate: '180deg' }] : [],
        }}>
            <View style={{ width: 32, height: 32 }}>
                <View style={{
                    position: 'absolute', top: 0, left: 0,
                    width: 32, height: 1, backgroundColor: '#B08463'
                }} />
                <View style={{
                    position: 'absolute', top: 0, left: 0,
                    width: 1, height: 32, backgroundColor: '#B08463'
                }} />
                <View style={{
                    position: 'absolute', top: -2, left: -2,
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: '#B08463'
                }} />
            </View>
        </View>
    );

    return (
        <View style={{ paddingVertical: 48, paddingHorizontal: px, backgroundColor: '#FAF6F2' }}>
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 860 }}>
                <View style={{
                    backgroundColor: '#2C1810',
                    borderRadius: 28,
                    paddingVertical: isMobile ? 48 : 64,
                    paddingHorizontal: isMobile ? 28 : 64,
                    alignItems: 'center',
                    overflow: 'hidden',
                }}>
                    {/* Decorative rings */}
                    <Ring size={320} top={-100} right={-80} alpha={0.18} />
                    <Ring size={180} bottom={-60} left={-50} alpha={0.11} />
                    <Ring size={420} top={-160} left={-120} alpha={0.07} />

                    {/* Corner ornaments */}
                    <CornerOrnament />
                    <CornerOrnament flip />

                    {/* Icon ring */}
                    <View className="items-center justify-center w-16 h-16 mb-6 border-2 rounded-full bg-[rgba(176,132,99,0.08)] border-[#B08463]">
                        <Feather name="star" size={22} color="#B08463" />
                    </View>

                    {/* Label */}
                    <Text className="mb-5 text-xs tracking-widest text-[#B08463] uppercase">
                        Our Story Continues With You
                    </Text>

                    {/* Heading */}
                    <Text className="mb-4 font-serif text-4xl leading-tight text-center text-white md:text-5xl">
                        Crafted for the{'\n'}
                        <Text className="italic text-[#C9A882]">
                            moments that matter.
                        </Text>
                    </Text>

                    {/* Divider */}
                    <View className="w-10 h-px bg-[#B08463] my-5 opacity-50" />

                    {/* Subtitle */}
                    <Text className="max-w-xl mb-8 text-sm text-center text-white">
                        Every piece we make carries the weight of intention - a declaration of love, a mark of achievement, a quiet act of self-expression. Let us craft yours.
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row items-center gap-5 d-flex">
                        <button className="px-4 py-4 bg-[#B08463] flex items-center gap-2 rounded-full">
                            <Feather name="arrow-right" size={14} color="#2C1810" />
                            <Text className="text-sm uppercase text-[#2C1810]">Explore the Collection</Text>
                        </button>

                        <button className="px-4 py-3 border border-[#D0B9A7] d-flex flex-row items-center gap-2 rounded-full">
                            <Feather name="phone" size={13} color="#D0B9A7" />
                            <Text className="text-sm uppercase text-[#D0B9A7]">Get in Touch</Text>
                        </button>
                    </View>
                </View>
            </View>
        </View >
    );
}