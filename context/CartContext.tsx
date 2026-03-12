import api, {
    addToCartAPI,
    clearCartAPI,
    getCart,
    removeFromCartAPI,
    updateCartItemAPI,
} from '@/services/api';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
    product: string;       // MongoDB _id
    name: string;
    thumbnailImage: string;
    price: number;
    salePrice: number | null;
    quantity: number;
    sku: string;
}

interface CartContextType {
    items: CartItem[];
    cartCount: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQty: (productId: string, qty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loadFromServer: () => Promise<void>;
    clearLocalCart: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isLoggedIn = () => !!api.defaults.headers.common['Authorization'];

/** Maps a populated server cart item to our CartItem type */
const serverItemToCartItem = (serverItem: any): CartItem => {
    const p = serverItem.product;
    return {
        product: p._id,
        name: p.name,
        thumbnailImage: p.thumbnailImage || '',
        price: p.price,
        salePrice: p.salePrice ?? null,
        quantity: serverItem.quantity,
        sku: p.sku || '',
    };
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    /** Fetch cart from server and hydrate local state */
    const loadFromServer = useCallback(async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await getCart();
            const serverItems: CartItem[] = (res.data || []).map(serverItemToCartItem);
            setItems(serverItems);
        } catch {
            // silently fail; local state stays intact
        }
    }, []);

    /** Clear only local state (called on logout) */
    const clearLocalCart = useCallback(() => setItems([]), []);

    const addToCart = useCallback(
        async (incoming: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
            const qty = incoming.quantity ?? 1;

            // Optimistic local update first
            setItems(prev => {
                const idx = prev.findIndex(i => i.product === incoming.product);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
                    return updated;
                }
                return [...prev, { ...incoming, quantity: qty }];
            });

            // Server sync
            if (isLoggedIn()) {
                try {
                    const res = await addToCartAPI(incoming.product, qty);
                    setItems((res.data || []).map(serverItemToCartItem));
                } catch { /* keep optimistic */ }
            }
        },
        [],
    );

    const removeFromCart = useCallback(async (productId: string) => {
        // Optimistic
        setItems(prev => prev.filter(i => i.product !== productId));
        if (isLoggedIn()) {
            try {
                const res = await removeFromCartAPI(productId);
                setItems((res.data || []).map(serverItemToCartItem));
            } catch { /* keep optimistic */ }
        }
    }, []);

    const updateQty = useCallback(async (productId: string, qty: number) => {
        if (qty < 1) return;
        // Optimistic
        setItems(prev =>
            prev.map(i => (i.product === productId ? { ...i, quantity: qty } : i)),
        );
        if (isLoggedIn()) {
            try {
                const res = await updateCartItemAPI(productId, qty);
                setItems((res.data || []).map(serverItemToCartItem));
            } catch { /* keep optimistic */ }
        }
    }, []);

    const clearCart = useCallback(async () => {
        setItems([]);
        if (isLoggedIn()) {
            try { await clearCartAPI(); } catch { /* silently fail */ }
        }
    }, []);

    // ── Derived values ─────────────────────────────────────────────────────────
    const cartCount = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items],
    );

    const subtotal = useMemo(
        () =>
            items.reduce((sum, i) => {
                const unitPrice = i.salePrice !== null && i.salePrice < i.price ? i.salePrice : i.price;
                return sum + unitPrice * i.quantity;
            }, 0),
        [items],
    );

    const shippingCost = subtotal >= 100 ? 0 : 10;
    const tax = parseFloat(((subtotal + shippingCost) * 0.1).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    return (
        <CartContext.Provider
            value={{
                items,
                cartCount,
                subtotal,
                shippingCost,
                tax,
                total,
                addToCart,
                removeFromCart,
                updateQty,
                clearCart,
                loadFromServer,
                clearLocalCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
};

export default CartContext;
