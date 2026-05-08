import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import CustomerSidebar from '@/components/Customer/CustomerSidebar';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getMyOrderById } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentSuccessScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useProtectedRoute();
    const router = useRouter();
    const { orderId, orderNumber, mode } = useLocalSearchParams<{ orderId?: string; orderNumber?: string; mode?: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth.isAuthorized) {
            return;
        }

        if (!orderId) {
            setLoading(false);
            setError('Missing order reference.');
            return;
        }

        (async () => {
            try {
                const { data } = await getMyOrderById(orderId);
                setOrder(data.order);
            } catch (err: any) {
                setError(err?.response?.data?.message ?? 'Could not load order.');
            } finally {
                setLoading(false);
            }
        })();
    }, [auth.isAuthorized, orderId]);

    if (auth.shouldBlock) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7EFE7]">
                <ActivityIndicator color={BROWN.DarkColor} size="large" />
            </View>
        );
    }

    const isVerified = order?.paymentStatus === 'paid' || mode === 'cod';

    return (
        <CustomerPageFrame
            scrollY={scrollY}
            onScroll={onScroll}
            eyebrow="Payment Result"
            title={isVerified ? 'Order confirmed' : 'Payment verification pending'}
            subtitle={
                loading
                    ? 'Loading order confirmation details.'
                    : error || !order
                        ? 'The order reference could not be resolved.'
                        : isVerified
                            ? 'Your order is in the fulfilment flow and ready to track.'
                            : 'The redirect succeeded, but server-side payment confirmation is still pending.'
            }
            sidebar={<CustomerSidebar />}
            heroAside={
                !loading && order ? (
                    <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Confirmation snapshot</Text>
                        <Text className="mt-3 font-heading text-[24px] text-white">{order.orderNumber || orderNumber}</Text>
                        <View className="gap-3 mt-5">
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Payment</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">{String(order.paymentStatus || '').replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Total</Text>
                                <Text className="font-body text-[13px] font-semibold text-white">${Number(order.total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                ) : undefined
            }
        >
            {loading ? (
                <CustomerSectionCard title="Loading confirmation" subtitle="Pulling the latest order record.">
                    <View className="items-center justify-center py-12 gap-3">
                        <ActivityIndicator color={BROWN.DarkColor} size="large" />
                        <Text style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>Loading order confirmation...</Text>
                    </View>
                </CustomerSectionCard>
            ) : error || !order ? (
                <CustomerSectionCard title="Order unavailable" subtitle="The order reference could not be loaded.">
                    <View className="items-center justify-center rounded-[24px] px-6 py-10" style={{ backgroundColor: '#F8EFE6' }}>
                        <Feather name="alert-circle" size={44} color={BROWN.DarkColor} />
                        <Text className="mt-4 text-center font-heading text-[24px]" style={{ color: BROWN.TextPrimary }}>{error || 'Order not found'}</Text>
                        <TouchableOpacity onPress={() => router.replace('/orders' as any)} className="mt-5 rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor }}>
                            <Text className="font-body text-[13px] font-semibold text-white">My orders</Text>
                        </TouchableOpacity>
                    </View>
                </CustomerSectionCard>
            ) : (
                <>
                    <CustomerSectionCard title="Confirmation status" subtitle="What the payment redirect means for this order right now.">
                        <View className="items-center rounded-[24px] px-6 py-8" style={{ backgroundColor: '#FFFAF5' }}>
                            <View className="h-[88px] w-[88px] items-center justify-center rounded-full" style={{ backgroundColor: isVerified ? 'rgba(76,175,80,0.12)' : 'rgba(66,153,225,0.12)' }}>
                                <Feather name={isVerified ? 'check-circle' : 'clock'} size={44} color={isVerified ? '#4CAF50' : '#4299E1'} />
                            </View>
                            <Text className="mt-5 font-heading text-[30px] text-center" style={{ color: BROWN.TextPrimary }}>{isVerified ? 'Order Confirmed' : 'Verification Pending'}</Text>
                            <Text className="mt-3 text-center font-body text-[14px] leading-7" style={{ color: BROWN.TextSecondary }}>
                                {isVerified
                                    ? 'Your order has been created successfully and is now in the fulfilment flow.'
                                    : 'PayHere redirected successfully. The system is still waiting for the secure server-side payment confirmation.'}
                            </Text>
                        </View>
                    </CustomerSectionCard>

                    <CustomerSectionCard title="Order summary" subtitle="The latest state of the order created from this payment flow.">
                        <View className="gap-3">
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Order</Text>
                                <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.orderNumber || orderNumber}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Order status</Text>
                                <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.status || '').replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Payment status</Text>
                                <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.paymentStatus || '').replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Total</Text>
                                <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>${Number(order.total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </CustomerSectionCard>

                    <View className="flex-row flex-wrap gap-3">
                        <TouchableOpacity onPress={() => router.replace(`/order-tracking?orderNumber=${order.orderNumber}` as any)} className="rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor }}>
                            <Text className="font-body text-[13px] font-semibold text-white">Track this order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.replace('/orders' as any)} className="rounded-full border px-5 py-3" style={{ borderColor: '#EAD7C3', backgroundColor: '#FFFFFF' }}>
                            <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.DarkColor }}>View all orders</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </CustomerPageFrame>
    );
}