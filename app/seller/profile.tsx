import { sellerTheme as T } from '@/constants/sellerTheme';
import { useAuth } from '@/context/AuthContext';
import { getSellerProfile, updateSellerProfile } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD'];

function Field({ label, value, onChange, placeholder, multiline }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 90, textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder ?? label}
                placeholderTextColor={T.muted}
                multiline={multiline}
            />
        </View>
    );
}

export default function SellerProfileScreen() {
    const auth = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<any>({
        name: '',
        phone: '',
        shopName: '',
        bio: '',
        logo: '',
        banner: '',
        contactEmail: '',
        contactPhone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        instagramHandle: '',
        facebookUrl: '',
        materials: '',
        processingTimeLabel: '',
        shippingPolicy: '',
        returnPolicy: '',
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        payoutEmail: '',
        defaultCurrency: 'USD',
    });

    const load = useCallback(async () => {
        try {
            const res = await getSellerProfile();
            const seller = res.data?.seller ?? {};
            const profile = seller.sellerProfile ?? {};
            setForm({
                name: seller.name ?? '',
                phone: seller.phone ?? '',
                shopName: profile.shopName ?? '',
                bio: profile.bio ?? '',
                logo: profile.logo ?? '',
                banner: profile.banner ?? '',
                contactEmail: profile.contactEmail ?? '',
                contactPhone: profile.contactPhone ?? '',
                addressLine1: profile.addressLine1 ?? '',
                addressLine2: profile.addressLine2 ?? '',
                city: profile.city ?? '',
                state: profile.state ?? '',
                postalCode: profile.postalCode ?? '',
                country: profile.country ?? 'US',
                instagramHandle: profile.instagramHandle ?? '',
                facebookUrl: profile.facebookUrl ?? '',
                materials: Array.isArray(profile.materials) ? profile.materials.join(', ') : '',
                processingTimeLabel: profile.processingTimeLabel ?? '',
                shippingPolicy: profile.shippingPolicy ?? '',
                returnPolicy: profile.returnPolicy ?? '',
                bankName: profile.bankName ?? '',
                accountHolderName: profile.accountHolderName ?? '',
                accountNumber: '',
                routingNumber: '',
                payoutEmail: profile.payoutEmail ?? '',
                defaultCurrency: profile.defaultCurrency ?? 'USD',
            });
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load seller profile');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        load();
    }, [load]));

    const handleSave = async () => {
        if (!form.shopName.trim()) {
            Alert.alert('Validation', 'Shop name is required.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                phone: form.phone.trim(),
                shopName: form.shopName.trim(),
                bio: form.bio,
                logo: form.logo,
                banner: form.banner,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country,
                instagramHandle: form.instagramHandle,
                facebookUrl: form.facebookUrl,
                materials: form.materials,
                processingTimeLabel: form.processingTimeLabel,
                shippingPolicy: form.shippingPolicy,
                returnPolicy: form.returnPolicy,
                bankName: form.bankName,
                accountHolderName: form.accountHolderName,
                accountNumber: form.accountNumber,
                routingNumber: form.routingNumber,
                payoutEmail: form.payoutEmail,
                defaultCurrency: form.defaultCurrency,
            };
            const res = await updateSellerProfile(payload);
            auth.updateUser({
                name: res.data?.seller?.name || form.name.trim(),
                phone: res.data?.seller?.phone || form.phone.trim(),
                sellerProfile: {
                    ...(auth.user?.sellerProfile || {}),
                    shopName: form.shopName.trim(),
                    bio: form.bio,
                    logo: form.logo,
                    banner: form.banner,
                    contactEmail: form.contactEmail,
                    contactPhone: form.contactPhone,
                    city: form.city,
                    state: form.state,
                    country: form.country,
                    processingTimeLabel: form.processingTimeLabel,
                    shippingPolicy: form.shippingPolicy,
                    returnPolicy: form.returnPolicy,
                    payoutEmail: form.payoutEmail,
                    defaultCurrency: form.defaultCurrency,
                    materials: form.materials.split(',').map((item: string) => item.trim()).filter(Boolean),
                },
            });
            Alert.alert('Success', 'Seller profile updated successfully.');
            load();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update seller profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={T.active} />
                <Text style={s.muted}>Loading seller profile…</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={T.active} />}>
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Seller Profile</Text>
                    <Text style={s.subtitle}>Keep your shop story, policies, and payout details up to date.</Text>
                </View>
                <TouchableOpacity style={s.saveBtnTop} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color={T.white} /> : <Text style={s.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Shop Identity</Text>
                <Field label="Account Name" value={form.name} onChange={(value: string) => setForm((current: any) => ({ ...current, name: value }))} />
                <Field label="Account Phone" value={form.phone} onChange={(value: string) => setForm((current: any) => ({ ...current, phone: value }))} />
                <Field label="Shop Name" value={form.shopName} onChange={(value: string) => setForm((current: any) => ({ ...current, shopName: value }))} />
                <Field label="Shop Bio" value={form.bio} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, bio: value }))} />
                <Field label="Logo URL or upload path" value={form.logo} onChange={(value: string) => setForm((current: any) => ({ ...current, logo: value }))} />
                <Field label="Banner URL or upload path" value={form.banner} onChange={(value: string) => setForm((current: any) => ({ ...current, banner: value }))} />
                <Field label="Instagram Handle" value={form.instagramHandle} onChange={(value: string) => setForm((current: any) => ({ ...current, instagramHandle: value }))} />
                <Field label="Facebook URL" value={form.facebookUrl} onChange={(value: string) => setForm((current: any) => ({ ...current, facebookUrl: value }))} />
                <Field label="Primary Materials" value={form.materials} placeholder="Silver, gold-plated brass, freshwater pearls" onChange={(value: string) => setForm((current: any) => ({ ...current, materials: value }))} />
                <Field label="Processing Time Label" value={form.processingTimeLabel} placeholder="Ready to ship in 2-3 business days" onChange={(value: string) => setForm((current: any) => ({ ...current, processingTimeLabel: value }))} />
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Contact & Address</Text>
                <Field label="Contact Email" value={form.contactEmail} onChange={(value: string) => setForm((current: any) => ({ ...current, contactEmail: value }))} />
                <Field label="Contact Phone" value={form.contactPhone} onChange={(value: string) => setForm((current: any) => ({ ...current, contactPhone: value }))} />
                <Field label="Address Line 1" value={form.addressLine1} onChange={(value: string) => setForm((current: any) => ({ ...current, addressLine1: value }))} />
                <Field label="Address Line 2" value={form.addressLine2} onChange={(value: string) => setForm((current: any) => ({ ...current, addressLine2: value }))} />
                <Field label="City" value={form.city} onChange={(value: string) => setForm((current: any) => ({ ...current, city: value }))} />
                <Field label="State" value={form.state} onChange={(value: string) => setForm((current: any) => ({ ...current, state: value }))} />
                <Field label="Postal Code" value={form.postalCode} onChange={(value: string) => setForm((current: any) => ({ ...current, postalCode: value }))} />
                <Field label="Country" value={form.country} onChange={(value: string) => setForm((current: any) => ({ ...current, country: value }))} />
            </View>

            <View style={s.panel}>
                <Text style={s.panelTitle}>Policies & Payouts</Text>
                <Text style={s.fieldLabel}>Default Currency</Text>
                <View style={s.currencyRow}>
                    {CURRENCIES.map((currency) => (
                        <TouchableOpacity
                            key={currency}
                            style={[s.currencyChip, form.defaultCurrency === currency && s.currencyChipActive]}
                            onPress={() => setForm((current: any) => ({ ...current, defaultCurrency: currency }))}
                        >
                            <Text style={[s.currencyChipText, form.defaultCurrency === currency && s.currencyChipTextActive]}>{currency}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Field label="Shipping Policy" value={form.shippingPolicy} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, shippingPolicy: value }))} />
                <Field label="Return Policy" value={form.returnPolicy} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, returnPolicy: value }))} />
                <Field label="Bank Name" value={form.bankName} onChange={(value: string) => setForm((current: any) => ({ ...current, bankName: value }))} />
                <Field label="Account Holder Name" value={form.accountHolderName} onChange={(value: string) => setForm((current: any) => ({ ...current, accountHolderName: value }))} />
                <Field label="Account Number" value={form.accountNumber} onChange={(value: string) => setForm((current: any) => ({ ...current, accountNumber: value }))} placeholder="Only re-enter when changing" />
                <Field label="Routing Number" value={form.routingNumber} onChange={(value: string) => setForm((current: any) => ({ ...current, routingNumber: value }))} placeholder="Only re-enter when changing" />
                <Field label="Payout Email" value={form.payoutEmail} onChange={(value: string) => setForm((current: any) => ({ ...current, payoutEmail: value }))} />
            </View>
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
    subtitle: { color: T.muted, marginTop: 4, maxWidth: 560 },
    saveBtnTop: { backgroundColor: T.active, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minWidth: 140, alignItems: 'center' },
    saveBtnText: { color: T.white, fontWeight: '700' },
    panel: { backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 18, padding: 20 },
    panelTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
    field: { paddingTop: 14 },
    fieldLabel: { color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
    input: { backgroundColor: T.input, borderWidth: 1, borderColor: T.inputBorder, color: T.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
    currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    currencyChip: { borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.surface, paddingHorizontal: 12, paddingVertical: 10 },
    currencyChipActive: { borderColor: T.active, backgroundColor: T.activeBg },
    currencyChipText: { color: T.muted, fontWeight: '700', fontSize: 12 },
    currencyChipTextActive: { color: T.active },
});