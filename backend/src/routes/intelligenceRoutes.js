import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
    getForecast,
    getSeasonalTrends,
    getCustomerSegments,
    getChurnRisk,
    getInventoryOptimization,
    getProductInsights
} from '../controllers/intelligenceController.js';

const router = express.Router();


router.use(authenticate, requireAdmin);

router.get('/forecast', getForecast);
router.get('/seasonal-trends', getSeasonalTrends);
router.get('/customer-segments', getCustomerSegments);
router.get('/churn-risk', getChurnRisk);
router.get('/inventory-optimization', getInventoryOptimization);
router.get('/product-insights', getProductInsights);

export default router;
