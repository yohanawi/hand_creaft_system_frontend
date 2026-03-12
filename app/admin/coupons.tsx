import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
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
  white: '#FFFFFF',
  input: '#241610',
};

const EMPTY_FORM = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '0',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminCoupons();
      setCoupons(data || []);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadCoupons(); }, [loadCoupons]));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: String(coupon.value ?? ''),
      minOrderAmount: String(coupon.minOrderAmount ?? 0),
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
      active: !!coupon.active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) {
      Alert.alert('Required', 'Coupon code and value are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      };

      if (editingId) {
        await updateAdminCoupon(editingId, payload);
      } else {
        await createAdminCoupon(payload);
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadCoupons();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, code: string) => {
    Alert.alert('Delete Coupon', `Delete coupon ${code}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAdminCoupon(id);
            loadCoupons();
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to delete coupon.');
          }
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Coupons</Text>
          <Text style={s.sub}>{coupons.length} coupon(s)</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openCreate}>
          <Feather name="plus" size={16} color={T.white} />
          <Text style={s.addBtnText}>Add Coupon</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={T.active} size="large" /></View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={{ flex: 1 }}>
                <View style={s.cardHeaderRow}>
                  <Text style={s.code}>{item.code}</Text>
                  <View style={[s.badge, { backgroundColor: item.active ? T.green + '22' : T.red + '22' }]}>
                    <Text style={[s.badgeText, { color: item.active ? T.green : T.red }]}>{item.active ? 'active' : 'inactive'}</Text>
                  </View>
                </View>
                <Text style={s.meta}>{item.type} | value: {item.value}</Text>
                <Text style={s.meta}>Min order: {item.minOrderAmount || 0}</Text>
                <Text style={s.meta}>Used: {item.usedCount || 0}{item.usageLimit ? ` / ${item.usageLimit}` : ''}</Text>
                <Text style={s.meta}>Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'No expiry'}</Text>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.iconBtn} onPress={() => openEdit(item)}>
                  <Feather name="edit-2" size={15} color={T.active} />
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => handleDelete(item._id, item.code)}>
                  <Feather name="trash-2" size={15} color={T.red} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={s.empty}>No coupons created yet.</Text>}
        />
      )}

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Coupon' : 'Create Coupon'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}><Feather name="x" size={20} color={T.muted} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput value={form.code} onChangeText={(value) => setForm((prev: any) => ({ ...prev, code: value }))} placeholder="Coupon code" placeholderTextColor={T.muted} style={s.input} />
              <View style={s.typeRow}>
                {['percentage', 'fixed'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[s.typeBtn, form.type === type && s.typeBtnActive]}
                    onPress={() => setForm((prev: any) => ({ ...prev, type }))}
                  >
                    <Text style={[s.typeText, form.type === type && s.typeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput value={form.value} onChangeText={(value) => setForm((prev: any) => ({ ...prev, value }))} placeholder="Value" placeholderTextColor={T.muted} keyboardType="numeric" style={s.input} />
              <TextInput value={form.minOrderAmount} onChangeText={(value) => setForm((prev: any) => ({ ...prev, minOrderAmount: value }))} placeholder="Minimum order amount" placeholderTextColor={T.muted} keyboardType="numeric" style={s.input} />
              <TextInput value={form.maxDiscount} onChangeText={(value) => setForm((prev: any) => ({ ...prev, maxDiscount: value }))} placeholder="Maximum discount (optional)" placeholderTextColor={T.muted} keyboardType="numeric" style={s.input} />
              <TextInput value={form.usageLimit} onChangeText={(value) => setForm((prev: any) => ({ ...prev, usageLimit: value }))} placeholder="Usage limit (optional)" placeholderTextColor={T.muted} keyboardType="numeric" style={s.input} />
              <TextInput value={form.expiresAt} onChangeText={(value) => setForm((prev: any) => ({ ...prev, expiresAt: value }))} placeholder="Expiry date YYYY-MM-DD" placeholderTextColor={T.muted} style={s.input} />
              <TouchableOpacity style={s.toggle} onPress={() => setForm((prev: any) => ({ ...prev, active: !prev.active }))}>
                <Feather name={form.active ? 'check-square' : 'square'} size={18} color={T.active} />
                <Text style={s.toggleText}>Active</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={T.white} /> : <Text style={s.saveBtnText}>{editingId ? 'Update Coupon' : 'Create Coupon'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: { color: T.text, fontSize: 26, fontWeight: '700' },
  sub: { color: T.muted, marginTop: 4 },
  addBtn: {
    backgroundColor: T.active,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: { color: T.white, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { color: T.text, fontSize: 18, fontWeight: '700' },
  meta: { color: T.muted, marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actions: { gap: 10, justifyContent: 'center' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { color: T.muted, textAlign: 'center', marginTop: 80 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: T.card,
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
  input: {
    backgroundColor: T.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    color: T.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  typeBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: T.active + '22', borderColor: T.active },
  typeText: { color: T.muted, fontWeight: '600' },
  typeTextActive: { color: T.active },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  toggleText: { color: T.text, fontWeight: '600' },
  saveBtn: {
    backgroundColor: T.active,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: T.white, fontWeight: '700' },
});