import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { StructuredData } from "./StructuredData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Plus, Minus, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useProductStore } from "../stores/productStore";
import { useCartStore } from "../stores/cartStore";
import { useReviewStore } from "../stores/reviewStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { RatingStars } from "./ui/RatingStars";
import { ReviewSection } from "./ReviewSection";

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const products = useProductStore((state) => state.products);
    const addItem = useCartStore((state) => state.addItem);
    const { reviews, fetchProductReviews } = useReviewStore();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const product = id ? products.find((p) => p.id === Number(id)) : undefined;
    const variants = product ? products.filter(p => p.name === product.name && p.brand === product.brand) : [];

    // Combine imageUrl and imageUrls
    const allImages = product ? Array.from(new Set([product.image_url, ...(product.image_urls || [])])).filter(Boolean) as string[] : [];
    const displayImages = allImages.length > 0 ? allImages : ["/images/tyres/default.jpg"];

    const productReviews = product ? reviews[product.id] || [] : [];
    const avgRating = productReviews.length > 0
        ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
        : 0;

    useEffect(() => {
        if (!product && products.length > 0) {
            navigate("/products");
        }
        if (product) {
            fetchProductReviews(product.id);
        }
        window.scrollTo(0, 0);
    }, [product, products, navigate, fetchProductReviews]);

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container mx-auto px-4 py-32 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-slate-400 font-medium tracking-tight">Loading premium details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const handleAddToCart = () => {
        setIsAdding(true);
        setTimeout(() => {
            for (let i = 0; i < quantity; i++) {
                addItem({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    size: product.size,
                    type: product.type,
                    price: product.price,
                    image: product.image_url || "/images/tyres/default.jpg",
                });
            }
            toast.success(`${quantity} x ${product.name} added to cart!`);
            setIsAdding(false);
        }, 600);
    };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100">
            <SEO
                title={`${product.brand} ${product.name} — ${product.size}`}
                description={product.description || `Buy ${product.brand} ${product.name} (${product.size}) at SMS Tyre Depot. Premium performance and durability for your vehicle.`}
                image={product.image_url}
                type="product"
                url={`https://smstyredepot.com/product/${product.id}`}
            />
            <StructuredData
                type="Product"
                data={{
                    name: `${product.brand} ${product.name}`,
                    image: product.image_url || "https://smstyredepot.com/og-image.jpg",
                    description: product.description || `Premium ${product.type} tyre - ${product.size}`,
                    brand: {
                        "@type": "Brand",
                        name: product.brand
                    },
                    offers: {
                        "@type": "Offer",
                        price: product.price,
                        priceCurrency: "PHP",
                        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        url: `https://smstyredepot.com/product/${product.id}`
                    },
                    aggregateRating: productReviews.length > 0 ? {
                        "@type": "AggregateRating",
                        ratingValue: avgRating.toFixed(1),
                        reviewCount: productReviews.length
                    } : undefined
                }}
            />
            <Header />

            <main className="py-12 md:py-20 lg:py-32 bg-slate-50/50">
                <div className="container mx-auto px-4 flex flex-col items-center">

                    {/* Back Link */}
                    <div className="w-full max-w-5xl mb-8">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">BACK TO INVENTORY</span>
                        </Link>
                    </div>

                    {/* The "Modal" Design as a Page */}
                    <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px] mb-20">

                        {/* 1. Product Info (Exact match to SizeSelectorModal) */}
                        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-white order-2 md:order-1">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] block">TYRE DETAILS</span>
                                        {productReviews.length > 0 && (
                                            <>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <RatingStars rating={avgRating} size={12} className="opacity-80" />
                                            </>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 lowercase first-letter:uppercase tracking-tight">
                                        {product.name}
                                    </h1>
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                                        {product.description || "A premium performance tyre offering superior grip, comfort, and extended mileage for a smoother journey."}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm font-semibold">{product.brand} — {product.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm font-semibold">Size: {product.size}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm font-semibold italic">
                                            Price: <span className="text-blue-600 font-bold">₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 max-w-sm pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Variant Selection */}
                                        <div className="relative group">
                                            <select
                                                value={product.id}
                                                onChange={(e) => navigate(`/product/${e.target.value}`)}
                                                className="w-full h-14 pl-6 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:bg-white transition-all hover:border-slate-300"
                                            >
                                                {variants.map((v) => (
                                                    <option key={v.id} value={v.id} disabled={v.stock === 0}>
                                                        {v.size} {v.stock === 0 ? "— (Empty)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                <ChevronDown className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex h-14 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="flex-1 flex items-center justify-center hover:bg-slate-100 border-r border-slate-200 transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <div className="flex-1 flex items-center justify-center font-bold text-slate-900">
                                                {quantity}
                                            </div>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="flex-1 flex items-center justify-center hover:bg-slate-100 border-l border-slate-200 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0 || isAdding}
                                        className={`h-14 px-10 rounded-xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${product.stock === 0 || isAdding
                                            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                            : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
                                            }`}
                                    >
                                        {isAdding ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                                        ) : (
                                            "ADD TO CART"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Image Carousel (Exact match to SizeSelectorModal) */}
                        <div className="flex-1 bg-slate-50/50 relative flex items-center justify-center p-12 overflow-hidden min-h-[400px] order-1 md:order-2">

                            <div className="relative w-full h-full flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative z-10 w-full max-w-sm aspect-square flex items-center justify-center"
                                    >
                                        <ImageWithFallback
                                            src={displayImages[currentImageIndex]}
                                            alt={`${product.name} - ${currentImageIndex + 1}`}
                                            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-0 z-20 p-2 bg-white/50 hover:bg-white rounded-full shadow-sm transition-all active:scale-95"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-0 z-20 p-2 bg-white/50 hover:bg-white rounded-full shadow-sm transition-all active:scale-95"
                                        >
                                            <ChevronRight className="w-6 h-6 text-slate-600" />
                                        </button>

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                            {displayImages.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex
                                                        ? "bg-blue-600 w-4"
                                                        : "bg-slate-300 hover:bg-slate-400"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="w-full max-w-5xl">
                        <ReviewSection productId={product.id} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
