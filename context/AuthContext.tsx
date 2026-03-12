import { setAuthToken } from '@/services/api';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
    login: (token: string, user: AuthUser) => void;
    updateUser: (user: Partial<AuthUser>) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Sync token to axios whenever it changes
    useEffect(() => {
        setAuthToken(userToken);
    }, [userToken]);

    const value = useMemo<AuthContextValue>(() => {
        return {
            userToken,
            user,
            isAdmin: user?.role === 'admin',
            login: (token: string, userData: AuthUser) => {
                setUserToken(token);
                setUser(userData);
            },
            updateUser: (nextUser: Partial<AuthUser>) => {
                setUser((prev) => (prev ? { ...prev, ...nextUser } : prev));
            },
            logout: () => {
                setUserToken(null);
                setUser(null);
            },
        };
    }, [userToken, user]);

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
