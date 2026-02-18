import supabase from '../config/database.js';
import {
    forecastSales,
    detectSeasonalTrends,
    segmentCustomers,
    optimizeInventory,
    analyzeProductPerformance
} from '../services/ml_service.js';


export const getForecast = async (req, res) => {
    try {
        const { period = '30d', metric = 'revenue' } = req.query;

        
        const daysBack = parseInt(period.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        
        const { data: orders } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        if (!orders || orders.length < 7) {
            return res.json({
                forecast: [],
                message: 'Insufficient data for forecasting (minimum 7 days required)'
            });
        }

        
        const dailyData = {};
        orders.forEach(order => {
            const date = order.created_at.split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date, revenue: 0, orders: 0 };
            }
            dailyData[date].revenue += parseFloat(order.total_amount);
            dailyData[date].orders += 1;
        });

        const historicalData = Object.values(dailyData).map(day => ({
            date: day.date,
            value: metric === 'revenue' ? day.revenue : day.orders
        }));

        
        const forecast = forecastSales(historicalData, 30);

        res.json({
            historical: historicalData,
            forecast,
            metric,
            period: `${daysBack}d`
        });
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({ error: 'Failed to generate forecast' });
    }
};


export const getSeasonalTrends = async (req, res) => {
    try {
        
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: orders } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .neq('status', 'cancelled')
            .gte('created_at', oneYearAgo.toISOString());

        if (!orders || orders.length < 30) {
            return res.json({
                trends: [],
                message: 'Insufficient data for seasonal analysis'
            });
        }

        
        const monthlyData = {};
        orders.forEach(order => {
            const date = new Date(order.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, value: 0, orders: 0 };
            }
            monthlyData[monthKey].value += parseFloat(order.total_amount);
            monthlyData[monthKey].orders += 1;
        });

        const monthlyArray = Object.values(monthlyData);
        const trends = detectSeasonalTrends(monthlyArray);

        res.json({
            monthlyData: monthlyArray,
            ...trends
        });
    } catch (error) {
        console.error('Error analyzing seasonal trends:', error);
        res.status(500).json({ error: 'Failed to analyze seasonal trends' });
    }
};


export const getCustomerSegments = async (req, res) => {
    try {
        
        const { data: customers } = await supabase
            .from('users')
            .select(`
                id,
                name,
                email,
                created_at,
                orders(id, created_at, total_amount, status)
            `)
            .eq('role', 'customer');

        if (!customers || customers.length === 0) {
            return res.json({ segments: [], summary: {} });
        }

        
        const customerData = customers.map(customer => {
            const completedOrders = customer.orders?.filter(o => o.status !== 'cancelled') || [];
            const lastOrder = completedOrders.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            )[0];

            return {
                userId: customer.id,
                name: customer.name,
                email: customer.email,
                lastPurchaseDate: lastOrder?.created_at || customer.created_at,
                totalOrders: completedOrders.length,
                totalRevenue: completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
            };
        }).filter(c => c.totalOrders > 0); 

        
        const segmented = segmentCustomers(customerData);

        
        for (const customer of segmented) {
            await supabase
                .from('customer_segments')
                .upsert({
                    user_id: customer.userId,
                    segment: customer.segment,
                    recency_score: customer.recencyScore,
                    frequency_score: customer.frequencyScore,
                    monetary_score: customer.monetaryScore,
                    last_purchase_date: new Date(Date.now() - (customer.recency * 24 * 60 * 60 * 1000)),
                    total_orders: customer.frequency,
                    total_revenue: customer.monetary,
                    churn_risk_score: customer.churnRiskScore,
                    updated_at: new Date()
                }, { onConflict: 'user_id' });
        }

        
        const summary = {
            champions: segmented.filter(c => c.segment === 'champions').length,
            loyal: segmented.filter(c => c.segment === 'loyal').length,
            potential: segmented.filter(c => c.segment === 'potential').length,
            at_risk: segmented.filter(c => c.segment === 'at_risk').length,
            lost: segmented.filter(c => c.segment === 'lost').length
        };

        res.json({
            segments: segmented,
            summary
        });
    } catch (error) {
        console.error('Error segmenting customers:', error);
        res.status(500).json({ error: 'Failed to segment customers' });
    }
};


