import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { useWishlistStore } from "../stores/wishlistStore";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function WishlistPage() {
    useDocumentTitle("My Wishlist | SMS Tyre Depot");
    const { items, loading, fetchWishlist, toggleWishlist } = useWishlistStore();
    const { isAuthenticated, token } = useAuthStore();
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchWishlist(token);
        }
    }, [isAuthenticated, token, fetchWishlist]);

    const handleAddToCart = (product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            brand: product.brand,
            size: product.size,
            type: product.type,
            price: product.price,
            image: product.image_url || "",
        });
        toast.success(`${product.name} added to cart!`);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="pt-40 pb-20">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
                            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">Your Wishlist awaits</h1>
                            <p className="text-slate-500 mb-8">Please login to see the products you've saved for later.</p>
                            <Link
                                to="/login"
                                className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                            >
                                Login to continue
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO title="My Wishlist" description="View and manage the tyres you've saved for later." />
            <Header />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">MY WISHLIST</h1>
                            <p className="text-slate-500 font-medium">You have {items.length} items saved for later</p>
                        </div>
                        <Link
                            to="/products"
                            className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-slate-600 text-sm hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 group"
                        >
                            Continue Shopping
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                            <p className="text-slate-400 font-medium">Fetching your wishlist...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-slate-200" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Wishlist is empty</h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start browsing our collection and save your favorite tyres here.</p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                            >
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.map((product) => (
                                <ScrollAnimation key={product.id} variant="fade-up">
                                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative">
                                        <button
                                            onClick={() => token && toggleWishlist(String(product.id), token)}
                                            className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <Link to={`/product/${product.id}`} className="block">
                                            <div className="aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-8">
                                                <ImageWithFallback
                                                    src={product.image_url || "/images/tyres/default.jpg"}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </Link>

                                        <div className="p-6">
                                            <div className="text-[10px] font-black tracking-widest text-blue-600 mb-1 uppercase">{product.brand}</div>
                                            <Link to={`/product/${product.id}`}>
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">{product.size}</span>
                                                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">{product.type}</span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                                                <div className="text-lg font-black text-slate-900">
                                                    ₱{product.price.toLocaleString()}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    ADD
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollAnimation>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
