import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Trash2, Plus, Loader2, Edit2, Image as ImageIcon, Search, Check, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface Brand {
    id: number;
    name: string;
    logo: string;
    description: string;
    created_at: string;
}

export function AdminBrands() {
    const { token } = useAuthStore();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        description: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const [availableAssets, setAvailableAssets] = useState<{ name: string, path: string }[]>([]);
    const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(false);

    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBrands();
        fetchAssets();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/brands", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch brands");
            const data = await response.json();
            setBrands(data.brands || []);
        } catch (error) {
            console.error("Error fetching brands:", error);
            toast.error("Failed to load brands");
        } finally {
            setLoading(false);
        }
    };

    const fetchAssets = async () => {
        try {
            setLoadingAssets(true);
            const response = await fetch("/api/admin/brands/assets", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch assets");
            const data = await response.json();
            setAvailableAssets(data.assets || []);
        } catch (error) {
            console.error("Error fetching assets:", error);
        } finally {
            setLoadingAssets(false);
        }
    };

    const handleOpenModal = (brand: Brand | null = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                logo: brand.logo || "",
                description: brand.description || ""
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: "",
                logo: "",
                description: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSelectAsset = (path: string) => {
        setFormData({ ...formData, logo: path });
        setIsAssetPickerOpen(false);
    };

    const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        
        if (!file.type.startsWith("image/")) {
            toast.error("File must be an image");
            return;
        }

        
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image is too large (max 5MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, logo: base64String }));
            toast.success("Logo uploaded successfully");
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            const url = editingBrand
                ? `/api/admin/brands/${editingBrand.id}`
                : "/api/admin/brands";

            const method = editingBrand ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save brand");
            }

            toast.success(editingBrand ? "Brand updated successfully" : "Brand added successfully");
            setIsModalOpen(false);
            fetchBrands();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;

        try {
            const response = await fetch(`/api/admin/brands/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete brand");

            toast.success("Brand deleted successfully");
            fetchBrands();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tyre Brands</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage the brands displayed on the shop and brands page</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add New Brand
                </button>
            </div>

            {}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                </div>
                <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Brands</span>
                    <span className="text-xl font-black text-blue-600">{brands.length}</span>
                </div>
            </div>

            {}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBrands.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No brands found</p>
                        </div>
                    ) : (
                        filteredBrands.map((brand) => (
                            <div key={brand.id} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col">
                                <div className="aspect-video bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 p-4">
                                    <ImageWithFallback
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{brand.name}</h3>
                                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-grow">{brand.description || "No description provided."}</p>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleOpenModal(brand)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingBrand ? "Edit Brand" : "Add New Brand"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                    placeholder="e.g. Michelin"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Brand Logo</label>

                                <div className="grid grid-cols-2 gap-4">
                                    {}
                                    <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden p-4 relative group">
                                        {formData.logo ? (
                                            <>
                                                <img src={formData.logo} alt="Preview" className="max-w-full max-h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, logo: "" })}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Logo</p>
                                            </div>
                                        )}
                                    </div>

                                    {}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square bg-blue-50/30 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center px-4">
                                            Upload from Computer
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLocalFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Select Previous Assets</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAssetPickerOpen(!isAssetPickerOpen)}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                            {isAssetPickerOpen ? "Close Picker" : "Browse Assets"}
                                        </button>
                                    </div>

                                    {isAssetPickerOpen && (
                                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                                            {loadingAssets ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                                </div>
                                            ) : availableAssets.length === 0 ? (
                                                <p className="text-center text-xs text-slate-400 font-bold uppercase py-4">No local logs found</p>
                                            ) : (
                                                <div className="grid grid-cols-4 gap-3">
                                                    {availableAssets.map((asset) => (
                                                        <button
                                                            key={asset.path}
                                                            type="button"
                                                            onClick={() => handleSelectAsset(asset.path)}
                                                            className={`aspect-square bg-white rounded-lg border-2 flex items-center justify-center p-2 transition-all group relative ${formData.logo === asset.path ? "border-blue-600 shadow-lg shadow-blue-500/10" : "border-slate-100 hover:border-blue-200"
                                                                }`}
                                                            title={asset.name}
                                                        >
                                                            <img src={asset.path} alt={asset.name} className="max-w-full max-h-full object-contain" />
                                                            {formData.logo === asset.path && (
                                                                <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                                                                    <Check className="w-2 h-2 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.logo}
                                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                            placeholder="/images/brands/michelin.png or Base64"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium h-32 resize-none"
                                    placeholder="A brief description of the brand..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingBrand ? "Update Brand" : "Create Brand"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
