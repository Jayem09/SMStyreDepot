import React from 'react';
import { Check, Truck, CheckCircle2, Clock, CreditCard } from 'lucide-react';

export type OrderStatus = 'pending_payment' | 'reserved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface StatusStep {
    label: string;
    icon: React.ReactNode;
    description: string;
}

const STEPS: StatusStep[] = [
    { label: 'Placed', icon: <CreditCard className="w-4 h-4" />, description: 'Order received' },
    { label: 'Confirmed', icon: <Check className="w-4 h-4" />, description: 'Stock reserved' },
    { label: 'Processing', icon: <Clock className="w-4 h-4" />, description: 'In preparation' },
    { label: 'Shipped', icon: <Truck className="w-4 h-4" />, description: 'On the way' },
    { label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" />, description: 'Completed' },
];

export function OrderStatusStepper({ status }: { status: string }) {
    const currentStatus = status.toLowerCase() as OrderStatus;

    const getActiveStep = (status: OrderStatus): number => {
        switch (status) {
            case 'pending_payment': return 0;
            case 'reserved': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const activeStep = getActiveStep(currentStatus);

    if (currentStatus === 'cancelled') {
        return (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Order Cancelled</span>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0">
                    <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                        style={{ width: `${(Math.max(0, activeStep) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {STEPS.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;

                    return (
                        <div key={step.label} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : isActive
                                        ? "bg-white border-blue-600 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                        : "bg-white border-slate-200 text-slate-300"
                                    }`}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                            </div>

                            <div className="absolute -bottom-6 w-20 text-center">
                                <span className={`text-[9px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors ${isActive ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"
                                    }`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Tooltip on Hover */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {step.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
