import { sellerTheme as T } from '@/constants/sellerTheme';
import { getSellerPayoutOverview, requestSellerPayout } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function StatCard({ label, value, icon, color, sub }: any) {
    return (
        <View style={[s.statCard, { borderTopColor: color }]}>
            <View style={[s.iconWrap, { backgroundColor: color + '22' }]}>
                <Feather name={icon} size={18} color={color} />
            </View>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
            {sub ? <Text style={s.statSub}>{sub}</Text> : null}
        </View>
    );
}

export default function SellerPayoutsScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await getSellerPayoutOverview();
            setData(res.data);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load payouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const requestPayout = async () => {
        setSubmitting(true);
        try {
            await requestSellerPayout({ note: note.trim() || undefined });
            Alert.alert('Success', 'Payout request submitted successfully.');
            setModalVisible(false);
            setNote('');
            load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to request payout');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading payouts…</Text>
            </View>
        );
    }

    const summary = data?.summary ?? {};
    const payouts = data?.payouts ?? [];
    const bankDetailsComplete = Boolean(data?.bankDetailsComplete);

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}
        >
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Payouts</Text>
                    <Text style={s.subtitle}>Track balances and request manual settlements for delivered orders.</Text>
                </View>
                <TouchableOpacity style={[s.requestBtn, !bankDetailsComplete && s.requestBtnDisabled]} onPress={() => bankDetailsComplete && setModalVisible(true)} activeOpacity={0.85}>
                    <Feather name="send" size={16} color={T.white} />
                    <Text style={s.requestBtnText}>Request Payout</Text>
                </TouchableOpacity>
            </View>

            {!bankDetailsComplete ? (
                <View style={s.noticeCard}>
                    <Feather name="alert-circle" size={16} color={T.yellow} />
                    <Text style={s.noticeText}>Complete your bank name, account holder, account number, and routing number in Seller Profile before requesting a payout.</Text>
                </View>
            ) : null}

            <View style={s.statsGrid}>
                <StatCard label="Gross Sales" value={`$${Number(summary.grossSales || 0).toFixed(2)}`} icon="bar-chart-2" color={T.blue} />
                <StatCard label="Available" value={`$${Number(summary.availableBalance || 0).toFixed(2)}`} icon="wallet" color={T.green} sub="Eligible for request" />
                <StatCard label="Requested" value={`$${Number(summary.requestedBalance || 0).toFixed(2)}`} icon="clock" color={T.yellow} sub="Awaiting manual payout" />
                <StatCard label="Paid Out" value={`$${Number(summary.paidOutBalance || 0).toFixed(2)}`} icon="check-circle" color={T.active} sub="Settled to seller" />
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Recent Requests</Text>
                {payouts.length === 0 ? (
                    <Text style={s.empty}>No payout requests yet.</Text>
                ) : payouts.map((payout: any) => (
                    <View key={payout._id} style={s.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowTitle}>${Number(payout.amount || 0).toFixed(2)}</Text>
                            <Text style={s.rowSub}>{new Date(payout.requestedAt || payout.createdAt).toLocaleString()}</Text>
                            {payout.note ? <Text style={s.rowSub}>{payout.note}</Text> : null}
                        </View>
                        <View style={[s.badge, { backgroundColor: payout.status === 'paid' ? T.green + '22' : payout.status === 'rejected' ? T.red + '22' : T.activeBg }]}>
                            <Text style={[s.badgeText, { color: payout.status === 'paid' ? T.green : payout.status === 'rejected' ? T.red : T.active }]}>{payout.status}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={s.overlay}>
                    <View style={s.modalCard}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Request Payout</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={20} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <Text style={s.modalIntro}>Available balance: ${Number(summary.availableBalance || 0).toFixed(2)}</Text>
                        <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} value={note} onChangeText={setNote} placeholder="Add a note for your payout request (optional)" placeholderTextColor={T.muted} multiline />
                        <TouchableOpacity style={[s.submitBtn, (!bankDetailsComplete || submitting) && s.requestBtnDisabled]} onPress={requestPayout} disabled={!bankDetailsComplete || submitting}>
                            {submitting ? <ActivityIndicator color={T.white} /> : <Text style={s.submitText}>Submit Request</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    content: { padding: 24, gap: 16 },
    center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
    muted: { color: T.muted },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
    title: { color: T.text, fontSize: 26, fontWeight: '700' },
    subtitle: { color: T.muted, marginTop: 4, maxWidth: 540 },
    requestBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.active, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    requestBtnDisabled: { opacity: 0.55 },
    requestBtnText: { color: T.white, fontWeight: '700' },
    noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: T.card2, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, padding: 14 },
    noticeText: { color: T.text, fontSize: 12, lineHeight: 18, flex: 1 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 170, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderTopWidth: 3, borderRadius: 14, padding: 16 },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { color: T.text, fontSize: 24, fontWeight: '700' },
    statLabel: { color: T.muted, marginTop: 4, fontSize: 12 },
    statSub: { color: T.muted, marginTop: 6, fontSize: 11 },
    panel: { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 16, padding: 16 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    rowTitle: { color: T.text, fontSize: 14, fontWeight: '700' },
    rowSub: { color: T.muted, fontSize: 12, marginTop: 4 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    empty: { color: T.muted, fontSize: 13, paddingVertical: 12 },
    overlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalCard: { width: '100%', maxWidth: 460, backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 18, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalIntro: { color: T.muted, marginBottom: 12 },
    input: { backgroundColor: T.input, borderWidth: 1, borderColor: T.cardBorder, color: T.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
    submitBtn: { backgroundColor: T.active, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    submitText: { color: T.white, fontWeight: '700' },
});