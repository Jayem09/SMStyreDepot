import React, { useEffect, useState } from 'react';
import { useReviewStore } from '../stores/reviewStore';
import { useAuthStore } from '../stores/authStore';
import { RatingStars } from './ui/RatingStars';
import { User, MessageSquare, Send, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ReviewSectionProps {
    productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
    const { reviews, loading, fetchProductReviews, addReview } = useReviewStore();
    const { isAuthenticated } = useAuthStore();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const productReviews = reviews[productId] || [];

    useEffect(() => {
        fetchProductReviews(productId);
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please leave a comment");
            return;
        }

        setIsSubmitting(true);
        const success = await addReview(productId, rating, comment);
        setIsSubmitting(false);

        if (success) {
            setComment("");
            setRating(5);
            setShowForm(false);
            toast.success("Thank you for your feedback!");
        } else {
            toast.error("Failed to submit review. You might have already reviewed this product.");
        }
    };

    const avgRating = productReviews.length > 0
        ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
        : 0;

    return (
        <div className="mt-20 border-t border-slate-100 pt-16">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-4">
                        <RatingStars rating={avgRating} size={24} showValue={false} />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            {productReviews.length} Feedback{productReviews.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {!showForm && isAuthenticated && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <MessageSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        Write a Review
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Star className="w-5 h-5 text-blue-600" />
                                Share your experience
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Your Rating</label>
                                    <RatingStars
                                        rating={rating}
                                        interactive
                                        size={32}
                                        onChange={setRating}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Your Comment</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="What did you think of these tyres? (Grip, durability, noise, etc.)"
                                        className="w-full h-32 px-6 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none shadow-sm"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Submit Feedback
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && productReviews.length === 0 ? (
                <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : productReviews.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium tracking-tight">Be the first to share your thoughts on this product!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {productReviews.map((review) => (
                        <div key={review.id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 leading-none mb-1">{review.userName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Buyer</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <RatingStars rating={review.rating} size={14} className="mb-1" />
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                "{review.comment}"
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
