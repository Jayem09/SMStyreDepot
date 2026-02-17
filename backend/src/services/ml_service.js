import { mean, standardDeviation, linearRegression, linearRegressionLine } from 'simple-statistics';
import regression from 'regression';

/**
 * ML Service for Business Intelligence
 * Provides forecasting, segmentation, and optimization algorithms
 */

// ============================================
// SALES FORECASTING
// ============================================

/**
 * Forecast future sales using exponential smoothing
 * @param {Array} historicalData - Array of {date, value} objects
 * @param {number} daysAhead - Number of days to forecast
 * @param {number} alpha - Smoothing factor (0-1), default 0.3
 * @returns {Array} Forecast with confidence intervals
 */
export function forecastSales(historicalData, daysAhead = 30, alpha = 0.3) {
    if (!historicalData || historicalData.length < 7) {
        return []; // Need at least 7 days of data
    }

    // Sort by date
    const sorted = [...historicalData].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Extract values
    const values = sorted.map(d => d.value);

    // Exponential smoothing
    const smoothed = [values[0]];
    for (let i = 1; i < values.length; i++) {
        smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
    }

    // Calculate trend using linear regression
    const dataPoints = values.map((val, idx) => [idx, val]);
    const result = regression.linear(dataPoints);
    const slope = result.equation[0];

    // Generate forecast
    const lastValue = smoothed[smoothed.length - 1];
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const stdDev = standardDeviation(values);

    const forecast = [];
    for (let i = 1; i <= daysAhead; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i);

        // Predicted value with trend
        const predicted = lastValue + (slope * i);

        // Confidence interval (95% = 1.96 * stdDev)
        const confidenceLower = Math.max(0, predicted - (1.96 * stdDev));
        const confidenceUpper = predicted + (1.96 * stdDev);

        forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            predicted: Math.round(predicted * 100) / 100,
            confidenceLower: Math.round(confidenceLower * 100) / 100,
            confidenceUpper: Math.round(confidenceUpper * 100) / 100
        });
    }

    return forecast;
}

/**
 * Detect seasonal trends in sales data
 * @param {Array} monthlyData - Array of {month, value} objects
 * @returns {Object} Seasonal analysis
 */
export function detectSeasonalTrends(monthlyData) {
    if (!monthlyData || monthlyData.length < 12) {
        return { hasSeasonal: false, peakMonths: [], lowMonths: [] };
    }

    const avgValue = mean(monthlyData.map(d => d.value));
    const stdDev = standardDeviation(monthlyData.map(d => d.value));

    // Identify peak months (> avg + 0.5 * stdDev)
    const peakMonths = monthlyData
        .filter(d => d.value > avgValue + (0.5 * stdDev))
        .map(d => d.month);

    // Identify low months (< avg - 0.5 * stdDev)
    const lowMonths = monthlyData
        .filter(d => d.value < avgValue - (0.5 * stdDev))
        .map(d => d.month);

    return {
        hasSeasonal: peakMonths.length > 0 || lowMonths.length > 0,
        peakMonths,
        lowMonths,
        avgValue: Math.round(avgValue * 100) / 100,
        seasonalityStrength: Math.round((stdDev / avgValue) * 100) / 100
    };
}

// ============================================
// CUSTOMER SEGMENTATION (RFM Analysis)
// ============================================

/**
 * Calculate RFM scores for customers
 * @param {Array} customers - Array of customer objects with purchase data
 * @returns {Array} Customers with RFM scores and segments
 */
export function segmentCustomers(customers) {
    if (!customers || customers.length === 0) {
        return [];
    }

    const now = new Date();

    // Calculate RFM metrics
    const customersWithRFM = customers.map(customer => {
        const daysSinceLastPurchase = Math.floor(
            (now - new Date(customer.lastPurchaseDate)) / (1000 * 60 * 60 * 24)
        );

        return {
            ...customer,
            recency: daysSinceLastPurchase,
            frequency: customer.totalOrders,
            monetary: customer.totalRevenue
        };
    });

    // Calculate quintiles for scoring (1-5)
    const recencyValues = customersWithRFM.map(c => c.recency).sort((a, b) => a - b);
    const frequencyValues = customersWithRFM.map(c => c.frequency).sort((a, b) => a - b);
    const monetaryValues = customersWithRFM.map(c => c.monetary).sort((a, b) => a - b);

    const getQuintile = (value, sortedArray, reverse = false) => {
        const index = sortedArray.indexOf(value);
        const quintile = Math.ceil(((index + 1) / sortedArray.length) * 5);
        return reverse ? 6 - quintile : quintile; // Reverse for recency (lower is better)
    };

    // Assign scores and segments
    return customersWithRFM.map(customer => {
        const recencyScore = getQuintile(customer.recency, recencyValues, true);
        const frequencyScore = getQuintile(customer.frequency, frequencyValues);
        const monetaryScore = getQuintile(customer.monetary, monetaryValues);

        // Determine segment
        let segment = 'lost';
        if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
            segment = 'champions';
        } else if (recencyScore >= 3 && frequencyScore >= 3) {
            segment = 'loyal';
        } else if (recencyScore >= 3 && frequencyScore < 3) {
            segment = 'potential';
        } else if (recencyScore < 3 && frequencyScore >= 3) {
            segment = 'at_risk';
        }

        return {
            userId: customer.userId,
            name: customer.name,
            email: customer.email,
            recencyScore,
            frequencyScore,
            monetaryScore,
            segment,
            recency: customer.recency,
            frequency: customer.frequency,
            monetary: customer.monetary,
            churnRiskScore: calculateChurnRisk(recencyScore, frequencyScore, monetaryScore)
        };
    });
}

