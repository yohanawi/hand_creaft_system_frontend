import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import CheckoutCard from './CheckoutCard';
import { ShippingForm } from './checkout.types';

type Props = {
    form: ShippingForm;
    addresses: any[];
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string | null) => void;
    setField: (key: keyof ShippingForm, value: string) => void;
    setForm: React.Dispatch<React.SetStateAction<ShippingForm>>;
    onNext: () => void;
};

export default function ShippingStep({
    form,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    setField,
    setForm,
    onNext,
}: Props) {
    const inputClass = 'rounded-2xl border border-[#E7D6C4] bg-[#FFF9F3] px-4 py-3 text-base text-[#2E1B12]';

    return (
        <CheckoutCard>
            <View className="flex-row items-center mb-5">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E4D3]">
                    <Feather name="map-pin" size={20} color="#7A3E1D" />
                </View>

                <View>
                    <Text className="text-xl font-extrabold text-[#2E1B12]">
                        Shipping Details
                    </Text>
                    <Text className="text-sm text-[#8B7355]">
                        Where should we deliver your handmade jewelry?
                    </Text>
                </View>
            </View>

            {addresses.length > 0 && (
                <View className="mb-6">
                    <Text className="mb-3 text-sm font-bold text-[#5A321B]">
                        Saved Addresses
                    </Text>

                    <View className="gap-3">
                        {addresses.map((address: any) => (
                            <TouchableOpacity
                                key={address._id}
                                activeOpacity={0.85}
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
                                className={`rounded-3xl border p-4 
                                    ${selectedAddressId === address._id
                                        ? 'border-[#7A3E1D] bg-[#FFF3E6]'
                                        : 'border-[#E7D6C4] bg-white'
                                    }`} >
                                <View className="flex-row items-center justify-between">
                                    <Text className="font-extrabold text-[#2E1B12]">
                                        {address.label || 'Address'}
                                    </Text>

                                    {address.isDefault && (
                                        <Text className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                            Default
                                        </Text>
                                    )}
                                </View>

                                <Text className="mt-2 text-sm font-semibold text-[#5A321B]">
                                    {address.fullName}
                                </Text>
                                <Text className="mt-1 text-sm text-[#8B7355]">
                                    {address.addressLine1}
                                </Text>
                                <Text className="text-sm text-[#8B7355]">
                                    {address.city}, {address.state} {address.zipCode}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity onPress={() => setSelectedAddressId(null)}>
                            <Text className="font-bold text-[#7A3E1D]">
                                + Use manual address instead
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View className="gap-4">
                <View>
                    <Text className="mb-1 text-sm font-bold text-[#5A321B]">Full Name *</Text>
                    <TextInput
                        value={form.fullName}
                        onChangeText={v => setField('fullName', v)}
                        editable={!selectedAddressId}
                        placeholder="Your full name"
                        placeholderTextColor="#B99B83"
                        className={inputClass}
                    />
                </View>

                <View>
                    <Text className="mb-1 text-sm font-bold text-[#5A321B]">Email *</Text>
                    <TextInput
                        value={form.email}
                        onChangeText={v => setField('email', v)}
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        placeholderTextColor="#B99B83"
                        className={inputClass}
                    />
                </View>

                <View>
                    <Text className="mb-1 text-sm font-bold text-[#5A321B]">Phone *</Text>
                    <TextInput
                        value={form.phone}
                        onChangeText={v => setField('phone', v)}
                        editable={!selectedAddressId}
                        keyboardType="phone-pad"
                        placeholder="+94 77 123 4567"
                        placeholderTextColor="#B99B83"
                        className={inputClass}
                    />
                </View>

                <View>
                    <Text className="mb-1 text-sm font-bold text-[#5A321B]">Address *</Text>
                    <TextInput
                        value={form.address}
                        onChangeText={v => setField('address', v)}
                        editable={!selectedAddressId}
                        placeholder="Street address"
                        placeholderTextColor="#B99B83"
                        className={inputClass}
                    />
                </View>

                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Text className="mb-1 text-sm font-bold text-[#5A321B]">City *</Text>
                        <TextInput
                            value={form.city}
                            onChangeText={v => setField('city', v)}
                            editable={!selectedAddressId}
                            placeholder="Colombo"
                            placeholderTextColor="#B99B83"
                            className={inputClass}
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="mb-1 text-sm font-bold text-[#5A321B]">Postal Code *</Text>
                        <TextInput
                            value={form.zipCode}
                            onChangeText={v => setField('zipCode', v)}
                            editable={!selectedAddressId}
                            keyboardType="number-pad"
                            placeholder="10100"
                            placeholderTextColor="#B99B83"
                            className={inputClass}
                        />
                    </View>
                </View>

                <View>
                    <Text className="mb-1 text-sm font-bold text-[#5A321B]">Country</Text>
                    <TextInput
                        value={form.country}
                        onChangeText={v => setField('country', v)}
                        editable={!selectedAddressId}
                        placeholder="Sri Lanka"
                        placeholderTextColor="#B99B83"
                        className={inputClass}
                    />
                </View>
            </View>

            <TouchableOpacity
                onPress={onNext}
                activeOpacity={0.88}
                className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#7A3E1D] py-4"
            >
                <Text className="mr-2 text-base font-extrabold text-white">
                    Continue to Payment
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
        </CheckoutCard>
    );
}