import dotenv from 'dotenv';
dotenv.config();

import sequelize, { testConnection } from '../config/database.js';
import '../models/index.js';
import { initializeCommissionSettings } from '../utils/commission.util.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
    try {
        console.log('🔧 Starting database setup...\n');

        // Test connection
        console.log('1️⃣ Testing database connection...');
        const isConnected = await testConnection();

        if (!isConnected) {
            console.error('❌ Failed to connect to database.');
            console.log('\n💡 Make sure MySQL is running and database exists:');
            console.log('   mysql -u root -p');
            console.log('   CREATE DATABASE insurance_db;');
            process.exit(1);
        }

        // Sync database (create all tables)
        console.log('\n2️⃣ Creating/updating database tables...');
        await sequelize.sync({ force: true }); // WARNING: This will drop all existing tables!
        console.log('✅ All tables created successfully');

        // Initialize commission settings
        console.log('\n3️⃣ Initializing commission settings...');
        await initializeCommissionSettings();
        console.log('✅ Commission settings initialized');

        // Create default admin user
        console.log('\n4️⃣ Creating default admin user...');
        const adminExists = await User.findOne({ where: { email: 'admin@insurance.com' } });

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
        console.log('   - All tables created');
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
