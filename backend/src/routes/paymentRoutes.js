import express from 'express';
import { handlePayMongoWebhook } from '../controllers/paymentController.js';

const router = express.Router();


router.post('/webhook', handlePayMongoWebhook);

export default router;
