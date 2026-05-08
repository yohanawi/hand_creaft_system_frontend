import { sellerTheme as T } from '@/constants/sellerTheme';
import { useAuth } from '@/context/AuthContext';
import {
    bulkUpdateSellerProducts,
    createSellerProduct,
    deleteSellerProduct,
    duplicateSellerProduct,
    getCategories,
    getSellerProducts,
    getSubcategories,
    updateSellerProduct,
} from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD'];

const EMPTY_FORM = {
    name: '',
    sku: '',
    price: '',
    salePrice: '',
    quantity: '',
    lowStockThreshold: '5',
    currency: 'USD',
    category: '',
    subcategory: '',
    status: 'active',
    description: '',
    color: '',
    material: '',
    weight: '',
    tags: '',
    thumbnailImage: '',
    images: '',
    deliveryMinDays: '',
    deliveryMaxDays: '',
    deliveryLabel: '',
    shipsFrom: '',
    returnPolicy: '',
    warrantyPolicy: '',
    shippingPolicy: '',
    variants: [] as any[],
};

function Field({ label, value, onChange, placeholder, keyboardType, multiline }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 90, textAlignVertical: 'top' }]}
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

function SegmentedField({ label, value, onChange, options }: any) {
    return (
        <View style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            <View style={s.segmentRow}>
                {options.map((option: any) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[s.segment, value === option.value && s.segmentActive]}
                        onPress={() => onChange(option.value)}
                    >
                        <Text style={[s.segmentText, value === option.value && s.segmentTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function SellerProductsScreen() {
    const auth = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [bulkSaving, setBulkSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getSellerProducts({
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    availabilityStatus: availabilityFilter !== 'all' ? availabilityFilter : undefined,
                    lowStock: lowStockOnly || undefined,
                    limit: 50,
                }),
                getCategories(),
            ]);
            setProducts(productsRes.data?.products ?? []);
            setCategories(categoriesRes.data ?? []);
            setSelectedIds((current) => current.filter((id) => (productsRes.data?.products ?? []).some((product: any) => product._id === id)));
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [availabilityFilter, lowStockOnly, search, statusFilter]);

    useFocusEffect(useCallback(() => {
        loadAll();
    }, [loadAll]));

    const loadSubcategories = async (categoryId: string) => {
        if (!categoryId) {
            setSubcategories([]);
            return;
        }

        try {
            const res = await getSubcategories({ category: categoryId });
            setSubcategories(res.data?.subcategories ?? res.data ?? []);
        } catch {
            setSubcategories([]);
        }
    };

    const resetForm = () => {
        setForm({
            ...EMPTY_FORM,
            currency: auth.user?.sellerProfile?.defaultCurrency ?? 'USD',
        });
        setEditId(null);
        setSubcategories([]);
    };

    const openCreate = () => {
        resetForm();
        setModal('create');
    };

    const openEdit = (product: any) => {
        setForm({
            name: product.name ?? '',
            sku: product.sku ?? '',
            price: String(product.price ?? ''),
            salePrice: String(product.salePrice ?? ''),
            quantity: String(product.quantity ?? ''),
            lowStockThreshold: String(product.lowStockThreshold ?? 5),
            currency: product.currency ?? auth.user?.sellerProfile?.defaultCurrency ?? 'USD',
            category: product.category?._id ?? product.category ?? '',
            subcategory: product.subcategory?._id ?? product.subcategory ?? '',
            status: product.status ?? 'active',
            description: product.description ?? '',
            color: product.color ?? '',
            material: product.material ?? '',
            weight: String(product.weight ?? ''),
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            thumbnailImage: product.thumbnailImage ?? '',
            images: Array.isArray(product.images) ? product.images.join(', ') : '',
            deliveryMinDays: String(product.deliveryEstimate?.minDays ?? ''),
            deliveryMaxDays: String(product.deliveryEstimate?.maxDays ?? ''),
            deliveryLabel: product.deliveryEstimate?.label ?? '',
            shipsFrom: product.deliveryEstimate?.shipsFrom ?? '',
            returnPolicy: product.policySurfaces?.returnPolicy ?? '',
            warrantyPolicy: product.policySurfaces?.warrantyPolicy ?? '',
            shippingPolicy: product.policySurfaces?.shippingPolicy ?? '',
            variants: Array.isArray(product.variants)
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

    const buildPayload = () => {
        const variants = (form.variants || []).map((variant: any) => ({
            ...(variant._id ? { _id: variant._id } : {}),
            label: String(variant.label || '').trim(),
            size: String(variant.size || '').trim(),
            color: String(variant.color || '').trim(),
            style: String(variant.style || '').trim(),
            sku: String(variant.sku || '').trim(),
            quantity: variant.quantity === '' ? 0 : Number(variant.quantity),
            price: variant.price === '' ? undefined : Number(variant.price),
            salePrice: variant.salePrice === '' ? undefined : Number(variant.salePrice),
            thumbnailImage: String(variant.thumbnailImage || '').trim(),
            isDefault: Boolean(variant.isDefault),
        })).filter((variant: any) => (
            variant.label || variant.size || variant.color || variant.style || variant.sku || variant.quantity > 0
        ));

        return {
            name: form.name.trim(),
            sku: form.sku.trim(),
            price: Number(form.price),
            salePrice: form.salePrice ? Number(form.salePrice) : undefined,
            quantity: form.quantity ? Number(form.quantity) : 0,
            lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
            currency: form.currency,
            category: form.category,
            subcategory: form.subcategory || undefined,
            status: form.status,
            description: form.description,
            color: form.color,
            material: form.material,
            weight: form.weight ? Number(form.weight) : undefined,
            tags: form.tags,
            thumbnailImage: form.thumbnailImage || undefined,
            images: form.images || undefined,
            variants,
            deliveryEstimate: {
                minDays: form.deliveryMinDays ? Number(form.deliveryMinDays) : 0,
                maxDays: form.deliveryMaxDays ? Number(form.deliveryMaxDays) : 0,
                label: form.deliveryLabel || '',
                shipsFrom: form.shipsFrom || '',
            },
            policySurfaces: {
                returnPolicy: form.returnPolicy || '',
                warrantyPolicy: form.warrantyPolicy || '',
                shippingPolicy: form.shippingPolicy || '',
            },
        };
    };

    const handleSave = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Product name is required');
        if (!form.price) return Alert.alert('Validation', 'Price is required');
        if (!form.category) return Alert.alert('Validation', 'Category is required');

        const duplicateVariantSku = new Set<string>();
        for (const variant of form.variants || []) {
            const sku = String(variant.sku || '').trim().toUpperCase();
            const hasAttributes = String(variant.size || '').trim() || String(variant.color || '').trim() || String(variant.style || '').trim();
            if ((variant.label || variant.sku || variant.quantity || variant.price || variant.salePrice) && !hasAttributes) {
                return Alert.alert('Validation', 'Each variant must include at least one of size, color, or style.');
            }
            if (sku) {
                if (duplicateVariantSku.has(sku)) {
                    return Alert.alert('Validation', 'Variant SKU values must be unique within the product.');
                }
                duplicateVariantSku.add(sku);
            }
        }

        setSaving(true);
        try {
            if (modal === 'create') {
                await createSellerProduct(buildPayload());
                Alert.alert('Success', 'Product created successfully');
            } else {
                await updateSellerProduct(editId!, buildPayload());
                Alert.alert('Success', 'Product updated successfully');
            }
            setModal(null);
            await loadAll();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (product: any) => {
        Alert.alert('Delete product', `Remove ${product.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteSellerProduct(product._id);
                        loadAll();
                    } catch (err: any) {
                        Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete product');
                    }
                },
            },
        ]);
    };

    const handleDuplicate = async (product: any) => {
        try {
            const { data } = await duplicateSellerProduct(product._id);
            Alert.alert('Success', 'Product duplicated successfully.');
            openEdit(data.product);
            await loadAll();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to duplicate product');
        }
    };

    const handleBulkStatus = async (status: 'active' | 'inactive' | 'archived') => {
        if (selectedIds.length === 0) {
            return Alert.alert('Validation', 'Select at least one product first.');
        }

        setBulkSaving(true);
        try {
            const { data } = await bulkUpdateSellerProducts({ ids: selectedIds, status });
            const summary = data?.summary;
            Alert.alert(
                'Bulk update complete',
                `${summary?.updated ?? 0} products updated.${summary?.failedCount ? ` ${summary.failedCount} failed.` : ''}`,
            );
            setSelectedIds([]);
            await loadAll();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Bulk update failed');
        } finally {
            setBulkSaving(false);
        }
    };

    const selectedCount = selectedIds.length;

    const filteredProducts = useMemo(() => products, [products]);

    return (
        <View style={s.root}>
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Products</Text>
                    <Text style={s.subtitle}>{products.length} listings in your seller catalog</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openCreate} activeOpacity={0.85}>
                    <Feather name="plus" size={16} color={T.white} />
                    <Text style={s.addBtnText}>Add Product</Text>
                </TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
                <Feather name="search" size={16} color={T.muted} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search by product name or SKU"
                    placeholderTextColor={T.muted}
                    value={searchInput}
                    onChangeText={setSearchInput}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRail}>
                {['all', 'active', 'inactive', 'archived'].map((option) => (
                    <TouchableOpacity key={option} style={[s.filterChip, statusFilter === option && s.filterChipActive]} onPress={() => setStatusFilter(option)}>
                        <Text style={[s.filterChipText, statusFilter === option && s.filterChipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                ))}
                {['all', 'in_stock', 'out_of_stock', 'pre_order'].map((option) => (
                    <TouchableOpacity key={option} style={[s.filterChip, availabilityFilter === option && s.filterChipActive]} onPress={() => setAvailabilityFilter(option)}>
                        <Text style={[s.filterChipText, availabilityFilter === option && s.filterChipTextActive]}>{option.replace(/_/g, ' ')}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[s.filterChip, lowStockOnly && s.filterChipActive]} onPress={() => setLowStockOnly((current) => !current)}>
                    <Text style={[s.filterChipText, lowStockOnly && s.filterChipTextActive]}>low stock</Text>
                </TouchableOpacity>
            </ScrollView>

            {selectedCount > 0 ? (
                <View style={s.bulkBar}>
                    <Text style={s.bulkText}>{selectedCount} selected</Text>
                    <View style={s.bulkActions}>
                        <TouchableOpacity style={s.bulkBtn} onPress={() => handleBulkStatus('active')} disabled={bulkSaving}>
                            <Text style={s.bulkBtnText}>Activate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.bulkBtn} onPress={() => handleBulkStatus('inactive')} disabled={bulkSaving}>
                            <Text style={s.bulkBtnText}>Deactivate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.bulkBtn, s.bulkBtnDanger]} onPress={() => handleBulkStatus('archived')} disabled={bulkSaving}>
                            <Text style={[s.bulkBtnText, { color: T.red }]}>Archive</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={T.active} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16, gap: 10 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} tintColor={T.active} />}
                    ListEmptyComponent={<Text style={s.empty}>No products found</Text>}
                    renderItem={({ item }) => (
                        <View style={s.card}>
                            <TouchableOpacity style={[s.selectDot, selectedIds.includes(item._id) && s.selectDotActive]} onPress={() => setSelectedIds((current) => current.includes(item._id) ? current.filter((id) => id !== item._id) : [...current, item._id])}>
                                {selectedIds.includes(item._id) ? <Feather name="check" size={14} color={T.white} /> : null}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <View style={s.cardHeader}>
                                    <Text style={s.cardTitle}>{item.name}</Text>
                                    <View style={[s.badge, { backgroundColor: item.status === 'active' ? T.green + '22' : T.red + '22' }]}>
                                        <Text style={[s.badgeText, { color: item.status === 'active' ? T.green : T.red }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={s.metaText}>SKU: {item.sku}</Text>
                                <Text style={s.metaText}>Price: {item.currency || 'USD'} {Number(item.salePrice ?? item.price ?? 0).toFixed(2)}</Text>
                                <Text style={s.metaText}>Qty: {item.quantity} · Variants: {Array.isArray(item.variants) ? item.variants.length : 0} · {item.availabilityStatus?.replace(/_/g, ' ')}</Text>
                                <Text style={s.metaText}>Category: {item.category?.name ?? '—'}</Text>
                            </View>
                            <View style={s.actionColumn}>
                                <TouchableOpacity style={s.iconBtn} onPress={() => handleDuplicate(item)}>
                                    <Feather name="copy" size={15} color={T.teal} />
                                </TouchableOpacity>
                                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                                    <Feather name="edit-2" size={15} color={T.active} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.iconBtn, { borderColor: T.red + '44' }]} onPress={() => handleDelete(item)}>
                                    <Feather name="trash-2" size={15} color={T.red} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <Modal visible={modal !== null} animationType="slide" transparent>
                <View style={s.overlay}>
                    <View style={s.modalBox}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{modal === 'create' ? 'Create Product' : 'Edit Product'}</Text>
                            <TouchableOpacity onPress={() => setModal(null)}>
                                <Feather name="x" size={22} color={T.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Field label="Product Name" value={form.name} onChange={(value: string) => setForm((current: any) => ({ ...current, name: value }))} />
                            <Field label="SKU (optional)" value={form.sku} onChange={(value: string) => setForm((current: any) => ({ ...current, sku: value }))} placeholder="Leave blank to auto-generate" />
                            <Field label="Price" value={form.price} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, price: value }))} />
                            <Field label="Sale Price" value={form.salePrice} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, salePrice: value }))} />
                            <Field label="Quantity" value={form.quantity} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, quantity: value }))} />
                            <Field label="Low Stock Threshold" value={form.lowStockThreshold} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, lowStockThreshold: value }))} />
                            <SegmentedField label="Listing Status" value={form.status} onChange={(value: string) => setForm((current: any) => ({ ...current, status: value }))} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
                            <SegmentedField label="Currency" value={form.currency} onChange={(value: string) => setForm((current: any) => ({ ...current, currency: value }))} options={CURRENCIES.map((currency) => ({ label: currency, value: currency }))} />

                            <View style={s.field}>
                                <Text style={s.fieldLabel}>Category</Text>
                                <View style={s.segmentWrap}>
                                    {categories.map((category: any) => (
                                        <TouchableOpacity
                                            key={category._id}
                                            style={[s.segment, form.category === category._id && s.segmentActive]}
                                            onPress={() => {
                                                setForm((current: any) => ({ ...current, category: category._id, subcategory: '' }));
                                                loadSubcategories(category._id);
                                            }}
                                        >
                                            <Text style={[s.segmentText, form.category === category._id && s.segmentTextActive]}>{category.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {subcategories.length > 0 ? (
                                <View style={s.field}>
                                    <Text style={s.fieldLabel}>Subcategory</Text>
                                    <View style={s.segmentWrap}>
                                        {subcategories.map((subcategory: any) => (
                                            <TouchableOpacity
                                                key={subcategory._id}
                                                style={[s.segment, form.subcategory === subcategory._id && s.segmentActive]}
                                                onPress={() => setForm((current: any) => ({ ...current, subcategory: subcategory._id }))}
                                            >
                                                <Text style={[s.segmentText, form.subcategory === subcategory._id && s.segmentTextActive]}>{subcategory.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            <Field label="Description" value={form.description} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, description: value }))} />
                            <Field label="Color" value={form.color} onChange={(value: string) => setForm((current: any) => ({ ...current, color: value }))} />
                            <Field label="Material" value={form.material} onChange={(value: string) => setForm((current: any) => ({ ...current, material: value }))} />
                            <Field label="Weight" value={form.weight} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, weight: value }))} />
                            <Field label="Tags" value={form.tags} onChange={(value: string) => setForm((current: any) => ({ ...current, tags: value }))} placeholder="Comma separated" />
                            <Field label="Thumbnail Image URL or uploads path" value={form.thumbnailImage} onChange={(value: string) => setForm((current: any) => ({ ...current, thumbnailImage: value }))} />
                            <Field label="Additional Images" value={form.images} multiline placeholder="Comma separated image URLs or upload paths" onChange={(value: string) => setForm((current: any) => ({ ...current, images: value }))} />
                            <Field label="Delivery Label" value={form.deliveryLabel} onChange={(value: string) => setForm((current: any) => ({ ...current, deliveryLabel: value }))} />
                            <Field label="Delivery Min Days" value={form.deliveryMinDays} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, deliveryMinDays: value }))} />
                            <Field label="Delivery Max Days" value={form.deliveryMaxDays} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, deliveryMaxDays: value }))} />
                            <Field label="Ships From" value={form.shipsFrom} onChange={(value: string) => setForm((current: any) => ({ ...current, shipsFrom: value }))} />
                            <Field label="Return Policy" value={form.returnPolicy} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, returnPolicy: value }))} />
                            <Field label="Warranty Policy" value={form.warrantyPolicy} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, warrantyPolicy: value }))} />
                            <Field label="Shipping Policy" value={form.shippingPolicy} multiline onChange={(value: string) => setForm((current: any) => ({ ...current, shippingPolicy: value }))} />

                            <View style={s.field}>
                                <View style={s.variantHeader}>
                                    <Text style={s.fieldLabel}>Variants</Text>
                                    <TouchableOpacity style={s.smallActionBtn} onPress={() => setForm((current: any) => ({ ...current, variants: [...current.variants, { ...EMPTY_VARIANT }] }))}>
                                        <Feather name="plus" size={14} color={T.active} />
                                        <Text style={s.smallActionText}>Add variant</Text>
                                    </TouchableOpacity>
                                </View>
                                {(form.variants || []).map((variant: any, index: number) => (
                                    <View key={`${variant._id || 'new'}-${index}`} style={s.variantCard}>
                                        <View style={s.variantHeader}>
                                            <Text style={s.variantTitle}>Variant {index + 1}</Text>
                                            <TouchableOpacity onPress={() => setForm((current: any) => ({ ...current, variants: current.variants.filter((_: any, itemIndex: number) => itemIndex !== index) }))}>
                                                <Feather name="trash-2" size={14} color={T.red} />
                                            </TouchableOpacity>
                                        </View>
                                        <Field label="Label" value={variant.label} onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, label: value } : item) }))} />
                                        <Field label="Size" value={variant.size} onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, size: value } : item) }))} />
                                        <Field label="Color" value={variant.color} onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, color: value } : item) }))} />
                                        <Field label="Style" value={variant.style} onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, style: value } : item) }))} />
                                        <Field label="Variant SKU" value={variant.sku} onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, sku: value } : item) }))} />
                                        <Field label="Variant Quantity" value={variant.quantity} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, quantity: value } : item) }))} />
                                        <Field label="Variant Price" value={variant.price} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, price: value } : item) }))} />
                                        <Field label="Variant Sale Price" value={variant.salePrice} keyboardType="numeric" onChange={(value: string) => setForm((current: any) => ({ ...current, variants: current.variants.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, salePrice: value } : item) }))} />
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={s.modalFooter}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(null)}>
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color={T.white} /> : <Text style={s.saveText}>Save Product</Text>}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    title: { color: T.text, fontSize: 24, fontWeight: '700' },
    subtitle: { color: T.muted, fontSize: 12, marginTop: 4 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.active, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: T.white, fontWeight: '700' },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 8, backgroundColor: T.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: T.cardBorder },
    searchInput: { flex: 1, color: T.text, fontSize: 14 },
    filterRail: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
    filterChip: { borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card, paddingHorizontal: 12, paddingVertical: 8 },
    filterChipActive: { borderColor: T.active, backgroundColor: T.activeBg },
    filterChipText: { color: T.muted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    filterChipTextActive: { color: T.active },
    bulkBar: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.card2, padding: 12, gap: 10 },
    bulkText: { color: T.text, fontWeight: '700' },
    bulkActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    bulkBtn: { borderRadius: 999, borderWidth: 1, borderColor: T.cardBorder, backgroundColor: T.surface, paddingHorizontal: 12, paddingVertical: 8 },
    bulkBtnDanger: { backgroundColor: '#FFF1F1', borderColor: '#F3C4C4' },
    bulkBtnText: { color: T.text, fontSize: 12, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { color: T.muted, textAlign: 'center', marginTop: 36 },
    card: { backgroundColor: T.card, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: T.cardBorder },
    selectDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: T.inputBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: T.surface },
    selectDotActive: { backgroundColor: T.active, borderColor: T.active },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    cardTitle: { color: T.text, fontSize: 15, fontWeight: '700', flex: 1 },
    metaText: { color: T.muted, fontSize: 12, marginTop: 4 },
    actionColumn: { gap: 8 },
    iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: T.activeBg, borderWidth: 1, borderColor: T.cardBorder },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    overlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.7)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingBottom: 24 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    modalTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: T.cardBorder },
    cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center' },
    cancelText: { color: T.muted, fontWeight: '600' },
    saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, backgroundColor: T.active, alignItems: 'center' },
    saveText: { color: T.white, fontWeight: '700' },
    field: { paddingHorizontal: 20, paddingTop: 16 },
    fieldLabel: { color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
    input: { backgroundColor: T.input, borderRadius: 12, borderWidth: 1, borderColor: T.inputBorder, color: T.text, fontSize: 14, paddingHorizontal: 14, paddingVertical: 12 },
    segmentRow: { flexDirection: 'row', gap: 8 },
    segmentWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    segment: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: T.inputBorder, backgroundColor: T.surface },
    segmentActive: { backgroundColor: T.activeBg, borderColor: T.active },
    segmentText: { color: T.muted, fontSize: 12, fontWeight: '600' },
    segmentTextActive: { color: T.active },
    variantHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    smallActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: T.activeBg },
    smallActionText: { color: T.active, fontSize: 12, fontWeight: '700' },
    variantCard: { marginTop: 10, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 14, paddingBottom: 16, backgroundColor: T.surface },
    variantTitle: { color: T.text, fontWeight: '700', fontSize: 13 },
});