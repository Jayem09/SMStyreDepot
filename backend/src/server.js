import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { errorHandler, notFound } from './middleware/errorHandler.js';


import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});



app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);


app.use('/', seoRoutes);



app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SMS Tyre Depot API is running' });
});


app.use((err, req, res, next) => {
    console.error('🔥 Vercel Runtime Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? 'Check server logs' : err.stack
    });
});

app.use(notFound);
app.use(errorHandler);


export default app;


const isMainModule = import.meta.url === `file://${fileURLToPath(import.meta.url)}`;


if (isMainModule && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}


process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
