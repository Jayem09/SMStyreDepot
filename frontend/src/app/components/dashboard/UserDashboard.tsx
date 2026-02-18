import { useEffect, useState } from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import { User, ShoppingBag, MapPin, ChevronRight, Package, Clock, CheckCircle, RefreshCcw } from "lucide-react";
import { OrderStatusStepper } from "../ui/OrderStatusStepper";

interface Order {
    id: number;
    total: string;
    status: string;
    created_at: string;
    items_count?: number;
}

export function UserDashboard() {
    const { user, isAuthenticated, token } = useAuthStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        fetchOrders();

        
        const pollInterval = setInterval(fetchOrders, 30000);

        return () => clearInterval(pollInterval);
    }, [isAuthenticated, navigate, token]);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-slate-100 text-slate-700";
            case "shipped":
                return "bg-blue-50 text-blue-700";
            case "processing":
                return "bg-blue-50 text-blue-600";
            case "cancelled":
                return "bg-slate-50 text-slate-500";
            default:
                return "bg-slate-50 text-slate-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="w-4 h-4" />;
            case "shipped":
            case "processing":
                return <Package className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto px-4 py-12">
                {}
                <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                            <span className="text-2xl font-bold text-blue-600">
                                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || "User"}!</h1>
                            <p className="text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/profile"
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                            <User className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">My Profile</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </Link>

                                <Link
                                    to="/orders"
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                            <ShoppingBag className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">My Orders</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </Link>

                                <Link
                                    to="/products"
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                            <MapPin className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Shop Tyres</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                                <Link
                                    to="/orders"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                    View All
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-8 text-slate-500">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-4">No orders yet</p>
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex flex-col p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all gap-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                                        <Package className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-black text-slate-900 leading-none">Order #{order.id}</p>
                                                            {loading && <RefreshCcw className="w-3 h-3 text-blue-400 animate-spin" />}
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium">
                                                            {new Date(order.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-900 mb-1">
                                                        ₱{parseFloat(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border border-current uppercase tracking-wider ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {}
                                            <div className="pt-2 pb-4 border-t border-slate-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Status</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Updates</span>
                                                    </div>
                                                </div>
                                                <OrderStatusStepper status={order.status} />
                                            </div>

                                            <Link
                                                to="/orders"
                                                className="mt-2 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest border border-transparent hover:border-blue-100"
                                            >
                                                VIEW FULL DETAILS
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
