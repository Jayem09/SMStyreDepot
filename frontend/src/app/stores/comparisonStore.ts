import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productStore';

interface ComparisonStore {
    selectedProducts: Product[];
    addToComparison: (product: Product) => void;
    removeFromComparison: (productId: number) => void;
    clearComparison: () => void;
    isInComparison: (productId: number) => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            selectedProducts: [],
            addToComparison: (product) => {
                const { selectedProducts } = get();
                if (selectedProducts.length >= 4) {
                    throw new Error("Maximum 4 products can be compared at once.");
                }
                if (selectedProducts.find((p) => p.id === product.id)) {
                    return;
                }
                set({ selectedProducts: [...selectedProducts, product] });
            },
            removeFromComparison: (productId) => {
                set((state) => ({
                    selectedProducts: state.selectedProducts.filter((p) => p.id !== productId),
                }));
            },
            clearComparison: () => set({ selectedProducts: [] }),
            isInComparison: (productId) => {
                return get().selectedProducts.some((p) => p.id === productId);
            },
        }),
        {
            name: 'comparison-storage',
        }
    )
);
