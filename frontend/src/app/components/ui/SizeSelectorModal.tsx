import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductVariant {
    id: number;
    size: string;
    price: number;
    stock: number;
    type: string;
}

interface SizeSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    brand: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
    variants: ProductVariant[];
    onAddToCart: (variant: ProductVariant) => void;
}

export function SizeSelectorModal({
    isOpen,
    onClose,
    productName,
    brand,
    description,
    imageUrl,
    imageUrls = [],
    variants,
    onAddToCart
}: SizeSelectorModalProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<number | "">("");
    const [isAdding, setIsAdding] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Combine imageUrl and imageUrls, removing duplicates and empty strings
    const allImages = Array.from(new Set([imageUrl, ...imageUrls])).filter(Boolean) as string[];
    const displayImages = allImages.length > 0 ? allImages : ["/images/tyres/default.jpg"];

    useEffect(() => {
        if (variants.length === 1 && variants[0]) {
            setSelectedVariantId(variants[0].id);
        } else {
            setSelectedVariantId("");
        }
        setCurrentImageIndex(0);
    }, [variants, isOpen]);

    if (!isOpen) return null;

    const selectedVariant = variants.find(v => v.id === selectedVariantId);

    const handleAdd = () => {
        const variant = selectedVariant;
        if (!variant) return;
        setIsAdding(true);
        setTimeout(() => {
            onAddToCart(variant);
            setIsAdding(false);
            onClose();
        }, 600);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[500px]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 z-50 p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur-sm rounded-full active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Left: Product Info */}
                    <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-white order-2 md:order-1">
                        <div className="space-y-6">
                            <div>
                                <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">TYRE DETAILS</span>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 lowercase first-letter:uppercase">
                                    {productName}
                                </h2>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-md mb-8">
                                    {description || "A premium performance tyre offering superior grip, comfort, and extended mileage for a smoother journey."}
                                </p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span className="text-sm font-semibold">{brand} — {selectedVariant?.type || variants[0]?.type || "Tyre"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span className="text-sm font-semibold">Size: {selectedVariant?.size || "Choose Size"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span className="text-sm font-semibold italic">
                                        Price: <span className="text-blue-600 font-bold">₱{selectedVariant ? selectedVariant.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "?.???"}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 max-w-sm">
                                <div className="relative w-full">
                                    <select
                                        value={selectedVariantId}
                                        onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                                        className="w-full h-14 pl-6 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:bg-white transition-all hover:border-slate-300"
                                    >
                                        <option value="" disabled>Select Tyre Size</option>
                                        {variants.map((v) => (
                                            <option key={v.id} value={v.id} disabled={v.stock === 0}>
                                                {v.size} {v.stock === 0 ? "— (Out of Stock)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!selectedVariantId || isAdding}
                                    className={`h-14 px-10 rounded-xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${!selectedVariantId || isAdding
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

                    {/* Right: Image Carousel */}
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
                                        alt={`${productName} - ${currentImageIndex + 1}`}
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
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
