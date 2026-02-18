import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    X,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    Ruler,
    Trophy
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { AdminStats } from "./AdminStats";
import { AdminProducts } from "./AdminProducts";
import { AdminOrders } from "./AdminOrders";
import { AdminUsers } from "./AdminUsers";
import { AdminSizes } from "./AdminSizes";
import { AdminBrands } from "./AdminBrands";
import { AdminAnalytics } from "./AdminAnalytics";
import { AdminIntelligence } from "./AdminIntelligence";
import { BarChart3, Brain } from "lucide-react";

type AdminPage = "dashboard" | "analytics" | "intelligence" | "products" | "orders" | "users" | "sizes" | "brands";

export function AdminDashboard() {
    const [activePage, setActivePage] = useState<AdminPage>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isAdmin } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
        }
    }, [isAdmin, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const menuItems = [
        { id: "dashboard" as AdminPage, label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics" as AdminPage, label: "Analytics", icon: BarChart3 },
        { id: "intelligence" as AdminPage, label: "Intelligence", icon: Brain },
        { id: "products" as AdminPage, label: "Products", icon: Package },
        { id: "orders" as AdminPage, label: "Orders", icon: ShoppingCart },
        { id: "users" as AdminPage, label: "Users", icon: Users },
        { id: "sizes" as AdminPage, label: "Sizes", icon: Ruler },
        { id: "brands" as AdminPage, label: "Brands", icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {}
            <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {}
                <aside
                    className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out`}
                >
                    <div className="h-full flex flex-col">
                        {}
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
                            <p className="text-sm text-slate-500 mt-1">SMS Tyre Depot</p>
                        </div>

                        {}
                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActivePage(item.id);
                                            setSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === item.id
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {}
                        <div className="p-4 border-t border-slate-200">
                            <div className="mb-3 px-4 py-2 bg-slate-50 rounded-lg">
                                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="ml-2">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {}
                <main className="flex-1 p-4 lg:p-8">
                    {activePage === "dashboard" && <AdminStats />}
                    {activePage === "analytics" && <AdminAnalytics />}
                    {activePage === "intelligence" && <AdminIntelligence />}
                    {activePage === "products" && <AdminProducts />}
                    {activePage === "orders" && <AdminOrders />}
                    {activePage === "users" && <AdminUsers />}
                    {activePage === "sizes" && <AdminSizes />}
                    {activePage === "brands" && <AdminBrands />}
                </main>
            </div>
        </div>
    );
}
