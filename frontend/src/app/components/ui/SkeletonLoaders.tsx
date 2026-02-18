import { motion } from "motion/react";

export function ProductSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="aspect-square bg-slate-100 animate-pulse relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>
            <div className="p-3 flex flex-col flex-grow gap-2">
                <div className="h-3 bg-slate-100 rounded-full w-1/3 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse mt-2" />
                <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                    <div className="space-y-1 w-1/2">
                        <div className="h-2 bg-slate-50 rounded-full w-1/2 animate-pulse" />
                        <div className="h-5 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg w-10 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="h-10 bg-slate-100 rounded-lg w-full animate-pulse" />
    );
}

export function GridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
