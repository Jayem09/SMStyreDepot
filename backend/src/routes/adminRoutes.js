import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
    getDashboardStats,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
    getAdminUsers,
    updateUserRole,
    validateProduct,
    validateOrderStatus
} from '../controllers/adminController.js';
import {
    getSizes,
    getSize,
    createSize,
    updateSize,
    deleteSize
} from '../controllers/sizeController.js';
import {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandAssets
} from '../controllers/brandController.js';

const router = express.Router();


router.use(requireAdmin);


router.get('/dashboard/stats', getDashboardStats);


router.get('/products', getAdminProducts);
router.post('/products', validateProduct, createProduct);
router.put('/products/:id', validateProduct, updateProduct);
router.delete('/products/:id', deleteProduct);


router.get('/sizes', getSizes);
router.get('/sizes/:id', getSize);
router.post('/sizes', createSize);
router.put('/sizes/:id', updateSize);
router.delete('/sizes/:id', deleteSize);


router.get('/brands', getBrands);
router.get('/brands/assets', getBrandAssets);
router.get('/brands/:id', getBrand);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);


router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.patch('/orders/:id/status', validateOrderStatus, updateOrderStatus);


router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
