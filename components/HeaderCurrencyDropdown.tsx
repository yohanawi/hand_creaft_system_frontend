import { useCurrency } from '@/context/CurrencyContext';
import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

export default function HeaderCurrencyDropdown() {
    const [open, setOpen] = useState(false);
    const { currency, setCurrency, currencies } = useCurrency();

    const dropdownShadow = useMemo(
        () => (
            Platform.OS === 'web'
                ? ({ boxShadow: '0 14px 28px rgba(34, 20, 12, 0.16)' } as any)
                : {
                    shadowColor: '#22140C',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.16,
                    shadowRadius: 18,
                    elevation: 10,
                }
        ),
        [],
    );

    return (
        <View style={{ position: 'relative', zIndex: 9999 }}>
            <TouchableOpacity
                onPress={() => setOpen((current) => !current)}
                activeOpacity={0.86}
                className="flex-row items-center gap-2 px-3 py-2 border rounded-xl border-white/20 bg-white/10"
            >
                <Text style={{ fontSize: 15 }}>{currency.flag}</Text>
                <Text className="font-bold text-white text-[12px]">
                    {currency.code}
                </Text>
                <Feather
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#fff"
                />
            </TouchableOpacity>

            {open ? (
                <View
                    className="absolute right-0 top-12 w-[240px] overflow-hidden rounded-2xl border border-[#EADFD4] bg-white"
                    style={dropdownShadow}
                >
                    {currencies.map((item, index) => (
                        <TouchableOpacity
                            key={item.code}
                            onPress={() => {
                                setCurrency(item);
                                setOpen(false);
                            }}
                            activeOpacity={0.9}
                            className="flex-row items-center justify-between px-4 py-3"
                            style={{
                                borderBottomWidth: index === currencies.length - 1 ? 0 : 1,
                                borderBottomColor: '#F4E9DF',
                                backgroundColor:
                                    currency.code === item.code ? '#FFF7F0' : '#FFFFFF',
                            }}
                        >
                            <View className="flex-row items-center gap-3">
                                <Text style={{ fontSize: 16 }}>{item.flag}</Text>
                                <View>
                                    <Text className="font-bold text-[#2D1810]">
                                        {item.country}
                                    </Text>
                                    <Text className="text-xs text-[#8A6A58]">
                                        {item.code}
                                    </Text>
                                </View>
                            </View>

                            {currency.code === item.code ? (
                                <Feather
                                    name="check-circle"
                                    size={16}
                                    color="#8B4513"
                                />
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}
        </View>
    );
}