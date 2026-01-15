import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
    try {
        console.log('🔧 Resetting Admin User...');

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const email = 'admin@insurance.com';
        const password = 'admin123';

        // Find admin
        let admin = await User.findOne({ where: { email } });

        if (admin) {
            console.log('found admin, updating password...');
            // Manually hash locally to be 100% sure, although model hook should work
            // But using update() should trigger hook.
            // Let's force update
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
