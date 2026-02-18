import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import supabase from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().trim()
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone } = req.body;

    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError) {
      
      if (checkError.code === 'PGRST116') {
        
      } else if (checkError.code === '42P01') {
        
        console.error('Table does not exist:', checkError);
        return res.status(500).json({
          error: 'Database table not found. Please run the schema.sql file in Supabase SQL Editor to create the tables.'
        });
      } else if (checkError.message && checkError.message.includes('fetch failed')) {
        
        console.error('Supabase connection error:', checkError);
        return res.status(500).json({
          error: 'Cannot connect to Supabase. Please check your SUPABASE_URL and ensure your Supabase project is active.'
        });
      } else {
        
        console.error('Error checking existing user:', checkError);
        return res.status(500).json({
          error: `Database error: ${checkError.message || 'Unknown error'}`
        });
      }
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        phone: phone || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      if (error.code === '42P01') {
        return res.status(500).json({
          error: 'Database table not found. Please run the schema.sql file in Supabase SQL Editor to create the tables.'
        });
      } else if (error.message && error.message.includes('fetch failed')) {
        return res.status(500).json({
          error: 'Cannot connect to Supabase. Please check your SUPABASE_URL and ensure your Supabase project is active.'
        });
      }
      return res.status(500).json({
        error: error.message || 'Failed to create user account'
      });
    }

    
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role || 'user'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!user) {
      
      return res.json({
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    
    
    res.json({
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name,
        phone: phone || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, email, name, phone, role, created_at')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
