import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Plus, Edit, Trash2, Search, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: number;
    name: string;
    brand: string;
    size: string;
    type: string;
    price: number;
    description?: string;
    image_url?: string;
    image_urls?: string[];
    stock: number;
    rating: number;
    is_featured?: boolean;
}

export function AdminProducts() {
    const { token } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [availableSizes, setAvailableSizes] = useState<{ id: number; size_value: string }[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        size: "",
        type: "",
        price: "",
        description: "",
        image_url: "",
        image_urls: [] as string[],
        stock: "",
        is_featured: false,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

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
            setAvailableSizes(data.sizes || []);
        } catch (error) {
            console.error("Error fetching sizes:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            // Fetch all products for client-side filtering
            const response = await fetch("/api/admin/products?limit=1000", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct.id}`
                : "/api/admin/products";

            const method = editingProduct ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || "Failed to save product");
            }

            setShowModal(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
            toast.success(editingProduct ? "Product updated successfully!" : "Product created successfully!");
        } catch (error: any) {
            console.error("Error saving product:", error);
            toast.error(error.message || "Failed to save product");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);

        // Ensure image_url is included in previews if image_urls is empty
        let urls = product.image_urls || [];
        if (urls.length === 0 && product.image_url) {
            urls = [product.image_url];
        }

        setFormData({
            name: product.name,
            brand: product.brand,
            size: product.size?.trim() || "", // Trim to ensure matching
            type: product.type,
            price: product.price.toString(),
            description: product.description || "",
            image_url: product.image_url || "",
            image_urls: urls,
            stock: product.stock.toString(),
            is_featured: product.is_featured || false,
        });
        setImagePreviews(urls);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete product");
            fetchProducts();
            toast.success("Product deleted successfully");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            brand: "",
            size: "",
            type: "",
            price: "",
            description: "",
            image_url: "",
            image_urls: [],
            stock: "",
            is_featured: false,
        });
        setImagePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = 5 - imagePreviews.length;
        if (remainingSlots <= 0) {
            toast.warning("Maximum 5 images allowed");
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreviews(prev => {
                    const next = [...prev, base64String];
                    setFormData(fd => ({
                        ...fd,
                        image_urls: next,
                        image_url: next[0] || "" // Primary image is the first one
                    }));
                    return next;
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => {
            const next = prev.filter((_, i) => i !== index);
            setFormData(fd => ({
                ...fd,
                image_urls: next,
                image_url: next[0] || ""
            }));
            return next;
        });
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        resetForm();
        setShowModal(true);
    };

    const filteredProducts = products.filter((product) => {
        const query = search.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.size.toLowerCase().includes(query) ||
            product.price.toString().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1">Manage your product catalog</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by Product, Brand, Size, or Price..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="text-center py-12">Loading products...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{product.name}</div>
                                                <div className="text-sm text-slate-500">{product.type}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{product.brand}</td>
                                            <td className="px-6 py-4 text-slate-600">{product.size}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">₱{product.price.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${product.stock < 10
                                                        ? "bg-slate-50 text-blue-600 border-blue-100"
                                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                                        }`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingProduct ? "Edit Product" : "Create Product"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
                                    <select
                                        required
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select size</option>
                                        {availableSizes.map((s) => (
                                            <option key={s.id} value={s.size_value}>
                                                {s.size_value}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Don't see the size? Manage sizes in the <span className="text-blue-600 font-medium">Sizes</span> section.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select type</option>
                                        <option value="Summer">Summer</option>
                                        <option value="Winter">Winter</option>
                                        <option value="All-Season">All-Season</option>
                                        <option value="All Season">All Season</option>
                                        <option value="Off-Road">Off-Road</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Product Images (Up to 5)</label>
                                <div className="grid grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full text-slate-500 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                                        >
                                            <div className="text-center">
                                                <ImageIcon className="w-6 h-6 mx-auto text-slate-400 group-hover:text-blue-500" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Upload</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">First image will be the primary thumbnail</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="is_featured" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Display as Featured Product on Homepage
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingProduct ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
