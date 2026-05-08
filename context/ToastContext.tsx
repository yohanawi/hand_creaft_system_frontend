import { Feather } from '@expo/vector-icons';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'wishlist';

interface ToastMessage {
    id: number;
    message: string;
    subMessage?: string;
    type: ToastType;
    icon?: keyof typeof Feather.glyphMap;
}

interface ToastContextValue {
    showToast: (
        message: string,
        type?: ToastType,
        options?: { subMessage?: string; icon?: keyof typeof Feather.glyphMap }
    ) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
    return ctx;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; defaultIcon: keyof typeof Feather.glyphMap }> = {
    success: { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', defaultIcon: 'check-circle' },
    error: { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', defaultIcon: 'alert-circle' },
    info: { bg: '#EFF6FF', border: '#93C5FD', icon: '#2563EB', defaultIcon: 'info' },
    warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', defaultIcon: 'alert-triangle' },
    wishlist: { bg: '#FFF1F2', border: '#FECDD3', icon: '#EF4444', defaultIcon: 'heart' },
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const DURATION = 3000;

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
}) {
    const cfg = TOAST_COLORS[toast.type];
    const iconName = toast.icon ?? cfg.defaultIcon;
    const translateY = useRef(new Animated.Value(-90)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.88)).current;

    React.useEffect(() => {
        // Slide in
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();

        // Auto-dismiss
        const timer = setTimeout(() => dismiss(), DURATION);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: -90, duration: 280, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.88, duration: 260, useNativeDriver: true }),
        ]).start(() => onDismiss(toast.id));
    };

    return (
        <Animated.View
            style={{
                transform: [{ translateY }, { scale }],
                opacity,
            }}
        >
            <View
                style={{
                    backgroundColor: cfg.bg,
                    borderWidth: 1.5,
                    borderColor: cfg.border,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 8,
                    minWidth: 260,
                    maxWidth: Math.min(SCREEN_WIDTH - 32, 420),
                }}
            >
                <TouchableOpacity onPress={dismiss} activeOpacity={0.92} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: cfg.icon + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            flexShrink: 0,
                        }}
                    >
                        <Feather name={iconName} size={18} color={cfg.icon} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: '#111827',
                                fontWeight: '700',
                                fontSize: 14,
                                lineHeight: 19,
                            }}
                            numberOfLines={2}
                        >
                            {toast.message}
                        </Text>
                        {toast.subMessage ? (
                            <Text
                                style={{
                                    color: '#6B7280',
                                    fontSize: 12,
                                    marginTop: 2,
                                    lineHeight: 16,
                                }}
                                numberOfLines={2}
                            >
                                {toast.subMessage}
                            </Text>
                        ) : null}
                    </View>

                    <View style={{ marginLeft: 10, padding: 4 }}>
                        <Feather name="x" size={15} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// ─── Provider + Overlay ───────────────────────────────────────────────────────

let _nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<ToastMessage[]>([]);
    const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

    const showToast = useCallback(
        (
            message: string,
            type: ToastType = 'success',
            options?: { subMessage?: string; icon?: keyof typeof Feather.glyphMap }
        ) => {
            const id = _nextId++;
            setQueue(prev => [...prev, { id, message, type, ...options }]);
        },
        [],
    );

    useEffect(() => {
        if (activeToast || queue.length === 0) {
            return;
        }

        setActiveToast(queue[0]);
        setQueue(prev => prev.slice(1));
    }, [activeToast, queue]);

    const dismiss = useCallback((id: number) => {
        setActiveToast((prev) => (prev?.id === id ? null : prev));
        setQueue(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Overlay — always on top */}
            <View
                style={{
                    pointerEvents: 'box-none',
                    position: 'absolute',
                    top: Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 56 : 16,
                    bottom: Platform.OS === 'web' ? 20 : undefined,
                    right: Platform.OS === 'web' ? 20 : 0,
                    left: Platform.OS === 'web' ? undefined : 0,
                    alignItems: Platform.OS === 'web' ? 'flex-end' : 'center',
                    zIndex: 9999,
                    paddingHorizontal: 16,
                }}
            >
                {activeToast ? <ToastItem key={activeToast.id} toast={activeToast} onDismiss={dismiss} /> : null}
            </View>
        </ToastContext.Provider>
    );
}

export default ToastContext;
