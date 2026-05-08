import { adminTheme as T } from '@/constants/adminTheme';
import {
    createSubcategory,
    deleteSubcategory,
    getCategories,
    getSubcategories,
    updateSubcategory,
} from '@/services/api';
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

const EMPTY_FORM = { name: '', description: '', status: 'active', isFeatured: false, category: '' };

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

export default function AdminSubcategories() {
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [scRes, cRes] = await Promise.all([getSubcategories(), getCategories()]);
            setSubcategories(scRes.data?.subcategories ?? scRes.data ?? []);
            setCategories(cRes.data ?? []);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('create'); };

    const openEdit = (sc: any) => {
        setForm({
            name: sc.name ?? '', description: sc.description ?? '',
            status: sc.status ?? 'active', isFeatured: sc.isFeatured ?? false,
            category: sc.category?._id ?? sc.category ?? '',
        });
        setEditId(sc._id);
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Name is required');
        if (!form.category) return Alert.alert('Validation', 'Category is required');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(), description: form.description,
                status: form.status, isFeatured: form.isFeatured,
                category: form.category,
            };
            if (modal === 'create') {
                await createSubcategory(payload);
                Alert.alert('Success', 'Subcategory created');
            } else {
                await updateSubcategory(editId!, payload);
                Alert.alert('Success', 'Subcategory updated');
            }
            setModal(null);
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Subcategory', `Delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deleteSubcategory(id); loadData(); }
                    catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Delete failed'); }
                }
            },
        ]);
    };

    const getCatName = (catId: string) =>
        categories.find(c => c._id === catId)?.name ?? '—';

    const filtered = subcategories.filter(sc => {
        const matchSearch = sc.name?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCat || (sc.category?._id ?? sc.category) === filterCat;
        return matchSearch && matchCat;
    });

    return (
        <View style={s.root}>
            <View style={s.pageHeader}>
                <View>
                    <Text style={s.pageTitle}>Subcategories</Text>
                    <Text style={s.pageSub}>{subcategories.length} total</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openCreate}>
                    <Feather name="plus" size={17} color={T.white} />
                    <Text style={s.addBtnText}>Add Subcategory</Text>
                </TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput style={s.searchInput} placeholder="Search subcategories…"
                    placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
                {search ? <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={16} color={T.muted} /></TouchableOpacity> : null}
            </View>

            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                <TouchableOpacity
                    style={[s.filterChip, !filterCat && s.filterChipActive]}
                    onPress={() => setFilterCat('')}>
                    <Text style={[s.filterChipText, !filterCat && s.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                {categories.map((c: any) => (
                    <TouchableOpacity key={c._id}
                        style={[s.filterChip, filterCat === c._id && s.filterChipActive]}
                        onPress={() => setFilterCat(c._id)}>
                        <Text style={[s.filterChipText, filterCat === c._id && s.filterChipTextActive]}>
                            {c.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    ListEmptyComponent={<Text style={s.empty}>No subcategories found</Text>}
                    renderItem={({ item }) => (
                        <View style={s.scCard}>
                            <View style={s.scIcon}>
                                <Feather name="layers" size={17} color={T.yellow} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={s.scName}>{item.name}</Text>
                                    {item.isFeatured && (
                                        <View style={s.featuredBadge}>
                                            <Text style={s.featuredText}>Featured</Text>
                                        </View>
                                    )}
                                    <View style={[s.badge, { backgroundColor: item.status === 'active' ? T.green + '33' : T.red + '33' }]}>
                                        <Text style={[s.badgeText, { color: item.status === 'active' ? T.green : T.red }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={s.scCat}>
                                    {getCatName(item.category?._id ?? item.category)}
                                </Text>
                                {item.description ? <Text style={s.scDesc} numberOfLines={1}>{item.description}</Text> : null}
                            </View>
                            <View style={s.cardActions}>
                                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                                    <Feather name="edit-2" size={15} color={T.active} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.iconBtn, { borderColor: T.red + '44' }]}
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
                            <Text style={s.modalTitle}>
                                {modal === 'create' ? 'Create Subcategory' : 'Edit Subcategory'}
                            </Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Field label="Name *" value={form.name}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, name: v }))} />
                            <Field label="Description" value={form.description}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, description: v }))} multiline />

                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Category *</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {categories.map((c: any) => (
                                            <TouchableOpacity key={c._id}
                                                style={[s.selectOpt, form.category === c._id && s.selectOptActive]}
                                                onPress={() => setForm((f: any) => ({ ...f, category: c._id }))}>
                                                <Text style={[s.selectOptText, form.category === c._id && s.selectOptTextActive]}>
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
    filterChip: {
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
        borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card,
    },
    filterChipActive: { backgroundColor: T.active + '33', borderColor: T.active },
    filterChipText: { color: T.muted, fontSize: 12 },
    filterChipTextActive: { color: T.active, fontWeight: '600' },
    scCard: {
        backgroundColor: T.card, borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    scIcon: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: '#D69E2E22', alignItems: 'center', justifyContent: 'center',
    },
    scName: { color: T.text, fontSize: 14, fontWeight: '600' },
    scCat: { color: T.active, fontSize: 11, marginTop: 2 },
    scDesc: { color: T.muted, fontSize: 12, marginTop: 2 },
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
