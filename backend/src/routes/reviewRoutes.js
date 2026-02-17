import express from 'express';
import { getAllReviews, getProductReviews, createReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/reviews
 * @desc Get all reviews
 * @access Public
 */
router.get('/', getAllReviews);

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private
 */
router.post('/', authenticate, createReview);

/**
 * @route GET /api/reviews/product/:productId
 * @desc Get reviews for a specific product
 * @access Public
 */
router.get('/product/:productId', getProductReviews);

export default router;
