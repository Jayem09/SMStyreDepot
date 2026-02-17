import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes are protected
router.use(authenticate);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
