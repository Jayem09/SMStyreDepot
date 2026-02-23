import React, { useState } from "react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setSubmitted(true);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center animate-in zoom-in duration-300">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        We've sent a password reset link to <br />
                        <span className="font-semibold text-slate-900">{email}</span>
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
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
                        <KeyRound className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
                    <p className="text-slate-500 text-sm mt-1">No worries, we'll send you reset instructions.</p>
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
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending Link..." : "Send Reset Link"}
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
