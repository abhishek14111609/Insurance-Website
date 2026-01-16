import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import '../models/index.js';
import { initializeCommissionSettings } from '../utils/commission.util.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
    try {
        console.log('🔧 Starting database setup...\n');

        // Connect to MongoDB
        console.log('1️⃣ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_db');
        console.log('✅ Connected to MongoDB');

        // Initialize commission settings
        console.log('\n2️⃣ Initializing commission settings...');
        await initializeCommissionSettings();
        console.log('✅ Commission settings initialized');

        // Create default admin user
        console.log('\n3️⃣ Creating default admin user...');
        const adminExists = await User.findOne({ email: 'admin@insurance.com' });

        if (!adminExists) {
            await User.create({
                email: 'admin@insurance.com',
                password: 'admin123', // Will be hashed automatically
                fullName: 'System Administrator',
                phone: '9999999999',
                role: 'admin',
                status: 'active',
                emailVerified: true
            });
            console.log('✅ Admin user created');
            console.log('   Email: admin@insurance.com');
            console.log('   Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        console.log('\n✅ Database setup complete!');
        console.log('\n📋 Summary:');
        console.log('   - Connected to MongoDB');
        console.log('   - Commission settings initialized');
        console.log('   - Admin user ready');
        console.log('\n🚀 You can now start the server with: npm run dev\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
};

setupDatabase();
