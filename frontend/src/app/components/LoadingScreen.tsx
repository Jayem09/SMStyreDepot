import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium tracking-tight">Loading...</p>
            </div>
        </div>
    );
}
