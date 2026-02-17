import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useIntelligenceStore } from '../../stores/intelligenceStore';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, AlertTriangle, Package, Target, Loader2, Brain } from 'lucide-react';

const SEGMENT_COLORS: Record<string, string> = {
    champions: '#475569',
    loyal: '#64748b',
    potential: '#94a3b8',
    at_risk: '#cbd5e1',
    lost: '#e2e8f0',
};

const ACTION_COLORS: Record<string, string> = {
    urgent_reorder: '#475569',
    reorder_soon: '#64748b',
    optimal: '#94a3b8',
    overstocked: '#cbd5e1',
};

const CATEGORY_COLORS: Record<string, string> = {
    star: '#475569',
    cash_cow: '#64748b',
    question_mark: '#94a3b8',
    dog: '#cbd5e1',
};

export function AdminIntelligence() {
    const { token } = useAuthStore();
    const {
        forecast,
        historical,
        seasonalTrends,
        segmentSummary,
        churnRiskCustomers,
        inventoryRecommendations,
        productInsights,
        loading,
        error,
        fetchAll,
        fetchForecast,
    } = useIntelligenceStore();

    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [selectedPeriod] = useState('30d');

    useEffect(() => {
        if (token) {
            fetchAll(token);
        }
    }, [token]);

    const handleMetricChange = async (metric: string) => {
        setSelectedMetric(metric);
        if (token) {
            await fetchForecast(token, selectedPeriod, metric);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Analyzing data and generating insights...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Error loading intelligence: {error}
                </div>
            </div>
        );
    }

    // Combine historical and forecast for chart
    const combinedForecastData = [
        ...historical.map(d => ({ ...d, type: 'historical' })),
        ...forecast.map(d => ({ ...d, value: d.predicted, type: 'forecast' }))
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-3 rounded-lg">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Business Intelligence</h1>
                    <p className="text-slate-500 mt-1">Predictive insights and data-driven recommendations</p>
                </div>
            </div>

            {/* Sales Forecast */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Sales Forecast (Next 30 Days)</h2>
                    <div className="flex gap-2">
                        <select
                            value={selectedMetric}
                            onChange={(e) => handleMetricChange(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="revenue">Revenue</option>
                            <option value="orders">Orders</option>
                        </select>
                    </div>
                </div>
                {combinedForecastData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={combinedForecastData}>
                            <defs>
                                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                formatter={(value: any, name: string) => {
                                    if (name === 'value') return [`${selectedMetric === 'revenue' ? '₱' : ''}${value.toLocaleString()}`, selectedMetric === 'revenue' ? 'Revenue' : 'Orders'];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorHistorical)"
                                name="Actual"
                            />
                            <Area
                                type="monotone"
                                dataKey="predicted"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="url(#colorForecast)"
                                name="Forecast"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-slate-500 text-center py-12">Insufficient data for forecasting (minimum 7 days required)</p>
                )}
            </div>

            {/* Customer Segmentation */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Segmentation (RFM Analysis)</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(segmentSummary).map(([segment, count]) => (
                        <div
                            key={segment}
                            className="p-4 rounded-lg border-2"
                            style={{ borderColor: SEGMENT_COLORS[segment], backgroundColor: `${SEGMENT_COLORS[segment]}10` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-5 h-5" style={{ color: SEGMENT_COLORS[segment] }} />
                                <span className="text-2xl font-bold" style={{ color: SEGMENT_COLORS[segment] }}>{count}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 capitalize">{segment.replace('_', ' ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Churn Risk & Inventory in 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Churn Risk */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Churn Risk Customers</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Array.isArray(churnRiskCustomers) && churnRiskCustomers.slice(0, 10).map((customer) => (
                            <div
                                key={customer.userId}
                                className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{customer.name}</p>
                                        <p className="text-xs text-slate-500">{customer.email}</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Last purchase: {customer.daysSinceLastPurchase} days ago
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-slate-700">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-sm font-bold">{Math.round(customer.churnRiskScore * 100)}%</span>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1">₱{customer.lifetimeValue.toLocaleString()} LTV</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-2 font-medium">{customer.recommendedAction}</p>
                            </div>
                        ))}
                        {(!Array.isArray(churnRiskCustomers) || churnRiskCustomers.length === 0) && (
                            <p className="text-slate-500 text-center py-8">No high-risk customers identified</p>
                        )}
                    </div>
                </div>

                {/* Inventory Recommendations */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Inventory Alerts</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Array.isArray(inventoryRecommendations) && inventoryRecommendations.filter(r => r.action !== 'optimal').slice(0, 10).map((rec) => (
                            <div
                                key={rec.productId}
                                className="p-3 rounded-lg border"
                                style={{
                                    backgroundColor: `${ACTION_COLORS[rec.action]}10`,
                                    borderColor: ACTION_COLORS[rec.action]
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{rec.name}</p>
                                        <p className="text-xs text-slate-500">{rec.brand}</p>
                                        <div className="flex gap-4 mt-2 text-xs">
                                            <span>Current: <strong>{rec.currentStock}</strong></span>
                                            <span>Optimal: <strong>{rec.optimalStock}</strong></span>
                                            <span>Reorder: <strong>{rec.reorderPoint}</strong></span>
                                        </div>
                                    </div>
                                    <Package className="w-5 h-5" style={{ color: ACTION_COLORS[rec.action] }} />
                                </div>
                                <p className="text-xs font-medium mt-2 capitalize" style={{ color: ACTION_COLORS[rec.action] }}>
                                    {rec.action.replace('_', ' ')}
                                </p>
                            </div>
                        ))}
                        {(!Array.isArray(inventoryRecommendations) || inventoryRecommendations.filter(r => r.action !== 'optimal').length === 0) && (
                            <p className="text-slate-500 text-center py-8">All inventory levels are optimal</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Performance Matrix */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Product Performance Matrix</h2>
                {Array.isArray(productInsights) && productInsights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['star', 'cash_cow', 'question_mark', 'dog'].map((category) => {
                            const products = productInsights.filter(p => p.category === category);
                            return (
                                <div key={category} className="border rounded-lg p-4" style={{ borderColor: CATEGORY_COLORS[category] }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target className="w-5 h-5" style={{ color: CATEGORY_COLORS[category] }} />
                                        <h3 className="font-bold capitalize">{category.replace('_', ' ')}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {products.slice(0, 5).map((product) => (
                                            <div key={product.productId} className="text-sm">
                                                <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                                <div className="flex gap-2 text-xs text-slate-600">
                                                    <span>Growth: {product.growthRate.toFixed(1)}%</span>
                                                    <span>Margin: {product.profitMargin.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        ))}
                                        {products.length === 0 && (
                                            <p className="text-xs text-slate-500">No products in this category</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-12">Insufficient data for product analysis</p>
                )}
            </div>

            {/* Seasonal Trends */}
            {seasonalTrends && seasonalTrends.hasSeasonal && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Seasonal Trends</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-slate-700 mb-2">Peak Months</h3>
                            <div className="flex flex-wrap gap-2">
                                {seasonalTrends.peakMonths.map((month) => (
                                    <span key={month} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        {month}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-700 mb-2">Low Months</h3>
                            <div className="flex flex-wrap gap-2">
                                {seasonalTrends.lowMonths.map((month) => (
                                    <span key={month} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        {month}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-4">
                        Seasonality Strength: <strong>{(seasonalTrends.seasonalityStrength * 100).toFixed(1)}%</strong>
                    </p>
                </div>
            )}
        </div>
    );
}
