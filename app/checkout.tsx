import PageShell from '@/components/PageShell';
import AuthContext from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getAddresses, placeOrder, validateCoupon } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ShippingForm = {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

const EMPTY_FORM: ShippingForm = {
    fullName: '', email: '', phone: '',
    address: '', city: '', state: '',
    zipCode: '', country: 'United States',
};

export default function CheckoutScreen() {
    const router = useRouter();
    const auth = useContext(AuthContext);
    const { items, subtotal, shippingCost, tax, total, clearCart } = useCart();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cod'>('card');
    const [customerNote, setCustomerNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);

    const isMobile = SCREEN_WIDTH < 768;
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
        // Pre-fill from auth user
        if (auth?.user?.email && !form.email) {
            setForm(prev => ({ ...prev, email: auth.user!.email, fullName: auth.user!.name ?? '' }));
        }
    }, []);

    useEffect(() => {
        if (!auth?.userToken) return;

        (async () => {
            try {
                const { data } = await getAddresses();
                const nextAddresses = data || [];
                setAddresses(nextAddresses);
                const defaultAddress = nextAddresses.find((address: any) => address.isDefault) || nextAddresses[0];
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress._id);
                    setForm((prev) => ({
                        ...prev,
                        fullName: defaultAddress.fullName || prev.fullName,
                        phone: defaultAddress.phone || prev.phone,
                        address: defaultAddress.addressLine1 || prev.address,
                        city: defaultAddress.city || prev.city,
                        state: defaultAddress.state || prev.state,
                        zipCode: defaultAddress.zipCode || prev.zipCode,
                        country: defaultAddress.country || prev.country,
                    }));
                }
            } catch {
                setAddresses([]);
            }
        })();
    }, [auth?.userToken]);

    // Guard: cart must have items
    useEffect(() => {
        if (items.length === 0) router.replace('/cart' as any);
    }, [items]);

    const setField = (key: keyof ShippingForm, val: string) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const validateStep1 = () => {
        if (selectedAddressId) return true;

        const { fullName, email, phone, address, city, zipCode } = form;
        if (!fullName || !email || !phone || !address || !city || !zipCode) {
            Alert.alert('Required Fields', 'Please fill in all required shipping fields.');
            return false;
        }
        return true;
    };

    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    const recalculatedTax = parseFloat((discountedSubtotal * 0.1).toFixed(2));
    const recalculatedTotal = parseFloat((discountedSubtotal + shippingCost + recalculatedTax).toFixed(2));

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Alert.alert('Coupon', 'Enter a coupon code first.');
            return;
        }

        setCouponLoading(true);
        try {
            const { data } = await validateCoupon({ code: couponCode.trim(), subtotal });
            setCouponDiscount(Number(data.discount || 0));
            setCouponCode(String(data.coupon?.code || couponCode).trim());
            Alert.alert('Coupon Applied', `Discount applied: $${Number(data.discount || 0).toFixed(2)}`);
        } catch (err: any) {
            setCouponDiscount(0);
            Alert.alert('Coupon Error', err?.response?.data?.message ?? 'Failed to validate coupon.');
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!auth?.userToken) {
            Alert.alert('Sign In Required', 'Please log in to place an order.', [
                { text: 'Log In', onPress: () => router.push('/login' as any) },
                { text: 'Cancel', style: 'cancel' },
            ]);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: items.map(i => ({ product: i.product, quantity: i.quantity })),
                shippingAddress: selectedAddressId ? undefined : form,
                addressId: selectedAddressId || undefined,
                paymentMethod,
                customerNote: customerNote.trim() || undefined,
                couponCode: couponDiscount > 0 ? couponCode.trim() : undefined,
            };
            const { data } = await placeOrder(payload);
            clearCart();
            router.replace(`/order-tracking?orderNumber=${data.order.orderNumber}` as any);
        } catch (err: any) {
            Alert.alert('Order Failed', err?.response?.data?.message ?? 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { n: 1, title: 'Shipping', icon: 'truck' },
        { n: 2, title: 'Payment', icon: 'credit-card' },
        { n: 3, title: 'Review', icon: 'check-circle' },
    ] as const;

    const unitPrice = (item: (typeof items)[number]) =>
        item.salePrice !== null && item.salePrice < item.price ? item.salePrice : item.price;

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <PageShell>
                    <Animated.View style={{ opacity: fadeAnim }} className="py-12 px-4 bg-craft-50">
                        <View className="max-w-7xl mx-auto w-full">
                            {/* Heading */}
                            <Text className={`text-brown-primary font-bold mb-8 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                                Checkout
                            </Text>

                            {/* Step indicator */}
                            <View className="flex-row items-center justify-center mb-10">
                                {steps.map((s, idx) => (
                                    <React.Fragment key={s.n}>
                                        <View className="items-center">
                                            <View className={`w-12 h-12 rounded-full items-center justify-center ${step >= s.n ? 'bg-brown-primary' : 'bg-craft-200'}`}>
                                                <Feather name={s.icon} size={20} color={step >= s.n ? '#fff' : '#8B7355'} />
                                            </View>
                                            <Text className={`text-xs mt-1 font-semibold ${step >= s.n ? 'text-brown-primary' : 'text-gray-400'}`}>
                                                {s.title}
                                            </Text>
                                        </View>
                                        {idx < steps.length - 1 && (
                                            <View className={`flex-1 h-1 mx-2 mb-4 rounded-full ${step > s.n ? 'bg-brown-primary' : 'bg-craft-200'}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>

                            <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
                                {/* ── STEP FORMS ─────────────────────────────────── */}
                                <View className={isMobile ? 'w-full' : 'flex-1'}>

                                    {/* STEP 1 — Shipping */}
                                    {step === 1 && (
                                        <View className="bg-white rounded-2xl p-6 shadow-md">
                                            <Text className="text-gray-900 text-xl font-bold mb-5">Shipping Information</Text>

                                            {addresses.length > 0 && (
                                                <View className="mb-6">
                                                    <Text className="text-gray-700 font-semibold mb-2 text-sm">Saved Addresses</Text>
                                                    <View className="gap-3">
                                                        {addresses.map((address: any) => (
                                                            <TouchableOpacity
                                                                key={address._id}
                                                                onPress={() => {
                                                                    setSelectedAddressId(address._id);
                                                                    setForm(prev => ({
                                                                        ...prev,
                                                                        fullName: address.fullName || prev.fullName,
                                                                        phone: address.phone || prev.phone,
                                                                        address: address.addressLine1 || prev.address,
                                                                        city: address.city || prev.city,
                                                                        state: address.state || prev.state,
                                                                        zipCode: address.zipCode || prev.zipCode,
                                                                        country: address.country || prev.country,
                                                                    }));
                                                                }}
                                                                className={`rounded-xl border p-4 ${selectedAddressId === address._id ? 'border-brown-primary bg-craft-50' : 'border-gray-200 bg-white'}`}
                                                            >
                                                                <View className="flex-row items-center justify-between">
                                                                    <Text className="text-gray-900 font-semibold">{address.label || 'Address'}</Text>
                                                                    {address.isDefault ? <Text className="text-green-700 text-xs font-bold">Default</Text> : null}
                                                                </View>
                                                                <Text className="text-gray-700 mt-1">{address.fullName}</Text>
                                                                <Text className="text-gray-500 text-sm mt-1">{address.addressLine1}</Text>
                                                                <Text className="text-gray-500 text-sm">{address.city}, {address.state} {address.zipCode}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                        <TouchableOpacity onPress={() => setSelectedAddressId(null)}>
                                                            <Text className="text-brown-primary font-semibold">Use manual address entry instead</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}

                                            {[
                                                { label: 'Full Name *', key: 'fullName', placeholder: 'Jane Smith' },
                                                { label: 'Email Address *', key: 'email', placeholder: 'jane@example.com', kbd: 'email-address' },
                                                { label: 'Phone Number *', key: 'phone', placeholder: '+1 (555) 000-0000', kbd: 'phone-pad' },
                                                { label: 'Street Address *', key: 'address', placeholder: '123 Main St, Apt 4B' },
                                            ].map(({ label, key, placeholder, kbd }) => (
                                                <View key={key} className="mb-4">
                                                    <Text className="text-gray-700 font-semibold mb-1 text-sm">{label}</Text>
                                                    <TextInput
                                                        value={form[key as keyof ShippingForm]}
                                                        onChangeText={v => setField(key as keyof ShippingForm, v)}
                                                        placeholder={placeholder}
                                                        keyboardType={kbd as any}
                                                        editable={!selectedAddressId || key === 'email'}
                                                        className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                            ))}

                                            <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-3 mb-4`}>
                                                <View className="flex-1">
                                                    <Text className="text-gray-700 font-semibold mb-1 text-sm">City *</Text>
                                                    <TextInput
                                                        value={form.city} onChangeText={v => setField('city', v)}
                                                        placeholder="New York"
                                                        editable={!selectedAddressId}
                                                        className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-gray-700 font-semibold mb-1 text-sm">State</Text>
                                                    <TextInput
                                                        value={form.state} onChangeText={v => setField('state', v)}
                                                        placeholder="NY"
                                                        editable={!selectedAddressId}
                                                        className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-gray-700 font-semibold mb-1 text-sm">ZIP *</Text>
                                                    <TextInput
                                                        value={form.zipCode} onChangeText={v => setField('zipCode', v)}
                                                        placeholder="10001" keyboardType="number-pad"
                                                        editable={!selectedAddressId}
                                                        className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                            </View>

                                            <View className="mb-6">
                                                <Text className="text-gray-700 font-semibold mb-1 text-sm">Country</Text>
                                                <TextInput
                                                    value={form.country} onChangeText={v => setField('country', v)}
                                                    placeholder="United States"
                                                    editable={!selectedAddressId}
                                                    className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                    placeholderTextColor="#aaa"
                                                />
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => validateStep1() && setStep(2)}
                                                className="bg-brown-primary rounded-xl py-4 flex-row items-center justify-center"
                                                activeOpacity={0.85}
                                            >
                                                <Text className="text-white font-bold text-base mr-2">Continue to Payment</Text>
                                                <Feather name="arrow-right" size={18} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* STEP 2 — Payment */}
                                    {step === 2 && (
                                        <View className="bg-white rounded-2xl p-6 shadow-md">
                                            <Text className="text-gray-900 text-xl font-bold mb-5">Payment Method</Text>

                                            {([
                                                { id: 'card', icon: 'credit-card', label: 'Credit / Debit Card' },
                                                { id: 'paypal', icon: 'dollar-sign', label: 'PayPal' },
                                                { id: 'cod', icon: 'package', label: 'Cash on Delivery' },
                                            ] as const).map(opt => (
                                                <TouchableOpacity
                                                    key={opt.id}
                                                    onPress={() => setPaymentMethod(opt.id)}
                                                    className={`flex-row items-center p-4 rounded-xl mb-3 border-2 ${paymentMethod === opt.id ? 'border-brown-primary bg-craft-50' : 'border-gray-200'}`}
                                                    activeOpacity={0.8}
                                                >
                                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${paymentMethod === opt.id ? 'border-brown-primary' : 'border-gray-300'}`}>
                                                        {paymentMethod === opt.id && (
                                                            <View className="w-2.5 h-2.5 rounded-full bg-brown-primary" />
                                                        )}
                                                    </View>
                                                    <Feather name={opt.icon} size={22} color="#8B4513" />
                                                    <Text className="text-gray-900 font-semibold ml-3">{opt.label}</Text>
                                                </TouchableOpacity>
                                            ))}

                                            {paymentMethod === 'card' && (
                                                <View className="bg-craft-50 rounded-xl p-4 mt-2 mb-4">
                                                    <View className="flex-row items-center mb-3">
                                                        <Feather name="lock" size={14} color="#10B981" />
                                                        <Text className="text-green-600 text-xs ml-1 font-semibold">
                                                            256-bit SSL encrypted
                                                        </Text>
                                                    </View>
                                                    <TextInput placeholder="1234  5678  9012  3456" keyboardType="number-pad"
                                                        className="bg-white rounded-xl px-4 py-3 text-base border border-gray-200 mb-3"
                                                        placeholderTextColor="#aaa" />
                                                    <TextInput placeholder="Cardholder Name"
                                                        className="bg-white rounded-xl px-4 py-3 text-base border border-gray-200 mb-3"
                                                        placeholderTextColor="#aaa" />
                                                    <View className="flex-row gap-3">
                                                        <TextInput placeholder="MM / YY"
                                                            className="flex-1 bg-white rounded-xl px-4 py-3 text-base border border-gray-200"
                                                            placeholderTextColor="#aaa" />
                                                        <TextInput placeholder="CVV" keyboardType="number-pad" secureTextEntry
                                                            className="w-24 bg-white rounded-xl px-4 py-3 text-base border border-gray-200"
                                                            placeholderTextColor="#aaa" />
                                                    </View>
                                                </View>
                                            )}

                                            {paymentMethod === 'cod' && (
                                                <View className="bg-amber-50 rounded-xl p-4 mt-2 mb-4 flex-row items-start">
                                                    <Feather name="info" size={16} color="#D97706" />
                                                    <Text className="text-amber-700 text-xs ml-2 flex-1">
                                                        Pay with cash when your order is delivered. Our courier will collect payment at the door.
                                                    </Text>
                                                </View>
                                            )}

                                            <View className="mb-5">
                                                <Text className="text-gray-700 font-semibold mb-1 text-sm">Order Note (optional)</Text>
                                                <TextInput
                                                    value={customerNote} onChangeText={setCustomerNote}
                                                    placeholder="Any special instructions..."
                                                    multiline numberOfLines={3}
                                                    className="bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                    placeholderTextColor="#aaa"
                                                    style={{ minHeight: 72, textAlignVertical: 'top' }}
                                                />
                                            </View>

                                            <View className="mb-5">
                                                <Text className="text-gray-700 font-semibold mb-1 text-sm">Coupon Code</Text>
                                                <View className="flex-row gap-3">
                                                    <TextInput
                                                        value={couponCode}
                                                        onChangeText={setCouponCode}
                                                        placeholder="Enter coupon code"
                                                        autoCapitalize="characters"
                                                        className="flex-1 bg-craft-50 rounded-xl px-4 py-3 text-base border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                    <TouchableOpacity onPress={handleApplyCoupon} className="bg-brown-primary rounded-xl px-4 items-center justify-center" disabled={couponLoading}>
                                                        {couponLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Apply</Text>}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View className="flex-row gap-3">
                                                <TouchableOpacity onPress={() => setStep(1)}
                                                    className="flex-1 border border-brown-primary rounded-xl py-4 items-center">
                                                    <Text className="text-brown-primary font-bold">Back</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setStep(3)}
                                                    className="flex-1 bg-brown-primary rounded-xl py-4 items-center">
                                                    <Text className="text-white font-bold">Review Order</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {/* STEP 3 — Review */}
                                    {step === 3 && (
                                        <View className="bg-white rounded-2xl p-6 shadow-md">
                                            <Text className="text-gray-900 text-xl font-bold mb-5">Review Your Order</Text>

                                            {/* Shipping summary */}
                                            <View className="mb-5">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-gray-700 font-bold text-sm">Shipping To</Text>
                                                    <TouchableOpacity onPress={() => setStep(1)}>
                                                        <Text className="text-brown-primary text-xs font-semibold">Edit</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="bg-craft-50 rounded-xl p-4">
                                                    <Text className="text-gray-900 font-semibold">{form.fullName}</Text>
                                                    <Text className="text-gray-600 text-sm mt-1">{form.address}</Text>
                                                    <Text className="text-gray-600 text-sm">{form.city}, {form.state} {form.zipCode}</Text>
                                                    <Text className="text-gray-600 text-sm">{form.country}</Text>
                                                    <Text className="text-gray-600 text-sm mt-1">{form.phone}</Text>
                                                </View>
                                            </View>

                                            {/* Payment summary */}
                                            <View className="mb-5">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-gray-700 font-bold text-sm">Payment Method</Text>
                                                    <TouchableOpacity onPress={() => setStep(2)}>
                                                        <Text className="text-brown-primary text-xs font-semibold">Edit</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="bg-craft-50 rounded-xl p-4 flex-row items-center">
                                                    <Feather
                                                        name={paymentMethod === 'card' ? 'credit-card' : paymentMethod === 'paypal' ? 'dollar-sign' : 'package'}
                                                        size={20} color="#8B4513"
                                                    />
                                                    <Text className="text-gray-900 ml-3 font-semibold">
                                                        {paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {customerNote.trim() && (
                                                <View className="mb-5">
                                                    <Text className="text-gray-700 font-bold text-sm mb-2">Order Note</Text>
                                                    <View className="bg-craft-50 rounded-xl p-4">
                                                        <Text className="text-gray-600 text-sm">{customerNote}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            {couponDiscount > 0 && (
                                                <View className="mb-5">
                                                    <Text className="text-gray-700 font-bold text-sm mb-2">Coupon</Text>
                                                    <View className="bg-green-50 rounded-xl p-4 flex-row items-center justify-between">
                                                        <Text className="text-green-800 font-semibold">{couponCode.toUpperCase()}</Text>
                                                        <Text className="text-green-800 font-bold">-${couponDiscount.toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            <View className="flex-row gap-3">
                                                <TouchableOpacity onPress={() => setStep(2)}
                                                    className="flex-1 border border-brown-primary rounded-xl py-4 items-center">
                                                    <Text className="text-brown-primary font-bold">Back</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handlePlaceOrder}
                                                    disabled={loading}
                                                    className={`flex-2 flex-1 rounded-xl py-4 items-center justify-center flex-row ${loading ? 'bg-gray-300' : 'bg-brown-primary'}`}
                                                    style={{ flexGrow: 1.5 }}
                                                    activeOpacity={0.85}
                                                >
                                                    {loading ? (
                                                        <ActivityIndicator color="#fff" size="small" />
                                                    ) : (
                                                        <>
                                                            <Text className="text-white font-bold mr-2">Place Order</Text>
                                                            <Feather name="check" size={18} color="#fff" />
                                                        </>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* ── ORDER SUMMARY SIDEBAR ────────────────────── */}
                                <View className={isMobile ? 'w-full' : 'w-80'}>
                                    <View className="bg-white rounded-2xl p-6 shadow-md">
                                        <Text className="text-gray-900 text-lg font-bold mb-4">Order Summary</Text>

                                        {items.map(item => (
                                            <View key={item.product} className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
                                                    <Text className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</Text>
                                                </View>
                                                <Text className="text-gray-800 font-semibold text-sm">
                                                    ${(unitPrice(item) * item.quantity).toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}

                                        <View className="mt-2 gap-y-2">
                                            <View className="mb-2">
                                                <Text className="text-gray-500 text-sm mb-2">Promo Code</Text>
                                                <View className="flex-row gap-2">
                                                    <TextInput
                                                        value={couponCode}
                                                        onChangeText={setCouponCode}
                                                        placeholder="Coupon code"
                                                        autoCapitalize="characters"
                                                        className="flex-1 bg-craft-50 rounded-xl px-3 py-3 text-sm border border-gray-200"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                    <TouchableOpacity onPress={handleApplyCoupon} className="bg-brown-primary rounded-xl px-4 items-center justify-center" disabled={couponLoading}>
                                                        {couponLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-white font-bold text-sm">Apply</Text>}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View className="flex-row justify-between">
                                                <Text className="text-gray-500 text-sm">Subtotal</Text>
                                                <Text className="text-gray-800 font-semibold text-sm">${subtotal.toFixed(2)}</Text>
                                            </View>
                                            {couponDiscount > 0 && (
                                                <View className="flex-row justify-between">
                                                    <Text className="text-green-700 text-sm">Discount</Text>
                                                    <Text className="text-green-700 font-semibold text-sm">-${couponDiscount.toFixed(2)}</Text>
                                                </View>
                                            )}
                                            <View className="flex-row justify-between">
                                                <Text className="text-gray-500 text-sm">Shipping</Text>
                                                <Text className="text-gray-800 font-semibold text-sm">
                                                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                                                </Text>
                                            </View>
                                            <View className="flex-row justify-between">
                                                <Text className="text-gray-500 text-sm">Tax (10%)</Text>
                                                <Text className="text-gray-800 font-semibold text-sm">${recalculatedTax.toFixed(2)}</Text>
                                            </View>
                                            <View className="flex-row justify-between pt-3 mt-1 border-t border-gray-100">
                                                <Text className="text-gray-900 font-bold">Total</Text>
                                                <Text className="text-brown-primary font-extrabold text-lg">${recalculatedTotal.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </ScrollView>
        </View>
    );
}
