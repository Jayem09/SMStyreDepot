import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Size {
    id: number;
    size_value: string;
    created_at: string;
}

export function AdminSizes() {
    const { token } = useAuthStore();
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSize, setNewSize] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
            const response = await fetch("/api/admin/sizes", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch sizes");
            const data = await response.json();
            setSizes(data.sizes || []);
        } catch (error) {
            console.error("Error fetching sizes:", error);
            toast.error("Failed to load sizes");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSize.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/admin/sizes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ size_value: newSize.trim() }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create size");
            }

            toast.success("Size added successfully");
            setNewSize("");
            fetchSizes();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSize = async (id: number) => {
        if (!confirm("Are you sure you want to delete this size? This may affect products using this size.")) return;

        try {
            const response = await fetch(`/api/admin/sizes/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete size");

            toast.success("Size deleted successfully");
            fetchSizes();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Product Sizes</h1>
                <p className="text-slate-500 mt-1">Manage available tyre sizes for products</p>
            </div>

            {}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <form onSubmit={handleCreateSize} className="flex gap-4 max-w-md">
                    <input
                        type="text"
                        placeholder="Enter size (e.g. 225/45R17)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newSize.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Size
                    </button>
                </form>
            </div>

            {}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {sizes.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                            No sizes found
                                        </td>
                                    </tr>
                                ) : (
                                    sizes.map((size) => (
                                        <tr key={size.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{size.size_value}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(size.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-600">
                                                <button
                                                    onClick={() => handleDeleteSize(size.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete size"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
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
