import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, role')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    
    await authenticate(req, res, () => {
      
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Authorization error' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, phone, role')
        .eq('id', decoded.userId)
        .single();

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    
    next();
  }
};
