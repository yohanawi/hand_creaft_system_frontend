import { adminTheme as T } from '@/constants/adminTheme';
import { useAuth } from '@/context/AuthContext';
import { deleteAdminUser, getAdminUsers, updateAdminUser } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function Field({ label, value, onChange, secureTextEntry }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={s.input}
                value={value} onChangeText={onChange}
                placeholder={label} placeholderTextColor={T.muted}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
            />
        </View>
    );
}

export default function AdminUsers() {
    const auth = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [modal, setModal] = useState<'edit' | null>(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async (q = '', role = '') => {
        setLoading(true);
        try {
            const res = await getAdminUsers({ search: q || undefined, role: role || undefined });
            const d = res.data;
            setUsers(d.users ?? []);
            setTotal(d.total ?? 0);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadData('', ''); }, [loadData]));

    const handleSearch = (q: string) => {
        setSearch(q);
        loadData(q, roleFilter);
    };

    const handleRoleFilter = (role: string) => {
        setRoleFilter(role);
        loadData(search, role);
    };

    const openEdit = (user: any) => {
        setForm({ name: user.name ?? '', email: user.email ?? '', role: user.role ?? 'user', password: '' });
        setEditId(user._id);
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Name is required');
        if (!form.email.trim()) return Alert.alert('Validation', 'Email is required');
        setSaving(true);
        try {
            const payload: any = { name: form.name.trim(), email: form.email.trim(), role: form.role };
            if (form.password.trim()) payload.password = form.password.trim();
            await updateAdminUser(editId!, payload);
            Alert.alert('Success', 'User updated');
            setModal(null);
            loadData(search, roleFilter);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Update failed');
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string, name: string) => {
        if (id === auth?.user?.id) return Alert.alert('Error', 'Cannot delete your own account');
        Alert.alert('Delete User', `Delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deleteAdminUser(id); loadData(search, roleFilter); }
                    catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Delete failed'); }
                }
            },
        ]);
    };

    const getInitials = (name: string) =>
        name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <View style={s.root}>
            <View style={s.pageHeader}>
                <View>
                    <Text style={s.pageTitle}>Users</Text>
                    <Text style={s.pageSub}>{total} total users</Text>
                </View>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput style={s.searchInput} placeholder="Search by name or email…"
                    placeholderTextColor={T.muted} value={search} onChangeText={handleSearch} />
                {search ? <TouchableOpacity onPress={() => handleSearch('')}><Feather name="x" size={16} color={T.muted} /></TouchableOpacity> : null}
            </View>

            {/* Role filter */}
            <View style={s.filterRow}>
                {[
                    { label: 'All', value: '' },
                    { label: 'Users', value: 'user' },
                    { label: 'Sellers', value: 'seller' },
                    { label: 'Admins', value: 'admin' },
                ].map(opt => (
                    <TouchableOpacity key={opt.value}
                        style={[s.filterChip, roleFilter === opt.value && s.filterChipActive]}
                        onPress={() => handleRoleFilter(opt.value)}>
                        <Text style={[s.filterChipText, roleFilter === opt.value && s.filterChipTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    ListEmptyComponent={<Text style={s.empty}>No users found</Text>}
                    renderItem={({ item }) => {
                        const isSelf = item._id === auth?.user?.id;
                        return (
                            <View style={s.userCard}>
                                <View style={[s.avatar, { backgroundColor: item.role === 'admin' ? T.active : T.blue }]}>
                                    <Text style={s.avatarText}>{getInitials(item.name)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={s.userName}>{item.name}</Text>
                                        {isSelf && (
                                            <View style={s.selfBadge}>
                                                <Text style={s.selfText}>You</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={s.userEmail}>{item.email}</Text>
                                    <View style={[s.badge,
                                    { backgroundColor: item.role === 'admin' ? T.active + '33' : T.blue + '22', alignSelf: 'flex-start', marginTop: 3 }]}>
                                        <Text style={[s.badgeText, { color: item.role === 'admin' ? T.active : T.blue }]}>
                                            {item.role}
                                        </Text>
                                    </View>
                                </View>
                                <View style={s.cardActions}>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                                        <Feather name="edit-2" size={15} color={T.active} />
                                    </TouchableOpacity>
                                    {!isSelf && (
                                        <TouchableOpacity style={[s.iconBtn, { borderColor: T.red + '44' }]}
                                            onPress={() => handleDelete(item._id, item.name)}>
                                            <Feather name="trash-2" size={15} color={T.red} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            {/* Edit Modal */}
            <Modal visible={modal !== null} animationType="slide" transparent>
                <View style={s.overlay}>
                    <View style={s.modalBox}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Edit User</Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Field label="Name *" value={form.name}
                                onChange={(v: string) => setForm(f => ({ ...f, name: v }))} />
                            <Field label="Email *" value={form.email}
                                onChange={(v: string) => setForm(f => ({ ...f, email: v }))} />
                            <Field label="New Password (leave blank to keep)" value={form.password}
                                onChange={(v: string) => setForm(f => ({ ...f, password: v }))}
                                secureTextEntry />

                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Role</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[
                                        { label: 'User', value: 'user' },
                                        { label: 'Seller', value: 'seller' },
                                        { label: 'Admin', value: 'admin' },
                                    ].map(opt => (
                                        <TouchableOpacity key={opt.value}
                                            style={[s.selectOpt, form.role === opt.value && s.selectOptActive]}
                                            onPress={() => setForm(f => ({ ...f, role: opt.value }))}>
                                            <Text style={[s.selectOptText, form.role === opt.value && s.selectOptTextActive]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={s.modalFooter}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(null)}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator color={T.white} size="small" />
                                    : <Text style={s.saveText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { color: T.muted, textAlign: 'center', marginTop: 40 },
    pageHeader: {
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16,
    },
    pageTitle: { color: T.text, fontSize: 22, fontWeight: '700' },
    pageSub: { color: T.muted, fontSize: 12, marginTop: 2 },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: T.card, borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    searchInput: { flex: 1, color: T.text, fontSize: 14 },
    filterRow: {
        flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12,
    },
    filterChip: {
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
        borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card,
    },
    filterChipActive: { backgroundColor: T.active + '33', borderColor: T.active },
    filterChipText: { color: T.muted, fontSize: 12 },
    filterChipTextActive: { color: T.active, fontWeight: '600' },
    userCard: {
        backgroundColor: T.card, borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: T.white, fontSize: 16, fontWeight: '700' },
    userName: { color: T.text, fontSize: 14, fontWeight: '600' },
    userEmail: { color: T.muted, fontSize: 12, marginTop: 1 },
    selfBadge: { backgroundColor: T.green + '33', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    selfText: { color: T.green, fontSize: 10, fontWeight: '600' },
    badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    cardActions: { gap: 8 },
    iconBtn: {
        width: 34, height: 34, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: T.active + '1A', borderWidth: 1, borderColor: T.active + '44',
    },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalBox: {
        backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '80%', paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.cardBorder,
    },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalFooter: {
        flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: T.cardBorder,
    },
    cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 13, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center' },
    cancelText: { color: T.muted, fontSize: 15, fontWeight: '600' },
    saveBtn: { flex: 2, borderRadius: 10, paddingVertical: 13, backgroundColor: T.active, alignItems: 'center' },
    saveText: { color: T.white, fontSize: 15, fontWeight: '700' },
    field: { paddingHorizontal: 20, paddingBottom: 14 },
    fieldLabel: { color: T.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 6 },
    input: {
        backgroundColor: T.input, borderRadius: 10, borderWidth: 1, borderColor: T.inputBorder,
        color: T.text, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10,
    },
    selectOpt: {
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
        borderWidth: 1, borderColor: T.inputBorder, backgroundColor: T.input,
    },
    selectOptActive: { backgroundColor: T.active + '33', borderColor: T.active },
    selectOptText: { color: T.muted, fontSize: 13 },
    selectOptTextActive: { color: T.active, fontWeight: '600' },
});
