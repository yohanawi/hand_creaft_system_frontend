import CustomerPageFrame, { CustomerSectionCard } from '@/components/Customer/CustomerPageFrame';
import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { cancelPayHereOrder, getMyOrderById, initiatePayHerePayment } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentFailureScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const auth = useProtectedRoute();
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!auth.isAuthorized) {
            return;
        }

        if (!orderId) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const { data } = await getMyOrderById(orderId);
                setOrder(data.order);
            } catch {
                setOrder(null);
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

    const retryPayment = async () => {
        if (!order?._id) return;
        setBusy(true);
        try {
            const returnUrl = Linking.createURL('/payment-success', {
                queryParams: { orderId: order._id, orderNumber: order.orderNumber },
            });
            const cancelUrl = Linking.createURL('/payment-failure', {
                queryParams: { orderId: order._id, orderNumber: order.orderNumber },
            });

            const { data } = await initiatePayHerePayment({
                orderId: order._id,
                returnUrl,
                cancelUrl,
            });

            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.assign(data.checkoutUrl);
                return;
            }

            await WebBrowser.openBrowserAsync(data.checkoutUrl);
        } catch (err: any) {
            Alert.alert('Retry Failed', err?.response?.data?.message ?? 'Could not restart PayHere checkout.');
        } finally {
            setBusy(false);
        }
    };

    const cancelOrder = async () => {
        if (!order?._id) return;
        setBusy(true);
        try {
            await cancelPayHereOrder(order._id);
            router.replace('/orders' as any);
        } catch (err: any) {
            Alert.alert('Cancel Failed', err?.response?.data?.message ?? 'Could not cancel the order.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <CustomerPageFrame
            scrollY={scrollY}
            onScroll={onScroll}
            eyebrow="Payment Recovery"
            title={order?.paymentStatus === 'paid' ? 'Payment already confirmed' : 'Payment not completed'}
            subtitle={loading ? 'Loading the order tied to this payment attempt.' : 'Retry the secure payment flow or cancel the order if you no longer want to continue.'}
            heroAside={
                order ? (
                    <View className="rounded-[30px] border p-5" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="font-body text-[11px] uppercase tracking-[1.8px]" style={{ color: '#F1DAC5' }}>Recovery snapshot</Text>
                        <Text className="mt-3 font-heading text-[24px] text-white">{order.orderNumber}</Text>
                        <View className="gap-3 mt-5">
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Order status</Text>
                                <Text className="font-body text-[13px] font-semibold text-white capitalize">{String(order.status).replace(/_/g, ' ')}</Text>
                            </View>
                            <View className="flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                <Text className="font-body text-[13px]" style={{ color: '#F7E7D8' }}>Payment</Text>
                                <Text className="font-body text-[13px] font-semibold text-white capitalize">{String(order.paymentStatus).replace(/_/g, ' ')}</Text>
                            </View>
                        </View>
                    </View>
                ) : undefined
            }
        >
            {loading ? (
                <CustomerSectionCard title="Loading recovery state" subtitle="Retrieving the order tied to this PayHere attempt.">
                    <View className="items-center justify-center py-12 gap-3">
                        <ActivityIndicator color={BROWN.DarkColor} size="large" />
                        <Text style={{ fontFamily: BRAND_FONTS.body, color: BROWN.TextSecondary }}>Loading payment state...</Text>
                    </View>
                </CustomerSectionCard>
            ) : (
                <>
                    <CustomerSectionCard title="Payment outcome" subtitle="What happened to this order and what you can do next.">
                        <View className="items-center rounded-[24px] px-6 py-8" style={{ backgroundColor: '#FFFAF5' }}>
                            <View className="h-[88px] w-[88px] items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.12)' }}>
                                <Feather name="alert-triangle" size={44} color="#F5A623" />
                            </View>
                            <Text className="mt-5 font-heading text-[30px] text-center" style={{ color: BROWN.TextPrimary }}>{order?.paymentStatus === 'paid' ? 'Already paid' : 'Payment not completed'}</Text>
                            <Text className="mt-3 text-center font-body text-[14px] leading-7" style={{ color: BROWN.TextSecondary }}>
                                {order?.paymentStatus === 'paid'
                                    ? 'This order is already marked as paid. You can continue to order tracking.'
                                    : 'The order was created, but PayHere did not complete the payment. You can retry or cancel the order now.'}
                            </Text>
                        </View>
                    </CustomerSectionCard>

                    {order ? (
                        <CustomerSectionCard title="Order summary" subtitle="The current state of the order connected to this payment flow.">
                            <View className="gap-3">
                                <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Order</Text>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.TextPrimary }}>{order.orderNumber}</Text>
                                </View>
                                <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Order status</Text>
                                    <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.status).replace(/_/g, ' ')}</Text>
                                </View>
                                <View className="flex-row items-center justify-between rounded-[18px] px-4 py-4" style={{ backgroundColor: '#F6ECDF' }}>
                                    <Text className="font-body text-[13px]" style={{ color: BROWN.TextSecondary }}>Payment status</Text>
                                    <Text className="font-body text-[13px] font-semibold capitalize" style={{ color: BROWN.TextPrimary }}>{String(order.paymentStatus).replace(/_/g, ' ')}</Text>
                                </View>
                            </View>
                        </CustomerSectionCard>
                    ) : null}

                    <View className="flex-row flex-wrap gap-3">
                        {order?.paymentStatus === 'paid' ? (
                            <TouchableOpacity onPress={() => router.replace(`/order-tracking?orderNumber=${order.orderNumber}` as any)} className="rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor }}>
                                <Text className="font-body text-[13px] font-semibold text-white">Track order</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity onPress={retryPayment} disabled={busy} className="rounded-full px-5 py-3" style={{ backgroundColor: BROWN.DarkColor, opacity: busy ? 0.7 : 1 }}>
                                    {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-body text-[13px] font-semibold text-white">Retry PayHere payment</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={cancelOrder} disabled={busy} className="rounded-full border px-5 py-3" style={{ borderColor: '#DC2626', backgroundColor: '#FFFFFF', opacity: busy ? 0.7 : 1 }}>
                                    <Text className="font-body text-[13px] font-semibold" style={{ color: '#DC2626' }}>Cancel order</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity onPress={() => router.replace('/orders' as any)} className="rounded-full border px-5 py-3" style={{ borderColor: '#EAD7C3', backgroundColor: '#FFFFFF' }}>
                            <Text className="font-body text-[13px] font-semibold" style={{ color: BROWN.DarkColor }}>Back to orders</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </CustomerPageFrame>
    );
}