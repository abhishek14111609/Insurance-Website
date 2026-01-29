import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/mongoose.js';
import './models/index.js'; // Import models

// Routes
import authRoutes from './routes/auth.route.js';
import policyRoutes from './routes/policy.route.js';
import paymentRoutes from './routes/payment.route.js';
import agentRoutes from './routes/agent.route.js';
import adminRoutes from './routes/admin.route.js';
import claimRoutes from './routes/claim.route.js';
import notificationRoutes from './routes/notification.route.js';
import policyPlanRoutes from './routes/policyPlan.route.js';
import contactRoutes from './routes/contact.route.js';

// Utilities
import { initializeCommissionSettings } from './utils/commission.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost origin (handles different ports for dev)
        if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/)) {
            return callback(null, true);
        }

        // Default production origins (Vercel apps)
        const defaultProdOrigins = [
            'https://pashudhansuraksha.vercel.app',
            'https://pashudhansurakshaadmin.vercel.app',
            'https://pashudhansuraksha.com',
            'https://www.pashudhansuraksha.com',
            'https://admin.pashudhansuraksha.com',
            'https://www.admin.pashudhansuraksha.com'
        ];

        // Allow specific production origins from env
        const envOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || [];
        const allowedOrigins = Array.from(new Set([...defaultProdOrigins, ...envOrigins]));

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In development, allow all localhost origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads (with security headers)
app.use('/uploads', express.static(uploadDir, {
    setHeaders: (res, path) => {
        // Only force download for non-image files if needed, but for now let's just allow inline viewing
        res.set('X-Content-Type-Options', 'nosniff');
    }
}));

// Quiet 404s for missing favicon in Render
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Pashudhan Suraksha Insurance API is running',
        version: '2.0.0',
        env: process.env.NODE_ENV || 'development'
    });
});

// API Base Route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Pashudhan Suraksha Insurance API Base Endpoint',
        version: '2.0.0',
        env: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plans', policyPlanRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`❌ Error [${req.method} ${req.url}]:`, err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Start server
const startServer = async () => {
    try {
        console.log('\n⏳ Starting Pashudhan Suraksha Insurance Server...');

        // Connect to MongoDB
        const isConnected = await connectDB();

        if (!isConnected) {
            console.error('❌ Failed to connect to MongoDB. Server not started.');
            process.exit(1);
        }

        // Initialize commission settings
        await initializeCommissionSettings();

        // Start listening
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`🔧 Admin URL: ${process.env.ADMIN_URL}`);
            console.log(`\n✅ All routes initialized and ready!\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
