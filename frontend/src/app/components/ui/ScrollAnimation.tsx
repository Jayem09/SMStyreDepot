import React from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

type AnimationVariant = "fade-up" | "fade-in" | "slide-right" | "slide-left" | "scale-up";

interface ScrollAnimationProps {
    children: React.ReactNode;
    variant?: AnimationVariant;
    className?: string;
    delay?: number; // in ms
    duration?: number; // in ms (default to fast/snappy)
    threshold?: number;
}

export function ScrollAnimation({
    children,
    variant = "fade-up",
    className = "",
    delay = 0,
    duration = 500, // Fast default duration
    threshold = 0.1,
}: ScrollAnimationProps) {
    const { ref, isVisible } = useScrollAnimation({ threshold });

    const getVariantStyles = () => {
        switch (variant) {
            case "fade-up":
                return isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8";
            case "fade-in":
                return isVisible ? "opacity-100" : "opacity-0";
            case "slide-right":
                return isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8";
            case "slide-left":
                return isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8";
            case "scale-up":
                return isVisible
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95";
            default:
                return "";
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${getVariantStyles()} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
