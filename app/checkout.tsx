import {
    CheckoutStep,
    EMPTY_FORM,
    PaymentMethod,
    ShippingForm,
} from '@/components/Checkout/checkout.types';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import OrderSummary from '@/components/Checkout/OrderSummary';
import PaymentStep from '@/components/Checkout/PaymentStep';
import ReviewStep from '@/components/Checkout/ReviewStep';
import ShippingStep from '@/components/Checkout/ShippingStep';
import PageShell from '@/components/PageShell';
import { useCart } from '@/context/CartContext';
import useHeaderScroll from '@/hooks/useHeaderScroll';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import {
    getAddresses,
    getPayHereStatus,
    initiatePayHerePayment,
    placeOrder,
    validateCoupon,
} from '@/services/api';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CheckoutScreen() {
    const { scrollY, onScroll } = useHeaderScroll();
    const router = useRouter();
    const auth = useProtectedRoute();
    const { items, subtotal, shippingCost, clearCart } = useCart();

    const [step, setStep] = useState<CheckoutStep>(1);
    const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [customerNote, setCustomerNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [payHereAvailable, setPayHereAvailable] = useState(false);
    const [payHereMessage, setPayHereMessage] = useState('');

    const skipEmptyCartRedirectRef = useRef(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const isMobile = SCREEN_WIDTH < 768;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        if (auth?.user?.email && !form.email) {
            setForm(prev => ({
                ...prev,
                email: auth.user.email,
                fullName: auth.user.name ?? '',
            }));
        }
    }, [auth?.user, fadeAnim, form.email]);

    useEffect(() => {
        if (!auth?.userToken) return;

        async function loadAddresses() {
            try {
                const { data } = await getAddresses();
                const nextAddresses = data || [];
                setAddresses(nextAddresses);

                const defaultAddress =
                    nextAddresses.find((address: any) => address.isDefault) ||
                    nextAddresses[0];

                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress._id);
                    setForm(prev => ({
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
        }

        loadAddresses();
    }, [auth?.userToken]);

    useEffect(() => {
        let mounted = true;

        async function checkPayHere() {
            try {
                const { data } = await getPayHereStatus();
                if (!mounted) return;

                const available = Boolean(data?.available);
                setPayHereAvailable(available);
                setPayHereMessage(String(data?.message || '').trim());

                if (!available) {
                    setPaymentMethod('cod');
                }
            } catch {
                if (!mounted) return;
                setPayHereAvailable(false);
                setPayHereMessage('Online card payment is currently unavailable.');
                setPaymentMethod('cod');
            }
        }

        checkPayHere();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (items.length === 0 && !loading && !skipEmptyCartRedirectRef.current) {
            router.replace('/cart' as any);
        }
    }, [items.length, loading, router]);

    const setField = (key: keyof ShippingForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const validateShipping = () => {
        if (selectedAddressId) return true;

        const { fullName, email, phone, address, city, zipCode } = form;

        if (!fullName || !email || !phone || !address || !city || !zipCode) {
            Alert.alert('Required Fields', 'Please fill in all required shipping fields.');
            return false;
        }

        return true;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Alert.alert('Coupon', 'Enter a coupon code first.');
            return;
        }

        setCouponLoading(true);

        try {
            const { data } = await validateCoupon({
                code: couponCode.trim(),
                subtotal,
            });

            setCouponDiscount(Number(data.discount || 0));
            setCouponCode(String(data.coupon?.code || couponCode).trim());

            Alert.alert(
                'Coupon Applied',
                `Discount applied: $${Number(data.discount || 0).toFixed(2)}`
            );
        } catch (err: any) {
            setCouponDiscount(0);
            Alert.alert(
                'Coupon Error',
                err?.response?.data?.message ?? 'Failed to validate coupon.'
            );
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

        if (paymentMethod === 'payhere' && !payHereAvailable) {
            Alert.alert(
                'PayHere Unavailable',
                payHereMessage || 'Online payment is currently unavailable.'
            );
            setPaymentMethod('cod');
            setStep(2);
            return;
        }

        setLoading(true);
        let createdOrder: any = null;

        try {
            const payload = {
                items: items.map(item => ({
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
            createdOrder = data.order;

            if (paymentMethod === 'payhere') {
                const returnUrl = Linking.createURL('/payment-success', {
                    queryParams: {
                        orderId: createdOrder._id,
                        orderNumber: createdOrder.orderNumber,
                    },
                });

                const cancelUrl = Linking.createURL('/payment-failure', {
                    queryParams: {
                        orderId: createdOrder._id,
                        orderNumber: createdOrder.orderNumber,
                    },
                });

                const sessionRes = await initiatePayHerePayment({
                    orderId: createdOrder._id,
                    returnUrl,
                    cancelUrl,
                });

                const checkoutUrl = sessionRes.data.checkoutUrl;

                skipEmptyCartRedirectRef.current = true;
                await clearCart();

                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.location.assign(checkoutUrl);
                    return;
                }

                await WebBrowser.openBrowserAsync(checkoutUrl);
                return;
            }

            skipEmptyCartRedirectRef.current = true;
            await clearCart();

            router.replace(
                `/payment-success?orderId=${createdOrder._id}&orderNumber=${createdOrder.orderNumber}&mode=cod` as any
            );
        } catch (err: any) {
            if (paymentMethod === 'payhere' && createdOrder?._id) {
                skipEmptyCartRedirectRef.current = true;
                await clearCart();

                Alert.alert(
                    'Payment Setup Failed',
                    err?.response?.data?.message ??
                    'Your order was created, but PayHere session could not be started.',
                    [
                        {
                            text: 'Open Order',
                            onPress: () =>
                                router.replace(`/payment-failure?orderId=${createdOrder._id}` as any),
                        },
                    ]
                );

                return;
            }

            Alert.alert(
                'Order Failed',
                err?.response?.data?.message ?? 'Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (auth.shouldBlock) {
        return (
            <View className="flex-1 items-center justify-center bg-[#FFF9F3]">
                <ActivityIndicator size="large" color="#7A3E1D" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#FFF9F3]">
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <PageShell scrollY={scrollY}>
                    <Animated.View style={{ opacity: fadeAnim }} className="px-4 py-10">
                        <View className="w-full py-20 mx-auto max-w-7xl">
                            <View className="mb-8">
                                <Text className="text-sm font-black uppercase tracking-[3px] text-[#B87333]">
                                    Secure Checkout
                                </Text>

                                <Text
                                    className={`mt-2 font-black text-[#2E1B12] ${isMobile ? 'text-4xl' : 'text-6xl'
                                        }`}
                                >
                                    Complete Your Order
                                </Text>

                                <Text className="mt-3 max-w-2xl text-base leading-7 text-[#8B7355]">
                                    Review your handmade jewelry pieces, add delivery details and
                                    choose your preferred payment method.
                                </Text>
                            </View>

                            <CheckoutSteps step={step} />

                            <View className={`${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
                                <View className={isMobile ? 'w-full' : 'flex-1'}>
                                    {step === 1 && (
                                        <ShippingStep
                                            form={form}
                                            addresses={addresses}
                                            selectedAddressId={selectedAddressId}
                                            setSelectedAddressId={setSelectedAddressId}
                                            setField={setField}
                                            setForm={setForm}
                                            onNext={() => validateShipping() && setStep(2)}
                                        />
                                    )}

                                    {step === 2 && (
                                        <PaymentStep
                                            paymentMethod={paymentMethod}
                                            setPaymentMethod={setPaymentMethod}
                                            payHereAvailable={payHereAvailable}
                                            payHereMessage={payHereMessage}
                                            customerNote={customerNote}
                                            setCustomerNote={setCustomerNote}
                                            couponCode={couponCode}
                                            setCouponCode={setCouponCode}
                                            couponLoading={couponLoading}
                                            handleApplyCoupon={handleApplyCoupon}
                                            onBack={() => setStep(1)}
                                            onNext={() => setStep(3)}
                                        />
                                    )}

                                    {step === 3 && (
                                        <ReviewStep
                                            form={form}
                                            paymentMethod={paymentMethod}
                                            customerNote={customerNote}
                                            couponCode={couponCode}
                                            couponDiscount={couponDiscount}
                                            loading={loading}
                                            onEditShipping={() => setStep(1)}
                                            onEditPayment={() => setStep(2)}
                                            onBack={() => setStep(2)}
                                            onPlaceOrder={handlePlaceOrder}
                                        />
                                    )}
                                </View>

                                <View className={isMobile ? 'w-full' : 'w-[360px]'}>
                                    <OrderSummary
                                        items={items}
                                        subtotal={subtotal}
                                        shippingCost={shippingCost}
                                        couponCode={couponCode}
                                        setCouponCode={setCouponCode}
                                        couponDiscount={couponDiscount}
                                        couponLoading={couponLoading}
                                        handleApplyCoupon={handleApplyCoupon}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </PageShell>
            </Animated.ScrollView>
        </View>
    );
}