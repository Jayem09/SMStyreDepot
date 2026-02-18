import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

export interface Product {
    id: number;
    name: string;
    brand: string;
    size: string;
    type: string;
    price: number;
    rating: number;
    stock: number;
    image_url?: string;
    image_urls?: string[];
    description?: string;
    warranty?: string;
    is_featured?: boolean;
}

interface ProductStore {
    products: Product[];
    selectedProduct: Product | null;
    searchQuery: string;
    filters: {
        brand: string;
        size: string;
        type: string;
        minPrice?: number;
        maxPrice?: number;
    };
    relatedProducts: Product[];
    setProducts: (products: Product[]) => void;
    setSelectedProduct: (product: Product | null) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<ProductStore['filters']>) => void;
    getFilteredProducts: () => Product[];
    fetchRelatedProducts: (productId: number) => Promise<void>;
}


export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    selectedProduct: null,
    searchQuery: '',
    filters: {
        brand: 'All Brands',
        size: 'All Sizes',
        type: 'All Types',
    },
    relatedProducts: [],
    setProducts: (products) => set({ products }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),
    getFilteredProducts: () => {
        const { products, searchQuery, filters } = get();
        let filtered = [...products];

        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.brand.toLowerCase().includes(query) ||
                    product.size.toLowerCase().includes(query) ||
                    product.type.toLowerCase().includes(query)
            );
        }

        
        if (filters.brand !== 'All Brands') {
            filtered = filtered.filter((product) => product.brand === filters.brand);
        }

        
        if (filters.size !== 'All Sizes') {
            filtered = filtered.filter((product) => product.size === filters.size);
        }

        
        if (filters.type !== 'All Types') {
            filtered = filtered.filter((product) => product.type === filters.type);
        }

        
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter((product) => product.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter((product) => product.price <= filters.maxPrice!);
        }

        return filtered;
    },
    fetchRelatedProducts: async (productId) => {
        try {
            const data = await apiClient.get<{ products: Product[] }>(`/api/products/${productId}/related`);
            set({ relatedProducts: data.products || [] });
        } catch (error) {
            console.error('Error fetching related products:', error);
            set({ relatedProducts: [] });
        }
    },
}));
