import express from 'express';
import { createAppointment, getAppointments } from '../controllers/appointmentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create appointment (Public or Authenticated)
router.post('/', optionalAuth, createAppointment);


// Get my appointments (Strictly Authenticated)
router.get('/my', authenticate, getAppointments);

export default router;
