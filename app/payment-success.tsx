import AuthContext from '@/context/AuthContext';
import { getMyOrderById } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const T = {
    bg: '#1A1209',
    card: '#2C1810',
    border: '#3D2415',
    active: '#C1622F',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    green: '#4CAF50',
    greenBg: 'rgba(76,175,80,0.12)',
    blue: '#4299E1',
    blueBg: 'rgba(66,153,225,0.12)',
};

export default function PaymentSuccessScreen() {
    const auth = useContext(AuthContext);
    const router = useRouter();
    const { orderId, orderNumber, mode } = useLocalSearchParams<{ orderId?: string; orderNumber?: string; mode?: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth?.userToken) {
            router.replace('/login' as any);
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
    }, [auth?.userToken, orderId]);

    if (loading) {
        return (
            <View style={[s.root, s.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={T.bg} />
                <ActivityIndicator color={T.active} size="large" />
                <Text style={s.muted}>Loading order confirmation…</Text>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={[s.root, s.centered]}>
                <StatusBar barStyle="light-content" backgroundColor={T.bg} />
                <Feather name="alert-circle" size={56} color={T.active} />
                <Text style={s.title}>{error || 'Order not found'}</Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/orders' as any)}>
                    <Text style={s.primaryBtnText}>My Orders</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isVerified = order.paymentStatus === 'paid' || mode === 'cod';

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={T.bg} />
            <View style={s.card}>
                <View style={[s.iconWrap, { backgroundColor: isVerified ? T.greenBg : T.blueBg }]}>
                    <Feather name={isVerified ? 'check-circle' : 'clock'} size={44} color={isVerified ? T.green : T.blue} />
                </View>
                <Text style={s.title}>{isVerified ? 'Order Confirmed' : 'Payment Verification Pending'}</Text>
                <Text style={s.subtitle}>
                    {isVerified
                        ? 'Your order has been created successfully and is now in the fulfillment flow.'
                        : 'PayHere redirected successfully. The system is still waiting for the secure server-side payment confirmation.'}
                </Text>

                <View style={s.metaCard}>
                    <View style={s.metaRow}>
                        <Text style={s.metaLabel}>Order</Text>
                        <Text style={s.metaValue}>{order.orderNumber || orderNumber}</Text>
                    </View>
                    <View style={s.metaRow}>
                        <Text style={s.metaLabel}>Order Status</Text>
                        <Text style={s.metaValue}>{String(order.status || '').replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={s.metaRow}>
                        <Text style={s.metaLabel}>Payment Status</Text>
                        <Text style={s.metaValue}>{String(order.paymentStatus || '').replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={s.metaRow}>
                        <Text style={s.metaLabel}>Total</Text>
                        <Text style={s.metaValue}>${Number(order.total || 0).toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={() => router.replace(`/order-tracking?orderNumber=${order.orderNumber}` as any)}
                    activeOpacity={0.85}
                >
                    <Text style={s.primaryBtnText}>Track This Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.secondaryBtn}
                    onPress={() => router.replace('/orders' as any)}
                    activeOpacity={0.85}
                >
                    <Text style={s.secondaryBtnText}>View All Orders</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
    centered: { gap: 14 },
    card: {
        width: '100%',
        maxWidth: 520,
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.border,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    iconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    title: { color: T.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: T.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 18 },
    metaCard: { width: '100%', backgroundColor: '#241610', borderRadius: 16, padding: 16, gap: 12, marginBottom: 18 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    metaLabel: { color: T.muted, fontSize: 13 },
    metaValue: { color: T.text, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
    primaryBtn: { width: '100%', backgroundColor: T.active, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    secondaryBtn: { width: '100%', borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: T.border },
    secondaryBtnText: { color: T.text, fontSize: 15, fontWeight: '700' },
    muted: { color: T.muted, fontSize: 14 },
});