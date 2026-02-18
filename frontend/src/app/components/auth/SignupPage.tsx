import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/authStore";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function SignupPage() {
    useDocumentTitle("Create Account");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        
        if (!acceptTerms) {
            setError("Please accept the Terms of Service and Privacy Policy");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || null,
                }),
            });

            
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error("Server response was not valid JSON");
            }

            if (!response.ok) {
                
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(", ");
                    throw new Error(errorMessages || data.error || "Registration failed");
                }
                throw new Error(data.error || `Registration failed: ${response.statusText}`);
            }

            
            toast.success("Account created successfully!", {
                description: "Welcome! You can now login to your account.",
                duration: 4000,
            });

            
            login(data.user, data.token);

            
            navigate("/");
        } catch (err: any) {
            let errorMessage = "Registration failed. Please try again.";

            if (err.message) {
                errorMessage = err.message;
            } else if (err instanceof TypeError && err.message.includes("fetch")) {
                errorMessage = "Cannot connect to server. Please make sure the backend is running.";
            } else if (err.name === "NetworkError" || err.message.includes("NetworkError")) {
                errorMessage = "Network error. Please check your connection.";
            }

            setError(errorMessage);
            toast.error("Registration failed", {
                description: errorMessage,
                duration: 4000,
            });
            console.error("Signup error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {}
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mx-auto mb-4 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 text-sm mt-1">Join us today and get exclusive access</p>
                </div>

                {}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            {}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="name@example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                                {}
                                {formData.password && (
                                    <div className="pt-2 px-1">
                                        <div className="flex gap-1.5 mb-2">
                                            {[0, 1, 2, 3].map((index) => (
                                                <div
                                                    key={index}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${index < passwordStrength
                                                        ? strengthColors[passwordStrength - 1]
                                                        : "bg-slate-100"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {passwordStrength === 0 && "Strength: Very Weak"}
                                            {passwordStrength === 1 && "Strength: Weak"}
                                            {passwordStrength === 2 && "Strength: Fair"}
                                            {passwordStrength === 3 && "Strength: Good"}
                                            {passwordStrength === 4 && "Strength: Strong"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {}
                        <label className="flex items-start gap-3 cursor-pointer group px-1">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    required
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                                />
                            </div>
                            <span className="text-xs font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                                I agree to the <Link to="/terms" className="text-blue-600 font-bold hover:underline">Terms</Link> and <Link to="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>
                            </span>
                        </label>

                        {}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
