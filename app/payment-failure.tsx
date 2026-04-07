import AuthContext from '@/context/AuthContext';
import { cancelPayHereOrder, getMyOrderById, initiatePayHerePayment } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const T = {
    bg: '#1A1209',
    card: '#2C1810',
    border: '#3D2415',
    active: '#C1622F',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    yellow: '#F5A623',
    yellowBg: 'rgba(245,166,35,0.12)',
    red: '#E53E3E',
};

export default function PaymentFailureScreen() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!auth?.userToken) {
            router.replace('/login' as any);
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
    }, [auth?.userToken, orderId]);

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

    if (loading) {
        return (
            <View style={[s.root, s.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={T.bg} />
                <ActivityIndicator color={T.active} size="large" />
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={T.bg} />
            <View style={s.card}>
                <View style={s.iconWrap}>
                    <Feather name="alert-triangle" size={44} color={T.yellow} />
                </View>
                <Text style={s.title}>Payment Not Completed</Text>
                <Text style={s.subtitle}>
                    {order?.paymentStatus === 'paid'
                        ? 'This order is already marked as paid. You can continue to order tracking.'
                        : 'The order was created, but PayHere did not complete the payment. You can retry or cancel the order now.'}
                </Text>

                {order ? (
                    <View style={s.metaCard}>
                        <View style={s.metaRow}>
                            <Text style={s.metaLabel}>Order</Text>
                            <Text style={s.metaValue}>{order.orderNumber}</Text>
                        </View>
                        <View style={s.metaRow}>
                            <Text style={s.metaLabel}>Order Status</Text>
                            <Text style={s.metaValue}>{String(order.status).replace(/_/g, ' ')}</Text>
                        </View>
                        <View style={s.metaRow}>
                            <Text style={s.metaLabel}>Payment Status</Text>
                            <Text style={s.metaValue}>{String(order.paymentStatus).replace(/_/g, ' ')}</Text>
                        </View>
                    </View>
                ) : null}

                {order?.paymentStatus === 'paid' ? (
                    <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace(`/order-tracking?orderNumber=${order.orderNumber}` as any)}>
                        <Text style={s.primaryBtnText}>Track Order</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={s.primaryBtn} onPress={retryPayment} disabled={busy}>
                            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Retry PayHere Payment</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={s.secondaryBtn} onPress={cancelOrder} disabled={busy}>
                            <Text style={s.secondaryBtnText}>Cancel Order</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={s.linkBtn} onPress={() => router.replace('/orders' as any)}>
                    <Text style={s.linkText}>Back to My Orders</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
    centered: { gap: 12 },
    card: { width: '100%', maxWidth: 520, backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 24, padding: 24, alignItems: 'center' },
    iconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: T.yellowBg, marginBottom: 18 },
    title: { color: T.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: T.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 18 },
    metaCard: { width: '100%', backgroundColor: '#241610', borderRadius: 16, padding: 16, gap: 12, marginBottom: 18 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    metaLabel: { color: T.muted, fontSize: 13 },
    metaValue: { color: T.text, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
    primaryBtn: { width: '100%', backgroundColor: T.active, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    secondaryBtn: { width: '100%', borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: T.red, marginBottom: 10 },
    secondaryBtnText: { color: T.red, fontSize: 15, fontWeight: '700' },
    linkBtn: { paddingVertical: 12 },
    linkText: { color: T.muted, fontSize: 13, fontWeight: '600' },
});