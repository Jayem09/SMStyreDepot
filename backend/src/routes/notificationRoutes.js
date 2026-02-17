import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get notification system status (public)
router.get('/status', notificationController.getStatus);

// Subscribe to push notifications (authenticated users)
router.post('/subscribe', authenticate, notificationController.subscribe);

// Unsubscribe from push notifications (authenticated users)
router.post('/unsubscribe', authenticate, notificationController.unsubscribe);

// Send test notification to self (authenticated users)
router.post('/test', authenticate, notificationController.sendTest);

// Send broadcast notification to all users (admin only)
router.post('/broadcast', requireAdmin, notificationController.broadcast);

export default router;
