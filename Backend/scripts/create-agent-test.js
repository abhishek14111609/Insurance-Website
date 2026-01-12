import { User, Agent } from '../models/index.js';
import sequelize from '../config/database.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestAgent = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        const agentEmail = 'agent@securelife.com';
        let user = await User.findOne({ where: { email: agentEmail } });

        if (user) {
            console.log('Test agent user already exists.');
            // Ensure role is agent
            if (user.role !== 'agent') {
                user.role = 'agent';
                await user.save();
                console.log('Updated user role to agent.');
            }
        } else {
            console.log('Creating new agent user...');
            user = await User.create({
                email: agentEmail,
                password: 'agent123', // Will be hashed by hook
                fullName: 'Test Agent',
                role: 'agent',
                phone: '9876543210',
                status: 'active',
                city: 'Agent City',
                state: 'Agent State',
                address: '123 Agent St'
            });
        }

        // Check if Agent profile exists
        let agentProfile = await Agent.findOne({ where: { userId: user.id } });

        if (agentProfile) {
            console.log('Agent profile already exists.');
        } else {
            console.log('Creating agent profile...');
            agentProfile = await Agent.create({
                userId: user.id,
                agentCode: 'AG-TEST-001',
                level: 1,
                status: 'active',
                bankName: 'Test Bank',
                accountNumber: '1234567890',
                ifscCode: 'TEST0001',
                panNumber: 'ABCDE1234F',
                walletBalance: 0.00,
                totalEarnings: 0.00,
                approvedAt: new Date()
            });
        }

        console.log('Test Agent Ready:');
        console.log('Email: agent@securelife.com');
        console.log('Password: agent123');
        console.log('Agent Code: AG-TEST-001');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('Error creating test agent:', error);
        process.exit(1);
    }
};

createTestAgent();
