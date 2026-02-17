import express from 'express';
import {
    getProducts,
    getProduct,
    searchProducts
} from '../controllers/productController.js';
import { getBrands } from '../controllers/brandController.js';
import { getSizes } from '../controllers/sizeController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/brands', getBrands);
router.get('/sizes', getSizes);
router.get('/:id', getProduct);

export default router;
