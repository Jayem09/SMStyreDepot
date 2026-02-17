import { create } from 'zustand';

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

    fetchOverview: (token: string) => Promise<void>;
    fetchSalesTimeline: (token: string, period?: string) => Promise<void>;
    fetchBestSellers: (token: string, limit?: number) => Promise<void>;
    fetchRevenueByBrand: (token: string) => Promise<void>;
    fetchRevenueByCategory: (token: string) => Promise<void>;
    fetchOrderStatusDistribution: (token: string) => Promise<void>;
    fetchCustomerStats: (token: string) => Promise<void>;
    fetchAll: (token: string, period?: string) => Promise<void>;
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

    fetchOverview: async (token: string) => {
        try {
            const response = await fetch('/api/analytics/overview', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch overview');
            const data = await response.json();
            set({ overview: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchSalesTimeline: async (token: string, period = '30d') => {
        try {
            const response = await fetch(`/api/analytics/sales-timeline?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch sales timeline');
            const data = await response.json();
            set({ salesTimeline: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchBestSellers: async (token: string, limit = 10) => {
        try {
            const response = await fetch(`/api/analytics/best-sellers?limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch best sellers');
            const data = await response.json();
            set({ bestSellers: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchRevenueByBrand: async (token: string) => {
        try {
            const response = await fetch('/api/analytics/revenue-by-brand', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch revenue by brand');
            const data = await response.json();
            set({ revenueByBrand: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchRevenueByCategory: async (token: string) => {
        try {
            const response = await fetch('/api/analytics/revenue-by-category', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch revenue by category');
            const data = await response.json();
            set({ revenueByCategory: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchOrderStatusDistribution: async (token: string) => {
        try {
            const response = await fetch('/api/analytics/order-status-distribution', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch order status distribution');
            const data = await response.json();
            set({ orderStatusDistribution: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchCustomerStats: async (token: string) => {
        try {
            const response = await fetch('/api/analytics/customer-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch customer stats');
            const data = await response.json();
            set({ customerStats: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchAll: async (token: string, period = '30d') => {
        set({ loading: true, error: null });
        try {
            await Promise.all([
                useAnalyticsStore.getState().fetchOverview(token),
                useAnalyticsStore.getState().fetchSalesTimeline(token, period),
                useAnalyticsStore.getState().fetchBestSellers(token),
                useAnalyticsStore.getState().fetchRevenueByBrand(token),
                useAnalyticsStore.getState().fetchRevenueByCategory(token),
                useAnalyticsStore.getState().fetchOrderStatusDistribution(token),
                useAnalyticsStore.getState().fetchCustomerStats(token),
            ]);
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
}));
