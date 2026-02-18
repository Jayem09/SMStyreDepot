import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Mail className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
                        <p className="text-slate-600 mb-6">
                            We've sent a password reset link to {email}
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                        <p className="text-blue-100 text-sm">Enter your email to reset your password</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Send Reset Link
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
