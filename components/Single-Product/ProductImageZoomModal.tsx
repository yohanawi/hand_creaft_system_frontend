import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS } from '@/components/Single-Product/theme';

type Props = {
    visible: boolean;
    image?: string;
    zoomScale: number;
    onClose: () => void;
    onDecreaseZoom: () => void;
    onResetZoom: () => void;
    onIncreaseZoom: () => void;
};

export default function ProductImageZoomModal({
    visible,
    image,
    zoomScale,
    onClose,
    onDecreaseZoom,
    onResetZoom,
    onIncreaseZoom,
}: Props) {
    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(17,24,39,0.94)', padding: 20, justifyContent: 'center' }}>
                <TouchableOpacity
                    onPress={onClose}
                    style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.14)', width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Feather name="x" size={20} color={PRODUCT_PAGE_COLORS.white} />
                </TouchableOpacity>

                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={{ width: '100%', height: '72%', transform: [{ scale: zoomScale }] }}
                        contentFit="contain"
                    />
                ) : null}

                <View style={{ alignItems: 'center', marginTop: 18 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.82)', fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13 }}>
                        Zoom: {zoomScale.toFixed(2)}x
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 18 }}>
                    {[
                        { label: '-', onPress: onDecreaseZoom },
                        { label: 'Reset', onPress: onResetZoom },
                        { label: '+', onPress: onIncreaseZoom },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={item.onPress}
                            style={{ backgroundColor: PRODUCT_PAGE_COLORS.white, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 }}
                        >
                            <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '800' }}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
}