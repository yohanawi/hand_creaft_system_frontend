import React from 'react';
import { View } from 'react-native';

import useCategoryLayout from './useCategoryLayout';

function SkeletonBox({ style }: { style?: object }) {
    return (
        <View style={[{
            backgroundColor: '#F0E8DF',
            borderRadius: 8,
        }, style]} />
    );
}

function CategoryCardSkeleton({ index }: { index: number }) {
    const { cardWidth } = useCategoryLayout();

    return (
        <View style={{
            width: cardWidth as any,
            marginBottom: 20,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#E7D8CA',
        }}>
            {/* Image placeholder */}
            <SkeletonBox style={{ height: 230 }} />
            {/* Body */}
            <View style={{ padding: 18, gap: 10 }}>
                <SkeletonBox style={{ height: 12, width: '28%', borderRadius: 100 }} />
                <SkeletonBox style={{ height: 18, width: '72%' }} />
                <SkeletonBox style={{ height: 13, width: '88%' }} />
                <SkeletonBox style={{ height: 13, width: '62%' }} />
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <SkeletonBox style={{ height: 28, width: 72, borderRadius: 100 }} />
                    <SkeletonBox style={{ height: 28, width: 84, borderRadius: 100 }} />
                    <SkeletonBox style={{ height: 28, width: 64, borderRadius: 100 }} />
                </View>
                <SkeletonBox style={{ height: 48, borderRadius: 16, marginTop: 10 }} />
            </View>
        </View>
    );
}

export default function CategorySkeleton() {
    const { isCompact } = useCategoryLayout();

    return (
        <View style={{
            flexDirection: isCompact ? 'column' : 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 0,
        }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <CategoryCardSkeleton key={i} index={i} />
            ))}
        </View>
    );
}