export const getChurnRisk = async (req, res) => {
    try {
        const { data: atRiskCustomers } = await supabase
            .from('customer_segments')
            .select(`
                user_id,
                segment,
                churn_risk_score,
                last_purchase_date,
                total_orders,
                total_revenue,
                users(name, email, phone)
            `)
            .gte('churn_risk_score', 0.5)
            .order('churn_risk_score', { ascending: false });

        const formatted = atRiskCustomers?.map(customer => ({
            userId: customer.user_id,
            name: customer.users?.name,
            email: customer.users?.email,
            phone: customer.users?.phone,
            segment: customer.segment,
            churnRiskScore: customer.churn_risk_score,
            lastPurchaseDate: customer.last_purchase_date,
            daysSinceLastPurchase: Math.floor(
                (new Date() - new Date(customer.last_purchase_date)) / (1000 * 60 * 60 * 24)
            ),
            lifetimeValue: customer.total_revenue,
            totalOrders: customer.total_orders,
            recommendedAction: customer.churn_risk_score > 0.7
                ? 'Send personalized discount offer'
                : 'Send re-engagement email'
        })) || [];

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching churn risk:', error);
        res.status(500).json({ error: 'Failed to fetch churn risk data' });
    }
};


export const getInventoryOptimization = async (req, res) => {
    try {
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: products } = await supabase
            .from('products')
            .select(`
                id,
                name,
                brand,
                stock_quantity,
                order_items(quantity, created_at, orders(created_at, status))
            `);

        if (!products || products.length === 0) {
            return res.json({ recommendations: [] });
        }

        const recommendations = [];

        for (const product of products) {
            
            const completedOrders = product.order_items?.filter(item =>
                item.orders?.status !== 'cancelled' &&
                new Date(item.orders?.created_at) >= thirtyDaysAgo
            ) || [];

            if (completedOrders.length === 0) continue;

            
            const dailySalesMap = {};
            completedOrders.forEach(item => {
                const date = item.orders.created_at.split('T')[0];
                dailySalesMap[date] = (dailySalesMap[date] || 0) + item.quantity;
            });

            const dailySales = Object.values(dailySalesMap);

            if (dailySales.length < 7) continue; 

            
            const optimization = optimizeInventory({
                dailySales,
                currentStock: product.stock_quantity || 0
            });

            if (optimization) {
                recommendations.push({
                    productId: product.id,
                    name: product.name,
                    brand: product.brand,
                    ...optimization
                });

                
                await supabase
                    .from('inventory_recommendations')
                    .upsert({
                        product_id: product.id,
                        current_stock: optimization.currentStock,
                        recommended_stock: optimization.optimalStock,
                        reorder_point: optimization.reorderPoint,
                        safety_stock: optimization.safetyStock,
                        avg_daily_sales: optimization.avgDailySales,
                        action: optimization.action,
                        updated_at: new Date()
                    }, { onConflict: 'product_id' });
            }
        }

        
        const sorted = recommendations.sort((a, b) => {
            const priority = { urgent_reorder: 0, reorder_soon: 1, optimal: 2, overstocked: 3 };
            return priority[a.action] - priority[b.action];
        });

        res.json(sorted);
    } catch (error) {
        console.error('Error optimizing inventory:', error);
        res.status(500).json({ error: 'Failed to optimize inventory' });
    }
};


export const getProductInsights = async (req, res) => {
    try {
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: products } = await supabase
            .from('products')
            .select(`
                id,
                name,
                brand,
                price,
                order_items(quantity, price, created_at, orders(created_at, status))
            `);

        if (!products || products.length === 0) {
            return res.json({ insights: [] });
        }

        const productsWithMetrics = products.map(product => {
            const completedItems = product.order_items?.filter(item =>
                item.orders?.status !== 'cancelled'
            ) || [];

            
            const currentPeriodItems = completedItems.filter(item =>
                new Date(item.orders.created_at) >= thirtyDaysAgo
            );
            const currentPeriodSales = currentPeriodItems.reduce((sum, item) =>
                sum + (item.quantity * parseFloat(item.price)), 0
            );

            
            const previousPeriodItems = completedItems.filter(item => {
                const date = new Date(item.orders.created_at);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            });
            const previousPeriodSales = previousPeriodItems.reduce((sum, item) =>
                sum + (item.quantity * parseFloat(item.price)), 0
            );

            
            const revenue = currentPeriodSales;
            const cost = revenue * 0.3;

            return {
                id: product.id,
                name: product.name,
                brand: product.brand,
                currentPeriodSales,
                previousPeriodSales,
                revenue,
                cost
            };
        }).filter(p => p.currentPeriodSales > 0 || p.previousPeriodSales > 0);

        const insights = analyzeProductPerformance(productsWithMetrics);

        res.json(insights);
    } catch (error) {
        console.error('Error analyzing product insights:', error);
        res.status(500).json({ error: 'Failed to analyze product insights' });
    }
};
