import supabase from '../config/database.js';

export const getProducts = async (req, res, next) => {
  try {
    const { brand, size, type, search, minPrice, maxPrice, featured } = req.query;

    let query = supabase.from('products').select('*');

    // Apply filters
    if (brand && brand !== 'All Brands') {
      query = query.eq('brand', brand);
    }

    if (size && size !== 'All Sizes') {
      query = query.eq('size', size);
    }

    if (type && type !== 'All Types') {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,size.ilike.%${search}%,type.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Filter for featured products only
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ products: products || [] });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get reviews count and average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', id);

    if (!reviewsError && reviews && reviews.length > 0) {
      const reviewCount = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
      product.reviews = reviewCount;
      product.rating = parseFloat(avgRating.toFixed(1));
    } else {
      product.reviews = 0;
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('brand');

    if (error) {
      throw error;
    }

    // Group by brand and count
    const brandMap = {};
    products.forEach(product => {
      if (brandMap[product.brand]) {
        brandMap[product.brand]++;
      } else {
        brandMap[product.brand] = 1;
      }
    });

    const brands = Object.entries(brandMap).map(([brand, product_count]) => ({
      brand,
      product_count
    })).sort((a, b) => a.brand.localeCompare(b.brand));

    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ products: [] });
    }

    const searchTerm = `%${q}%`;

    // Supabase doesn't support complex ORDER BY with CASE, so we'll do a simpler search
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%,size.ilike.%${q}%,type.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(20);

    if (error) {
      throw error;
    }

    // Sort by relevance (name matches first, then brand)
    const sortedProducts = (products || []).sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(q.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(q.toLowerCase());
      const aBrandMatch = a.brand.toLowerCase().includes(q.toLowerCase());
      const bBrandMatch = b.brand.toLowerCase().includes(q.toLowerCase());

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      if (aBrandMatch && !bBrandMatch) return -1;
      if (!aBrandMatch && bBrandMatch) return 1;
      return 0;
    });

    res.json({ products: sortedProducts });
  } catch (error) {
    next(error);
  }
};
