import { create } from 'zustand';
import { toast } from 'sonner';
import { apiClient } from '../utils/apiClient';

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

    
    fetchWishlist: (token: string) => Promise<void>;
    toggleWishlist: (productId: string, token: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}


export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchWishlist: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.get<{ wishlist: Product[] }>('/api/wishlist');
            set({ items: data.wishlist || [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            console.error('Wishlist error:', error);
        }
    },

    toggleWishlist: async (productId, token) => {
        try {
            const data = await apiClient.post<{ action: 'added' | 'removed' }>('/api/wishlist/toggle', { productId });

            
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
