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

export interface CartVariantSelection {
    variantId?: string;
    label?: string;
    size?: string;
    color?: string;
    style?: string;
    sku?: string;
}

export interface CartItem {
    product: string;       // MongoDB _id
    name: string;
    thumbnailImage: string;
    price: number;
    salePrice: number | null;
    quantity: number;
    sku: string;
    selectedVariant?: CartVariantSelection;
}

interface CartContextType {
    items: CartItem[];
    cartCount: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
    removeFromCart: (productId: string, variantId?: string) => Promise<void>;
    updateQty: (productId: string, qty: number, variantId?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    loadFromServer: () => Promise<void>;
    clearLocalCart: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isLoggedIn = () => !!api.defaults.headers.common['Authorization'];

const cartItemKey = (item: Pick<CartItem, 'product' | 'selectedVariant'>) => (
    `${item.product}:${item.selectedVariant?.variantId || 'base'}`
);

/** Maps a populated server cart item to our CartItem type */
const serverItemToCartItem = (serverItem: any): CartItem => {
    const p = serverItem.product;
    return {
        product: p._id,
        name: serverItem.name || p.name,
        thumbnailImage: serverItem.thumbnailImage || p.thumbnailImage || '',
        price: Number(typeof serverItem.price !== 'undefined' ? serverItem.price : p.price),
        salePrice: typeof serverItem.salePrice !== 'undefined' ? serverItem.salePrice : (p.salePrice ?? null),
        quantity: serverItem.quantity,
        sku: serverItem.sku || serverItem.selectedVariant?.sku || p.sku || '',
        selectedVariant: serverItem.selectedVariant || undefined,
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
                const idx = prev.findIndex(i => cartItemKey(i) === cartItemKey(incoming));
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
                    const res = await addToCartAPI(incoming.product, qty, incoming.selectedVariant?.variantId);
                    setItems((res.data || []).map(serverItemToCartItem));
                } catch { /* keep optimistic */ }
            }
        },
        [],
    );

    const removeFromCart = useCallback(async (productId: string, variantId?: string) => {
        // Optimistic
        setItems(prev => prev.filter(i => !(i.product === productId && (i.selectedVariant?.variantId || '') === (variantId || ''))));
        if (isLoggedIn()) {
            try {
                const res = await removeFromCartAPI(productId, variantId);
                setItems((res.data || []).map(serverItemToCartItem));
            } catch { /* keep optimistic */ }
        }
    }, []);

    const updateQty = useCallback(async (productId: string, qty: number, variantId?: string) => {
        if (qty < 1) return;
        // Optimistic
        setItems(prev =>
            prev.map(i => (
                i.product === productId && (i.selectedVariant?.variantId || '') === (variantId || '')
                    ? { ...i, quantity: qty }
                    : i
            )),
        );
        if (isLoggedIn()) {
            try {
                const res = await updateCartItemAPI(productId, qty, variantId);
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
