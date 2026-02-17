import { useNavigate } from 'react-router';
import { useComparisonStore } from '../stores/comparisonStore';
import { X, ArrowRight, BarChart2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ComparisonBar() {
    const { selectedProducts, removeFromComparison, clearComparison } = useComparisonStore();
    const navigate = useNavigate();

    if (selectedProducts.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 shadow-2xl shadow-blue-500/20 rounded-2xl border border-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
                        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                            <BarChart2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex gap-2">
                            {selectedProducts.map((product) => (
                                <div key={product.id} className="relative group shrink-0">
                                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-white/20">
                                        <ImageWithFallback
                                            src={product.image_url || "/images/tyres/default.jpg"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromComparison(product.id)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {Array.from({ length: 4 - selectedProducts.length }).map((_, i) => (
                                <div key={i} className="w-12 h-12 bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/20">
                                    <span className="text-[10px] font-bold">{selectedProducts.length + i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={clearComparison}
                            className="text-xs text-white/40 hover:text-white transition-colors font-bold tracking-tighter uppercase"
                        >
                            CLEAR
                        </button>
                        <button
                            onClick={() => navigate('/compare')}
                            disabled={selectedProducts.length < 2}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] tracking-widest transition-all ${selectedProducts.length >= 2
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20"
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                                }`}
                        >
                            COMPARE NOW
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
