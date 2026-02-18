import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();


router.get('/status', notificationController.getStatus);


router.post('/subscribe', authenticate, notificationController.subscribe);


router.post('/unsubscribe', authenticate, notificationController.unsubscribe);


router.post('/test', authenticate, notificationController.sendTest);


router.post('/broadcast', requireAdmin, notificationController.broadcast);

export default router;
