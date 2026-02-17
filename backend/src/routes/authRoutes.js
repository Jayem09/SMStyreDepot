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

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/forgot-password', forgotPassword);

export default router;
