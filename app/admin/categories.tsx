import { createCategory, deleteCategory, getCategories, updateCategory } from '@/services/api';
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

const T = {
    bg: '#1E150C', card: '#2C1810', cardBorder: '#3D2415',
    text: '#F5EDE0', muted: '#8C7B6E', active: '#C1622F',
    green: '#38A169', red: '#E53E3E', input: '#241610',
    inputBorder: '#4A2515', white: '#FFFFFF',
};

const EMPTY_FORM = { name: '', description: '', status: 'active', isFeatured: false, parent: '' };

function Field({ label, value, onChange, multiline }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 70, textAlignVertical: 'top' }]}
                value={value} onChangeText={onChange}
                placeholder={label} placeholderTextColor={T.muted} multiline={multiline}
            />
        </View>
    );
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCategories();
            setCategories(res.data ?? []);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('create'); };

    const openEdit = (cat: any) => {
        setForm({
            name: cat.name ?? '', description: cat.description ?? '',
            status: cat.status ?? 'active', isFeatured: cat.isFeatured ?? false,
            parent: cat.parent?._id ?? cat.parent ?? '',
        });
        setEditId(cat._id);
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Category name is required');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(), description: form.description,
                status: form.status, isFeatured: form.isFeatured,
                parent: form.parent || null,
            };
            if (modal === 'create') {
                await createCategory(payload);
                Alert.alert('Success', 'Category created');
            } else {
                await updateCategory(editId!, payload);
                Alert.alert('Success', 'Category updated');
            }
            setModal(null);
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Category', `Delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deleteCategory(id); loadData(); }
                    catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Delete failed'); }
                }
            },
        ]);
    };

    const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <View style={s.root}>
            <View style={s.pageHeader}>
                <View>
                    <Text style={s.pageTitle}>Categories</Text>
                    <Text style={s.pageSub}>{categories.length} total categories</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openCreate}>
                    <Feather name="plus" size={17} color={T.white} />
                    <Text style={s.addBtnText}>Add Category</Text>
                </TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput style={s.searchInput} placeholder="Search categories…"
                    placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
                {search ? <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={16} color={T.muted} /></TouchableOpacity> : null}
            </View>

            {loading ? (
                <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    ListEmptyComponent={<Text style={s.empty}>No categories found</Text>}
                    renderItem={({ item }) => (
                        <View style={s.catCard}>
                            <View style={s.catIcon}>
                                <Feather name="tag" size={18} color={T.active} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={s.catName}>{item.name}</Text>
                                    {item.isFeatured && (
                                        <View style={s.featuredBadge}>
                                            <Text style={s.featuredText}>Featured</Text>
                                        </View>
                                    )}
                                    <View style={[s.badge,
                                    { backgroundColor: item.status === 'active' ? T.green + '33' : T.red + '33' }]}>
                                        <Text style={[s.badgeText,
                                        { color: item.status === 'active' ? T.green : T.red }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                {item.description ? (
                                    <Text style={s.catDesc} numberOfLines={1}>{item.description}</Text>
                                ) : null}
                                {item.parent ? (
                                    <Text style={s.catParent}>Parent: {item.parent?.name ?? '—'}</Text>
                                ) : null}
                            </View>
                            <View style={s.cardActions}>
                                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                                    <Feather name="edit-2" size={15} color={T.active} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[s.iconBtn, { borderColor: T.red + '44' }]}
                                    onPress={() => handleDelete(item._id, item.name)}>
                                    <Feather name="trash-2" size={15} color={T.red} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal */}
            <Modal visible={modal !== null} animationType="slide" transparent>
                <View style={s.overlay}>
                    <View style={s.modalBox}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{modal === 'create' ? 'Create Category' : 'Edit Category'}</Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <Field label="Category Name *" value={form.name}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, name: v }))} />
                            <Field label="Description" value={form.description}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, description: v }))} multiline />

                            {/* Parent category */}
                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Parent Category (optional)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            style={[s.selectOpt, !form.parent && s.selectOptActive]}
                                            onPress={() => setForm((f: any) => ({ ...f, parent: '' }))}>
                                            <Text style={[s.selectOptText, !form.parent && s.selectOptTextActive]}>None</Text>
                                        </TouchableOpacity>
                                        {categories.filter(c => c._id !== editId).map((c: any) => (
                                            <TouchableOpacity
                                                key={c._id}
                                                style={[s.selectOpt, form.parent === c._id && s.selectOptActive]}
                                                onPress={() => setForm((f: any) => ({ ...f, parent: c._id }))}>
                                                <Text style={[s.selectOptText, form.parent === c._id && s.selectOptTextActive]}>
                                                    {c.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Status</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }].map(opt => (
                                        <TouchableOpacity key={opt.value}
                                            style={[s.selectOpt, form.status === opt.value && s.selectOptActive]}
                                            onPress={() => setForm((f: any) => ({ ...f, status: opt.value }))}>
                                            <Text style={[s.selectOptText, form.status === opt.value && s.selectOptTextActive]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Featured</Text>
                                <TouchableOpacity
                                    style={[s.toggle, form.isFeatured && s.toggleActive]}
                                    onPress={() => setForm((f: any) => ({ ...f, isFeatured: !f.isFeatured }))}>
                                    <Text style={[s.toggleText, form.isFeatured && s.toggleTextActive]}>
                                        {form.isFeatured ? 'Yes — Featured' : 'No'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <View style={s.modalFooter}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(null)}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator color={T.white} size="small" />
                                    : <Text style={s.saveText}>{modal === 'create' ? 'Create' : 'Save'}</Text>}
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
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16,
    },
    pageTitle: { color: T.text, fontSize: 22, fontWeight: '700' },
    pageSub: { color: T.muted, fontSize: 12, marginTop: 2 },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: T.active, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
    },
    addBtnText: { color: T.white, fontSize: 14, fontWeight: '600' },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: T.card, borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    searchInput: { flex: 1, color: T.text, fontSize: 14 },
    catCard: {
        backgroundColor: T.card, borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    catIcon: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: T.active + '22', alignItems: 'center', justifyContent: 'center',
    },
    catName: { color: T.text, fontSize: 14, fontWeight: '600' },
    catDesc: { color: T.muted, fontSize: 12, marginTop: 2 },
    catParent: { color: T.muted, fontSize: 11, marginTop: 2 },
    featuredBadge: { backgroundColor: '#D69E2E33', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    featuredText: { color: '#D69E2E', fontSize: 10, fontWeight: '600' },
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
        maxHeight: '85%', paddingBottom: 24,
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
    toggle: {
        alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8,
        borderWidth: 1, borderColor: T.inputBorder, backgroundColor: T.input,
    },
    toggleActive: { backgroundColor: T.active + '33', borderColor: T.active },
    toggleText: { color: T.muted, fontSize: 13 },
    toggleTextActive: { color: T.active, fontWeight: '600' },
});
