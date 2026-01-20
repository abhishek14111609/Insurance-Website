import bcrypt from 'bcryptjs';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                logging: false
            }
        );

        await sequelize.authenticate();
        console.log('Database connected.');

        // Define User Model (Minimal)
        const User = sequelize.define('User', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            fullName: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            password: { type: DataTypes.STRING, allowNull: false },
            role: { type: DataTypes.ENUM('customer', 'agent', 'admin'), defaultValue: 'customer' },
            phonenumber: { type: DataTypes.STRING },
            status: { type: DataTypes.STRING, defaultValue: 'active' }
        }, {
            timestamps: true
        });

        // Sync Model to DB (Force reset to fix schema issues)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await User.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create Admin
        const adminEmail = 'admin@pashudhansuraksha.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                fullName: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                phonenumber: '0000000000',
                status: 'active'
            });
            console.log('Admin user created successfully:');
            console.log('Email: admin@pashudhansuraksha.com');
            console.log('Password: admin123');
        }

        await sequelize.close();
        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
