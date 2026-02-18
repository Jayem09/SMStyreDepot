import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

interface OverviewStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    changes: {
        revenue: number;
        orders: number;
    };
}

interface SalesData {
    date: string;
    revenue: number;
    orders: number;
}

interface BestSeller {
    id: number;
    name: string;
    brand: string;
    image_url: string;
    units_sold: number;
    revenue: number;
}

interface BrandRevenue {
    brand: string;
    revenue: number;
    orders: number;
}

interface CategoryRevenue {
    category: string;
    revenue: number;
}

interface StatusCount {
    status: string;
    count: number;
}

interface CustomerStats {
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
    growth: { date: string; count: number }[];
}

interface AnalyticsStore {
    overview: OverviewStats | null;
    salesTimeline: SalesData[];
    bestSellers: BestSeller[];
    revenueByBrand: BrandRevenue[];
    revenueByCategory: CategoryRevenue[];
    orderStatusDistribution: StatusCount[];
    customerStats: CustomerStats | null;

    loading: boolean;
    error: string | null;

    fetchOverview: () => Promise<void>;
    fetchSalesTimeline: (period?: string) => Promise<void>;
    fetchBestSellers: (limit?: number) => Promise<void>;
    fetchRevenueByBrand: () => Promise<void>;
    fetchRevenueByCategory: () => Promise<void>;
    fetchOrderStatusDistribution: () => Promise<void>;
    fetchCustomerStats: () => Promise<void>;
    fetchAll: (period?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
    overview: null,
    salesTimeline: [],
    bestSellers: [],
    revenueByBrand: [],
    revenueByCategory: [],
    orderStatusDistribution: [],
    customerStats: null,

    loading: false,
    error: null,

    fetchOverview: async () => {
        try {
            const data = await apiClient.get<OverviewStats>('/api/analytics/overview');
            set({ overview: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchSalesTimeline: async (period = '30d') => {
        try {
            const data = await apiClient.get<SalesData[]>('/api/analytics/sales-timeline', { params: { period } });
            set({ salesTimeline: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchBestSellers: async (limit = 10) => {
        try {
            const data = await apiClient.get<BestSeller[]>('/api/analytics/best-sellers', { params: { limit: limit.toString() } });
            set({ bestSellers: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchRevenueByBrand: async () => {
        try {
            const data = await apiClient.get<BrandRevenue[]>('/api/analytics/revenue-by-brand');
            set({ revenueByBrand: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchRevenueByCategory: async () => {
        try {
            const data = await apiClient.get<CategoryRevenue[]>('/api/analytics/revenue-by-category');
            set({ revenueByCategory: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchOrderStatusDistribution: async () => {
        try {
            const data = await apiClient.get<StatusCount[]>('/api/analytics/order-status-distribution');
            set({ orderStatusDistribution: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchCustomerStats: async () => {
        try {
            const data = await apiClient.get<CustomerStats>('/api/analytics/customer-stats');
            set({ customerStats: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchAll: async (period = '30d') => {
        set({ loading: true, error: null });
        try {
            const state = useAnalyticsStore.getState();
            await Promise.all([
                state.fetchOverview(),
                state.fetchSalesTimeline(period),
                state.fetchBestSellers(),
                state.fetchRevenueByBrand(),
                state.fetchRevenueByCategory(),
                state.fetchOrderStatusDistribution(),
                state.fetchCustomerStats(),
            ]);
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
}));
