import { User } from '../models/index.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();

const createAdminSafe = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_db');
        console.log('Database connected.');

        const adminEmail = 'admin@securelife.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            // Password will be hashed by User model hook "pre" save
            const newAdmin = await User.create({
                email: adminEmail,
                password: 'admin123',
                fullName: 'System Admin',
                role: 'admin',
                phone: '1234567890',
                status: 'active',
                city: 'Headquarters',
                state: 'Admin State'
            });

            console.log('Admin user created successfully!');
            console.log(`ID: ${newAdmin._id}`);
            console.log(`Email: ${newAdmin.email}`);
            console.log(`Password: admin123`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdminSafe();
