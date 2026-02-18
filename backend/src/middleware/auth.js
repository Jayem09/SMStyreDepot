import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let userId;
    let isSupabaseToken = false;

    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (jwtError) {
      
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);
      
      if (supabaseError || !user) {
        throw new Error('Invalid token');
      }
      userId = user.id;
      isSupabaseToken = true;
    }

    
    const query = supabase.from('users').select('id, email, name, phone, role');
    
    if (isSupabaseToken) {
      query.eq('auth_id', userId);
    } else {
      query.eq('id', userId);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      
      if (isSupabaseToken) {
        return res.status(401).json({ error: 'User not synchronized. Please try logging in again.' });
      }
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Invalid token' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth Middleware Error:', error);
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
      let userId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      }

      if (userId) {
        let query = supabase.from('users').select('id, email, name, phone, role');
        
        if (userId.toString().includes('-')) {
          
          query = query.eq('auth_id', userId);
        } else {
          query = query.eq('id', userId);
        }

        const { data: user } = await query.single();

        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    
    next();
  }
};
