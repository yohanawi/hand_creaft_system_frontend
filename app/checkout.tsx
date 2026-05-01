import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { getAddresses, initiatePayHerePayment, placeOrder, validateCoupon } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const auth = useProtectedRoute();
    const { items, subtotal, shippingCost, clearCart } = useCart();
    const authUser = auth?.user;

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
    const [paymentMethod, setPaymentMethod] = useState<'payhere' | 'cod'>('payhere');
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
        if (authUser?.email && !form.email) {
            setForm(prev => ({ ...prev, email: authUser.email, fullName: authUser.name ?? '' }));
        }
    }, [authUser, fadeAnim, form.email]);

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
    }, [items.length, router]);

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
                items: items.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                    variantId: item.selectedVariant?.variantId,
                    selectedVariant: item.selectedVariant,
                })),
                shippingAddress: selectedAddressId ? undefined : form,
                addressId: selectedAddressId || undefined,
                paymentMethod,
                customerNote: customerNote.trim() || undefined,
                couponCode: couponDiscount > 0 ? couponCode.trim() : undefined,
            };
            const { data } = await placeOrder(payload);
            const order = data.order;
            await clearCart();

            if (paymentMethod === 'payhere') {
                const returnUrl = Linking.createURL('/payment-success', {
                    queryParams: { orderId: order._id, orderNumber: order.orderNumber },
                });
                const cancelUrl = Linking.createURL('/payment-failure', {
                    queryParams: { orderId: order._id, orderNumber: order.orderNumber },
                });
                const sessionRes = await initiatePayHerePayment({
                    orderId: order._id,
                    returnUrl,
                    cancelUrl,
                });
                const checkoutUrl = sessionRes.data.checkoutUrl;

                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.location.assign(checkoutUrl);
                    return;
                }

                await WebBrowser.openBrowserAsync(checkoutUrl);
                return;
            }

            router.replace(`/payment-success?orderId=${order._id}&orderNumber=${order.orderNumber}&mode=cod` as any);
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

    if (auth.shouldBlock) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#8B4513" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }} className="px-4 py-12 bg-craft-50">
                        <View className="w-full mx-auto max-w-7xl">
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
                                        <View className="p-6 bg-white shadow-md rounded-2xl">
                                            <Text className="mb-5 text-xl font-bold text-gray-900">Shipping Information</Text>

                                            {addresses.length > 0 && (
                                                <View className="mb-6">
                                                    <Text className="mb-2 text-sm font-semibold text-gray-700">Saved Addresses</Text>
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
                                                                    <Text className="font-semibold text-gray-900">{address.label || 'Address'}</Text>
                                                                    {address.isDefault ? <Text className="text-xs font-bold text-green-700">Default</Text> : null}
                                                                </View>
                                                                <Text className="mt-1 text-gray-700">{address.fullName}</Text>
                                                                <Text className="mt-1 text-sm text-gray-500">{address.addressLine1}</Text>
                                                                <Text className="text-sm text-gray-500">{address.city}, {address.state} {address.zipCode}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                        <TouchableOpacity onPress={() => setSelectedAddressId(null)}>
                                                            <Text className="font-semibold text-brown-primary">Use manual address entry instead</Text>
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
                                                    <Text className="mb-1 text-sm font-semibold text-gray-700">{label}</Text>
                                                    <TextInput
                                                        value={form[key as keyof ShippingForm]}
                                                        onChangeText={v => setField(key as keyof ShippingForm, v)}
                                                        placeholder={placeholder}
                                                        keyboardType={kbd as any}
                                                        editable={!selectedAddressId || key === 'email'}
                                                        className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                            ))}

                                            <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-3 mb-4`}>
                                                <View className="flex-1">
                                                    <Text className="mb-1 text-sm font-semibold text-gray-700">City *</Text>
                                                    <TextInput
                                                        value={form.city} onChangeText={v => setField('city', v)}
                                                        placeholder="New York"
                                                        editable={!selectedAddressId}
                                                        className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="mb-1 text-sm font-semibold text-gray-700">State</Text>
                                                    <TextInput
                                                        value={form.state} onChangeText={v => setField('state', v)}
                                                        placeholder="NY"
                                                        editable={!selectedAddressId}
                                                        className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="mb-1 text-sm font-semibold text-gray-700">ZIP *</Text>
                                                    <TextInput
                                                        value={form.zipCode} onChangeText={v => setField('zipCode', v)}
                                                        placeholder="10001" keyboardType="number-pad"
                                                        editable={!selectedAddressId}
                                                        className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                </View>
                                            </View>

                                            <View className="mb-6">
                                                <Text className="mb-1 text-sm font-semibold text-gray-700">Country</Text>
                                                <TextInput
                                                    value={form.country} onChangeText={v => setField('country', v)}
                                                    placeholder="United States"
                                                    editable={!selectedAddressId}
                                                    className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                    placeholderTextColor="#aaa"
                                                />
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => validateStep1() && setStep(2)}
                                                className="flex-row items-center justify-center py-4 bg-brown-primary rounded-xl"
                                                activeOpacity={0.85}
                                            >
                                                <Text className="mr-2 text-base font-bold text-white">Continue to Payment</Text>
                                                <Feather name="arrow-right" size={18} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* STEP 2 — Payment */}
                                    {step === 2 && (
                                        <View className="p-6 bg-white shadow-md rounded-2xl">
                                            <Text className="mb-5 text-xl font-bold text-gray-900">Payment Method</Text>

                                            {([
                                                { id: 'payhere', icon: 'shield', label: 'PayHere Secure Payment' },
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
                                                    <Text className="ml-3 font-semibold text-gray-900">{opt.label}</Text>
                                                </TouchableOpacity>
                                            ))}

                                            {paymentMethod === 'payhere' && (
                                                <View className="p-4 mt-2 mb-4 bg-craft-50 rounded-xl">
                                                    <View className="flex-row items-center mb-3">
                                                        <Feather name="lock" size={14} color="#10B981" />
                                                        <Text className="ml-1 text-xs font-semibold text-green-600">
                                                            Redirects to PayHere for secure card and wallet payments
                                                        </Text>
                                                    </View>
                                                    <Text className="text-sm leading-6 text-gray-600">
                                                        You will be redirected to PayHere after order creation. The order will stay in awaiting payment until PayHere confirms the payment on the backend.
                                                    </Text>
                                                </View>
                                            )}

                                            {paymentMethod === 'cod' && (
                                                <View className="flex-row items-start p-4 mt-2 mb-4 bg-amber-50 rounded-xl">
                                                    <Feather name="info" size={16} color="#D97706" />
                                                    <Text className="flex-1 ml-2 text-xs text-amber-700">
                                                        Pay with cash when your order is delivered. Our courier will collect payment at the door.
                                                    </Text>
                                                </View>
                                            )}

                                            <View className="mb-5">
                                                <Text className="mb-1 text-sm font-semibold text-gray-700">Order Note (optional)</Text>
                                                <TextInput
                                                    value={customerNote} onChangeText={setCustomerNote}
                                                    placeholder="Any special instructions..."
                                                    multiline numberOfLines={3}
                                                    className="px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                    placeholderTextColor="#aaa"
                                                    style={{ minHeight: 72, textAlignVertical: 'top' }}
                                                />
                                            </View>

                                            <View className="mb-5">
                                                <Text className="mb-1 text-sm font-semibold text-gray-700">Coupon Code</Text>
                                                <View className="flex-row gap-3">
                                                    <TextInput
                                                        value={couponCode}
                                                        onChangeText={setCouponCode}
                                                        placeholder="Enter coupon code"
                                                        autoCapitalize="characters"
                                                        className="flex-1 px-4 py-3 text-base border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                    <TouchableOpacity onPress={handleApplyCoupon} className="items-center justify-center px-4 bg-brown-primary rounded-xl" disabled={couponLoading}>
                                                        {couponLoading ? <ActivityIndicator color="#fff" /> : <Text className="font-bold text-white">Apply</Text>}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View className="flex-row gap-3">
                                                <TouchableOpacity onPress={() => setStep(1)}
                                                    className="items-center flex-1 py-4 border border-brown-primary rounded-xl">
                                                    <Text className="font-bold text-brown-primary">Back</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setStep(3)}
                                                    className="items-center flex-1 py-4 bg-brown-primary rounded-xl">
                                                    <Text className="font-bold text-white">Review Order</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {/* STEP 3 — Review */}
                                    {step === 3 && (
                                        <View className="p-6 bg-white shadow-md rounded-2xl">
                                            <Text className="mb-5 text-xl font-bold text-gray-900">Review Your Order</Text>

                                            {/* Shipping summary */}
                                            <View className="mb-5">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-sm font-bold text-gray-700">Shipping To</Text>
                                                    <TouchableOpacity onPress={() => setStep(1)}>
                                                        <Text className="text-xs font-semibold text-brown-primary">Edit</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="p-4 bg-craft-50 rounded-xl">
                                                    <Text className="font-semibold text-gray-900">{form.fullName}</Text>
                                                    <Text className="mt-1 text-sm text-gray-600">{form.address}</Text>
                                                    <Text className="text-sm text-gray-600">{form.city}, {form.state} {form.zipCode}</Text>
                                                    <Text className="text-sm text-gray-600">{form.country}</Text>
                                                    <Text className="mt-1 text-sm text-gray-600">{form.phone}</Text>
                                                </View>
                                            </View>

                                            {/* Payment summary */}
                                            <View className="mb-5">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-sm font-bold text-gray-700">Payment Method</Text>
                                                    <TouchableOpacity onPress={() => setStep(2)}>
                                                        <Text className="text-xs font-semibold text-brown-primary">Edit</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="flex-row items-center p-4 bg-craft-50 rounded-xl">
                                                    <Feather
                                                        name={paymentMethod === 'payhere' ? 'shield' : 'package'}
                                                        size={20} color="#8B4513"
                                                    />
                                                    <Text className="ml-3 font-semibold text-gray-900">
                                                        {paymentMethod === 'payhere' ? 'PayHere Secure Payment' : 'Cash on Delivery'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {customerNote.trim() && (
                                                <View className="mb-5">
                                                    <Text className="mb-2 text-sm font-bold text-gray-700">Order Note</Text>
                                                    <View className="p-4 bg-craft-50 rounded-xl">
                                                        <Text className="text-sm text-gray-600">{customerNote}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            {couponDiscount > 0 && (
                                                <View className="mb-5">
                                                    <Text className="mb-2 text-sm font-bold text-gray-700">Coupon</Text>
                                                    <View className="flex-row items-center justify-between p-4 bg-green-50 rounded-xl">
                                                        <Text className="font-semibold text-green-800">{couponCode.toUpperCase()}</Text>
                                                        <Text className="font-bold text-green-800">-${couponDiscount.toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            <View className="flex-row gap-3">
                                                <TouchableOpacity onPress={() => setStep(2)}
                                                    className="items-center flex-1 py-4 border border-brown-primary rounded-xl">
                                                    <Text className="font-bold text-brown-primary">Back</Text>
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
                                                            <Text className="mr-2 font-bold text-white">Place Order</Text>
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
                                    <View className="p-6 bg-white shadow-md rounded-2xl">
                                        <Text className="mb-4 text-lg font-bold text-gray-900">Order Summary</Text>

                                        {items.map(item => (
                                            <View key={`${item.product}:${item.selectedVariant?.variantId || 'base'}`} className="flex-row justify-between pb-3 mb-3 border-b border-gray-100">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>{item.name}</Text>
                                                    {item.selectedVariant?.label ? (
                                                        <Text className="text-brown-primary text-xs mt-0.5 font-semibold">{item.selectedVariant.label}</Text>
                                                    ) : null}
                                                    <Text className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</Text>
                                                </View>
                                                <Text className="text-sm font-semibold text-gray-800">
                                                    ${(unitPrice(item) * item.quantity).toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}

                                        <View className="mt-2 gap-y-2">
                                            <View className="mb-2">
                                                <Text className="mb-2 text-sm text-gray-500">Promo Code</Text>
                                                <View className="flex-row gap-2">
                                                    <TextInput
                                                        value={couponCode}
                                                        onChangeText={setCouponCode}
                                                        placeholder="Coupon code"
                                                        autoCapitalize="characters"
                                                        className="flex-1 px-3 py-3 text-sm border border-gray-200 bg-craft-50 rounded-xl"
                                                        placeholderTextColor="#aaa"
                                                    />
                                                    <TouchableOpacity onPress={handleApplyCoupon} className="items-center justify-center px-4 bg-brown-primary rounded-xl" disabled={couponLoading}>
                                                        {couponLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-sm font-bold text-white">Apply</Text>}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-gray-500">Subtotal</Text>
                                                <Text className="text-sm font-semibold text-gray-800">${subtotal.toFixed(2)}</Text>
                                            </View>
                                            {couponDiscount > 0 && (
                                                <View className="flex-row justify-between">
                                                    <Text className="text-sm text-green-700">Discount</Text>
                                                    <Text className="text-sm font-semibold text-green-700">-${couponDiscount.toFixed(2)}</Text>
                                                </View>
                                            )}
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-gray-500">Shipping</Text>
                                                <Text className="text-sm font-semibold text-gray-800">
                                                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                                                </Text>
                                            </View>
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-gray-500">Tax (10%)</Text>
                                                <Text className="text-sm font-semibold text-gray-800">${recalculatedTax.toFixed(2)}</Text>
                                            </View>
                                            <View className="flex-row justify-between pt-3 mt-1 border-t border-gray-100">
                                                <Text className="font-bold text-gray-900">Total</Text>
                                                <Text className="text-lg font-extrabold text-brown-primary">${recalculatedTotal.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}
