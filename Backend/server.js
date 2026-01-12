import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sequelize, { testConnection, syncDatabase } from './config/database.js';
import './models/index.js'; // Import models and associations

// Routes
import authRoutes from './routes/auth.route.js';
import policyRoutes from './routes/policy.route.js';
import paymentRoutes from './routes/payment.route.js';
import agentRoutes from './routes/agent.route.js';
import adminRoutes from './routes/admin.route.js';
import claimRoutes from './routes/claim.route.js';
import notificationRoutes from './routes/notification.route.js';
import policyPlanRoutes from './routes/policyPlan.route.js';

// Utilities
import { initializeCommissionSettings } from './utils/commission.util.js';

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SecureLife Insurance API is running',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            policies: '/api/policies',
            payments: '/api/payments',
            agents: '/api/agents',
            admin: '/api/admin',
            claims: '/api/claims',
            notifications: '/api/notifications'
        }
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
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
        message: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();

        if (!isConnected) {
            console.error('❌ Failed to connect to database. Server not started.');
            process.exit(1);
        }

        // Sync database (create tables)
        // WARNING: Set force: true only in development to drop and recreate tables
        await syncDatabase(false); // Set to true to reset database

        // Initialize commission settings
        await initializeCommissionSettings();

        // Start listening
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`🔧 Admin URL: ${process.env.ADMIN_URL}`);
            console.log(`\n✅ All routes initialized:`);
            console.log(`   - /api/auth`);
            console.log(`   - /api/policies`);
            console.log(`   - /api/payments`);
            console.log(`   - /api/agents`);
            console.log(`   - /api/admin`);
            console.log(`   - /api/claims`);
            console.log(`   - /api/notifications\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;