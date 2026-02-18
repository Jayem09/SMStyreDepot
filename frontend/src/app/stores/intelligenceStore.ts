import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

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
    
    forecast: ForecastData[];
    historical: HistoricalData[];
    forecastMetric: string;
    forecastPeriod: string;

    
    seasonalTrends: SeasonalTrend | null;

    
    customerSegments: CustomerSegment[];
    segmentSummary: Record<string, number>;

    
    churnRiskCustomers: ChurnRiskCustomer[];

    
    inventoryRecommendations: InventoryRecommendation[];

    
    productInsights: ProductInsight[];

    loading: boolean;
    error: string | null;

    
    fetchForecast: (period?: string, metric?: string) => Promise<void>;
    fetchSeasonalTrends: () => Promise<void>;
    fetchCustomerSegments: () => Promise<void>;
    fetchChurnRisk: () => Promise<void>;
    fetchInventoryOptimization: () => Promise<void>;
    fetchProductInsights: () => Promise<void>;
    fetchAll: () => Promise<void>;
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

    fetchForecast: async (period = '30d', metric = 'revenue') => {
        try {
            const data = await apiClient.get<any>('/api/intelligence/forecast', { params: { period, metric } });
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

    fetchSeasonalTrends: async () => {
        try {
            const data = await apiClient.get<SeasonalTrend>('/api/intelligence/seasonal-trends');
            set({ seasonalTrends: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchCustomerSegments: async () => {
        try {
            const data = await apiClient.get<any>('/api/intelligence/customer-segments');
            set({
                customerSegments: data.segments || [],
                segmentSummary: data.summary || {}
            });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchChurnRisk: async () => {
        try {
            const data = await apiClient.get<ChurnRiskCustomer[]>('/api/intelligence/churn-risk');
            set({ churnRiskCustomers: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, churnRiskCustomers: [] });
        }
    },

    fetchInventoryOptimization: async () => {
        try {
            const data = await apiClient.get<InventoryRecommendation[]>('/api/intelligence/inventory-optimization');
            set({ inventoryRecommendations: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, inventoryRecommendations: [] });
        }
    },

    fetchProductInsights: async () => {
        try {
            const data = await apiClient.get<ProductInsight[]>('/api/intelligence/product-insights');
            set({ productInsights: Array.isArray(data) ? data : [] });
        } catch (error: any) {
            set({ error: error.message, productInsights: [] });
        }
    },

    fetchAll: async () => {
        set({ loading: true, error: null });
        try {
            const state = useIntelligenceStore.getState();
            await Promise.all([
                state.fetchForecast(),
                state.fetchSeasonalTrends(),
                state.fetchCustomerSegments(),
                state.fetchChurnRisk(),
                state.fetchInventoryOptimization(),
                state.fetchProductInsights(),
            ]);
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
}));
