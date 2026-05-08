import { adminTheme as T } from '@/constants/adminTheme';
import { createBlog, deleteBlog, getBlogs, updateBlog } from '@/services/api';
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

const EMPTY_FORM = {
    title: '', description: '', category: '', author_name: '',
    author_profile_image: '', tags: '', status: 'published', is_popular: false,
};

function Field({ label, value, onChange, multiline, keyboardType }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 100, textAlignVertical: 'top' }]}
                value={value} onChangeText={onChange}
                placeholder={label} placeholderTextColor={T.muted}
                multiline={multiline} keyboardType={keyboardType ?? 'default'}
            />
        </View>
    );
}

export default function AdminBlogs() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);

    const loadData = useCallback(async (pg = 1, q = '') => {
        setLoading(true);
        try {
            const res = await getBlogs({ page: pg, limit: 20, search: q || undefined });
            const d = res.data;
            setBlogs(d.blogs ?? d.data ?? []);
            setTotal(d.total ?? 0);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadData(1, ''); }, [loadData]));

    const handleSearch = useCallback((q: string) => {
        setSearch(q);
        setPage(1);
        loadData(1, q);
    }, [loadData]);

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('create'); };

    const openEdit = (blog: any) => {
        setForm({
            title: blog.title ?? '',
            description: blog.description ?? '',
            category: blog.category ?? '',
            author_name: blog.author?.name ?? '',
            author_profile_image: blog.author?.profile_image ?? '',
            tags: (blog.tags ?? []).join(', '),
            status: blog.status ?? 'published',
            is_popular: blog.is_popular ?? false,
        });
        setEditId(blog._id);
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.title.trim()) return Alert.alert('Validation', 'Title is required');
        if (!form.description.trim()) return Alert.alert('Validation', 'Description is required');
        if (!form.author_name.trim()) return Alert.alert('Validation', 'Author name is required');
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title.trim());
            fd.append('description', form.description.trim());
            fd.append('category', form.category);
            fd.append('author_name', form.author_name.trim());
            fd.append('author_profile_image', form.author_profile_image);
            fd.append('tags', form.tags);
            fd.append('status', form.status);
            fd.append('is_popular', String(form.is_popular));

            if (modal === 'create') {
                await createBlog(fd);
                Alert.alert('Success', 'Blog created');
            } else {
                await updateBlog(editId!, fd);
                Alert.alert('Success', 'Blog updated');
            }
            setModal(null);
            loadData(page, search);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert('Delete Blog', `Delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deleteBlog(id); loadData(page, search); }
                    catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Delete failed'); }
                }
            },
        ]);
    };

    return (
        <View style={s.root}>
            <View style={s.pageHeader}>
                <View>
                    <Text style={s.pageTitle}>Blogs</Text>
                    <Text style={s.pageSub}>{total} total posts</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openCreate}>
                    <Feather name="plus" size={17} color={T.white} />
                    <Text style={s.addBtnText}>Add Blog</Text>
                </TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput style={s.searchInput} placeholder="Search blogs…"
                    placeholderTextColor={T.muted} value={search}
                    onChangeText={handleSearch} />
                {search ? <TouchableOpacity onPress={() => handleSearch('')}><Feather name="x" size={16} color={T.muted} /></TouchableOpacity> : null}
            </View>

            {loading ? (
                <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
            ) : (
                <FlatList
                    data={blogs}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    ListEmptyComponent={<Text style={s.empty}>No blogs found</Text>}
                    renderItem={({ item }) => (
                        <View style={s.blogCard}>
                            <View style={s.blogIcon}>
                                <Feather name="book-open" size={17} color={T.purple} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <Text style={s.blogTitle} numberOfLines={1}>{item.title}</Text>
                                    {item.is_popular && (
                                        <View style={s.popularBadge}>
                                            <Text style={s.popularText}>Popular</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={s.blogMeta}>
                                    By {item.author?.name ?? '—'} · {item.readingTimeText ?? ''}
                                    {item.category ? ` · ${item.category}` : ''}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <Feather name="eye" size={12} color={T.muted} />
                                    <Text style={s.blogViews}>{item.views ?? 0} views</Text>
                                    <View style={[s.badge, { backgroundColor: item.status === 'published' ? T.green + '33' : T.muted + '33' }]}>
                                        <Text style={[s.badgeText, { color: item.status === 'published' ? T.green : T.muted }]}>
                                            {item.status ?? 'published'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={s.cardActions}>
                                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                                    <Feather name="edit-2" size={15} color={T.active} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.iconBtn, { borderColor: T.red + '44' }]}
                                    onPress={() => handleDelete(item._id, item.title)}>
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
                            <Text style={s.modalTitle}>{modal === 'create' ? 'Create Blog' : 'Edit Blog'}</Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Field label="Title *" value={form.title}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, title: v }))} />
                            <Field label="Description / Content *" value={form.description}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, description: v }))} multiline />
                            <Field label="Category" value={form.category}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, category: v }))} />
                            <Field label="Author Name *" value={form.author_name}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, author_name: v }))} />
                            <Field label="Author Profile Image URL" value={form.author_profile_image}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, author_profile_image: v }))} />
                            <Field label="Tags (comma-separated)" value={form.tags}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, tags: v }))} />

                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Status</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }].map(opt => (
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
                                <Text style={s.fieldLabel}>Popular</Text>
                                <TouchableOpacity
                                    style={[s.toggle, form.is_popular && s.toggleActive]}
                                    onPress={() => setForm((f: any) => ({ ...f, is_popular: !f.is_popular }))}>
                                    <Text style={[s.toggleText, form.is_popular && s.toggleTextActive]}>
                                        {form.is_popular ? 'Yes — Popular' : 'No'}
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
    blogCard: {
        backgroundColor: T.card, borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1, borderColor: T.cardBorder,
    },
    blogIcon: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: T.purple + '22', alignItems: 'center', justifyContent: 'center',
    },
    blogTitle: { color: T.text, fontSize: 14, fontWeight: '600', flex: 1 },
    blogMeta: { color: T.muted, fontSize: 11, marginTop: 2 },
    blogViews: { color: T.muted, fontSize: 11 },
    popularBadge: { backgroundColor: T.purple + '33', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    popularText: { color: T.purple, fontSize: 10, fontWeight: '600' },
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
        maxHeight: '90%', paddingBottom: 24,
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
