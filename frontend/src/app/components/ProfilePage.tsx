import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, ArrowLeft, Camera, ShieldCheck, Calendar, Save, X, Edit2, Loader2, Bell, BellOff } from "lucide-react";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
    const { user, isAuthenticated, token, updateUser } = useAuthStore();
    const {
        isSubscribed,
        loading: notifLoading,
        requestPermission,
        subscribeToNotifications,
        unsubscribeFromNotifications
    } = useNotificationStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || ""
    });

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update profile");
            }

            const data = await response.json();
            updateUser(data.user);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleNotifications = async () => {
        try {
            if (isSubscribed) {
                await unsubscribeFromNotifications();
                toast.success("Notifications disabled");
            } else {
                const granted = await requestPermission();
                if (granted && token) {
                    await subscribeToNotifications(token);
                    toast.success("Notifications enabled!");
                } else {
                    toast.error("Permission denied");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to toggle notifications");
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

                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 font-display">Account Settings</h1>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ name: user?.name || "", phone: user?.phone || "" });
                                    }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {}
                        <div className="md:col-span-1 space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600">
                                        <User className="w-12 h-12" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg border-2 border-white hover:bg-slate-800 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                                <p className="text-sm text-slate-500 font-medium mb-4">{user?.email}</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified Account
                                </div>
                            </div>

                            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <button className="w-full text-left px-6 py-4 bg-slate-50 text-blue-600 font-bold border-l-4 border-blue-600 transition-all">
                                    Personal Info
                                </button>
                                <button className="w-full text-left px-6 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all">
                                    Login & Security
                                </button>
                                <button className="w-full text-left px-6 py-4 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all">
                                    Notifications
                                </button>
                            </nav>
                        </div>

                        {}
                        <div className="md:col-span-2">
                            <ScrollAnimation variant="fade-up">
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                                        <p className="text-slate-500 text-sm">Update your personal details and how we contact you</p>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                                {!isEditing ? (
                                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                        <span className="font-semibold text-slate-900">{user?.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                                                    <Mail className="w-5 h-5 text-slate-400" />
                                                    <span className="font-semibold text-slate-900">{user?.email}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium">Email cannot be changed.</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                                                {!isEditing ? (
                                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Phone className="w-5 h-5 text-slate-400" />
                                                        <span className="font-semibold text-slate-900">{user?.phone || "Not provided"}</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                                                            placeholder="e.g. 09123456789"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined On</label>
                                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <span className="font-semibold text-slate-900">
                                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'long'
                                                        }) : "January 2024"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">Privacy Settings</h4>
                                                    <p className="text-sm text-slate-500">Manage how your data is displayed to others</p>
                                                </div>
                                                <button className="text-blue-600 font-bold hover:underline">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>

                            {}
                            <ScrollAnimation variant="fade-up" delay={0.1}>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
                                    <div className="p-8 border-b border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                                        <p className="text-slate-500 text-sm">Manage how you receive notifications</p>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        {}
                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                {isSubscribed ? (
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Bell className="w-6 h-6 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                                                        <BellOff className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-slate-900">
                                                        {isSubscribed ? "Notifications Enabled" : "Notifications Disabled"}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {isSubscribed
                                                            ? "You'll receive order updates and promotions"
                                                            : "Enable to get instant updates"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleToggleNotifications}
                                                disabled={notifLoading}
                                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isSubscribed
                                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {notifLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : isSubscribed ? (
                                                    "Disable"
                                                ) : (
                                                    "Enable"
                                                )}
                                            </button>
                                        </div>

                                        {}
                                        <div className="text-xs text-slate-400 space-y-1">
                                            <p>• You'll receive notifications for order updates, promotions, and special offers</p>
                                            <p>• You can disable notifications anytime from this page</p>
                                            <p>• Notifications work on Chrome, Firefox, Edge, and Safari (iOS 16.4+)</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
