import {
    createProduct,
    deleteProduct,
    getCategories,
    getProducts,
    getSubcategories,
    updateProduct,
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

const T = {
    bg: '#1E150C',
    card: '#2C1810',
    cardBorder: '#3D2415',
    text: '#F5EDE0',
    muted: '#8C7B6E',
    active: '#C1622F',
    green: '#38A169',
    red: '#E53E3E',
    input: '#241610',
    inputBorder: '#4A2515',
    white: '#FFFFFF',
    yellow: '#D69E2E',
};

const EMPTY_FORM = {
    name: '', sku: '', price: '', salePrice: '', quantity: '', description: '',
    color: '', material: '', weight: '', tags: '',
    status: 'active', availabilityStatus: 'in_stock', isFeatured: false,
    category: '', subcategory: '',
};

function Field({ label, value, onChange, placeholder, keyboardType, multiline }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 80, textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder ?? label}
                placeholderTextColor={T.muted}
                keyboardType={keyboardType ?? 'default'}
                multiline={multiline}
            />
        </View>
    );
}

function SelectField({ label, options, value, onChange }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <View style={s.selectRow}>
                {options.map((opt: any) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[s.selectOpt, value === opt.value && s.selectOptActive]}
                        onPress={() => onChange(opt.value)}
                    >
                        <Text style={[s.selectOptText, value === opt.value && s.selectOptTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
            setProducts(pRes.data?.products ?? pRes.data ?? []);
            setCategories(cRes.data ?? []);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

    const loadSubcategories = async (categoryId: string) => {
        if (!categoryId) return setSubcategories([]);
        try {
            const res = await getSubcategories({ category: categoryId });
            setSubcategories(res.data?.subcategories ?? res.data ?? []);
        } catch { setSubcategories([]); }
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditId(null);
        setSubcategories([]);
        setModal('create');
    };

    const openEdit = (product: any) => {
        setForm({
            name: product.name ?? '',
            sku: product.sku ?? '',
            price: String(product.price ?? ''),
            salePrice: String(product.salePrice ?? ''),
            quantity: String(product.quantity ?? ''),
            description: product.description ?? '',
            color: product.color ?? '',
            material: product.material ?? '',
            weight: String(product.weight ?? ''),
            tags: (product.tags ?? []).join(', '),
            status: product.status ?? 'active',
            availabilityStatus: product.availabilityStatus ?? 'in_stock',
            isFeatured: product.isFeatured ?? false,
            category: product.category?._id ?? product.category ?? '',
            subcategory: product.subcategory?._id ?? product.subcategory ?? '',
        });
        setEditId(product._id);
        loadSubcategories(product.category?._id ?? product.category ?? '');
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Product name is required');
        if (!form.price) return Alert.alert('Validation', 'Price is required');
        if (!form.sku.trim()) return Alert.alert('Validation', 'SKU is required');
        if (!form.category) return Alert.alert('Validation', 'Category is required');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                sku: form.sku.trim(),
                price: Number(form.price),
                salePrice: form.salePrice ? Number(form.salePrice) : undefined,
                quantity: form.quantity ? Number(form.quantity) : 0,
                description: form.description,
                color: form.color,
                material: form.material,
                weight: form.weight ? Number(form.weight) : undefined,
                tags: form.tags,
                status: form.status,
                availabilityStatus: form.availabilityStatus,
                isFeatured: form.isFeatured,
                category: form.category,
                subcategory: form.subcategory || undefined,
            };
            if (modal === 'create') {
                await createProduct(payload);
                Alert.alert('Success', 'Product created');
            } else {
                await updateProduct(editId!, payload);
                Alert.alert('Success', 'Product updated');
            }
            setModal(null);
            loadAll();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Product', `Delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await deleteProduct(id);
                        loadAll();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || 'Delete failed');
                    }
                }
            },
        ]);
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={s.root}>
            {/* Page header */}
            <View style={s.pageHeader}>
                <View>
                    <Text style={s.pageTitle}>Products</Text>
                    <Text style={s.pageSub}>{products.length} total products</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openCreate} activeOpacity={0.85}>
                    <Feather name="plus" size={17} color={T.white} />
                    <Text style={s.addBtnText}>Add Product</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search by name or SKU…"
                    placeholderTextColor={T.muted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search ? (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Feather name="x" size={16} color={T.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* List */}
            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator color={T.active} size="large" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    ListEmptyComponent={<Text style={s.empty}>No products found</Text>}
                    renderItem={({ item }) => (
                        <View style={s.productCard}>
                            <View style={{ flex: 1 }}>
                                <View style={s.cardRow}>
                                    <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
                                    <View style={[s.badge,
                                    { backgroundColor: item.status === 'active' ? T.green + '33' : T.red + '33' }]}>
                                        <Text style={[s.badgeText,
                                        { color: item.status === 'active' ? T.green : T.red }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                <View style={s.cardMeta}>
                                    <Text style={s.metaText}>SKU: {item.sku}</Text>
                                    <Text style={s.metaText}>
                                        ${item.salePrice ? `${item.salePrice} (was $${item.price})` : item.price}
                                    </Text>
                                    <Text style={s.metaText}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={s.metaText}>{item.category?.name ?? '—'}</Text>
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
                                {modal === 'create' ? 'Create Product' : 'Edit Product'}
                            </Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <Field label="Product Name *" value={form.name}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, name: v }))} />
                            <Field label="SKU *" value={form.sku}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, sku: v }))} />
                            <Field label="Price *" value={form.price}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, price: v }))}
                                keyboardType="numeric" />
                            <Field label="Sale Price" value={form.salePrice}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, salePrice: v }))}
                                keyboardType="numeric" />
                            <Field label="Quantity" value={form.quantity}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, quantity: v }))}
                                keyboardType="numeric" />

                            {/* Category selector */}
                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Category *</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={s.selectRow}>
                                        {categories.map((c: any) => (
                                            <TouchableOpacity
                                                key={c._id}
                                                style={[s.selectOpt, form.category === c._id && s.selectOptActive]}
                                                onPress={() => {
                                                    setForm((f: any) => ({ ...f, category: c._id, subcategory: '' }));
                                                    loadSubcategories(c._id);
                                                }}
                                            >
                                                <Text style={[s.selectOptText, form.category === c._id && s.selectOptTextActive]}>
                                                    {c.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            {/* Subcategory */}
                            {subcategories.length > 0 && (
                                <View style={s.field}>
                                    <Text style={s.fieldLabel}>Subcategory</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={s.selectRow}>
                                            <TouchableOpacity
                                                style={[s.selectOpt, !form.subcategory && s.selectOptActive]}
                                                onPress={() => setForm((f: any) => ({ ...f, subcategory: '' }))}
                                            >
                                                <Text style={[s.selectOptText, !form.subcategory && s.selectOptTextActive]}>
                                                    None
                                                </Text>
                                            </TouchableOpacity>
                                            {subcategories.map((sc: any) => (
                                                <TouchableOpacity
                                                    key={sc._id}
                                                    style={[s.selectOpt, form.subcategory === sc._id && s.selectOptActive]}
                                                    onPress={() => setForm((f: any) => ({ ...f, subcategory: sc._id }))}
                                                >
                                                    <Text style={[s.selectOptText, form.subcategory === sc._id && s.selectOptTextActive]}>
                                                        {sc.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            <SelectField
                                label="Status"
                                value={form.status}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, status: v }))}
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]}
                            />
                            <SelectField
                                label="Availability"
                                value={form.availabilityStatus}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, availabilityStatus: v }))}
                                options={[
                                    { label: 'In Stock', value: 'in_stock' },
                                    { label: 'Out of Stock', value: 'out_of_stock' },
                                    { label: 'Pre-Order', value: 'pre_order' },
                                ]}
                            />
                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Featured</Text>
                                <TouchableOpacity
                                    style={[s.toggle, form.isFeatured && s.toggleActive]}
                                    onPress={() => setForm((f: any) => ({ ...f, isFeatured: !f.isFeatured }))}
                                >
                                    <Text style={[s.toggleText, form.isFeatured && s.toggleTextActive]}>
                                        {form.isFeatured ? 'Yes' : 'No'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Field label="Color" value={form.color}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, color: v }))} />
                            <Field label="Material" value={form.material}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, material: v }))} />
                            <Field label="Weight (g)" value={form.weight}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, weight: v }))}
                                keyboardType="numeric" />
                            <Field label="Tags (comma-separated)" value={form.tags}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, tags: v }))} />
                            <Field label="Description" value={form.description}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, description: v }))}
                                multiline />
                        </ScrollView>
                        <View style={s.modalFooter}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(null)}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator color={T.white} size="small" />
                                    : <Text style={s.saveText}>{modal === 'create' ? 'Create' : 'Save'}</Text>
                                }
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
    empty: { color: T.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },

    pageHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16,
    },
    pageTitle: { color: T.text, fontSize: 22, fontWeight: '700' },
    pageSub: { color: T.muted, fontSize: 12, marginTop: 2 },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: T.active, borderRadius: 10,
        paddingVertical: 10, paddingHorizontal: 16,
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

    productCard: {
        backgroundColor: T.card, borderRadius: 12,
        padding: 14, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: T.cardBorder, gap: 10,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    productName: { color: T.text, fontSize: 14, fontWeight: '600', flex: 1 },
    cardMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 2 },
    metaText: { color: T.muted, fontSize: 12 },
    cardActions: { gap: 8 },
    iconBtn: {
        width: 34, height: 34, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: T.active + '1A',
        borderWidth: 1, borderColor: T.active + '44',
    },
    badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { fontSize: 11, fontWeight: '600' },

    // Modal
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: T.card,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '90%', paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: T.cardBorder,
    },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalFooter: {
        flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: T.cardBorder,
    },
    cancelBtn: {
        flex: 1, borderRadius: 10, paddingVertical: 13,
        borderWidth: 1, borderColor: T.cardBorder,
        alignItems: 'center',
    },
    cancelText: { color: T.muted, fontSize: 15, fontWeight: '600' },
    saveBtn: {
        flex: 2, borderRadius: 10, paddingVertical: 13,
        backgroundColor: T.active, alignItems: 'center',
    },
    saveText: { color: T.white, fontSize: 15, fontWeight: '700' },

    // Form fields
    field: { paddingHorizontal: 20, paddingBottom: 14 },
    fieldLabel: { color: T.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 6 },
    input: {
        backgroundColor: T.input, borderRadius: 10,
        borderWidth: 1, borderColor: T.inputBorder,
        color: T.text, fontSize: 14,
        paddingHorizontal: 14, paddingVertical: 10,
    },
    selectRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    selectOpt: {
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
        borderWidth: 1, borderColor: T.inputBorder,
        backgroundColor: T.input,
    },
    selectOptActive: { backgroundColor: T.active + '33', borderColor: T.active },
    selectOptText: { color: T.muted, fontSize: 13 },
    selectOptTextActive: { color: T.active, fontWeight: '600' },
    toggle: {
        alignSelf: 'flex-start', borderRadius: 8,
        paddingHorizontal: 16, paddingVertical: 8,
        borderWidth: 1, borderColor: T.inputBorder, backgroundColor: T.input,
    },
    toggleActive: { backgroundColor: T.active + '33', borderColor: T.active },
    toggleText: { color: T.muted, fontSize: 13 },
    toggleTextActive: { color: T.active, fontWeight: '600' },
});
