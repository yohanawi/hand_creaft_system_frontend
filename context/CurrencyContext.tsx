import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    CurrencyType,
    DEFAULT_CURRENCY,
    currencies,
} from '@/utils/currency';

type CurrencyContextType = {
    currency: CurrencyType;
    setCurrency: (currency: CurrencyType) => void;
    currencies: CurrencyType[];
};

const STORAGE_KEY = 'storefront:selected-currency';

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

    useEffect(() => {
        let mounted = true;

        AsyncStorage.getItem(STORAGE_KEY)
            .then((storedCode) => {
                if (!mounted || !storedCode) {
                    return;
                }

                const matchedCurrency = currencies.find(
                    (item) => item.code === storedCode,
                );

                if (matchedCurrency) {
                    setCurrencyState(matchedCurrency);
                }
            })
            .catch(() => {
                // Keep the default currency when persisted state is unavailable.
            });

        return () => {
            mounted = false;
        };
    }, []);

    const setCurrency = useCallback((nextCurrency: CurrencyType) => {
        setCurrencyState(nextCurrency);
        AsyncStorage.setItem(STORAGE_KEY, nextCurrency.code).catch(() => {
            // Selection persistence is best-effort only.
        });
    }, []);

    const value = useMemo(
        () => ({
            currency,
            setCurrency,
            currencies,
        }),
        [currency, setCurrency],
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);

    if (!context) {
        throw new Error('useCurrency must be used inside CurrencyProvider');
    }

    return context;
};