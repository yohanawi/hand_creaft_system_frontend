import { getMyProfile, setAuthToken, setUnauthorizedHandler } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'seller' | 'admin';
    sellerStatus?: 'inactive' | 'pending' | 'approved' | 'rejected' | 'suspended';
    sellerProfile?: {
        shopName?: string;
        shopSlug?: string;
        bio?: string;
        logo?: string;
        banner?: string;
        city?: string;
        state?: string;
        country?: string;
        contactEmail?: string;
        contactPhone?: string;
        materials?: string[];
        processingTimeLabel?: string;
        shippingPolicy?: string;
        returnPolicy?: string;
        bankName?: string;
        accountHolderName?: string;
        accountNumberMasked?: string;
        payoutEmail?: string;
        defaultCurrency?: string;
    };
    emailVerified?: boolean;
    addresses?: any[];
};

type AuthContextValue = {
    userToken: string | null;
    user: AuthUser | null;
    isAdmin: boolean;
    isSeller: boolean;
    isLoading: boolean;
    isValidatingSession: boolean;
    pendingRedirect: string | null;
    login: (token: string, user: AuthUser, options?: { persist?: boolean }) => void;
    updateUser: (user: Partial<AuthUser>) => void;
    logout: (options?: { clearRedirect?: boolean }) => void;
    setPendingRedirect: (path: string | null) => void;
    consumePendingRedirect: () => string | null;
    validateSession: (options?: { force?: boolean }) => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REDIRECT_KEY = 'auth_redirect';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidatingSession, setIsValidatingSession] = useState(false);
    const [persistSession, setPersistSession] = useState(false);
    const [pendingRedirect, setPendingRedirectState] = useState<string | null>(null);
    const validationPromiseRef = useRef<Promise<boolean> | null>(null);

    const setPendingRedirect = useCallback((path: string | null) => {
        const normalizedPath = String(path || '').trim() || null;
        setPendingRedirectState(normalizedPath);

        if (normalizedPath) {
            AsyncStorage.setItem(REDIRECT_KEY, normalizedPath).catch(() => { });
            return;
        }

        AsyncStorage.removeItem(REDIRECT_KEY).catch(() => { });
    }, []);

    const consumePendingRedirect = useCallback(() => {
        const nextRedirect = pendingRedirect;
        setPendingRedirect(null);
        return nextRedirect;
    }, [pendingRedirect, setPendingRedirect]);

    // Restore session from AsyncStorage on first mount
    useEffect(() => {
        (async () => {
            try {
                const [[, token], [, raw], [, storedRedirect]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY, REDIRECT_KEY]);
                if (token && raw) {
                    const stored = JSON.parse(raw) as AuthUser;
                    setUserToken(token);
                    setUser(stored);
                    setPersistSession(true);
                    setAuthToken(token);
                }
                if (storedRedirect) {
                    setPendingRedirectState(storedRedirect);
                }
            } catch {
                // Storage read failed — stay logged out
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Keep axios in sync whenever the token changes
    useEffect(() => {
        setAuthToken(userToken);
    }, [userToken]);

    const login = useCallback((token: string, userData: AuthUser, options?: { persist?: boolean }) => {
        const shouldPersist = options?.persist ?? true;

        setUserToken(token);
        setUser(userData);
        setPersistSession(shouldPersist);

        if (shouldPersist) {
            AsyncStorage.setItem(TOKEN_KEY, token).catch(() => { });
            AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)).catch(() => { });
            return;
        }

        AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]).catch(() => { });
    }, []);

    const updateUser = useCallback((nextUser: Partial<AuthUser>) => {
        setUser((prev) => {
            if (!prev) return prev;

            const updated = { ...prev, ...nextUser };
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(updated);

            if (!hasChanged) {
                return prev;
            }

            if (persistSession) {
                AsyncStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(() => { });
            }

            return updated;
        });
    }, [persistSession]);

    const logout = useCallback((options?: { clearRedirect?: boolean }) => {
        const shouldClearRedirect = options?.clearRedirect ?? true;

        setUserToken(null);
        setUser(null);
        setPersistSession(false);
        setIsValidatingSession(false);
        validationPromiseRef.current = null;
        if (shouldClearRedirect) {
            setPendingRedirect(null);
        }
        AsyncStorage.multiRemove(
            shouldClearRedirect ? [TOKEN_KEY, USER_KEY, REDIRECT_KEY] : [TOKEN_KEY, USER_KEY]
        ).catch(() => { });
    }, [setPendingRedirect]);

    const validateSession = useCallback(async (options?: { force?: boolean }) => {
        if (!userToken) {
            return false;
        }

        if (validationPromiseRef.current && !options?.force) {
            return validationPromiseRef.current;
        }

        const validationPromise = (async () => {
            setIsValidatingSession(true);

            try {
                const { data } = await getMyProfile();
                const nextUser = data as AuthUser;
                setUser(nextUser);

                if (persistSession) {
                    AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser)).catch(() => { });
                }

                return true;
            } catch {
                logout({ clearRedirect: false });
                return false;
            } finally {
                setIsValidatingSession(false);
                validationPromiseRef.current = null;
            }
        })();

        validationPromiseRef.current = validationPromise;
        return validationPromise;
    }, [logout, persistSession, userToken]);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout({ clearRedirect: false });
        });

        return () => {
            setUnauthorizedHandler(null);
        };
    }, [logout]);

    const value = useMemo<AuthContextValue>(() => ({
        userToken,
        user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller',
        isLoading,
        isValidatingSession,
        pendingRedirect,
        login,
        updateUser,
        logout,
        setPendingRedirect,
        consumePendingRedirect,
        validateSession,
    }), [consumePendingRedirect, isLoading, isValidatingSession, login, logout, pendingRedirect, setPendingRedirect, updateUser, user, userToken, validateSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}

// Keep a default export for existing imports.
export default AuthContext;
