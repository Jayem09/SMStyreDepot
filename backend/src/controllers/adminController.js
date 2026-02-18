import supabase from '../config/database.js';
import { body, validationResult } from 'express-validator';
import { sendOrderUpdateNotification } from '../services/pushNotificationService.js';


export const getDashboardStats = async (req, res, next) => {
    try {
        
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        
        const { data: orders } = await supabase
            .from('orders')
            .select('total');

        const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

        
        const { data: recentOrders } = await supabase
            .from('orders')
            .select(`
        id,
        total,
        status,
        created_at,
        users:user_id (name, email)
      `)
            .order('created_at', { ascending: false })
            .limit(10);

        
        const { data: lowStockProducts } = await supabase
            .from('products')
            .select('id, name, brand, stock')
            .lt('stock', 10)
            .order('stock', { ascending: true })
            .limit(10);

        
        const { data: ordersByStatus } = await supabase
            .from('orders')
            .select('status');

        const statusCounts = {};
        ordersByStatus?.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });

        res.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalProducts: totalProducts || 0,
                totalOrders: totalOrders || 0,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                ordersByStatus: statusCounts
            },
            recentOrders: recentOrders || [],
            lowStockProducts: lowStockProducts || []
        });
    } catch (error) {
        next(error);
    }
};


export const getAdminProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, brand, type } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('products')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
        }

        if (brand) {
            query = query.eq('brand', brand);
        }

        if (type) {
            query = query.eq('type', type);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: products, count, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            products: products || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, brand, size, type, price, description, image_url, image_urls, stock, is_featured } = req.body;

        
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id')
            .ilike('name', name)
            .ilike('brand', brand)
            .ilike('size', size)
            .maybeSingle();

        if (existingProduct) {
            return res.status(400).json({
                error: 'Duplicate Product',
                message: `A product with Name "${name}", Brand "${brand}", and Size "${size}" already exists.`
            });
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                name,
                brand,
                size,
                type,
                price: parseFloat(price),
                description,
                image_url,
                image_urls: image_urls || [],
                stock: parseInt(stock) || 0,
                rating: 0,
                is_featured: is_featured || false
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({ product });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { name, brand, size, type, price, description, image_url, image_urls, stock, is_featured } = req.body;

        
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id')
            .ilike('name', name)
            .ilike('brand', brand)
            .ilike('size', size)
            .neq('id', id)
            .maybeSingle();

        if (existingProduct) {
            return res.status(400).json({
                error: 'Duplicate Product',
                message: `A product with Name "${name}", Brand "${brand}", and Size "${size}" already exists.`
            });
        }

        const { data: product, error } = await supabase
            .from('products')
            .update({
                name,
                brand,
                size,
                type,
                price: parseFloat(price),
                description,
                image_url,
                image_urls: image_urls || [],
                stock: parseInt(stock),
                is_featured: is_featured || false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};


export const getAdminOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('orders')
            .select(`
        *,
        users:user_id (id, name, email)
      `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: orders, count, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            orders: orders || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
        *,
        users:user_id (id, name, email, phone)
      `)
            .eq('id', id)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
        *,
        products:product_id (id, name, brand, size, image_url)
      `)
            .eq('order_id', id);

        if (itemsError) {
            throw itemsError;
        }

        res.json({
            order: {
                ...order,
                total: parseFloat(order.total),
                items: orderItems || []
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        
        try {
            await sendOrderUpdateNotification(order.user_id, id, status);
        } catch (notifError) {
            console.error('Push notification error:', notifError);
            
        }

        
        import('../services/notificationService.js').then(({ sendOrderEmail }) => {
            sendOrderEmail(id, 'STATUS_UPDATE').catch(err => console.error('Email trigger error:', err));
        });

        res.json({ order });
    } catch (error) {
        next(error);
    }
};


export const getAdminUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('users')
            .select('id, email, name, phone, role, created_at', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (role) {
            query = query.eq('role', role);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: users, count, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            users: users || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update({
                role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, email, name, phone, role')
            .single();

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
};


export const validateProduct = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('size').trim().notEmpty().withMessage('Size is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

export const validateOrderStatus = [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
];
