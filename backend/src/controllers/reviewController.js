import supabase from '../config/database.js';

/**
 * Get all reviews with user information
 * @route GET /api/reviews
 * @access Public
 */
export const getAllReviews = async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                users (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return res.status(500).json({ message: 'Error fetching reviews' });
        }

        // Format the data to be easier for the frontend to consume
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userName: review.users?.name || 'Anonymous',
            createdAt: review.created_at
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Review fetching error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get reviews for a specific product
 * @route GET /api/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                users (
                    name
                )
            `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching product reviews:', error);
            return res.status(500).json({ message: 'Error fetching product reviews' });
        }

        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userName: review.users?.name || 'Anonymous',
            createdAt: review.created_at
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Product reviews fetching error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create a new review
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
        return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    try {
        // Check if user has already reviewed this product
        const { data: existingReview, error: checkError } = await supabase
            .from('reviews')
            .select('id')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .single();

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .insert([{
                product_id: productId,
                user_id: userId,
                rating,
                comment
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating review:', error);
            return res.status(500).json({ message: 'Error creating review' });
        }

        // Update product rating (simplified: could be done via a trigger or more complex query)
        const { data: allRatings } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId);

        const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;

        await supabase
            .from('products')
            .update({ rating: parseFloat(avgRating.toFixed(1)) })
            .eq('id', productId);

        res.status(201).json(review);
    } catch (error) {
        console.error('Review creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
