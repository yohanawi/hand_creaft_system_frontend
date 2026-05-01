import { setAuthToken } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    emailVerified?: boolean;
    addresses?: any[];
};

type AuthContextValue = {
    userToken: string | null;
    user: AuthUser | null;
    isAdmin: boolean;
    isLoading: boolean;
    login: (token: string, user: AuthUser, options?: { persist?: boolean }) => void;
    updateUser: (user: Partial<AuthUser>) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [persistSession, setPersistSession] = useState(false);

    // Restore session from AsyncStorage on first mount
    useEffect(() => {
        (async () => {
            try {
                const [[, token], [, raw]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
                if (token && raw) {
                    const stored = JSON.parse(raw) as AuthUser;
                    setUserToken(token);
                    setUser(stored);
                    setPersistSession(true);
                    setAuthToken(token);
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

    const logout = useCallback(() => {
        setUserToken(null);
        setUser(null);
        setPersistSession(false);
        AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]).catch(() => { });
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        userToken,
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        updateUser,
        logout,
    }), [isLoading, login, logout, updateUser, user, userToken]);

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
