import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuthStore } from "../stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Package, Clock, CheckCircle, ChevronRight, ArrowLeft, X, MapPin, Phone, Loader2 } from "lucide-react";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { OrderStatusStepper } from "./ui/OrderStatusStepper";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OrderItem {
    quantity: number;
    price: number;
    product_id: string;
    name: string;
    brand: string;
    size: string;
    image: string;
}

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
    item_count: number;
    shipping_address?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_zip?: string;
    shipping_phone?: string;
    payment_method?: string;
    items?: OrderItem[];
}

export function OrdersPage() {
    const { isAuthenticated, token } = useAuthStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]);

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

    const fetchOrderDetails = async (orderId: number) => {
        try {
            setLoadingDetail(true);
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedOrder(data.order);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-50 text-green-700 border-green-100";
            case "shipped":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "processing":
            case "reserved":
                return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case "cancelled":
                return "bg-slate-50 text-slate-500 border-slate-100";
            default:
                return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return <CheckCircle className="w-4 h-4" />;
            case "shipped":
            case "processing":
            case "reserved":
                return <Package className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Orders</h1>
                    <p className="text-slate-500">View and track all your tyre purchases</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-slate-100"></div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            When you make a purchase, your orders will appear here for you to track.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <ScrollAnimation key={order.id} variant="fade-up" delay={index * 50}>
                                <div
                                    onClick={() => fetchOrderDetails(order.id)}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group cursor-pointer"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-slate-900 text-lg">Order #{order.id}</h3>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border border-current uppercase tracking-wider ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium mb-3">
                                                    Placed on {new Date(order.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })} • {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                                                </p>

                                                {/* Stepper for detail */}
                                                <div className="max-w-md hidden md:block">
                                                    <OrderStatusStepper status={order.status} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-xl font-black text-slate-900">
                                                    ₱{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                )}
            </main>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:p-6 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedOrder(null)}
                    />

                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Details</h2>
                                <p className="text-slate-500 font-medium">Order #{selectedOrder.id} • Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                                            Order Items
                                        </h3>
                                        <div className="space-y-3">
                                            {loadingDetail ? (
                                                <div className="flex justify-center py-12">
                                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                                </div>
                                            ) : (
                                                selectedOrder.items?.map((item, i) => (
                                                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                                                        <div className="w-20 h-20 bg-white rounded-xl p-2 border border-slate-200 flex-shrink-0">
                                                            <ImageWithFallback
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.brand}</p>
                                                            <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                                                            <p className="text-sm text-slate-500 font-medium">Size: {item.size}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-slate-900">₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                            <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                            <p className="text-xs font-black text-slate-900 mt-1">
                                                                ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Tracking Stepper */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-inner">
                                        <h3 className="font-bold text-slate-900 mb-6">Tracking Status</h3>
                                        <OrderStatusStepper status={selectedOrder.status} />
                                    </div>
                                </div>

                                {/* Right: Summary & Shipping */}
                                <div className="space-y-6">
                                    {/* Order Summary */}
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            Summary
                                        </h3>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-slate-400 text-sm">
                                                <span>Subtotal</span>
                                                <span className="text-slate-200">₱{selectedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400 text-sm">
                                                <span>Shipping</span>
                                                <span className="text-green-400">FREE</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                                                <span className="font-bold">Total</span>
                                                <span className="text-2xl font-black">₱{selectedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-3 text-xs text-center font-medium">
                                            Payment Method: <span className="font-black uppercase tracking-widest">{selectedOrder.payment_method || 'GCash'}</span>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            Shipping Info
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Address</p>
                                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                                    {selectedOrder.shipping_address}<br />
                                                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Contact</p>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <Phone className="w-3 h-3" />
                                                    {selectedOrder.shipping_phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
