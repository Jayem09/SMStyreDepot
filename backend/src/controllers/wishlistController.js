import supabase from '../config/database.js';


export const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        console.log(`[Wishlist] Toggling product ${productId} for user ${userId}`);

        
        const { data: existing, error: fetchError } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ Wishlist Fetch Error:', fetchError);
            throw fetchError;
        }

        if (existing) {
            
            const { error: deleteError } = await supabase
                .from('wishlist')
                .delete()
                .eq('id', existing.id);

            if (deleteError) {
                console.error('❌ Wishlist Delete Error:', deleteError);
                throw deleteError;
            }

            return res.json({
                message: 'Removed from wishlist',
                action: 'removed',
                productId
            });
        } else {
            
            const { error: insertError } = await supabase
                .from('wishlist')
                .insert({
                    user_id: userId,
                    product_id: productId
                });

            if (insertError) {
                console.error('❌ Wishlist Insert Error:', insertError);
                throw insertError;
            }

            return res.json({
                message: 'Added to wishlist',
                action: 'added',
                productId
            });
        }
    } catch (error) {
        console.error('❌ Wishlist Toggle Crash:', error);
        res.status(500).json({
            error: 'Internal Server Error during wishlist toggle',
            message: error.message,
            code: error.code
        });
    }
};


export const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        console.log(`[Wishlist] Fetching for user ${userId}`);

        const { data: wishlistItems, error } = await supabase
            .from('wishlist')
            .select(`
                id,
                created_at,
                product:products (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Wishlist Get Error:', error);
            throw error;
        }

        if (!wishlistItems) {
            return res.json({ wishlist: [] });
        }

        
        
        const products = wishlistItems
            .filter(item => item.product !== null)
            .map(item => ({
                ...item.product,
                wishlistId: item.id,
                wishlistedAt: item.created_at
            }));

        res.json({ wishlist: products });
    } catch (error) {
        console.error('❌ Wishlist Get Crash:', error);
        res.status(500).json({
            error: 'Internal Server Error during wishlist fetch',
            message: error.message,
            code: error.code
        });
    }
};
