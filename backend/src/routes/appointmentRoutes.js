import express from 'express';
import { createAppointment, getAppointments } from '../controllers/appointmentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();


router.post('/', optionalAuth, createAppointment);



router.get('/my', authenticate, getAppointments);

export default router;
