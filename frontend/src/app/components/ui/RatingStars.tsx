import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: number;
    className?: string;
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
}

export function RatingStars({
    rating,
    maxRating = 5,
    size = 16,
    className = "",
    interactive = false,
    onChange,
    showValue = false
}: RatingStarsProps) {
    const [hoverRating, setHoverRating] = React.useState(0);

    const stars = [];
    const displayRating = interactive ? (hoverRating || rating) : rating;

    for (let i = 1; i <= maxRating; i++) {
        const isFull = i <= Math.floor(displayRating);
        const isHalf = !isFull && i <= Math.ceil(displayRating);

        stars.push(
            <span
                key={i}
                className={`${interactive ? "cursor-pointer" : ""} transition-transform active:scale-90`}
                onMouseEnter={() => interactive && setHoverRating(i)}
                onMouseLeave={() => interactive && setHoverRating(0)}
                onClick={() => interactive && onChange && onChange(i)}
            >
                {isFull ? (
                    <Star
                        size={size}
                        className="fill-yellow-400 text-yellow-400"
                    />
                ) : isHalf ? (
                    <div className="relative">
                        <Star size={size} className="text-slate-200" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={size} className="fill-yellow-400 text-yellow-400" />
                        </div>
                    </div>
                ) : (
                    <Star size={size} className="text-slate-200" />
                )}
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex gap-0.5">
                {stars}
            </div>
            {showValue && (
                <span className="text-xs font-bold text-slate-400 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
