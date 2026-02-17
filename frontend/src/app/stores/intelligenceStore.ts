import { create } from 'zustand';

interface ForecastData {
    date: string;
    predicted: number;
    confidenceLower: number;
    confidenceUpper: number;
}

interface HistoricalData {
    date: string;
    value: number;
}

interface SeasonalTrend {
    hasSeasonal: boolean;
    peakMonths: string[];
    lowMonths: string[];
    avgValue: number;
    seasonalityStrength: number;
    monthlyData: { month: string; value: number; orders: number }[];
}

interface CustomerSegment {
    userId: number;
    name: string;
    email: string;
    segment: string;
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    churnRiskScore: number;
}

interface ChurnRiskCustomer {
    userId: number;
    name: string;
    email: string;
    phone?: string;
    segment: string;
    churnRiskScore: number;
    lastPurchaseDate: string;
    daysSinceLastPurchase: number;
    lifetimeValue: number;
    totalOrders: number;
    recommendedAction: string;
}

interface InventoryRecommendation {
    productId: number;
    name: string;
    brand: string;
    currentStock: number;
    optimalStock: number;
    reorderPoint: number;
    safetyStock: number;
    avgDailySales: number;
    action: string;
}

interface ProductInsight {
    productId: number;
    name: string;
    category: string;
    growthRate: number;
    profitMargin: number;
    recommendation: string;
}

interface IntelligenceStore {
    // Forecast
    forecast: ForecastData[];
    historical: HistoricalData[];
    forecastMetric: string;
    forecastPeriod: string;

    // Seasonal Trends
    seasonalTrends: SeasonalTrend | null;

    // Customer Segments
    customerSegments: CustomerSegment[];
    segmentSummary: Record<string, number>;

    // Churn Risk
    churnRiskCustomers: ChurnRiskCustomer[];

    // Inventory
    inventoryRecommendations: InventoryRecommendation[];

    // Product Insights
    productInsights: ProductInsight[];

    loading: boolean;
    error: string | null;

    // Actions
    fetchForecast: (token: string, period?: string, metric?: string) => Promise<void>;
    fetchSeasonalTrends: (token: string) => Promise<void>;
    fetchCustomerSegments: (token: string) => Promise<void>;
    fetchChurnRisk: (token: string) => Promise<void>;
    fetchInventoryOptimization: (token: string) => Promise<void>;
    fetchProductInsights: (token: string) => Promise<void>;
    fetchAll: (token: string) => Promise<void>;
}

export const useIntelligenceStore = create<IntelligenceStore>((set) => ({
    forecast: [],
    historical: [],
    forecastMetric: 'revenue',
    forecastPeriod: '30d',
    seasonalTrends: null,
    customerSegments: [],
    segmentSummary: {},
    churnRiskCustomers: [],
    inventoryRecommendations: [],
    productInsights: [],
    loading: false,
    error: null,

    fetchForecast: async (token: string, period = '30d', metric = 'revenue') => {
        try {
            const response = await fetch(`/api/intelligence/forecast?period=${period}&metric=${metric}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch forecast');
            const data = await response.json();
            set({
                forecast: data.forecast || [],
                historical: data.historical || [],
                forecastMetric: metric,
                forecastPeriod: period
            });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchSeasonalTrends: async (token: string) => {
        try {
            const response = await fetch('/api/intelligence/seasonal-trends', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch seasonal trends');
            const data = await response.json();
            set({ seasonalTrends: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchCustomerSegments: async (token: string) => {
        try {
            const response = await fetch('/api/intelligence/customer-segments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch customer segments');
            const data = await response.json();
            set({
                customerSegments: data.segments || [],
                segmentSummary: data.summary || {}
            });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchChurnRisk: async (token: string) => {
        try {
            const response = await fetch('/api/intelligence/churn-risk', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch churn risk');
            const data = await response.json();
            set({ churnRiskCustomers: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, churnRiskCustomers: [] });
        }
    },

    fetchInventoryOptimization: async (token: string) => {
        try {
            const response = await fetch('/api/intelligence/inventory-optimization', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch inventory optimization');
            const data = await response.json();
            set({ inventoryRecommendations: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, inventoryRecommendations: [] });
        }
    },

    fetchProductInsights: async (token: string) => {
        try {
            const response = await fetch('/api/intelligence/product-insights', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch product insights');
            const data = await response.json();
            set({ productInsights: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, productInsights: [] });
        }
    },

    fetchAll: async (token: string) => {
        set({ loading: true, error: null });
        try {
            await Promise.all([
                useIntelligenceStore.getState().fetchForecast(token),
                useIntelligenceStore.getState().fetchSeasonalTrends(token),
                useIntelligenceStore.getState().fetchCustomerSegments(token),
                useIntelligenceStore.getState().fetchChurnRisk(token),
                useIntelligenceStore.getState().fetchInventoryOptimization(token),
                useIntelligenceStore.getState().fetchProductInsights(token),
            ]);
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
}));
