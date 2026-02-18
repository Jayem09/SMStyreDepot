import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  updateProfile,
  validateRegister,
  validateLogin
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/forgot-password', forgotPassword);

export default router;
