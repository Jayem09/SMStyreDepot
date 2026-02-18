import express from 'express';
import { getAllReviews, getProductReviews, createReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


router.get('/', getAllReviews);


router.post('/', authenticate, createReview);


router.get('/product/:productId', getProductReviews);

export default router;
