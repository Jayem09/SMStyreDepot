import { mean, standardDeviation, linearRegression, linearRegressionLine } from 'simple-statistics';
import regression from 'regression';








export function forecastSales(historicalData, daysAhead = 30, alpha = 0.3) {
    if (!historicalData || historicalData.length < 7) {
        return []; 
    }

    
    const sorted = [...historicalData].sort((a, b) => new Date(a.date) - new Date(b.date));

    
    const values = sorted.map(d => d.value);

    
    const smoothed = [values[0]];
    for (let i = 1; i < values.length; i++) {
        smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
    }

    
    const dataPoints = values.map((val, idx) => [idx, val]);
    const result = regression.linear(dataPoints);
    const slope = result.equation[0];

    
    const lastValue = smoothed[smoothed.length - 1];
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const stdDev = standardDeviation(values);

    const forecast = [];
    for (let i = 1; i <= daysAhead; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i);

        
        const predicted = lastValue + (slope * i);

        
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


export function detectSeasonalTrends(monthlyData) {
    if (!monthlyData || monthlyData.length < 12) {
        return { hasSeasonal: false, peakMonths: [], lowMonths: [] };
    }

    const avgValue = mean(monthlyData.map(d => d.value));
    const stdDev = standardDeviation(monthlyData.map(d => d.value));

    
    const peakMonths = monthlyData
        .filter(d => d.value > avgValue + (0.5 * stdDev))
        .map(d => d.month);

    
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






export function segmentCustomers(customers) {
    if (!customers || customers.length === 0) {
        return [];
    }

    const now = new Date();

    
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

    
    const recencyValues = customersWithRFM.map(c => c.recency).sort((a, b) => a - b);
    const frequencyValues = customersWithRFM.map(c => c.frequency).sort((a, b) => a - b);
    const monetaryValues = customersWithRFM.map(c => c.monetary).sort((a, b) => a - b);

    const getQuintile = (value, sortedArray, reverse = false) => {
        const index = sortedArray.indexOf(value);
        const quintile = Math.ceil(((index + 1) / sortedArray.length) * 5);
        return reverse ? 6 - quintile : quintile; 
    };

    
    return customersWithRFM.map(customer => {
        const recencyScore = getQuintile(customer.recency, recencyValues, true);
        const frequencyScore = getQuintile(customer.frequency, frequencyValues);
        const monetaryScore = getQuintile(customer.monetary, monetaryValues);

        
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


function calculateChurnRisk(recencyScore, frequencyScore, monetaryScore) {
    
    const risk = (
        (6 - recencyScore) * 0.5 +  
        (6 - frequencyScore) * 0.3 + 
        (6 - monetaryScore) * 0.2    
    ) / 5;

    return Math.round(risk * 100) / 100;
}






export function optimizeInventory(product, leadTimeDays = 7, serviceLevel = 0.95) {
    const { dailySales, currentStock } = product;

    if (!dailySales || dailySales.length < 7) {
        return null;
    }

    
    const avgDailySales = mean(dailySales);
    const stdDevDailySales = standardDeviation(dailySales);

    
    
    const zScore = serviceLevel === 0.95 ? 1.65 : 1.96;
    const safetyStock = Math.ceil(zScore * stdDevDailySales * Math.sqrt(leadTimeDays));

    
    const reorderPoint = Math.ceil((avgDailySales * leadTimeDays) + safetyStock);

    
    const optimalStock = Math.ceil(reorderPoint + (avgDailySales * leadTimeDays));

    
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


export function analyzeProductPerformance(products) {
    if (!products || products.length === 0) {
        return [];
    }

    
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
