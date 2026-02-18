import { rateLimit } from 'express-rate-limit';


export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: {
        error: 'Too many attempts',
        message: 'Too many login or signup attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});


export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: {
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.'
    }
});
