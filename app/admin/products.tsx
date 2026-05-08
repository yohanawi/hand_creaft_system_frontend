import { adminTheme as T } from '@/constants/adminTheme';
import {
    bulkUpdateAdminProductStatus,
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

const EMPTY_VARIANT = {
    _id: '',
    label: '',
    size: '',
    color: '',
    style: '',
    sku: '',
    quantity: '',
    price: '',
    salePrice: '',
    thumbnailImage: '',
    isDefault: false,
};

const EMPTY_FORM = {
    name: '', sku: '', price: '', salePrice: '', quantity: '', description: '',
    color: '', material: '', weight: '', tags: '',
    status: 'active', availabilityStatus: 'in_stock', isFeatured: false,
    category: '', subcategory: '', lowStockThreshold: '5', stockNote: '',
    thumbnailImage: '', images: '',
    deliveryMinDays: '', deliveryMaxDays: '', deliveryLabel: '', shipsFrom: '',
    videoUrls: '', view360Images: '',
    returnPolicy: '', warrantyPolicy: '', shippingPolicy: '',
    variants: [] as any[],
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

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <View style={s.sectionHeading}>
            <Text style={s.sectionHeadingTitle}>{title}</Text>
            {subtitle ? <Text style={s.sectionHeadingSubtitle}>{subtitle}</Text> : null}
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
            setProducts(pRes.data?.products ?? pRes.data ?? []);
            setCategories(cRes.data ?? []);
            setSelectedIds([]);
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
            lowStockThreshold: String(product.lowStockThreshold ?? 5),
            stockNote: '',
            thumbnailImage: product.thumbnailImage ?? '',
            images: Array.isArray(product.images) ? product.images.join(', ') : '',
            deliveryMinDays: String(product.deliveryEstimate?.minDays ?? ''),
            deliveryMaxDays: String(product.deliveryEstimate?.maxDays ?? ''),
            deliveryLabel: product.deliveryEstimate?.label ?? '',
            shipsFrom: product.deliveryEstimate?.shipsFrom ?? '',
            videoUrls: Array.isArray(product.richMedia?.videos) ? product.richMedia.videos.join(', ') : '',
            view360Images: Array.isArray(product.richMedia?.view360Images) ? product.richMedia.view360Images.join(', ') : '',
            returnPolicy: product.policySurfaces?.returnPolicy ?? '',
            warrantyPolicy: product.policySurfaces?.warrantyPolicy ?? '',
            shippingPolicy: product.policySurfaces?.shippingPolicy ?? '',
            variants: Array.isArray(product.variants) && product.variants.length > 0
                ? product.variants.map((variant: any) => ({
                    _id: variant._id ?? '',
                    label: variant.label ?? '',
                    size: variant.size ?? '',
                    color: variant.color ?? '',
                    style: variant.style ?? '',
                    sku: variant.sku ?? '',
                    quantity: String(variant.quantity ?? ''),
                    price: String(variant.price ?? ''),
                    salePrice: String(variant.salePrice ?? ''),
                    thumbnailImage: variant.thumbnailImage ?? '',
                    isDefault: Boolean(variant.isDefault),
                }))
                : [],
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
            const variants = Array.isArray(form.variants)
                ? form.variants
                    .map((variant: any) => ({
                        ...(variant._id ? { _id: variant._id } : {}),
                        label: String(variant.label || '').trim(),
                        size: String(variant.size || '').trim(),
                        color: String(variant.color || '').trim(),
                        style: String(variant.style || '').trim(),
                        sku: String(variant.sku || '').trim(),
                        quantity: variant.quantity !== '' ? Number(variant.quantity) : 0,
                        price: variant.price !== '' ? Number(variant.price) : undefined,
                        salePrice: variant.salePrice !== '' ? Number(variant.salePrice) : undefined,
                        thumbnailImage: String(variant.thumbnailImage || '').trim(),
                        isDefault: Boolean(variant.isDefault),
                    }))
                    .filter((variant: any) => (
                        variant.label || variant.size || variant.color || variant.style || variant.sku || variant.quantity > 0
                    ))
                : [];

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
                lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
                stockNote: form.stockNote || undefined,
                thumbnailImage: form.thumbnailImage || undefined,
                images: form.images || undefined,
                variants,
                deliveryEstimate: {
                    minDays: form.deliveryMinDays ? Number(form.deliveryMinDays) : 0,
                    maxDays: form.deliveryMaxDays ? Number(form.deliveryMaxDays) : 0,
                    label: form.deliveryLabel || '',
                    shipsFrom: form.shipsFrom || '',
                },
                richMedia: {
                    videos: form.videoUrls,
                    view360Images: form.view360Images,
                },
                policySurfaces: {
                    returnPolicy: form.returnPolicy || '',
                    warrantyPolicy: form.warrantyPolicy || '',
                    shippingPolicy: form.shippingPolicy || '',
                },
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
        Alert.alert('Archive Product', `Archive "${name}"? The product will be hidden from customer-facing views and kept in admin records.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Archive', style: 'destructive', onPress: async () => {
                    try {
                        const { data } = await deleteProduct(id);
                        Alert.alert('Archived', data?.message || 'Product archived');
                        loadAll();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || 'Archive failed');
                    }
                }
            },
        ]);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((current) => (
            current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
        ));
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );
    const allFilteredSelected = filtered.length > 0 && filtered.every((product) => selectedIds.includes(product._id));

    const handleBulkStatusUpdate = (status: 'active' | 'inactive') => {
        if (selectedIds.length === 0) return;

        Alert.alert(
            'Bulk Update Products',
            `Update ${selectedIds.length} selected product${selectedIds.length === 1 ? '' : 's'} to ${status}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        setBulkUpdating(true);
                        try {
                            const { data } = await bulkUpdateAdminProductStatus({ ids: selectedIds, status });
                            const summary = data?.summary ?? {};
                            const failed = Array.isArray(summary.failed) ? summary.failed.length : 0;
                            Alert.alert(
                                'Bulk Update Complete',
                                `${summary.updated ?? 0} updated, ${failed} failed.`,
                            );
                            setSelectedIds([]);
                            loadAll();
                        } catch (e: any) {
                            Alert.alert('Error', e.response?.data?.message || 'Bulk update failed');
                        } finally {
                            setBulkUpdating(false);
                        }
                    },
                },
            ],
        );
    };

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

            <View style={s.bulkToolbar}>
                <TouchableOpacity style={s.bulkSelectBtn} onPress={() => setSelectedIds(allFilteredSelected ? [] : filtered.map((item) => item._id))}>
                    <Feather name={allFilteredSelected ? 'check-square' : 'square'} size={16} color={T.active} />
                    <Text style={s.bulkToolbarText}>Select all visible</Text>
                </TouchableOpacity>
                {selectedIds.length > 0 ? (
                    <View style={s.bulkActionsRow}>
                        <Text style={s.bulkCount}>{selectedIds.length} selected</Text>
                        <TouchableOpacity style={s.bulkChip} onPress={() => handleBulkStatusUpdate('active')} disabled={bulkUpdating}>
                            <Text style={s.bulkChipText}>Mark Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.bulkChip, s.bulkChipDanger]} onPress={() => handleBulkStatusUpdate('inactive')} disabled={bulkUpdating}>
                            <Text style={[s.bulkChipText, s.bulkChipDangerText]}>Mark Inactive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.bulkClearBtn} onPress={() => setSelectedIds([])}>
                            <Text style={s.bulkClearText}>Clear</Text>
                        </TouchableOpacity>
                        {bulkUpdating ? <ActivityIndicator color={T.active} /> : null}
                    </View>
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
                            <TouchableOpacity style={s.checkboxBtn} onPress={() => toggleSelection(item._id)}>
                                <Feather name={selectedIds.includes(item._id) ? 'check-square' : 'square'} size={18} color={selectedIds.includes(item._id) ? T.active : T.muted} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <View style={s.cardRow}>
                                    <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
                                    <View style={[s.badge,
                                    { backgroundColor: item.status === 'active' ? T.green + '33' : item.status === 'archived' ? T.yellow + '22' : T.red + '33' }]}>
                                        <Text style={[s.badgeText,
                                        { color: item.status === 'active' ? T.green : item.status === 'archived' ? T.yellow : T.red }]}>
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
                                    <Text style={s.metaText}>Low-stock threshold: {item.lowStockThreshold ?? 5}</Text>
                                    <Text style={s.metaText}>Variants: {Array.isArray(item.variants) ? item.variants.length : 0}</Text>
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
                            <Field label="Low Stock Threshold" value={form.lowStockThreshold}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, lowStockThreshold: v }))}
                                keyboardType="numeric" />
                            <Field label="Thumbnail Image URL or uploads path" value={form.thumbnailImage}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, thumbnailImage: v }))}
                                placeholder="https://... or uploads/filename.jpg" />
                            <Field label="Additional Image URLs or paths" value={form.images}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, images: v }))}
                                placeholder="Comma-separated values"
                                multiline />
                            <Field label="Stock Change Note" value={form.stockNote}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, stockNote: v }))} />

                            <SectionHeading
                                title="Delivery"
                                subtitle="Show ETA messaging directly on the product page."
                            />
                            <Field label="Delivery ETA Label" value={form.deliveryLabel}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, deliveryLabel: v }))}
                                placeholder="Made to order, dispatches in 2-3 days" />
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Field label="Min Delivery Days" value={form.deliveryMinDays}
                                        onChange={(v: string) => setForm((f: any) => ({ ...f, deliveryMinDays: v }))}
                                        keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Field label="Max Delivery Days" value={form.deliveryMaxDays}
                                        onChange={(v: string) => setForm((f: any) => ({ ...f, deliveryMaxDays: v }))}
                                        keyboardType="numeric" />
                                </View>
                            </View>
                            <Field label="Ships From" value={form.shipsFrom}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, shipsFrom: v }))}
                                placeholder="Colombo warehouse" />

                            <SectionHeading
                                title="Variants"
                                subtitle="Add size, color, and style combinations with per-variant stock."
                            />
                            <View style={s.field}>
                                <View style={s.variantHeaderRow}>
                                    <Text style={s.fieldLabel}>Variant combinations</Text>
                                    <TouchableOpacity
                                        style={s.variantAddBtn}
                                        onPress={() => setForm((f: any) => ({ ...f, variants: [...(f.variants || []), { ...EMPTY_VARIANT }] }))}
                                    >
                                        <Feather name="plus" size={14} color={T.white} />
                                        <Text style={s.variantAddBtnText}>Add Variant</Text>
                                    </TouchableOpacity>
                                </View>

                                {(form.variants || []).length === 0 ? (
                                    <View style={s.variantEmptyState}>
                                        <Text style={s.variantEmptyText}>No variants added. Base product stock and price will be used.</Text>
                                    </View>
                                ) : (
                                    <View style={{ gap: 12 }}>
                                        {(form.variants || []).map((variant: any, index: number) => (
                                            <View key={`variant-${index}`} style={s.variantCard}>
                                                <View style={s.variantCardTop}>
                                                    <Text style={s.variantCardTitle}>Variant {index + 1}</Text>
                                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                                        <TouchableOpacity
                                                            style={[s.variantChipBtn, variant.isDefault && s.variantChipBtnActive]}
                                                            onPress={() => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => ({
                                                                    ...entry,
                                                                    isDefault: entryIndex === index,
                                                                })),
                                                            }))}
                                                        >
                                                            <Text style={[s.variantChipBtnText, variant.isDefault && s.variantChipBtnTextActive]}>Default</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[s.variantChipBtn, { borderColor: T.red + '55' }]}
                                                            onPress={() => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).filter((_: any, entryIndex: number) => entryIndex !== index),
                                                            }))}
                                                        >
                                                            <Feather name="trash-2" size={13} color={T.red} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                <Field label="Label" value={variant.label}
                                                    onChange={(v: string) => setForm((f: any) => ({
                                                        ...f,
                                                        variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, label: v } : entry),
                                                    }))}
                                                    placeholder="Large / Walnut / Slim" />
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Size" value={variant.size}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, size: v } : entry),
                                                            }))} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Color" value={variant.color}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, color: v } : entry),
                                                            }))} />
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Style" value={variant.style}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, style: v } : entry),
                                                            }))} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Variant SKU" value={variant.sku}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, sku: v } : entry),
                                                            }))} />
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Variant Stock" value={variant.quantity}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, quantity: v } : entry),
                                                            }))}
                                                            keyboardType="numeric" />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Variant Price" value={variant.price}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, price: v } : entry),
                                                            }))}
                                                            keyboardType="numeric" />
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Variant Sale Price" value={variant.salePrice}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, salePrice: v } : entry),
                                                            }))}
                                                            keyboardType="numeric" />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Field label="Variant Image" value={variant.thumbnailImage}
                                                            onChange={(v: string) => setForm((f: any) => ({
                                                                ...f,
                                                                variants: (f.variants || []).map((entry: any, entryIndex: number) => entryIndex === index ? { ...entry, thumbnailImage: v } : entry),
                                                            }))}
                                                            placeholder="https://... or uploads/..." />
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <SectionHeading
                                title="Rich Media"
                                subtitle="Add inline product videos and 360° image frame URLs."
                            />
                            <Field label="Product Video URLs" value={form.videoUrls}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, videoUrls: v }))}
                                placeholder="Comma-separated MP4 or stream URLs"
                                multiline />
                            <Field label="360° View Frame URLs" value={form.view360Images}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, view360Images: v }))}
                                placeholder="Comma-separated image URLs or uploads paths"
                                multiline />

                            <SectionHeading
                                title="Policy Surfaces"
                                subtitle="These appear directly on the product detail page."
                            />
                            <Field label="Return Policy" value={form.returnPolicy}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, returnPolicy: v }))}
                                multiline />
                            <Field label="Warranty Policy" value={form.warrantyPolicy}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, warrantyPolicy: v }))}
                                multiline />
                            <Field label="Shipping Policy" value={form.shippingPolicy}
                                onChange={(v: string) => setForm((f: any) => ({ ...f, shippingPolicy: v }))}
                                multiline />

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
                                    { label: 'Archived', value: 'archived' },
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
    bulkToolbar: { paddingHorizontal: 16, marginBottom: 8, gap: 10 },
    bulkSelectBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
    bulkToolbarText: { color: T.active, fontWeight: '700', fontSize: 12 },
    bulkActionsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    bulkCount: { color: T.text, fontSize: 12, fontWeight: '700' },
    bulkChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: T.activeBg, borderWidth: 1, borderColor: T.active },
    bulkChipText: { color: T.active, fontSize: 12, fontWeight: '700' },
    bulkChipDanger: { backgroundColor: T.red + '11', borderColor: T.red + '55' },
    bulkChipDangerText: { color: T.red },
    bulkClearBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    bulkClearText: { color: T.muted, fontSize: 12, fontWeight: '700' },

    productCard: {
        backgroundColor: T.card, borderRadius: 12,
        padding: 14, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: T.cardBorder, gap: 10,
    },
    checkboxBtn: { width: 28, alignItems: 'center', justifyContent: 'center' },
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

    sectionHeading: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
    sectionHeadingTitle: { color: T.text, fontSize: 15, fontWeight: '700' },
    sectionHeadingSubtitle: { color: T.muted, fontSize: 12, marginTop: 4 },

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
    variantHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    variantAddBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: T.active, borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 7,
    },
    variantAddBtnText: { color: T.white, fontSize: 12, fontWeight: '700' },
    variantEmptyState: {
        backgroundColor: T.input, borderRadius: 12,
        borderWidth: 1, borderColor: T.inputBorder,
        padding: 14,
    },
    variantEmptyText: { color: T.muted, fontSize: 12, lineHeight: 18 },
    variantCard: {
        backgroundColor: T.input, borderRadius: 14,
        borderWidth: 1, borderColor: T.inputBorder,
        paddingTop: 14, paddingBottom: 6,
    },
    variantCardTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 6,
    },
    variantCardTitle: { color: T.text, fontSize: 13, fontWeight: '700' },
    variantChipBtn: {
        minWidth: 34,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 999, borderWidth: 1, borderColor: T.inputBorder,
        backgroundColor: T.card,
    },
    variantChipBtnActive: { borderColor: T.active, backgroundColor: T.active + '33' },
    variantChipBtnText: { color: T.muted, fontSize: 11, fontWeight: '700' },
    variantChipBtnTextActive: { color: T.active },
});
