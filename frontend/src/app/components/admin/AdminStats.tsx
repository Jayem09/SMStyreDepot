import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { DollarSign, Package2, UserCheck, ShoppingCart } from "lucide-react";

interface DashboardStats {
    stats: {
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        ordersByStatus: Record<string, number>;
    };
    recentOrders: any[];
    lowStockProducts: any[];
}

export function AdminStats() {
    const { token } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [token]);

    const fetchStats = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/admin/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized. Please login as admin.");
                }
                throw new Error("Failed to fetch stats");
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="text-center py-12 text-blue-600">Failed to load dashboard</div>;
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `₱${stats.stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Orders",
            value: stats.stats.totalOrders,
            icon: ShoppingCart,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Products",
            value: stats.stats.totalProducts,
            icon: Package2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Users",
            value: stats.stats.totalUsers,
            icon: UserCheck,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Overview of your business</p>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                                </div>
                                <div className={`${card.bgColor} p-3 rounded-lg border border-blue-100`}>
                                    <Icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats.stats.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-2xl font-bold text-slate-900">{count}</p>
                            <p className="text-sm font-medium text-slate-500 capitalize mt-1">{status}</p>
                        </div>
                    ))}
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {stats.recentOrders.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No recent orders</p>
                        ) : (
                            stats.recentOrders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">Order #{order.id}</p>
                                        <p className="text-sm text-slate-500">
                                            {order.users?.name || "Unknown"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900 mb-1">
                                            ₱{parseFloat(order.total).toLocaleString()}
                                        </p>
                                        <span
                                            className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${order.status === "delivered"
                                                ? "bg-slate-100 text-slate-700 border-slate-200"
                                                : order.status === "pending"
                                                    ? "bg-slate-50 text-slate-600 border-slate-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Low Stock Products</h2>
                    <div className="space-y-3">
                        {stats.lowStockProducts.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">All products in stock</p>
                        ) : (
                            stats.lowStockProducts.map((product: any) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">{product.name}</p>
                                        <p className="text-sm text-slate-500">{product.brand}</p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${product.stock < 5 ? "text-blue-600" : "text-slate-700"
                                                }`}
                                        >
                                            {product.stock} left
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
