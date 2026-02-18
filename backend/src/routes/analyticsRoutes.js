import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
    getOverview,
    getSalesTimeline,
    getBestSellers,
    getRevenueByBrand,
    getRevenueByCategory,
    getOrderStatusDistribution,
    getCustomerStats
} from '../controllers/analyticsController.js';

const router = express.Router();


router.use(authenticate, requireAdmin);

router.get('/overview', getOverview);
router.get('/sales-timeline', getSalesTimeline);
router.get('/best-sellers', getBestSellers);
router.get('/revenue-by-brand', getRevenueByBrand);
router.get('/revenue-by-category', getRevenueByCategory);
router.get('/order-status-distribution', getOrderStatusDistribution);
router.get('/customer-stats', getCustomerStats);

export default router;
