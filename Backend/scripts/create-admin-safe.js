import { User } from '../models/index.js';
import sequelize from '../config/database.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdminSafe = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // Ensure tables exist but DO NOT FORCE SYNC (preserve data)
        // await sequelize.sync({ alter: true }); // Optional: uncomment if schema update is needed, but risky if not careful. 
        // Better to assume app is running so tables exist.

        const adminEmail = 'admin@securelife.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            // Update password just in case?
            // Optional: existingAdmin.password = await bcrypt.hash('admin123', 10); existingAdmin.save();
        } else {
            // Password will be hashed by User model hook "beforeCreate"
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
            console.log(`ID: ${newAdmin.id}`);
            console.log(`Email: ${newAdmin.email}`);
            console.log(`Password: admin123`);
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdminSafe();
