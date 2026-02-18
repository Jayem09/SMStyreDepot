import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/authStore";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function LoginPage() {
    useDocumentTitle("Login");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                {}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mx-auto mb-4 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
                </div>

                {}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <form
                        className="space-y-5"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setError("");
                            setLoading(true);

                            try {
                                const response = await fetch("/api/auth/login", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ email, password }),
                                });

                                const data = await response.json();

                                if (!response.ok) {
                                    throw new Error(data.error || "Login failed");
                                }

                                
                                login(data.user, data.token);

                                
                                toast.success("Login successful!", {
                                    description: `Welcome back, ${data.user.name}!`,
                                    duration: 3000,
                                });

                                
                                navigate("/");
                            } catch (err: any) {
                                const errorMessage = err.message || "Login failed. Please try again.";
                                setError(errorMessage);
                                toast.error("Login failed", {
                                    description: errorMessage,
                                    duration: 4000,
                                });
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {}
                        <label className="flex items-center gap-3 cursor-pointer group px-1">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                Remember me for 30 days
                            </span>
                        </label>

                        {}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {}
                <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link to="/terms" className="text-slate-600 hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-slate-600 hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}