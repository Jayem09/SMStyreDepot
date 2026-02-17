import supabase from '../config/database.js';

// GET /api/analytics/overview
export const getOverview = async (req, res) => {
    try {
        // Total revenue (all-time, completed orders only)
        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        // Total orders
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        // Total customers
        const { count: totalCustomers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate percentage changes (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Revenue last 30 days
        const { data: recentRevenue } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const recentRevenueTotal = recentRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        // Revenue previous 30 days
        const { data: previousRevenue } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString());

        const previousRevenueTotal = previousRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        const revenueChange = previousRevenueTotal > 0
            ? ((recentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100
            : 0;

        // Orders change
        const { count: recentOrdersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        const { count: previousOrdersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString());

        const ordersChange = previousOrdersCount > 0
            ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
            : 0;

        res.json({
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalOrders,
            totalCustomers,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            changes: {
                revenue: Math.round(revenueChange * 10) / 10,
                orders: Math.round(ordersChange * 10) / 10,
            }
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
};

// GET /api/analytics/sales-timeline?period=7d|30d|90d|1y
export const getSalesTimeline = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let daysAgo = 30;
        if (period === '7d') daysAgo = 7;
        else if (period === '90d') daysAgo = 90;
        else if (period === '1y') daysAgo = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const { data: orders } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        // Group by date
        const salesByDate = {};
        orders?.forEach(order => {
            const date = order.created_at.split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { date, revenue: 0, orders: 0 };
            }
            salesByDate[date].revenue += parseFloat(order.total_amount);
            salesByDate[date].orders += 1;
        });

        const timeline = Object.values(salesByDate).map(day => ({
            date: day.date,
            revenue: Math.round(day.revenue * 100) / 100,
            orders: day.orders
        }));

        res.json(timeline);
    } catch (error) {
        console.error('Error fetching sales timeline:', error);
        res.status(500).json({ error: 'Failed to fetch sales timeline' });
    }
};

// GET /api/analytics/best-sellers?limit=10
export const getBestSellers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
                product_id,
                quantity,
                price,
                orders!inner(status)
            `);

        // Filter out cancelled orders and group by product
        const productStats = {};
        orderItems?.forEach(item => {
            if (item.orders.status === 'cancelled') return;

            if (!productStats[item.product_id]) {
                productStats[item.product_id] = {
                    product_id: item.product_id,
                    units_sold: 0,
                    revenue: 0
                };
            }
            productStats[item.product_id].units_sold += item.quantity;
            productStats[item.product_id].revenue += item.quantity * parseFloat(item.price);
        });

        // Get product details
        const productIds = Object.keys(productStats);
        const { data: products } = await supabase
            .from('products')
            .select('id, name, brand, image_url')
            .in('id', productIds);

        // Combine stats with product info
        const bestSellers = products?.map(product => ({
            ...product,
            units_sold: productStats[product.id].units_sold,
            revenue: Math.round(productStats[product.id].revenue * 100) / 100
        }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, parseInt(limit));

        res.json(bestSellers || []);
    } catch (error) {
        console.error('Error fetching best sellers:', error);
        res.status(500).json({ error: 'Failed to fetch best sellers' });
    }
};

// GET /api/analytics/revenue-by-brand
export const getRevenueByBrand = async (req, res) => {
    try {
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
                product_id,
                quantity,
                price,
                orders!inner(status)
            `);

        // Get all products to map product_id to brand
        const { data: products } = await supabase
            .from('products')
            .select('id, brand');

        const productBrandMap = {};
        products?.forEach(p => {
            productBrandMap[p.id] = p.brand;
        });

        // Calculate revenue by brand
        const brandRevenue = {};
        orderItems?.forEach(item => {
            if (item.orders.status === 'cancelled') return;

            const brand = productBrandMap[item.product_id];
            if (!brand) return;

            if (!brandRevenue[brand]) {
                brandRevenue[brand] = { brand, revenue: 0, orders: 0 };
            }
            brandRevenue[brand].revenue += item.quantity * parseFloat(item.price);
            brandRevenue[brand].orders += 1;
        });

        const result = Object.values(brandRevenue)
            .map(b => ({
                brand: b.brand,
                revenue: Math.round(b.revenue * 100) / 100,
                orders: b.orders
            }))
            .sort((a, b) => b.revenue - a.revenue);

        res.json(result);
    } catch (error) {
        console.error('Error fetching revenue by brand:', error);
        res.status(500).json({ error: 'Failed to fetch revenue by brand' });
    }
};

// GET /api/analytics/revenue-by-category
export const getRevenueByCategory = async (req, res) => {
    try {
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
                product_id,
                quantity,
                price,
                orders!inner(status)
            `);

        // Get all products to map product_id to type (category)
        const { data: products } = await supabase
            .from('products')
            .select('id, type');

        const productTypeMap = {};
        products?.forEach(p => {
            productTypeMap[p.id] = p.type || 'Unknown';
        });

        // Calculate revenue by category
        const categoryRevenue = {};
        orderItems?.forEach(item => {
            if (item.orders.status === 'cancelled') return;

            const category = productTypeMap[item.product_id];
            if (!categoryRevenue[category]) {
                categoryRevenue[category] = { category, revenue: 0 };
            }
            categoryRevenue[category].revenue += item.quantity * parseFloat(item.price);
        });

        const result = Object.values(categoryRevenue)
            .map(c => ({
                category: c.category,
                revenue: Math.round(c.revenue * 100) / 100
            }))
            .sort((a, b) => b.revenue - a.revenue);

        res.json(result);
    } catch (error) {
        console.error('Error fetching revenue by category:', error);
        res.status(500).json({ error: 'Failed to fetch revenue by category' });
    }
};

// GET /api/analytics/order-status-distribution
export const getOrderStatusDistribution = async (req, res) => {
    try {
        const { data: orders } = await supabase
            .from('orders')
            .select('status');

        const statusCount = {};
        orders?.forEach(order => {
            const status = order.status || 'unknown';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const result = Object.entries(statusCount).map(([status, count]) => ({
            status,
            count
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching order status distribution:', error);
        res.status(500).json({ error: 'Failed to fetch order status distribution' });
    }
};

// GET /api/analytics/customer-stats
export const getCustomerStats = async (req, res) => {
    try {
        // Get all customers with their order count
        const { data: customers } = await supabase
            .from('users')
            .select(`
                id,
                created_at,
                orders(id)
            `)
            .eq('role', 'customer');

        let newCustomers = 0;
        let returningCustomers = 0;

        customers?.forEach(customer => {
            const orderCount = customer.orders?.length || 0;
            if (orderCount <= 1) {
                newCustomers++;
            } else {
                returningCustomers++;
            }
        });

        // Customer growth over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentCustomers } = await supabase
            .from('users')
            .select('created_at')
            .eq('role', 'customer')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        // Group by date
        const customersByDate = {};
        recentCustomers?.forEach(customer => {
            const date = customer.created_at.split('T')[0];
            customersByDate[date] = (customersByDate[date] || 0) + 1;
        });

        const growth = Object.entries(customersByDate).map(([date, count]) => ({
            date,
            count
        }));

        res.json({
            newCustomers,
            returningCustomers,
            totalCustomers: newCustomers + returningCustomers,
            growth
        });
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ error: 'Failed to fetch customer stats' });
    }
};
