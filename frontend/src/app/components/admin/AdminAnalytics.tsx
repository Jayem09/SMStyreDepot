import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, CreditCard, Loader2 } from 'lucide-react';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'];
const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#10b981',
    delivered: '#6366f1',
    cancelled: '#ef4444',
};

export function AdminAnalytics() {
    const {
        overview,
        salesTimeline,
        bestSellers,
        revenueByBrand,
        revenueByCategory,
        orderStatusDistribution,
        customerStats,
        loading,
        error,
        fetchAll,
        fetchSalesTimeline,
    } = useAnalyticsStore();

    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        fetchAll(period);
    }, []);

    const handlePeriodChange = async (newPeriod: string) => {
        setPeriod(newPeriod);
        await fetchSalesTimeline(newPeriod);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Error loading analytics: {error}
                </div>
            </div>
        );
    }

    const periodLabels: Record<string, string> = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '90d': 'Last 90 Days',
        '1y': 'Last Year',
    };

    return (
        <div className="space-y-6 pb-12">
            {}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Track your business performance</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                </select>
            </div>

            {}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`₱${overview.totalRevenue.toLocaleString()}`}
                        change={overview.changes.revenue}
                        icon={DollarSign}
                        color="blue"
                    />
                    <StatCard
                        title="Total Orders"
                        value={overview.totalOrders.toString()}
                        change={overview.changes.orders}
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatCard
                        title="Avg Order Value"
                        value={`₱${overview.avgOrderValue.toLocaleString()}`}
                        icon={CreditCard}
                        color="blue"
                    />
                    <StatCard
                        title="Total Customers"
                        value={overview.totalCustomers.toString()}
                        icon={Users}
                        color="blue"
                    />
                </div>
            )}

            {}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Sales Timeline - {periodLabels[period]}
                </h2>
                {salesTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesTimeline}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                                formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Revenue']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-slate-500 text-center py-12">No sales data available</p>
                )}
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">🏆 Best Sellers</h2>
                    <div className="space-y-3">
                        {bestSellers.slice(0, 10).map((product, index) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                <img
                                    src={product.image_url || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                    <p className="text-sm text-slate-500">{product.brand}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₱{product.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">{product.units_sold} units</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Revenue by Brand</h2>
                    {revenueByBrand.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={revenueByBrand.slice(0, 6)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ brand, percent }) => `${brand} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="revenue"
                                >
                                    {revenueByBrand.slice(0, 6).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `₱${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-500 text-center py-12">No brand data available</p>
                    )}
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Revenue by Category</h2>
                    {revenueByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueByCategory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-500 text-center py-12">No category data available</p>
                    )}
                </div>

                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Order Status Distribution</h2>
                    {orderStatusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="count"
                                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {orderStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-500 text-center py-12">No order data available</p>
                    )}
                </div>
            </div>

            {}
            {customerStats && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-3xl font-bold text-blue-600">{customerStats.newCustomers}</p>
                            <p className="text-sm text-slate-600 mt-1">New Customers</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-3xl font-bold text-blue-600">{customerStats.returningCustomers}</p>
                            <p className="text-sm text-slate-600 mt-1">Returning Customers</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-3xl font-bold text-blue-600">
                                {customerStats.returningCustomers > 0
                                    ? Math.round((customerStats.returningCustomers / customerStats.totalCustomers) * 100)
                                    : 0}%
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Retention Rate</p>
                        </div>
                    </div>
                    {customerStats.growth.length > 0 && (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={customerStats.growth}>
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
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    icon: any;
    color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
    const hasChange = change !== undefined;
    const isPositive = change && change > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`bg-${color}-50 p-2 rounded-lg border border-${color}-100`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
            {hasChange && (
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(change!).toFixed(1)}%
                    </span>
                    <span className="text-sm text-slate-500">vs last period</span>
                </div>
            )}
        </div>
    );
}
