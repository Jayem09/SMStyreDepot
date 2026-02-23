import React, { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!token) {
            setError("Invalid reset token");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setSubmitted(true);
            toast.success("Password reset successfully!");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h2>
                    <p className="text-slate-500 mb-8">This password reset link is invalid or has expired.</p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-600 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
                    <p className="text-slate-500 mb-8">Your password has been successfully reset. You can now login.</p>
                    <Link
                        to="/login"
                        className="block w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mx-auto mb-4 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h2>
                    <p className="text-slate-500 text-sm mt-1">Please enter your new password below</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
