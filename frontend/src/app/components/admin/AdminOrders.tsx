import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
    users?: {
        name: string;
        email: string;
    };
}

export function AdminOrders() {
    const { token } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const url = statusFilter
                ? `/api/admin/orders?status=${statusFilter}`
                : "/api/admin/orders";

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch orders");
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (id: number) => {
        if (selectedOrder === id) {
            setSelectedOrder(null);
            setOrderDetails(null);
            return;
        }

        try {
            const response = await fetch(`/api/admin/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch order details");
            const data = await response.json();
            setOrderDetails(data.order);
            setSelectedOrder(id);
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/admin/orders/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error("Failed to update order status");
            fetchOrders();
            if (selectedOrder === id) {
                fetchOrderDetails(id);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status");
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-slate-100 text-slate-600 ring-slate-200",
            processing: "bg-blue-50 text-blue-600 ring-blue-100",
            shipped: "bg-blue-50 text-blue-700 ring-blue-200",
            delivered: "bg-slate-100 text-slate-700 ring-slate-200",
            cancelled: "bg-slate-50 text-slate-400 ring-slate-100 lg:line-through decoration-slate-400",
        };
        return colors[status] || "bg-slate-50 text-slate-600 ring-slate-200";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1">Manage customer orders</p>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading orders...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <>
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-900 font-medium">{order.users?.name || "Unknown"}</div>
                                                    <div className="text-sm text-slate-500">{order.users?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">₱{parseFloat(order.total.toString()).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ring-1 ring-inset ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => fetchOrderDetails(order.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        {selectedOrder === order.id ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {selectedOrder === order.id && orderDetails && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-6 bg-slate-50 border-t border-slate-200 inset-shadow-sm">
                                                        <div className="space-y-6 max-w-4xl mx-auto">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-bold text-slate-900 text-lg">Order Details</h3>
                                                                <span className="text-sm text-slate-500">Order #{order.id}</span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                                    <p className="text-xs font-medium text-slate-500 uppercase mb-3">Shipping Information</p>
                                                                    <div className="space-y-1">
                                                                        <p className="font-medium text-slate-900">{orderDetails.shipping_address}</p>
                                                                        <p className="text-slate-600">{orderDetails.shipping_city}, {orderDetails.shipping_state} {orderDetails.shipping_zip}</p>
                                                                        <p className="text-slate-600 mt-2 flex items-center gap-2">
                                                                            <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">📞</span>
                                                                            {orderDetails.shipping_phone}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-medium text-slate-500 uppercase mb-3">Order Items</p>
                                                                    <div className="space-y-2">
                                                                        {orderDetails.items?.map((item: any, index: number) => (
                                                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                                                                <div>
                                                                                    <p className="font-medium text-slate-900">{item.products?.name}</p>
                                                                                    <p className="text-sm text-slate-500">{item.products?.brand} - {item.products?.size}</p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="font-medium text-slate-900">₱{parseFloat(item.price).toLocaleString()}</p>
                                                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="mt-4 flex justify-end items-center gap-2 pt-4 border-t border-slate-200">
                                                                        <span className="text-slate-500">Total Amount:</span>
                                                                        <span className="text-xl font-bold text-slate-900">₱{parseFloat(order.total.toString()).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
