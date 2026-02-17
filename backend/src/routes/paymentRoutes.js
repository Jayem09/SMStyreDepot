import express from 'express';
import { handlePayMongoWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Webhook endpoint (doesn't require standard user auth)
router.post('/webhook', handlePayMongoWebhook);

export default router;
