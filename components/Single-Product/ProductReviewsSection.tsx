import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { StarPicker, StarRow } from '@/components/Single-Product/RatingStars';
import { PRODUCT_PAGE_COLORS, PRODUCT_PAGE_FONTS } from '@/components/Single-Product/theme';
import { Review } from '@/components/Single-Product/types';

type Props = {
    reviewsLoading: boolean;
    reviews: Review[];
    userId?: string;
    userToken?: string | null;
    averageRating: number;
    reviewCount: number;
    reviewRating: number;
    onChangeReviewRating: (value: number) => void;
    reviewComment: string;
    onChangeReviewComment: (value: string) => void;
    submittingReview: boolean;
    reviewError: string | null;
    onSubmitReview: () => void;
    deletingReviewId: string | null;
    onDeleteReview: (reviewId: string) => void;
    onNavigateToLogin: () => void;
};

export default function ProductReviewsSection({
    reviewsLoading,
    reviews,
    userId,
    userToken,
    averageRating,
    reviewCount,
    reviewRating,
    onChangeReviewRating,
    reviewComment,
    onChangeReviewComment,
    submittingReview,
    reviewError,
    onSubmitReview,
    deletingReviewId,
    onDeleteReview,
    onNavigateToLogin,
}: Props) {
    if (reviewsLoading) {
        return <ActivityIndicator color={PRODUCT_PAGE_COLORS.accent} style={{ marginVertical: 32 }} />;
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                <View style={{ flex: 1, minWidth: 180, borderRadius: 20, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, padding: 18, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                        Community rating
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 30, marginTop: 4 }}>
                        {averageRating.toFixed(1)} / 5
                    </Text>
                    <View style={{ marginTop: 8 }}>
                        <StarRow rating={averageRating} size={16} />
                    </View>
                </View>
                <View style={{ flex: 1, minWidth: 180, borderRadius: 20, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, padding: 18, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1 }}>
                        Review volume
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 30, marginTop: 4 }}>
                        {reviewCount}
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 6 }}>
                        Verified shopper feedback for this product page.
                    </Text>
                </View>
            </View>

            {reviews.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 32, borderRadius: 24, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                    <Feather name="message-square" size={48} color="#D1D5DB" />
                    <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, marginTop: 12, fontSize: 15 }}>
                        No reviews yet. Be the first to leave a thoughtful note.
                    </Text>
                </View>
            ) : null}

            {reviews.map((review) => {
                const reviewerName = typeof review.user === 'object' ? review.user.name : 'Customer';
                const isOwnReview = typeof review.user === 'object' && review.user._id === userId;

                return (
                    <View key={review._id} style={{ borderRadius: 22, backgroundColor: PRODUCT_PAGE_COLORS.white, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line, padding: 18, marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E6D8', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700' }}>
                                        {reviewerName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700', fontSize: 15 }}>
                                        {reviewerName}
                                    </Text>
                                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 12, marginTop: 2 }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <StarRow rating={review.rating} size={15} />
                                {isOwnReview ? (
                                    <TouchableOpacity onPress={() => onDeleteReview(review._id)} disabled={deletingReviewId === review._id}>
                                        {deletingReviewId === review._id
                                            ? <ActivityIndicator size="small" color={PRODUCT_PAGE_COLORS.danger} />
                                            : <Feather name="trash-2" size={16} color={PRODUCT_PAGE_COLORS.danger} />}
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        {review.comment ? (
                            <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 14, lineHeight: 22, marginTop: 12 }}>
                                {review.comment}
                            </Text>
                        ) : null}
                    </View>
                );
            })}

            {userToken ? (
                <View style={{ marginTop: 24, borderRadius: 24, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line, padding: 20 }}>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.ink, fontFamily: PRODUCT_PAGE_FONTS.heading, fontSize: 28 }}>
                        Write a Review
                    </Text>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.muted, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 6, marginBottom: 12 }}>
                        Share craftsmanship, fit, finish, and delivery expectations for the next customer.
                    </Text>
                    <StarPicker value={reviewRating} onChange={onChangeReviewRating} />
                    <TextInput
                        value={reviewComment}
                        onChangeText={onChangeReviewComment}
                        placeholder="Tell shoppers what stood out about this piece..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        style={{
                            marginTop: 14,
                            backgroundColor: PRODUCT_PAGE_COLORS.white,
                            borderWidth: 1,
                            borderColor: PRODUCT_PAGE_COLORS.line,
                            borderRadius: 18,
                            padding: 14,
                            fontSize: 14,
                            color: PRODUCT_PAGE_COLORS.ink,
                            fontFamily: PRODUCT_PAGE_FONTS.body,
                            textAlignVertical: 'top',
                            minHeight: 120,
                        }}
                    />
                    {reviewError ? (
                        <Text style={{ color: PRODUCT_PAGE_COLORS.danger, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 13, marginTop: 10 }}>
                            {reviewError}
                        </Text>
                    ) : null}
                    <TouchableOpacity onPress={onSubmitReview} disabled={submittingReview} style={{ marginTop: 14 }}>
                        <View style={{
                            borderRadius: 18,
                            paddingVertical: 14,
                            alignItems: 'center',
                            backgroundColor: PRODUCT_PAGE_COLORS.accentDeep,
                        }}>
                            {submittingReview
                                ? <ActivityIndicator color={PRODUCT_PAGE_COLORS.white} size="small" />
                                : <Text style={{ color: PRODUCT_PAGE_COLORS.white, fontFamily: PRODUCT_PAGE_FONTS.body, fontWeight: '700' }}>Submit Review</Text>}
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ marginTop: 20, padding: 18, backgroundColor: PRODUCT_PAGE_COLORS.surfaceMuted, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: PRODUCT_PAGE_COLORS.line }}>
                    <Text style={{ color: PRODUCT_PAGE_COLORS.text, fontFamily: PRODUCT_PAGE_FONTS.body, fontSize: 14 }}>
                        <Text style={{ color: PRODUCT_PAGE_COLORS.accentDeep, fontWeight: '700' }} onPress={onNavigateToLogin}>
                            Sign in
                        </Text>
                        {' '}to leave a review.
                    </Text>
                </View>
            )}
        </View>
    );
}