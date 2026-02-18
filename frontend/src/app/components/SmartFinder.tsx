import { useState, useEffect } from "react";
import { ChevronRight, Car, Settings2, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useProductStore } from "../stores/productStore";

interface SmartFinderProps {
    onSizeSelected: (size: string) => void;
}

export function SmartFinder({ onSizeSelected }: SmartFinderProps) {
    const products = useProductStore((state) => state.products);

    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [trims, setTrims] = useState<{ trim: string; tyre_size: string }[]>([]);

    const [selectedMake, setSelectedMake] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedTrim, setSelectedTrim] = useState("");
    const [foundSize, setFoundSize] = useState("");

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchMakes();
    }, []);

    const fetchMakes = async () => {
        setIsLoading(prev => ({ ...prev, makes: true }));
        try {
            const res = await fetch("/api/vehicles/makes");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMakes(data);
            } else {
                if (data && data.error) toast.error(`Database Error: ${data.error}`);
                setMakes([]);
            }
        } catch (e) {
            console.error("Failed to fetch makes:", e);
        } finally {
            setIsLoading(prev => ({ ...prev, makes: false }));
        }
    };

    const handleMakeChange = async (make: string) => {
        setSelectedMake(make);
        setSelectedModel("");
        setSelectedYear("");
        setSelectedTrim("");
        setFoundSize("");
        setModels([]);
        setStep(1);

        if (make) {
            setStep(2);
            setIsLoading(prev => ({ ...prev, models: true }));
            try {
                const res = await fetch(`/api/vehicles/models?make=${make}`);
                const data = await res.json();
                setModels(data);
            } catch (e) {
                toast.error("Error loading models");
            } finally {
                setIsLoading(prev => ({ ...prev, models: false }));
            }
        }
    };

    const handleModelChange = async (model: string) => {
        setSelectedModel(model);
        setSelectedYear("");
        setSelectedTrim("");
        setFoundSize("");
        setYears([]);

        if (model) {
            setStep(3);
            setIsLoading(prev => ({ ...prev, years: true }));
            try {
                const res = await fetch(`/api/vehicles/years?make=${selectedMake}&model=${model}`);
                const data = await res.json();
                setYears(data);
            } catch (e) {
                toast.error("Error loading years");
            } finally {
                setIsLoading(prev => ({ ...prev, years: false }));
            }
        }
    };

    const handleYearChange = async (year: string) => {
        setSelectedYear(year);
        setSelectedTrim("");
        setFoundSize("");
        setTrims([]);

        if (year) {
            setStep(4);
            setIsLoading(prev => ({ ...prev, trims: true }));
            try {
                const res = await fetch(`/api/vehicles/trims?make=${selectedMake}&model=${selectedModel}&year=${year}`);
                const data = await res.json();
                setTrims(data);
            } catch (e) {
                toast.error("Error loading trims");
            } finally {
                setIsLoading(prev => ({ ...prev, trims: false }));
            }
        }
    };

    const handleTrimChange = (trimAndSize: string) => {
        if (!trimAndSize) return;
        const parts = trimAndSize.split("|");
        if (parts.length >= 2) {
            setSelectedTrim(parts[0] as string);
            setFoundSize(parts[1] as string);
            setStep(5);
        }
    };

    const handleApply = () => {
        if (foundSize) {
            onSizeSelected(foundSize);
            toast.success(`Filters applied for size: ${foundSize}`);
        }
    };

    const handleReset = () => {
        setSelectedMake("");
        setSelectedModel("");
        setSelectedYear("");
        setSelectedTrim("");
        setFoundSize("");
        setStep(1);
    };

    const getStockAvailability = () => {
        if (!foundSize) return null;
        const matchingProducts = products.filter(p => p.size === foundSize);
        const inStock = matchingProducts.some(p => p.stock > 0);
        return {
            count: matchingProducts.length,
            inStock
        };
    };

    const availability = getStockAvailability();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold">Smart Finder</h2>
                        <p className="text-slate-400 text-xs">Search by vehicle specification</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${step > s ? "bg-green-500" : step === s ? "bg-blue-500 w-4" : "bg-slate-600"}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleReset}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Reset Selection"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {}
                    <div className="space-y-1.5 relative group">
                        <label className={`text-[10px] uppercase tracking-wider font-bold transition-colors ml-1 ${step >= 1 ? "text-blue-600" : "text-slate-500"}`}>1. Make</label>
                        <div className="relative">
                            <select
                                value={selectedMake}
                                onChange={(e) => handleMakeChange(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all group-hover:border-blue-300"
                            >
                                <option value="">Select Make</option>
                                {makes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            {isLoading.makes && <Loader2 className="absolute right-8 top-3.5 w-4 h-4 animate-spin text-blue-500" />}
                            {selectedMake && !isLoading.makes && <CheckCircle2 className="absolute right-8 top-3.5 w-4 h-4 text-green-500" />}
                        </div>
                    </div>

                    {}
                    <div className="space-y-1.5 relative group">
                        <label className={`text-[10px] uppercase tracking-wider font-bold transition-colors ml-1 ${step >= 2 ? "text-blue-600" : "text-slate-500"}`}>2. Model</label>
                        <div className="relative">
                            <select
                                value={selectedModel}
                                onChange={(e) => handleModelChange(e.target.value)}
                                disabled={!selectedMake || isLoading.models}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 transition-all group-hover:border-blue-300"
                            >
                                <option value="">Select Model</option>
                                {models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            {isLoading.models && <Loader2 className="absolute right-8 top-3.5 w-4 h-4 animate-spin text-blue-500" />}
                            {selectedModel && !isLoading.models && <CheckCircle2 className="absolute right-8 top-3.5 w-4 h-4 text-green-500" />}
                        </div>
                    </div>

                    {}
                    <div className="space-y-1.5 relative group">
                        <label className={`text-[10px] uppercase tracking-wider font-bold transition-colors ml-1 ${step >= 3 ? "text-blue-600" : "text-slate-500"}`}>3. Year</label>
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                disabled={!selectedModel || isLoading.years}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 transition-all group-hover:border-blue-300"
                            >
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            {isLoading.years && <Loader2 className="absolute right-8 top-3.5 w-4 h-4 animate-spin text-blue-500" />}
                            {selectedYear && !isLoading.years && <CheckCircle2 className="absolute right-8 top-3.5 w-4 h-4 text-green-500" />}
                        </div>
                    </div>

                    {}
                    <div className="space-y-1.5 relative group">
                        <label className={`text-[10px] uppercase tracking-wider font-bold transition-colors ml-1 ${step >= 4 ? "text-blue-600" : "text-slate-500"}`}>4. Trim / Engine</label>
                        <div className="relative">
                            <select
                                value={selectedTrim ? `${selectedTrim}|${foundSize}` : ""}
                                onChange={(e) => handleTrimChange(e.target.value)}
                                disabled={!selectedYear || isLoading.trims}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 transition-all group-hover:border-blue-300"
                            >
                                <option value="">Select Trim</option>
                                {trims.map(t => <option key={t.trim} value={`${t.trim}|${t.tyre_size}`}>{t.trim}</option>)}
                            </select>
                            {isLoading.trims && <Loader2 className="absolute right-8 top-3.5 w-4 h-4 animate-spin text-blue-500" />}
                            {selectedTrim && !isLoading.trims && <CheckCircle2 className="absolute right-8 top-3.5 w-4 h-4 text-green-500" />}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {foundSize && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale pointer-events-none">
                                    <Car className="w-32 h-32" />
                                </div>

                                <div className="flex items-center gap-4 text-blue-900 relative z-10">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                                        <Settings2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Recommended Size</p>
                                            {availability?.inStock ? (
                                                <span className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">In Stock</span>
                                            ) : availability?.count === 0 ? (
                                                <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Out of Stock</span>
                                            ) : (
                                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Limited Supply</span>
                                            )}
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 leading-none">{foundSize}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">
                                            {availability?.count || 0} matching options found for your vehicle
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleApply}
                                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200/50 flex items-center justify-center gap-2 select-none active:scale-95 group-hover:-translate-y-0.5"
                                >
                                    View Available Tyres
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!foundSize && (
                    <div className="text-center py-2 flex flex-col items-center gap-1">
                        <p className="text-xs text-slate-400 font-medium italic">Please select your vehicle details to find the exact tyre size.</p>
                        <div className="flex items-center gap-2 mt-2 opacity-30">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-12 h-1 rounded-full ${step >= i ? "bg-blue-600" : "bg-slate-200"}`} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
