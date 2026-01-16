import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
    try {
        console.log('🔧 Resetting Admin User...');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_db');
        console.log('✅ Connected to database');

        const email = 'admin@insurance.com';
        const password = 'admin123';

        // Find admin
        let admin = await User.findOne({ email });

        if (admin) {
            console.log('found admin, updating password...');
            // Password will be hashed by User model hook "pre" save
            admin.password = password;
            await admin.save();
            console.log('✅ Admin password updated to: admin123');
        } else {
            console.log('⚠️ Admin not found, creating new one...');
            await User.create({
                email,
                password,
                fullName: 'System Administrator',
                role: 'admin',
                status: 'active',
                phone: '9999999999'
            });
            console.log('✅ Admin created with password: admin123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAdmin();
