import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationProps {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollAnimation({
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
}: UseScrollAnimationProps = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}
