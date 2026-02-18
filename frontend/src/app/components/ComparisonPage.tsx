import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./common/SEO";
import { useComparisonStore } from '../stores/comparisonStore';
import { useCartStore } from '../stores/cartStore';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from 'react-router';
import { ArrowLeft, Trash2, ShoppingCart, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function ComparisonPage() {
    const { selectedProducts, removeFromComparison, clearComparison } = useComparisonStore();
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            brand: product.brand,
            size: product.size,
            type: product.type,
            price: product.price,
            image: product.image_url || "/images/tyres/default.jpg",
        });
        toast.success(`${product.name} added to cart!`);
    };

    if (selectedProducts.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-32 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-8 h-8 text-slate-300" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Comparison is Empty</h1>
                        <p className="text-slate-500 mb-10 text-sm leading-relaxed">
                            You haven't selected any tires to compare yet. Browse our inventory to start comparing specifications.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            BROWSE INVENTORY
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const ComparisonRow = ({ label, valueKey, format }: { label: string, valueKey: string, format?: (val: any) => React.ReactNode }) => (
        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="py-6 pr-8 align-top">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </td>
            {selectedProducts.map((product: any) => (
                <td key={product.id} className="py-6 px-4 align-top w-1/4">
                    <div className="text-slate-900 font-bold text-sm">
                        {format ? format(product[valueKey]) : product[valueKey] || "N/A"}
                    </div>
                </td>
            ))}
            {}
            {Array.from({ length: 4 - selectedProducts.length }).map((_, i) => (
                <td key={i} className="py-6 px-4 w-1/4"></td>
            ))}
        </tr>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            <SEO
                title="Compare Tyres"
                description="Compare your favorite tyre choices side-by-side. Review performance specifications, pricing, and availability to find the perfect fit for your vehicle."
            />
            <Header />

            <main className="py-20 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="space-y-4">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK TO SHOP</span>
                            </Link>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                                Compare <span className="text-blue-600">Items</span>
                            </h1>
                            <p className="text-slate-500 max-w-lg text-sm font-medium">
                                Side-by-side analysis of your top tire choices. Review performance, price, and availability to make the perfect choice.
                            </p>
                        </div>

                        <button
                            onClick={clearComparison}
                            className="bg-white text-slate-400 hover:text-red-500 border border-slate-200 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all hover:border-red-100 flex items-center gap-2 active:scale-95"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            CLEAR COMPARISON
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="py-10 px-8 text-left w-1/5 shrink-0">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">SPECIFICATIONS</span>
                                            </div>
                                        </th>
                                        {selectedProducts.map((product: any) => (
                                            <th key={product.id} className="py-10 px-4 text-left w-1/4 group relative">
                                                <div className="relative mb-6 group-hover:-translate-y-2 transition-transform duration-500 h-40">
                                                    <ImageWithFallback
                                                        src={product.image_url || "/images/tyres/default.jpg"}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
                                                    />
                                                </div>
                                                <div className="space-y-1 pr-6">
                                                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.brand}</div>
                                                    <div className="text-lg font-black text-slate-900 leading-tight line-clamp-2">{product.name}</div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromComparison(product.id)}
                                                    className="absolute top-8 right-2 p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </th>
                                        ))}
                                        {}
                                        {Array.from({ length: 4 - selectedProducts.length }).map((_, i) => (
                                            <th key={i} className="py-10 px-4 w-1/4">
                                                <div className="h-full border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 bg-slate-50/30">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                        <span className="text-slate-300 font-black text-xs">{selectedProducts.length + i + 1}</span>
                                                    </div>
                                                    <Link to="/products" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                                        Add Item
                                                    </Link>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="px-8">
                                    <ComparisonRow
                                        label="Price"
                                        valueKey="price"
                                        format={(val) => (
                                            <span className="text-xl text-blue-600">₱{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        )}
                                    />
                                    <ComparisonRow label="Size" valueKey="size" />
                                    <ComparisonRow label="Type" valueKey="type" />
                                    <ComparisonRow
                                        label="Stock Status"
                                        valueKey="stock"
                                        format={(val) => val > 0 ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-black uppercase tracking-wider">In Stock</span>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 text-[11px] font-black uppercase tracking-wider">Out of Stock</div>
                                        )}
                                    />
                                    <ComparisonRow
                                        label="Rating"
                                        valueKey="rating"
                                        format={(val) => (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <span className="text-slate-900 font-bold">{val || '4.5'}</span>
                                            </div>
                                        )}
                                    />
                                    <ComparisonRow
                                        label="Description"
                                        valueKey="description"
                                        format={(val) => (
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">{val || "Premium performance tyre with superior handling and wet-grid capabilities."}</p>
                                        )}
                                    />

                                    {}
                                    <tr className="bg-slate-50/30">
                                        <td className="py-10 pr-8"></td>
                                        {selectedProducts.map((product: any) => (
                                            <td key={product.id} className="py-10 px-4">
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock === 0}
                                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-widest transition-all ${product.stock === 0
                                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                        : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/5 hover:shadow-blue-500/20 active:scale-95"
                                                        }`}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    ADD TO CART
                                                </button>
                                            </td>
                                        ))}
                                        {}
                                        {Array.from({ length: 4 - selectedProducts.length }).map((_, i) => (
                                            <td key={i} className="py-10 px-4"></td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