/**
 * Calculate churn risk score (0-1)
 * @param {number} recencyScore - 1-5
 * @param {number} frequencyScore - 1-5
 * @param {number} monetaryScore - 1-5
 * @returns {number} Churn risk (0 = low, 1 = high)
 */
function calculateChurnRisk(recencyScore, frequencyScore, monetaryScore) {
    // Weighted formula: Recency is most important for churn
    const risk = (
        (6 - recencyScore) * 0.5 +  // 50% weight on recency
        (6 - frequencyScore) * 0.3 + // 30% weight on frequency
        (6 - monetaryScore) * 0.2    // 20% weight on monetary
    ) / 5;

    return Math.round(risk * 100) / 100;
}

// ============================================
// INVENTORY OPTIMIZATION
// ============================================

/**
 * Calculate optimal stock levels
 * @param {Object} product - Product with sales history
 * @param {number} leadTimeDays - Supplier lead time
 * @param {number} serviceLevel - Desired service level (0.95 = 95%)
 * @returns {Object} Stock recommendations
 */
export function optimizeInventory(product, leadTimeDays = 7, serviceLevel = 0.95) {
    const { dailySales, currentStock } = product;

    if (!dailySales || dailySales.length < 7) {
        return null;
    }

    // Calculate average daily sales and standard deviation
    const avgDailySales = mean(dailySales);
    const stdDevDailySales = standardDeviation(dailySales);

    // Safety stock = Z-score * stdDev * sqrt(leadTime)
    // Z-score for 95% service level = 1.65
    const zScore = serviceLevel === 0.95 ? 1.65 : 1.96;
    const safetyStock = Math.ceil(zScore * stdDevDailySales * Math.sqrt(leadTimeDays));

    // Reorder point = (avg daily sales * lead time) + safety stock
    const reorderPoint = Math.ceil((avgDailySales * leadTimeDays) + safetyStock);

    // Optimal stock level = reorder point + avg daily sales * lead time
    const optimalStock = Math.ceil(reorderPoint + (avgDailySales * leadTimeDays));

    // Determine action
    let action = 'optimal';
    if (currentStock < reorderPoint) {
        action = 'urgent_reorder';
    } else if (currentStock < optimalStock * 0.7) {
        action = 'reorder_soon';
    } else if (currentStock > optimalStock * 1.5) {
        action = 'overstocked';
    }

    return {
        currentStock,
        optimalStock,
        reorderPoint,
        safetyStock,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        action
    };
}

/**
 * Analyze product performance (BCG Matrix style)
 * @param {Array} products - Products with sales and profit data
 * @returns {Array} Products categorized by performance
 */
export function analyzeProductPerformance(products) {
    if (!products || products.length === 0) {
        return [];
    }

    // Calculate growth rate and profit margin
    const productsWithMetrics = products.map(product => {
        const growthRate = product.currentPeriodSales && product.previousPeriodSales
            ? ((product.currentPeriodSales - product.previousPeriodSales) / product.previousPeriodSales) * 100
            : 0;

        const profitMargin = product.revenue && product.cost
            ? ((product.revenue - product.cost) / product.revenue) * 100
            : 0;

        return {
            ...product,
            growthRate,
            profitMargin
        };
    });

    const avgGrowth = mean(productsWithMetrics.map(p => p.growthRate));
    const avgMargin = mean(productsWithMetrics.map(p => p.profitMargin));

    // Categorize products
    return productsWithMetrics.map(product => {
        let category = 'question_mark';

        if (product.growthRate > avgGrowth && product.profitMargin > avgMargin) {
            category = 'star';
        } else if (product.growthRate <= avgGrowth && product.profitMargin > avgMargin) {
            category = 'cash_cow';
        } else if (product.growthRate <= avgGrowth && product.profitMargin <= avgMargin) {
            category = 'dog';
        }

        return {
            productId: product.id,
            name: product.name,
            category,
            growthRate: Math.round(product.growthRate * 100) / 100,
            profitMargin: Math.round(product.profitMargin * 100) / 100,
            recommendation: getProductRecommendation(category)
        };
    });
}

function getProductRecommendation(category) {
    const recommendations = {
        star: 'Invest heavily - high growth, high profit',
        cash_cow: 'Maintain - stable profit generator',
        question_mark: 'Evaluate - potential or divest',
        dog: 'Consider discontinuing - low growth, low profit'
    };
    return recommendations[category] || '';
}

export default {
    forecastSales,
    detectSeasonalTrends,
    segmentCustomers,
    optimizeInventory,
    analyzeProductPerformance
};
