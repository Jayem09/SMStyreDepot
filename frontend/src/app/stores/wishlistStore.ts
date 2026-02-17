import { create } from 'zustand';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    size: string;
    type: string;
    [key: string]: any;
}

interface WishlistState {
    items: Product[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchWishlist: (token: string) => Promise<void>;
    toggleWishlist: (productId: string, token: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchWishlist: async (token) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch wishlist');

            const data = await response.json();
            set({ items: data.wishlist || [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            console.error('Wishlist error:', error);
        }
    },

    toggleWishlist: async (productId, token) => {
        try {
            const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) throw new Error('Failed to toggle wishlist');

            const data = await response.json();

            // Re-fetch wishlist to keep items in sync
            await get().fetchWishlist(token);

            if (data.action === 'added') {
                toast.success('Product added to wishlist');
            } else {
                toast.info('Product removed from wishlist');
            }
        } catch (error: any) {
            toast.error('Failed to update wishlist');
            console.error('Wishlist toggle error:', error);
        }
    },

    isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
    },

    clearWishlist: () => {
        set({ items: [], error: null });
    }
}));
