import { useToast } from '@/context/ToastContext';
import api, { getApiErrorMessage, getWishlist, removeFromWishlistAPI, toggleWishlistAPI } from '@/services/api';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistProduct {
    _id: string;
    name: string;
    thumbnailImage?: string;
    images?: string[];
    price: number;
    salePrice?: number | null;
    sku?: string;
    availabilityStatus?: string;
    quantity?: number;
    category?: { name: string; slug: string } | string;
    description?: string;
    material?: string;
    tags?: string[];
}

interface WishlistContextType {
    items: WishlistProduct[];
    wishlistCount: number;
    isInWishlist: (productId: string) => boolean;
    toggleItem: (productId: string, productData?: WishlistProduct) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearItems: () => Promise<void>;
    loadFromServer: () => Promise<void>;
    clearLocalWishlist: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isLoggedIn = () => !!api.defaults.headers.common['Authorization'];

// ─── Context ──────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<WishlistProduct[]>([]);
    const { showToast } = useToast();

    /** Fetch wishlist from server */
    const loadFromServer = useCallback(async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await getWishlist();
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch { /* silently fail */ }
    }, []);

    /** Clear local state on logout */
    const clearLocalWishlist = useCallback(() => setItems([]), []);

    const isInWishlist = useCallback(
        (productId: string) => items.some((i) => i._id === productId),
        [items],
    );

    /**
     * Toggle a product in the wishlist.
     * Pass `productData` to allow optimistic add when not logged in,
     * or just working with local state.
     */
    const toggleItem = useCallback(async (productId: string, productData?: WishlistProduct) => {
        if (isLoggedIn()) {
            const previousItems = items;
            // Optimistic toggle
            setItems(prev => {
                const exists = prev.some(i => i._id === productId);
                if (exists) return prev.filter(i => i._id !== productId);
                if (productData) return [...prev, productData];
                return prev;
            });
            try {
                const res = await toggleWishlistAPI(productId);
                setItems(Array.isArray(res.data?.wishlist) ? res.data.wishlist : []);
            } catch (error) {
                setItems(previousItems);
                showToast('Wishlist update failed', 'error', {
                    subMessage: getApiErrorMessage(error, 'Unable to update your wishlist right now.'),
                });
            }
        } else {
            // Not logged in: toggle locally only
            setItems(prev => {
                const exists = prev.some(i => i._id === productId);
                if (exists) return prev.filter(i => i._id !== productId);
                if (productData) return [...prev, productData];
                return prev;
            });
        }
    }, [items, showToast]);

    const removeItem = useCallback(async (productId: string) => {
        const previousItems = items;
        setItems(prev => prev.filter(i => i._id !== productId));
        if (isLoggedIn()) {
            try {
                await removeFromWishlistAPI(productId);
            } catch (error) {
                setItems(previousItems);
                showToast('Wishlist update failed', 'error', {
                    subMessage: getApiErrorMessage(error, 'Unable to remove this product from your wishlist right now.'),
                });
            }
        }
    }, [items, showToast]);

    const clearItems = useCallback(async () => {
        const productIds = items.map((item) => item._id);
        const previousItems = items;
        setItems([]);

        if (isLoggedIn()) {
            try {
                await Promise.all(productIds.map((productId) => removeFromWishlistAPI(productId)));
            } catch (error) {
                setItems(previousItems);
                showToast('Wishlist update failed', 'error', {
                    subMessage: getApiErrorMessage(error, 'Unable to clear your wishlist right now.'),
                });
            }
        }
    }, [items, showToast]);

    const wishlistCount = useMemo(() => items.length, [items]);

    return (
        <WishlistContext.Provider
            value={{
                items,
                wishlistCount,
                isInWishlist,
                toggleItem,
                removeItem,
                clearItems,
                loadFromServer,
                clearLocalWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export function useWishlist(): WishlistContextType {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
    return ctx;
}

export default WishlistContext;
