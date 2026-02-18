import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface Review {
    id: number;
    rating: number;
    comment: string;
    userName: string;
    createdAt: string;
}

interface ReviewStore {
    reviews: Record<number, Review[]>;
    loading: boolean;
    fetchProductReviews: (productId: number) => Promise<void>;
    addReview: (productId: number, rating: number, comment: string) => Promise<boolean>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
    reviews: {},
    loading: false,

    fetchProductReviews: async (productId) => {
        set({ loading: true });
        try {
            const response = await fetch(`/api/reviews/product/${productId}`);
            if (response.ok) {
                const data = await response.json();
                set((state) => ({
                    reviews: { ...state.reviews, [productId]: data }
                }));
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            set({ loading: false });
        }
    },

    addReview: async (productId, rating, comment) => {
        const token = useAuthStore.getState().token;
        if (!token) return false;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId, rating, comment })
            });

            if (response.ok) {
                
                await get().fetchProductReviews(productId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding review:', error);
            return false;
        }
    }
}));
