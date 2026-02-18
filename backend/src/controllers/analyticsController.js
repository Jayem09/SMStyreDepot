import supabase from '../config/database.js';


export const getOverview = async (req, res) => {
    try {
        
        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        
        const { count: totalCustomers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

        
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        
        const { data: recentRevenue } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const recentRevenueTotal = recentRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        
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

        
        const productIds = Object.keys(productStats);
        const { data: products } = await supabase
            .from('products')
            .select('id, name, brand, image_url')
            .in('id', productIds);

        
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

        
        const { data: products } = await supabase
            .from('products')
            .select('id, brand');

        const productBrandMap = {};
        products?.forEach(p => {
            productBrandMap[p.id] = p.brand;
        });

        
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

        
        const { data: products } = await supabase
            .from('products')
            .select('id, type');

        const productTypeMap = {};
        products?.forEach(p => {
            productTypeMap[p.id] = p.type || 'Unknown';
        });

        
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


export const getCustomerStats = async (req, res) => {
    try {
        
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

        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentCustomers } = await supabase
            .from('users')
            .select('created_at')
            .eq('role', 'customer')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        
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
